const { socialPool } = require('./connection');
async function run() {
  try {
    const files = [
      'phase-career/146_add_growth_features.sql',
      'phase-career/147_enhance_professional_identity.sql'
    ];
    for (const file of files) {
      await socialPool.query("INSERT IGNORE INTO _migrations (filename) VALUES (?)", [file]);
      console.log(`Fixed migration record for ${file}`);
    }
    process.exit(0);
  } catch (e) {
    console.error('Error fixing migration:', e.message);
    process.exit(1);
  }
}
run();
