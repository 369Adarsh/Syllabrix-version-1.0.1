'use strict';
/**
 * university_ds_chapters.seed.js
 * Seeds chapters, topics, and book TOC for:
 *   - Subject: "Data Structures" (B.Tech CS Sem 3)
 *   - Books: Narasimha Karumanchi, CLRS, Reema Thareja
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../..', '.env.development') });

const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '3306'),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  ssl:      process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 3,
});

async function q(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function insertIgnore(sql, params) {
  const [r] = await pool.execute(sql, params);
  return r.insertId;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const CHAPTERS = [
  {
    num: 1,
    name: 'Introduction to Data Structures',
    desc: 'Fundamentals of data organization, abstract data types, algorithm analysis, and time/space complexity.',
    topics: [
      { num: 1, name: 'What is a Data Structure?', desc: 'Definition, need, and classification of data structures into linear and non-linear types.' },
      { num: 2, name: 'Abstract Data Types (ADT)', desc: 'Concept of ADT — separating interface from implementation. Stack ADT, Queue ADT.' },
      { num: 3, name: 'Algorithm Analysis & Big-O Notation', desc: 'Asymptotic notation: O, Ω, Θ. Best, average, worst case analysis. Common complexities.' },
      { num: 4, name: 'Time and Space Complexity', desc: 'Measuring algorithm efficiency. Recurrence relations and solving with Master Theorem.' },
      { num: 5, name: 'Memory Allocation: Static vs Dynamic', desc: 'Stack memory vs heap memory. malloc, calloc, realloc, free in C. Pointer basics.' },
    ],
  },
  {
    num: 2,
    name: 'Arrays',
    desc: 'Static data structure, multi-dimensional arrays, operations, and applications.',
    topics: [
      { num: 1, name: '1D and 2D Arrays', desc: 'Declaration, initialization, traversal. Row-major vs column-major order. Memory layout.' },
      { num: 2, name: 'Array Operations', desc: 'Insertion, deletion, searching, sorting in arrays. Time complexity of each operation.' },
      { num: 3, name: 'Sparse Matrices', desc: 'Representing sparse matrices efficiently. Triplet representation and linked list representation.' },
      { num: 4, name: 'Searching Algorithms', desc: 'Linear search O(n) and Binary search O(log n). Conditions, implementation, comparison.' },
      { num: 5, name: 'Sorting: Bubble, Selection, Insertion', desc: 'Elementary sorting algorithms. In-place sorting, stability, O(n²) complexity analysis.' },
      { num: 6, name: 'Applications of Arrays', desc: 'Polynomials, matrix multiplication, image processing basics, sliding window technique.' },
    ],
  },
  {
    num: 3,
    name: 'Linked Lists',
    desc: 'Dynamic linear data structures — singly, doubly, circular variants and operations.',
    topics: [
      { num: 1, name: 'Singly Linked List', desc: 'Node structure, head pointer. Insert/delete at beginning, end, middle. Traversal algorithms.' },
      { num: 2, name: 'Doubly Linked List', desc: 'Bidirectional links. Forward and backward traversal. Insert/delete operations with prev pointer.' },
      { num: 3, name: 'Circular Linked List', desc: 'Last node points to head. Advantages over singly LL. Applications in round-robin scheduling.' },
      { num: 4, name: 'Linked List vs Array', desc: 'Comparison: memory, access time, insertion/deletion efficiency. When to choose which.' },
      { num: 5, name: 'Applications of Linked Lists', desc: 'Implementing stacks and queues. Polynomial addition. Memory management free lists.' },
    ],
  },
  {
    num: 4,
    name: 'Stacks',
    desc: 'LIFO data structure — array and linked list implementation, and classic applications.',
    topics: [
      { num: 1, name: 'Stack ADT and Implementation', desc: 'LIFO principle. Push, pop, peek, isEmpty, isFull operations. Array-based implementation.' },
      { num: 2, name: 'Stack using Linked List', desc: 'Dynamic stack — no overflow (until memory exhausted). Node-based push and pop.' },
      { num: 3, name: 'Expression Conversion', desc: 'Infix to Postfix (Reverse Polish Notation) using stack. Operator precedence rules.' },
      { num: 4, name: 'Expression Evaluation', desc: 'Evaluating postfix and prefix expressions using stack. Step-by-step trace.' },
      { num: 5, name: 'Recursion and Call Stack', desc: 'How function calls use the system stack. Stack frames, activation records, stack overflow.' },
      { num: 6, name: 'Balancing Parentheses', desc: 'Checking balanced brackets {[()]}. Stack-based algorithm. Extension to HTML tag matching.' },
    ],
  },
  {
    num: 5,
    name: 'Queues',
    desc: 'FIFO data structure — simple, circular, deque, and priority queue variants.',
    topics: [
      { num: 1, name: 'Queue ADT and Simple Queue', desc: 'FIFO principle. Enqueue, dequeue, front, rear operations. Array implementation and limitations.' },
      { num: 2, name: 'Circular Queue', desc: 'Solving wasted space problem. Modulo arithmetic for wrap-around. Full vs empty detection.' },
      { num: 3, name: 'Double-Ended Queue (Deque)', desc: 'Insert/delete at both ends. Input-restricted and output-restricted deques. STL deque.' },
      { num: 4, name: 'Priority Queue', desc: 'Elements served by priority not arrival order. Min-heap and max-heap implementation.' },
      { num: 5, name: 'Applications of Queues', desc: 'CPU scheduling, BFS traversal, print spooling, call center simulation, sliding window max.' },
    ],
  },
  {
    num: 6,
    name: 'Trees',
    desc: 'Hierarchical non-linear structures — binary trees, BST, AVL, heaps, and traversals.',
    topics: [
      { num: 1, name: 'Tree Terminology and Binary Trees', desc: 'Root, leaf, height, depth, degree. Full, complete, perfect binary trees. Properties.' },
      { num: 2, name: 'Tree Traversals (Inorder, Preorder, Postorder)', desc: 'Recursive and iterative DFS traversals. BFS level-order traversal using queue.' },
      { num: 3, name: 'Binary Search Tree (BST)', desc: 'BST property: left < root < right. Insert, search, delete operations. Successor/predecessor.' },
      { num: 4, name: 'AVL Trees (Self-Balancing BST)', desc: 'Balance factor, rotations (LL, RR, LR, RL). Height-balanced BST. O(log n) guarantee.' },
      { num: 5, name: 'Heaps and Heap Sort', desc: 'Min-heap, max-heap. Heapify operation. Priority queue via heap. O(n log n) heap sort.' },
      { num: 6, name: 'Applications of Trees', desc: 'Expression trees, Huffman coding, file system hierarchy, database indexing with B-trees.' },
    ],
  },
  {
    num: 7,
    name: 'Graphs',
    desc: 'Non-linear structures for networks — representations, traversals, and shortest path algorithms.',
    topics: [
      { num: 1, name: 'Graph Terminology and Representations', desc: 'Directed, undirected, weighted graphs. Adjacency matrix vs adjacency list. Space complexity.' },
      { num: 2, name: 'Breadth-First Search (BFS)', desc: 'Level-by-level exploration using queue. Connected components, shortest path in unweighted graphs.' },
      { num: 3, name: 'Depth-First Search (DFS)', desc: 'Stack/recursion based exploration. Discovery and finish times. Applications in cycle detection.' },
      { num: 4, name: "Dijkstra's Shortest Path Algorithm", desc: "Greedy algorithm for non-negative weighted graphs. Priority queue implementation. O((V+E)log V)." },
      { num: 5, name: 'Minimum Spanning Tree (Kruskal & Prim)', desc: "Kruskal's Union-Find approach vs Prim's greedy MST. Applications in network design." },
      { num: 6, name: 'Topological Sort & DAGs', desc: 'Ordering vertices in DAG. Kahn\'s algorithm (BFS-based) and DFS-based approach. Build systems.' },
    ],
  },
  {
    num: 8,
    name: 'Hashing',
    desc: 'O(1) average lookup using hash functions, collision resolution, and practical applications.',
    topics: [
      { num: 1, name: 'Hash Functions', desc: 'Division method, multiplication method, universal hashing. Properties of a good hash function.' },
      { num: 2, name: 'Collision Resolution: Chaining', desc: 'Separate chaining with linked lists. Load factor α. Expected O(1) search with simple uniform hashing.' },
      { num: 3, name: 'Collision Resolution: Open Addressing', desc: 'Linear probing, quadratic probing, double hashing. Clustering problems and solutions.' },
      { num: 4, name: 'Hash Table Operations', desc: 'Insert, search, delete in hash tables. Rehashing when load factor exceeds threshold.' },
      { num: 5, name: 'Applications of Hashing', desc: 'Symbol tables in compilers, caching (LRU cache), databases, cryptographic hash functions.' },
    ],
  },
];

// Book TOC data — matches actual books seeded in university_books
const BOOK_TOC = {
  'Data Structures and Algorithms Made Easy': [
    { num: 1, title: 'Introduction', start: 1,   end: 28  },
    { num: 2, title: 'Recursion and Backtracking', start: 29, end: 54 },
    { num: 3, title: 'Linked Lists', start: 55,  end: 130 },
    { num: 4, title: 'Stacks', start: 131, end: 178 },
    { num: 5, title: 'Queues', start: 179, end: 220 },
    { num: 6, title: 'Trees', start: 221, end: 350 },
    { num: 7, title: 'Priority Queues and Heaps', start: 351, end: 390 },
    { num: 8, title: 'Disjoint Sets ADT', start: 391, end: 410 },
    { num: 9, title: 'Graph Algorithms', start: 411, end: 490 },
    { num: 10, title: 'Sorting', start: 491, end: 540 },
    { num: 11, title: 'Searching', start: 541, end: 570 },
    { num: 12, title: 'Selection Algorithms', start: 571, end: 590 },
    { num: 13, title: 'Symbol Tables and Hashing', start: 591, end: 640 },
    { num: 14, title: 'String Algorithms', start: 641, end: 690 },
    { num: 15, title: 'Algorithm Design Techniques', start: 691, end: 750 },
  ],
  'Introduction to Algorithms': [
    { num: 1, title: 'The Role of Algorithms', start: 1,   end: 30  },
    { num: 2, title: 'Getting Started (Sorting)', start: 31,  end: 70  },
    { num: 3, title: 'Growth of Functions (Big-O)', start: 71,  end: 110 },
    { num: 4, title: 'Divide-and-Conquer', start: 111, end: 148 },
    { num: 5, title: 'Probabilistic Analysis', start: 149, end: 190 },
    { num: 6, title: 'Heapsort', start: 191, end: 224 },
    { num: 7, title: 'Quicksort', start: 225, end: 260 },
    { num: 8, title: 'Linear Time Sorting', start: 261, end: 298 },
    { num: 9, title: 'Medians and Order Statistics', start: 299, end: 320 },
    { num: 10, title: 'Elementary Data Structures', start: 321, end: 358 },
    { num: 11, title: 'Hash Tables', start: 359, end: 402 },
    { num: 12, title: 'Binary Search Trees', start: 403, end: 444 },
    { num: 13, title: 'Red-Black Trees', start: 445, end: 494 },
    { num: 14, title: 'Augmenting Data Structures', start: 495, end: 524 },
    { num: 22, title: 'Elementary Graph Algorithms', start: 589, end: 640 },
    { num: 24, title: 'Single-Source Shortest Paths', start: 681, end: 740 },
    { num: 25, title: 'All-Pairs Shortest Paths', start: 741, end: 780 },
  ],
  'Data Structures Using C': [
    { num: 1, title: 'Introduction to Data Structures', start: 1,   end: 40  },
    { num: 2, title: 'Arrays and Strings', start: 41,  end: 100 },
    { num: 3, title: 'Linked Lists', start: 101, end: 180 },
    { num: 4, title: 'Stacks and Queues', start: 181, end: 260 },
    { num: 5, title: 'Trees', start: 261, end: 380 },
    { num: 6, title: 'Graphs', start: 381, end: 480 },
    { num: 7, title: 'Searching and Hashing', start: 481, end: 560 },
    { num: 8, title: 'Sorting Techniques', start: 561, end: 630 },
    { num: 9, title: 'Files and File Organization', start: 631, end: 680 },
  ],
};

// Book chapter topics (key entries per chapter)
const BOOK_CHAPTER_TOPICS = {
  'Data Structures and Algorithms Made Easy': {
    1:  [{ t: 'Variables, Data Types, and Memory', p: 5  }, { t: 'Abstract Data Types', p: 12 }, { t: 'Algorithm Complexity', p: 18 }],
    3:  [{ t: 'Singly Linked List Implementation', p: 60 }, { t: 'Doubly Linked List', p: 85 }, { t: 'Circular Linked List', p: 105 }, { t: 'Linked List Problems', p: 115 }],
    4:  [{ t: 'Stack using Array', p: 135 }, { t: 'Stack using Linked List', p: 148 }, { t: 'Infix to Postfix Conversion', p: 155 }, { t: 'Expression Evaluation', p: 165 }],
    5:  [{ t: 'Queue using Array', p: 183 }, { t: 'Circular Queue', p: 192 }, { t: 'Queue using Linked List', p: 200 }, { t: 'Deque and Priority Queue', p: 210 }],
    6:  [{ t: 'Binary Trees and Traversals', p: 225 }, { t: 'Binary Search Trees', p: 270 }, { t: 'AVL Trees', p: 300 }, { t: 'Threaded Binary Trees', p: 335 }],
    9:  [{ t: 'Graph Representation', p: 415 }, { t: 'BFS', p: 430 }, { t: 'DFS', p: 445 }, { t: "Dijkstra's Algorithm", p: 460 }, { t: 'Prim and Kruskal', p: 472 }],
    13: [{ t: 'Hash Functions', p: 595 }, { t: 'Chaining', p: 608 }, { t: 'Open Addressing', p: 618 }],
  },
  'Introduction to Algorithms': {
    3:  [{ t: 'Asymptotic Notation', p: 75 }, { t: 'Standard Notations', p: 85 }, { t: 'Common Functions', p: 100 }],
    10: [{ t: 'Stacks and Queues', p: 325 }, { t: 'Linked Lists', p: 336 }, { t: 'Trees Basics', p: 346 }],
    11: [{ t: 'Direct-Address Tables', p: 363 }, { t: 'Hash Tables', p: 368 }, { t: 'Hash Functions', p: 375 }, { t: 'Open Addressing', p: 387 }],
    12: [{ t: 'BST Basics', p: 407 }, { t: 'Querying BST', p: 414 }, { t: 'Insertion and Deletion', p: 425 }],
    22: [{ t: 'Representations', p: 593 }, { t: 'BFS Algorithm', p: 600 }, { t: 'DFS Algorithm', p: 614 }, { t: 'Topological Sort', p: 627 }],
    24: [{ t: 'Bellman-Ford', p: 685 }, { t: "Dijkstra's Algorithm", p: 720 }],
  },
  'Data Structures Using C': {
    1:  [{ t: 'Introduction and Classification', p: 5 }, { t: 'Algorithm Basics', p: 20 }, { t: 'Complexity Analysis', p: 30 }],
    2:  [{ t: '1D Arrays', p: 45 }, { t: '2D Arrays and Matrices', p: 65 }, { t: 'Sparse Matrix', p: 82 }],
    3:  [{ t: 'Singly Linked List', p: 105 }, { t: 'Doubly Linked List', p: 135 }, { t: 'Circular Linked List', p: 158 }],
    4:  [{ t: 'Stack Implementation', p: 185 }, { t: 'Queue Implementation', p: 210 }, { t: 'Applications', p: 240 }],
    5:  [{ t: 'Binary Tree Operations', p: 265 }, { t: 'Tree Traversals', p: 285 }, { t: 'BST', p: 310 }, { t: 'AVL Tree', p: 345 }],
    6:  [{ t: 'Graph Representations', p: 385 }, { t: 'BFS and DFS', p: 410 }, { t: 'Shortest Path', p: 445 }],
    7:  [{ t: 'Sequential Search', p: 485 }, { t: 'Binary Search', p: 498 }, { t: 'Hashing Techniques', p: 515 }],
  },
};

// ─── Main ────────────────────────────────────────────────────────────────────

(async () => {
  console.log('[SEED] university_ds_chapters.seed.js — starting...');

  try {
    // Find the Data Structures subject (Sem 3, B.Tech CS)
    const subjects = await q(
      `SELECT us.id, us.name FROM university_subjects us
       JOIN courses c ON c.id = us.course_id
       WHERE us.name LIKE '%Data Structure%'
         AND c.short_name = 'B.Tech'
       LIMIT 1`
    );

    if (!subjects.length) {
      console.error('[SEED] ERROR: Data Structures subject not found. Run university_subjects.seed.js first.');
      process.exit(1);
    }

    const subjectId = subjects[0].id;
    console.log(`  Found subject: "${subjects[0].name}" (id=${subjectId})`);

    // ── Chapters + Topics ────────────────────────────────────────────────────
    let chapterCount = 0, topicCount = 0;

    for (const ch of CHAPTERS) {
      // Insert chapter (ignore if already exists via UNIQUE KEY)
      const [chRes] = await pool.execute(
        `INSERT IGNORE INTO university_subject_chapters
           (subject_id, chapter_num, chapter_name, description)
         VALUES (?, ?, ?, ?)`,
        [subjectId, ch.num, ch.name, ch.desc]
      );

      // Get chapter id (whether just inserted or already existed)
      const [chRows] = await pool.execute(
        `SELECT id FROM university_subject_chapters WHERE subject_id = ? AND chapter_num = ?`,
        [subjectId, ch.num]
      );
      const chapterId = chRows[0].id;
      if (chRes.affectedRows > 0) chapterCount++;

      for (const tp of ch.topics) {
        const [tpRes] = await pool.execute(
          `INSERT IGNORE INTO university_chapter_topics
             (chapter_id, topic_num, topic_name, description)
           VALUES (?, ?, ?, ?)`,
          [chapterId, tp.num, tp.name, tp.desc]
        );
        if (tpRes.affectedRows > 0) topicCount++;
      }
    }

    console.log(`  ✓ ${chapterCount} chapters, ${topicCount} topics inserted`);

    // ── Book TOC ─────────────────────────────────────────────────────────────
    // Find DS books
    const dsBooks = await q(
      `SELECT ub.id, ub.title
       FROM university_books ub
       JOIN university_book_subject_links ubsl ON ubsl.university_book_id = ub.id
       WHERE ubsl.university_subject_id = ?`,
      [subjectId]
    );

    if (!dsBooks.length) {
      console.warn('  [WARN] No books linked to Data Structures subject. Skipping TOC seed.');
      await pool.end();
      console.log('[SEED] university_ds_chapters.seed.js — done.');
      return;
    }

    let bookChapCount = 0, bookTopicCount = 0;

    for (const book of dsBooks) {
      // Find matching TOC by title substring
      const tocKey = Object.keys(BOOK_TOC).find(k => book.title.includes(k.split(' ')[0]) || book.title.toLowerCase().includes(k.toLowerCase().split(' ').slice(0,3).join(' ')));
      if (!tocKey) {
        console.log(`  [INFO] No TOC data for: "${book.title}" — skipping`);
        continue;
      }

      const toc = BOOK_TOC[tocKey];
      const chTopics = BOOK_CHAPTER_TOPICS[tocKey] || {};

      for (const ch of toc) {
        const [bcRes] = await pool.execute(
          `INSERT IGNORE INTO university_book_chapters
             (book_id, chapter_num, chapter_title, page_start, page_end)
           VALUES (?, ?, ?, ?, ?)`,
          [book.id, ch.num, ch.title, ch.start, ch.end]
        );

        if (bcRes.affectedRows > 0) {
          bookChapCount++;
          const bcId = bcRes.insertId;

          // Insert chapter topics
          const topics = chTopics[ch.num] || [];
          for (const tp of topics) {
            await pool.execute(
              `INSERT INTO university_book_chapter_topics (book_chapter_id, topic_name, page_num) VALUES (?, ?, ?)`,
              [bcId, tp.t, tp.p]
            );
            bookTopicCount++;
          }
        }
      }
      console.log(`  ✓ TOC for "${book.title.substring(0, 45)}..."`);
    }

    console.log(`  ✓ ${bookChapCount} book chapters, ${bookTopicCount} book chapter topics inserted`);

  } catch (err) {
    console.error('[SEED] ERROR:', err.message);
    await pool.end();
    process.exit(1);
  }

  await pool.end();
  console.log('[SEED] university_ds_chapters.seed.js — done.');
})();
