const xlsx = require('xlsx');
const { ldPool: pool } = require('../../../database/connection');
const bcrypt = require('bcryptjs');

class LDBootstrapService {
  /**
   * Main bootstrap entry point
   */
  async bootstrapEnvironment(orgId, fileBuffer) {
    console.log(`--- STARTING BOOTSTRAP FOR ORG: ${orgId} ---`);
    
    // 1. Parse Workbook
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetNames = workbook.SheetNames;
    
    const usersData = xlsx.utils.sheet_to_json(workbook.Sheets['Users'] || workbook.Sheets[sheetNames[0]]);
    const skillsData = xlsx.utils.sheet_to_json(workbook.Sheets['Skills'] || workbook.Sheets[sheetNames[1]]);
    const challengesData = xlsx.utils.sheet_to_json(workbook.Sheets['Challenges'] || workbook.Sheets[sheetNames[2]]);
    const testCasesData = xlsx.utils.sheet_to_json(workbook.Sheets['TestCases'] || workbook.Sheets[sheetNames[3]]);

    const report = {
      users: { total: usersData.length, success: 0, errors: [] },
      skills: { total: skillsData.length, success: 0, errors: [] },
      challenges: { total: challengesData.length, success: 0, errors: [] },
      testResults: testCasesData
    };

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // --- CLEAN SLATE ---
      console.log('Truncating existing L&D data for a clean state...');
      await conn.query('SET FOREIGN_KEY_CHECKS = 0');
      // Only delete data for this specific org!
      await conn.query('DELETE FROM ld_skill_history WHERE profile_id IN (SELECT id FROM ld_skill_profiles WHERE org_id = ?)', [orgId]);
      await conn.query('DELETE FROM ld_skill_profiles WHERE org_id = ?', [orgId]);
      await conn.query('DELETE FROM ld_role_skills WHERE role_id IN (SELECT id FROM ld_roles WHERE org_id = ?)', [orgId]);
      await conn.query('DELETE FROM ld_roles WHERE org_id = ?', [orgId]);
      await conn.query('DELETE FROM ld_skills WHERE org_id = ?', [orgId]);
      await conn.query('DELETE FROM ld_challenges WHERE org_id = ?', [orgId]);
      // Note: We don't truncate 'users' entirely, just 'ld_org_members' for this org
      await conn.query('DELETE FROM ld_org_members WHERE org_id = ?', [orgId]);
      await conn.query('SET FOREIGN_KEY_CHECKS = 1');

      // --- 1. SEED USERS ---
      console.log('Seeding Users...');
      const userMap = {}; // UserID (U001) -> DB User ID
      const hashedPassword = await bcrypt.hash('Syllabrix2026', 10);

      for (const row of usersData) {
        try {
          const username = row.FullName.toLowerCase().replace(/\s+/g, '_');
          const rowRole = (row.Role || 'Learner').toLowerCase();
          
          let userType = 'corporate_user';
          if (rowRole.includes('admin') || rowRole.includes('super')) userType = 'corporate_admin';

          const [uRes] = await conn.query(
            `INSERT INTO users (username, email, password_hash, user_type, is_active, is_profile_complete) 
             VALUES (?, ?, ?, ?, 1, 1) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
            [username, row.Email, hashedPassword, userType]
          );
          const dbUserId = uRes.insertId;
          userMap[row.UserID] = dbUserId;

          // Standardize Org Role for mapping
          let orgRole = 'learner';
          if (rowRole.includes('super')) orgRole = 'super_admin';
          else if (rowRole.includes('l&d admin') || rowRole.includes('ld admin')) orgRole = 'ld_admin';
          else if (rowRole.includes('manager')) orgRole = 'manager';
          else if (rowRole.includes('instructor') || rowRole.includes('sme')) orgRole = 'instructor';
          else if (rowRole.includes('hr')) orgRole = 'hr';

          // Add to org members
          await conn.query(
            `INSERT INTO ld_org_members (org_id, user_id, org_role, department, job_title, meta) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orgId, dbUserId, orgRole, 
             row.Department, row.Role, JSON.stringify({ location: row.Location, preferred_language: row.Preferred_Language })]
          );
          report.users.success++;
        } catch (e) {
          report.users.errors.push({ row: row.UserID, msg: e.message });
        }
      }


      // --- 2. HIERARCHY ---
      console.log('Linking Hierarchy...');
      for (const row of usersData) {
        if (row.ManagerID && userMap[row.ManagerID]) {
          await conn.query(
            `UPDATE ld_org_members SET manager_id = ? WHERE org_id = ? AND user_id = ?`,
            [userMap[row.ManagerID], orgId, userMap[row.UserID]]
          );
        }
      }

      // --- 3. SKILLS & PROFILES ---
      console.log('Seeding Skills & Profiles...');
      const skillIdMap = {}; // SkillName -> SkillID
      for (const row of skillsData) {
        try {
          // Create skill if not exists
          if (!skillIdMap[row.Skill]) {
            const [sRes] = await conn.query(
              `INSERT INTO ld_skills (org_id, name, category, skill_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
              [orgId, row.Skill, 'Technical', 'technical']
            );
            skillIdMap[row.Skill] = sRes.insertId;
          }

          const dbUserId = userMap[row.UserID];
          const dbSkillId = skillIdMap[row.Skill];

          if (dbUserId && dbSkillId) {
            await conn.query(
              `INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, self_rating, manager_rating, composite_score, assessed_at) 
               VALUES (?, ?, ?, ?, ?, ?, NOW())`,
              [dbUserId, dbSkillId, orgId, row.Self_Assessment_Level, row.Manager_Assessment_Level, 
               (row.Self_Assessment_Level + row.Manager_Assessment_Level) / 2]
            );
            report.skills.success++;
          }
        } catch (e) {
          report.skills.errors.push({ row: row.UserID, skill: row.Skill, msg: e.message });
        }
      }

      // --- 4. CHALLENGES ---
      console.log('Seeding Challenges...');
      for (const row of challengesData) {
        try {
          await conn.query(
            `INSERT INTO ld_challenges (org_id, department, title, impact, root_cause, solution, result) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orgId, row.Department, row.Title, row.Impact, row.RootCause, row.Solution, row.Result]
          );
          report.challenges.success++;
        } catch (e) {
          report.challenges.errors.push({ row: row.ChallengeID, msg: e.message });
        }
      }

      await conn.commit();
      console.log('--- BOOTSTRAP SUCCESSFUL ---');
      return report;
    } catch (e) {
      await conn.rollback();
      console.error('--- BOOTSTRAP FAILED ---', e);
      throw e;
    } finally {
      conn.release();
    }
  }
}

module.exports = new LDBootstrapService();
