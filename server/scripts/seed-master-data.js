const { pool } = require('../src/database/connection');
const bcrypt = require('bcryptjs');

const resetAndSeedMaster = async () => {
    console.log('--- SYLLABRIX CORPORATE L&D: MASTER DATA RESET & RELOAD (U001-U015) ---');
    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // 1. CLEAN SLATE: Erase all existing L&D data
        console.log('Erasing existing L&D data...');
        const tablesToClear = [
            'ld_repetition_schedule', 'ld_observations', 'ld_impact_records', 
            'ld_knowledge_items', 'ld_ai_audit_logs', 'ld_reviews', 
            'ld_module_progress', 'ld_enrollments', 'ld_assessments', 
            'ld_modules', 'ld_programs', 'ld_skill_history', 
            'ld_skill_profiles', 'ld_role_skills', 'ld_skills',
            'ld_roles', 'ld_departments', 'ld_org_members', 'ld_organizations'
        ];
        
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        for (const table of tablesToClear) {
            await conn.query(`TRUNCATE TABLE ${table}`);
        }
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');

        // 2. CREATE MASTER ORGANIZATION: Syllabrix Corporate
        console.log('Creating organization: Syllabrix Corporate...');
        const [orgRes] = await conn.query(
            `INSERT INTO ld_organizations (name, slug, industry, size_band, plan) 
             VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
            ['Syllabrix Corporate', 'syllabrix-corp', 'Technology', '51-200', 'enterprise']
        );
        const orgId = orgRes.insertId;

        // 3. CREATE MASTER USERS (U001-U015)
        console.log('Seeding 15 users (U001-U015)...');
        const hashedPassword = await bcrypt.hash('Syllabrix2026', 10);
        
        const usersData = [
            { id: 'U001', name: 'Priya Sharma', role: 'L&D Admin', dept: 'Learning & Development', loc: 'Mumbai', mgr: null, role_type: 'ld_admin', email: 'priya@company.com', lang: 'English' },
            { id: 'U002', name: 'Rahul Patel', role: 'L&D Leader', dept: 'Learning & Development', loc: 'Bangalore', mgr: null, role_type: 'ld_admin', email: 'rahul@company.com', lang: 'English' },
            { id: 'U003', name: 'Aisha Khan', role: 'Sales Rep India', dept: 'Sales', loc: 'Ahmedabad', mgr: 'U005', role_type: 'learner', email: 'aisha@company.com', lang: 'Hindi' },
            { id: 'U004', name: 'Vikram Singh', role: 'Sales Rep SEA', dept: 'Sales', loc: 'Singapore', mgr: 'U006', role_type: 'learner', email: 'vikram@company.com', lang: 'English' },
            { id: 'U005', name: 'Meera Desai', role: 'Sales Manager India', dept: 'Sales', loc: 'Ahmedabad', mgr: 'U002', role_type: 'manager', email: 'meera@company.com', lang: 'Gujarati' },
            { id: 'U006', name: 'Arjun Reddy', role: 'Sales Manager SEA', dept: 'Sales', loc: 'Singapore', mgr: 'U002', role_type: 'manager', email: 'arjun@company.com', lang: 'English' },
            { id: 'U007', name: 'Sonia Gupta', role: 'Software Engineer L1', dept: 'Engineering', loc: 'Hyderabad', mgr: 'U008', role_type: 'learner', email: 'sonia@company.com', lang: 'Telugu' },
            { id: 'U008', name: 'Karthik Rao', role: 'Software Engineer L2', dept: 'Engineering', loc: 'Pune', mgr: 'U002', role_type: 'manager', email: 'karthik@company.com', lang: 'Marathi' },
            { id: 'U009', name: 'Riya Mehta', role: 'SME Training', dept: 'Learning & Development', loc: 'Delhi', mgr: null, role_type: 'sme', email: 'riya@company.com', lang: 'Hindi' },
            { id: 'U010', name: 'Deepak Joshi', role: 'HR Business Partner', dept: 'HR', loc: 'Chennai', mgr: 'U002', role_type: 'learner', email: 'deepak@company.com', lang: 'Tamil' },
            { id: 'U011', name: 'Anita Nair', role: 'Factory Floor Lead', dept: 'Operations', loc: 'Coimbatore', mgr: 'U011', role_type: 'manager', email: 'anita@company.com', lang: 'Tamil' },
            { id: 'U012', name: 'Suresh Kumar', role: 'Compliance Officer', dept: 'Compliance', loc: 'Mumbai', mgr: 'U002', role_type: 'learner', email: 'suresh@company.com', lang: 'English' },
            { id: 'U013', name: 'Lakshmi Menon', role: 'Finance Analyst', dept: 'Finance', loc: 'Bangalore', mgr: 'U002', role_type: 'learner', email: 'lakshmi@company.com', lang: 'Malayalam' },
            { id: 'U014', name: 'Rajesh Iyer', role: 'Marketing Manager', dept: 'Marketing', loc: 'Delhi', mgr: 'U002', role_type: 'learner', email: 'rajesh@company.com', lang: 'Tamil' },
            { id: 'U015', name: 'Fatima Ali', role: 'Customer Success Manager', dept: 'Customer Success', loc: 'Hyderabad', mgr: 'U002', role_type: 'learner', email: 'fatima@company.com', lang: 'Urdu' }
        ];

        const userMap = {}; // ID (U001) -> DB ID
        for (const ud of usersData) {
            const username = ud.name.toLowerCase().replace(' ', '_');
            // Explicitly map to valid 001_create_users.sql ENUMs
            let coreType = 'student';
            if (ud.role_type === 'ld_admin') coreType = 'institute';
            if (ud.role_type === 'manager') coreType = 'mentor';
            if (ud.role_type === 'sme') coreType = 'teacher';

            const [uRes] = await conn.query(
                `INSERT INTO users (username, email, password_hash, user_type, is_active, is_profile_complete, email_verified_at) 
                 VALUES (?, ?, ?, ?, 1, 1, NOW()) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), email_verified_at=NOW(), user_type=?`,
                [username, ud.email, hashedPassword, coreType, coreType]
            );
            userMap[ud.id] = uRes.insertId;
        }

        // 4. CREATE MEMBERSHIPS & HIERARCHY
        console.log('Building org structure and hierarchy...');
        for (const ud of usersData) {
            const mgrId = ud.mgr ? userMap[ud.mgr] : null;
            await conn.query(
                `INSERT INTO ld_org_members (org_id, user_id, org_role, department, job_title, manager_id, meta) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [orgId, userMap[ud.id], ud.role_type, ud.dept, ud.role, mgrId, JSON.stringify({ location: ud.loc, preferred_language: ud.lang, external_id: ud.id })]
            );
        }

        // 5. MASTER SKILLS & ROLES (Excel Mapping)
        console.log('Mapping Skills & Roles (Excel Baseline)...');
        const skillBank = [
            { name: 'Negotiation', cat: 'Sales', type: 'technical' },
            { name: 'Gap Analytics', cat: 'L&D', type: 'technical' },
            { name: 'JavaScript', cat: 'Engineering', type: 'technical' },
            { name: 'React', cat: 'Engineering', type: 'technical' },
            { name: 'SAP HANA Modeling', cat: 'Engineering', type: 'technical' },
            { name: 'Financial Analysis', cat: 'Finance', type: 'technical' },
            { name: 'Compliance Setup', cat: 'Governance', type: 'compliance' },
            { name: 'Objection Handling', cat: 'Sales', type: 'technical' },
            { name: 'GDPR Compliance', cat: 'Governance', type: 'compliance' },
            { name: 'Machine Operation', cat: 'Operations', type: 'technical' },
            { name: 'Audit Reports', cat: 'Compliance', type: 'technical' }
        ];

        const skIds = {};
        for (const sk of skillBank) {
            const [skRes] = await conn.query(
                `INSERT INTO ld_skills (org_id, name, category, skill_type) VALUES (?, ?, ?, ?) 
                 ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
                [orgId, sk.name, sk.cat, sk.type]
            );
            skIds[sk.name] = skRes.insertId;
        }

        // Create Master Role Templates
        const roleTemplates = [
            { title: 'Sales Rep India', dept: 'Sales', skills: [{ name: 'Negotiation', req: 4 }] },
            { title: 'Software Engineer L1', dept: 'Engineering', skills: [{ name: 'JavaScript', req: 3 }, { name: 'React', req: 3 }] },
            { title: 'Compliance Officer', dept: 'Compliance', skills: [{ name: 'GDPR Compliance', req: 4 }, { name: 'Audit Reports', req: 4 }] }
        ];
        
        const roleMap = {};
        for (const rt of roleTemplates) {
            const [rRes] = await conn.query(`INSERT INTO ld_roles (org_id, title, department, level) VALUES (?, ?, ?, ?)`, [orgId, rt.title, rt.dept, 'mid']);
            roleMap[rt.title] = rRes.insertId;
            for (const sk of rt.skills) {
                await conn.query(`INSERT INTO ld_role_skills (role_id, skill_id, required_proficiency, criticality_weight) VALUES (?, ?, ?, ?)`, [rRes.insertId, skIds[sk.name], sk.req, 8]);
            }
        }

        // --- 5.5 CREATE A DUMMY PROGRAM FOR IMPACT LINKAGE ---
        const [progRes] = await conn.query(
            `INSERT INTO ld_programs (org_id, title, description, program_type, status, created_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [orgId, 'Strategic Negotiation Mastery', 'Master baseline course for impact tracking', 'course', 'published', userMap['U001']]
        );
        const dummyProgId = progRes.insertId;

        // 6. POWER USER GAPS (Excel Image 2)
        console.log('Seeding specific gap scores for U003, U007, U011, U012...');
        const gaps = [
            { u: 'U003', sk: 'Negotiation', self: 1, mgr: 1, composite: 1.0 },
            { u: 'U007', sk: 'JavaScript', self: 1, mgr: 1, composite: 1.0 },
            { u: 'U011', sk: 'Machine Operation', self: 2, mgr: 1, composite: 1.4 }
        ];
        
        for (const g of gaps) {
            await conn.query(
                `INSERT INTO ld_skill_profiles (user_id, skill_id, org_id, self_rating, manager_rating, composite_score, assessed_at) 
                 VALUES (?, ?, ?, ?, ?, ?, NOW()) 
                 ON DUPLICATE KEY UPDATE self_rating=?, manager_rating=?, composite_score=?, assessed_at=NOW()`,
                [userMap[g.u], skIds[g.sk], orgId, g.self, g.mgr, g.composite, g.self, g.mgr, g.composite]
            );
        }

        // 7. Kirkpatrick Impact Records (Excel Baseline - Kirkpatrick L1-L4)
        console.log('Seeding Impact & ROI records (Kirkpatrick L1-L4)...');
        const impactRecords = [
            { level: 'L1_reaction', score: 4.8, data: { feedback: 'Highly interactive and practical.' } },
            { level: 'L2_learning', score: 25.0, data: { gain: '25% increase in assessment scores.' } },
            { level: 'L3_behavior', score: 4.2, data: { shift: '30% more interest-based negotiation observed.' } },
            { level: 'L4_results', score: 125000, data: { value: '$125k in potential contract value saved.' } }
        ];

        for (const ir of impactRecords) {
            await conn.query(
                `INSERT INTO ld_impact_records (org_id, program_id, level, score, data, recorded_at) 
                 VALUES (?, ?, ?, ?, ?, NOW())`,
                [orgId, dummyProgId, ir.level, ir.score, JSON.stringify(ir.data)]
            );
        }

        await conn.commit();
        console.log('--- MASTER DATA RELOAD COMPLETED SUCCESSFULLY ---');
        console.log('Namespace established: Syllabrix Corporate (orgId: 1)');
        console.log('Default Password for all users: Syllabrix2026');
    } catch (e) {
        await conn.rollback();
        console.error('Reset/Seed failed:', e);
    } finally {
        conn.release();
        process.exit(0);
    }
};

resetAndSeedMaster();
