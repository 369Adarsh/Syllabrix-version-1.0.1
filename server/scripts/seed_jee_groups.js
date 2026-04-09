const mysql = require('mysql2/promise');
const config = require('../src/config/env');

const GROUPS = [
    { name: 'Physics Warriors', slug: 'physics-warriors', description: 'The elite battalion for JEE Physics. Solve or die trying.', category: 'jee' },
    { name: 'Chemistry Warriors', slug: 'chemistry-warriors', description: 'From Organic to Inorganic — we conquer every reaction.', category: 'jee' },
    { name: 'Mathematics Warriors', slug: 'mathematics-warriors', description: 'Calculus, Algebra, and Coordinate — pure logic only.', category: 'jee' }
];

const seed = async () => {
    console.log('--- SEEDING JEE WARRIOR GROUPS ---');
    const conn = await mysql.createConnection({
        host: config.DB_SOCIAL.HOST,
        port: config.DB_SOCIAL.PORT,
        user: config.DB_SOCIAL.USER,
        password: config.DB_SOCIAL.PASSWORD,
        database: 'defaultdb',
        ssl: { rejectUnauthorized: false }
    });

    try {
        for (const g of GROUPS) {
            console.log(`Checking group: ${g.name}`);
            const [rows] = await conn.query('SELECT id FROM `groups` WHERE name_slug = ?', [g.slug]);
            if (rows.length === 0) {
                await conn.query(
                    'INSERT INTO `groups` (name, name_slug, description, category, type, creator_id) VALUES (?, ?, ?, ?, "public", 1)',
                    [g.name, g.slug, g.description, g.category]
                );
                console.log(`   ✓ Created ${g.name}`);
            } else {
                console.log(`   - ${g.name} already exists`);
            }
        }
        console.log('--- SEEDING COMPLETED ---');
    } catch (e) {
        console.error(e);
    } finally {
        await conn.end();
    }
};

seed();
