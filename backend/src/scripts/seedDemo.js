/**
 * Demo data seeder — builds a full, realistic dataset for every role.
 *
 *   node src/scripts/seedDemo.js --yes            # wipe + seed the DB in MONGODB_URI
 *   node src/scripts/seedDemo.js --yes --no-yt    # skip YouTube lookups for AI recs
 *
 * WARNING: this DELETES every collection in the target database first.
 * Writes the demo logins to <repo>/demo-credentials.txt.
 *
 * Deterministic: a fixed PRNG seed means every run produces the same people,
 * scores and trends, so a demo script you rehearse keeps working.
 */
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const config = require("../config");
const { User, Subject, Quiz, QuizAttempt, Progress, Insight, Syllabus } = require("../models");
const { SUBJECTS: PUBLIC_SUBJECTS, buildQuizzes: buildPublicQuizzes } = require("../seed");

const DEMO_PASSWORD = "Demo@1234";
const args = process.argv.slice(2);
if (!args.includes("--yes")) {
  console.error("Refusing to run: this wipes the database. Re-run with --yes.");
  process.exit(1);
}
const USE_YOUTUBE = !args.includes("--no-yt");

// ─── Deterministic PRNG ───
let _s = 20261122;
const rand = () => ((_s = (_s * 1664525 + 1013904223) >>> 0) / 4294967296);
const between = (a, b) => Math.floor(rand() * (b - a + 1)) + a;
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const NOW = Date.now();
const DAY = 86400000;
const daysAgo = (d, hourMin = 8, hourMax = 22) => {
  const t = new Date(NOW - d * DAY);
  t.setHours(between(hourMin, hourMax), between(0, 59), between(0, 59), 0);
  const fallbackMin = between(5, 120); // always drawn so the PRNG sequence never depends on wall-clock time
  return t.getTime() > NOW ? new Date(NOW - fallbackMin * 60000) : t;
};

// ─── People ───
const ADMINS = [
  { name: "Aarav Malhotra", email: "admin@learninsight.in", avatar: "preset-8" },
  { name: "Kavya Reddy", email: "ops@learninsight.in", avatar: "preset-7" },
];

// Teachers + the private subjects they own. The first two keep the original demo emails.
const TEACHERS = [
  { name: "Yadav Rana", email: "yadav@teacher.edu.in", avatar: "preset-5", inviteCode: "TCH-YDV7", students: 18, subjects: ["Machine Learning", "Cloud Computing"] },
  { name: "Satwinder Kaur", email: "satwinder@teacher.edu.in", avatar: "preset-2", inviteCode: "TCH-STW4", students: 12, subjects: ["Cyber Security"] },
  { name: "Dr. Meera Iyer", email: "meera.iyer@teacher.edu.in", avatar: "preset-6", inviteCode: "TCH-MRA3", students: 12, subjects: ["Discrete Mathematics", "Theory of Computation"] },
  { name: "Prof. Rajesh Kumar", email: "rajesh.kumar@teacher.edu.in", avatar: "preset-4", inviteCode: "TCH-RJK8", students: 10, subjects: ["Computer Architecture"] },
  { name: "Dr. Ananya Sharma", email: "ananya.sharma@teacher.edu.in", avatar: "preset-3", inviteCode: "TCH-ANS6", students: 10, subjects: ["Artificial Intelligence"] },
  { name: "Prof. Harpreet Singh", email: "harpreet.singh@teacher.edu.in", avatar: "preset-1", inviteCode: "TCH-HPS2", students: 7, subjects: ["Compiler Design"] },
];

// Named students with fixed archetypes so the demo has predictable stories.
const SHOWCASE_STUDENTS = [
  { name: "Yadav Rana", email: "yadav@student.edu.in", avatar: "preset-5", archetype: "improving", teacher: 0 },
  { name: "Love Bhatti", email: "love@student.edu.in", avatar: "preset-1", archetype: "star", teacher: 0 },
  { name: "Gourav Sharma", email: "gourav@student.edu.in", avatar: "preset-3", archetype: "struggling", teacher: 0 },
  { name: "Shivam Verma", email: "shivam@student.edu.in", avatar: "preset-4", archetype: "declining", teacher: 0 },
  { name: "Riya Kapoor", email: "riya.kapoor@student.edu.in", avatar: "preset-6", archetype: "fresh", teacher: null },
];

const FIRST = ["Aditya", "Ishaan", "Vihaan", "Arjun", "Reyansh", "Kabir", "Dhruv", "Rohan", "Karan", "Nikhil", "Manav", "Siddharth", "Yash", "Tanmay", "Pranav", "Harsh", "Aryan", "Rahul", "Aman", "Jasleen", "Ananya", "Diya", "Saanvi", "Aanya", "Isha", "Meher", "Navya", "Priya", "Sneha", "Tanvi", "Simran", "Kritika", "Pooja", "Nandini", "Avni", "Mehak", "Kiara", "Gurleen", "Ritika", "Sakshi"];
const LAST = ["Sharma", "Verma", "Gupta", "Singh", "Patel", "Mehta", "Joshi", "Nair", "Reddy", "Iyer", "Chopra", "Malhotra", "Bansal", "Agarwal", "Saxena", "Kulkarni", "Desai", "Bhatia", "Sandhu", "Grewal", "Arora", "Khanna", "Pillai", "Menon", "Rao"];
const ARCHETYPES = ["star", "steady", "steady", "average", "average", "average", "struggling", "improving", "improving", "declining"];

