require("dotenv").config();
const mongoose = require("mongoose");
const config = require("./config");
const { User, Subject, Quiz, QuizAttempt, Progress, Insight, Syllabus } = require("./models");

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(randomBetween(8, 20), randomBetween(0, 59), randomBetween(0, 59));
  return d;
}

// ─── Users ───

const NEW_STUDENTS = [
  { name: "Love Bhatti", email: "love@student.edu.in", avatar: "preset-1" },
  { name: "Gourav", email: "gourav@student.edu.in", avatar: "preset-3" },
  { name: "Shivam", email: "shivam@student.edu.in", avatar: "preset-5" },
];

const NEW_TEACHER = { name: "Satwinder", email: "satwinder@teacher.edu.in", avatar: "preset-2" };

// ─── 8 CSE Subjects ───

const SUBJECTS = [
  {
    name: "Data Structures & Algorithms",
    description: "Arrays, linked lists, trees, graphs, sorting, searching, and algorithm design.",
    icon: "code",
    resources: [
      { title: "DSA Full Course — Abdul Bari", url: "https://youtube.com/watch?v=0IAPZzGSbME", type: "youtube", description: "Comprehensive DSA course" },
      { title: "VisuAlgo — Visualize DS & Algos", url: "https://visualgo.net", type: "article", description: "Interactive algorithm visualizations" },
      { title: "GeeksforGeeks DSA Guide", url: "https://www.geeksforgeeks.org/data-structures/", type: "article", description: "Reference for all data structures" },
    ],
  },
  {
    name: "Operating Systems",
    description: "Process management, memory management, file systems, and scheduling.",
    icon: "cpu",
    resources: [
      { title: "OS Concepts — Gate Smashers", url: "https://youtube.com/watch?v=bkSWJJZNgf8", type: "youtube", description: "OS playlist for beginners" },
      { title: "OS Notes — Tutorialspoint", url: "https://www.tutorialspoint.com/operating_system/index.htm", type: "article", description: "Complete OS reference" },
    ],
  },
  {
    name: "Database Management Systems",
    description: "SQL, normalization, ER models, transactions, and indexing.",
    icon: "database",
    resources: [
      { title: "DBMS Full Course — Jenny's Lectures", url: "https://youtube.com/watch?v=kBdlM6hNDAE", type: "youtube", description: "DBMS from scratch" },
      { title: "SQL Practice — W3Schools", url: "https://www.w3schools.com/sql/", type: "article", description: "Interactive SQL tutorial" },
      { title: "Normalization Explained", url: "https://www.geeksforgeeks.org/normal-forms-in-dbms/", type: "article", description: "1NF through BCNF explained" },
    ],
  },
  {
    name: "Computer Networks",
    description: "OSI model, TCP/IP, routing, subnetting, and network security.",
    icon: "globe",
    resources: [
      { title: "CN Full Course — Gate Smashers", url: "https://youtube.com/watch?v=JFF2vJaN0Cw", type: "youtube", description: "Computer Networks for exams" },
      { title: "Networking Basics — Cisco", url: "https://www.cisco.com/c/en/us/solutions/small-business/resource-center/networking/networking-basics.html", type: "article", description: "Official Cisco networking guide" },
    ],
  },
  {
    name: "Object-Oriented Programming",
    description: "Classes, inheritance, polymorphism, abstraction, and design patterns.",
    icon: "layers",
    resources: [
      { title: "OOP with Java — Telusko", url: "https://youtube.com/watch?v=bSrm9RXwBaI", type: "youtube", description: "Java OOP concepts" },
      { title: "SOLID Principles", url: "https://www.geeksforgeeks.org/solid-principle-in-programming-understand-with-real-life-examples/", type: "article", description: "SOLID with real-world examples" },
      { title: "Design Patterns Overview", url: "https://refactoring.guru/design-patterns", type: "article", description: "Visual guide to design patterns" },
    ],
  },
  {
    name: "Web Development",
    description: "HTML, CSS, JavaScript, React, Node.js, REST APIs, and full-stack development.",
    icon: "globe",
    resources: [
      { title: "Full Stack Web Dev — freeCodeCamp", url: "https://youtube.com/watch?v=nu_pCVPKzTk", type: "youtube", description: "Complete web dev course" },
      { title: "MDN Web Docs", url: "https://developer.mozilla.org/en-US/", type: "article", description: "Official web standards reference" },
      { title: "React Official Docs", url: "https://react.dev/", type: "article", description: "React documentation and tutorials" },
    ],
  },
  {
    name: "Python Programming",
    description: "Python basics, data types, file I/O, OOP in Python, and popular libraries.",
    icon: "code",
    resources: [
      { title: "Python for Beginners — Mosh", url: "https://youtube.com/watch?v=_uQrJ0TkZlc", type: "youtube", description: "Python tutorial for beginners" },
      { title: "Python Official Docs", url: "https://docs.python.org/3/tutorial/", type: "article", description: "Official Python 3 tutorial" },
    ],
  },
  {
    name: "Software Engineering",
    description: "SDLC, Agile, testing, version control, CI/CD, and project management.",
    icon: "settings",
    resources: [
      { title: "Software Engineering — Gate Smashers", url: "https://youtube.com/watch?v=uJrF9MNk1fw", type: "youtube", description: "SE concepts for exams" },
      { title: "Agile Manifesto", url: "https://agilemanifesto.org/", type: "article", description: "The original Agile principles" },
      { title: "Git & GitHub Crash Course", url: "https://youtube.com/watch?v=RGOj5yH7evk", type: "youtube", description: "Version control fundamentals" },
    ],
  },
];

