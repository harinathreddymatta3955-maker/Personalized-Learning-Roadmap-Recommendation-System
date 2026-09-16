import { Domain, Course, Topic, Resource, QuizQuestion, User } from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-1',
    name: 'Alex Chen',
    email: 'alex@example.com',
    role: 'user',
    selectedDomainId: 'domain-aiml',
    skills: ['Python', 'SQL', 'Git'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-15T10:30:00.000Z',
    password: 'password123'
  },
  {
    id: 'user-admin',
    name: 'Sarah Miller (Admin)',
    email: 'admin@plrrs.edu',
    role: 'admin',
    selectedDomainId: 'domain-webdev',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'Security'],
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-07-01T08:00:00.000Z',
    password: 'admin123'
  },
  {
    id: 'user-2',
    name: 'Marcus Vance',
    email: 'marcus.v@example.com',
    role: 'user',
    selectedDomainId: 'domain-cyber',
    skills: ['Linux', 'Networking', 'Python'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-18T14:20:00.000Z',
    password: 'password123'
  },
  {
    id: 'user-3',
    name: 'Elena Rostova',
    email: 'elena.r@example.com',
    role: 'user',
    selectedDomainId: 'domain-datasci',
    skills: ['Excel', 'SQL', 'Python', 'Statistics'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    status: 'active',
    createdAt: '2026-08-20T09:15:00.000Z',
    password: 'password123'
  },
  {
    id: 'user-4',
    name: 'Devon King',
    email: 'devon.k@example.com',
    role: 'user',
    selectedDomainId: 'domain-webdev',
    skills: ['HTML', 'CSS', 'JavaScript'],
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'suspended',
    createdAt: '2026-08-22T16:45:00.000Z',
    password: 'password123'
  }
];

export const INITIAL_DOMAINS: Domain[] = [
  {
    id: 'domain-aiml',
    name: 'AI & Machine Learning',
    slug: 'ai-ml',
    description: 'Master mathematical foundations, algorithmic modeling, deep learning architectures, computer vision, and production MLOps.',
    iconName: 'BrainCircuit',
    accentColor: '#3b82f6',
    order: 1
  },
  {
    id: 'domain-datasci',
    name: 'Data Science',
    slug: 'data-science',
    description: 'Transform raw data into actionable insights through statistical analysis, exploratory data analysis, machine learning, and BI dashboards.',
    iconName: 'BarChart3',
    accentColor: '#0ea5e9',
    order: 2
  },
  {
    id: 'domain-cyber',
    name: 'Cybersecurity',
    slug: 'cybersecurity',
    description: 'Defend computer systems, networks, and applications through network defense, cryptography, ethical hacking, and penetration testing.',
    iconName: 'ShieldAlert',
    accentColor: '#10b981',
    order: 3
  },
  {
    id: 'domain-webdev',
    name: 'Web Development',
    slug: 'web-development',
    description: 'Build modern, responsive full-stack applications from semantic frontend to resilient Node.js backends, databases, and cloud deployments.',
    iconName: 'Globe',
    accentColor: '#6366f1',
    order: 4
  },
  {
    id: 'domain-java',
    name: 'Programming with Java',
    slug: 'programming-java',
    description: 'Master enterprise Java from core syntax and Object-Oriented design to Collections, Concurrency, Spring Boot microservices, and JVM internals.',
    iconName: 'Coffee',
    accentColor: '#f59e0b',
    order: 5
  },
  {
    id: 'domain-python',
    name: 'Programming with Python',
    slug: 'programming-python',
    description: 'Master Python from absolute fundamentals to production engineering: data structures, OOP, asynchronous asyncio, REST APIs with FastAPI, and automated testing.',
    iconName: 'Terminal',
    accentColor: '#0284c7',
    order: 6
  }
];

// All courses aligned directly with PRD Section 5:
export const INITIAL_COURSES: Course[] = [
  // AI & ML
  { id: 'c-aiml-1', domainId: 'domain-aiml', title: 'Programming Fundamentals', description: 'Core computational thinking, variables, loops, control flow, and data structures.', order: 1 },
  { id: 'c-aiml-2', domainId: 'domain-aiml', title: 'Python', description: 'Python syntax, data types, comprehension, functional programming, and standard library.', order: 2, prerequisiteCourseIds: ['c-aiml-1'] },
  { id: 'c-aiml-3', domainId: 'domain-aiml', title: 'OOP', description: 'Object-Oriented Programming principles: Encapsulation, Abstraction, Inheritance, and Polymorphism.', order: 3, prerequisiteCourseIds: ['c-aiml-2'] },
  { id: 'c-aiml-4', domainId: 'domain-aiml', title: 'NumPy', description: 'Vectorized computing, n-dimensional arrays, matrix operations, and broadcasting.', order: 4, prerequisiteCourseIds: ['c-aiml-2'] },
  { id: 'c-aiml-5', domainId: 'domain-aiml', title: 'Pandas', description: 'Tabular data analysis, dataframes, series, indexing, data transformations, and grouping.', order: 5, prerequisiteCourseIds: ['c-aiml-4'] },
  { id: 'c-aiml-6', domainId: 'domain-aiml', title: 'Statistics', description: 'Descriptive statistics, inferential statistics, probability distributions, and hypothesis tests.', order: 6, prerequisiteCourseIds: ['c-aiml-1'] },
  { id: 'c-aiml-7', domainId: 'domain-aiml', title: 'Machine Learning', description: 'Supervised and unsupervised learning, regression, classification, clustering, and Scikit-Learn.', order: 7, prerequisiteCourseIds: ['c-aiml-5', 'c-aiml-6'] },
  { id: 'c-aiml-8', domainId: 'domain-aiml', title: 'Deep Learning', description: 'Neural networks, perceptrons, backpropagation, activation functions, and PyTorch.', order: 8, prerequisiteCourseIds: ['c-aiml-7'] },
  { id: 'c-aiml-9', domainId: 'domain-aiml', title: 'NLP', description: 'Natural Language Processing, text tokenization, embeddings, RNNs, and Transformers.', order: 9, prerequisiteCourseIds: ['c-aiml-8'] },
  { id: 'c-aiml-10', domainId: 'domain-aiml', title: 'Computer Vision', description: 'Convolutional Neural Networks (CNNs), image filtering, object detection, and segmentation.', order: 10, prerequisiteCourseIds: ['c-aiml-8'] },
  { id: 'c-aiml-11', domainId: 'domain-aiml', title: 'MLOps', description: 'Production model deployment, REST APIs with FastAPI, containerization, and model monitoring.', order: 11, prerequisiteCourseIds: ['c-aiml-7'] },

  // Data Science
  { id: 'c-ds-1', domainId: 'domain-datasci', title: 'Python', description: 'Core Python for scientific computing and scripting.', order: 1 },
  { id: 'c-ds-2', domainId: 'domain-datasci', title: 'SQL', description: 'Relational databases, queries, filtering, aggregation, and complex table joins.', order: 2 },
  { id: 'c-ds-3', domainId: 'domain-datasci', title: 'Excel', description: 'Advanced formulas, pivot tables, lookup functions, and data visualization in spreadsheets.', order: 3 },
  { id: 'c-ds-4', domainId: 'domain-datasci', title: 'Statistics', description: 'Mean, median, variance, standard deviation, and sampling distributions.', order: 4 },
  { id: 'c-ds-5', domainId: 'domain-datasci', title: 'Probability', description: 'Bayes theorem, conditional probability, discrete and continuous distributions.', order: 5, prerequisiteCourseIds: ['c-ds-4'] },
  { id: 'c-ds-6', domainId: 'domain-datasci', title: 'NumPy', description: 'Fast multidimensional array computation in Python.', order: 6, prerequisiteCourseIds: ['c-ds-1'] },
  { id: 'c-ds-7', domainId: 'domain-datasci', title: 'Pandas', description: 'Data ingestion, series manipulation, handling missing values, and aggregation.', order: 7, prerequisiteCourseIds: ['c-ds-6'] },
  { id: 'c-ds-8', domainId: 'domain-datasci', title: 'Data Cleaning', description: 'Imputation, outlier removal, normalization, deduplication, and schema validation.', order: 8, prerequisiteCourseIds: ['c-ds-7'] },
  { id: 'c-ds-9', domainId: 'domain-datasci', title: 'Data Visualization', description: 'Storytelling with data using Matplotlib, Seaborn, and interactive charts.', order: 9, prerequisiteCourseIds: ['c-ds-7'] },
  { id: 'c-ds-10', domainId: 'domain-datasci', title: 'EDA', description: 'Exploratory Data Analysis workflows, correlation matrices, and distribution mining.', order: 10, prerequisiteCourseIds: ['c-ds-8', 'c-ds-9'] },
  { id: 'c-ds-11', domainId: 'domain-datasci', title: 'Machine Learning', description: 'Predictive modeling, cross-validation, hyperparameter tuning, and metric evaluation.', order: 11, prerequisiteCourseIds: ['c-ds-10'] },
  { id: 'c-ds-12', domainId: 'domain-datasci', title: 'Power BI / Tableau', description: 'Executive dashboard development, DAX calculations, and interactive reporting.', order: 12, prerequisiteCourseIds: ['c-ds-2', 'c-ds-3'] },

  // Cybersecurity
  { id: 'c-cs-1', domainId: 'domain-cyber', title: 'Computer Fundamentals', description: 'Computer architecture, CPU instruction cycles, memory addressing, and storage systems.', order: 1 },
  { id: 'c-cs-2', domainId: 'domain-cyber', title: 'Networking', description: 'OSI 7-layer model, TCP/IP stack, DNS, routing, subnets, switches, and packets.', order: 2, prerequisiteCourseIds: ['c-cs-1'] },
  { id: 'c-cs-3', domainId: 'domain-cyber', title: 'Linux', description: 'Linux filesystem, permissions (chmod/chown), bash scripting, process management, and logs.', order: 3, prerequisiteCourseIds: ['c-cs-1'] },
  { id: 'c-cs-4', domainId: 'domain-cyber', title: 'Operating Systems', description: 'Kernel internals, system calls, memory virtualization, access control lists, and security rings.', order: 4, prerequisiteCourseIds: ['c-cs-3'] },
  { id: 'c-cs-5', domainId: 'domain-cyber', title: 'Web Fundamentals', description: 'HTTP request/response lifecycle, cookies, session tokens, SOP, and CORS policies.', order: 5, prerequisiteCourseIds: ['c-cs-2'] },
  { id: 'c-cs-6', domainId: 'domain-cyber', title: 'Python Scripting', description: 'Automating network scans, packet crafting with Scapy, and parsing security logs.', order: 6, prerequisiteCourseIds: ['c-cs-3'] },
  { id: 'c-cs-7', domainId: 'domain-cyber', title: 'Cybersecurity Basics', description: 'CIA triad, threat modeling, attack vectors, vulnerabilities vs exploits, and defense in depth.', order: 7, prerequisiteCourseIds: ['c-cs-2'] },
  { id: 'c-cs-8', domainId: 'domain-cyber', title: 'Cryptography', description: 'Hashing (SHA-256), symmetric encryption (AES), asymmetric encryption (RSA), and PKI/TLS.', order: 8, prerequisiteCourseIds: ['c-cs-7'] },
  { id: 'c-cs-9', domainId: 'domain-cyber', title: 'Web Security', description: 'OWASP Top 10: SQL Injection, Cross-Site Scripting (XSS), CSRF, IDOR, and SSRF.', order: 9, prerequisiteCourseIds: ['c-cs-5', 'c-cs-8'] },
  { id: 'c-cs-10', domainId: 'domain-cyber', title: 'Ethical Hacking', description: 'Reconnaissance, Nmap port scanning, banner grabbing, exploitation frameworks, and privilege escalation.', order: 10, prerequisiteCourseIds: ['c-cs-9'] },
  { id: 'c-cs-11', domainId: 'domain-cyber', title: 'Penetration Testing', description: 'Professional pen-testing methodology, Burp Suite, Metasploit, report writing, and remediation.', order: 11, prerequisiteCourseIds: ['c-cs-10'] },

  // Web Development
  { id: 'c-wd-1', domainId: 'domain-webdev', title: 'HTML', description: 'Semantic markup, accessibility (ARIA), document structure, forms, and audio/video tags.', order: 1 },
  { id: 'c-wd-2', domainId: 'domain-webdev', title: 'CSS', description: 'Selectors, specificity, box model, Flexbox, CSS Grid, animations, and Tailwind utility concepts.', order: 2, prerequisiteCourseIds: ['c-wd-1'] },
  { id: 'c-wd-3', domainId: 'domain-webdev', title: 'JavaScript', description: 'Variables, closures, prototypes, asynchronous JavaScript (Promises, async/await), and DOM APIs.', order: 3, prerequisiteCourseIds: ['c-wd-2'] },
  { id: 'c-wd-4', domainId: 'domain-webdev', title: 'Git & GitHub', description: 'Version control workflows, staging, commits, branching, merging, conflict resolution, and PRs.', order: 4 },
  { id: 'c-wd-5', domainId: 'domain-webdev', title: 'Responsive Design', description: 'Fluid layouts, media queries, mobile-first design, fluid typography, and viewport sizing.', order: 5, prerequisiteCourseIds: ['c-wd-2'] },
  { id: 'c-wd-6', domainId: 'domain-webdev', title: 'React', description: 'JSX, components, props, useState, useEffect, custom hooks, and state management.', order: 6, prerequisiteCourseIds: ['c-wd-3'] },
  { id: 'c-wd-7', domainId: 'domain-webdev', title: 'API Integration', description: 'Fetch API, Axios, handling RESTful endpoints, error states, and optimistic UI updates.', order: 7, prerequisiteCourseIds: ['c-wd-6'] },
  { id: 'c-wd-8', domainId: 'domain-webdev', title: 'Node.js', description: 'V8 runtime, event loop, CommonJS vs ES Modules, file system (fs), and streams.', order: 8, prerequisiteCourseIds: ['c-wd-3'] },
  { id: 'c-wd-9', domainId: 'domain-webdev', title: 'Express.js', description: 'Server initialization, routing, custom middlewares, error handling, and JSON payloads.', order: 9, prerequisiteCourseIds: ['c-wd-8'] },
  { id: 'c-wd-10', domainId: 'domain-webdev', title: 'MongoDB', description: 'Document databases, collections, CRUD operations, indexing, and Mongoose schema modeling.', order: 10, prerequisiteCourseIds: ['c-wd-9'] },
  { id: 'c-wd-11', domainId: 'domain-webdev', title: 'Authentication', description: 'Password hashing with bcrypt, JWT tokens, session cookies, and role-based access control.', order: 11, prerequisiteCourseIds: ['c-wd-9'] },
  { id: 'c-wd-12', domainId: 'domain-webdev', title: 'Deployment', description: 'Production builds, containerization with Docker, reverse proxy with Nginx, and cloud hosting.', order: 12, prerequisiteCourseIds: ['c-wd-10', 'c-wd-11'] },

  // Programming with Java
  { id: 'c-java-1', domainId: 'domain-java', title: 'Java Fundamentals & Syntax', description: 'JDK/JVM environment, primitives, operators, memory allocation, and control flow structures.', order: 1 },
  { id: 'c-java-2', domainId: 'domain-java', title: 'Object-Oriented Programming (OOP) in Java', description: 'Classes, objects, encapsulation, inheritance, polymorphism, abstract classes, and interfaces.', order: 2, prerequisiteCourseIds: ['c-java-1'] },
  { id: 'c-java-3', domainId: 'domain-java', title: 'Java Collections Framework & Generics', description: 'Lists, Sets, Maps, Queues, hashing internals, iterators, and type-safe generics with PECS.', order: 3, prerequisiteCourseIds: ['c-java-2'] },
  { id: 'c-java-4', domainId: 'domain-java', title: 'Exception Handling & File I/O', description: 'Checked vs unchecked exceptions, try-with-resources, custom exceptions, and NIO.2 file streams.', order: 4, prerequisiteCourseIds: ['c-java-2'] },
  { id: 'c-java-5', domainId: 'domain-java', title: 'Multithreading & Concurrency', description: 'Thread lifecycle, synchronization, locks, volatile, ExecutorService, and thread-safe collections.', order: 5, prerequisiteCourseIds: ['c-java-3'] },
  { id: 'c-java-6', domainId: 'domain-java', title: 'Modern Java: Lambdas & Stream API', description: 'Functional interfaces, method references, Stream pipelines (filter, map, reduce), and Optionals.', order: 6, prerequisiteCourseIds: ['c-java-3'] },
  { id: 'c-java-7', domainId: 'domain-java', title: 'Database Persistence with JDBC & Hibernate', description: 'SQL connectivity, Connection pooling (HikariCP), JPA entity mappings, and Hibernate ORM.', order: 7, prerequisiteCourseIds: ['c-java-4'] },
  { id: 'c-java-8', domainId: 'domain-java', title: 'Spring Boot & RESTful Microservices', description: 'Spring IoC/DI, Spring MVC, REST controllers, Spring Data JPA, and actuator monitoring.', order: 8, prerequisiteCourseIds: ['c-java-6', 'c-java-7'] },
  { id: 'c-java-9', domainId: 'domain-java', title: 'Unit Testing with JUnit 5 & Mockito', description: 'Test-Driven Development (TDD), assertions, test suites, parameterized tests, and mock objects.', order: 9, prerequisiteCourseIds: ['c-java-8'] },
  { id: 'c-java-10', domainId: 'domain-java', title: 'JVM Internals & Performance Tuning', description: 'JVM architecture, ClassLoaders, Garbage Collection (G1/ZGC), heap dump analysis, and profiling.', order: 10, prerequisiteCourseIds: ['c-java-5', 'c-java-8'] },

  // Programming with Python
  { id: 'c-py-1', domainId: 'domain-python', title: 'Python Fundamentals & Syntax', description: 'Interpreted runtime, variables, dynamic typing, arithmetic, conditionals, and looping idioms.', order: 1 },
  { id: 'c-py-2', domainId: 'domain-python', title: 'Data Structures & Pythonic Idioms', description: 'Lists, Tuples, Dictionaries, Sets, list/dict comprehensions, unpacking, and slicing syntax.', order: 2, prerequisiteCourseIds: ['c-py-1'] },
  { id: 'c-py-3', domainId: 'domain-python', title: 'Functions, Modules & Package Management', description: 'First-class functions, *args/**kwargs, scoping rules (LEGB), docstrings, and virtual environments.', order: 3, prerequisiteCourseIds: ['c-py-2'] },
  { id: 'c-py-4', domainId: 'domain-python', title: 'Object-Oriented Programming (OOP) in Python', description: 'Classes, dunder methods (__init__, __str__, __repr__), inheritance, composition, and dataclasses.', order: 4, prerequisiteCourseIds: ['c-py-3'] },
  { id: 'c-py-5', domainId: 'domain-python', title: 'File I/O, Serialization & Error Handling', description: 'Context managers (with statement), CSV/JSON serialization, custom exception hierarchies, and logging.', order: 5, prerequisiteCourseIds: ['c-py-4'] },
  { id: 'c-py-6', domainId: 'domain-python', title: 'Advanced Python: Decorators & Generators', description: 'Closures, function/class decorators, iterators, generator functions (yield), and itertools.', order: 6, prerequisiteCourseIds: ['c-py-4'] },
  { id: 'c-py-7', domainId: 'domain-python', title: 'Asynchronous Python with asyncio', description: 'Cooperative multitasking, event loops, async/await syntax, asyncio tasks, and non-blocking I/O.', order: 7, prerequisiteCourseIds: ['c-py-6'] },
  { id: 'c-py-8', domainId: 'domain-python', title: 'Web APIs with FastAPI & Pydantic', description: 'Modern asynchronous REST API design, Pydantic data schemas, dependency injection, and Swagger docs.', order: 8, prerequisiteCourseIds: ['c-py-7'] },
  { id: 'c-py-9', domainId: 'domain-python', title: 'Automated Testing with PyTest', description: 'Unit testing, pytest fixtures, test parameterization, mocking external calls, and test coverage.', order: 9, prerequisiteCourseIds: ['c-py-8'] },
  { id: 'c-py-10', domainId: 'domain-python', title: 'Production Tooling, Docker & Deployment', description: 'Poetry dependency manager, Ruff linter/formatter, containerization with Docker, and CI/CD pipelines.', order: 10, prerequisiteCourseIds: ['c-py-8'] }
];

export const INITIAL_TOPICS: Topic[] = [
  // AI & ML Topics
  {
    id: 'top-aiml-1',
    courseId: 'c-aiml-1',
    domainId: 'domain-aiml',
    title: 'Computational Logic & Control Flow',
    description: 'Understand conditional statements, boolean algebra, and loop termination conditions.',
    order: 1,
    estimatedMinutes: 45,
    prerequisiteTopicIds: [],
    keySkills: ['Logic', 'Algorithms', 'Control Flow']
  },
  {
    id: 'top-aiml-2',
    courseId: 'c-aiml-1',
    domainId: 'domain-aiml',
    title: 'Basic Data Structures',
    description: 'Arrays, lists, hash tables, stacks, and queues with time complexity analysis.',
    order: 2,
    estimatedMinutes: 60,
    prerequisiteTopicIds: ['top-aiml-1'],
    keySkills: ['Data Structures', 'Big-O Notation']
  },
  {
    id: 'top-aiml-3',
    courseId: 'c-aiml-2',
    domainId: 'domain-aiml',
    title: 'Python Syntax & Functional Primitives',
    description: 'Functions, lambdas, map/filter, list comprehensions, and generator expressions.',
    order: 1,
    estimatedMinutes: 75,
    prerequisiteTopicIds: ['top-aiml-2'],
    keySkills: ['Python', 'Functions', 'Generators']
  },
  {
    id: 'top-aiml-4',
    courseId: 'c-aiml-3',
    domainId: 'domain-aiml',
    title: 'Classes, Dunder Methods & Inheritance',
    description: 'Class hierarchies, magic methods (__init__, __repr__), encapsulation, and polymorphism.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-aiml-3'],
    keySkills: ['OOP', 'Python Classes', 'Polymorphism']
  },
  {
    id: 'top-aiml-5',
    courseId: 'c-aiml-4',
    domainId: 'domain-aiml',
    title: 'NumPy Arrays & Vectorized Math',
    description: 'Ndarray creation, broadcasting rules, dot products, and matrix transformations.',
    order: 1,
    estimatedMinutes: 80,
    prerequisiteTopicIds: ['top-aiml-3'],
    keySkills: ['NumPy', 'Vectorization', 'Linear Algebra']
  },
  {
    id: 'top-aiml-6',
    courseId: 'c-aiml-5',
    domainId: 'domain-aiml',
    title: 'Pandas DataFrames & Aggregations',
    description: 'Series, DataFrames, multi-indexing, groupby aggregations, and merge operations.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-aiml-5'],
    keySkills: ['Pandas', 'Data Analysis', 'Aggregation']
  },
  {
    id: 'top-aiml-7',
    courseId: 'c-aiml-6',
    domainId: 'domain-aiml',
    title: 'Hypothesis Testing & Distributions',
    description: 'Normal, binomial, and Poisson distributions, p-values, z-tests, and t-tests.',
    order: 1,
    estimatedMinutes: 70,
    prerequisiteTopicIds: ['top-aiml-1'],
    keySkills: ['Statistics', 'Probability', 'Hypothesis Testing']
  },
  {
    id: 'top-aiml-8',
    courseId: 'c-aiml-7',
    domainId: 'domain-aiml',
    title: 'Supervised Learning: Regressors & Classifiers',
    description: 'Linear/Logistic regression, decision trees, random forests, and SVMs with Scikit-Learn.',
    order: 1,
    estimatedMinutes: 120,
    prerequisiteTopicIds: ['top-aiml-6', 'top-aiml-7'],
    keySkills: ['Machine Learning', 'Scikit-Learn', 'Classification']
  },
  {
    id: 'top-aiml-9',
    courseId: 'c-aiml-8',
    domainId: 'domain-aiml',
    title: 'Deep Neural Networks with PyTorch',
    description: 'Tensors, autograd, forward passes, cross-entropy loss, and gradient descent optimization.',
    order: 1,
    estimatedMinutes: 150,
    prerequisiteTopicIds: ['top-aiml-8'],
    keySkills: ['Deep Learning', 'PyTorch', 'Neural Networks']
  },
  {
    id: 'top-aiml-10',
    courseId: 'c-aiml-9',
    domainId: 'domain-aiml',
    title: 'Transformers & Language Models',
    description: 'Self-attention mechanism, multi-head attention, BERT, GPT tokenization, and HuggingFace.',
    order: 1,
    estimatedMinutes: 140,
    prerequisiteTopicIds: ['top-aiml-9'],
    keySkills: ['NLP', 'Transformers', 'HuggingFace', 'LLMs']
  },
  {
    id: 'top-aiml-11',
    courseId: 'c-aiml-10',
    domainId: 'domain-aiml',
    title: 'Convolutional Vision Models',
    description: '2D Convolutions, max pooling, feature maps, ResNet architectures, and transfer learning.',
    order: 1,
    estimatedMinutes: 130,
    prerequisiteTopicIds: ['top-aiml-9'],
    keySkills: ['Computer Vision', 'CNNs', 'Transfer Learning']
  },
  {
    id: 'top-aiml-12',
    courseId: 'c-aiml-11',
    domainId: 'domain-aiml',
    title: 'Model Serving with FastAPI & Docker',
    description: 'Packaging trained inference pipelines into asynchronous REST endpoints with Docker containerization.',
    order: 1,
    estimatedMinutes: 110,
    prerequisiteTopicIds: ['top-aiml-8'],
    keySkills: ['MLOps', 'FastAPI', 'Docker', 'Deployment']
  },

  // Data Science Topics
  {
    id: 'top-ds-1',
    courseId: 'c-ds-1',
    domainId: 'domain-datasci',
    title: 'Data Science Python Fundamentals',
    description: 'Variables, dictionaries, list slicing, and writing clean mathematical scripts in Python.',
    order: 1,
    estimatedMinutes: 50,
    prerequisiteTopicIds: [],
    keySkills: ['Python', 'Data Types', 'Scripting']
  },
  {
    id: 'top-ds-2',
    courseId: 'c-ds-2',
    domainId: 'domain-datasci',
    title: 'SQL Select, Group By & Multi-Table Joins',
    description: 'Writing complex relational queries using INNER/LEFT joins, CASE WHEN, and subqueries.',
    order: 1,
    estimatedMinutes: 75,
    prerequisiteTopicIds: [],
    keySkills: ['SQL', 'Relational Databases', 'Joins']
  },
  {
    id: 'top-ds-3',
    courseId: 'c-ds-3',
    domainId: 'domain-datasci',
    title: 'Advanced Spreadsheet Modeling',
    description: 'XLOOKUP, INDEX/MATCH, dynamic array formulas, and interactive pivot tables.',
    order: 1,
    estimatedMinutes: 60,
    prerequisiteTopicIds: [],
    keySkills: ['Excel', 'Pivot Tables', 'Spreadsheets']
  },
  {
    id: 'top-ds-4',
    courseId: 'c-ds-4',
    domainId: 'domain-datasci',
    title: 'Descriptive Metrics & Variance',
    description: 'Interquartile range, skewness, kurtosis, standard deviation, and covariance.',
    order: 1,
    estimatedMinutes: 65,
    prerequisiteTopicIds: [],
    keySkills: ['Statistics', 'Variance', 'Sampling']
  },
  {
    id: 'top-ds-5',
    courseId: 'c-ds-5',
    domainId: 'domain-datasci',
    title: 'Probability Distributions & Bayes Rule',
    description: 'Conditional probability calculations, prior/posterior distribution shifts, and Poisson limits.',
    order: 1,
    estimatedMinutes: 80,
    prerequisiteTopicIds: ['top-ds-4'],
    keySkills: ['Probability', 'Bayesian Inference']
  },
  {
    id: 'top-ds-6',
    courseId: 'c-ds-6',
    domainId: 'domain-datasci',
    title: 'Scientific Computing with NumPy',
    description: 'Array slicing, boolean masking, vector operations, and linear algebra transforms.',
    order: 1,
    estimatedMinutes: 75,
    prerequisiteTopicIds: ['top-ds-1'],
    keySkills: ['NumPy', 'Arrays', 'Linear Algebra']
  },
  {
    id: 'top-ds-7',
    courseId: 'c-ds-7',
    domainId: 'domain-datasci',
    title: 'Pandas Data Wrangling & Indexing',
    description: 'Handling real-world tabular data, timestamp manipulation, and categorical encoders.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-ds-6'],
    keySkills: ['Pandas', 'Data Wrangling', 'Feature Creation']
  },
  {
    id: 'top-ds-8',
    courseId: 'c-ds-8',
    domainId: 'domain-datasci',
    title: 'Missing Data Imputation & Outlier Strategy',
    description: 'KNN imputation, Z-score thresholds, IQR bounds, and categorical label encoding.',
    order: 1,
    estimatedMinutes: 85,
    prerequisiteTopicIds: ['top-ds-7'],
    keySkills: ['Data Cleaning', 'Imputation', 'Outlier Detection']
  },
  {
    id: 'top-ds-9',
    courseId: 'c-ds-9',
    domainId: 'domain-datasci',
    title: 'Visual Storytelling with Seaborn & Matplotlib',
    description: 'Scatter plots, heatmaps, violin plots, and multi-facet grids for communication.',
    order: 1,
    estimatedMinutes: 70,
    prerequisiteTopicIds: ['top-ds-7'],
    keySkills: ['Data Visualization', 'Seaborn', 'Matplotlib']
  },
  {
    id: 'top-ds-10',
    courseId: 'c-ds-10',
    domainId: 'domain-datasci',
    title: 'End-to-End Exploratory Data Analysis (EDA)',
    description: 'Systematic analysis of unfamiliar datasets to surface correlations and anomaly insights.',
    order: 1,
    estimatedMinutes: 100,
    prerequisiteTopicIds: ['top-ds-8', 'top-ds-9'],
    keySkills: ['EDA', 'Feature Engineering', 'Hypothesis Generation']
  },
  {
    id: 'top-ds-11',
    courseId: 'c-ds-11',
    domainId: 'domain-datasci',
    title: 'Predictive Modeling & Cross-Validation',
    description: 'K-Fold cross-validation, hyperparameter grid search, ROC-AUC curves, and metrics.',
    order: 1,
    estimatedMinutes: 110,
    prerequisiteTopicIds: ['top-ds-10'],
    keySkills: ['Machine Learning', 'Model Evaluation', 'Scikit-Learn']
  },
  {
    id: 'top-ds-12',
    courseId: 'c-ds-12',
    domainId: 'domain-datasci',
    title: 'Interactive Power BI & Tableau Dashboards',
    description: 'Building connected drill-down executive dashboards with live database connectors.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-ds-2', 'top-ds-3'],
    keySkills: ['Power BI', 'Tableau', 'Business Intelligence']
  },

  // Cybersecurity Topics
  {
    id: 'top-cs-1',
    courseId: 'c-cs-1',
    domainId: 'domain-cyber',
    title: 'Hardware Architectures & CPU Execution',
    description: 'Registers, stack pointers, memory hierarchy, cache lines, and instruction sets.',
    order: 1,
    estimatedMinutes: 50,
    prerequisiteTopicIds: [],
    keySkills: ['Computer Architecture', 'Memory', 'CPUs']
  },
  {
    id: 'top-cs-2',
    courseId: 'c-cs-2',
    domainId: 'domain-cyber',
    title: 'TCP/IP, Subnetting & Packet Anatomy',
    description: 'IPv4/IPv6 addressing, subnet masks (CIDR), 3-way handshakes, and Wireshark capture.',
    order: 1,
    estimatedMinutes: 80,
    prerequisiteTopicIds: ['top-cs-1'],
    keySkills: ['Networking', 'TCP/IP', 'Wireshark']
  },
  {
    id: 'top-cs-3',
    courseId: 'c-cs-3',
    domainId: 'domain-cyber',
    title: 'Linux CLI, Permissions & System Logs',
    description: 'User accounts, sudoers, octal permissions, grep/awk parsing, and /var/log analysis.',
    order: 1,
    estimatedMinutes: 85,
    prerequisiteTopicIds: ['top-cs-1'],
    keySkills: ['Linux', 'Bash', 'System Admin']
  },
  {
    id: 'top-cs-4',
    courseId: 'c-cs-4',
    domainId: 'domain-cyber',
    title: 'Kernel Rings & Memory Virtualization',
    description: 'Ring 0 vs Ring 3 privileges, process isolation, virtual memory paging, and interrupts.',
    order: 1,
    estimatedMinutes: 75,
    prerequisiteTopicIds: ['top-cs-3'],
    keySkills: ['Operating Systems', 'Kernel', 'Memory Management']
  },
  {
    id: 'top-cs-5',
    courseId: 'c-cs-5',
    domainId: 'domain-cyber',
    title: 'HTTP/HTTPS, TLS Handshakes & Headers',
    description: 'HTTP verbs, secure cookies, Content Security Policy (CSP), and TLS certificate validation.',
    order: 1,
    estimatedMinutes: 70,
    prerequisiteTopicIds: ['top-cs-2'],
    keySkills: ['Web Protocols', 'HTTP', 'TLS']
  },
  {
    id: 'top-cs-6',
    courseId: 'c-cs-6',
    domainId: 'domain-cyber',
    title: 'Python for Port Scanners & Exploit Scripting',
    description: 'Socket programming in Python, banner grabbing, and raw packet crafting with Scapy.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-cs-3'],
    keySkills: ['Python Scripting', 'Sockets', 'Automation']
  },
  {
    id: 'top-cs-7',
    courseId: 'c-cs-7',
    domainId: 'domain-cyber',
    title: 'Threat Modeling & the CIA Triad',
    description: 'Confidentiality, Integrity, Availability, STRIDE threat model, and vulnerability lifecycle.',
    order: 1,
    estimatedMinutes: 60,
    prerequisiteTopicIds: ['top-cs-2'],
    keySkills: ['Cybersecurity', 'Threat Modeling', 'Defense']
  },
  {
    id: 'top-cs-8',
    courseId: 'c-cs-8',
    domainId: 'domain-cyber',
    title: 'Applied Cryptography: AES, RSA & Hashing',
    description: 'Symmetric vs asymmetric keys, salt & pepper hashing with bcrypt, and public key infra.',
    order: 1,
    estimatedMinutes: 95,
    prerequisiteTopicIds: ['top-cs-7'],
    keySkills: ['Cryptography', 'AES', 'RSA', 'Hashing']
  },
  {
    id: 'top-cs-9',
    courseId: 'c-cs-9',
    domainId: 'domain-cyber',
    title: 'OWASP Top 10 Web Vulnerabilities',
    description: 'Exploiting and defending against SQL Injection, Reflected/Stored XSS, and CSRF.',
    order: 1,
    estimatedMinutes: 110,
    prerequisiteTopicIds: ['top-cs-5', 'top-cs-8'],
    keySkills: ['Web Security', 'OWASP Top 10', 'SQLi', 'XSS']
  },
  {
    id: 'top-cs-10',
    courseId: 'c-cs-10',
    domainId: 'domain-cyber',
    title: 'Reconnaissance & Nmap Network Scanning',
    description: 'Passive OSINT research, active SYN scans, service version detection, and NSE scripts.',
    order: 1,
    estimatedMinutes: 100,
    prerequisiteTopicIds: ['top-cs-9'],
    keySkills: ['Ethical Hacking', 'Nmap', 'Reconnaissance']
  },
  {
    id: 'top-cs-11',
    courseId: 'c-cs-11',
    domainId: 'domain-cyber',
    title: 'Hands-on Penetration Testing with Burp Suite',
    description: 'Intercepting HTTP requests, automated fuzzing with Intruder, and compiling CVE audit reports.',
    order: 1,
    estimatedMinutes: 130,
    prerequisiteTopicIds: ['top-cs-10'],
    keySkills: ['Penetration Testing', 'Burp Suite', 'Vulnerability Assessment']
  },

  // Web Development Topics
  {
    id: 'top-wd-1',
    courseId: 'c-wd-1',
    domainId: 'domain-webdev',
    title: 'HTML5 Semantic Elements & Accessibility (ARIA)',
    description: 'Semantic tags (main, nav, article), accessible form labels, keyboard navigation, and ARIA roles.',
    order: 1,
    estimatedMinutes: 45,
    prerequisiteTopicIds: [],
    keySkills: ['HTML5', 'Semantic Web', 'Accessibility']
  },
  {
    id: 'top-wd-2',
    courseId: 'c-wd-2',
    domainId: 'domain-webdev',
    title: 'Modern CSS Layouts: Flexbox & CSS Grid',
    description: 'Mastering flex alignment, grid template areas, gap spacing, and fluid CSS architectures.',
    order: 1,
    estimatedMinutes: 70,
    prerequisiteTopicIds: ['top-wd-1'],
    keySkills: ['CSS3', 'Flexbox', 'CSS Grid', 'Tailwind']
  },
  {
    id: 'top-wd-3',
    courseId: 'c-wd-3',
    domainId: 'domain-webdev',
    title: 'JavaScript Async/Await & Event Loop',
    description: 'Call stack, event loop, microtask queue, Promises, async/await, and modern ES6 modules.',
    order: 1,
    estimatedMinutes: 80,
    prerequisiteTopicIds: ['top-wd-2'],
    keySkills: ['JavaScript', 'Async/Await', 'ES6+']
  },
  {
    id: 'top-wd-4',
    courseId: 'c-wd-4',
    domainId: 'domain-webdev',
    title: 'Git Branching Strategies & Pull Requests',
    description: 'Git commits, rebase vs merge, branch naming conventions, merge conflict resolution, and PR reviews.',
    order: 1,
    estimatedMinutes: 60,
    prerequisiteTopicIds: [],
    keySkills: ['Git', 'GitHub', 'Version Control']
  },
  {
    id: 'top-wd-5',
    courseId: 'c-wd-5',
    domainId: 'domain-webdev',
    title: 'Mobile-First Responsive Layouts',
    description: 'Media query breakpoints, fluid typography with clamp(), and touch-friendly interface states.',
    order: 1,
    estimatedMinutes: 65,
    prerequisiteTopicIds: ['top-wd-2'],
    keySkills: ['Responsive Design', 'Mobile-First']
  },
  {
    id: 'top-wd-6',
    courseId: 'c-wd-6',
    domainId: 'domain-webdev',
    title: 'React Components, Hooks & State Flow',
    description: 'Functional components, useState, useEffect, custom hooks, and unidirectional data flow.',
    order: 1,
    estimatedMinutes: 110,
    prerequisiteTopicIds: ['top-wd-3'],
    keySkills: ['React', 'React Hooks', 'State Management']
  },
  {
    id: 'top-wd-7',
    courseId: 'c-wd-7',
    domainId: 'domain-webdev',
    title: 'RESTful API Consumption & Error Handling',
    description: 'Making resilient HTTP queries, handling loading and error states, caching, and payload transformation.',
    order: 1,
    estimatedMinutes: 75,
    prerequisiteTopicIds: ['top-wd-6'],
    keySkills: ['API Integration', 'REST', 'Fetch']
  },
  {
    id: 'top-wd-8',
    courseId: 'c-wd-8',
    domainId: 'domain-webdev',
    title: 'Node.js Core Architecture & Modules',
    description: 'Node.js architecture, libuv event loop, buffer handling, file system streaming, and npm scripting.',
    order: 1,
    estimatedMinutes: 85,
    prerequisiteTopicIds: ['top-wd-3'],
    keySkills: ['Node.js', 'Backend', 'Event Loop']
  },
  {
    id: 'top-wd-9',
    courseId: 'c-wd-9',
    domainId: 'domain-webdev',
    title: 'Express.js Routing & Middleware Design',
    description: 'Structuring RESTful routes, input validation middlewares, error boundaries, and CORS security.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-wd-8'],
    keySkills: ['Express.js', 'REST APIs', 'Middleware']
  },
  {
    id: 'top-wd-10',
    courseId: 'c-wd-10',
    domainId: 'domain-webdev',
    title: 'MongoDB Schema Design & Mongoose ODM',
    description: 'NoSQL collections, document indexing, Mongoose schemas, and relational aggregation pipelines.',
    order: 1,
    estimatedMinutes: 95,
    prerequisiteTopicIds: ['top-wd-9'],
    keySkills: ['MongoDB', 'NoSQL', 'Mongoose']
  },
  {
    id: 'top-wd-11',
    courseId: 'c-wd-11',
    domainId: 'domain-webdev',
    title: 'JWT Token Authentication & Password Hashing',
    description: 'Bcrypt salt rounds, signing and verifying JSON Web Tokens, and HTTP-only cookie strategies.',
    order: 1,
    estimatedMinutes: 100,
    prerequisiteTopicIds: ['top-wd-9'],
    keySkills: ['Authentication', 'JWT', 'Security']
  },
  {
    id: 'top-wd-12',
    courseId: 'c-wd-12',
    domainId: 'domain-webdev',
    title: 'Dockerizing & Cloud Container Deployment',
    description: 'Writing multi-stage Dockerfiles, managing environment secrets, reverse proxying, and deployment.',
    order: 1,
    estimatedMinutes: 110,
    prerequisiteTopicIds: ['top-wd-10', 'top-wd-11'],
    keySkills: ['Deployment', 'Docker', 'CI/CD']
  },

  // Programming with Java Topics
  {
    id: 'top-java-1',
    courseId: 'c-java-1',
    domainId: 'domain-java',
    title: 'Java Variables, Data Types & Control Flow',
    description: 'Primitive types vs references, arithmetic expressions, switch statements, and loop constructs in Java.',
    order: 1,
    estimatedMinutes: 50,
    prerequisiteTopicIds: [],
    keySkills: ['Java', 'Primitives', 'Control Flow']
  },
  {
    id: 'top-java-2',
    courseId: 'c-java-1',
    domainId: 'domain-java',
    title: 'Methods, Arrays & String Manipulation',
    description: 'Method signatures, parameter passing by value, array traversals, and String/StringBuilder immutability.',
    order: 2,
    estimatedMinutes: 60,
    prerequisiteTopicIds: ['top-java-1'],
    keySkills: ['Java Arrays', 'Strings', 'Methods']
  },
  {
    id: 'top-java-3',
    courseId: 'c-java-2',
    domainId: 'domain-java',
    title: 'Classes, Objects, Constructors & Encapsulation',
    description: 'Defining classes, instance vs static variables, constructor chaining with this(), and access modifiers.',
    order: 1,
    estimatedMinutes: 70,
    prerequisiteTopicIds: ['top-java-2'],
    keySkills: ['OOP', 'Encapsulation', 'Classes']
  },
  {
    id: 'top-java-4',
    courseId: 'c-java-2',
    domainId: 'domain-java',
    title: 'Inheritance, Polymorphism & Interfaces',
    description: 'Method overriding (@Override), super keyword, dynamic method dispatch, and interface contracts.',
    order: 2,
    estimatedMinutes: 80,
    prerequisiteTopicIds: ['top-java-3'],
    keySkills: ['Inheritance', 'Polymorphism', 'Interfaces']
  },
  {
    id: 'top-java-5',
    courseId: 'c-java-3',
    domainId: 'domain-java',
    title: 'Collections Framework: Lists, Sets & Maps',
    description: 'ArrayList vs LinkedList, HashSet vs TreeSet, and HashMap bucket hashing mechanics in Java.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-java-4'],
    keySkills: ['Collections', 'ArrayList', 'HashMap']
  },
  {
    id: 'top-java-6',
    courseId: 'c-java-3',
    domainId: 'domain-java',
    title: 'Generics, Bounded Wildcards & Type Safety',
    description: 'Generic classes and methods, type erasure, and the PECS principle (Producer Extends, Consumer Super).',
    order: 2,
    estimatedMinutes: 75,
    prerequisiteTopicIds: ['top-java-5'],
    keySkills: ['Generics', 'Wildcards', 'Type Safety']
  },
  {
    id: 'top-java-7',
    courseId: 'c-java-4',
    domainId: 'domain-java',
    title: 'Checked Exceptions & AutoCloseable Resources',
    description: 'Exception hierarchy (Throwable, Exception, RuntimeException), try-catch-finally, and try-with-resources.',
    order: 1,
    estimatedMinutes: 60,
    prerequisiteTopicIds: ['top-java-4'],
    keySkills: ['Exception Handling', 'Try-With-Resources']
  },
  {
    id: 'top-java-8',
    courseId: 'c-java-4',
    domainId: 'domain-java',
    title: 'Modern Java NIO.2 Files & Object Serialization',
    description: 'Path and Files utilities, reading/writing streams, and serializing Java objects securely with Jackson.',
    order: 2,
    estimatedMinutes: 70,
    prerequisiteTopicIds: ['top-java-7'],
    keySkills: ['File I/O', 'NIO.2', 'Serialization']
  },
  {
    id: 'top-java-9',
    courseId: 'c-java-5',
    domainId: 'domain-java',
    title: 'Threads, Synchronization & Concurrent Utilities',
    description: 'Creating threads, synchronized blocks, ReentrantLocks, Atomic variables, and ExecutorService thread pools.',
    order: 1,
    estimatedMinutes: 110,
    prerequisiteTopicIds: ['top-java-5'],
    keySkills: ['Multithreading', 'Concurrency', 'Locks']
  },
  {
    id: 'top-java-10',
    courseId: 'c-java-6',
    domainId: 'domain-java',
    title: 'Lambdas, Method References & Stream Pipelines',
    description: 'Functional interfaces (@FunctionalInterface), filter/map/reduce transformations, and Optional idiom.',
    order: 1,
    estimatedMinutes: 95,
    prerequisiteTopicIds: ['top-java-5'],
    keySkills: ['Java Streams', 'Lambdas', 'Functional Java']
  },
  {
    id: 'top-java-11',
    courseId: 'c-java-7',
    domainId: 'domain-java',
    title: 'JDBC Connectivity & Hibernate ORM Mapping',
    description: 'Executing SQL queries, PreparedStatements, transaction boundaries, and Hibernate entity mappings.',
    order: 1,
    estimatedMinutes: 100,
    prerequisiteTopicIds: ['top-java-8'],
    keySkills: ['JDBC', 'Hibernate', 'JPA', 'SQL']
  },
  {
    id: 'top-java-12',
    courseId: 'c-java-8',
    domainId: 'domain-java',
    title: 'Spring Boot REST Controllers & Dependency Injection',
    description: 'ApplicationContext, @Component, @Autowired, Spring MVC controllers, and building clean RESTful endpoints.',
    order: 1,
    estimatedMinutes: 120,
    prerequisiteTopicIds: ['top-java-10', 'top-java-11'],
    keySkills: ['Spring Boot', 'REST APIs', 'Dependency Injection']
  },
  {
    id: 'top-java-13',
    courseId: 'c-java-9',
    domainId: 'domain-java',
    title: 'Unit Testing with JUnit 5 & Mockito Mocks',
    description: 'Writing unit tests with assertions, @ParameterizedTest, @Mock, @InjectMocks, and verifying interactions.',
    order: 1,
    estimatedMinutes: 80,
    prerequisiteTopicIds: ['top-java-12'],
    keySkills: ['JUnit 5', 'Mockito', 'Unit Testing']
  },
  {
    id: 'top-java-14',
    courseId: 'c-java-10',
    domainId: 'domain-java',
    title: 'JVM Architecture, Garbage Collection & Profiling',
    description: 'Classloader subsystem, JVM memory regions (Heap, Metaspace, Stack), G1GC vs ZGC, and flight recordings.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-java-9', 'top-java-12'],
    keySkills: ['JVM', 'Garbage Collection', 'Performance']
  },

  // Programming with Python Topics
  {
    id: 'top-py-1',
    courseId: 'c-py-1',
    domainId: 'domain-python',
    title: 'Python 3 Syntax, Dynamic Typing & Flow Control',
    description: 'Python syntax idioms, indentation, dynamic type inference, boolean operations, and while/for loops.',
    order: 1,
    estimatedMinutes: 45,
    prerequisiteTopicIds: [],
    keySkills: ['Python', 'Control Flow', 'Dynamic Typing']
  },
  {
    id: 'top-py-2',
    courseId: 'c-py-1',
    domainId: 'domain-python',
    title: 'Functions, Variable Unpacking & LEGB Scopes',
    description: 'Defining def functions, default parameters, *args and **kwargs unpacking, and local vs global scope.',
    order: 2,
    estimatedMinutes: 60,
    prerequisiteTopicIds: ['top-py-1'],
    keySkills: ['Functions', 'Scopes', 'Unpacking']
  },
  {
    id: 'top-py-3',
    courseId: 'c-py-2',
    domainId: 'domain-python',
    title: 'Lists, Dicts, Sets & Comprehensions',
    description: 'Mutating sequences, dictionary lookups, set operations, and concise list/dict comprehensions.',
    order: 1,
    estimatedMinutes: 65,
    prerequisiteTopicIds: ['top-py-2'],
    keySkills: ['Data Structures', 'Comprehensions', 'Pythonic']
  },
  {
    id: 'top-py-4',
    courseId: 'c-py-2',
    domainId: 'domain-python',
    title: 'String Formatting, Regex & Datetime Parsing',
    description: 'Python f-strings, regular expression pattern searches with re, and timezone-aware datetime calculations.',
    order: 2,
    estimatedMinutes: 55,
    prerequisiteTopicIds: ['top-py-3'],
    keySkills: ['Regex', 'String Formatting', 'Datetime']
  },
  {
    id: 'top-py-5',
    courseId: 'c-py-3',
    domainId: 'domain-python',
    title: 'Classes, Dunder Methods & Encapsulation',
    description: 'Class vs instance attributes, self convention, __init__, __repr__, __eq__, and property getters/setters.',
    order: 1,
    estimatedMinutes: 75,
    prerequisiteTopicIds: ['top-py-3'],
    keySkills: ['Python OOP', 'Dunder Methods', 'Classes']
  },
  {
    id: 'top-py-6',
    courseId: 'c-py-3',
    domainId: 'domain-python',
    title: 'Inheritance, Composition & Modern Dataclasses',
    description: 'Method resolution order (MRO), super() delegation, composition patterns, and @dataclass decorators.',
    order: 2,
    estimatedMinutes: 70,
    prerequisiteTopicIds: ['top-py-5'],
    keySkills: ['Inheritance', 'Dataclasses', 'Composition']
  },
  {
    id: 'top-py-7',
    courseId: 'c-py-4',
    domainId: 'domain-python',
    title: 'File I/O, Context Managers & JSON Processing',
    description: 'Pathlib library, safe file reading with with statements, custom context managers, and JSON loads/dumps.',
    order: 1,
    estimatedMinutes: 60,
    prerequisiteTopicIds: ['top-py-5'],
    keySkills: ['File I/O', 'Context Managers', 'JSON']
  },
  {
    id: 'top-py-8',
    courseId: 'c-py-4',
    domainId: 'domain-python',
    title: 'Custom Exceptions & Production Logging',
    description: 'Building custom Exception classes, try-except-else-finally pipelines, and configuring the logging module.',
    order: 2,
    estimatedMinutes: 55,
    prerequisiteTopicIds: ['top-py-7'],
    keySkills: ['Error Handling', 'Logging', 'Exceptions']
  },
  {
    id: 'top-py-9',
    courseId: 'c-py-5',
    domainId: 'domain-python',
    title: 'Iterators, Generators & Memory-Efficient yield',
    description: 'Iterator protocol (__iter__, __next__), generator functions, and lazy evaluation for gigabyte datasets.',
    order: 1,
    estimatedMinutes: 80,
    prerequisiteTopicIds: ['top-py-5'],
    keySkills: ['Generators', 'Iterators', 'Memory Efficiency']
  },
  {
    id: 'top-py-10',
    courseId: 'c-py-5',
    domainId: 'domain-python',
    title: 'Closures, Decorators & Metaprogramming',
    description: 'Writing function decorators (@functools.wraps), decorators with arguments, and class decorators.',
    order: 2,
    estimatedMinutes: 85,
    prerequisiteTopicIds: ['top-py-9'],
    keySkills: ['Decorators', 'Closures', 'Metaprogramming']
  },
  {
    id: 'top-py-11',
    courseId: 'c-py-6',
    domainId: 'domain-python',
    title: 'Asynchronous Concurrency with asyncio',
    description: 'Event loops, async def coroutines, await expressions, asyncio.gather, tasks, and non-blocking I/O.',
    order: 1,
    estimatedMinutes: 105,
    prerequisiteTopicIds: ['top-py-10'],
    keySkills: ['asyncio', 'Async/Await', 'Event Loop']
  },
  {
    id: 'top-py-12',
    courseId: 'c-py-7',
    domainId: 'domain-python',
    title: 'FastAPI REST Endpoints & Pydantic Validation',
    description: 'Building modern async APIs with FastAPI, automatic OpenAPI documentation, and Pydantic request models.',
    order: 1,
    estimatedMinutes: 110,
    prerequisiteTopicIds: ['top-py-11'],
    keySkills: ['FastAPI', 'Pydantic', 'REST APIs']
  },
  {
    id: 'top-py-13',
    courseId: 'c-py-8',
    domainId: 'domain-python',
    title: 'PyTest Suite, Fixtures & Mocking',
    description: 'Automated testing with PyTest, fixture scopes, monkeypatch, pytest-mock, and code coverage checks.',
    order: 1,
    estimatedMinutes: 75,
    prerequisiteTopicIds: ['top-py-12'],
    keySkills: ['PyTest', 'Mocking', 'Test Coverage']
  },
  {
    id: 'top-py-14',
    courseId: 'c-py-9',
    domainId: 'domain-python',
    title: 'SQLAlchemy 2.0 ORM & Alembic Migrations',
    description: 'Declarative Base models, AsyncSession database connections, relational queries, and Alembic migrations.',
    order: 1,
    estimatedMinutes: 95,
    prerequisiteTopicIds: ['top-py-12'],
    keySkills: ['SQLAlchemy', 'Alembic', 'Databases']
  },
  {
    id: 'top-py-15',
    courseId: 'c-py-10',
    domainId: 'domain-python',
    title: 'Production Packaging, Poetry & Dockerization',
    description: 'Managing pyproject.toml with Poetry, code quality with Ruff, multi-stage Docker builds, and deployment.',
    order: 1,
    estimatedMinutes: 90,
    prerequisiteTopicIds: ['top-py-12', 'top-py-13'],
    keySkills: ['Poetry', 'Docker', 'Ruff', 'Production']
  }
];