// skill(t) where t∈[0,1] is 0 = oldest attempt, 1 = today
const SKILL = {
  star: (t) => 86 + 6 * t,
  steady: (t) => 72 + 4 * t,
  average: (t) => 60 + 6 * t,
  struggling: (t) => 38 + 8 * t,
  improving: (t) => 42 + 44 * t,
  declining: (t) => 84 - 34 * t,
  fresh: (t) => 65,
};

// ─── Teacher-owned private subjects + quizzes ───
const q = (question, options, correctAnswer, explanation) => ({ question, options, correctAnswer, explanation, points: 1 });

const PRIVATE_SUBJECTS = {
  "Machine Learning": {
    description: "Supervised & unsupervised learning, model evaluation, regularisation and neural networks.",
    icon: "cpu",
    resources: [
      { title: "scikit-learn User Guide", url: "https://scikit-learn.org/stable/user_guide.html", type: "article", description: "Reference for classic ML algorithms" },
      { title: "Google ML Crash Course", url: "https://developers.google.com/machine-learning/crash-course", type: "article", description: "Free fundamentals course" },
    ],
    quizzes: [
      { title: "ML Foundations", difficulty: "medium", timeLimit: 12, questions: [
        q("Which of these is a supervised learning task?", ["Clustering customers", "Predicting house prices", "Dimensionality reduction", "Anomaly detection without labels"], 1, "Regression on labelled prices is supervised."),
        q("High training accuracy but low test accuracy indicates:", ["Underfitting", "Overfitting", "Data leakage is impossible", "Perfect generalisation"], 1, "The model memorised the training data."),
        q("L2 regularisation adds a penalty proportional to:", ["Sum of absolute weights", "Sum of squared weights", "Number of features", "Learning rate"], 1, "Ridge/L2 penalises squared weights."),
        q("Which metric is most useful on a heavily imbalanced classification dataset?", ["Accuracy", "F1-score", "Mean squared error", "R²"], 1, "F1 balances precision and recall."),
        q("k in k-fold cross validation refers to:", ["Number of neighbours", "Number of data partitions", "Number of epochs", "Number of features"], 1, "Data is split into k folds."),
        q("Gradient descent updates weights in the direction of:", ["The gradient", "The negative gradient", "Random noise", "The largest weight"], 1, "We move against the gradient to minimise loss."),
      ] },
      { title: "Neural Networks Basics (AI-generated)", difficulty: "hard", timeLimit: 15, ai: true, questions: [
        q("Which activation function outputs values in (0, 1)?", ["ReLU", "Sigmoid", "Tanh", "Linear"], 1, "Sigmoid squashes inputs to (0,1)."),
        q("Backpropagation computes gradients using:", ["The chain rule", "Bayes' theorem", "Fourier transform", "Dynamic programming over inputs"], 0, "It applies the chain rule layer by layer."),
        q("Dropout is primarily used to:", ["Speed up inference", "Reduce overfitting", "Increase model size", "Normalise inputs"], 1, "Randomly dropping units regularises the network."),
        q("The vanishing gradient problem is most associated with:", ["Deep networks with sigmoid activations", "Linear regression", "Decision trees", "k-means"], 0, "Sigmoid derivatives shrink gradients through many layers."),
        q("A convolutional layer is best suited for:", ["Tabular data", "Image data", "Graph databases", "Sorting"], 1, "Convolutions exploit spatial locality."),
      ] },
    ],
  },
  "Cloud Computing": {
    description: "IaaS/PaaS/SaaS, virtualisation, containers, autoscaling and cloud-native design.",
    icon: "globe",
    resources: [
      { title: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/", type: "article", description: "Pillars of good cloud design" },
      { title: "Kubernetes Concepts", url: "https://kubernetes.io/docs/concepts/", type: "article", description: "Official K8s docs" },
    ],
    quizzes: [
      { title: "Cloud Service Models", difficulty: "easy", timeLimit: 10, questions: [
        q("Gmail is an example of:", ["IaaS", "PaaS", "SaaS", "On-premise"], 2, "End users consume the finished software."),
        q("Which model gives you raw VMs, storage and networking?", ["SaaS", "PaaS", "IaaS", "FaaS"], 2, "Infrastructure as a Service."),
        q("Horizontal scaling means:", ["Adding more machines", "Adding more RAM to one machine", "Reducing traffic", "Changing regions"], 0, "Scale out by adding instances."),
        q("A container differs from a VM in that it:", ["Includes a full guest OS", "Shares the host kernel", "Cannot be networked", "Requires a hypervisor"], 1, "Containers share the host OS kernel."),
        q("Serverless functions are billed primarily by:", ["Reserved hours", "Execution time and invocations", "Disk size", "Number of developers"], 1, "You pay per invocation/duration."),
      ] },
    ],
  },
  "Cyber Security": {
    description: "CIA triad, cryptography, web vulnerabilities, authentication and network defence.",
    icon: "settings",
    resources: [
      { title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", type: "article", description: "Most critical web app risks" },
      { title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", type: "article", description: "Free hands-on labs" },
    ],
    quizzes: [
      { title: "Security Fundamentals", difficulty: "medium", timeLimit: 12, questions: [
        q("The 'A' in the CIA triad stands for:", ["Authentication", "Availability", "Authorisation", "Auditing"], 1, "Confidentiality, Integrity, Availability."),
        q("SQL injection is best prevented by:", ["Hiding error messages", "Parameterised queries", "Using HTTPS", "Longer passwords"], 1, "Parameters keep data separate from SQL code."),
        q("Which is an asymmetric algorithm?", ["AES", "RSA", "DES", "Blowfish"], 1, "RSA uses public/private key pairs."),
        q("Storing passwords securely requires:", ["Base64 encoding", "A slow salted hash like bcrypt", "MD5", "Reversible encryption"], 1, "Slow salted hashes resist brute force."),
        q("XSS attacks inject malicious:", ["SQL", "Client-side scripts", "Firmware", "DNS records"], 1, "Cross-site scripting runs attacker JS in the victim's browser."),
        q("A firewall primarily:", ["Encrypts disks", "Filters network traffic by rules", "Scans for viruses in email", "Backs up data"], 1, "It allows/denies traffic based on rules."),
      ] },
    ],
  },
  "Discrete Mathematics": {
    description: "Logic, sets, relations, combinatorics, graph theory and proofs.",
    icon: "layers",
    resources: [
      { title: "MIT 6.042J Mathematics for CS", url: "https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/", type: "article", description: "Full MIT OCW course" },
    ],
    quizzes: [
      { title: "Logic & Combinatorics", difficulty: "medium", timeLimit: 15, questions: [
        q("p → q is logically equivalent to:", ["¬p ∨ q", "p ∧ ¬q", "¬q → p", "q → p"], 0, "Implication equals ¬p ∨ q."),
        q("How many subsets does a set with 5 elements have?", ["10", "25", "32", "120"], 2, "2⁵ = 32."),
        q("The number of ways to arrange 4 distinct books on a shelf is:", ["4", "16", "24", "256"], 2, "4! = 24."),
        q("A relation that is reflexive, symmetric and transitive is:", ["A partial order", "An equivalence relation", "A function", "A lattice"], 1, "That's the definition of equivalence."),
        q("C(6, 2) equals:", ["12", "15", "30", "36"], 1, "6·5/2 = 15."),
      ] },
      { title: "Graph Theory (AI-generated)", difficulty: "hard", timeLimit: 15, ai: true, draft: true, questions: [
        q("The sum of degrees of all vertices in a graph equals:", ["Number of edges", "Twice the number of edges", "Number of vertices", "Edges squared"], 1, "Handshaking lemma."),
        q("A tree with n vertices has how many edges?", ["n", "n − 1", "n + 1", "2n"], 1, "Trees are minimally connected."),
        q("A graph has an Euler circuit iff it is connected and:", ["Every vertex has even degree", "It is bipartite", "It has no cycles", "It is complete"], 0, "Euler's theorem."),
        q("The chromatic number of a bipartite graph with at least one edge is:", ["1", "2", "3", "Depends on size"], 1, "Two colours suffice."),
      ] },
    ],
  },
  "Theory of Computation": {
    description: "Automata, regular languages, context-free grammars, Turing machines and decidability.",
    icon: "code",
    resources: [
      { title: "Stanford CS103 Notes", url: "https://web.stanford.edu/class/cs103/", type: "article", description: "Mathematical foundations of computing" },
    ],
    quizzes: [
      { title: "Automata & Languages", difficulty: "hard", timeLimit: 15, questions: [
        q("Which machine recognises exactly the regular languages?", ["Pushdown automaton", "Finite automaton", "Turing machine", "Linear bounded automaton"], 1, "DFAs/NFAs ⇔ regular languages."),
        q("The language {aⁿbⁿ | n ≥ 0} is:", ["Regular", "Context-free but not regular", "Not context-free", "Finite"], 1, "Needs a stack, not finite memory."),
        q("The pumping lemma is used to prove a language is:", ["Regular", "Not regular", "Decidable", "Finite"], 1, "It's a tool for proving non-regularity."),
        q("The halting problem is:", ["Decidable", "Undecidable", "Regular", "In P"], 1, "Turing proved it undecidable."),
        q("Every NFA can be converted to an equivalent:", ["PDA only", "DFA", "Regular grammar only with ε-loops", "Turing machine only"], 1, "Subset construction."),
      ] },
    ],
  },
  "Computer Architecture": {
    description: "Instruction sets, pipelining, caches, memory hierarchy and parallelism.",
    icon: "cpu",
    resources: [
      { title: "Nand2Tetris", url: "https://www.nand2tetris.org/", type: "article", description: "Build a computer from first principles" },
    ],
    quizzes: [
      { title: "Pipelining & Caches", difficulty: "medium", timeLimit: 12, questions: [
        q("A data hazard occurs when:", ["An instruction depends on a previous result not yet available", "The cache is full", "Two programs share memory", "The clock is too slow"], 0, "RAW dependencies cause data hazards."),
        q("Which is fastest?", ["L1 cache", "L3 cache", "Main memory", "SSD"], 0, "L1 sits closest to the core."),
        q("Temporal locality means:", ["Nearby addresses are used together", "Recently used data is likely reused soon", "Data is stored in time order", "Caches expire over time"], 1, "Reuse in time."),
        q("A 5-stage pipeline ideally improves throughput by up to:", ["2×", "5×", "10×", "25×"], 1, "One instruction per stage in flight."),
        q("RISC architectures typically have:", ["Variable-length complex instructions", "Simple fixed-length instructions", "No registers", "Microcode for every instruction"], 1, "Simplicity enables pipelining."),
      ] },
    ],
  },
  "Artificial Intelligence": {
    description: "Search, heuristics, knowledge representation, planning and probabilistic reasoning.",
    icon: "cpu",
    resources: [
      { title: "AIMA — Russell & Norvig", url: "https://aima.cs.berkeley.edu/", type: "article", description: "Companion site for the classic textbook" },
    ],
    quizzes: [
      { title: "Search & Reasoning", difficulty: "medium", timeLimit: 12, questions: [
        q("A* search is optimal when the heuristic is:", ["Admissible", "Random", "Always zero", "Overestimating"], 0, "Admissible heuristics never overestimate."),
        q("BFS on an unweighted graph finds:", ["The deepest node", "The shortest path in edges", "A random path", "A minimum spanning tree"], 1, "BFS explores level by level."),
        q("Minimax is used in:", ["Two-player adversarial games", "Sorting", "Clustering", "Database indexing"], 0, "It models an opponent minimising your score."),
        q("Alpha-beta pruning:", ["Changes the minimax result", "Skips branches that can't affect the decision", "Only works on trees of depth 1", "Requires a heuristic of zero"], 1, "Same answer, fewer nodes."),
        q("Bayes' theorem relates:", ["P(A|B) to P(B|A)", "Mean to median", "Entropy to energy", "Depth to breadth"], 0, "P(A|B) = P(B|A)P(A)/P(B)."),
      ] },
    ],
  },
  "Compiler Design": {
    description: "Lexing, parsing, semantic analysis, intermediate code and optimisation.",
    icon: "code",
    resources: [
      { title: "Crafting Interpreters", url: "https://craftinginterpreters.com/", type: "article", description: "Build a language end to end" },
    ],
    quizzes: [
      { title: "Lexing & Parsing", difficulty: "hard", timeLimit: 12, questions: [
        q("The lexer converts source code into:", ["Machine code", "Tokens", "An AST directly", "Bytecode"], 1, "Lexical analysis produces tokens."),
        q("LL(1) parsers are:", ["Bottom-up", "Top-down", "Random", "Only for regular languages"], 1, "Left-to-right, leftmost derivation."),
        q("Left recursion is a problem for:", ["LR parsers", "Recursive-descent parsers", "Lexers", "Linkers"], 1, "It causes infinite recursion top-down."),
        q("Constant folding is an example of:", ["Parsing", "Optimisation", "Lexing", "Linking"], 1, "Evaluates constant expressions at compile time."),
        q("A symbol table stores:", ["Tokens only", "Identifiers and their attributes", "Machine registers", "Comments"], 1, "Names, types, scopes."),
      ] },
    ],
  },
};

const SYLLABUS_TOPICS = {
  "Machine Learning": [
    { topic: "Supervised Learning", subtopics: ["Linear & logistic regression", "Decision trees", "SVMs", "Bias–variance trade-off"] },
    { topic: "Unsupervised Learning", subtopics: ["k-means", "Hierarchical clustering", "PCA"] },
    { topic: "Neural Networks", subtopics: ["Perceptron", "Backpropagation", "Activation functions", "Regularisation & dropout"] },
    { topic: "Model Evaluation", subtopics: ["Cross-validation", "Precision / recall / F1", "ROC-AUC"] },
  ],
  "Cloud Computing": [
    { topic: "Service Models", subtopics: ["IaaS", "PaaS", "SaaS", "Serverless"] },
    { topic: "Virtualisation & Containers", subtopics: ["Hypervisors", "Docker", "Kubernetes basics"] },
    { topic: "Scalability", subtopics: ["Load balancing", "Autoscaling", "CDNs"] },
  ],
  "Discrete Mathematics": [
    { topic: "Logic", subtopics: ["Propositional logic", "Predicates & quantifiers", "Proof techniques"] },
    { topic: "Combinatorics", subtopics: ["Permutations", "Combinations", "Pigeonhole principle"] },
    { topic: "Graph Theory", subtopics: ["Trees", "Euler & Hamilton paths", "Graph colouring"] },
  ],
  "Cyber Security": [
    { topic: "Foundations", subtopics: ["CIA triad", "Threat modelling", "Risk"] },
    { topic: "Cryptography", subtopics: ["Symmetric ciphers", "Public-key crypto", "Hashing"] },
    { topic: "Web Security", subtopics: ["SQL injection", "XSS", "CSRF", "Authentication"] },
  ],
};

const syllabusText = (name, topics) =>
  `${name} — Course Syllabus\n\n` +
  topics.map((t, i) => `Unit ${i + 1}: ${t.topic}\n` + t.subtopics.map((s) => `  - ${s}`).join("\n")).join("\n\n") +
  `\n\nAssessment: weekly quizzes (40%), mid-term (20%), final project (40%).`;

// ─── Attempt simulation ───
const DIFF_ADJ = { easy: 10, medium: 0, hard: -12 };

function simulateAttempt(student, quiz, when, skillAt) {
  const p = clamp((skillAt + DIFF_ADJ[quiz.difficulty] + student.subjectBias[quiz.subject.toString()] + (rand() - 0.5) * 18) / 100, 0.05, 0.98);
  let score = 0;
  const answers = quiz.questions.map((qq) => {
    const isCorrect = rand() < p;
    const selectedAnswer = isCorrect ? qq.correctAnswer : (qq.correctAnswer + between(1, qq.options.length - 1)) % qq.options.length;
    const pointsEarned = isCorrect ? qq.points || 1 : 0;
    score += pointsEarned;
    return { questionId: qq._id, selectedAnswer, isCorrect, pointsEarned };
  });
  const totalPoints = quiz.totalPoints || quiz.questions.length;
  const percentage = Math.round((score / totalPoints) * 100);
  const limitSec = (quiz.timeLimit || 15) * 60;
  const timeTaken = between(Math.round(limitSec * 0.3), Math.round(limitSec * 0.95));
  return {
    user: student.user._id, quiz: quiz._id, answers, score, totalPoints, percentage,
    passed: percentage >= (quiz.passingScore || 60), timeTaken,
    startedAt: new Date(when.getTime() - timeTaken * 1000), completedAt: when,
    createdAt: when, updatedAt: when,
  };
}

// ─── Insight builder (mirrors insight.controller logic, with templated AI copy) ───
function severity(avg) { return avg < 40 ? "high" : avg < 60 ? "medium" : "low"; }

function buildInsightDoc(userId, progressRows, subjectsById, ytBySubject, generatedAt) {
  const weakAreas = [];
  const strengths = [];
  for (const p of progressRows) {
    if (p.quizStats.totalAttempts < 2) continue;
    const avg = p.quizStats.averageScore;
    if (avg < 60) {
      weakAreas.push({
        subject: p.subject, severity: severity(avg), averageScore: avg,
        reason: avg < 40 ? "Struggling significantly with quiz assessments" : p.quizStats.passedCount === 0 ? "Has not passed any quizzes yet" : p.completionRate < 50 ? "Low completion rate may affect understanding" : "Quiz scores below passing threshold",
        suggestedAction: p.completionRate < 50 ? "Complete more learning material before attempting quizzes" : avg < 40 ? "Review fundamentals and practice with easier questions" : "Practice more quizzes and review incorrect answers",
      });
    } else if (avg >= 80) {
      strengths.push({ subject: p.subject, reason: `Consistently scoring ${avg}% average`, averageScore: avg });
    }
  }
  const order = { high: 0, medium: 1, low: 2 };
  weakAreas.sort((a, b) => order[a.severity] - order[b.severity]);

  const withQ = progressRows.filter((p) => p.quizStats.totalAttempts > 0);
  const overallStats = {
    totalSubjects: progressRows.length,
    averageCompletionRate: Math.round(progressRows.reduce((s, p) => s + p.completionRate, 0) / Math.max(1, progressRows.length)),
    averageQuizScore: withQ.length ? Math.round(withQ.reduce((s, p) => s + p.quizStats.averageScore, 0) / withQ.length) : 0,
    totalTimeSpent: progressRows.reduce((s, p) => s + p.totalTimeSpent, 0),
  };

  const nameOf = (id) => subjectsById[id.toString()].name;
  const strongNames = strengths.slice(0, 2).map((s) => nameOf(s.subject));
  const weakNames = weakAreas.slice(0, 2).map((w) => nameOf(w.subject));
  let aiSummary = `You are averaging ${overallStats.averageQuizScore}% across ${overallStats.totalSubjects} subjects with ${overallStats.averageCompletionRate}% average completion. `;
  if (strongNames.length) aiSummary += `Your strongest areas are ${strongNames.join(" and ")}, where your scores show solid conceptual understanding. `;
  if (weakNames.length) aiSummary += `${weakNames.join(" and ")} ${weakNames.length > 1 ? "need" : "needs"} attention — revisit the core concepts before attempting harder quizzes, and review the explanations for questions you missed. `;
  else aiSummary += "There are no major weak spots right now — try harder quizzes to keep stretching yourself. ";
  aiSummary += "Short, regular practice sessions will help these gains stick.";

  const recommendations = [];
  for (const w of weakAreas.slice(0, 3)) {
    const subj = subjectsById[w.subject.toString()];
    for (const r of subj.resources.slice(0, 2)) {
      recommendations.push({ title: r.title, url: r.url, type: r.type === "course" ? "course" : r.type, relevance: clamp(Math.round(90 - w.averageScore), 10, 100), relatedSubject: subj._id, isAIGenerated: false, description: `Recommended for improving ${subj.name}` });
    }
    const vid = ytBySubject[subj.name];
    if (vid) {
      recommendations.push({ title: vid.title, url: vid.url, type: "youtube", relevance: clamp(between(80, 96), 0, 100), relatedSubject: subj._id, isAIGenerated: true, description: `A focused walkthrough of the ${subj.name} concepts you scored lowest on.` });
    }
  }

  return { user: userId, weakAreas, strengths, recommendations, aiSummary, overallStats, generatedAt, isViewed: rand() < 0.6, createdAt: generatedAt, updatedAt: generatedAt };
}

async function resolveYouTube(subjectNames) {
  const out = {};
  if (!USE_YOUTUBE) return out;
  const yt = require("../services/youtube.service");
  for (const name of subjectNames) {
    try {
      const vids = await yt.searchVideos({ query: `${name} full lecture for computer science students`, maxResults: 1 });
      if (vids && vids[0]) out[name] = { title: vids[0].title, url: vids[0].url };
    } catch (e) {
      console.log(`  (YouTube lookup failed for ${name}: ${e.message}) — skipping AI video recs`);
      return out;
    }
  }
  return out;
}

// ─── Main ───
async function main() {
  const uri = config.mongodbUri;
  console.log(`Target: ${uri.replace(/\/\/[^@]*@/, "//***@")}`);
  await mongoose.connect(uri);
  console.log(`Connected to database "${mongoose.connection.name}". Wiping...`);
  await Promise.all([User, Subject, Quiz, QuizAttempt, Progress, Insight, Syllabus].map((M) => M.deleteMany({})));
  await Promise.all([User, Subject, Quiz, QuizAttempt, Progress, Insight, Syllabus].map((M) => M.syncIndexes()));

  const creds = { admin: [], teacher: [], student: [] };
  const mkUser = async (data) => {
    const u = await User.create({ ...data, password: DEMO_PASSWORD, createdAt: data.createdAt || daysAgo(between(130, 200)) });
    creds[u.role].push(u);
    return u;
  };

  // Admins
  for (const a of ADMINS) await mkUser({ ...a, role: "admin", createdAt: daysAgo(240) });
  const admin = creds.admin[0];

  // Teachers
  const teachers = [];
  for (const t of TEACHERS) teachers.push(await mkUser({ name: t.name, email: t.email, avatar: t.avatar, role: "teacher", inviteCode: t.inviteCode, createdAt: daysAgo(between(180, 220)) }));
  console.log(`Users: ${creds.admin.length} admins, ${teachers.length} teachers`);

  // Public library (owned by admin, visible to everyone)
  const subjects = [];
  for (let i = 0; i < PUBLIC_SUBJECTS.length; i++) {
    const s = PUBLIC_SUBJECTS[i];
    subjects.push(await Subject.create({ ...s, level: 0, order: i, createdBy: admin._id, visibility: "public", createdAt: daysAgo(200) }));
  }
  const subjMap = Object.fromEntries(subjects.map((s) => [s.name, s._id]));
  const quizzes = [];
  for (const qd of buildPublicQuizzes(subjMap)) {
    quizzes.push(await Quiz.create({ ...qd, createdBy: admin._id, visibility: "public", isPublished: true, createdAt: daysAgo(between(150, 190)) }));
  }

  // Teacher private subjects, quizzes, syllabi
  let order = subjects.length;
  for (let ti = 0; ti < TEACHERS.length; ti++) {
    const teacher = teachers[ti];
    for (const name of TEACHERS[ti].subjects) {
      const def = PRIVATE_SUBJECTS[name];
      const subj = await Subject.create({ name, description: def.description, icon: def.icon, resources: def.resources, level: 0, order: order++, createdBy: teacher._id, visibility: "private", createdAt: daysAgo(between(120, 160)) });
      subjects.push(subj);
      const generated = [];
      for (const qz of def.quizzes) {
        const quiz = await Quiz.create({
          title: qz.title, description: `${qz.ai ? "Generated from the course syllabus. " : ""}Covers key ${name} concepts.`,
          subject: subj._id, questions: qz.questions, createdBy: teacher._id, isAIGenerated: !!qz.ai,
          difficulty: qz.difficulty, timeLimit: qz.timeLimit, passingScore: 60, showAnswers: true,
          isPublished: !qz.draft, visibility: "private", createdAt: daysAgo(between(100, 130)),
        });
        quizzes.push(quiz);
        if (qz.ai) generated.push(quiz._id);
      }
      if (SYLLABUS_TOPICS[name]) {
        await Syllabus.create({
          user: teacher._id, subject: subj._id, title: `${name} — Semester Syllabus`, content: syllabusText(name, SYLLABUS_TOPICS[name]),
          fileName: `${name.toLowerCase().replace(/\s+/g, "-")}-syllabus.pdf`, fileType: "pdf",
          extractedTopics: SYLLABUS_TOPICS[name], generatedQuizzes: generated, status: "completed", uploadedAt: daysAgo(between(110, 125)),
        });
      }
    }
  }
  // A couple of public subjects get teacher-uploaded syllabi too
  await Syllabus.create({
    user: teachers[0]._id, subject: subjMap["Web Development"], title: "Full-Stack Web Development — Unit Plan", fileType: "docx", fileName: "web-dev-unit-plan.docx", status: "pending",
    content: "Unit 1: HTML & semantic markup\nUnit 2: CSS layout (Flexbox, Grid)\nUnit 3: JavaScript & the DOM\nUnit 4: React components, state and hooks\nUnit 5: Node.js, Express and REST APIs\nUnit 6: MongoDB & Mongoose",
  });
  const subjectsById = Object.fromEntries(subjects.map((s) => [s._id.toString(), s]));
  console.log(`Content: ${subjects.length} subjects, ${quizzes.length} quizzes`);

  // Students
  const students = [];
  const usedEmails = new Set();
  for (const s of SHOWCASE_STUDENTS) {
    const u = await mkUser({ name: s.name, email: s.email, avatar: s.avatar, role: "student", teacher: s.teacher === null ? null : teachers[s.teacher]._id, createdAt: s.archetype === "fresh" ? daysAgo(3) : daysAgo(between(120, 150)) });
    usedEmails.add(s.email);
    students.push({ user: u, archetype: s.archetype, teacherIdx: s.teacher });
  }
  const slots = [];
  TEACHERS.forEach((t, i) => { const already = SHOWCASE_STUDENTS.filter((s) => s.teacher === i).length; for (let k = already; k < t.students; k++) slots.push(i); });
  for (let k = 0; k < 4; k++) slots.push(null); // unattached students
  for (const tIdx of slots) {
    let name, email;
    do { name = `${pick(FIRST)} ${pick(LAST)}`; email = `${name.toLowerCase().replace(/\s+/g, ".")}@student.edu.in`; } while (usedEmails.has(email));
    usedEmails.add(email);
    const archetype = tIdx === null ? pick(["average", "steady", "fresh"]) : pick(ARCHETYPES);
    const u = await mkUser({ name, email, avatar: `preset-${between(1, 8)}`, role: "student", teacher: tIdx === null ? null : teachers[tIdx]._id, isActive: rand() > 0.04, createdAt: daysAgo(between(30, 160)) });
    students.push({ user: u, archetype, teacherIdx: tIdx });
  }
  console.log(`Students: ${students.length}`);

  // Attempts, progress, insights
  const ytBySubject = await resolveYouTube(subjects.map((s) => s.name));
  if (USE_YOUTUBE) console.log(`YouTube: resolved ${Object.keys(ytBySubject).length} lecture videos for AI recommendations`);

  const attemptDocs = [];
  const progressDocs = [];
  const insightDocs = [];
  for (const st of students) {
    const teacherId = st.teacherIdx === null ? null : teachers[st.teacherIdx]._id.toString();
    const visible = quizzes.filter((qz) => qz.isPublished && (qz.visibility === "public" || (teacherId && qz.createdBy.toString() === teacherId)));
    st.subjectBias = Object.fromEntries(subjects.map((s) => [s._id.toString(), between(-14, 14)]));
    // Teacher's own subjects get a little focus boost (students study what's assigned)
    const ownSubjects = [...new Set(visible.filter((qz) => qz.visibility === "private").map((qz) => qz.subject.toString()))];
    const focusSubjects = shuffle([...new Set(visible.map((qz) => qz.subject.toString()))]).slice(0, between(4, 6));
    const studySubjects = [...new Set([...ownSubjects, ...focusSubjects])];
    const pool = visible.filter((qz) => studySubjects.includes(qz.subject.toString()));

    const isFresh = st.archetype === "fresh";
    const span = isFresh ? 0 : Math.min(120, Math.floor((NOW - st.user.createdAt.getTime()) / DAY) - 1);
    const nAttempts = isFresh ? 0 : st.user.isActive ? between(14, 34) : between(3, 6);
    const lastActive = st.user.isActive ? between(0, st.archetype === "declining" ? 9 : 4) : between(20, 40);
    const times = Array.from({ length: nAttempts }, () => between(lastActive, Math.max(lastActive + 1, span))).sort((a, b) => b - a);
    if (nAttempts) times[times.length - 1] = lastActive; // guarantee recent activity
    // Engaged learners get a visible daily streak ending today
    if (st.user.isActive && ["star", "improving", "steady"].includes(st.archetype) && nAttempts >= 8) {
      const streak = st.archetype === "steady" ? 3 : 5;
      for (let k = 0; k < streak; k++) times[times.length - 1 - k] = k;
    }

    const perSubject = {};
    times.forEach((d, idx) => {
      const quiz = pick(pool);
      const t = nAttempts > 1 ? idx / (nAttempts - 1) : 1;
      const a = simulateAttempt(st, quiz, daysAgo(d), SKILL[st.archetype](t));
      a._id = new mongoose.Types.ObjectId();
      attemptDocs.push(a);
      (perSubject[quiz.subject.toString()] ||= []).push(a);
    });

    const rows = [];
    for (const sid of studySubjects) {
      const atts = perSubject[sid] || [];
      if (!atts.length && (isFresh || rand() < 0.5)) continue;
      const pcts = atts.map((a) => a.percentage);
      const avg = pcts.length ? Math.round(pcts.reduce((s, v) => s + v, 0) / pcts.length) : 0;
      const subj = subjectsById[sid];
      const lastAct = atts.length ? atts[atts.length - 1].completedAt : daysAgo(between(5, 30));
      const row = {
        user: st.user._id, subject: subj._id,
        completionRate: clamp(Math.round(atts.length * 9 + avg * 0.45 + between(-10, 10)), 5, 100),
        totalTimeSpent: atts.reduce((s, a) => s + a.timeTaken, 0) + between(1200, 4 * 3600) * Math.max(1, atts.length / 3),
        lastActivity: lastAct, quizAttempts: atts.map((a) => a._id),
        quizStats: { totalAttempts: atts.length, averageScore: avg, bestScore: pcts.length ? Math.max(...pcts) : 0, passedCount: atts.filter((a) => a.passed).length },
        viewedResources: subj.resources.filter(() => rand() > 0.35).map((r) => ({ resourceId: r._id, viewedAt: daysAgo(between(lastActive, lastActive + 20)) })),
        notes: rand() < 0.2 ? "Revise this before the mid-term." : "",
        createdAt: atts.length ? atts[0].completedAt : lastAct,
      };
      row.totalTimeSpent = Math.round(row.totalTimeSpent);
      rows.push(row);
    }
    progressDocs.push(...rows);
    await User.updateOne({ _id: st.user._id }, { enrolledSubjects: rows.map((r) => r.subject) });

    // Insight history: an older snapshot plus a recent one for active students
    if (rows.some((r) => r.quizStats.totalAttempts >= 2) && st.user.isActive) {
      if (rand() < 0.7) insightDocs.push(buildInsightDoc(st.user._id, rows.map((r) => ({ ...r, quizStats: { ...r.quizStats, averageScore: clamp(r.quizStats.averageScore + (st.archetype === "improving" ? -15 : st.archetype === "declining" ? 12 : between(-6, 6)), 0, 100) } })), subjectsById, ytBySubject, daysAgo(between(25, 45))));
      insightDocs.push(buildInsightDoc(st.user._id, rows, subjectsById, ytBySubject, daysAgo(between(0, 3))));
    }
  }

  await QuizAttempt.insertMany(attemptDocs, { timestamps: false });
  await Progress.insertMany(progressDocs);
  await Insight.insertMany(insightDocs, { timestamps: false });
  console.log(`Activity: ${attemptDocs.length} attempts, ${progressDocs.length} progress rows, ${insightDocs.length} insights`);

  writeCredentials(creds, students, teachers);
  await mongoose.disconnect();
  console.log("Done.");
}

function writeCredentials(creds, students, teachers) {
  const out = path.resolve(__dirname, "../../../demo-credentials.txt");
  const line = (u, extra = "") => `  ${u.email.padEnd(40)} ${DEMO_PASSWORD.padEnd(12)} ${u.name}${extra}`;
  const byTeacher = (tid) => students.filter((s) => s.user.teacher && s.user.teacher.toString() === tid.toString());
  const story = { star: "top performer", steady: "consistent", average: "average", struggling: "struggling — many weak areas", improving: "improving sharply over time", declining: "scores dropping — good 'at risk' demo", fresh: "brand-new, no activity yet" };
  let txt = `LearnInsight — Demo Accounts
Generated: ${new Date().toISOString().slice(0, 16).replace("T", " ")}  (by backend/src/scripts/seedDemo.js)
Password for EVERY account: ${DEMO_PASSWORD}
Login: http://localhost:3000/login

════════ RECOMMENDED DEMO PATH ════════
  1. Admin    admin@learninsight.in          → Users page (all ${students.length + teachers.length + creds.admin.length} users), public library, toggling public/private
  2. Teacher  yadav@teacher.edu.in           → classroom code ${TEACHERS[0].inviteCode}, ${byTeacher(teachers[0]._id).length} students, ML syllabus → topics → AI quiz
  3. Student  love@student.edu.in            → star student: strengths, high scores
  4. Student  gourav@student.edu.in          → struggling student: weak areas + AI recommendations
  5. Student  yadav@student.edu.in           → improving trend on the progress chart
  6. Student  riya.kapoor@student.edu.in     → new, unattached: show "Join your teacher" with code ${TEACHERS[0].inviteCode}

════════ ADMINS ════════
${creds.admin.map((u) => line(u)).join("\n")}

════════ TEACHERS (invite code · students · private subjects) ════════
${teachers.map((t, i) => line(t, `   [${TEACHERS[i].inviteCode} · ${byTeacher(t._id).length} students · ${TEACHERS[i].subjects.join(", ")}]`)).join("\n")}

════════ STUDENTS ════════
`;
  for (let i = 0; i < teachers.length; i++) {
    txt += `\n— ${teachers[i].name}'s class (${TEACHERS[i].inviteCode}) —\n`;
    txt += byTeacher(teachers[i]._id).map((s) => line(s.user, `   (${story[s.archetype]}${s.user.isActive ? "" : ", DEACTIVATED"})`)).join("\n") + "\n";
  }
  txt += `\n— Not in any classroom (public library only) —\n`;
  txt += students.filter((s) => !s.user.teacher).map((s) => line(s.user, `   (${story[s.archetype]})`)).join("\n") + "\n";
  txt += `\nNote: DEACTIVATED accounts cannot log in (by design) — use them to demo the admin's activate toggle.\n`;
  fs.writeFileSync(out, txt);
  console.log(`Credentials written to ${out}`);
}

main().catch(async (e) => { console.error(e); await mongoose.disconnect(); process.exit(1); });
