DO $$
DECLARE
    v_word_id INTEGER;
    v_category_id INTEGER;
BEGIN
    -- Entropy and Science category
    SELECT id into v_word_id FROM words WHERE word = 'Entropy';
	SELECT id into v_category_id FROM categories WHERE name = 'Science';

	IF EXISTS (SELECT 1 FROM word_categories WHERE word_id = v_word_id ) THEN
		RAISE NOTICE 'Entropy is already in Science category';
	ELSE 
		INSERT INTO word_categories (word_id, category_id) VALUES (v_word_id, v_category_id);
	END IF;	
END $$;
