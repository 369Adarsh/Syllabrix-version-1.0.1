═══════════════════════════════════════════════════════════
MESSAGE 1: PASTE THIS FIRST — THE BRUTAL AUDIT
═══════════════════════════════════════════════════════════
The JEE Command feature is completely broken. Every page is empty, AI generates nothing, no content exists. Before you fix anything, I need a complete forensic audit. Do ALL of the following right now:

Connect to the database and run SELECT COUNT(*) for EVERY table that starts with "jee_". Show me the table name and row count for each. If a table doesn't exist, say so.
Find every file in server/src/ that handles JEE routes or JEE AI. List every file path. Open each one. Tell me: does the AI function actually call Gemini, or does it return hardcoded/empty/dummy data? Show me the exact line where it either calls the AI model or returns fake data.
Check the .env file. Does GEMINI_API_KEY exist? Is it a real key or a placeholder like "your-key-here"? What model name is being used — is it "gemini-2.0-flash" or something else?
Run the server temporarily and hit these endpoints with curl or a test script. Show me the raw response for each:

GET /api/jee/subjects
GET /api/jee/chapters?subject=physics&class=11
POST /api/jee/ai/doubt with body {"question": "What is Newton's second law?"}


Check the frontend. Open jee-command/page.jsx (or wherever the dashboard is). Does it fetch data from API or show hardcoded content? Check the same for syllabus page, PYQ page, and AI tutor page.

Show me ALL findings. Do not fix anything yet. I need to see the full damage report.