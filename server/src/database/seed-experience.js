const { pool, testConnection } = require('./connection');

const seedExperience = async () => {
  console.log('\n========================================');
  console.log('  Experience Lab Seed Runner');
  console.log('========================================\n');

  const connected = await testConnection();
  if (!connected) { console.error('DB not reachable.'); process.exit(1); }

  const sectors = [
    { name:'Technology & IT', slug:'technology', emoji:'💻', order:1 },
    { name:'Healthcare & Medicine', slug:'healthcare', emoji:'🏥', order:2 },
    { name:'Business & Finance', slug:'business', emoji:'💼', order:3 },
    { name:'Creative & Design', slug:'creative', emoji:'🎨', order:4 },
    { name:'Science & Research', slug:'science', emoji:'🔬', order:5 },
    { name:'Education & Training', slug:'education', emoji:'📚', order:6 },
    { name:'Law & Government', slug:'law', emoji:'⚖️', order:7 },
    { name:'Engineering', slug:'engineering', emoji:'⚙️', order:8 },
    { name:'Arts & Entertainment', slug:'arts', emoji:'🎭', order:9 },
    { name:'Agriculture & Environment', slug:'agriculture', emoji:'🌱', order:10 },
  ];

  console.log('  Creating sectors...');
  const sectorIds = {};
  for (const s of sectors) {
    try {
      const [ex] = await pool.query('SELECT id FROM profession_sectors WHERE slug = ?', [s.slug]);
      if (ex.length) { sectorIds[s.slug] = ex[0].id; continue; }
      const [r] = await pool.query('INSERT INTO profession_sectors (name,slug,icon_emoji,display_order) VALUES (?,?,?,?)', [s.name,s.slug,s.emoji,s.order]);
      sectorIds[s.slug] = r.insertId;
      console.log('    \u2713 ' + s.name);
    } catch(e) {}
  }

  const professions = [
    { sector:'technology', name:'Software Developer', slug:'software-developer', emoji:'👨‍💻', desc:'Build applications that solve real problems.', difficulty:'intermediate', age:'11-13' },
    { sector:'technology', name:'IT Support Engineer', slug:'it-support', emoji:'🔧', desc:'Help people solve tech problems.', difficulty:'beginner', age:'8-10' },
    { sector:'technology', name:'UI/UX Designer', slug:'ui-ux-designer', emoji:'🎨', desc:'Design beautiful user interfaces.', difficulty:'beginner', age:'11-13' },
    { sector:'technology', name:'Data Scientist', slug:'data-scientist', emoji:'📊', desc:'Find insights hidden in data.', difficulty:'advanced', age:'14-15' },
    { sector:'healthcare', name:'Doctor', slug:'doctor', emoji:'👨‍⚕️', desc:'Diagnose and treat patients.', difficulty:'advanced', age:'11-13' },
    { sector:'healthcare', name:'Nurse', slug:'nurse', emoji:'👩‍⚕️', desc:'Care for patients and save lives.', difficulty:'intermediate', age:'8-10' },
    { sector:'business', name:'Entrepreneur', slug:'entrepreneur', emoji:'🚀', desc:'Start and grow your own business.', difficulty:'intermediate', age:'14-15' },
    { sector:'business', name:'Accountant', slug:'accountant', emoji:'🧮', desc:'Manage money and financial records.', difficulty:'beginner', age:'11-13' },
    { sector:'creative', name:'Graphic Designer', slug:'graphic-designer', emoji:'🖌️', desc:'Create visual content.', difficulty:'beginner', age:'8-10' },
    { sector:'creative', name:'Writer', slug:'writer', emoji:'✍️', desc:'Write stories, articles, and content.', difficulty:'beginner', age:'8-10' },
    { sector:'science', name:'Scientist', slug:'scientist', emoji:'🧪', desc:'Discover how the world works.', difficulty:'intermediate', age:'11-13' },
    { sector:'engineering', name:'Civil Engineer', slug:'civil-engineer', emoji:'🏗️', desc:'Design buildings and bridges.', difficulty:'advanced', age:'14-15' },
    { sector:'education', name:'Teacher', slug:'teacher-profession', emoji:'👩‍🏫', desc:'Educate and inspire students.', difficulty:'beginner', age:'8-10' },
    { sector:'law', name:'Lawyer', slug:'lawyer', emoji:'⚖️', desc:'Argue cases and protect rights.', difficulty:'advanced', age:'14-15' },
    { sector:'arts', name:'Musician', slug:'musician', emoji:'🎵', desc:'Create and perform music.', difficulty:'beginner', age:'5-7' },
  ];

  console.log('  Creating professions...');
  const profIds = {};
  for (const p of professions) {
    try {
      const [ex] = await pool.query('SELECT id FROM professions WHERE slug = ?', [p.slug]);
      if (ex.length) { profIds[p.slug] = ex[0].id; continue; }
      const [r] = await pool.query('INSERT INTO professions (sector_id,name,slug,description,difficulty,age_group_min,icon_emoji) VALUES (?,?,?,?,?,?,?)',
        [sectorIds[p.sector], p.name, p.slug, p.desc, p.difficulty, p.age, p.emoji]);
      profIds[p.slug] = r.insertId;
      await pool.query('UPDATE profession_sectors SET profession_count = profession_count + 1 WHERE id = ?', [sectorIds[p.sector]]);
      console.log('    \u2713 ' + p.name);
    } catch(e) {}
  }

  const activities = [
    { prof:'software-developer', title:'Build a To-Do App', desc:'Create a simple task manager.', instructions:'Design a to-do list: add tasks, mark complete, delete.', type:'project', xp:20, mins:45 },
    { prof:'software-developer', title:'Fix the Bug', desc:'Find and fix a bug in code.', instructions:'Read the code, find the error, and explain your fix.', type:'scenario', xp:15, mins:20 },
    { prof:'software-developer', title:'Design a Database', desc:'Plan tables for a school library.', instructions:'List tables, columns, and relationships for a library system.', type:'design', xp:25, mins:30 },
    { prof:'it-support', title:'Help Desk Ticket', desc:'Solve a WiFi issue.', instructions:'A user says: My laptop won\'t connect to WiFi. Walk through troubleshooting steps.', type:'simulation', xp:10, mins:15 },
    { prof:'it-support', title:'Set Up a Printer', desc:'Guide someone through printer setup.', instructions:'Write step-by-step instructions to connect a printer.', type:'writing', xp:10, mins:15 },
    { prof:'doctor', title:'Patient Diagnosis', desc:'Diagnose symptoms.', instructions:'Patient has fever, cough, body aches. What could it be? List possible causes.', type:'scenario', xp:15, mins:20 },
    { prof:'entrepreneur', title:'Business Plan', desc:'Create a plan for a startup.', instructions:'Choose a business idea. Write: Problem, Solution, Target Customer, Revenue Model.', type:'project', xp:30, mins:60 },
    { prof:'graphic-designer', title:'Design a Logo', desc:'Create a logo for a school.', instructions:'Sketch 3 logo ideas for "Green Valley School". Describe colors and fonts.', type:'design', xp:15, mins:30 },
    { prof:'writer', title:'Write a Short Story', desc:'Create a 500-word story.', instructions:'Write a story about a child who discovers a hidden talent. Include a beginning, middle, and end.', type:'writing', xp:20, mins:45 },
    { prof:'teacher-profession', title:'Prepare a Lesson', desc:'Plan a class for 5th graders.', instructions:'Create a 30-minute lesson plan for "Water Cycle" with objectives, activities, and assessment.', type:'project', xp:20, mins:30 },
  ];

  console.log('  Creating activities...');
  for (const a of activities) {
    try {
      const [ex] = await pool.query('SELECT id FROM experience_activities WHERE profession_id = ? AND title = ?', [profIds[a.prof], a.title]);
      if (ex.length) continue;
      await pool.query('INSERT INTO experience_activities (profession_id,title,description,instructions,activity_type,xp_reward,estimated_minutes,sequence_order) VALUES (?,?,?,?,?,?,?,?)',
        [profIds[a.prof], a.title, a.desc, a.instructions, a.type, a.xp, a.mins, 0]);
      await pool.query('UPDATE professions SET activity_count = activity_count + 1 WHERE id = ?', [profIds[a.prof]]);
      console.log('    \u2713 ' + a.title);
    } catch(e) {}
  }

  // Create some badges
  console.log('  Creating badges...');
  const badges = [
    { name:'Explorer', slug:'explorer', desc:'Started exploring a profession', emoji:'🔭', type:'experience' },
    { name:'Enthusiast', slug:'enthusiast', desc:'Completed 15+ activities in one field', emoji:'⭐', type:'experience' },
    { name:'Dedicated', slug:'dedicated', desc:'Completed 30+ activities — ready for mentorship', emoji:'🏆', type:'experience' },
    { name:'Problem Solver', slug:'problem-solver', desc:'Solved a complex scenario', emoji:'🧩', type:'achievement' },
    { name:'Team Player', slug:'team-player', desc:'Completed a team activity', emoji:'🤝', type:'achievement' },
    { name:'First Post', slug:'first-post', desc:'Published your first post', emoji:'📝', type:'milestone' },
    { name:'Week Streak', slug:'week-streak', desc:'Active for 7 days straight', emoji:'🔥', type:'streak' },
  ];

  for (const b of badges) {
    try {
      const [ex] = await pool.query('SELECT id FROM badges WHERE slug = ?', [b.slug]);
      if (ex.length) continue;
      await pool.query('INSERT INTO badges (name,slug,description,icon_emoji,badge_type) VALUES (?,?,?,?,?)', [b.name,b.slug,b.desc,b.emoji,b.type]);
      console.log('    \u2713 ' + b.name);
    } catch(e) {}
  }

  console.log('\n  Experience Lab Seed Complete!');
  console.log('  Sectors: ' + sectors.length);
  console.log('  Professions: ' + professions.length);
  console.log('  Activities: ' + activities.length);
  console.log('  Badges: ' + badges.length + '\n');
  process.exit(0);
};

seedExperience();
