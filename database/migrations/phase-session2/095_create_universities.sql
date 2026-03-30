-- Migration 095: Create universities table
-- Stores top Indian universities: IITs, NITs, AIIMS, Central, IIMs, Deemed/Private, State

CREATE TABLE IF NOT EXISTS universities (
  id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name              VARCHAR(300) NOT NULL,
  short_name        VARCHAR(50),
  type              ENUM('central','state','deemed','private','iit',
                         'nit','iim','aiims','autonomous') NOT NULL,
  established_year  YEAR,
  location_city     VARCHAR(100),
  location_state    VARCHAR(100),
  country           VARCHAR(50) DEFAULT 'India',
  official_website  VARCHAR(300),
  naac_grade        ENUM('A++','A+','A','B++','B+','B','C','NA') DEFAULT 'NA',
  nirf_rank         SMALLINT UNSIGNED NULL,
  is_active         TINYINT(1) DEFAULT 1,
  created_at        TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
