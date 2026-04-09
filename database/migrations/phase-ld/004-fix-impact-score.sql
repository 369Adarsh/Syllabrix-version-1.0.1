-- Fix score precision for ROI financial values
ALTER TABLE ld_impact_records MODIFY COLUMN score DECIMAL(15,2) DEFAULT NULL;
