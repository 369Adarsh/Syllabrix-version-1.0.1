require('dotenv').config();
const { pool } = require('../database/connection');
const bcrypt = require('bcryptjs');

async function buildDynamicLdDemo() {
  console.log("🚀 Starting Dynamic LD Demo Seeder...");

  try {
    // 1. Create or get Admin user
    let [users] = await pool.query(`SELECT id FROM users WHERE email = 'admin@acmecorp.com'`);
    let adminId;
    if (users.length === 0) {
      const hashed = await bcrypt.hash('password123', 10);
      const [res] = await pool.query(
        `INSERT INTO users (email, username, password_hash, user_type) VALUES (?, ?, ?, ?)`,
        ['admin@acmecorp.com', 'admin_acme', hashed, 'organization']
      );
      adminId = res.insertId;
      await pool.query(
        `INSERT INTO student_profiles (user_id, full_name) VALUES (?, ?)`,
        [adminId, 'Admin Jane']
      );
    } else {
      adminId = users[0].id;
    }

    // 2. Clear old demo orgs
    await pool.query(`DELETE FROM ld_organizations WHERE name = 'Acme Corp'`);

    // 3. Create Org
    const [orgRes] = await pool.query(
      `INSERT INTO ld_organizations (name, slug, industry, size_band, created_by)
       VALUES ('Acme Corp', 'acmecorp', 'Technology', '51-200', ?)`,
      [adminId]
    );
    const orgId = orgRes.insertId;
    console.log(`✅ Created Org: Acme Corp (ID: ${orgId})`);

    // 4. Create other users
    const employees = [
      { email: 'john@acmecorp.com', name: 'John Developer', title: 'Software Engineer', dept: 'Engineering', role: 'learner' },
      { email: 'sarah@acmecorp.com', name: 'Sarah Designer', title: 'UX Designer', dept: 'Design', role: 'learner' },
      { email: 'mike@acmecorp.com', name: 'Mike Manager', title: 'Engineering Manager', dept: 'Engineering', role: 'manager' }
    ];

    let userIds = [adminId]; // 0 is admin
    await pool.query(
      `INSERT INTO ld_org_members (org_id, user_id, org_role, department, job_title, status)
       VALUES (?, ?, 'owner', 'Management', 'L&D Director', 'active')`,
      [orgId, adminId]
    );

    for (const emp of employees) {
      let [existing] = await pool.query(`SELECT id FROM users WHERE email = ?`, [emp.email]);
      let uid;
      if (existing.length === 0) {
         const pw = await bcrypt.hash('password123', 10);
         const username = emp.email.split('@')[0] + Math.floor(Math.random()*1000);
         const [u] = await pool.query(`INSERT INTO users (email, username, password_hash, user_type) VALUES (?, ?, ?, ?)`, [emp.email, username, pw, 'organization']);
         uid = u.insertId;
         await pool.query(`INSERT INTO student_profiles (user_id, full_name) VALUES (?, ?)`, [uid, emp.name]);
      } else {
         uid = existing[0].id;
      }
      userIds.push(uid);

      await pool.query(
        `INSERT INTO ld_org_members (org_id, user_id, org_role, department, job_title, status)
         VALUES (?, ?, ?, ?, ?, 'active')
         ON DUPLICATE KEY UPDATE department = VALUES(department), job_title = VALUES(job_title)`,
        [orgId, uid, emp.role, emp.dept, emp.title]
      );
    }
    console.log(`✅ Seeded ${employees.length} employees`);

    // 5. Create Roles
    const [r1] = await pool.query(`INSERT INTO ld_roles (org_id, title, department) VALUES (?, ?, ?)`, [orgId, 'Software Engineer', 'Engineering']);
    const [r2] = await pool.query(`INSERT INTO ld_roles (org_id, title, department) VALUES (?, ?, ?)`, [orgId, 'UX Designer', 'Design']);
    
    // 6. Create Skills
    const skillList = [
      { name: 'React', cat: 'Technical' },
      { name: 'Node.js', cat: 'Technical' },
      { name: 'Systems Design', cat: 'Architecture' },
      { name: 'Figma', cat: 'Design' },
      { name: 'GDPR Compliance', cat: 'Compliance' }
    ];
    let skillIds = {};
    for (const s of skillList) {
      const [res] = await pool.query(
        `INSERT INTO ld_skills (org_id, name, category, skill_type) VALUES (?, ?, ?, 'technical')`,
        [orgId, s.name, s.cat]
      );
      skillIds[s.name] = res.insertId;
    }
    console.log(`✅ Seeded ${skillList.length} skills`);

    // 7. Role-Skill mapping
    // Software Engineer needs React (4), Node (4), Systems (3), GDPR (2)
    const seMap = [
      { id: skillIds['React'], req: 4 }, { id: skillIds['Node.js'], req: 4 },
      { id: skillIds['Systems Design'], req: 3 }, { id: skillIds['GDPR Compliance'], req: 2 }
    ];
    for (const m of seMap) await pool.query(`INSERT INTO ld_role_skills (role_id, skill_id, required_proficiency, criticality_weight) VALUES (?, ?, ?, 8)`, [r1.insertId, m.id, m.req]);

    // 8. Skill Profiles (Assessments) to generate Heatmap Gaps
    // Admin Jane (L&D) - doesn't need
    // John Dev (SE) - High React (4), Low Node (2), Low Sys (1) -> Creates Gap in Node & Sys
    const johnId = userIds[1];
    await pool.query(`INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, composite_score) VALUES (?, ?, ?, ?)`, [johnId, skillIds['React'], orgId, 4.0]);
    await pool.query(`INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, composite_score) VALUES (?, ?, ?, ?)`, [johnId, skillIds['Node.js'], orgId, 2.0]);
    await pool.query(`INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, composite_score) VALUES (?, ?, ?, ?)`, [johnId, skillIds['Systems Design'], orgId, 1.0]);

    // Sarah Designer
    const sarahId = userIds[2];
    await pool.query(`INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, composite_score) VALUES (?, ?, ?, ?)`, [sarahId, skillIds['Figma'], orgId, 5.0]);
    await pool.query(`INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, composite_score) VALUES (?, ?, ?, ?)`, [sarahId, skillIds['GDPR Compliance'], orgId, 1.0]);

    // 9. Programs & Content
    const [p1] = await pool.query(
      `INSERT INTO ld_programs (org_id, title, description, program_type, difficulty, is_mandatory, target_skill_id, status, created_by)
       VALUES (?, ?, ?, 'course', 'intermediate', 0, ?, 'published', ?)`,
      [orgId, 'Advanced Distributed Systems Design', 'Master the architecture of scalable microservices.', skillIds['Systems Design'], adminId]
    );
    const progSysId = p1.insertId;

    await pool.query(
      `INSERT INTO ld_modules (program_id, title, module_type, order_index, content, content_format, duration_min, ai_generated)
       VALUES (?, 'Introduction to Microservices', 'concept', 1,
       '## Microservices 101\n\nA microservice architecture splits an application into small, loosely coupled services.\n\nThe benefits include:\n- Independent deployments and scaling\n- Technology flexibility per service\n- Fault isolation\n\n> **Key Insight:** When designing microservices, always consider bounded contexts. Each service should own its data and expose a clean API boundary.\n\n## Asynchronous Communication\n\nServices communicate via message queues (Kafka, RabbitMQ) or REST. Prefer async for heavy operations to prevent cascading failures.\n\n**Quick Tip:** Start by identifying domain boundaries before drawing service lines.', 'markdown', 30, 1)`,
      [progSysId]
    );

    const [p2] = await pool.query(
      `INSERT INTO ld_programs (org_id, title, description, program_type, difficulty, is_mandatory, status, compliance_deadline, created_by)
       VALUES (?, ?, ?, 'course', 'beginner', 1, 'published', DATE_ADD(NOW(), INTERVAL 5 DAY), ?)`,
      [orgId, 'Data Privacy 2026', 'Mandatory GDPR handling course for all employees.', adminId]
    );
    const progDataId = p2.insertId;

    await pool.query(
      `INSERT INTO ld_modules (program_id, title, module_type, order_index, content, content_format, duration_min, ai_generated)
       VALUES (?, 'GDPR Core Principles', 'concept', 1,
       '## GDPR Core Principles\n\nThe General Data Protection Regulation (GDPR) applies to all organizations processing EU resident data.\n\n### The 7 Principles (Article 5)\n1. **Lawfulness, fairness and transparency**\n2. **Purpose limitation** – only collect data for specified purposes\n3. **Data minimisation** – request only what is strictly required\n4. **Accuracy** – keep personal data up to date\n5. **Storage limitation** – do not retain data beyond necessity\n6. **Integrity and confidentiality** – protect data with encryption and hashing\n7. **Accountability** – the data controller is responsible for compliance\n\n> **Critical:** Always hash sensitive fields (passwords, SSNs) immediately at the point of ingestion. Never log raw personal data.\n\n**Quick Tip:** Conduct a Data Protection Impact Assessment (DPIA) before launching any new product feature that handles personal data.', 'markdown', 20, 0)`,
      [progDataId]
    );

    console.log(`✅ Seeded Programs & Modules`);

    // 10. Enrollments & Progress for Admin to see in Learning Hub
    // Enroll Admin in Systems Design course
    const [e1] = await pool.query(
      `INSERT INTO ld_enrollments (user_id, program_id, org_id, status, progress_pct) VALUES (?, ?, ?, 'in_progress', 0)`,
      [adminId, progSysId, orgId]
    );
    await pool.query(
      `INSERT INTO ld_module_progress (enrollment_id, module_id, status) SELECT ?, id, 'available' FROM ld_modules WHERE program_id = ? LIMIT 1`,
      [e1.insertId, progSysId]
    );

    // Enroll admin in Data Privacy (mandatory - overdue simulation)
    await pool.query(
      `INSERT INTO ld_enrollments (user_id, program_id, org_id, status, progress_pct, due_date) VALUES (?, ?, ?, 'enrolled', 0, DATE_SUB(NOW(), INTERVAL 3 DAY))`,
      [adminId, progDataId, orgId]
    );

    // Enroll admin in completed React course
    const [p3] = await pool.query(
      `INSERT INTO ld_programs (org_id, title, description, program_type, difficulty, status, created_by)
       VALUES (?, 'React Fundamentals', 'Learn React hooks and state management.', 'course', 'beginner', 'published', ?)`,
      [orgId, adminId]
    );
    await pool.query(`INSERT INTO ld_enrollments (user_id, program_id, org_id, status, progress_pct, completed_at) VALUES (?, ?, ?, 'completed', 100, NOW())`, [adminId, p3.insertId, orgId]);

    console.log("🎉 Seeding Complete! Demo ready.");
    process.exit(0);

  } catch (err) {
    console.error("❌ Seeding failed: ", err);
    process.exit(1);
  }
}

buildDynamicLdDemo();
