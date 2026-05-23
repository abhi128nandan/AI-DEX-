-- Update script for tools table
-- Sets all votes to 10 and expands descriptions for better UI testing

UPDATE tools
SET 
  votes_count = 10,
  description = 'This powerful AI tool is designed to streamline your workflow and enhance productivity. It leverages advanced machine learning models to deliver fast, accurate, and high-quality results tailored to your specific needs.';
