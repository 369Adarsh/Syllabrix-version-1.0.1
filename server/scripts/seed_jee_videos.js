const mysql = require('mysql2/promise');
const config = require('../src/config/env');

const VIDEOS = [
  {
    topic_name: 'Moment of Inertia',
    videos: [
      { "title": "Moment of Inertia Full Concept", "youtube_id": "REPLACE_MI_1", "channel": "Physics Galaxy", "duration_minutes": 45, "type": "full_chapter" },
      { "title": "MI of Standard Objects", "youtube_id": "REPLACE_MI_2", "channel": "Mohit Tyagi", "duration_minutes": 22, "type": "concept" }
    ]
  },
  {
    topic_name: 'Newton\'s Laws of Motion',
    videos: [
      { "title": "Laws of Motion Complete", "youtube_id": "REPLACE_NLM_1", "channel": "Physics Wallah", "duration_minutes": 120, "type": "full_chapter" }
    ]
  },
  {
    topic_name: 'Stoichiometry',
    videos: [
      { "title": "Mole Concept & Stoichiometry", "youtube_id": "REPLACE_STOIC_1", "channel": "Unacademy JEE", "duration_minutes": 55, "type": "concept" }
    ]
  },
  {
    topic_name: 'Indefinite Integration',
    videos: [
      { "title": "Integration Masterclass", "youtube_id": "REPLACE_INT_1", "channel": "MathonGo", "duration_minutes": 90, "type": "full_chapter" }
    ]
  }
];

const seed = async () => {
    console.log('--- SEEDING JEE VIDEO LECTURES ---');
    const conn = await mysql.createConnection({
        host: config.DB_SOCIAL.HOST,
        port: config.DB_SOCIAL.PORT,
        user: config.DB_SOCIAL.USER,
        password: config.DB_SOCIAL.PASSWORD,
        database: 'defaultdb',
        ssl: { rejectUnauthorized: false }
    });

    try {
        for (const entry of VIDEOS) {
            console.log(`Updating videos for: ${entry.topic_name}`);
            await conn.query(
                'UPDATE jee_topics SET video_lectures = ? WHERE name LIKE ?',
                [JSON.stringify(entry.videos), `%${entry.topic_name}%`]
            );
        }
        console.log('--- SEEDING COMPLETED ---');
    } catch (e) {
        console.error(e);
    } finally {
        await conn.end();
    }
};

seed();
