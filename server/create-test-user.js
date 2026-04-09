const crypto = require('crypto');
require('dotenv').config({ path: 'd:/syllabrix-project/server/.env' });
const { pool } = require('./src/database/connection');

(async () => {
  try {
    console.log('Altering ENUM...');
    await pool.query("ALTER TABLE users MODIFY COLUMN user_type ENUM('student', 'teacher', 'institute', 'parent', 'mentor', 'professional_learner', 'organization') NOT NULL");
    console.log('ENUM updated.');

    // Hash password 'password123'
    const password = 'password123';
    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', ['admin@acmecorp.com']);
    let userId;
    if (rows.length > 0) {
      userId = rows[0].id;
      await pool.query('UPDATE users SET password_hash = ?, is_active = 1, email_verified_at = NOW(), is_profile_complete = 1, user_type = \'organization\' WHERE id = ?', [hash, userId]);
      console.log('User updated successfully.');
    } else {
      const [{ insertId }] = await pool.query(
        'INSERT INTO users (username, full_name, email, password_hash, user_type, age_group, syllabrix_id, email_verified_at, is_profile_complete, country) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1, ?)', 
        ['acmeadmin', 'Acme Admin', 'admin@acmecorp.com', hash, 'organization', '18+', 'O-ACMAX0000', 'India']
      );
      userId = insertId;
      
      // Also create organization profile
      await pool.query('INSERT INTO organization_profiles (user_id, admin_name, official_company_name, industry, company_size) VALUES (?, ?, ?, ?, ?)', [userId, 'Acme Admin', 'Acme Corp', 'Technology', '51-200']);
      
      console.log('User created successfully.');
    }
    
    // Also create the L&D organization for them
    const [orgRows] = await pool.query('SELECT id FROM ld_organizations WHERE owner_id = ?', [userId]);
    if (orgRows.length === 0) {
        await pool.query('INSERT INTO ld_organizations (name, slug, owner_id, industry, size_band) VALUES (?, ?, ?, ?, ?)', ['Acme Corp L&D', 'acme-corp', userId, 'Technology', '51-200']);
        console.log('Created L&D Organization.');
    }
    
    console.log('CREDENTIALS:');
    console.log('Email: admin@acmecorp.com');
    console.log('Password: password123');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