export const INITIAL_RESOURCES: Resource[] = [
  // Computational Logic & Control Flow
  {
    id: 'res-1',
    topicId: 'top-aiml-1',
    title: 'Harvard CS50: Computational Thinking & Algorithms',
    description: 'David Malan explains boolean logic, conditional branches, and iterative loops.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=8mAITcNt710',
    durationOrReadTime: '45 mins',
    difficulty: 'beginner',
    source: 'Harvard CS50'
  },
  {
    id: 'res-2',
    topicId: 'top-aiml-1',
    title: 'Official Guide: Control Flow & Logic in Code',
    description: 'Comprehensive guide covering truth tables, short-circuit evaluation, and recursion.',
    type: 'documentation',
    url: 'https://docs.python.org/3/tutorial/controlflow.html',
    durationOrReadTime: '20 mins read',
    difficulty: 'beginner',
    source: 'Python Docs'
  },
  {
    id: 'res-3',
    topicId: 'top-aiml-1',
    title: 'Logic & Loops Interactive Challenge',
    description: 'Solve 10 targeted problems to solidify your understanding of loop invariant checks.',
    type: 'practice',
    url: 'https://leetcode.com/problemset/all/',
    durationOrReadTime: '30 mins',
    difficulty: 'beginner',
    source: 'LeetCode'
  },

  // Python Syntax & Functional Primitives
  {
    id: 'res-4',
    topicId: 'top-aiml-3',
    title: 'Python Beyond the Basics: Comprehensions & Lambdas',
    description: 'Deep dive into Pythonic functional programming techniques and memoization.',
    type: 'article',
    url: 'https://realpython.com/list-comprehension-python/',
    durationOrReadTime: '18 mins read',
    difficulty: 'intermediate',
    source: 'Real Python'
  },
  {
    id: 'res-5',
    topicId: 'top-aiml-3',
    title: 'Python 3 Complete Video Masterclass',
    description: 'Step-by-step walkthrough of generator expressions and custom iterators.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    durationOrReadTime: '55 mins',
    difficulty: 'beginner',
    source: 'freeCodeCamp'
  },

  // NumPy Arrays
  {
    id: 'res-6',
    topicId: 'top-aiml-5',
    title: 'NumPy Quickstart & Array Broadcasting Explained',
    description: 'Illustrated guide showing how NumPy broadcasts across differing tensor dimensions.',
    type: 'documentation',
    url: 'https://numpy.org/doc/stable/user/quickstart.html',
    durationOrReadTime: '25 mins read',
    difficulty: 'intermediate',
    source: 'NumPy.org'
  },
  {
    id: 'res-7',
    topicId: 'top-aiml-5',
    title: '100 NumPy Exercises with Solutions',
    description: 'Hands-on practice exercises testing your indexing, vectorization, and matrix maths.',
    type: 'practice',
    url: 'https://github.com/rougier/numpy-100',
    durationOrReadTime: '45 mins',
    difficulty: 'intermediate',
    source: 'GitHub / Nicolas Rougier'
  },

  // Pandas DataFrames
  {
    id: 'res-8',
    topicId: 'top-aiml-6',
    title: 'Pandas Official 10 Minutes Guide',
    description: 'Official rapid crash course on creating DataFrames, indexing, and applying lambdas.',
    type: 'documentation',
    url: 'https://pandas.pydata.org/docs/user_guide/10min.html',
    durationOrReadTime: '15 mins read',
    difficulty: 'beginner',
    source: 'Pandas Documentation'
  },
  {
    id: 'res-9',
    topicId: 'top-aiml-6',
    title: 'Exploratory Data Wrangling with Pandas',
    description: 'Hands-on tutorial cleaning real housing market data with grouping and pivoting.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=vmEHCJofslg',
    durationOrReadTime: '40 mins',
    difficulty: 'intermediate',
    source: 'Corey Schafer'
  },

  // Supervised Machine Learning
  {
    id: 'res-10',
    topicId: 'top-aiml-8',
    title: 'StatQuest: Machine Learning Fundamentals',
    description: 'Josh Starmer explains Decision Trees, Random Forests, and Bias-Variance tradeoff visually.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=Gv9_4yMHFhI',
    durationOrReadTime: '35 mins',
    difficulty: 'intermediate',
    source: 'StatQuest'
  },
  {
    id: 'res-11',
    topicId: 'top-aiml-8',
    title: 'Scikit-Learn Official User Guide',
    description: 'Detailed documentation of estimators, transformers, pipelines, and evaluation metrics.',
    type: 'documentation',
    url: 'https://scikit-learn.org/stable/user_guide.html',
    durationOrReadTime: '30 mins read',
    difficulty: 'intermediate',
    source: 'Scikit-Learn'
  },

  // SQL Joins & Selects
  {
    id: 'res-12',
    topicId: 'top-ds-2',
    title: 'PostgreSQL Tutorial: Complex Joins & Subqueries',
    description: 'Interactive reference on inner, outer, cross, and self joins with diagrams.',
    type: 'documentation',
    url: 'https://www.postgresqltutorial.com/postgresql-tutorial/postgresql-joins/',
    durationOrReadTime: '22 mins read',
    difficulty: 'beginner',
    source: 'Postgres Tutorial'
  },
  {
    id: 'res-13',
    topicId: 'top-ds-2',
    title: 'SQL Murder Mystery Interactive Investigation',
    description: 'Solve a high-stakes crime using your SQL filtering, aggregation, and joining skills.',
    type: 'practice',
    url: 'https://mystery.knightlab.com/',
    durationOrReadTime: '50 mins',
    difficulty: 'intermediate',
    source: 'Knight Lab'
  },

  // Networking TCP/IP
  {
    id: 'res-14',
    topicId: 'top-cs-2',
    title: 'Computer Networking: A Top-Down Approach Summary',
    description: 'In-depth explanation of the packet lifecycle, TCP window sizing, and DNS resolution.',
    type: 'article',
    url: 'https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/',
    durationOrReadTime: '20 mins read',
    difficulty: 'beginner',
    source: 'Cloudflare Learning'
  },
  {
    id: 'res-15',
    topicId: 'top-cs-2',
    title: 'Wireshark Packet Analysis Masterclass',
    description: 'Analyze real TCP handshakes and inspect HTTP/DNS frames in transit.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=lb1Dw0elw0Q',
    durationOrReadTime: '45 mins',
    difficulty: 'intermediate',
    source: 'NetworkChuck'
  },

  // OWASP Top 10
  {
    id: 'res-16',
    topicId: 'top-cs-9',
    title: 'OWASP Top 10 Web Application Security Risks',
    description: 'Official standard awareness document for developers and security professionals.',
    type: 'documentation',
    url: 'https://owasp.org/www-project-top-ten/',
    durationOrReadTime: '30 mins read',
    difficulty: 'intermediate',
    source: 'OWASP Foundation'
  },
  {
    id: 'res-17',
    topicId: 'top-cs-9',
    title: 'PortSwigger Web Security Academy: SQL Injection',
    description: 'Free, interactive lab challenges exploiting blind and union-based SQL injections.',
    type: 'practice',
    url: 'https://portswigger.net/web-security/sql-injection',
    durationOrReadTime: '60 mins',
    difficulty: 'intermediate',
    source: 'PortSwigger'
  },

  // React Components & Hooks
  {
    id: 'res-18',
    topicId: 'top-wd-6',
    title: 'React.dev: Quick Start & Thinking in React',
    description: 'Official modern documentation teaching declarative state management and hooks.',
    type: 'documentation',
    url: 'https://react.dev/learn',
    durationOrReadTime: '25 mins read',
    difficulty: 'beginner',
    source: 'React Official'
  },
  {
    id: 'res-19',
    topicId: 'top-wd-6',
    title: 'Jack Herrington: Advanced React Hooks Deep Dive',
    description: 'Visual breakdown of useEffect dependencies, useMemo, and custom reusable hooks.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=dpw9EHDh2bM',
    durationOrReadTime: '38 mins',
    difficulty: 'intermediate',
    source: 'Jack Herrington'
  },

  // Node.js & Express
  {
    id: 'res-20',
    topicId: 'top-wd-9',
    title: 'Express.js: Production-Ready Routing & Middleware',
    description: 'Clean architectural patterns for error middleware, validation, and modular controllers.',
    type: 'article',
    url: 'https://expressjs.com/en/guide/routing.html',
    durationOrReadTime: '20 mins read',
    difficulty: 'intermediate',
    source: 'ExpressJS Guide'
  },

  // Programming with Java Resources
  {
    id: 'res-java-1',
    topicId: 'top-java-1',
    title: 'Oracle Java SE Tutorial: Language Basics',
    description: 'Official Java reference on variables, primitive types, operators, and expressions.',
    type: 'documentation',
    url: 'https://docs.oracle.com/javase/tutorial/java/nutsandbolts/',
    durationOrReadTime: '30 mins read',
    difficulty: 'beginner',
    source: 'Oracle Docs'
  },
  {
    id: 'res-java-2',
    topicId: 'top-java-1',
    title: 'Java Programming Course for Beginners',
    description: 'Comprehensive 12-hour video tutorial teaching Java fundamentals from scratch.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=A74TOX803D0',
    durationOrReadTime: '60 mins',
    difficulty: 'beginner',
    source: 'freeCodeCamp'
  },
  {
    id: 'res-java-3',
    topicId: 'top-java-1',
    title: 'Java Logic & Control Flow Practice Labs',
    description: 'Interactive coding problems on boolean logic, if-else, and while/for loops.',
    type: 'practice',
    url: 'https://codingbat.com/java',
    durationOrReadTime: '45 mins',
    difficulty: 'beginner',
    source: 'CodingBat'
  },
  {
    id: 'res-java-4',
    topicId: 'top-java-2',
    title: 'Java Strings, StringBuilders & StringBuffers in Depth',
    description: 'Understanding String immutability, the string pool, and performance of builders.',
    type: 'article',
    url: 'https://www.baeldung.com/java-string-immutable',
    durationOrReadTime: '20 mins read',
    difficulty: 'intermediate',
    source: 'Baeldung'
  },
  {
    id: 'res-java-5',
    topicId: 'top-java-2',
    title: 'Mastering Java Arrays and Matrix Traversals',
    description: 'Complete visual walkthrough of multi-dimensional arrays and memory representation.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=r0w2T2BqZ8Y',
    durationOrReadTime: '35 mins',
    difficulty: 'beginner',
    source: 'Telusko'
  },
  {
    id: 'res-java-6',
    topicId: 'top-java-3',
    title: 'Java Classes, Objects & Access Modifiers Guide',
    description: 'Comprehensive tutorial on encapsulation, private/public/protected, and constructors.',
    type: 'documentation',
    url: 'https://docs.oracle.com/javase/tutorial/java/javaOO/',
    durationOrReadTime: '25 mins read',
    difficulty: 'intermediate',
    source: 'Oracle Docs'
  },
  {
    id: 'res-java-7',
    topicId: 'top-java-3',
    title: 'OOP Principles in Java: Encapsulation and Data Hiding',
    description: 'Modern object-oriented design and building maintainable Java classes.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=1u_uP_oP9fA',
    durationOrReadTime: '40 mins',
    difficulty: 'intermediate',
    source: 'Amigoscode'
  },
  {
    id: 'res-java-8',
    topicId: 'top-java-4',
    title: 'Abstract Classes vs Interfaces in Modern Java',
    description: 'Exploring default methods, static methods in interfaces, and multiple inheritance patterns.',
    type: 'article',
    url: 'https://www.baeldung.com/java-interface-default-methods',
    durationOrReadTime: '20 mins read',
    difficulty: 'intermediate',
    source: 'Baeldung'
  },
  {
    id: 'res-java-9',
    topicId: 'top-java-4',
    title: 'Polymorphism and Dynamic Method Dispatch',
    description: 'Deep dive into runtime polymorphism, method overriding rules, and the super keyword.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=jhDUxynEQRI',
    durationOrReadTime: '30 mins',
    difficulty: 'intermediate',
    source: 'Java Brains'
  },
  {
    id: 'res-java-10',
    topicId: 'top-java-5',
    title: 'Overview of the Java Collections Framework',
    description: 'Deep architectural overview of List, Set, Queue, and Map interfaces and implementations.',
    type: 'documentation',
    url: 'https://www.baeldung.com/java-collections',
    durationOrReadTime: '35 mins read',
    difficulty: 'intermediate',
    source: 'Baeldung'
  },
  {
    id: 'res-java-11',
    topicId: 'top-java-5',
    title: 'How HashMap Works Internally in Java',
    description: 'Visualizing hashing, bucket indices, collisions, linked list chains, and Red-Black trees.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=c3RVW3KGIIE',
    durationOrReadTime: '28 mins',
    difficulty: 'advanced',
    source: 'Defog Tech'
  },
  {
    id: 'res-java-12',
    topicId: 'top-java-6',
    title: 'Java Generics & The PECS Principle',
    description: 'Type parameters, upper bounded wildcards, lower bounded wildcards, and type erasure.',
    type: 'article',
    url: 'https://www.baeldung.com/java-generics-pecs',
    durationOrReadTime: '25 mins read',
    difficulty: 'advanced',
    source: 'Baeldung'
  },
  {
    id: 'res-java-13',
    topicId: 'top-java-7',
    title: 'Java Exception Handling & Try-With-Resources Best Practices',
    description: 'Clean exception design, avoiding anti-patterns, and the AutoCloseable interface.',
    type: 'documentation',
    url: 'https://www.baeldung.com/java-try-with-resources',
    durationOrReadTime: '20 mins read',
    difficulty: 'intermediate',
    source: 'Baeldung'
  },
  {
    id: 'res-java-14',
    topicId: 'top-java-8',
    title: 'Java Modern File I/O with NIO.2 Files and Path',
    description: 'Writing non-blocking file streams, directory walks, and JSON serialization with Jackson.',
    type: 'article',
    url: 'https://www.baeldung.com/java-nio-2-file-api',
    durationOrReadTime: '25 mins read',
    difficulty: 'intermediate',
    source: 'Baeldung'
  },
  {
    id: 'res-java-15',
    topicId: 'top-java-9',
    title: 'Java Concurrency & Multithreading In-Depth',
    description: 'Thread states, thread pools, synchronized keywords, and ReentrantLock mechanics.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=L95JbphjK4U',
    durationOrReadTime: '55 mins',
    difficulty: 'advanced',
    source: 'Defog Tech'
  },
  {
    id: 'res-java-16',
    topicId: 'top-java-10',
    title: 'Mastering Java Streams: filter, map, flatMap, reduce',
    description: 'Functional programming in Java, lazy evaluation pipelines, and parallel streams.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=1OpA3dVMc8A',
    durationOrReadTime: '45 mins',
    difficulty: 'intermediate',
    source: 'Java Brains'
  },
  {
    id: 'res-java-17',
    topicId: 'top-java-10',
    title: 'The Java Stream API In-Depth Guide',
    description: 'Comprehensive tutorials and code recipes for all Java 8 to 21 Stream operations.',
    type: 'documentation',
    url: 'https://www.baeldung.com/java-8-streams',
    durationOrReadTime: '30 mins read',
    difficulty: 'intermediate',
    source: 'Baeldung'
  },
  {
    id: 'res-java-18',
    topicId: 'top-java-11',
    title: 'Spring Data JPA & Hibernate Entity Relationships',
    description: 'Mapping @Entity, @OneToMany, @ManyToOne, and tuning N+1 query problems.',
    type: 'documentation',
    url: 'https://www.baeldung.com/the-persistence-layer-with-spring-and-jpa',
    durationOrReadTime: '30 mins read',
    difficulty: 'intermediate',
    source: 'Baeldung'
  },
  {
    id: 'res-java-19',
    topicId: 'top-java-12',
    title: 'Spring Boot 3 Quickstart Guide & REST Controller Design',
    description: 'Bootstrapping enterprise REST APIs with Spring initializr, MVC, and dependency injection.',
    type: 'documentation',
    url: 'https://spring.io/guides/gs/rest-service/',
    durationOrReadTime: '30 mins read',
    difficulty: 'advanced',
    source: 'Spring.io'
  },
  {
    id: 'res-java-20',
    topicId: 'top-java-12',
    title: 'Full Stack Spring Boot Microservices Tutorial',
    description: 'Complete architectural walkthrough of building modern production microservices in Java.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=mScd-5qS27E',
    durationOrReadTime: '75 mins',
    difficulty: 'advanced',
    source: 'freeCodeCamp'
  },
  {
    id: 'res-java-21',
    topicId: 'top-java-13',
    title: 'JUnit 5 & Mockito In-Depth Testing Guide',
    description: 'Writing unit tests with assertions, mocks, stubs, and testing REST controller layers.',
    type: 'documentation',
    url: 'https://www.baeldung.com/mockito-series',
    durationOrReadTime: '25 mins read',
    difficulty: 'intermediate',
    source: 'Baeldung'
  },
  {
    id: 'res-java-22',
    topicId: 'top-java-14',
    title: 'Understanding JVM Internals, ClassLoaders & Garbage Collectors',
    description: 'Heap memory, Stack frames, Metaspace, and comparing G1, ZGC, and Shenandoah collectors.',
    type: 'article',
    url: 'https://www.baeldung.com/jvm-garbage-collectors',
    durationOrReadTime: '30 mins read',
    difficulty: 'advanced',
    source: 'Baeldung'
  },

  // Programming with Python Resources
  {
    id: 'res-py-1',
    topicId: 'top-py-1',
    title: 'Official Python 3 Tutorial: An Informal Introduction',
    description: 'The definitive guide to Python numbers, strings, lists, and indentation rules.',
    type: 'documentation',
    url: 'https://docs.python.org/3/tutorial/introduction.html',
    durationOrReadTime: '25 mins read',
    difficulty: 'beginner',
    source: 'Python Docs'
  },
  {
    id: 'res-py-2',
    topicId: 'top-py-1',
    title: 'Python for Beginners - Full Course',
    description: 'Hands-on video course explaining variables, conditional logic, loops, and script execution.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=eWRfhZUzrAc',
    durationOrReadTime: '55 mins',
    difficulty: 'beginner',
    source: 'freeCodeCamp'
  },
  {
    id: 'res-py-3',
    topicId: 'top-py-1',
    title: 'Python Syntax & Logic Interactive Coding Challenges',
    description: 'Solve real algorithmic exercises to practice loops, branch logic, and basic operators.',
    type: 'practice',
    url: 'https://www.codewars.com/collections/python-fundamentals-1',
    durationOrReadTime: '30 mins',
    difficulty: 'beginner',
    source: 'Codewars'
  },
  {
    id: 'res-py-4',
    topicId: 'top-py-2',
    title: 'Defining Functions, *args, **kwargs and Scopes',
    description: 'Comprehensive guide to parameter unpacking, keyword arguments, and local vs global scope.',
    type: 'documentation',
    url: 'https://realpython.com/defining-your-own-python-function/',
    durationOrReadTime: '20 mins read',
    difficulty: 'beginner',
    source: 'Real Python'
  },
  {
    id: 'res-py-5',
    topicId: 'top-py-2',
    title: 'Variable Scope and the LEGB Rule Explained',
    description: 'Visual breakdown of Local, Enclosing, Global, and Built-in namespace resolution in Python.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=QVdf0LnM440',
    durationOrReadTime: '25 mins',
    difficulty: 'intermediate',
    source: 'Corey Schafer'
  },
  {
    id: 'res-py-6',
    topicId: 'top-py-3',
    title: 'Lists, Tuples, Dictionaries and Sets in Depth',
    description: 'Performance characteristics, mutability, hashability, and common methods.',
    type: 'documentation',
    url: 'https://realpython.com/python-data-structures/',
    durationOrReadTime: '25 mins read',
    difficulty: 'intermediate',
    source: 'Real Python'
  },
  {
    id: 'res-py-7',
    topicId: 'top-py-3',
    title: 'List and Dictionary Comprehensions Masterclass',
    description: 'Learn how to write elegant, idiomatic one-line transformations and filters in Python.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=3dt4xGhPglc',
    durationOrReadTime: '20 mins',
    difficulty: 'beginner',
    source: 'Corey Schafer'
  },
  {
    id: 'res-py-8',
    topicId: 'top-py-4',
    title: 'Python f-strings & Regular Expressions with re Module',
    description: 'String interpolation speed, pattern compilation, groups, and substitution.',
    type: 'article',
    url: 'https://realpython.com/python-f-strings/',
    durationOrReadTime: '20 mins read',
    difficulty: 'intermediate',
    source: 'Real Python'
  },
  {
    id: 'res-py-9',
    topicId: 'top-py-5',
    title: 'Object-Oriented Programming (OOP) in Python 3',
    description: 'Classes, instance attributes, methods, self keyword, and the __init__ initializer.',
    type: 'documentation',
    url: 'https://realpython.com/python3-object-oriented-programming/',
    durationOrReadTime: '30 mins read',
    difficulty: 'intermediate',
    source: 'Real Python'
  },
  {
    id: 'res-py-10',
    topicId: 'top-py-5',
    title: 'Python OOP: Special (Dunder) Methods Explained',
    description: 'Mastering __repr__, __str__, __len__, __add__, and creating intuitive Pythonic objects.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=3ohzBmxTVTL',
    durationOrReadTime: '22 mins',
    difficulty: 'intermediate',
    source: 'Corey Schafer'
  },
  {
    id: 'res-py-11',
    topicId: 'top-py-6',
    title: 'Python Dataclasses vs NamedTuples vs Pydantic',
    description: 'Cleaner data classes with type hints, default values, and immutability flags.',
    type: 'article',
    url: 'https://realpython.com/python-data-classes/',
    durationOrReadTime: '25 mins read',
    difficulty: 'intermediate',
    source: 'Real Python'
  },
  {
    id: 'res-py-12',
    topicId: 'top-py-7',
    title: 'Reading and Writing Files in Python (pathlib & json)',
    description: 'Modern file paths with pathlib, with statements, error handling, and JSON serialization.',
    type: 'documentation',
    url: 'https://realpython.com/read-write-files-python/',
    durationOrReadTime: '25 mins read',
    difficulty: 'intermediate',
    source: 'Real Python'
  },
  {
    id: 'res-py-13',
    topicId: 'top-py-8',
    title: 'Python Exception Handling & Robust Logging',
    description: 'Creating custom exception subclasses, try-except-else blocks, and logging configurations.',
    type: 'article',
    url: 'https://realpython.com/python-exceptions/',
    durationOrReadTime: '20 mins read',
    difficulty: 'intermediate',
    source: 'Real Python'
  },
  {
    id: 'res-py-14',
    topicId: 'top-py-9',
    title: 'Generators and Iterators: Memory-Efficient Code',
    description: 'How yield works, generator expressions, and building memory-efficient data pipelines.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=bD05uGo_sVI',
    durationOrReadTime: '30 mins',
    difficulty: 'intermediate',
    source: 'Corey Schafer'
  },
  {
    id: 'res-py-15',
    topicId: 'top-py-10',
    title: 'Primer on Python Decorators',
    description: 'First-class functions, closures, wrapping functions with @functools.wraps, and timer decorators.',
    type: 'article',
    url: 'https://realpython.com/primer-on-python-decorators/',
    durationOrReadTime: '25 mins read',
    difficulty: 'advanced',
    source: 'Real Python'
  },
  {
    id: 'res-py-16',
    topicId: 'top-py-11',
    title: 'Asyncio in Python: Complete Asynchronous Guide',
    description: 'Coroutines, event loops, tasks, gather, and building high-throughput network clients.',
    type: 'documentation',
    url: 'https://realpython.com/async-io-python/',
    durationOrReadTime: '35 mins read',
    difficulty: 'advanced',
    source: 'Real Python'
  },
  {
    id: 'res-py-17',
    topicId: 'top-py-11',
    title: 'Python Asynchronous Programming Tutorial',
    description: 'Hands-on video walkthrough of async def, await, asyncio.sleep, and non-blocking I/O.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=t5Bo1Je9EmE',
    durationOrReadTime: '40 mins',
    difficulty: 'advanced',
    source: 'Tech With Tim'
  },
  {
    id: 'res-py-18',
    topicId: 'top-py-12',
    title: 'FastAPI Tutorial: First Steps & Automatic Docs',
    description: 'Official interactive FastAPI guide covering path operations, Pydantic schemas, and Swagger UI.',
    type: 'documentation',
    url: 'https://fastapi.tiangolo.com/tutorial/first-steps/',
    durationOrReadTime: '30 mins read',
    difficulty: 'intermediate',
    source: 'FastAPI Docs'
  },
  {
    id: 'res-py-19',
    topicId: 'top-py-12',
    title: 'FastAPI - Full Course for Beginners',
    description: 'Building modern REST APIs with async database queries, validation, and JWT auth.',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=0sOvCWFmrtA',
    durationOrReadTime: '65 mins',
    difficulty: 'intermediate',
    source: 'freeCodeCamp'
  },
  {
    id: 'res-py-20',
    topicId: 'top-py-13',
    title: 'Effective Python Testing with PyTest and Fixtures',
    description: 'Writing concise tests, parameterized test runs, mocking dependencies, and checking coverage.',
    type: 'documentation',
    url: 'https://realpython.com/pytest-python-testing/',
    durationOrReadTime: '30 mins read',
    difficulty: 'intermediate',
    source: 'Real Python'
  },
  {
    id: 'res-py-21',
    topicId: 'top-py-14',
    title: 'SQLAlchemy 2.0 Unified Tutorial & Async Migrations',
    description: 'Declarative models, Session API, relationship mappings, and Alembic versioning.',
    type: 'documentation',
    url: 'https://docs.sqlalchemy.org/en/20/tutorial/',
    durationOrReadTime: '35 mins read',
    difficulty: 'advanced',
    source: 'SQLAlchemy Docs'
  },
  {
    id: 'res-py-22',
    topicId: 'top-py-15',
    title: 'Modern Python Project Setup with Poetry and Docker',
    description: 'Dependency resolution with Poetry, formatting with Ruff, and creating minimal Docker images.',
    type: 'article',
    url: 'https://realpython.com/dependency-management-python-poetry/',
    durationOrReadTime: '25 mins read',
    difficulty: 'advanced',
    source: 'Real Python'
  }
];

