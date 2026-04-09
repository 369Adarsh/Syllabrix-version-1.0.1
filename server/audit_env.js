
const path = require('path');
const dotenv = require('dotenv');

// Try all common env file names
const envFiles = ['.env', '.env.development', '.env.local', '.env.production'];
envFiles.forEach(file => {
  dotenv.config({ path: path.join(__dirname, file) });
  dotenv.config({ path: path.join(__dirname, '..', file) });
});

console.log('--- ENV VARIABLE AUDIT ---');
const vars = Object.keys(process.env).sort();
for (const v of vars) {
  if (v.startsWith('GEMINI_') || v.startsWith('DB_') || v.startsWith('SERVER_') || v.startsWith('PORT')) {
    let val = process.env[v];
    if (v.includes('PASSWORD') || v.includes('KEY') || v.includes('SECRET')) {
      val = val ? (val.length > 10 ? val.substring(0, 5) + '...' + val.substring(val.length-5) : '***') : 'NULL';
    }
    console.log(`${v.padEnd(30)}: ${val}`);
  }
}
console.log('---------------------------');
