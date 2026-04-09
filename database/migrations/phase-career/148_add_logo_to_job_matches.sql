-- Add company_logo to career_job_matches
ALTER TABLE career_job_matches
ADD COLUMN company_logo VARCHAR(500) DEFAULT NULL AFTER company_name;

-- DOWN
-- ALTER TABLE career_job_matches DROP COLUMN company_logo;
