import os
import re
import pandas as pd
from flask import Flask, render_template, request, redirect, url_for, flash
import psycopg2

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY')

# Veritabanı bağlantısı
def connect_to_db():
    conn = psycopg2.connect(
        host=os.getenv('DB_HOST'),
        database=os.getenv('DB_NAME'),
        user=os.getenv('DB_USER'),
        password=os.getenv('DB_PASSWORD'),
        port=os.getenv('DB_PORT')
    )
    return conn

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        flash('No file part')
        return redirect(request.url)

    file = request.files['file']

    if file.filename == '':
        flash('No selected file')
        return redirect(request.url)

    if file and file.filename.endswith('.xlsx'):
        try:
            # Instead of saving the file, read the Excel file directly from the request
            process_excel(file)
        except Exception as e:
            flash(f"Error processing file: {e}")
        
        flash('File processed and data added to database successfully!')
        return redirect(url_for('index'))

    flash('Invalid file format. Please upload a .xlsx file.')
    return redirect(url_for('index'))

def process_excel(file):
    # Use the file object directly with pandas
    with pd.ExcelFile(file) as xls:
        # Read sheets from the in-memory Excel file
        words_df = pd.read_excel(xls, 'Words')
        categories_df = pd.read_excel(xls, 'Categories')
        example_sentences_df = pd.read_excel(xls, 'Example Sentences')

        # Veritabanına veri ekleme işlemleri
        conn = connect_to_db()
        cur = conn.cursor()

        try:
            # Kategorileri ekleme
            for _, row in categories_df.iterrows():
                cur.execute("""
                    INSERT INTO categories (name, icon) 
                    VALUES (%s, %s) 
                    ON CONFLICT (name) DO NOTHING
                """, (row['category_name'], row['icon']))

            # Kelimeleri ekleme
            for _, row in words_df.iterrows():
                cur.execute("""
                    INSERT INTO words (word, description) 
                    VALUES (%s, %s) 
                    ON CONFLICT (word) DO NOTHING
                """, (row['word'], row['description']))

            # Örnek cümleler ekleme ve kategorilerle ilişkilendirme
            for _, row in example_sentences_df.iterrows():
                # Kelime ID'sini al
                cur.execute("SELECT id FROM words WHERE word = %s", (row['word'],))
                word_id = cur.fetchone()[0]

                # Kategori ID'sini al
                cur.execute("SELECT id FROM categories WHERE name = %s", (row['category'],))
                category_id = cur.fetchone()[0]

                # word_categories tablosuna ekleme
                cur.execute("""
                    INSERT INTO word_categories (word_id, category_id) 
                    VALUES (%s, %s) 
                    ON CONFLICT DO NOTHING
                """, (word_id, category_id))

                # Örnek cümleyi ekle (duplicate kontrolü veritabanında yapılacak)
                cur.execute("""
                    INSERT INTO example_sentences (word_id, category_id, sentence) 
                    VALUES (%s, %s, %s)
                    ON CONFLICT (word_id, category_id, sentence) DO NOTHING
                """, (word_id, category_id, row['sentence']))

            # Veritabanındaki değişiklikleri kaydet
            conn.commit()

        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()

if __name__ == "__main__":
    app.run()