// ─── 12 CSE Quizzes ───

function buildQuizzes(subjectMap) {
  return [
    {
      title: "Arrays & Linked Lists",
      description: "Test your knowledge of arrays, linked lists, and their operations.",
      subject: subjectMap["Data Structures & Algorithms"],
      difficulty: "easy",
      timeLimit: 10,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "What is the time complexity of accessing an element in an array by index?", options: ["O(n)", "O(1)", "O(log n)", "O(n²)"], correctAnswer: 1, explanation: "Array access by index is O(1) — constant time.", points: 1 },
        { question: "Which data structure uses LIFO ordering?", options: ["Queue", "Stack", "Linked List", "Tree"], correctAnswer: 1, explanation: "A Stack uses Last-In-First-Out (LIFO) ordering.", points: 1 },
        { question: "What is the worst-case time for inserting at the beginning of an array?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: 2, explanation: "All elements must be shifted right, taking O(n) time.", points: 1 },
        { question: "A singly linked list node contains:", options: ["Only data", "Data and one pointer", "Data and two pointers", "Only pointers"], correctAnswer: 1, explanation: "A singly linked list node has data and a pointer to the next node.", points: 1 },
        { question: "Which operation is O(1) in a linked list but O(n) in an array?", options: ["Access by index", "Search", "Insert at head", "Sort"], correctAnswer: 2, explanation: "Inserting at the head of a linked list is O(1) — just update the head pointer.", points: 1 },
      ],
    },
    {
      title: "Sorting & Searching Algorithms",
      description: "Merge sort, quick sort, binary search, and time complexity analysis.",
      subject: subjectMap["Data Structures & Algorithms"],
      difficulty: "medium",
      timeLimit: 12,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "What is the average time complexity of Quick Sort?", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correctAnswer: 1, explanation: "Quick Sort has O(n log n) average-case complexity.", points: 1 },
        { question: "Binary search requires the array to be:", options: ["Empty", "Sorted", "Reversed", "Circular"], correctAnswer: 1, explanation: "Binary search only works on sorted arrays.", points: 1 },
        { question: "Which sort is stable and has O(n log n) worst case?", options: ["Quick Sort", "Heap Sort", "Merge Sort", "Selection Sort"], correctAnswer: 2, explanation: "Merge Sort is stable and guarantees O(n log n) in all cases.", points: 1 },
        { question: "What is the space complexity of Merge Sort?", options: ["O(1)", "O(log n)", "O(n)", "O(n²)"], correctAnswer: 2, explanation: "Merge Sort needs O(n) extra space for merging.", points: 1 },
        { question: "How many comparisons does binary search make for n=1024?", options: ["10", "32", "100", "1024"], correctAnswer: 0, explanation: "Binary search makes log₂(1024) = 10 comparisons at most.", points: 1 },
      ],
    },
    {
      title: "Process Scheduling",
      description: "CPU scheduling algorithms, process states, and deadlocks.",
      subject: subjectMap["Operating Systems"],
      difficulty: "medium",
      timeLimit: 12,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "Which scheduling algorithm gives minimum average waiting time?", options: ["FCFS", "SJF", "Round Robin", "Priority"], correctAnswer: 1, explanation: "Shortest Job First (SJF) provides minimum average waiting time.", points: 1 },
        { question: "What are the four conditions for deadlock?", options: ["Mutex, hold/wait, no preemption, circular wait", "FIFO, LIFO, mutex, starvation", "Priority, aging, mutex, hold/wait", "None of the above"], correctAnswer: 0, explanation: "Coffman conditions: mutual exclusion, hold and wait, no preemption, circular wait.", points: 1 },
        { question: "In Round Robin scheduling, what determines the time slice?", options: ["Process priority", "Quantum/time slice", "Arrival time", "Burst time"], correctAnswer: 1, explanation: "Round Robin uses a fixed time quantum for each process.", points: 1 },
        { question: "A process in 'blocked' state is waiting for:", options: ["CPU time", "I/O completion", "Memory allocation", "Compilation"], correctAnswer: 1, explanation: "A blocked process is waiting for an I/O event to complete.", points: 1 },
        { question: "Thrashing occurs when:", options: ["CPU is idle", "Too many page faults happen", "Memory is empty", "Disk is full"], correctAnswer: 1, explanation: "Thrashing happens when excessive page faults degrade performance.", points: 1 },
      ],
    },
    {
      title: "SQL & Normalization",
      description: "SQL queries, joins, normalization forms, and database design.",
      subject: subjectMap["Database Management Systems"],
      difficulty: "easy",
      timeLimit: 10,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "Which SQL clause is used to filter rows?", options: ["SELECT", "WHERE", "GROUP BY", "ORDER BY"], correctAnswer: 1, explanation: "WHERE clause filters rows based on conditions.", points: 1 },
        { question: "What does the JOIN operation do?", options: ["Deletes rows", "Combines rows from two tables", "Creates a new table", "Sorts data"], correctAnswer: 1, explanation: "JOIN combines rows from two or more tables based on a related column.", points: 1 },
        { question: "A relation is in 2NF if it is in 1NF and:", options: ["Has no transitive dependencies", "Has no partial dependencies", "Has a primary key", "Is normalized"], correctAnswer: 1, explanation: "2NF requires 1NF + no partial dependency on any candidate key.", points: 1 },
        { question: "Which normal form eliminates transitive dependencies?", options: ["1NF", "2NF", "3NF", "BCNF"], correctAnswer: 2, explanation: "3NF eliminates transitive dependencies.", points: 1 },
        { question: "What does ACID stand for in transactions?", options: ["Atomicity, Consistency, Isolation, Durability", "Access, Control, Integrity, Data", "Add, Create, Insert, Delete", "None of the above"], correctAnswer: 0, explanation: "ACID: Atomicity, Consistency, Isolation, Durability.", points: 1 },
      ],
    },
    {
      title: "TCP/IP & OSI Model",
      description: "Network layers, protocols, and addressing.",
      subject: subjectMap["Computer Networks"],
      difficulty: "medium",
      timeLimit: 12,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "How many layers does the OSI model have?", options: ["4", "5", "6", "7"], correctAnswer: 3, explanation: "OSI has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.", points: 1 },
        { question: "Which protocol operates at the Transport layer?", options: ["HTTP", "IP", "TCP", "Ethernet"], correctAnswer: 2, explanation: "TCP (and UDP) operate at the Transport layer.", points: 1 },
        { question: "What is the purpose of ARP?", options: ["Route packets", "Map IP to MAC address", "Encrypt data", "Assign IP addresses"], correctAnswer: 1, explanation: "ARP (Address Resolution Protocol) maps IP addresses to MAC addresses.", points: 1 },
        { question: "A subnet mask of 255.255.255.0 means:", options: ["256 hosts", "254 usable hosts", "255 usable hosts", "1 host"], correctAnswer: 1, explanation: "/24 gives 256 IPs, but 2 are reserved (network + broadcast), so 254 usable.", points: 1 },
        { question: "Which protocol is connectionless?", options: ["TCP", "UDP", "FTP", "SSH"], correctAnswer: 1, explanation: "UDP is connectionless — no handshake or guaranteed delivery.", points: 1 },
      ],
    },
    {
      title: "OOP Fundamentals",
      description: "Encapsulation, inheritance, polymorphism, and abstraction.",
      subject: subjectMap["Object-Oriented Programming"],
      difficulty: "easy",
      timeLimit: 10,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "Which OOP concept hides internal details?", options: ["Inheritance", "Polymorphism", "Encapsulation", "Abstraction"], correctAnswer: 2, explanation: "Encapsulation hides the internal state and requires interaction through methods.", points: 1 },
        { question: "What is method overloading?", options: ["Same name, different parameters", "Same name, same parameters", "Overriding parent method", "Creating abstract methods"], correctAnswer: 0, explanation: "Overloading = same method name with different parameter lists.", points: 1 },
        { question: "Which keyword is used to inherit a class in Java?", options: ["implements", "extends", "inherits", "super"], correctAnswer: 1, explanation: "'extends' is used for class inheritance in Java.", points: 1 },
        { question: "An abstract class can:", options: ["Be instantiated", "Have both abstract and concrete methods", "Only have abstract methods", "Not be inherited"], correctAnswer: 1, explanation: "Abstract classes can have both abstract (unimplemented) and concrete (implemented) methods.", points: 1 },
        { question: "What is the diamond problem?", options: ["Circular dependency", "Ambiguity in multiple inheritance", "Null pointer exception", "Memory leak"], correctAnswer: 1, explanation: "The diamond problem is ambiguity when a class inherits from two classes with a common ancestor.", points: 1 },
      ],
    },
    {
      title: "Design Patterns",
      description: "Singleton, Factory, Observer, and other common design patterns.",
      subject: subjectMap["Object-Oriented Programming"],
      difficulty: "hard",
      timeLimit: 15,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "Singleton pattern ensures:", options: ["Multiple instances", "Exactly one instance", "No instances", "Lazy loading"], correctAnswer: 1, explanation: "Singleton ensures a class has exactly one instance with a global access point.", points: 1 },
        { question: "Factory pattern is used to:", options: ["Destroy objects", "Create objects without specifying exact class", "Copy objects", "Sort objects"], correctAnswer: 1, explanation: "Factory creates objects without exposing creation logic to the client.", points: 1 },
        { question: "Observer pattern implements:", options: ["One-to-one", "One-to-many dependency", "Many-to-many", "Circular dependency"], correctAnswer: 1, explanation: "Observer defines a one-to-many dependency — when one object changes, all dependents are notified.", points: 1 },
        { question: "Which pattern provides a simplified interface to a subsystem?", options: ["Adapter", "Facade", "Bridge", "Proxy"], correctAnswer: 1, explanation: "Facade provides a unified, simplified interface to a complex subsystem.", points: 1 },
        { question: "Strategy pattern allows:", options: ["Fixed algorithm", "Swapping algorithms at runtime", "Parallel execution", "Recursive calls"], correctAnswer: 1, explanation: "Strategy defines a family of algorithms and lets you switch between them at runtime.", points: 1 },
      ],
    },
    {
      title: "HTML, CSS & JavaScript Basics",
      description: "Web fundamentals, DOM, and basic JS concepts.",
      subject: subjectMap["Web Development"],
      difficulty: "easy",
      timeLimit: 10,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Hyper Transfer Markup Language", "Home Tool Markup Language"], correctAnswer: 0, explanation: "HTML = Hyper Text Markup Language.", points: 1 },
        { question: "Which CSS property changes text color?", options: ["font-color", "text-color", "color", "foreground"], correctAnswer: 2, explanation: "The 'color' property sets the text color in CSS.", points: 1 },
        { question: "What is the DOM?", options: ["A CSS framework", "Document Object Model", "A JavaScript library", "A database"], correctAnswer: 1, explanation: "DOM (Document Object Model) is the programming interface for HTML documents.", points: 1 },
        { question: "'let' and 'const' differ because:", options: ["let is faster", "const cannot be reassigned", "let is global", "const is for functions only"], correctAnswer: 1, explanation: "const declarations cannot be reassigned after initialization.", points: 1 },
        { question: "Which HTTP method is used to send form data?", options: ["GET", "POST", "PUT", "DELETE"], correctAnswer: 1, explanation: "POST is typically used to submit form data to a server.", points: 1 },
      ],
    },
    {
      title: "React & Node.js",
      description: "React components, hooks, Node.js basics, and REST APIs.",
      subject: subjectMap["Web Development"],
      difficulty: "medium",
      timeLimit: 12,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "React components are primarily written as:", options: ["Classes only", "Functions only", "Functions or classes", "Templates"], correctAnswer: 2, explanation: "React supports both function components and class components.", points: 1 },
        { question: "What hook manages state in functional components?", options: ["useEffect", "useState", "useRef", "useMemo"], correctAnswer: 1, explanation: "useState is the hook for managing state in functional React components.", points: 1 },
        { question: "Node.js runs JavaScript on:", options: ["Browser", "Server", "Mobile", "Database"], correctAnswer: 1, explanation: "Node.js is a JavaScript runtime for server-side execution.", points: 1 },
        { question: "REST API stands for:", options: ["Remote Execution Standard Transfer", "Representational State Transfer", "Real-time Event Streaming", "Resource State Transformation"], correctAnswer: 1, explanation: "REST = Representational State Transfer.", points: 1 },
        { question: "In Express.js, middleware functions have access to:", options: ["req only", "res only", "req, res, and next", "None"], correctAnswer: 2, explanation: "Express middleware has access to request, response, and the next function.", points: 1 },
      ],
    },
    {
      title: "Python Fundamentals",
      description: "Python data types, control flow, functions, and file handling.",
      subject: subjectMap["Python Programming"],
      difficulty: "easy",
      timeLimit: 10,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "What is the output of print(type([1, 2, 3]))?", options: ["<class 'tuple'>", "<class 'list'>", "<class 'set'>", "<class 'dict'>"], correctAnswer: 1, explanation: "[1, 2, 3] is a list in Python.", points: 1 },
        { question: "How do you create a dictionary in Python?", options: ["[]", "()", "{}", "< >"], correctAnswer: 2, explanation: "Dictionaries use curly braces: {'key': 'value'}.", points: 1 },
        { question: "What does 'len()' return for the string 'Hello'?", options: ["4", "5", "6", "Error"], correctAnswer: 1, explanation: "'Hello' has 5 characters.", points: 1 },
        { question: "Which keyword defines a function in Python?", options: ["function", "func", "def", "lambda"], correctAnswer: 2, explanation: "'def' is used to define functions in Python.", points: 1 },
        { question: "What does 'pip' do?", options: ["Compiles Python", "Installs packages", "Debugs code", "Formats code"], correctAnswer: 1, explanation: "pip is Python's package installer.", points: 1 },
      ],
    },
    {
      title: "SDLC & Agile Methodology",
      description: "Software development lifecycle, Agile, Scrum, and testing.",
      subject: subjectMap["Software Engineering"],
      difficulty: "easy",
      timeLimit: 10,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "What does SDLC stand for?", options: ["Software Development Life Cycle", "System Design Logic Control", "Software Deployment Launch Center", "Structured Data Link Connection"], correctAnswer: 0, explanation: "SDLC = Software Development Life Cycle.", points: 1 },
        { question: "In Scrum, a Sprint typically lasts:", options: ["1 day", "1-4 weeks", "3 months", "1 year"], correctAnswer: 1, explanation: "Scrum Sprints typically last 1 to 4 weeks.", points: 1 },
        { question: "Which testing checks individual units of code?", options: ["Integration testing", "System testing", "Unit testing", "Acceptance testing"], correctAnswer: 2, explanation: "Unit testing tests individual functions or methods in isolation.", points: 1 },
        { question: "The Waterfall model is:", options: ["Iterative", "Sequential", "Agile", "Random"], correctAnswer: 1, explanation: "Waterfall is a sequential model where each phase must complete before the next.", points: 1 },
        { question: "What is a User Story in Agile?", options: ["Technical documentation", "A short description of a feature from user perspective", "A bug report", "A test case"], correctAnswer: 1, explanation: "User stories describe features from the end user's perspective.", points: 1 },
      ],
    },
    {
      title: "Memory Management & Virtual Memory",
      description: "Paging, segmentation, page replacement, and virtual memory concepts.",
      subject: subjectMap["Operating Systems"],
      difficulty: "hard",
      timeLimit: 15,
      passingScore: 60,
      isPublished: true,
      questions: [
        { question: "In paging, physical memory is divided into:", options: ["Segments", "Frames", "Blocks", "Clusters"], correctAnswer: 1, explanation: "Physical memory is divided into fixed-size frames in paging.", points: 1 },
        { question: "Which page replacement algorithm is optimal?", options: ["FIFO", "LRU", "Optimal (Belady's)", "Random"], correctAnswer: 2, explanation: "Belady's Optimal replaces the page that won't be used for the longest time.", points: 1 },
        { question: "What is a page fault?", options: ["Hardware error", "Requested page not in memory", "Full disk", "Network error"], correctAnswer: 1, explanation: "A page fault occurs when a process accesses a page not currently in main memory.", points: 1 },
        { question: "Belady's anomaly can occur with:", options: ["LRU", "Optimal", "FIFO", "LFU"], correctAnswer: 2, explanation: "FIFO can show Belady's anomaly — more frames can cause more page faults.", points: 1 },
        { question: "TLB stands for:", options: ["Translation Lookaside Buffer", "Transfer Link Block", "Table Lookup Base", "Temporary Load Buffer"], correctAnswer: 0, explanation: "TLB = Translation Lookaside Buffer, a cache for page table entries.", points: 1 },
      ],
    },
  ];
}