export const INITIAL_QUIZZES: QuizQuestion[] = [
  {
    id: 'quiz-1',
    topicId: 'top-aiml-1',
    question: 'Which of the following conditions correctly tests if a variable `x` is both positive and an even number in programming logic?',
    options: [
      'x > 0 and x % 2 == 0',
      'x >= 0 or x % 2 == 1',
      'x > 0 and x / 2 == 0',
      'x > 0 or x % 2 == 0'
    ],
    correctIndex: 0,
    explanation: '`x > 0` ensures positivity and `x % 2 == 0` ensures the remainder when divided by 2 is zero, which is the definition of an even integer.'
  },
  {
    id: 'quiz-2',
    topicId: 'top-aiml-1',
    question: 'What is the time complexity of searching for an element in an unsorted array of size N?',
    options: [
      'O(1)',
      'O(log N)',
      'O(N)',
      'O(N^2)'
    ],
    correctIndex: 2,
    explanation: 'Because the array is unsorted, in the worst case we must inspect each of the N elements one by one (Linear Time O(N)).'
  },
  {
    id: 'quiz-3',
    topicId: 'top-aiml-3',
    question: 'In Python, what is the primary advantage of a generator expression over a standard list comprehension?',
    options: [
      'Generators execute multithreaded code automatically',
      'Generators produce items on demand (lazy evaluation), consuming minimal memory for large sequences',
      'Generators allow random indexing by position like lists',
      'Generators cannot throw exceptions'
    ],
    correctIndex: 1,
    explanation: 'Generators yield items lazily one at a time using iterator protocols, preventing entire arrays from loading into RAM simultaneously.'
  },
  {
    id: 'quiz-4',
    topicId: 'top-aiml-5',
    question: 'When performing operations between two NumPy arrays of shapes (3, 1) and (1, 4), what will be the resulting broadcasted shape?',
    options: [
      '(3, 4)',
      '(3, 1)',
      '(1, 4)',
      'An error will be thrown due to mismatched dimensions'
    ],
    correctIndex: 0,
    explanation: 'According to NumPy broadcasting rules, dimensions of size 1 are stretched to match the non-singleton dimension of the other array, resulting in (3, 4).'
  },
  {
    id: 'quiz-5',
    topicId: 'top-ds-2',
    question: 'Which SQL keyword is used to filter rows AFTER group aggregation has occurred?',
    options: [
      'WHERE',
      'HAVING',
      'FILTER',
      'ORDER BY'
    ],
    correctIndex: 1,
    explanation: '`WHERE` filters records before grouping, whereas `HAVING` filters the results of aggregate functions (such as COUNT or AVG) after grouping.'
  },
  {
    id: 'quiz-6',
    topicId: 'top-cs-2',
    question: 'What is the correct sequence of packets exchanged during a standard TCP 3-way handshake?',
    options: [
      'ACK → SYN → SYN-ACK',
      'SYN → SYN-ACK → ACK',
      'SYN → ACK → FIN',
      'RST → SYN → ACK'
    ],
    correctIndex: 1,
    explanation: 'The client sends SYN, the server responds with SYN-ACK, and the client confirms with ACK before data transmission begins.'
  },
  {
    id: 'quiz-7',
    topicId: 'top-wd-6',
    question: 'In React, what will happen if you do not pass a dependency array to `useEffect` (i.e. useEffect(fn))?',
    options: [
      'The effect will only execute once on initial mount',
      'The effect will run after every single render of the component',
      'The effect will never execute',
      'React will throw a runtime syntax error'
    ],
    correctIndex: 1,
    explanation: 'Without any dependency array, React invokes the effect callback after every render cycle.'
  },
  {
    id: 'quiz-8',
    topicId: 'top-cs-9',
    question: 'Which vulnerability occurs when user-supplied input is directly concatenated into a database command without parameterization?',
    options: [
      'Cross-Site Scripting (XSS)',
      'Cross-Site Request Forgery (CSRF)',
      'SQL Injection (SQLi)',
      'Insecure Direct Object Reference (IDOR)'
    ],
    correctIndex: 2,
    explanation: 'SQL Injection allows malicious input to alter the structure of database queries if prepared statements are not utilized.'
  },
  {
    id: 'quiz-java-1',
    topicId: 'top-java-1',
    question: 'In Java, which of the following represents a primitive data type rather than a reference type?',
    options: [
      'String',
      'int',
      'Integer',
      'ArrayList'
    ],
    correctIndex: 1,
    explanation: '`int` is a built-in 32-bit signed primitive type, whereas String, Integer, and ArrayList are reference objects allocated on the heap.'
  },
  {
    id: 'quiz-java-2',
    topicId: 'top-java-4',
    question: 'Which Java keyword allows an overriding subclass method to invoke the original implementation in the superclass?',
    options: [
      'this',
      'base',
      'super',
      'parent'
    ],
    correctIndex: 2,
    explanation: '`super` explicitly accesses members and constructors belonging to the parent superclass.'
  },
  {
    id: 'quiz-java-3',
    topicId: 'top-java-5',
    question: 'In Java 8+, how does HashMap handle high-frequency hash collisions within a single bucket?',
    options: [
      'It discards older entries silently',
      'It resizes the array and throws a ConcurrentModificationException',
      'It converts the bucket linked list into a balanced Red-Black Tree once threshold (8) is exceeded',
      'It distributes collisions into an external disk cache'
    ],
    correctIndex: 2,
    explanation: 'When a bucket exceeds TREEIFY_THRESHOLD (8 entries), Java converts the linked list to a Red-Black tree (TreeNode), improving worst-case lookup from O(N) to O(log N).'
  },
  {
    id: 'quiz-java-4',
    topicId: 'top-java-10',
    question: 'In the Java Stream API, which of the following operations is a TERMINAL operation (closing the pipeline)?',
    options: [
      'map()',
      'filter()',
      'collect()',
      'distinct()'
    ],
    correctIndex: 2,
    explanation: '`collect()` executes the pipeline and accumulates elements into a collection (like a List). `map()`, `filter()`, and `distinct()` are lazy intermediate operations.'
  },
  {
    id: 'quiz-java-5',
    topicId: 'top-java-12',
    question: 'In Spring Boot, which annotation combines @Controller and @ResponseBody to create JSON REST endpoints?',
    options: [
      '@Service',
      '@RestController',
      '@Repository',
      '@Endpoint'
    ],
    correctIndex: 1,
    explanation: '`@RestController` marks the class as a request handler and automatically serializes return values directly to JSON or XML in the HTTP response body.'
  },
  {
    id: 'quiz-py-1',
    topicId: 'top-py-2',
    question: 'In Python, what does prefixing a function parameter with `*args` enable?',
    options: [
      'It forces arguments to be passed as key-value pairs',
      'It allows the function to accept an arbitrary number of positional arguments bundled as a tuple',
      'It automatically compiles the arguments as C-pointers',
      'It makes the function execute in an isolated thread'
    ],
    correctIndex: 1,
    explanation: '`*args` gathers any remaining positional arguments passed to the function into a single tuple.'
  },
  {
    id: 'quiz-py-2',
    topicId: 'top-py-3',
    question: 'What is the average-case time complexity of retrieving a value by its key from a Python dict?',
    options: [
      'O(1)',
      'O(log N)',
      'O(N)',
      'O(N log N)'
    ],
    correctIndex: 0,
    explanation: 'Python dictionaries are implemented with high-performance hash tables offering constant O(1) average lookup time.'
  },
  {
    id: 'quiz-py-3',
    topicId: 'top-py-5',
    question: 'Which special dunder method should you implement in Python to return a readable string representation of an object for end-users?',
    options: [
      '__init__',
      '__str__',
      '__len__',
      '__call__'
    ],
    correctIndex: 1,
    explanation: '`__str__` is invoked by `str(obj)` and `print(obj)` to produce a user-friendly string presentation.'
  },
  {
    id: 'quiz-py-4',
    topicId: 'top-py-11',
    question: 'In Python asyncio, what keyword must you place before a coroutine call to pause execution until it completes without blocking the event loop?',
    options: [
      'wait',
      'yield',
      'await',
      'defer'
    ],
    correctIndex: 2,
    explanation: '`await` yields control back to the asyncio event loop while waiting for the coroutine or future result.'
  },
  {
    id: 'quiz-py-5',
    topicId: 'top-py-12',
    question: 'Which library does FastAPI use for high-speed data schema validation and serialization based on Python type hints?',
    options: [
      'Marshmallow',
      'Pydantic',
      'Cerberus',
      'Attrs'
    ],
    correctIndex: 1,
    explanation: 'FastAPI leverages Pydantic models for request body validation, type coercion, and OpenAPI schema generation.'
  }
];

