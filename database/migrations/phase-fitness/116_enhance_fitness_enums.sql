-- ============================================================
-- ENHANCE FITNESS ENUMS — Goal and Activity Level
-- ============================================================

ALTER TABLE fitness_profiles
MODIFY COLUMN goal ENUM('fat_loss','muscle_gain','general_fitness','flexibility','yoga','stamina','recovery','stress_management') DEFAULT 'general_fitness',
MODIFY COLUMN activity_level ENUM('sedentary','lightly_active','moderately_active','very_active','extremely_active','high_performance') DEFAULT 'sedentary';
