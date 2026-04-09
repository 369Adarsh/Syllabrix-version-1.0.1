const { socialPool, ldPool } = require('./server/src/database/connection');

async function checkSchema() {
  try {
    const [careerCols] = await ldPool.query('DESCRIBE career_profiles');
    const hasMentorship = careerCols.some(c => c.Field === 'mentorship_preference');
    console.log('career_profiles has mentorship_preference:', hasMentorship);

    const [fitnessCols] = await socialPool.query('DESCRIBE fitness_profiles');
    const activityCol = fitnessCols.find(c => c.Field === 'activity_level');
    console.log('fitness_profiles activity_level type:', activityCol ? activityCol.Type : 'MISSING');

    const goalCol = fitnessCols.find(c => c.Field === 'goal');
    console.log('fitness_profiles goal type:', goalCol ? goalCol.Type : 'MISSING');

    process.exit(0);
  } catch (error) {
    console.error('Check failed:', error.message);
    process.exit(1);
  }
}

checkSchema();
