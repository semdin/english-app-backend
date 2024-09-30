-- Insert new words if they don't already exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM words WHERE word = 'Entropy') THEN
        INSERT INTO words (word, description) VALUES ('Entropy', 'A measure of the disorder or randomness in a system.');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM words WHERE word = 'Prime Number') THEN
        INSERT INTO words (word, description) VALUES ('Prime Number', 'A natural number greater than 1 that has no positive divisors other than 1 and itself.');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM words WHERE word = 'Photosynthesis') THEN
        -- Photosynthesis is already in our previous entries so no need to add.
        -- We'll skip this one and choose another word instead.
        INSERT INTO words (word, description) VALUES ('Velocity', 'The speed of something in a given direction.');
    END IF;
END $$;
