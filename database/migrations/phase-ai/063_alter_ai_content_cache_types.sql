-- -----------------------------------------------
-- ALTER ai_content_cache: add curriculum content types
-- -----------------------------------------------
ALTER TABLE ai_content_cache
  MODIFY COLUMN content_type ENUM(
    'career_guidance','stream_compare','exam_details',
    'profession_explore','profession_challenge','profession_ethics','profession_comms',
    'curriculum_chapters','curriculum_topics','flowchart','doubt_explain'
  ) NOT NULL;