// ─── Generate attempt ───

function generateAttempt(student, quiz, daysOffset) {
  const targetPct = randomBetween(40, 95);
  const correctCount = Math.round((targetPct / 100) * quiz.questions.length);
  const indices = quiz.questions.map((_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = randomBetween(0, i);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const correctSet = new Set(indices.slice(0, correctCount));

  let score = 0;
  const answers = quiz.questions.map((q, idx) => {
    const isCorrect = correctSet.has(idx);
    const selectedAnswer = isCorrect ? q.correctAnswer : ((q.correctAnswer + randomBetween(1, 3)) % q.options.length);
    const pointsEarned = isCorrect ? (q.points || 1) : 0;
    score += pointsEarned;
    return { questionId: q._id, selectedAnswer, isCorrect, pointsEarned };
  });

  const totalPoints = quiz.questions.reduce((s, q) => s + (q.points || 1), 0);
  const percentage = Math.round((score / totalPoints) * 100);
  const startedAt = daysAgo(daysOffset);
  const completedAt = new Date(startedAt.getTime() + randomBetween(180, 900) * 1000);

  return {
    user: student._id,
    quiz: quiz._id,
    answers,
    score,
    totalPoints,
    percentage,
    passed: percentage >= (quiz.passingScore || 60),
    timeTaken: Math.round((completedAt - startedAt) / 1000),
    startedAt,
    completedAt,
  };
}

// ─── Main ───

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(config.mongodbUri);
    console.log("Connected.\n");

    // ── 1. Clean everything except users ──
    console.log("Cleaning existing data (keeping users)...");
    await Promise.all([
      Subject.deleteMany({}),
      Quiz.deleteMany({}),
      QuizAttempt.deleteMany({}),
      Progress.deleteMany({}),
      Insight.deleteMany({}),
      Syllabus.deleteMany({}),
    ]);
    console.log("  Cleared subjects, quizzes, attempts, progress, insights, syllabuses.\n");

    // ── 2. Find/create users ──
    console.log("Finding existing users...");
    const existingTeacher = await User.findOne({ email: "yadav@teacher.edu.in" });
    const existingStudent = await User.findOne({ email: "yadav@student.edu.in" });
    if (!existingTeacher || !existingStudent) {
      console.error("ERROR: yadav@teacher.edu.in or yadav@student.edu.in not found.");
      return;
    }
    console.log(`  Teacher: ${existingTeacher.name}`);
    console.log(`  Student: ${existingStudent.name}\n`);

    console.log("Creating additional users...");
    const newStudents = [];
    for (const s of NEW_STUDENTS) {
      const existing = await User.findOne({ email: s.email });
      if (existing) { newStudents.push(existing); continue; }
      const user = await User.create({ name: s.name, email: s.email, password: "Yadav#1212", role: "student", avatar: s.avatar });
      console.log(`  Created: ${user.name}`);
      newStudents.push(user);
    }
    let newTeacher = await User.findOne({ email: NEW_TEACHER.email });
    if (!newTeacher) {
      newTeacher = await User.create({ name: NEW_TEACHER.name, email: NEW_TEACHER.email, password: "Yadav#1212", role: "teacher", avatar: NEW_TEACHER.avatar });
      console.log(`  Created: ${newTeacher.name}`);
    }
    console.log();

    const allStudents = [existingStudent, ...newStudents];
    const teacher = existingTeacher;

    // ── 3. Create 8 CSE subjects ──
    console.log("Creating subjects...");
    const subjects = [];
    for (let i = 0; i < SUBJECTS.length; i++) {
      const sd = SUBJECTS[i];
      const subject = await Subject.create({
        name: sd.name, description: sd.description, icon: sd.icon,
        level: 0, order: i, createdBy: teacher._id, resources: sd.resources,
      });
      console.log(`  ${subject.name} (${subject.resources.length} resources)`);
      subjects.push(subject);
    }
    console.log();

    const subjectMap = {};
    for (const s of subjects) subjectMap[s.name] = s._id;

    // ── 4. Create 12 quizzes ──
    console.log("Creating quizzes...");
    const quizzesData = buildQuizzes(subjectMap);
    const quizzes = [];
    for (const qd of quizzesData) {
      qd.createdBy = teacher._id;
      const quiz = await Quiz.create(qd);
      console.log(`  ${quiz.title} [${quiz.difficulty}] — ${quiz.questions.length} questions`);
      quizzes.push(quiz);
    }
    console.log();

    // ── 5. Create quiz attempts ──
    console.log("Creating quiz attempts...");
    const allAttempts = [];
    for (const student of allStudents) {
      const numAttempts = randomBetween(3, 5);
      const shuffled = [...quizzes].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numAttempts; i++) {
        const quiz = shuffled[i % shuffled.length];
        const attemptData = generateAttempt(student, quiz, randomBetween(1, 14));
        const attempt = await QuizAttempt.create(attemptData);
        allAttempts.push({ attempt, subjectId: quiz.subject });
        console.log(`  ${student.name} → ${quiz.title}: ${attempt.percentage}%${attempt.passed ? " ✓" : ""}`);
      }
    }
    console.log();

    // ── 6. Create progress records ──
    console.log("Creating progress records...");
    for (const student of allStudents) {
      const numSubjects = randomBetween(3, 5);
      const shuffled = [...subjects].sort(() => Math.random() - 0.5).slice(0, numSubjects);
      for (const subject of shuffled) {
        const studentAttempts = allAttempts.filter(
          (a) => a.attempt.user.toString() === student._id.toString() && a.subjectId.toString() === subject._id.toString()
        );
        const attemptIds = studentAttempts.map((a) => a.attempt._id);
        const completionRate = randomBetween(20, 80);

        let quizStats = { totalAttempts: 0, averageScore: 0, bestScore: 0, passedCount: 0 };
        if (studentAttempts.length > 0) {
          const pcts = studentAttempts.map((a) => a.attempt.percentage);
          quizStats = {
            totalAttempts: pcts.length,
            averageScore: Math.round(pcts.reduce((s, p) => s + p, 0) / pcts.length),
            bestScore: Math.max(...pcts),
            passedCount: studentAttempts.filter((a) => a.attempt.passed).length,
          };
        }

        const viewedResources = subject.resources
          .filter(() => Math.random() > 0.3)
          .map((r) => ({ resourceId: r._id, viewedAt: daysAgo(randomBetween(1, 14)) }));

        await Progress.create({
          user: student._id, subject: subject._id,
          completionRate, totalTimeSpent: randomBetween(1800, 14400),
          lastActivity: daysAgo(randomBetween(0, 7)),
          quizAttempts: attemptIds, quizStats, viewedResources,
        });
        console.log(`  ${student.name} → ${subject.name}: ${completionRate}%`);
      }
    }
    console.log();

    // ── 7. Enroll students ──
    console.log("Enrolling students...");
    for (const student of allStudents) {
      const numEnroll = randomBetween(3, 6);
      const enrollIds = [...subjects].sort(() => Math.random() - 0.5).slice(0, numEnroll).map((s) => s._id);
      await User.findByIdAndUpdate(student._id, { enrolledSubjects: enrollIds });
      console.log(`  ${student.name} → ${numEnroll} subjects`);
    }
    console.log();

    console.log("Seed completed successfully!");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

seed();