export const INITIAL_USER_PROGRESS = [
  // Alex Chen has completed foundational topics 1, 2, 3 in AI & ML and is currently at topic 4
  { userId: 'user-1', topicId: 'top-aiml-1', status: 'completed' as const, completedAt: '2026-08-28T11:00:00.000Z', quizScore: 100 },
  { userId: 'user-1', topicId: 'top-aiml-2', status: 'completed' as const, completedAt: '2026-08-30T15:20:00.000Z', quizScore: 90 },
  { userId: 'user-1', topicId: 'top-aiml-3', status: 'completed' as const, completedAt: '2026-09-01T14:10:00.000Z', quizScore: 100 },
  { userId: 'user-1', topicId: 'top-aiml-4', status: 'in_progress' as const },

  // Marcus Vance in Cyber
  { userId: 'user-2', topicId: 'top-cs-1', status: 'completed' as const, completedAt: '2026-08-25T10:00:00.000Z' },
  { userId: 'user-2', topicId: 'top-cs-2', status: 'completed' as const, completedAt: '2026-08-29T16:00:00.000Z' },
  { userId: 'user-2', topicId: 'top-cs-3', status: 'in_progress' as const },

  // Elena in Data Science
  { userId: 'user-3', topicId: 'top-ds-1', status: 'completed' as const, completedAt: '2026-08-24T12:00:00.000Z' },
  { userId: 'user-3', topicId: 'top-ds-2', status: 'completed' as const, completedAt: '2026-08-27T18:00:00.000Z' },
  { userId: 'user-3', topicId: 'top-ds-3', status: 'completed' as const, completedAt: '2026-08-31T09:00:00.000Z' }
];

