DO $$
DECLARE
    v_word_id INTEGER;
    v_category_id INTEGER;
BEGIN
    -- Entropy and Science category
    SELECT id into v_word_id FROM words WHERE word = 'Entropy';
	SELECT id into v_category_id FROM categories WHERE name = 'Science';

    -- Add example word to example category
    INSERT INTO example_sentences(word_id, category_id, sentence ) VALUES (v_word_id, v_category_id, 'Entropy is a measure of disorder in a system.');
    INSERT INTO example_sentences(word_id, category_id, sentence ) VALUES (v_word_id, v_category_id, 'Entropy is a measure of randomness in a system.');
    INSERT INTO example_sentences(word_id, category_id, sentence ) VALUES (v_word_id, v_category_id, 'Entropy is a measure of chaos in a system.');
END $$;
