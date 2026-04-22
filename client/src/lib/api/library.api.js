import api from '../api-client';

export const libraryAPI = {
  // ─── School ───────────────────────────────────────────────────────────────
  getBoards:          ()                => api.get('/library/boards'),
  getBoardSyllabus:   (code)            => api.get(`/library/boards/${code}/syllabus`),
  getClasses:         (code, svId)      => api.get(`/library/boards/${code}/classes`, { params: svId ? { syllabusVersionId: svId } : {} }),
  getSubjects:        (classId)         => api.get(`/library/classes/${classId}/subjects`),
  getBooks:           (subjectId)       => api.get(`/library/subjects/${subjectId}/books`),
  getChapters:        (bookId)          => api.get(`/library/books/${bookId}/chapters`),
  getTopics:          (chapterId)       => api.get(`/library/chapters/${chapterId}/topics`),
  recommendBooks:     (params)          => api.get('/library/books/recommend', { params }),

  // ─── Competitive ─────────────────────────────────────────────────────────
  getExams:           ()                => api.get('/library/exams'),
  getExamSubjects:    (code)            => api.get(`/library/exams/${code}/subjects`),
  getExamBooks:       (code, priority)  => api.get(`/library/exams/${code}/books`, { params: priority ? { priority } : {} }),

  // ─── Publishers ──────────────────────────────────────────────────────────
  getPublishers:      ()                => api.get('/library/publishers'),

  // ─── University ──────────────────────────────────────────────────────────
  getUniversities:    ()                => api.get('/library/universities'),
  getUniversityCourses: (id)            => api.get(`/library/universities/${id}/courses`),
  getCourseCategories: ()               => api.get('/library/course-categories'),
  getCourses:         (level)           => api.get('/library/courses', { params: level ? { level } : {} }),
  getCourseSubjects:  (id, semester)    => api.get(`/library/courses/${id}/subjects`, { params: semester ? { semester } : {} }),
  getSubjectBooks:    (uniSubjectId)    => api.get(`/library/university-subjects/${uniSubjectId}/books`),
  recommendUniBooks:  (params)          => api.get('/library/university-books/recommend', { params }),

  // ─── Chapters + Topics + TOC ─────────────────────────────────────────────
  getSubjectChapters: (subjectId)    => api.get(`/library/university-subjects/${subjectId}/chapters`),
  getChapterTopics:   (chapterId)    => api.get(`/library/university-chapters/${chapterId}/topics`),
  getBookChapters:    (bookId)       => api.get(`/library/university-books/${bookId}/chapters`),
  getChapterBooks:    (chapterId)    => api.get(`/library/university-chapters/${chapterId}/books`),

  // ─── AI Ask ──────────────────────────────────────────────────────────────
  // ─── NCERT TOC ───────────────────────────────────────────────────────────────
  // params: { class: 10, subject: 'maths', state: 'delhi' }
  getNCERTToc: (params) => api.get('/library/ncert-toc', { params }),
  // params: { board, class, subject } or { exam, subject }
  getSmartChapters: (params) => api.get('/library/smart-chapters', { params }),

  ask: (payload) => api.post('/library/ask', payload),

  // POST /api/library/generate/chapter
  // { chapterId, board, grade, subject, chapterName, chapterNumber, topics[], syllabusVersion }
  generateChapter: (payload) => api.post('/library/generate/chapter', payload),
};
