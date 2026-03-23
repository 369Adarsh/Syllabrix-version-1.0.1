// ============================================================
// Syllabrix QA Seed — 20 Test Accounts with Complete Profiles
// Run: cd server && node src/database/seed.js
// Password for ALL accounts: Test@1234
// ============================================================

const bcrypt = require('bcryptjs');
const { pool, testConnection } = require('./connection');

const PASSWORD = 'Test@1234';

const seedQA = async () => {
  console.log('');
  console.log('========================================');
  console.log('  Syllabrix QA Seed Runner');
  console.log('========================================');
  console.log('');

  const connected = await testConnection();
  if (!connected) { console.error('DB not reachable.'); process.exit(1); }

  const hash = await bcrypt.hash(PASSWORD, 10);
  console.log('  Password for all accounts: ' + PASSWORD);
  console.log('');

  // ======================== 8 STUDENTS ========================
  const students = [
    { username: 'student_aarav', email: 'aarav@qa.syllabrix.com', dob: '2009-03-15', age_group: '16-17', gender: 'male', city: 'New Delhi', state: 'Delhi',
      profile: { full_name: 'Aarav Sharma', age: 17, school_name: 'Delhi Public School', class_name: '12th', board: 'CBSE', medium: 'English', skills: '["Mathematics","Robotics","Python"]', interests: '["AI","Space","Coding"]' } },
    { username: 'student_priya', email: 'priya@qa.syllabrix.com', dob: '2010-07-22', age_group: '14-15', gender: 'female', city: 'Ahmedabad', state: 'Gujarat',
      profile: { full_name: 'Priya Patel', age: 15, school_name: 'Kendriya Vidyalaya', class_name: '10th', board: 'CBSE', medium: 'English', skills: '["Classical Dance","Physics","Art"]', interests: '["Bharatanatyam","Astronomy","Painting"]' } },
    { username: 'student_rohan', email: 'rohan@qa.syllabrix.com', dob: '2008-11-05', age_group: '16-17', gender: 'male', city: 'Mumbai', state: 'Maharashtra',
      profile: { full_name: 'Rohan Gupta', age: 17, school_name: 'Ryan International', class_name: '12th', board: 'ICSE', medium: 'English', skills: '["Coding","AI/ML","Web Dev"]', interests: '["Machine Learning","Startups","Gaming"]' } },
    { username: 'student_ananya', email: 'ananya@qa.syllabrix.com', dob: '2009-09-18', age_group: '16-17', gender: 'female', city: 'Bangalore', state: 'Karnataka',
      profile: { full_name: 'Ananya Singh', age: 16, school_name: 'DAV School', class_name: '11th', board: 'CBSE', medium: 'English', skills: '["Literature","Debate","Writing"]', interests: '["Poetry","MUN","Journalism"]' } },
    { username: 'student_karthik', email: 'karthik@qa.syllabrix.com', dob: '2011-04-30', age_group: '14-15', gender: 'male', city: 'Chennai', state: 'Tamil Nadu',
      profile: { full_name: 'Karthik Nair', age: 14, school_name: 'Chinmaya Vidyalaya', class_name: '9th', board: 'CBSE', medium: 'English', skills: '["Music","Mathematics","Cricket"]', interests: '["Carnatic Music","Chess","Science"]' } },
    { username: 'student_meera_jr', email: 'meera.jr@qa.syllabrix.com', dob: '2015-01-12', age_group: '11-13', gender: 'female', city: 'Jaipur', state: 'Rajasthan',
      profile: { full_name: 'Meera Joshi', age: 11, school_name: 'St. Xavier School', class_name: '6th', board: 'CBSE', medium: 'English', skills: '["Drawing","Reading"]', interests: '["Animals","Painting"]', requires_guardian: 1 } },
    { username: 'student_arjun_jr', email: 'arjun.jr@qa.syllabrix.com', dob: '2017-06-20', age_group: '8-10', gender: 'male', city: 'Pune', state: 'Maharashtra',
      profile: { full_name: 'Arjun Desai', age: 8, school_name: 'Euro School', class_name: '3rd', board: 'CBSE', medium: 'English', skills: '["Curiosity"]', interests: '["Dinosaurs","Space"]', requires_guardian: 1 } },
    { username: 'student_sara_jr', email: 'sara.jr@qa.syllabrix.com', dob: '2019-02-28', age_group: '5-7', gender: 'female', city: 'Hyderabad', state: 'Telangana',
      profile: { full_name: 'Sara Khan', age: 7, school_name: 'Little Flowers School', class_name: '2nd', board: 'State Board', medium: 'English', skills: '["Coloring"]', interests: '["Animals","Stories"]', requires_guardian: 1 } },
  ];

  // ======================== 4 TEACHERS ========================
  const teachers = [
    { username: 'teacher_meera', email: 'meera@qa.syllabrix.com', dob: '1985-05-15', gender: 'female', city: 'New Delhi', state: 'Delhi',
      profile: { full_name: 'Dr. Meera Krishnan', subject_primary: 'Physics', subjects_additional: '["Mathematics","Astronomy"]', qualifications: '["PhD Physics - IIT Delhi","MSc Physics","B.Ed"]', teacher_type: 'institute_affiliated', institute_name: 'IIT Delhi', experience_years: 15 } },
    { username: 'teacher_rajesh', email: 'rajesh@qa.syllabrix.com', dob: '1988-08-22', gender: 'male', city: 'Kota', state: 'Rajasthan',
      profile: { full_name: 'Rajesh Verma', subject_primary: 'Mathematics', subjects_additional: '["Physics"]', qualifications: '["MSc Mathematics","B.Ed"]', teacher_type: 'freelancer', experience_years: 10 } },
    { username: 'teacher_anita', email: 'anita@qa.syllabrix.com', dob: '1992-03-10', gender: 'female', city: 'Chennai', state: 'Tamil Nadu',
      profile: { full_name: 'Anita Deshmukh', subject_primary: 'Bharatanatyam', subjects_additional: '["Classical Music","Sanskrit"]', qualifications: '["MA Performing Arts","Nritya Visharad"]', teacher_type: 'freelancer', experience_years: 8 } },
    { username: 'teacher_amit', email: 'amit@qa.syllabrix.com', dob: '1990-11-30', gender: 'male', city: 'Bangalore', state: 'Karnataka',
      profile: { full_name: 'Amit Kumar', subject_primary: 'Computer Science', subjects_additional: '["Python","Web Development","AI"]', qualifications: '["MTech CS - IISc","BTech CSE"]', teacher_type: 'both', institute_name: 'Delhi Public School', experience_years: 12 } },
  ];

  // ======================== 3 INSTITUTES ========================
  const institutes = [
    { username: 'inst_dps', email: 'dps@qa.syllabrix.com', city: 'New Delhi', state: 'Delhi',
      profile: { name: 'Delhi Public School - R.K. Puram', institute_type: 'school', city: 'New Delhi', state: 'Delhi', about: 'One of India\'s premier schools, established 1972. Known for academic excellence and holistic education.', established_year: 1972 } },
    { username: 'inst_fiitjee', email: 'fiitjee@qa.syllabrix.com', city: 'Kota', state: 'Rajasthan',
      profile: { name: 'FIITJEE Kota', institute_type: 'coaching', city: 'Kota', state: 'Rajasthan', about: 'Leading IIT-JEE coaching institute with proven track record.', established_year: 1992 } },
    { username: 'inst_byju', email: 'byju@qa.syllabrix.com', city: 'Bangalore', state: 'Karnataka',
      profile: { name: 'Think & Learn Academy', institute_type: 'online_academy', city: 'Bangalore', state: 'Karnataka', about: 'Online learning platform for K-12 students across India.' } },
  ];

  // ======================== 3 PARENTS ========================
  const parents = [
    { username: 'parent_sharma', email: 'parent.sharma@qa.syllabrix.com', dob: '1980-06-10', gender: 'male', city: 'New Delhi', state: 'Delhi',
      profile: { full_name: 'Vikram Sharma', relationship: 'father' } },
    { username: 'parent_patel', email: 'parent.patel@qa.syllabrix.com', dob: '1982-12-25', gender: 'female', city: 'Ahmedabad', state: 'Gujarat',
      profile: { full_name: 'Neha Patel', relationship: 'mother' } },
    { username: 'parent_khan', email: 'parent.khan@qa.syllabrix.com', dob: '1978-09-15', gender: 'female', city: 'Hyderabad', state: 'Telangana',
      profile: { full_name: 'Fatima Khan', relationship: 'mother' } },
  ];

  // ======================== 2 MENTORS ========================
  const mentors = [
    { username: 'mentor_tech', email: 'mentor.tech@qa.syllabrix.com', dob: '1975-04-08', gender: 'male', city: 'Bangalore', state: 'Karnataka',
      profile: { full_name: 'Suresh Rajan', subject_primary: 'Software Engineering', qualifications: '["20+ years at Google","IIT Madras Alumni"]', teacher_type: 'freelancer', experience_years: 25 } },
    { username: 'mentor_arts', email: 'mentor.arts@qa.syllabrix.com', dob: '1970-10-15', gender: 'female', city: 'Mumbai', state: 'Maharashtra',
      profile: { full_name: 'Padma Subramanian', subject_primary: 'Fine Arts', qualifications: '["National Award Winner","JJ School of Art"]', teacher_type: 'freelancer', experience_years: 30 } },
  ];

  let created = 0, skipped = 0;

  // Helper function
  const createUser = async (u, userType) => {
    try {
      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [u.email]);
      if (existing.length > 0) {
        console.log('    - ' + u.username + ' (exists, skipping)');
        skipped++;
        return existing[0].id;
      }

      const [result] = await pool.query(
        `INSERT INTO users (username, email, password_hash, user_type, age_group, date_of_birth,
         gender, city, state, country, is_active, is_profile_complete, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'India', 1, 1, ?)`,
        [u.username, u.email, hash, userType, u.age_group || '18+', u.dob || '1990-01-01',
         u.gender || null, u.city || null, u.state || null,
         u.bio || 'QA test account for Syllabrix']
      );
      console.log('    \u2713 ' + u.username + ' (' + userType + ')');
      created++;
      return result.insertId;
    } catch (e) {
      console.error('    \u2717 ' + u.username + ' - ' + e.message);
      return null;
    }
  };

  // ---- CREATE STUDENTS ----
  console.log('  Creating 8 students...');
  for (const s of students) {
    const userId = await createUser(s, 'student');
    if (userId && s.profile) {
      try {
        await pool.query(
          `INSERT IGNORE INTO student_profiles (user_id, full_name, age, school_name, class_name, board, medium, skills, interests, requires_guardian)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, s.profile.full_name, s.profile.age, s.profile.school_name, s.profile.class_name,
           s.profile.board, s.profile.medium, s.profile.skills, s.profile.interests, s.profile.requires_guardian || 0]
        );
      } catch (e) { /* profile may exist */ }
    }
  }

  // ---- CREATE TEACHERS ----
  console.log('  Creating 4 teachers...');
  for (const t of teachers) {
    const userId = await createUser(t, 'teacher');
    if (userId && t.profile) {
      try {
        await pool.query(
          `INSERT IGNORE INTO teacher_profiles (user_id, full_name, subject_primary, subjects_additional, qualifications, teacher_type, institute_name, experience_years)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, t.profile.full_name, t.profile.subject_primary, t.profile.subjects_additional,
           t.profile.qualifications, t.profile.teacher_type, t.profile.institute_name || null, t.profile.experience_years]
        );
      } catch (e) { /* profile may exist */ }
    }
  }

  // ---- CREATE INSTITUTES ----
  console.log('  Creating 3 institutes...');
  for (const i of institutes) {
    const userId = await createUser(i, 'institute');
    if (userId && i.profile) {
      try {
        await pool.query(
          `INSERT IGNORE INTO institute_profiles (user_id, name, institute_type, city, state, about, established_year)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, i.profile.name, i.profile.institute_type, i.profile.city, i.profile.state,
           i.profile.about, i.profile.established_year || null]
        );
      } catch (e) { /* profile may exist */ }
    }
  }

  // ---- CREATE PARENTS ----
  console.log('  Creating 3 parents...');
  for (const p of parents) {
    const userId = await createUser(p, 'parent');
    if (userId && p.profile) {
      try {
        await pool.query(
          `INSERT IGNORE INTO parent_profiles (user_id, full_name, relationship)
           VALUES (?, ?, ?)`,
          [userId, p.profile.full_name, p.profile.relationship]
        );
      } catch (e) { /* profile may exist */ }
    }
  }

  // ---- CREATE MENTORS (stored as teachers with mentor user_type) ----
  console.log('  Creating 2 mentors...');
  for (const m of mentors) {
    const userId = await createUser(m, 'mentor');
    if (userId && m.profile) {
      try {
        await pool.query(
          `INSERT IGNORE INTO teacher_profiles (user_id, full_name, subject_primary, qualifications, teacher_type, experience_years)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [userId, m.profile.full_name, m.profile.subject_primary, m.profile.qualifications,
           m.profile.teacher_type, m.profile.experience_years]
        );
      } catch (e) { /* profile may exist */ }
    }
  }

  // ---- CREATE PARENT-CHILD LINKS ----
  console.log('  Linking parents to children...');
  const parentLinks = [
    { parent: 'parent.sharma@qa.syllabrix.com', child: 'aarav@qa.syllabrix.com' },
    { parent: 'parent.patel@qa.syllabrix.com', child: 'priya@qa.syllabrix.com' },
    { parent: 'parent.khan@qa.syllabrix.com', child: 'sara.jr@qa.syllabrix.com' },
  ];

  for (const link of parentLinks) {
    try {
      const [p] = await pool.query('SELECT id FROM users WHERE email = ?', [link.parent]);
      const [c] = await pool.query('SELECT id FROM users WHERE email = ?', [link.child]);
      if (p.length && c.length) {
        await pool.query(
          `INSERT IGNORE INTO parent_child_links (parent_user_id, child_user_id, status, approved_at)
           VALUES (?, ?, 'active', NOW())`,
          [p[0].id, c[0].id]
        );
        console.log('    \u2713 Linked: ' + link.parent.split('@')[0] + ' -> ' + link.child.split('@')[0]);
      }
    } catch (e) { /* link may exist */ }
  }

  // ---- CREATE SOME FOLLOW RELATIONSHIPS ----
  console.log('  Creating follow relationships...');
  const followPairs = [
    ['aarav@qa.syllabrix.com', 'priya@qa.syllabrix.com'],
    ['aarav@qa.syllabrix.com', 'teacher_meera@qa.syllabrix.com'],
    ['priya@qa.syllabrix.com', 'aarav@qa.syllabrix.com'],
    ['rohan@qa.syllabrix.com', 'aarav@qa.syllabrix.com'],
    ['rohan@qa.syllabrix.com', 'teacher_amit@qa.syllabrix.com'],
    ['ananya@qa.syllabrix.com', 'teacher_anita@qa.syllabrix.com'],
    ['karthik@qa.syllabrix.com', 'aarav@qa.syllabrix.com'],
  ];

  for (const [followerEmail, followingEmail] of followPairs) {
    try {
      const [f1] = await pool.query('SELECT id FROM users WHERE email = ?', [followerEmail]);
      const [f2] = await pool.query('SELECT id FROM users WHERE email = ?', [followingEmail]);
      if (f1.length && f2.length) {
        await pool.query(
          'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)',
          [f1[0].id, f2[0].id]
        );
      }
    } catch (e) { /* may exist */ }
  }
  console.log('    \u2713 ' + followPairs.length + ' follow relationships created');

  console.log('');
  console.log('  ========================================');
  console.log('  QA Seed Complete!');
  console.log('  Created: ' + created + ' | Skipped: ' + skipped);
  console.log('  Total accounts: 20');
  console.log('  Password: ' + PASSWORD);
  console.log('  ========================================');
  console.log('');

  process.exit(0);
};

seedQA();
