const LibraryService = require('./admin-library.service');

class AdminLibraryController {
  async getStats(req, res) {
    try { res.json(await LibraryService.getStats()); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }

  async getTree(req, res) {
    try { res.json(await LibraryService.getTree()); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }

  async search(req, res) {
    try {
      if (!req.query.q) return res.json({ books: [], subjects: [], chapters: [] });
      res.json(await LibraryService.search(req.query.q));
    } catch (e) { res.status(500).json({ error: e.message }); }
  }

  // Boards
  async getBoards(req, res) {
    try { res.json(await LibraryService.getBoards()); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async createBoard(req, res) {
    try { res.status(201).json(await LibraryService.createBoard(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  // Classes
  async getClasses(req, res) {
    try { res.json(await LibraryService.getClasses(req.query.board_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async createClass(req, res) {
    try { res.status(201).json(await LibraryService.createClass(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  // Subjects
  async getSubjects(req, res) {
    try { res.json(await LibraryService.getSubjects(req.query.class_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async createSubject(req, res) {
    try { res.status(201).json(await LibraryService.createSubject(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async deleteSubject(req, res) {
    try { await LibraryService.deleteSubject(req.params.id); res.json({ message: 'Deleted' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  // Books
  async getBooks(req, res) {
    try { res.json(await LibraryService.getBooks(req.query.subject_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async createBook(req, res) {
    try {
      const result = await LibraryService.createBook(req.body, req.file || null, req.user.id);
      res.status(201).json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }
  async deleteBook(req, res) {
    try { await LibraryService.deleteBook(req.params.id); res.json({ message: 'Deleted' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  // Chapters
  async getChapters(req, res) {
    try { res.json(await LibraryService.getChapters(req.query.book_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async createChapter(req, res) {
    try { res.status(201).json(await LibraryService.createChapter(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async deleteChapter(req, res) {
    try { await LibraryService.deleteChapter(req.params.id); res.json({ message: 'Deleted' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async updateChapter(req, res) {
    try { await LibraryService.updateChapter(req.params.id, req.body); res.json({ message: 'Updated' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async bulkCreateChapters(req, res) {
    try {
      const { book_id, chapters } = req.body;
      if (!book_id || !chapters?.length) return res.status(400).json({ error: 'book_id and chapters array required' });
      res.status(201).json(await LibraryService.bulkCreateChapters(book_id, chapters));
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  // Topics
  async getTopics(req, res) {
    try { res.json(await LibraryService.getTopics(req.query.chapter_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async createTopic(req, res) {
    try { res.status(201).json(await LibraryService.createTopic(req.body)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async deleteTopic(req, res) {
    try { await LibraryService.deleteTopic(req.params.id); res.json({ message: 'Deleted' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }

  // Competitive Exams
  async getExamTree(req, res) {
    try { res.json(await LibraryService.getExamTree()); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async getExamSubjects(req, res) {
    try { res.json(await LibraryService.getExamSubjects(req.query.exam_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async getCompetitiveBooks(req, res) {
    try { res.json(await LibraryService.getCompetitiveBooks(req.query.subject_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }

  // University
  async getUniversityTree(req, res) {
    try { res.json(await LibraryService.getUniversityTree()); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async getUniversitySubjects(req, res) {
    try { res.json(await LibraryService.getUniversitySubjects(req.query.course_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }
  async getUniversitySubjectBooks(req, res) {
    try { res.json(await LibraryService.getUniversitySubjectBooks(req.query.subject_id)); }
    catch (e) { res.status(500).json({ error: e.message }); }
  }

  // File Uploads
  async getUploads(req, res) {
    try {
      const { entity_type, entity_id } = req.query;
      res.json(await LibraryService.getUploads(entity_type, entity_id));
    } catch (e) { res.status(500).json({ error: e.message }); }
  }
  async uploadFile(req, res) {
    try {
      if (!req.file) return res.status(400).json({ error: 'No file provided' });
      const { entity_type, entity_id, file_type, description } = req.body;
      const result = await LibraryService.uploadFileForEntity(
        entity_type, parseInt(entity_id), req.file,
        { file_type, description }, req.user.id
      );
      res.json(result);
    } catch (e) { res.status(400).json({ error: e.message }); }
  }

  async extractPdfTitle(req, res) {
    try {
      if (!req.file) return res.json({ title: '' });
      const isPdf = req.file.mimetype === 'application/pdf' || req.file.originalname?.toLowerCase().endsWith('.pdf');
      if (!isPdf) return res.json({ title: '' });

      const pdfParse = require('pdf-parse');
      const data = await pdfParse(req.file.buffer, { max: 1 });

      // 1. Try PDF metadata title
      let title = (data.info?.Title || '').trim();

      // 2. Fall back to first meaningful line of text from page 1
      if (!title) {
        const lines = data.text
          .split('\n')
          .map(l => l.replace(/\s+/g, ' ').trim())
          .filter(l => l.length > 3 && l.length < 200 && !/^\d+$/.test(l));
        title = lines[0] || '';
      }

      res.json({ title: title.slice(0, 200) });
    } catch (e) {
      res.json({ title: '' }); // Never block — silently fail
    }
  }
  async toggleAiIndex(req, res) {
    try { res.json(await LibraryService.toggleAiIndex(req.params.id)); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
  async deleteUpload(req, res) {
    try { await LibraryService.deleteUpload(req.params.id); res.json({ message: 'Deleted' }); }
    catch (e) { res.status(400).json({ error: e.message }); }
  }
}

module.exports = new AdminLibraryController();
