const { pool } = require('../src/database/connection');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const seedLD = async () => {
  console.log('--- SYLLABRIX L&D KT SEEDER STARTING ---');
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // 1. Create Organization
    console.log('Creating organization...');
    const [orgResult] = await conn.query(
      `INSERT INTO ld_organizations (name, slug, industry, size_band, plan) 
       VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
      ['Syllabrix Corporate', 'syllabrix-corp', 'Technology', '51-200', 'enterprise']
    );
    const orgId = orgResult.insertId;

    const usersData = [
      { username: 'priya_sharma', full_name: 'Priya Sharma', email: 'priya@company.com', role: 'ld_admin', department: 'Learning & Development', job_title: 'L&D Admin', location: 'Mumbai', manager: null },
      { username: 'rahul_patel', full_name: 'Rahul Patel', email: 'rahul@company.com', role: 'ld_admin', department: 'Learning & Development', job_title: 'L&D Leader', location: 'Bangalore', manager: null },
      { username: 'meera_desai', full_name: 'Meera Desai', email: 'meera@company.com', role: 'manager', department: 'Sales', job_title: 'Sales Manager India', location: 'Ahmedabad', manager: 'rahul_patel' },
      { username: 'arjun_reddy', full_name: 'Arjun Reddy', email: 'arjun@company.com', role: 'manager', department: 'Sales', job_title: 'Sales Manager SEA', location: 'Singapore', manager: 'rahul_patel' },
      { username: 'aisha_khan', full_name: 'Aisha Khan', email: 'aisha@company.com', role: 'learner', department: 'Sales', job_title: 'Sales Rep India', location: 'Ahmedabad', manager: 'meera_desai' },
      { username: 'vikram_singh', full_name: 'Vikram Singh', email: 'vikram@company.com', role: 'learner', department: 'Sales', job_title: 'Sales Rep SEA', location: 'Singapore', manager: 'arjun_reddy' },
      { username: 'karthik_rao', full_name: 'Karthik Rao', email: 'karthik@company.com', role: 'manager', department: 'Engineering', job_title: 'Software Engineer L2', location: 'Pune', manager: 'rahul_patel' },
      { username: 'sonia_gupta', full_name: 'Sonia Gupta', email: 'sonia@company.com', role: 'learner', department: 'Engineering', job_title: 'Software Engineer L1', location: 'Hyderabad', manager: 'karthik_rao' },
      { username: 'riya_mehta', full_name: 'Riya Mehta', email: 'riya@company.com', role: 'sme', department: 'Learning & Development', job_title: 'SME Training', location: 'Delhi', manager: null },
      { username: 'deepak_joshi', full_name: 'Deepak Joshi', email: 'deepak@company.com', role: 'learner', department: 'HR', job_title: 'HR Business Partner', location: 'Chennai', manager: 'rahul_patel' },
      { username: 'anita_nair', full_name: 'Anita Nair', email: 'anita@company.com', role: 'learner', department: 'Operations', job_title: 'Factory Floor Lead', location: 'Coimbatore', manager: 'rahul_patel' },
      { username: 'suresh_kumar', full_name: 'Suresh Kumar', email: 'suresh@company.com', role: 'learner', department: 'Compliance', job_title: 'Compliance Officer', location: 'Mumbai', manager: 'rahul_patel' },
      { username: 'lakshmi_menon', full_name: 'Lakshmi Menon', email: 'lakshmi@company.com', role: 'learner', department: 'Finance', job_title: 'Finance Analyst', location: 'Bangalore', manager: 'rahul_patel' },
      { username: 'rajesh_iyer', full_name: 'Rajesh Iyer', email: 'rajesh@company.com', role: 'learner', department: 'Marketing', job_title: 'Marketing Manager', location: 'Delhi', manager: 'rahul_patel' },
      { username: 'fatima_ali', full_name: 'Fatima Ali', email: 'fatima@company.com', role: 'learner', department: 'Customer Success', job_title: 'Customer Success Manager', location: 'Hyderabad', manager: 'rahul_patel' },
    ];

    const hashedPassword = await bcrypt.hash('Syllabrix123!', 10);
    const userMap = {}; // username -> system id

    console.log('Creating users...');
    for (const u of usersData) {
      const userType = u.role === 'sme' ? 'teacher' : 
                       (u.role === 'ld_admin' ? 'institute' : 
                       (u.role === 'manager' ? 'mentor' : 'professional_learner'));

      // Use REPLACE INTO or INSERT IGNORE or ON DUPLICATE KEY UPDATE
      const [uRes] = await conn.query(
        `INSERT INTO users (username, full_name, email, password_hash, user_type, syllabrix_id, is_active, is_profile_complete) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [u.username, u.full_name, u.email, hashedPassword, userType, 'SBX-' + uuidv4().slice(0,8).toUpperCase(), 1, 1]
      );
      userMap[u.username] = uRes.insertId;
    }

    console.log('Creating org members and hierarchy...');
    for (const u of usersData) {
      const userId = userMap[u.username];
      const managerId = u.manager ? userMap[u.manager] : null;

      await conn.query(
        `INSERT INTO ld_org_members (org_id, user_id, org_role, department, job_title, manager_id, status)
         VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE job_title=VALUES(job_title), manager_id=VALUES(manager_id)`,
        [orgId, userId, (u.role === 'ld_admin' ? 'ld_admin' : (u.role === 'manager' ? 'manager' : (u.role === 'sme' ? 'sme' : 'learner'))), u.department, u.job_title, managerId, 'active']
      );
    }

    // 2. Create Skills and Roles for Demo
    console.log('Creating baseline skills and roles...');
    const skills = [
      { name: 'Strategic Negotiation', category: 'Sales', type: 'technical' },
      { name: 'Active Listening', category: 'Communication', type: 'soft' },
      { name: 'React Development', category: 'Engineering', type: 'technical' },
      { name: 'Compliance & Ethics', category: 'Governance', type: 'compliance' }
    ];

    const skillMap = {};
    for (const s of skills) {
      const [sRes] = await conn.query(
        `INSERT INTO ld_skills (org_id, name, category, skill_type) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [orgId, s.name, s.category, s.type]
      );
      skillMap[s.name] = sRes.insertId;
    }

    const rolesData = [
      { title: 'Sales Rep India', department: 'Sales', skills: ['Strategic Negotiation', 'Active Listening'] },
      { title: 'Software Engineer L1', department: 'Engineering', skills: ['React Development'] }
    ];

    for (const r of rolesData) {
      const [rRes] = await conn.query(
        `INSERT INTO ld_roles (org_id, title, department) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
        [orgId, r.title, r.department]
      );
      const roleId = rRes.insertId;

      for (const skName of r.skills) {
        await conn.query(
          `INSERT INTO ld_role_skills (role_id, skill_id, required_proficiency, criticality_weight) 
           VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE required_proficiency=VALUES(required_proficiency)`,
          [roleId, skillMap[skName], 4, 8]
        );
      }
    }

    // 3. Seed some initial assessments for the heatmap
    console.log('Seeding initial assessments...');
    // Aisha Khan (Sales Rep India) - has gaps
    if (userMap['aisha_khan'] && skillMap['Strategic Negotiation']) {
      await conn.query(
        `INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, self_rating, manager_rating, composite_score, assessed_at)
         VALUES (?, ?, ?, ?, ?, ?, NOW()) ON DUPLICATE KEY UPDATE composite_score=VALUES(composite_score)`,
        [userMap['aisha_khan'], skillMap['Strategic Negotiation'], orgId, 2, 2, 2.0]
      );
    }

    await conn.commit();
    console.log('--- SEEDING COMPLETED SUCCESSFULLY ---');
  } catch (e) {
    await conn.rollback();
    console.error('Seeding failed:', e);
  } finally {
    conn.release();
    process.exit(0);
  }
};

seedLD();
