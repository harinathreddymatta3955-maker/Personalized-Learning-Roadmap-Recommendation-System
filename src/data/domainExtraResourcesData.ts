import { DomainExtraResource } from '../types';

export const DOMAIN_EXTRA_RESOURCES: Record<string, DomainExtraResource> = {
  // 1. AI & Machine Learning
  'domain-aiml': {
    id: 'extra-res-aiml',
    domainId: 'domain-aiml',
    title: 'AI & Machine Learning Industry Capstone Problems',
    subtitle: 'Production-Grade ML Challenges, Low-Latency Inference & Model Degradation Scenarios',
    description: 'A curated suite of real-world enterprise engineering problems designed to test end-to-end ML architecture, feature engineering under constraints, and handling non-stationary production distributions.',
    isOptional: true,
    badgeText: 'Domain Mastery Capstone • Optional Extra Resource',
    keyCompetencies: [
      'Low-Latency Inference SLAs',
      'Train-Serving Skew & Online Feature Stores',
      'Extreme Class Imbalance & Focal Loss',
      'Long-Context Attention Bottlenecks',
      'Continual Learning & Concept Drift'
    ],
    problems: [
      {
        id: 'prob-aiml-1',
        domainId: 'domain-aiml',
        title: 'Sub-50ms Real-Time Credit Card Fraud Inference Pipeline',
        difficulty: 'mastery',
        category: 'Production MLOps & Streaming Features',
        estimatedEffort: '3 - 5 hours',
        tags: ['Real-Time Inference', 'Class Imbalance', 'Concept Drift', 'Feature Store'],
        scenarioDescription: 'You are deploying an XGBoost + Deep Tabular Embedding model processing 15,000 transactions/second with a strict 99.9th percentile latency budget of 50ms. Ground-truth fraud labels arrive with a 30 to 90 day lag due to banking chargeback disputes. The raw class imbalance is 1 fraud case per 2,500 transactions (0.04%).',
        keyQuestionsToSolve: [
          'How do you construct an online feature store that calculates 5-minute, 1-hour, and 24-hour spending velocity without introducing train-serving skew?',
          'How do you train the model without allowing extreme class imbalance to distort calibration, and why does standard SMOTE oversampling often fail in high-throughput production?',
          'In the absence of immediate ground-truth labels, what statistical distance metrics and proxy signals should trigger an automated model rollback or retrain alert?'
        ],
        hints: [
          {
            id: 'h-aiml-1-1',
            order: 1,
            label: 'Hint 1: Online Feature Retrieval & Latency',
            content: 'Avoid querying relational databases during the live inference path. Pre-compute rolling aggregations using a distributed streaming engine (e.g. Apache Flink) that continuously writes point-in-time state to an in-memory key-value store (Redis or Dragonfly) using sliding window hashes.'
          },
          {
            id: 'h-aiml-1-2',
            order: 2,
            label: 'Hint 2: Handling Imbalance & Calibration',
            content: 'Synthetic oversampling (SMOTE) generates synthetic points in high-dimensional space that often violate real financial transaction constraints and skew downstream probability calibration. Instead, explore Focal Loss or asymmetric cross-entropy with isotonic probability recalibration on a held-out temporal validation set.'
          },
          {
            id: 'h-aiml-1-3',
            order: 3,
            label: 'Hint 3: Label Lag & Unsupervised Drift Detection',
            content: 'Monitor Population Stability Index (PSI) and Wasserstein Distance (Earth Mover\'s Distance) on the top 10 most influential feature distributions every hour. Concurrently track prediction score distribution percentiles (e.g., if P99 fraud score suddenly shifts by >15%, alert immediately).'
          }
        ]
      },
      {
        id: 'prob-aiml-2',
        domainId: 'domain-aiml',
        title: 'Transformer Attention Memory Bottleneck in Long-Document Retrieval',
        difficulty: 'advanced',
        category: 'Deep Learning & Natural Language Processing',
        estimatedEffort: '2 - 4 hours',
        tags: ['Transformers', 'RAG', 'FlashAttention', 'Context Scaling'],
        scenarioDescription: 'An enterprise contract intelligence platform needs to analyze 250-page legal contracts (approx. 100,000 tokens) with strict accuracy and zero hallucination. Standard dot-product self-attention scales quadratically O(N²) in memory and compute, exceeding GPU VRAM limits.',
        keyQuestionsToSolve: [
          'How do you preserve cross-clause semantic dependencies without losing context when chunking multi-page contracts?',
          'What are the performance trade-offs between linear state-space models (e.g., Mamba), hardware-aware FlashAttention-2, and late-interaction ColBERT retrieval?',
          'How should you evaluate needle-in-a-haystack retrieval recall across ambiguous legal terminology?'
        ],
        hints: [
          {
            id: 'h-aiml-2-1',
            order: 1,
            label: 'Hint 1: Chunking & Hierarchical Metadata',
            content: 'Do not use fixed-length naive character sliding windows. Use structural parsing that respects document sections, appending hierarchical breadcrumbs (e.g., "Contract > Section 4: Indemnification > Subsection B") to each chunk vector payload.'
          },
          {
            id: 'h-aiml-2-2',
            order: 2,
            label: 'Hint 2: Multi-Stage Retrieval Architecture',
            content: 'Combine fast sparse retrieval (BM25 with domain-specific legal stopword tuning) with dense vector cosine similarity using Reciprocal Rank Fusion (RRF). Pass top candidates through a cross-encoder reranker before feeding them into the generation context window.'
          },
          {
            id: 'h-aiml-2-3',
            order: 3,
            label: 'Hint 3: Hardware Memory Optimization',
            content: 'If running self-hosted models, ensure tile-based memory I/O optimization like FlashAttention-2 is enabled to eliminate intermediate N×N attention matrix materialization in High Bandwidth Memory (HBM).'
          }
        ]
      },
      {
        id: 'prob-aiml-3',
        domainId: 'domain-aiml',
        title: 'Continual Learning & Catastrophic Forgetting in Recommendation Systems',
        difficulty: 'advanced',
        category: 'Algorithmic Modeling & Reinforcement Learning',
        estimatedEffort: '3 - 4 hours',
        tags: ['Recommendation Systems', 'Two-Tower', 'Cold Start', 'Continual Learning'],
        scenarioDescription: 'During seasonal flash events, user behavior changes radically in minutes. A two-tower neural collaborative filtering model trained on historic monthly data fails to recommend newly trending products and exhibits catastrophic forgetting of niche long-tail preferences when quickly fine-tuned.',
        keyQuestionsToSolve: [
          'How do you decouple fast-moving session dynamics from slow-moving foundational user profile representations?',
          'How should the exploration-versus-exploitation trade-off be formulated to surface cold-start items without degrading overall click-through rate (CTR)?'
        ],
        hints: [
          {
            id: 'h-aiml-3-1',
            order: 1,
            label: 'Hint 1: Two-Tower Dual-Timescale Design',
            content: 'Separate the user tower into two sub-networks: a frozen or slowly decaying historical affinity tower, and a lightweight recurrent/transformer session tower that ingests the user\'s last 10 real-time clicks.'
          },
          {
            id: 'h-aiml-3-2',
            order: 2,
            label: 'Hint 2: Cold-Start Exploration Bandits',
            content: 'Implement contextual Multi-Armed Bandits (such as LinUCB or Thompson Sampling) allocating 5-10% of recommendation slots to candidate items with high epistemic uncertainty (low impression count but high content similarity).'
          }
        ]
      }
    ],
    externalReferences: [
      { title: 'Google Rules of Machine Learning: Best Practices for ML Engineering', url: 'https://developers.google.com/machine-learning/guides/rules-of-ml', source: 'Google AI' },
      { title: 'Designing Machine Learning Systems by Chip Huyen', url: 'https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/', source: "O'Reilly" }
    ]
  },

  // 2. Data Science
  'domain-datasci': {
    id: 'extra-res-datasci',
    domainId: 'domain-datasci',
    title: 'Data Science Industry Capstone Problems',
    subtitle: 'Causal Inference, Attribution Modeling & Enterprise Time-Series Analytics',
    description: 'Mastery scenarios addressing attribution in privacy-conscious environments, quasi-experimental causal estimation, and non-stationary anomaly detection.',
    isOptional: true,
    badgeText: 'Domain Mastery Capstone • Optional Extra Resource',
    keyCompetencies: [
      'Multi-Touch Attribution Modeling',
      'Causal Inference & Network Spillover',
      'Quasi-Experimental Design (DiD / Synthetic Controls)',
      'STL Decomposition & Non-Stationary Time Series',
      'Probabilistic Customer Identity Stitching'
    ],
    problems: [
      {
        id: 'prob-ds-1',
        domainId: 'domain-datasci',
        title: 'Probabilistic Multi-Touch Attribution under Cookie Deprecation',
        difficulty: 'mastery',
        category: 'Statistical Modeling & Marketing Analytics',
        estimatedEffort: '3 - 5 hours',
        tags: ['Attribution Modeling', 'Markov Chains', 'Shapley Values', 'Data Privacy'],
        scenarioDescription: 'Customers interact with paid search, social display, organic newsletters, and product webinars over a 90-day B2B sales cycle. Third-party cookie restrictions and cross-device browsing prevent deterministic user journey tracking.',
        keyQuestionsToSolve: [
          'Why do traditional first-click or last-touch heuristics severely undervalue upper-funnel content marketing?',
          'How can Markov Chain removal effect models or Cooperative Game Theory (Shapley Values) calculate the marginal contribution of each channel?',
          'How do you validate algorithmic attribution models against real-world geo-lift incrementality tests?'
        ],
        hints: [
          {
            id: 'h-ds-1-1',
            order: 1,
            label: 'Hint 1: Markov Transition Matrix Modeling',
            content: 'Represent multi-channel customer journeys as a state transition matrix with Start, intermediate touchpoints (Channels 1...K), Conversion, and Null (Drop-off) absorbing states. The removal effect of channel C is calculated by setting its transition probabilities to drop-off and measuring the percentage reduction in overall conversion probability.'
          },
          {
            id: 'h-ds-1-2',
            order: 2,
            label: 'Hint 2: Shapley Value Calculation & Combinatorics',
            content: 'Because full Shapley calculation requires 2^N coalition permutations, cluster low-volume marketing touchpoints into macro-categories (e.g., Awareness, Consideration, Decision) or apply Monte Carlo sampling approximations to evaluate marginal gains.'
          },
          {
            id: 'h-ds-1-3',
            order: 3,
            label: 'Hint 3: Ground-Truth Incrementality Calibration',
            content: 'Never rely solely on observational attribution. Run matched-market geo-lift tests where specific geographic regions are blacked out from advertising to measure true causal lift (incremental ROAS) and calibrate your algorithmic attribution weights.'
          }
        ]
      },
      {
        id: 'prob-ds-2',
        domainId: 'domain-datasci',
        title: 'Causal Inference in Two-Sided Marketplaces with Network Spillovers',
        difficulty: 'advanced',
        category: 'Experimental Design & Econometrics',
        estimatedEffort: '2 - 4 hours',
        tags: ['A/B Testing', 'Network Interference', 'Switchback Testing', 'Difference-in-Differences'],
        scenarioDescription: 'You are testing an algorithmic surge pricing incentive in an on-demand ride-hailing or delivery platform. When treated drivers receive higher incentives, they absorb ride requests in the same zone, cannibalizing business from control drivers and violating the Stable Unit Treatment Value Assumption (SUTVA).',
        keyQuestionsToSolve: [
          'Why does standard user-level or driver-level randomized A/B testing fail when subjects compete for shared inventory or supply?',
          'How does cluster randomization or time-sliced switchback testing eliminate interference bias?',
          'How do you adjust hypothesis testing for temporal auto-correlation in switchback residual errors?'
        ],
        hints: [
          {
            id: 'h-ds-2-1',
            order: 1,
            label: 'Hint 1: The SUTVA Violation',
            content: 'When treatment units directly affect the potential outcomes of control units through shared supply, the estimated treatment effect is contaminated. Driver-level randomization results in either underestimating or severely overestimating true net impact.'
          },
          {
            id: 'h-ds-2-2',
            order: 2,
            label: 'Hint 2: Switchback Design & Clustered Geo-Hexagons',
            content: 'Use space-time block randomization (switchbacks). Randomize entire geographic clusters (e.g. Uber H3 hexagonal spatial grids) across alternating 2-hour or 4-hour temporal windows, with washout buffers between transitions to allow market equilibrium to reset.'
          },
          {
            id: 'h-ds-2-3',
            order: 3,
            label: 'Hint 3: Correcting for Autocorrelation in Variance',
            content: 'Standard OLS t-tests will produce artificially tiny p-values due to serially correlated errors across consecutive time intervals. Cluster standard errors at the switchback window level or run permutation / Newey-West HAC tests.'
          }
        ]
      },
      {
        id: 'prob-ds-3',
        domainId: 'domain-datasci',
        title: 'Anomaly Detection in Non-Stationary Financial Ledger Time-Series',
        difficulty: 'advanced',
        category: 'Time Series & Unsupervised Learning',
        estimatedEffort: '2 - 3 hours',
        tags: ['Time Series', 'Anomaly Detection', 'STL Decomposition', 'Isolation Forest'],
        scenarioDescription: 'A multi-currency corporate payments system processes millions of wire transfers daily. High transaction volume on Fridays and quarter-ends causes naive fixed-threshold anomaly detectors to generate thousands of false alerts.',
        keyQuestionsToSolve: [
          'How do you isolate true irregularities from legitimate recurring seasonal spikes?',
          'How do you combine point anomaly detectors with sequence pattern detectors for structuring (smurfing) behavior?'
        ],
        hints: [
          {
            id: 'h-ds-3-1',
            order: 1,
            label: 'Hint 1: Decomposing Non-Stationary Components',
            content: 'Apply robust STL (Seasonal and Trend decomposition using Loess) to decouple the time-series into trend, daily/weekly seasonalities, and remainder noise. Run your anomaly detection strictly on the stationary remainder residuals.'
          },
          {
            id: 'h-ds-3-2',
            order: 2,
            label: 'Hint 2: Multivariate Relational Scoring',
            content: 'Feed residual deviations alongside graph-derived features (e.g., in-degree velocity, out-degree entropy, payment cadence) into an Isolation Forest or an Autoencoder whose reconstruction loss flags anomalous transactions.'
          }
        ]
      }
    ],
    externalReferences: [
      { title: 'Causal Inference for The Brave and True by Matheus Facure', url: 'https://matheusfacure.github.io/python-causality-handbook/', source: 'Open Book' },
      { title: 'Forecasting: Principles and Practice (Hyndman & Athanasopoulos)', url: 'https://otexts.com/fpp3/', source: 'Monash University' }
    ]
  },

  // 3. Cybersecurity
  'domain-cyber': {
    id: 'extra-res-cyber',
    domainId: 'domain-cyber',
    title: 'Cybersecurity Red & Blue Team Capstone Problems',
    subtitle: 'Zero-Trust Architectures, Exploit Analysis & Critical Infrastructure Defense',
    description: 'High-stakes security challenges covering modern serverless SSRF vulnerabilities, Active Directory Kerberos attack chains, and side-channel timing attacks.',
    isOptional: true,
    badgeText: 'Domain Mastery Capstone • Optional Extra Resource',
    keyCompetencies: [
      'Serverless SSRF & Cloud Metadata Protection',
      'Kerberoasting & Golden Ticket Attack Mitigation',
      'Constant-Time Cryptographic Verification',
      'DNS Rebinding & Egress Filtering',
      'Defense-in-Depth Identity Segmentation'
    ],
    problems: [
      {
        id: 'prob-cs-1',
        domainId: 'domain-cyber',
        title: 'Serverless Blind SSRF Exploitation & AWS Metadata Service (IMDSv2) Defense',
        difficulty: 'mastery',
        category: 'Cloud Security & Application Defense',
        estimatedEffort: '3 - 5 hours',
        tags: ['SSRF', 'AWS IMDSv2', 'DNS Rebinding', 'Cloud Security'],
        scenarioDescription: 'A PDF export microservice takes an end-user submitted URL and uses a headless Chromium browser instance to render snapshots. An attacker leverages blind Server-Side Request Forgery (SSRF) to interrogate the internal cloud metadata service at 169.254.169.254, aiming to harvest temporary IAM instance role credentials.',
        keyQuestionsToSolve: [
          'How does IMDSv2 mitigate legacy SSRF exploits compared to IMDSv1, and why are custom headers alone not always foolproof in headless browser contexts?',
          'How does DNS rebinding defeat simple IP blocklists (such as checking if hostname resolves to 127.0.0.1 or 169.254.169.254 at the application layer)?',
          'What architectural and network egress policies guarantee that container workloads cannot exfiltrate metadata or reach internal management interfaces?'
        ],
        hints: [
          {
            id: 'h-cs-1-1',
            order: 1,
            label: 'Hint 1: IMDSv2 Session Token Constraints',
            content: 'IMDSv2 requires initiating a PUT request with `X-aws-ec2-metadata-token-ttl-seconds` to receive a session token before accessing metadata endpoints. However, if an attacker can forge arbitrary HTTP methods and headers via URL parsing or redirects, or if the container host allows IMDSv1 fallback, credential exposure remains possible.'
          },
          {
            id: 'h-cs-1-2',
            order: 2,
            label: 'Hint 2: Solving DNS Rebinding at the Socket Level',
            content: 'Do not check the IP address once and then make the HTTP request with the original hostname. Attackers configure dynamic authoritative DNS servers that return a benign public IP on TTL=0, and then resolve to 169.254.169.254 or 10.0.0.1 on the second resolution. Resolve the DNS once, validate against RFC 1918/link-local ranges, and pin the socket connection directly to that validated IP.'
          },
          {
            id: 'h-cs-1-3',
            order: 3,
            label: 'Hint 3: Host Hop Limit & Network Security Groups',
            content: 'Configure the EC2 instance / ECS task definition with `http-put-response-hop-limit: 1`. In containerized environments, packets traveling from a Docker bridge network increment the IP hop count, causing the metadata service to reject requests originating from child containers.'
          }
        ]
      },
      {
        id: 'prob-cs-2',
        domainId: 'domain-cyber',
        title: 'Active Directory Kerberoasting, Silver Tickets & Forest Boundary Defense',
        difficulty: 'advanced',
        category: 'Enterprise Infrastructure & Threat Defense',
        estimatedEffort: '3 - 4 hours',
        tags: ['Active Directory', 'Kerberos', 'Privilege Escalation', 'Blue Team'],
        scenarioDescription: 'A penetration tester gains unprivileged access to an internal workstation. Within 2 hours, they extract Service Principal Name (SPN) tickets, crack a database service account password offline using hashcat, and attempt to escalate to Domain Admin using forged Kerberos Ticket Granting Tickets (TGT).',
        keyQuestionsToSolve: [
          'What architectural mechanism in the Kerberos protocol allows any authenticated domain user to request a TGS ticket for any registered SPN?',
          'Why are RC4 encryption downgrades a primary indicator of compromise for Kerberoasting?',
          'What is the exact remediation lifecycle required if the KRBTGT password hash is compromised, and why must it be changed twice?'
        ],
        hints: [
          {
            id: 'h-cs-2-1',
            order: 1,
            label: 'Hint 1: Service Account Password Complexity & gMSA',
            content: 'Kerberos encrypts the Ticket Granting Service (TGS) ticket with the NTLM hash of the service account associated with that SPN. The definitive structural defense is migrating all service accounts to Group Managed Service Accounts (gMSA) with 128-character, automatically rotated complex passwords that cannot be brute-forced offline.'
          },
          {
            id: 'h-cs-2-2',
            order: 2,
            label: 'Hint 2: SIEM Event Detection for Kerberoasting',
            content: 'Configure audit policies to monitor Windows Security Event ID 4769 ("A Kerberos service ticket was requested") with Ticket Options containing `0x40810000` and Ticket Encryption Type `0x17` (RC4-HMAC), which indicates the adversary forced legacy cipher negotiation.'
          },
          {
            id: 'h-cs-2-3',
            order: 3,
            label: 'Hint 3: The Double KRBTGT Rotation Lifecycle',
            content: 'Active Directory stores the current and previous KRBTGT password hash to prevent immediate authentication outages during normal scheduled rotation. Therefore, recovering from a Golden Ticket compromise requires rotating the KRBTGT key once, waiting for replication across all domain controllers, and rotating it a second time to invalidate all existing forged tickets.'
          }
        ]
      },
      {
        id: 'prob-cs-3',
        domainId: 'domain-cyber',
        title: 'Side-Channel Timing Attacks in Cryptographic Signature Verification',
        difficulty: 'advanced',
        category: 'Cryptography & Application Hardening',
        estimatedEffort: '2 - 3 hours',
        tags: ['Cryptography', 'Timing Attack', 'HMAC', 'Constant Time'],
        scenarioDescription: 'A custom webhook verification endpoint verifies incoming HMAC-SHA256 signatures by executing standard string comparison (`if (receivedSig === computedSig)`). An attacker measures response latency percentiles with microsecond precision over thousands of requests to iteratively guess the signature byte-by-byte.',
        keyQuestionsToSolve: [
          'Why does standard string equality comparison leak timing information?',
          'How does constant-time comparison prevent side-channel leakage, and how should differing input lengths be handled safely?'
        ],
        hints: [
          {
            id: 'h-cs-3-1',
            order: 1,
            label: 'Hint 1: Early-Exit Comparison Vulnerability',
            content: 'Standard string comparators check characters sequentially from index 0 to N-1 and terminate immediately upon encountering the first mismatching byte. If the first byte is correct, execution takes measurably longer before returning false, leaking positional validity.'
          },
          {
            id: 'h-cs-3-2',
            order: 2,
            label: 'Hint 2: Constant-Time Implementation & Equal Length Pre-Hashing',
            content: 'Use cryptographically secure constant-time comparators (such as Node.js `crypto.timingSafeEqual` or Python `hmac.compare_digest`). To prevent timing leaks based on string length differences, hash both the incoming signature and computed signature with SHA-256 before passing them to the constant-time comparator.'
          }
        ]
      }
    ],
    externalReferences: [
      { title: 'OWASP Top 10 Security Risks & Mitigations', url: 'https://owasp.org/www-project-top-ten/', source: 'OWASP Foundation' },
      { title: 'MITRE ATT&CK Enterprise Matrix', url: 'https://attack.mitre.org/', source: 'MITRE Corporation' }
    ]
  },

  // 4. Web Development
  'domain-webdev': {
    id: 'extra-res-webdev',
    domainId: 'domain-webdev',
    title: 'Full-Stack Web Architecture Capstone Problems',
    subtitle: 'Real-Time State Synchronization, Zero-Downtime Migrations & High-Scale Resilience',
    description: 'Mission-critical distributed web challenges exploring collaborative editing with CRDTs, multi-phase production schema evolutions, and frontend hydration optimizations.',
    isOptional: true,
    badgeText: 'Domain Mastery Capstone • Optional Extra Resource',
    keyCompetencies: [
      'Real-Time Collaboration & CRDTs',
      'Zero-Downtime Database Migrations (Expand & Contract)',
      'PostgreSQL Concurrency & Lock Contention',
      'Hydration Optimization & Core Web Vitals (INP/CLS)',
      'Cross-Subdomain Session Security'
    ],
    problems: [
      {
        id: 'prob-wd-1',
        domainId: 'domain-webdev',
        title: 'Real-Time Collaborative Document Synchronization: CRDTs vs Operational Transformation',
        difficulty: 'mastery',
        category: 'Distributed Systems & WebSockets',
        estimatedEffort: '3 - 5 hours',
        tags: ['CRDTs', 'WebSockets', 'Concurrency', 'Distributed State'],
        scenarioDescription: 'You are tasked with engineering a collaborative whiteboard and document editing engine supporting concurrent offline editing, intermittent network connectivity, and conflict-free merging across 50 simultaneous active contributors.',
        keyQuestionsToSolve: [
          'Why does central Last-Write-Wins (LWW) database timestamping result in catastrophic data loss during concurrent text editing?',
          'What are the architectural trade-offs between centralized Operational Transformation (OT) versus peer-to-peer Conflict-Free Replicated Data Types (CRDTs like Yjs or Automerge)?',
          'How do you handle tombstone garbage collection for deleted elements without breaking convergence when disconnected clients reconnect hours later?'
        ],
        hints: [
          {
            id: 'h-wd-1-1',
            order: 1,
            label: 'Hint 1: Character Indexing vs Identity',
            content: 'Never model text as a standard array index (e.g. "insert at index 4"). Because concurrent inserts shift indices unpredictably, represent every character or token with a globally unique immutable identifier, such as a Lamport timestamp paired with a client UUID, arranged in an ordered sequence.'
          },
          {
            id: 'h-wd-1-2',
            order: 2,
            label: 'Hint 2: Efficient Transport Protocol',
            content: 'Broadcasting full JSON document trees on every keystroke overwhelms client memory and network bandwidth. Broadcast compact binary delta buffers (using Protocol Buffers or custom typed arrays) representing only state updates and vector clocks.'
          },
          {
            id: 'h-wd-1-3',
            order: 3,
            label: 'Hint 3: Tombstone Management',
            content: 'When items are deleted in a CRDT, replacing them with immediate deletion breaks causal ordering for concurrent peers. Mark items as hidden "tombstones" and only purge them once all participating peers acknowledge a state vector greater than the deletion vector.'
          }
        ]
      },
      {
        id: 'prob-wd-2',
        domainId: 'domain-webdev',
        title: 'Zero-Downtime Database Schema Migration on 100M+ Row High-Throughput Cluster',
        difficulty: 'advanced',
        category: 'Database Engineering & DevOps',
        estimatedEffort: '3 - 4 hours',
        tags: ['PostgreSQL', 'Schema Migration', 'Zero-Downtime', 'Lock Contention'],
        scenarioDescription: 'You must rename a high-traffic column `user_billing_data` to `billing_profile_json`, split nested fields into normalized relational foreign key tables, and add unique constraints on an active production PostgreSQL database processing 12,000 queries/second without table locking.',
        keyQuestionsToSolve: [
          'Why will running `ALTER TABLE ... RENAME COLUMN` or adding an unindexed unique constraint immediately crash or stall web worker connections in production?',
          'How does the 4-phase "Expand and Contract" migration pattern decouple database schema modifications from application server deployments?',
          'How do you safely backfill historical records across 100 million rows without blowing out PostgreSQL WAL logs or replication lag?'
        ],
        hints: [
          {
            id: 'h-wd-2-1',
            order: 1,
            label: 'Hint 1: PostgreSQL Lock Queues',
            content: 'Even lightweight DDL commands require an `ACCESS EXCLUSIVE` lock. If a long-running analytical query is running, your migration will wait in the lock queue, blocking all subsequent incoming read/write transactions behind it until connection pools are exhausted. Always set a strict `statement_timeout` and `lock_timeout` before executing DDL.'
          },
          {
            id: 'h-wd-2-2',
            order: 2,
            label: 'Hint 2: The Expand and Contract Pattern',
            content: 'Execute in four discrete deployment steps: 1) Add new column/table without modifying old one. 2) Deploy app code that writes to BOTH old and new locations, but continues reading from old. 3) Backfill historical rows in asynchronous indexed batches. 4) Switch reads to the new schema, stop writes to the old, and eventually drop the deprecated column in a separate maintenance release.'
          },
          {
            id: 'h-wd-2-3',
            order: 3,
            label: 'Hint 3: Safe Indexing & Monotonic Batching',
            content: 'Always create indexes using `CREATE INDEX CONCURRENTLY`, which avoids locking writes. For backfilling historical data, avoid `OFFSET/LIMIT` queries which degrade quadratically; use keyset pagination (`WHERE id > :last_seen_id ORDER BY id ASC LIMIT 2000`) with brief sleep intervals to allow replica streaming to keep pace.'
          }
        ]
      },
      {
        id: 'prob-wd-3',
        domainId: 'domain-webdev',
        title: 'Interaction to Next Paint (INP) & Main-Thread Hydration Bottleneck in React SPAs',
        difficulty: 'advanced',
        category: 'Frontend Performance & Core Web Vitals',
        estimatedEffort: '2 - 3 hours',
        tags: ['React', 'Core Web Vitals', 'INP', 'Selective Hydration'],
        scenarioDescription: 'A heavy server-rendered e-commerce checkout application experiences severe interaction delays (INP > 450ms) on mobile devices because large client-side JavaScript bundles monopolize the browser main thread during initial page hydration.',
        keyQuestionsToSolve: [
          'How does standard monolithic hydration turn an otherwise visually loaded page into an unresponsive frozen UI?',
          'What strategies (React Server Components, island architectures, or selective hydration) prevent non-interactive content from shipping JavaScript to the client?'
        ],
        hints: [
          {
            id: 'h-wd-3-1',
            order: 1,
            label: 'Hint 1: Island Architecture & React Server Components',
            content: 'Keep 80% of static marketing layout (headers, footers, product descriptions, reviews) strictly as Server Components that render static HTML and zero client bundle size. Only hydrate interactive "islands" (such as the cart modal or filter drawer).'
          },
          {
            id: 'h-wd-3-2',
            order: 2,
            label: 'Hint 2: Yielding the Main Thread with scheduler.yield()',
            content: 'Break long computation tasks (>50ms) during user interactions using modern `scheduler.yield()` or microtask chunking, allowing the browser to process layout, paint, and tap feedback before resuming background state recalculations.'
          }
        ]
      }
    ],
    externalReferences: [
      { title: 'Designing Data-Intensive Applications by Martin Kleppmann', url: 'https://dataintensive.net/', source: "O'Reilly" },
      { title: 'Google Web Vitals: Optimize Interaction to Next Paint', url: 'https://web.dev/articles/optimize-inp', source: 'web.dev' }
    ]
  },

  // 5. Programming with Java
  'domain-java': {
    id: 'extra-res-java',
    domainId: 'domain-java',
    title: 'Enterprise Java Mastery Capstone Problems',
    subtitle: 'Low-Latency Concurrency, Virtual Threads (Project Loom) & Resilient Spring Microservices',
    description: 'Advanced Java systems problems dealing with GC latency tuning, thread pinning under high concurrency, lock contention, and transactional outbox patterns in distributed sagas.',
    isOptional: true,
    badgeText: 'Domain Mastery Capstone • Optional Extra Resource',
    keyCompetencies: [
      'JVM Garbage Collection Tuning (G1GC vs ZGC)',
      'Virtual Threads & Carrier Thread Pinning',
      'Lock-Free Concurrency & Memory Fences',
      'Transactional Outbox Pattern & Kafka Sagas',
      'Off-Heap Memory & Zero-Allocation Hot Paths'
    ],
    problems: [
      {
        id: 'prob-java-1',
        domainId: 'domain-java',
        title: 'Eliminating Stop-The-World Latency Spikes in Low-Latency Order Matching Engine',
        difficulty: 'mastery',
        category: 'JVM Internals & Performance Tuning',
        estimatedEffort: '3 - 5 hours',
        tags: ['JVM', 'GC Tuning', 'ZGC', 'Low Latency', 'Memory Allocation'],
        scenarioDescription: 'A high-frequency electronic trading matching engine written in Java 21 experiences periodic 70-120ms Stop-The-World (STW) pauses during G1GC evacuation failures under sudden market volatility, violating client SLA requirements of <5ms response times.',
        keyQuestionsToSolve: [
          'How does rapid ephemeral object allocation in the young generation directly impact GC pause frequency and evacuation failure risk?',
          'What are the trade-offs between generational ZGC (`-XX:+UseZGC -XX:+ZGenerational`) and Shenandoah versus traditional G1GC for low-latency throughput?',
          'How can off-heap memory buffers (e.g. `DirectByteBuffer` or Chronicle Queue) eliminate garbage collection pressure entirely along the critical path?'
        ],
        hints: [
          {
            id: 'h-java-1-1',
            order: 1,
            label: 'Hint 1: Mechanical Sympathy & Zero-Allocation Patterns',
            content: 'Avoid boxing primitives (`Long`, `Integer`) and allocating temporary `String` or collection objects on the hot execution path. Use primitive arrays, object pooling, or flyweight patterns where byte buffers are mutated in-place rather than instantiated anew.'
          },
          {
            id: 'h-java-1-2',
            order: 2,
            label: 'Hint 2: ZGC Generational Execution',
            content: 'In Java 21+, Generational ZGC separates short-lived objects from long-lived tenured objects while performing concurrent marking and compaction with sub-millisecond pauses. Test the `-XX:+UseZGC -XX:+ZGenerational` flags on production-like traffic workloads.'
          },
          {
            id: 'h-java-1-3',
            order: 3,
            label: 'Hint 3: Diagnosing GC Logs & Humongous Allocations',
            content: 'Inspect GC logs using `-Xlog:gc*,gc+phases=debug:file=gc.log:time,uptime,pid:filecount=5,filesize=100M`. Specifically check if "humongous allocations" (objects larger than 50% of a G1 region size) are bypassing Eden and directly entering the Old Generation, forcing premature concurrent mark cycles.'
          }
        ]
      },
      {
        id: 'prob-java-2',
        domainId: 'domain-java',
        title: 'High-Throughput Virtual Threads (Project Loom) & Avoiding Carrier Thread Pinning',
        difficulty: 'advanced',
        category: 'Multithreading & Concurrency',
        estimatedEffort: '3 - 4 hours',
        tags: ['Virtual Threads', 'Project Loom', 'Concurrency', 'Thread Pinning'],
        scenarioDescription: 'A core banking API server is upgraded to Java 21 Virtual Threads (`Executors.newVirtualThreadPerTaskExecutor()`) to process 40,000 concurrent blocking REST and JDBC requests. Under load, thread execution stalls, latency skyrockets, and carrier thread starvation occurs.',
        keyQuestionsToSolve: [
          'What causes virtual thread "pinning" to the underlying platform carrier thread, and why do legacy `synchronized` blocks or native JNI calls prevent thread unmounting?',
          'How should database connection pooling (HikariCP) be configured when concurrency scales from 200 platform threads to 50,000 virtual threads?'
        ],
        hints: [
          {
            id: 'h-java-2-1',
            order: 1,
            label: 'Hint 1: Replacing Synchronized with ReentrantLock',
            content: 'When a virtual thread executes a blocking operation inside a `synchronized` block or method, it cannot unmount from its OS carrier thread (pinning). Replace `synchronized` blocks with `java.util.concurrent.locks.ReentrantLock`, which allows virtual threads to yield the carrier thread cleanly during I/O waits.'
          },
          {
            id: 'h-java-2-2',
            order: 2,
            label: 'Hint 2: Carrier Thread Diagnostics Flag',
            content: 'Run the JVM with `-Djdk.tracePinnedThreads=full` to produce an immediate diagnostic stack trace whenever a virtual thread blocks while pinned to a carrier platform thread.'
          },
          {
            id: 'h-java-2-3',
            order: 3,
            label: 'Hint 3: Connection Pool Sizing with Semaphores',
            content: 'Do NOT increase the HikariCP pool to 50,000 connections; database servers will collapse under lock and memory contention. Maintain a small connection pool (e.g. 50-100) and regulate access using an asynchronous `Semaphore` so virtual threads wait without exhausting database resources.'
          }
        ]
      },
      {
        id: 'prob-java-3',
        domainId: 'domain-java',
        title: 'Distributed Saga Orchestration with Spring Boot, Transactional Outbox & Kafka',
        difficulty: 'advanced',
        category: 'Enterprise Microservices & Distributed Architecture',
        estimatedEffort: '3 - 4 hours',
        tags: ['Spring Boot', 'Kafka', 'Transactional Outbox', 'Distributed Saga'],
        scenarioDescription: 'In an e-commerce microservices platform, placing an order requires reserving inventory in the Warehouse Service, processing payment in the Billing Service, and creating a tracking record in Shipping. If payment fails, warehouse reservations must be cleanly compensated without distributed 2PC locks.',
        keyQuestionsToSolve: [
          'Why does publishing directly to Kafka inside a `@Transactional` Spring service method risk dual-write inconsistencies if the database commit fails?',
          'How does the Transactional Outbox Pattern guarantee at-least-once message delivery?',
          'How should downstream consumers implement idempotency to handle duplicate message redelivery safely?'
        ],
        hints: [
          {
            id: 'h-java-3-1',
            order: 1,
            label: 'Hint 1: The Dual-Write Problem & Outbox Table',
            content: 'Never send a Kafka message and commit a database transaction sequentially. If the network dies after the database commit but before the Kafka publish, state diverges. Write both the domain entity and an `OutboxEvent` entity into the same local ACID transaction. An independent CDC process (such as Debezium or polling) reads the outbox table and dispatches messages to Kafka reliably.'
          },
          {
            id: 'h-java-3-2',
            order: 2,
            label: 'Hint 2: Idempotent Consumer Pattern',
            content: 'Downstream microservices must track processed `messageId` values in an idempotent consumer table using a unique database constraint. If a duplicate message arrives, the insert fails gracefully and the operation is acknowledged without repeating business side effects.'
          }
        ]
      }
    ],
    externalReferences: [
      { title: 'Java Concurrency in Practice by Brian Goetz', url: 'https://jcip.net/', source: 'Addison-Wesley' },
      { title: 'Baeldung Guide to Java 21 Virtual Threads', url: 'https://www.baeldung.com/java-virtual-threads', source: 'Baeldung' }
    ]
  },

  // 6. Programming with Python
  'domain-python': {
    id: 'extra-res-python',
    domainId: 'domain-python',
    title: 'Python Production Engineering Capstone Problems',
    subtitle: 'Asynchronous Event Loops, GIL Optimization & High-Scale Microservices',
    description: 'Mastery scenarios focusing on bypassing GIL bottlenecks in CPU-heavy tasks, architecting resilient asyncio backpressure mechanisms, and pinpointing persistent memory leaks in long-running Python daemons.',
    isOptional: true,
    badgeText: 'Domain Mastery Capstone • Optional Extra Resource',
    keyCompetencies: [
      'Bypassing the Global Interpreter Lock (GIL)',
      'Asyncio Concurrency & Queue Backpressure',
      'Zero-Copy Shared Memory IPC',
      'Memory Leak Profiling with tracemalloc & objgraph',
      'Async Token-Bucket Rate Limiting'
    ],
    problems: [
      {
        id: 'prob-py-1',
        domainId: 'domain-python',
        title: 'CPU-Bound Image Processing Bottleneck & Bypassing the GIL in Worker Fleets',
        difficulty: 'mastery',
        category: 'Systems Architecture & Performance Optimization',
        estimatedEffort: '3 - 5 hours',
        tags: ['Python GIL', 'Multiprocessing', 'Asyncio', 'Zero-Copy Memory'],
        scenarioDescription: 'A real-time image transformation and watermarking service built on FastAPI processes incoming 4K image uploads. Heavy PIL and NumPy matrix operations running inside `async def` endpoints block the single-threaded asyncio event loop, causing health check timeouts and dropped connections.',
        keyQuestionsToSolve: [
          'Why does wrapping synchronous CPU-bound operations in `asyncio.to_thread` or standard thread pools fail to achieve true parallel CPU scaling under Python\'s Global Interpreter Lock (GIL)?',
          'How can `concurrent.futures.ProcessPoolExecutor` paired with `multiprocessing.shared_memory` achieve true multi-core processing without multi-gigabyte serialization overhead?',
          'When should you compile performance-critical inner loops to native C/Rust extensions (using PyO3 or Cython)?'
        ],
        hints: [
          {
            id: 'h-py-1-1',
            order: 1,
            label: 'Hint 1: GIL Threading vs Multiprocessing',
            content: 'Python threads can only execute Python bytecode on one CPU core at a time due to the GIL. Moving CPU-intensive calculations to threads only causes high thread-switching overhead. True multi-core parallelism requires running separate OS processes via `ProcessPoolExecutor` where each process possesses its own independent Python interpreter and GIL instance.'
          },
          {
            id: 'h-py-1-2',
            order: 2,
            label: 'Hint 2: Shared Memory Without Pickle Serialization',
            content: 'Passing multi-megabyte image arrays between processes using default multiprocessing queues incurs severe serialization (pickle) latency. Use Python 3.8+ `multiprocessing.shared_memory.SharedMemory` to allocate a raw shared RAM buffer, passing only the buffer name and shape metadata to worker processes.'
          },
          {
            id: 'h-py-1-3',
            order: 3,
            label: 'Hint 3: Native Extensions that Release the GIL',
            content: 'Libraries like NumPy and OpenCV release the GIL during internal C/C++ matrix operations. Structuring your code so calculations occur strictly inside vectorized C-level routines allows background Python threads to continue processing I/O concurrently.'
          }
        ]
      },
      {
        id: 'prob-py-2',
        domainId: 'domain-python',
        title: 'High-Throughput Asynchronous Webhook Ingestion with Backpressure & Rate-Limiting',
        difficulty: 'advanced',
        category: 'Asyncio & Distributed Systems',
        estimatedEffort: '2 - 4 hours',
        tags: ['FastAPI', 'asyncio.Queue', 'Backpressure', 'Token Bucket'],
        scenarioDescription: 'A payment and event processing webhook service receives sudden bursts of 20,000 requests/second from payment providers. Downstream partner APIs enforce a rigid rate limit of 1,200 requests/second. Without backpressure, server memory grows uncontrollably until the container is terminated by the Linux OOM killer.',
        keyQuestionsToSolve: [
          'How do you implement bounded buffering in Python asyncio so excess incoming traffic is throttled at the transport layer instead of ballooning heap memory?',
          'How can a distributed token-bucket rate limiter be implemented using Redis atomic Lua scripts to coordinate multiple worker pods?',
          'How should dead-letter queue (DLQ) retry policies with exponential backoff and jitter be structured?'
        ],
        hints: [
          {
            id: 'h-py-2-1',
            order: 1,
            label: 'Hint 1: Bounded Queues and TCP Window Backpressure',
            content: 'Never use an unbounded queue. Initialize an `asyncio.Queue(maxsize=1000)`. When the queue is full, incoming handler coroutines await `queue.put()`. This naturally pauses socket reads, causing the client or upstream reverse proxy (Nginx) to observe backpressure through TCP window flow control.'
          },
          {
            id: 'h-py-2-2',
            order: 2,
            label: 'Hint 2: Redis Atomic Token Bucket',
            content: 'Calculate available tokens using an atomic Redis Lua script that computes timestamp differences since last replenishment, deducting tokens atomically. This eliminates race conditions between distributed worker replicas.'
          },
          {
            id: 'h-py-2-3',
            order: 3,
            label: 'Hint 3: Full Jitter in Exponential Backoff',
            content: 'To prevent the "thundering herd" problem where thousands of failed requests retry at the exact same millisecond mark, add random full jitter (`sleep = random.uniform(0, min(max_backoff, base * 2 ** attempt))`).'
          }
        ]
      },
      {
        id: 'prob-py-3',
        domainId: 'domain-python',
        title: 'Memory Leak Diagnostics & Reference Cycles in Long-Running Python Daemons',
        difficulty: 'advanced',
        category: 'Python Internals & Diagnostics',
        estimatedEffort: '2 - 3 hours',
        tags: ['Memory Leak', 'tracemalloc', 'Garbage Collector', 'Slots'],
        scenarioDescription: 'A financial event streamer daemon starts with a 150MB RSS footprint, but steadily consumes an additional 50MB every hour. After 48 hours, memory usage hits 2.5GB and causes host instability, despite all handled events seemingly going out of scope.',
        keyQuestionsToSolve: [
          'Why does Python\'s reference-counting garbage collector fail to reclaim objects trapped in cyclic references with certain closure bindings or global caches?',
          'How do you use `tracemalloc` and `objgraph` to identify memory allocation origin points in production without crashing the process?'
        ],
        hints: [
          {
            id: 'h-py-3-1',
            order: 1,
            label: 'Hint 1: Differential Snapshots with tracemalloc',
            content: 'Start `tracemalloc.start()`. Take baseline snapshot `s1` and subsequent snapshot `s2` an hour later. Running `s2.compare_to(s1, \'lineno\')` immediately reveals the exact file and line number generating net cumulative allocations.'
          },
          {
            id: 'h-py-3-2',
            order: 2,
            label: 'Hint 2: Detecting Leaked Cycles with objgraph',
            content: 'Use `objgraph.show_growth()` to see which specific class types are growing monotonically. If instances are retained unexpectedly, call `objgraph.show_backrefs()` to visualize the chain of references keeping them alive in memory.'
          },
          {
            id: 'h-py-3-3',
            order: 3,
            label: 'Hint 3: __slots__ on High-Frequency Domain Objects',
            content: 'By default, every Python instance allocates a dynamic `__dict__` dictionary taking ~150-300 bytes of memory. Declaring `__slots__ = (\'id\', \'timestamp\', \'value\')` on high-throughput event classes eliminates `__dict__`, reducing memory footprint per instance by up to 70%.'
          }
        ]
      }
    ],
    externalReferences: [
      { title: 'Fluent Python: Clear, Concise, and Effective Programming by Luciano Ramalho', url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/', source: "O'Reilly" },
      { title: 'Python Tracemalloc Documentation', url: 'https://docs.python.org/3/library/tracemalloc.html', source: 'Python Docs' }
    ]
  }
};