export const INITIAL_ACTIVITY_LOGS = [
  {
    id: 'act-1',
    userId: 'user-1',
    action: 'completed_topic' as const,
    topicId: 'top-aiml-3',
    topicTitle: 'Python Syntax & Functional Primitives',
    domainId: 'domain-aiml',
    timestamp: '2026-09-01T14:10:00.000Z',
    details: 'Scored 100% on the topic quiz'
  },
  {
    id: 'act-2',
    userId: 'user-1',
    action: 'started_topic' as const,
    topicId: 'top-aiml-4',
    topicTitle: 'Classes, Objects & Inheritance in Python',
    domainId: 'domain-aiml',
    timestamp: '2026-09-02T10:00:00.000Z',
    details: 'Viewed course resources and exercises'
  }
];

export const COMMON_SKILLS_LIST = [
  'Python',
  'Java',
  'C++',
  'JavaScript',
  'TypeScript',
  'SQL',
  'HTML',
  'CSS',
  'Linux',
  'Git',
  'Excel',
  'Statistics',
  'NumPy',
  'Pandas',
  'React',
  'Node.js',
  'Express.js',
  'Docker',
  'Networking',
  'Cryptography',
  'Spring Boot',
  'FastAPI',
  'JUnit 5',
  'PyTest',
  'asyncio',
  'Hibernate',
  'Multithreading'
];
