-- Migration 132: Add Class 11 & 12 (Science / Commerce / Arts) to all boards
-- Priority fix — migration 130 only added classes 1–10.
-- Safe to run multiple times: all inserts are guarded by NOT EXISTS.

-- ── Ensure every active board has a current syllabus version ──────────────────
-- (Boards added after migration 130 may not have one yet)

INSERT INTO syllabus_versions (board_id, version_name, academic_year_start, is_current)
SELECT b.id, CONCAT(b.name, ' — 2024-25'), 2024, 1
FROM boards b
WHERE b.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM syllabus_versions sv WHERE sv.board_id = b.id
  );

-- ── Also back-fill classes 1–10 for any board that is still missing them ──────

INSERT INTO classes (board_id, syllabus_version_id, grade, grade_label, stream)
SELECT b.id, sv.id, g.n, CONCAT('Class ', g.n), 'general'
FROM boards b
JOIN syllabus_versions sv ON sv.board_id = b.id AND sv.is_current = 1
CROSS JOIN (
  SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL
  SELECT 5 UNION ALL SELECT 6 UNION ALL SELECT 7 UNION ALL SELECT 8 UNION ALL
  SELECT 9 UNION ALL SELECT 10
) g
WHERE b.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM classes c
    WHERE c.board_id = b.id AND c.grade = g.n AND c.stream = 'general'
  );

-- ── Add Class 11 & 12 — Science / Commerce / Arts ────────────────────────────
-- Each board gets 6 rows: grade 11 × 3 streams  +  grade 12 × 3 streams

INSERT INTO classes (board_id, syllabus_version_id, grade, grade_label, stream)
SELECT b.id, sv.id, g.grade, g.label, g.stream
FROM boards b
JOIN syllabus_versions sv ON sv.board_id = b.id AND sv.is_current = 1
CROSS JOIN (
  SELECT 11 AS grade, 'Class 11 — Science'   AS label, 'science'  AS stream UNION ALL
  SELECT 11,          'Class 11 — Commerce',            'commerce'            UNION ALL
  SELECT 11,          'Class 11 — Arts',                'arts'                UNION ALL
  SELECT 12,          'Class 12 — Science',             'science'             UNION ALL
  SELECT 12,          'Class 12 — Commerce',            'commerce'            UNION ALL
  SELECT 12,          'Class 12 — Arts',                'arts'
) g
WHERE b.is_active = 1
  AND NOT EXISTS (
    SELECT 1 FROM classes c
    WHERE c.board_id = b.id AND c.grade = g.grade AND c.stream = g.stream
  );
