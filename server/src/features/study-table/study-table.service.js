const { pool } = require('../../database/connection');
const aiService = require('../../services/ai.service');
const pdfParse = require('pdf-parse');
const fs = require('fs');
const path = require('path');

class StudyTableService {
  async getWorkspaces(userId) {
    const [rows] = await pool.query('SELECT * FROM study_workspaces WHERE user_id = ? ORDER BY updated_at DESC', [userId]);
    return rows;
  }

  async createWorkspace(userId, { title, description, icon, color }) {
    const [result] = await pool.query(
      'INSERT INTO study_workspaces (user_id, title, description, icon, color) VALUES (?, ?, ?, ?, ?)',
      [userId, title, description, icon, color]
    );
    const [rows] = await pool.query('SELECT * FROM study_workspaces WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  async getWorkspaceDetails(workspaceId, userId) {
    const [wRows] = await pool.query('SELECT * FROM study_workspaces WHERE id = ? AND user_id = ?', [workspaceId, userId]);
    if (!wRows.length) throw new Error('Workspace not found or unauthorized access');

    const [dRows] = await pool.query('SELECT id, title, file_url, file_type, size_bytes, status, created_at FROM study_documents WHERE workspace_id = ? ORDER BY created_at DESC', [workspaceId]);
    const [aRows] = await pool.query('SELECT id, title, type, created_at FROM study_artifacts WHERE workspace_id = ? ORDER BY created_at DESC', [workspaceId]);

    return { ...wRows[0], documents: dRows, artifacts: aRows };
  }

  async uploadDocument(workspaceId, userId, fileObj) {
    let extractedText = '';

    if (fileObj.mimetype === 'application/pdf') {
      try {
        const dataBuffer = fileObj.buffer || fs.readFileSync(fileObj.path);
        const data = await pdfParse(dataBuffer);
        extractedText = data.text;
      } catch (err) {
        console.error('[PDF Parse Error]:', err);
        extractedText = "Content extraction partially failed or PDF is an image-based scan.";
      }
    } else if (fileObj.mimetype.includes('text')) {
      extractedText = fileObj.buffer ? fileObj.buffer.toString('utf8') : fs.readFileSync(fileObj.path, 'utf8');
    } else {
      extractedText = "Raw file extracted. (Format not fully parsed).";
    }

    // Save directly to public folder from memory
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const saveFilename = fileObj.fieldname + '-' + uniqueSuffix + path.extname(fileObj.originalname);
    const finalDest = path.join(__dirname, '../../../public/uploads/study', saveFilename);
    const finalFileUrl = `/uploads/study/${saveFilename}`;

    try {
      if (fileObj.buffer) {
        fs.writeFileSync(finalDest, fileObj.buffer);
      } else {
        fs.copyFileSync(fileObj.path, finalDest);
        fs.unlinkSync(fileObj.path);
      }
    } catch (err) {
      console.error('[File Save Error]:', err);
    }

    const typeStr = fileObj.mimetype === 'application/pdf' ? 'pdf' : 'doc';

    const [result] = await pool.query(
      `INSERT INTO study_documents 
       (workspace_id, user_id, title, original_filename, file_url, file_type, mime_type, size_bytes, status, extracted_text)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        workspaceId, userId, fileObj.originalname, fileObj.originalname, 
        finalFileUrl, typeStr, fileObj.mimetype, fileObj.size, 
        'ready', extractedText
      ]
    );

    return result.insertId;
  }

  async getWorkspaceContext(workspaceId) {
    const [docs] = await pool.query('SELECT title, extracted_text FROM study_documents WHERE workspace_id = ? AND status = "ready"', [workspaceId]);
    return docs.map(d => `--- START DOCUMENT: ${d.title} ---\n${d.extracted_text}\n--- END DOCUMENT ---\n`).join('\n');
  }

  async generateArtifact(workspaceId, userId, type, topic) {
    const context = await this.getWorkspaceContext(workspaceId);
    if (!context) throw new Error("Please upload documents before generating artifacts.");

    let prompt = "";
    let data;

    try {
      if (type === 'flashcard_set') {
        prompt = `Using ONLY the following course materials, generate 10 detailed educational flashcards about "${topic || 'the overall content'}". Return an array of JSON objects with "front" (question/concept) and "back" (answer/definition).\n\nMATERIALS:\n${context}`;
        data = await aiService.generateJSON(prompt, { task: 'reasoning' });
        if (!Array.isArray(data)) throw new Error("Invalid AI format for flashcards");
      } else if (type === 'quiz') {
        prompt = `Using ONLY the following course materials, generate a 5-question multiple choice quiz about "${topic || 'the overall content'}". Return an array of JSON objects with "question", "options" (array of exactly 4 strings), "correctAnswer" (exact matching string from options), and "explanation".\n\nMATERIALS:\n${context}`;
        data = await aiService.generateJSON(prompt, { task: 'reasoning' });
        if (!Array.isArray(data)) throw new Error("Invalid AI format for quiz");
      } else if (type === 'study_guide') {
        prompt = `Using ONLY the following course materials, generate a comprehensive markdown study guide for "${topic || 'the overall content'}". Use headers, bullet points, key terms, and summary sections.\n\nMATERIALS:\n${context}`;
        const text = await aiService.generateText(prompt, { task: 'reasoning' });
        if (!text) throw new Error("AI failed to generate study guide text");
        data = { markdown: text };
      } else {
        throw new Error("Unsupported artifact type");
      }

      const title = `${topic || 'General'} ${type.replace('_', ' ')}`;
      const [res] = await pool.query(
        'INSERT INTO study_artifacts (workspace_id, user_id, title, type, content) VALUES (?, ?, ?, ?, ?)',
        [workspaceId, userId, title, type, JSON.stringify(data)]
      );
      
      return { id: res.insertId, title, type, content: data };
    } catch (err) {
      console.error(`[StudyTableService] Artifact Generation (${type}) error:`, err);
      throw new Error(`Our AI tutor is currently busy crafting materials. Please try generating your ${type.replace('_', ' ')} again in a moment.`);
    }
  }

  async getArtifact(artifactId, userId) {
    const [rows] = await pool.query('SELECT * FROM study_artifacts WHERE id = ? AND user_id = ?', [artifactId, userId]);
    return rows[0];
  }

  async chat(workspaceId, history, message) {
    const context = await this.getWorkspaceContext(workspaceId);
    if (!context) return { reply: "I'm ready to help! Please upload some study materials to your workspace first so I can provide accurate, grounded answers." };

    const systemPrompt = `You are the Syllabrix Study Copilot, an AI educational assistant. You must firmly ground your answers using ONLY the provided course materials. Do not hallucinate external facts. If the answer is not in the materials, state that clearly and offer to help with what IS available.\n\nCOURSE MATERIALS:\n${context}`;
    
    try {
      return await aiService.chat(history || [], message, systemPrompt);
    } catch (err) {
      console.error('[StudyTableService] Chat error:', err);
      return { reply: "I'm having a momentary connection issue. Let me try re-reading your notes—could you please repeat your question?" };
    }
  }
}

module.exports = new StudyTableService();
