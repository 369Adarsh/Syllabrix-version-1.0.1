const { socialPool: pool } = require('./src/database/connection');

async function test() {
  const userId = 6; // adarsh7845
  try {
    const [[profile]]      = await pool.query('SELECT * FROM career_profiles WHERE user_id = ?', [userId]);
    const [[skillProfile]] = await pool.query('SELECT * FROM career_skill_profiles WHERE user_id = ?', [userId]);
    const [[resumeRow]]    = await pool.query('SELECT * FROM career_resumes WHERE user_id = ? AND is_primary = 1 LIMIT 1', [userId]);
    const [[jobCount]]     = await pool.query(
      'SELECT COUNT(*) AS total, SUM(created_at >= NOW() - INTERVAL 1 DAY) AS new_today FROM career_job_matches WHERE user_id = ? AND is_active = 1',
      [userId]
    );
    const [topJobs] = await pool.query(
      'SELECT * FROM career_job_matches WHERE user_id = ? AND is_active = 1 ORDER BY fit_score DESC LIMIT 3',
      [userId]
    );
    const [learningPaths] = await pool.query(
      "SELECT * FROM career_learning_paths WHERE user_id = ? AND status IN ('not_started','in_progress') ORDER BY created_at DESC LIMIT 3",
      [userId]
    );

    let skillGaps = [];
    if (skillProfile?.skill_gaps) {
      try { skillGaps = JSON.parse(skillProfile.skill_gaps).slice(0, 5); } catch {}
    }
    let skillsInDemand = [];
    if (skillProfile?.skills_in_demand) {
      try { skillsInDemand = JSON.parse(skillProfile.skills_in_demand).slice(0, 3); } catch {}
    }

    console.log('Queries successful');
    console.log({
        profile: !!profile,
        skillProfile: !!skillProfile,
        resumeRow: !!resumeRow,
        jobCount,
        topJobsCount: topJobs.length,
        learningPathsCount: learningPaths.length
    });
  } catch (err) {
    console.error('ERROR:', err);
  } finally {
    process.exit();
  }
}

test();
