// Career track data for the Skill Tree page.
// Each track has nodes (skills), edges (dependencies), and badges.
// Runtime node states are derived from `SkillTreePersistedV1` in user_dashboard_state.metadata.skill_tree.

export type NodeState  = "completed" | "in_progress" | "active" | "locked";
export type Difficulty = "BEGINNER"  | "INTERMEDIATE" | "ADVANCED";

export interface Resource {
  title: string;
  url:   string;
  type:  "video" | "article" | "course" | "practice";
}

export interface SkillNode {
  id:          string;
  label:       string;
  icon:        string;
  description: string;
  xp:          number;
  difficulty:  Difficulty;
  tier:        number;       // 0 = root, increases down
  x:           number;       // 0–100 horizontal %
  prereqs:     string[];     // node ids that must be completed first
  resources:   Resource[];
  challenges:  string[];
  mentorTip:   string;
  state:       NodeState;
  isRequired:  boolean;
}

export interface Badge {
  id:           string;
  label:        string;
  emoji:        string;
  unlockNodeId: string;
}

export interface CareerTrack {
  id:                    string;
  label:                 string;
  icon:                  string;
  color:                 string;   // accent hex
  colorDim:              string;   // dark tint of accent
  nodes:                 SkillNode[];
  edges:                 [string, string][];
  badges:                Badge[];
  hiringManagerNote:     string;
  mentorRecommendation:  string;
}

// y positions (%) per tier — 5 tiers (0–4)
export const TIER_Y = [7, 25, 44, 63, 82];

// ─── SOFTWARE ENGINEER ────────────────────────────────────────────────────────
const SE_NODES: SkillNode[] = [
  // ── Tier 0 ──
  {
    id: "web_found", label: "Web Foundations", icon: "🌐",
    description: "How the internet works — HTTP, browsers, DNS, and the client-server model.",
    xp: 50, difficulty: "BEGINNER", tier: 0, x: 50, prereqs: [], state: "completed", isRequired: true,
    resources: [
      { title: "How the Web Works – MDN", url: "https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/How_the_Web_works", type: "article" },
      { title: "CS50 Web – Harvard (free)", url: "https://cs50.harvard.edu/web/", type: "course" },
    ],
    challenges: ["Explain DNS in your own words", "Draw a client-server request diagram"],
    mentorTip: "Every SWE interview eventually asks 'what happens when you type google.com?' Know this cold.",
  },
  // ── Tier 1 ──
  {
    id: "html_css", label: "HTML & CSS", icon: "🎨",
    description: "Semantic HTML, the box model, flexbox, grid, and responsive design.",
    xp: 75, difficulty: "BEGINNER", tier: 1, x: 18, prereqs: ["web_found"], state: "completed", isRequired: true,
    resources: [
      { title: "Kevin Powell CSS – YouTube", url: "https://www.youtube.com/@KevinPowell", type: "video" },
      { title: "The Odin Project – Foundations", url: "https://www.theodinproject.com/paths/foundations", type: "course" },
    ],
    challenges: ["Build a personal landing page", "Recreate a design from a screenshot using only CSS"],
    mentorTip: "Don't underestimate CSS. Most junior devs do — interviewers always notice.",
  },
  {
    id: "js_basics", label: "JavaScript", icon: "⚡",
    description: "Variables, functions, closures, DOM manipulation, and async/await basics.",
    xp: 100, difficulty: "BEGINNER", tier: 1, x: 50, prereqs: ["web_found"], state: "completed", isRequired: true,
    resources: [
      { title: "javascript.info", url: "https://javascript.info", type: "article" },
      { title: "Eloquent JavaScript (free book)", url: "https://eloquentjavascript.net", type: "course" },
    ],
    challenges: ["Build a todo app without a framework", "Write a debounce function from scratch"],
    mentorTip: "Master closures, the event loop, and 'this' before your first technical interview.",
  },
  {
    id: "git", label: "Git & GitHub", icon: "🌿",
    description: "Version control, branching, pull requests, and team collaboration workflows.",
    xp: 75, difficulty: "BEGINNER", tier: 1, x: 82, prereqs: ["web_found"], state: "active", isRequired: true,
    resources: [
      { title: "Pro Git Book (free)", url: "https://git-scm.com/book/en/v2", type: "article" },
      { title: "Oh My Git! – interactive game", url: "https://ohmygit.org", type: "practice" },
    ],
    challenges: ["Push 10 commits to a repo with meaningful messages", "Open a real PR on an OSS project"],
    mentorTip: "Git is non-negotiable. Learn it before your first internship, not during.",
  },
  // ── Tier 2 ──
  {
    id: "react", label: "React", icon: "⚛️",
    description: "Components, hooks, state management, and the React mental model.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 2, x: 10, prereqs: ["html_css", "typescript"], state: "locked", isRequired: true,
    resources: [
      { title: "React Docs – react.dev", url: "https://react.dev", type: "article" },
      { title: "Full Stack Open – Helsinki (free)", url: "https://fullstackopen.com/en/", type: "course" },
    ],
    challenges: ["Build a weather app consuming a public API", "Implement a custom hook for data fetching"],
    mentorTip: "Learn hooks deeply — useState, useEffect, useContext. Most interviews test these specifically.",
  },
  {
    id: "typescript", label: "TypeScript", icon: "🔷",
    description: "Static typing, interfaces, generics, and TypeScript's role in modern JavaScript development.",
    xp: 100, difficulty: "BEGINNER", tier: 2, x: 30, prereqs: ["js_basics"], state: "active", isRequired: true,
    resources: [
      { title: "TypeScript Handbook – official", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "article" },
      { title: "Total TypeScript – Matt Pocock", url: "https://www.totaltypescript.com/tutorials", type: "course" },
    ],
    challenges: ["Convert a JavaScript project to TypeScript with strict mode", "Write a generic utility type that extracts all required keys from an interface"],
    mentorTip: "Every modern frontend role expects TypeScript. Learn it right after JS — the mental overhead is small, the career impact is huge.",
  },
  {
    id: "nodejs", label: "Node.js", icon: "🖥️",
    description: "Server-side JavaScript, Express, middleware, and building REST APIs.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 2, x: 52, prereqs: ["typescript"], state: "locked", isRequired: true,
    resources: [
      { title: "Node.js Official Docs", url: "https://nodejs.org/en/docs", type: "article" },
      { title: "The Net Ninja – Node Crash Course", url: "https://www.youtube.com/playlist?list=PL4cUxeGkcC9jszmQDAUF4eMZKSPs-Bx0e", type: "video" },
    ],
    challenges: ["Build a REST API with 5 endpoints", "Add JWT-based authentication to your API"],
    mentorTip: "Don't just follow tutorials — build something real with Node to truly understand it.",
  },
  {
    id: "sql", label: "SQL & Databases", icon: "🗄️",
    description: "Relational databases, joins, aggregations, indexing, and schema design.",
    xp: 125, difficulty: "INTERMEDIATE", tier: 2, x: 70, prereqs: ["js_basics"], state: "locked", isRequired: true,
    resources: [
      { title: "Mode SQL Tutorial", url: "https://mode.com/sql-tutorial/", type: "course" },
      { title: "SQLZoo – interactive practice", url: "https://sqlzoo.net", type: "practice" },
    ],
    challenges: ["Solve 20 SQL problems on LeetCode", "Design a relational schema for a social app"],
    mentorTip: "SQL shows up in 80% of SWE interviews. Practice joins and window functions daily.",
  },
  {
    id: "dsa", label: "DSA", icon: "🧮",
    description: "Arrays, linked lists, trees, graphs, sorting algorithms, and dynamic programming.",
    xp: 200, difficulty: "INTERMEDIATE", tier: 2, x: 88, prereqs: ["js_basics", "git"], state: "locked", isRequired: true,
    resources: [
      { title: "NeetCode 150 – structured roadmap", url: "https://neetcode.io/roadmap", type: "practice" },
      { title: "Grokking Algorithms (book)", url: "https://www.manning.com/books/grokking-algorithms", type: "article" },
    ],
    challenges: ["Solve 30 LeetCode easy problems", "Implement a binary search tree from scratch"],
    mentorTip: "Start with arrays and hashmaps, then trees. Don't try to learn everything at once.",
  },
  // ── Tier 3 ──
  {
    id: "apis", label: "REST APIs", icon: "🔌",
    description: "API design principles, HTTP methods, status codes, auth, and versioning.",
    xp: 175, difficulty: "INTERMEDIATE", tier: 3, x: 16, prereqs: ["react", "nodejs"], state: "locked", isRequired: true,
    resources: [
      { title: "REST API Design Best Practices", url: "https://blog.postman.com/rest-api-design/", type: "article" },
      { title: "Postman Learning Center", url: "https://learning.postman.com", type: "course" },
    ],
    challenges: ["Build a full CRUD API with proper error handling", "Add OpenAPI/Swagger documentation"],
    mentorTip: "Understand idempotency and HTTP status codes — these come up constantly in system design rounds.",
  },
  {
    id: "testing", label: "Testing", icon: "🧪",
    description: "Unit tests, integration tests, TDD approach, and testing best practices.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 3, x: 38, prereqs: ["nodejs", "sql"], state: "locked", isRequired: true,
    resources: [
      { title: "Testing JavaScript – Kent C. Dodds", url: "https://testingjavascript.com", type: "course" },
      { title: "Jest Documentation", url: "https://jestjs.io/docs/getting-started", type: "article" },
    ],
    challenges: ["Achieve 80% test coverage on a project", "Write tests before code (TDD) for one full feature"],
    mentorTip: "Companies that care about quality will ask about testing. Don't skip it.",
  },
  {
    id: "docker_cicd", label: "Docker & CI/CD", icon: "🐳",
    description: "Containerization, Docker Compose, GitHub Actions, and automated deployment pipelines.",
    xp: 175, difficulty: "INTERMEDIATE", tier: 3, x: 60, prereqs: ["nodejs"], state: "locked", isRequired: true,
    resources: [
      { title: "Docker in 100 Seconds – Fireship", url: "https://www.youtube.com/watch?v=Gjnup-PuquQ", type: "video" },
      { title: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions", type: "article" },
    ],
    challenges: ["Dockerize a Node.js app and push to Docker Hub", "Set up a GitHub Actions pipeline that tests and deploys on push"],
    mentorTip: "If you can't explain how your app gets to production, you don't fully understand your app. Own the deploy.",
  },
  {
    id: "sys_design", label: "System Design", icon: "🏗️",
    description: "Scalable architectures, load balancing, caching, and database sharding.",
    xp: 250, difficulty: "ADVANCED", tier: 3, x: 84, prereqs: ["sql", "dsa"], state: "locked", isRequired: false,
    resources: [
      { title: "System Design Primer – GitHub", url: "https://github.com/donnemartin/system-design-primer", type: "article" },
      { title: "Grokking System Design – Educative", url: "https://www.educative.io/courses/grokking-modern-system-design-interview", type: "course" },
    ],
    challenges: ["Design a URL shortener end-to-end", "Design a real-time notification system"],
    mentorTip: "System design is for senior rounds — but starting early puts you years ahead.",
  },
  // ── Tier 4 ──
  {
    id: "fullstack", label: "Full Stack App", icon: "🚀",
    description: "Build and deploy a complete app with auth, database, CI/CD, and real users.",
    xp: 300, difficulty: "ADVANCED", tier: 4, x: 24, prereqs: ["apis", "testing", "docker_cicd"], state: "locked", isRequired: true,
    resources: [
      { title: "The Odin Project – Full Stack Path", url: "https://www.theodinproject.com/paths/full-stack-javascript", type: "course" },
      { title: "Next.js Documentation", url: "https://nextjs.org/docs", type: "article" },
    ],
    challenges: ["Deploy to production with a CI/CD pipeline", "Get 50 GitHub stars on your project"],
    mentorTip: "This is your portfolio centerpiece. Recruiters will actually use it — spend real time here.",
  },
  {
    id: "interview_prep", label: "Interview Prep", icon: "🎯",
    description: "LeetCode patterns, behavioral frameworks (STAR), mock interviews, and job application strategy.",
    xp: 200, difficulty: "ADVANCED", tier: 4, x: 62, prereqs: ["dsa", "sys_design"], state: "locked", isRequired: false,
    resources: [
      { title: "NeetCode – structured LC patterns", url: "https://neetcode.io/practice", type: "practice" },
      { title: "Grokking the Behavioral Interview", url: "https://www.educative.io/courses/grokking-the-behavioral-interview", type: "course" },
    ],
    challenges: ["Complete the Blind 75 LeetCode list", "Do 5 timed mock interviews on Pramp or interviewing.io"],
    mentorTip: "80% of FAANG offers go to people who practiced mock interviews out loud. Silent thinking doesn't prepare you.",
  },
  {
    id: "oss", label: "Open Source", icon: "🌍",
    description: "Contribute to OSS, navigate code review culture, and build your public reputation.",
    xp: 250, difficulty: "ADVANCED", tier: 4, x: 88, prereqs: ["sys_design"], state: "locked", isRequired: false,
    resources: [
      { title: "First Contributions – GitHub", url: "https://github.com/firstcontributions/first-contributions", type: "article" },
      { title: "Up For Grabs – OSS finder", url: "https://up-for-grabs.net", type: "practice" },
    ],
    challenges: ["Get 3 PRs merged into active projects", "Become a maintainer of a small npm package"],
    mentorTip: "OSS contributions are a differentiator at top-tier companies. Start small and be consistent.",
  },
];

const SE_EDGES: [string, string][] = [
  ["web_found","html_css"], ["web_found","js_basics"], ["web_found","git"],
  ["js_basics","typescript"],
  ["html_css","react"], ["typescript","react"],
  ["typescript","nodejs"],
  ["js_basics","sql"],
  ["js_basics","dsa"], ["git","dsa"],
  ["react","apis"], ["nodejs","apis"],
  ["nodejs","testing"], ["sql","testing"],
  ["nodejs","docker_cicd"],
  ["sql","sys_design"], ["dsa","sys_design"],
  ["apis","fullstack"], ["testing","fullstack"], ["docker_cicd","fullstack"],
  ["dsa","interview_prep"], ["sys_design","interview_prep"],
  ["sys_design","oss"],
];

const SE_BADGES: Badge[] = [
  { id: "hello_world",     label: "Hello World",        emoji: "🌐", unlockNodeId: "web_found"      },
  { id: "typed_up",        label: "TypeScript",         emoji: "🔷", unlockNodeId: "typescript"     },
  { id: "git_good",        label: "Git Good",           emoji: "🌿", unlockNodeId: "git"            },
  { id: "react_hero",      label: "React Hero",         emoji: "⚛️", unlockNodeId: "react"          },
  { id: "db_guru",         label: "Database Guru",      emoji: "🗄️", unlockNodeId: "sql"            },
  { id: "container_cap",   label: "Container Captain",  emoji: "🐳", unlockNodeId: "docker_cicd"    },
  { id: "interview_ready", label: "Interview Ready",    emoji: "🎯", unlockNodeId: "interview_prep" },
  { id: "ship_it",         label: "Ship It",            emoji: "🚀", unlockNodeId: "fullstack"      },
];

// ─── DATA ANALYST ─────────────────────────────────────────────────────────────
const DA_NODES: SkillNode[] = [
  {
    id:"data_found", label:"Data Foundations", icon:"📊",
    description:"Understand data types, spreadsheets, basic stats, and how data flows in an organization.",
    xp:50, difficulty:"BEGINNER", tier:0, x:50, prereqs:[], state:"completed", isRequired:true,
    resources:[
      { title:"Google Data Analytics Certificate", url:"https://www.coursera.org/professional-certificates/google-data-analytics", type:"course" },
      { title:"Statistics Fundamentals – StatQuest", url:"https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9", type:"video" },
    ],
    challenges:["Calculate mean, median, mode on a real dataset","Explain the difference between correlation and causation"],
    mentorTip:"The best analysts translate numbers into decisions. Practice storytelling with data from day one.",
  },
  {
    id:"excel", label:"Excel / Sheets", icon:"📋",
    description:"Formulas, pivot tables, VLOOKUP, data cleaning, and basic charting.",
    xp:75, difficulty:"BEGINNER", tier:1, x:18, prereqs:["data_found"], state:"completed", isRequired:true,
    resources:[
      { title:"Excel for Beginners – Chandoo", url:"https://www.youtube.com/@chandoo_", type:"video" },
      { title:"Google Sheets Training Center", url:"https://workspace.google.com/intl/en/products/sheets/", type:"course" },
    ],
    challenges:["Build a sales dashboard in Sheets","Use VLOOKUP + INDEX/MATCH to join two datasets"],
    mentorTip:"Every analyst uses Sheets daily. It's your Swiss Army knife — master it before anything else.",
  },
  {
    id:"python_da", label:"Python Basics", icon:"🐍",
    description:"Python syntax, data types, functions, and foundational scripting for data work.",
    xp:100, difficulty:"BEGINNER", tier:1, x:50, prereqs:["data_found"], state:"active", isRequired:true,
    resources:[
      { title:"Automate the Boring Stuff (free)", url:"https://automatetheboringstuff.com", type:"course" },
      { title:"Python for Everybody – Coursera", url:"https://www.coursera.org/specializations/python", type:"course" },
    ],
    challenges:["Write a script to clean a messy CSV file","Scrape a public website and save data to JSON"],
    mentorTip:"Python is the analyst's superpower. Even basic scripting saves hours of manual work.",
  },
  {
    id:"sql_da", label:"SQL", icon:"🗃️",
    description:"SELECT, JOIN, GROUP BY, subqueries, CTEs, and window functions.",
    xp:125, difficulty:"BEGINNER", tier:1, x:82, prereqs:["data_found"], state:"locked", isRequired:true,
    resources:[
      { title:"Mode SQL Tutorial (free)", url:"https://mode.com/sql-tutorial/", type:"course" },
      { title:"StrataScratch – SQL interview prep", url:"https://www.stratascratch.com", type:"practice" },
    ],
    challenges:["Solve 25 SQL problems on HackerRank","Write a query using window functions to rank users by activity"],
    mentorTip:"SQL is the #1 skill for data analysts. Every interview will test it — practice daily.",
  },
  {
    id:"pandas", label:"Pandas / NumPy", icon:"🐼",
    description:"DataFrames, data cleaning, transformation, merging, and exploratory analysis.",
    xp:150, difficulty:"INTERMEDIATE", tier:2, x:14, prereqs:["python_da"], state:"locked", isRequired:true,
    resources:[
      { title:"Kaggle Pandas Course (free)", url:"https://www.kaggle.com/learn/pandas", type:"course" },
      { title:"Pandas Documentation", url:"https://pandas.pydata.org/docs/", type:"article" },
    ],
    challenges:["Clean a real-world dirty dataset from Kaggle","Perform a full EDA on a public dataset"],
    mentorTip:"Pandas + SQL is the core analyst stack. Get very comfortable with groupby and merge.",
  },
  {
    id:"stats", label:"Statistics", icon:"📐",
    description:"Probability, hypothesis testing, confidence intervals, and regression basics.",
    xp:150, difficulty:"INTERMEDIATE", tier:2, x:38, prereqs:["python_da","excel"], state:"locked", isRequired:true,
    resources:[
      { title:"Statistics Fundamentals – StatQuest YT", url:"https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9", type:"video" },
      { title:"Khan Academy Statistics", url:"https://www.khanacademy.org/math/statistics-probability", type:"course" },
    ],
    challenges:["Run an A/B test on mock data and interpret results","Explain p-value to a non-technical person"],
    mentorTip:"Stats separates good analysts from great ones. Hiring managers test this heavily.",
  },
  {
    id:"viz", label:"Data Visualization", icon:"📈",
    description:"Chart selection, design principles, Matplotlib, Seaborn, and Tableau basics.",
    xp:125, difficulty:"INTERMEDIATE", tier:2, x:62, prereqs:["pandas"], state:"locked", isRequired:true,
    resources:[
      { title:"From Data to Viz (chart guide)", url:"https://www.data-to-viz.com", type:"article" },
      { title:"Tableau Public Training", url:"https://www.tableau.com/learn/training", type:"course" },
    ],
    challenges:["Build 5 different chart types for the same dataset","Create a public Tableau dashboard"],
    mentorTip:"Most business decisions are made from dashboards. Make yours impossible to misread.",
  },
  {
    id:"bi_tools", label:"BI Tools", icon:"🔭",
    description:"Looker, Power BI, or Tableau for business dashboards and reporting.",
    xp:100, difficulty:"INTERMEDIATE", tier:2, x:84, prereqs:["sql_da"], state:"locked", isRequired:false,
    resources:[
      { title:"Power BI Guided Learning – Microsoft", url:"https://learn.microsoft.com/en-us/power-bi/guided-learning/", type:"course" },
      { title:"Looker Documentation", url:"https://cloud.google.com/looker/docs", type:"article" },
    ],
    challenges:["Build a monthly KPI report in a BI tool","Connect a BI tool to a live database"],
    mentorTip:"Most companies use Looker or Power BI. Learn one end-to-end — it's often a job requirement.",
  },
  {
    id:"ml_basics", label:"ML Basics", icon:"🤖",
    description:"Supervised learning, regression, classification, model evaluation, and scikit-learn.",
    xp:200, difficulty:"ADVANCED", tier:3, x:22, prereqs:["pandas","stats"], state:"locked", isRequired:false,
    resources:[
      { title:"Kaggle Machine Learning Course", url:"https://www.kaggle.com/learn/intro-to-machine-learning", type:"course" },
      { title:"Hands-On ML – Aurélien Géron", url:"https://www.oreilly.com/library/view/hands-on-machine-learning/9781492032632/", type: "article" },
    ],
    challenges:["Build a price prediction model with scikit-learn","Participate in a Kaggle competition"],
    mentorTip:"You don't need to be an ML engineer — but knowing when to apply ML is a huge analyst advantage.",
  },
  {
    id:"ab_testing", label:"A/B Testing", icon:"🔬",
    description:"Experimental design, statistical significance, power analysis, and business impact.",
    xp:175, difficulty:"INTERMEDIATE", tier:3, x:50, prereqs:["stats","viz"], state:"locked", isRequired:true,
    resources:[
      { title:"Udacity A/B Testing Course (free)", url:"https://www.udacity.com/course/ab-testing--ud257", type:"course" },
      { title:"Evan Miller's A/B Test Tools", url:"https://www.evanmiller.org/ab-testing/", type:"practice" },
    ],
    challenges:["Design and analyze a mock A/B test end-to-end","Calculate sample size for a given power and significance level"],
    mentorTip:"A/B testing fluency is what separates senior analysts. Every product team runs experiments.",
  },
  {
    id:"dashboards", label:"Live Dashboards", icon:"🖥️",
    description:"Build production dashboards with refresh logic, alerts, and stakeholder-ready design.",
    xp:150, difficulty:"INTERMEDIATE", tier:3, x:78, prereqs:["viz","bi_tools"], state:"locked", isRequired:true,
    resources:[
      { title:"Streamlit Documentation", url:"https://docs.streamlit.io", type:"article" },
      { title:"Grafana Getting Started", url:"https://grafana.com/docs/grafana/latest/getting-started/", type:"course" },
    ],
    challenges:["Build a live dashboard connected to a database","Add automated email alerts to a dashboard"],
    mentorTip:"Stakeholders won't log in to see your analysis — bring the data to them via live dashboards.",
  },
  {
    id:"capstone_da", label:"Capstone Analysis", icon:"🏆",
    description:"End-to-end analysis project: question → data → insights → recommendations.",
    xp:300, difficulty:"ADVANCED", tier:4, x:32, prereqs:["ab_testing","dashboards"], state:"locked", isRequired:true,
    resources:[
      { title:"Kaggle Datasets – find a project", url:"https://www.kaggle.com/datasets", type:"practice" },
      { title:"Towards Data Science – project guides", url:"https://towardsdatascience.com", type:"article" },
    ],
    challenges:["Publish a full analysis on GitHub","Present findings to 3 non-technical people and get feedback"],
    mentorTip:"Your portfolio is your job application. One great analysis beats 10 mediocre ones.",
  },
  {
    id:"portfolio_da", label:"Data Portfolio", icon:"🌟",
    description:"3+ published projects showing breadth: SQL, Python, viz, storytelling, and impact.",
    xp:250, difficulty:"ADVANCED", tier:4, x:68, prereqs:["ml_basics"], state:"locked", isRequired:false,
    resources:[
      { title:"Dataquest Portfolio Guide", url:"https://www.dataquest.io/blog/data-science-portfolio/", type:"article" },
      { title:"Maven Analytics Portfolio Tips", url:"https://www.youtube.com/@mavenanalytics", type:"video" },
    ],
    challenges:["Get 5 GitHub stars on a data project","Post an analysis on LinkedIn and get 50+ reactions"],
    mentorTip:"Recruiters look at your GitHub and LinkedIn. Make it easy for them to see your best work.",
  },
];

const DA_EDGES: [string, string][] = [
  ["data_found","excel"],["data_found","python_da"],["data_found","sql_da"],
  ["python_da","pandas"],["excel","stats"],["python_da","stats"],
  ["pandas","viz"],["sql_da","bi_tools"],["pandas","ml_basics"],["stats","ml_basics"],
  ["stats","ab_testing"],["viz","ab_testing"],["viz","dashboards"],["bi_tools","dashboards"],
  ["ab_testing","capstone_da"],["dashboards","capstone_da"],
  ["ml_basics","portfolio_da"],
];

const DA_BADGES: Badge[] = [
  { id:"data_curious", label:"Data Curious",   emoji:"📊", unlockNodeId:"data_found"  },
  { id:"sql_slinger",  label:"SQL Slinger",     emoji:"🗃️", unlockNodeId:"sql_da"      },
  { id:"py_power",     label:"Python Power",    emoji:"🐍", unlockNodeId:"python_da"   },
  { id:"viz_master",   label:"Viz Master",      emoji:"📈", unlockNodeId:"viz"         },
  { id:"analyst_pro",  label:"Analyst Pro",     emoji:"🏆", unlockNodeId:"capstone_da" },
];

// ─── UI/UX DESIGNER ───────────────────────────────────────────────────────────
const UX_NODES: SkillNode[] = [
  {
    id:"design_found", label:"Design Foundations", icon:"✏️",
    description:"Visual hierarchy, gestalt principles, contrast, and how humans perceive interfaces.",
    xp:50, difficulty:"BEGINNER", tier:0, x:50, prereqs:[], state:"completed", isRequired:true,
    resources:[
      { title:"Refactoring UI (book/course)", url:"https://www.refactoringui.com", type:"course" },
      { title:"Design principles – Google Material", url:"https://m3.material.io/foundations", type:"article" },
    ],
    challenges:["Critique 5 real app interfaces with specific feedback","Redesign a bad UI from a screenshot"],
    mentorTip:"Good designers explain why their choices work. Train your eye — then your reasoning.",
  },
  {
    id:"principles", label:"Design Principles", icon:"🎯",
    description:"Color theory, typography, spacing, alignment, and visual consistency.",
    xp:75, difficulty:"BEGINNER", tier:1, x:18, prereqs:["design_found"], state:"completed", isRequired:true,
    resources:[
      { title:"Laws of UX – lawsofux.com", url:"https://lawsofux.com", type:"article" },
      { title:"Typography for Developers – Kevin Powell", url:"https://www.youtube.com/watch?v=agbh1wbfJt8", type:"video" },
    ],
    challenges:["Create a consistent color palette and type scale","Apply Fitt's Law to improve a button layout"],
    mentorTip:"Typography alone accounts for 95% of how polished your work looks. Invest in learning it.",
  },
  {
    id:"figma", label:"Figma", icon:"🖌️",
    description:"Components, auto layout, design tokens, prototyping, and team collaboration.",
    xp:100, difficulty:"BEGINNER", tier:1, x:50, prereqs:["design_found"], state:"active", isRequired:true,
    resources:[
      { title:"Figma YouTube Channel (official)", url:"https://www.youtube.com/@Figma", type:"video" },
      { title:"Figma for Beginners – Scrimba", url:"https://scrimba.com/learn/figma", type:"course" },
    ],
    challenges:["Recreate an existing app screen pixel-perfect in Figma","Build a component library with 10+ components"],
    mentorTip:"Figma is the industry standard. Learn auto layout deeply — it will save you hours every week.",
  },
  {
    id:"research", label:"User Research", icon:"🔍",
    description:"User interviews, surveys, affinity mapping, and synthesizing insights.",
    xp:100, difficulty:"BEGINNER", tier:1, x:82, prereqs:["design_found"], state:"locked", isRequired:true,
    resources:[
      { title:"Just Enough Research (book)", url:"https://abookapart.com/products/just-enough-research", type:"article" },
      { title:"Nielsen Norman Group – Research Methods", url:"https://www.nngroup.com/articles/which-ux-research-methods/", type:"article" },
    ],
    challenges:["Conduct 5 user interviews and synthesize themes","Run a usability test on an existing app"],
    mentorTip:"Design without research is decoration. Interviews will ask how you validate your decisions.",
  },
  {
    id:"wireframe", label:"Wireframing", icon:"📐",
    description:"Low-fidelity sketching, information architecture, and rapid ideation.",
    xp:100, difficulty:"BEGINNER", tier:2, x:14, prereqs:["principles","figma"], state:"locked", isRequired:true,
    resources:[
      { title:"Wireframing – UX Collective", url:"https://uxdesign.cc/how-to-wireframe-a-website-a2eba6028c83", type:"article" },
      { title:"Crazy 8s – Google Design Sprint", url:"https://designsprintkit.withgoogle.com/methodology/phase3-sketch/crazy-8s", type:"practice" },
    ],
    challenges:["Sketch 20 wireframes in 20 minutes (crazy 8s × 2.5)","Build a 10-screen wireframe for an app idea"],
    mentorTip:"Fast, messy wireframes beat slow, polished ones. Speed is the skill — ideas come later.",
  },
  {
    id:"proto", label:"Prototyping", icon:"▶️",
    description:"Interactive prototypes, user flows, micro-interactions in Figma.",
    xp:125, difficulty:"INTERMEDIATE", tier:2, x:36, prereqs:["figma","wireframe"], state:"locked", isRequired:true,
    resources:[
      { title:"Figma Prototyping Docs", url:"https://help.figma.com/hc/en-us/articles/360040314193-Guide-to-prototyping-in-Figma", type:"article" },
      { title:"Prototyping 101 – InVision", url:"https://www.invisionapp.com/inside-design/prototyping/", type:"course" },
    ],
    challenges:["Build a clickable prototype and test it with 3 users","Add micro-animations to a key interaction"],
    mentorTip:"Prototypes expose assumptions you didn't know you had. Always test before going high-fidelity.",
  },
  {
    id:"typography", label:"Typography & Color", icon:"🔤",
    description:"Type pairing, scale, hierarchy, color accessibility, and brand systems.",
    xp:100, difficulty:"INTERMEDIATE", tier:2, x:60, prereqs:["principles"], state:"locked", isRequired:true,
    resources:[
      { title:"Practical Typography (web book)", url:"https://practicaltypography.com", type:"article" },
      { title:"Color & Accessibility – A11Y Project", url:"https://www.a11yproject.com/posts/what-is-color-contrast/", type:"article" },
    ],
    challenges:["Create a full type scale for a product","Audit an app for WCAG AA color contrast compliance"],
    mentorTip:"Accessible design is good design. Contrast ratios and font sizes matter for real users.",
  },
  {
    id:"ia", label:"Info Architecture", icon:"🗺️",
    description:"Navigation patterns, card sorting, sitemaps, and content hierarchy.",
    xp:100, difficulty:"INTERMEDIATE", tier:2, x:83, prereqs:["research"], state:"locked", isRequired:false,
    resources:[
      { title:"Information Architecture – Nielsen Norman", url:"https://www.nngroup.com/articles/ia-vs-navigation/", type:"article" },
      { title:"Card Sorting Guide – Optimal Workshop", url:"https://www.optimalworkshop.com/learn/101s/card-sorting/", type:"practice" },
    ],
    challenges:["Run a card sort with 5 participants","Draw a sitemap for an e-commerce app"],
    mentorTip:"Great IA is invisible. Users only notice when it's broken — which is exactly why it matters.",
  },
  {
    id:"design_sys", label:"Design Systems", icon:"🧱",
    description:"Component libraries, tokens, documentation, and cross-team design consistency.",
    xp:200, difficulty:"ADVANCED", tier:3, x:22, prereqs:["proto","typography"], state:"locked", isRequired:false,
    resources:[
      { title:"Design Systems by Alla Kholmatova", url:"https://www.smashingmagazine.com/printed-books/design-systems/", type:"article" },
      { title:"Storybook Documentation", url:"https://storybook.js.org/docs/get-started", type:"article" },
    ],
    challenges:["Build a mini design system with 20+ components","Document every component with usage guidelines"],
    mentorTip:"Companies like Airbnb and Uber have full-time design system teams. It's a valuable specialization.",
  },
  {
    id:"usability", label:"Usability Testing", icon:"🧑‍💻",
    description:"Moderated and unmoderated testing, task analysis, and iterating on findings.",
    xp:175, difficulty:"INTERMEDIATE", tier:3, x:50, prereqs:["proto","ia"], state:"locked", isRequired:true,
    resources:[
      { title:"Rocket Surgery Made Easy – Steve Krug", url:"https://www.sensible.com/rsme.html", type:"article" },
      { title:"Maze – remote usability testing tool", url:"https://maze.co", type:"practice" },
    ],
    challenges:["Run 3 moderated usability sessions and synthesize findings","Track task completion rate and error rate"],
    mentorTip:"One hour of user testing will reveal more issues than a week of your own review.",
  },
  {
    id:"motion", label:"Motion & Interaction", icon:"✨",
    description:"Animation principles, easing curves, transition design, and tool handoff.",
    xp:150, difficulty:"ADVANCED", tier:3, x:78, prereqs:["proto","design_sys"], state:"locked", isRequired:false,
    resources:[
      { title:"Google Motion Design Guidelines", url:"https://m3.material.io/styles/motion/overview", type:"article" },
      { title:"After Effects for UX Designers", url:"https://www.youtube.com/results?search_query=after+effects+ux+motion+design", type:"video" },
    ],
    challenges:["Design an onboarding animation with 3 stages","Prototype a swipe-to-dismiss interaction"],
    mentorTip:"Motion design is the difference between an app that feels built vs. crafted.",
  },
  {
    id:"portfolio_ux", label:"Portfolio Project", icon:"🖼️",
    description:"Full case study: problem → research → design → test → iterate → ship.",
    xp:300, difficulty:"ADVANCED", tier:4, x:32, prereqs:["usability","design_sys"], state:"locked", isRequired:true,
    resources:[
      { title:"UX Portfolio Tips – Sarah Doody", url:"https://www.youtube.com/@SarahDoody", type:"video" },
      { title:"Bestfolios – portfolio inspiration", url:"https://www.bestfolios.com/portfolios", type:"article" },
    ],
    challenges:["Publish a portfolio site with 3 case studies","Get feedback from 3 senior designers on LinkedIn"],
    mentorTip:"Your portfolio is your interview. Every slide should answer: what problem, what decision, what impact.",
  },
  {
    id:"casestudy", label:"Case Study", icon:"📝",
    description:"Written deep-dive of a design project showing process, decisions, and outcomes.",
    xp:250, difficulty:"ADVANCED", tier:4, x:68, prereqs:["motion","usability"], state:"locked", isRequired:false,
    resources:[
      { title:"How to Write a UX Case Study – UX Collective", url:"https://uxdesign.cc/how-to-write-a-ux-case-study-c9edab70f5ca", type:"article" },
      { title:"Notion Case Study Templates", url:"https://www.notion.so/templates/ux-case-study", type:"practice" },
    ],
    challenges:["Write a 1500-word case study for a past project","Get 100 views on a published case study"],
    mentorTip:"Most portfolios look the same. A well-written case study that shows your thinking will get you hired.",
  },
];

const UX_EDGES: [string, string][] = [
  ["design_found","principles"],["design_found","figma"],["design_found","research"],
  ["principles","wireframe"],["figma","wireframe"],["figma","proto"],["wireframe","proto"],
  ["principles","typography"],["research","ia"],
  ["proto","design_sys"],["typography","design_sys"],["proto","usability"],["ia","usability"],
  ["design_sys","motion"],["proto","motion"],
  ["usability","portfolio_ux"],["design_sys","portfolio_ux"],
  ["motion","casestudy"],["usability","casestudy"],
];

const UX_BADGES: Badge[] = [
  { id:"design_eye",   label:"Design Eye",        emoji:"👁️", unlockNodeId:"design_found"  },
  { id:"figma_pro",    label:"Figma Pro",          emoji:"🖌️", unlockNodeId:"figma"         },
  { id:"user_champ",   label:"User Champion",      emoji:"🔍", unlockNodeId:"research"      },
  { id:"sys_thinker",  label:"Systems Thinker",    emoji:"🧱", unlockNodeId:"design_sys"    },
  { id:"port_ready",   label:"Portfolio Ready",    emoji:"🖼️", unlockNodeId:"portfolio_ux"  },
];

// ─── CYBERSECURITY ────────────────────────────────────────────────────────────
const CYBER_NODES: SkillNode[] = [
  // ── Tier 0 ──
  {
    id: "cyber_found", label: "Cyber Foundations", icon: "🛡️",
    description: "The CIA triad, threat actors, attack vectors, and how modern security frameworks (NIST, MITRE ATT&CK) operate.",
    xp: 50, difficulty: "BEGINNER", tier: 0, x: 50, prereqs: [], state: "completed", isRequired: true,
    resources: [
      { title: "CS50 Cybersecurity – Harvard (free)", url: "https://cs50.harvard.edu/cybersecurity/", type: "course" },
      { title: "OWASP Top 10 – official overview", url: "https://owasp.org/www-project-top-ten/", type: "article" },
    ],
    challenges: ["Define CIA triad with one real-world breach for each", "Map 5 recent CVEs to the MITRE ATT&CK framework"],
    mentorTip: "Security is a mindset before it's a toolset. Learn to think like an attacker from day one — everything else follows.",
  },
  // ── Tier 1 ──
  {
    id: "networking", label: "Networking", icon: "🌐",
    description: "OSI model, TCP/IP, DNS, firewalls, VPNs, and packet analysis with Wireshark.",
    xp: 75, difficulty: "BEGINNER", tier: 1, x: 18, prereqs: ["cyber_found"], state: "completed", isRequired: true,
    resources: [
      { title: "Professor Messer – CompTIA Network+ (free)", url: "https://www.professormesser.com/network-plus/n10-008/n10-008-video/n10-008-training-course/", type: "video" },
      { title: "Wireshark Tutorial – Wireshark.org", url: "https://www.wireshark.org/docs/wsug_html_chunked/", type: "article" },
    ],
    challenges: ["Capture and decode a TCP handshake in Wireshark", "Draw the full path of an HTTP request through all 7 OSI layers"],
    mentorTip: "You can't defend what you don't understand. Most attacks live in the network layer — know it cold.",
  },
  {
    id: "linux", label: "Linux & CLI", icon: "🐧",
    description: "File system, permissions, process management, shell scripting, and basic hardening.",
    xp: 100, difficulty: "BEGINNER", tier: 1, x: 50, prereqs: ["cyber_found"], state: "active", isRequired: true,
    resources: [
      { title: "OverTheWire: Bandit – Linux wargame", url: "https://overthewire.org/wargames/bandit/", type: "practice" },
      { title: "The Linux Command Line (free book)", url: "https://linuxcommand.org/tlcl.php", type: "article" },
    ],
    challenges: ["Complete the first 20 Bandit wargame levels", "Write a bash script that audits all SUID binaries on a system"],
    mentorTip: "Every serious security tool runs on Linux. Being fluent in the shell is not optional.",
  },
  {
    id: "python_cyber", label: "Python Scripting", icon: "🐍",
    description: "Automating security tasks, writing scanners, parsing logs, and using security libraries.",
    xp: 100, difficulty: "BEGINNER", tier: 1, x: 82, prereqs: ["cyber_found"], state: "locked", isRequired: true,
    resources: [
      { title: "Automate the Boring Stuff (free)", url: "https://automatetheboringstuff.com", type: "course" },
      { title: "Black Hat Python (book)", url: "https://nostarch.com/black-hat-python2E", type: "article" },
    ],
    challenges: ["Write a port scanner using Python sockets", "Build a log parser that flags failed SSH login attempts"],
    mentorTip: "The best security pros write their own tools. Python is the lingua franca — learn it to automate everything.",
  },
  // ── Tier 2 ──
  {
    id: "web_security", label: "Web Security", icon: "🕸️",
    description: "OWASP Top 10: SQL injection, XSS, CSRF, insecure deserialization, and broken auth.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 2, x: 20, prereqs: ["networking", "linux"], state: "locked", isRequired: true,
    resources: [
      { title: "PortSwigger Web Academy (free)", url: "https://portswigger.net/web-security", type: "course" },
      { title: "OWASP WebGoat – practice app", url: "https://owasp.org/www-project-webgoat/", type: "practice" },
    ],
    challenges: ["Complete 10 PortSwigger SQL injection labs", "Find and exploit a stored XSS in DVWA (local setup)"],
    mentorTip: "PortSwigger's free Web Academy is the best web security course on the internet. Do every lab.",
  },
  {
    id: "cryptography", label: "Cryptography", icon: "🔐",
    description: "Symmetric and asymmetric encryption, hashing, TLS, PKI, and common crypto attacks.",
    xp: 125, difficulty: "INTERMEDIATE", tier: 2, x: 44, prereqs: ["linux", "python_cyber"], state: "locked", isRequired: true,
    resources: [
      { title: "Cryptopals – crypto challenges", url: "https://cryptopals.com", type: "practice" },
      { title: "Serious Cryptography (book)", url: "https://nostarch.com/seriouscrypto", type: "article" },
    ],
    challenges: ["Implement AES-128 CBC mode from scratch in Python", "Break a repeating-key XOR cipher on the Cryptopals set 1"],
    mentorTip: "You don't need to build crypto — you need to know when it's broken. Cryptopals teaches exactly that.",
  },
  {
    id: "siem", label: "SIEM & Log Analysis", icon: "📊",
    description: "Security event monitoring, log correlation, alert triage, and incident detection with Splunk or ELK.",
    xp: 125, difficulty: "INTERMEDIATE", tier: 2, x: 68, prereqs: ["networking"], state: "locked", isRequired: false,
    resources: [
      { title: "Splunk Free Training", url: "https://www.splunk.com/en_us/training/free-courses/overview.html", type: "course" },
      { title: "TryHackMe – SOC Level 1 path", url: "https://tryhackme.com/path/outline/soclevel1", type: "practice" },
    ],
    challenges: ["Build a Splunk dashboard that detects brute-force attempts", "Write a SIEM detection rule for lateral movement"],
    mentorTip: "Most security jobs are defensive. Being fluent in a SIEM is often the first thing asked in a SOC interview.",
  },
  {
    id: "ctf_basics", label: "CTF Basics", icon: "🚩",
    description: "Capture-the-Flag competitions — reverse engineering, pwn, web, forensics, and crypto challenges.",
    xp: 100, difficulty: "INTERMEDIATE", tier: 2, x: 88, prereqs: ["python_cyber"], state: "locked", isRequired: false,
    resources: [
      { title: "picoCTF – beginner CTF", url: "https://picoctf.org", type: "practice" },
      { title: "CTFtime.org – event calendar", url: "https://ctftime.org", type: "practice" },
    ],
    challenges: ["Complete 20 picoCTF challenges across 3 categories", "Compete in one live CTF event and publish a writeup"],
    mentorTip: "CTF writeups on your resume are concrete proof you can think offensively. Recruiters notice.",
  },
  // ── Tier 3 ──
  {
    id: "pen_testing", label: "Penetration Testing", icon: "⚔️",
    description: "Recon, exploitation, post-exploitation, and writing professional pentest reports.",
    xp: 200, difficulty: "ADVANCED", tier: 3, x: 26, prereqs: ["web_security", "linux"], state: "locked", isRequired: false,
    resources: [
      { title: "TryHackMe – Jr Penetration Tester", url: "https://tryhackme.com/path/outline/jrpenetrationtester", type: "course" },
      { title: "HackTheBox Academy – Penetration Tester", url: "https://academy.hackthebox.com/path/preview/penetration-tester", type: "course" },
    ],
    challenges: ["Root 5 HackTheBox machines (Easy tier)", "Write a professional-style pentest report for a lab machine"],
    mentorTip: "Pentest reports are the product. A good report that explains risk clearly is worth more than raw exploit skill.",
  },
  {
    id: "blue_team", label: "Blue Team & IR", icon: "🔵",
    description: "Incident response playbooks, forensics, threat hunting, and hardening systems.",
    xp: 175, difficulty: "ADVANCED", tier: 3, x: 54, prereqs: ["siem", "cryptography"], state: "locked", isRequired: true,
    resources: [
      { title: "SANS Incident Response – free resources", url: "https://www.sans.org/blog/sans-incident-response-resources/", type: "article" },
      { title: "TryHackMe – SOC Level 2", url: "https://tryhackme.com/path/outline/soclevel2", type: "practice" },
    ],
    challenges: ["Write an IR playbook for a ransomware incident", "Perform memory forensics on a captured VM image"],
    mentorTip: "Most security jobs are blue team. Knowing how attackers think makes you a better defender — not just knowing how to defend.",
  },
  {
    id: "cloud_sec", label: "Cloud Security", icon: "☁️",
    description: "IAM policies, misconfiguration attacks, AWS/GCP security services, and cloud-native threats.",
    xp: 175, difficulty: "ADVANCED", tier: 3, x: 80, prereqs: ["web_security", "siem"], state: "locked", isRequired: false,
    resources: [
      { title: "CloudGoat – vulnerable AWS labs", url: "https://github.com/RhinoSecurityLabs/cloudgoat", type: "practice" },
      { title: "flaws.cloud – AWS security challenge", url: "https://flaws.cloud", type: "practice" },
    ],
    challenges: ["Exploit an S3 misconfiguration in CloudGoat", "Complete all 6 levels of flaws.cloud and write a remediation guide"],
    mentorTip: "Cloud security is the fastest-growing area in the field. Companies move to cloud and create misconfigs daily.",
  },
  // ── Tier 4 ──
  {
    id: "oscp_path", label: "Offensive Capstone", icon: "💀",
    description: "Advanced exploitation, Active Directory attacks, buffer overflows, and OSCP-style lab environments.",
    xp: 300, difficulty: "ADVANCED", tier: 4, x: 30, prereqs: ["pen_testing", "ctf_basics"], state: "locked", isRequired: false,
    resources: [
      { title: "OffSec PG Practice – lab machines", url: "https://www.offensive-security.com/labs/individual/", type: "practice" },
      { title: "TCM Security – Practical Ethical Hacking", url: "https://academy.tcm-sec.com/p/practical-ethical-hacking-the-complete-course", type: "course" },
    ],
    challenges: ["Complete an OSCP-style 24-hour exam simulation", "Compromise an Active Directory lab end-to-end"],
    mentorTip: "OSCP is the gold standard offensive cert. Even if you don't take the exam, the prep process teaches you to think methodically.",
  },
  {
    id: "capstone_cyber", label: "Defensive Capstone", icon: "🏰",
    description: "End-to-end security program: policy, architecture review, purple team exercise, and reporting.",
    xp: 300, difficulty: "ADVANCED", tier: 4, x: 76, prereqs: ["blue_team", "cloud_sec"], state: "locked", isRequired: true,
    resources: [
      { title: "NIST Cybersecurity Framework", url: "https://www.nist.gov/cyberframework", type: "article" },
      { title: "Purple Team Exercise Framework", url: "https://github.com/scythe-io/purple-team-exercise-framework", type: "practice" },
    ],
    challenges: ["Conduct a full security audit of a small app and deliver a remediation report", "Run a purple team tabletop exercise with 3+ teammates"],
    mentorTip: "Senior security roles require communication as much as technical skill. Practice writing risk reports executives will actually read.",
  },
];

const CYBER_EDGES: [string, string][] = [
  ["cyber_found","networking"], ["cyber_found","linux"], ["cyber_found","python_cyber"],
  ["networking","web_security"], ["linux","web_security"],
  ["linux","cryptography"], ["python_cyber","cryptography"],
  ["networking","siem"],
  ["python_cyber","ctf_basics"],
  ["web_security","pen_testing"], ["linux","pen_testing"],
  ["siem","blue_team"], ["cryptography","blue_team"],
  ["web_security","cloud_sec"], ["siem","cloud_sec"],
  ["pen_testing","oscp_path"], ["ctf_basics","oscp_path"],
  ["blue_team","capstone_cyber"], ["cloud_sec","capstone_cyber"],
];

const CYBER_BADGES: Badge[] = [
  { id: "network_ninja",   label: "Network Ninja",      emoji: "🌐", unlockNodeId: "networking"     },
  { id: "shell_shaman",    label: "Shell Shaman",        emoji: "🐧", unlockNodeId: "linux"          },
  { id: "web_guardian",    label: "Web Guardian",        emoji: "🕸️", unlockNodeId: "web_security"   },
  { id: "flag_catcher",    label: "Flag Catcher",        emoji: "🚩", unlockNodeId: "ctf_basics"     },
  { id: "blue_defender",   label: "Blue Defender",       emoji: "🔵", unlockNodeId: "blue_team"      },
  { id: "cert_defender",   label: "Certified Defender",  emoji: "🏰", unlockNodeId: "capstone_cyber" },
];

// ─── CLOUD ENGINEER ───────────────────────────────────────────────────────────
const CLOUD_NODES: SkillNode[] = [
  // ── Tier 0 ──
  {
    id: "cloud_found", label: "Cloud Foundations", icon: "☁️",
    description: "IaaS vs PaaS vs SaaS, cloud economics, shared responsibility model, and why companies move to cloud.",
    xp: 50, difficulty: "BEGINNER", tier: 0, x: 50, prereqs: [], state: "completed", isRequired: true,
    resources: [
      { title: "AWS Cloud Practitioner Essentials (free)", url: "https://aws.amazon.com/training/learn-about/cloud-practitioner/", type: "course" },
      { title: "Google Cloud Digital Leader path", url: "https://cloud.google.com/certification/cloud-digital-leader", type: "course" },
    ],
    challenges: ["Explain the shared responsibility model to a non-technical person", "List 5 services each from IaaS, PaaS, and SaaS categories"],
    mentorTip: "Cloud is the default infrastructure for everything built today. Understanding it deeply is a superpower in any engineering role.",
  },
  // ── Tier 1 ──
  {
    id: "linux_cloud", label: "Linux & Networking", icon: "🐧",
    description: "Shell fluency, SSH, systemd, VPC networking, subnets, and security groups.",
    xp: 75, difficulty: "BEGINNER", tier: 1, x: 18, prereqs: ["cloud_found"], state: "completed", isRequired: true,
    resources: [
      { title: "The Linux Command Line (free book)", url: "https://linuxcommand.org/tlcl.php", type: "article" },
      { title: "AWS Networking Fundamentals", url: "https://aws.amazon.com/getting-started/aws-networking-essentials/", type: "article" },
    ],
    challenges: ["SSH into a remote server and configure a firewall rule", "Create a VPC with public + private subnets and a NAT gateway"],
    mentorTip: "Everything in cloud runs on Linux. Not knowing the shell is like being a chef who can't use a knife.",
  },
  {
    id: "python_cloud", label: "Python & Scripting", icon: "🐍",
    description: "Automation scripts, boto3 (AWS SDK), cloud API calls, and scripting workflows.",
    xp: 75, difficulty: "BEGINNER", tier: 1, x: 50, prereqs: ["cloud_found"], state: "active", isRequired: true,
    resources: [
      { title: "Automate the Boring Stuff (free)", url: "https://automatetheboringstuff.com", type: "course" },
      { title: "AWS boto3 Documentation", url: "https://boto3.amazonaws.com/v1/documentation/api/latest/index.html", type: "article" },
    ],
    challenges: ["Write a boto3 script that lists all EC2 instances and their states", "Build a script that auto-tags untagged AWS resources"],
    mentorTip: "Cloud engineers who can't script are order-takers. Cloud engineers who can script are force multipliers.",
  },
  {
    id: "git_cloud", label: "Git & DevOps Basics", icon: "🌿",
    description: "Version control for infrastructure, branching strategies, and DevOps culture and tooling.",
    xp: 75, difficulty: "BEGINNER", tier: 1, x: 82, prereqs: ["cloud_found"], state: "active", isRequired: true,
    resources: [
      { title: "Pro Git Book (free)", url: "https://git-scm.com/book/en/v2", type: "article" },
      { title: "DevOps Roadmap – roadmap.sh", url: "https://roadmap.sh/devops", type: "article" },
    ],
    challenges: ["Set up a GitFlow branching strategy for a project", "Write a Git hook that runs lint before every commit"],
    mentorTip: "Infrastructure code lives in Git like application code. Treat it the same way — peer review, history, rollback.",
  },
  // ── Tier 2 ──
  {
    id: "aws_core", label: "AWS / Cloud Core", icon: "🟠",
    description: "EC2, S3, IAM, RDS, Lambda, CloudWatch — the core services used in every production system.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 2, x: 14, prereqs: ["linux_cloud", "python_cloud"], state: "locked", isRequired: true,
    resources: [
      { title: "AWS Solutions Architect Associate – Adrian Cantrill", url: "https://learn.cantrill.io/p/aws-certified-solutions-architect-associate-saa-c03", type: "course" },
      { title: "AWS Free Tier – hands-on practice", url: "https://aws.amazon.com/free/", type: "practice" },
    ],
    challenges: ["Deploy a Node.js app on EC2 with an RDS backend", "Build a serverless API using Lambda + API Gateway + DynamoDB"],
    mentorTip: "AWS is 32% of the cloud market. Learn it first and deeply — every other cloud will feel familiar after.",
  },
  {
    id: "docker", label: "Docker & Containers", icon: "🐳",
    description: "Images, containers, Dockerfile best practices, Docker Compose, and container registries.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 2, x: 36, prereqs: ["linux_cloud"], state: "locked", isRequired: true,
    resources: [
      { title: "Docker in 100 Seconds – Fireship", url: "https://www.youtube.com/watch?v=Gjnup-PuquQ", type: "video" },
      { title: "Play with Docker – free browser lab", url: "https://labs.play-with-docker.com", type: "practice" },
    ],
    challenges: ["Write an optimized multi-stage Dockerfile for a production app", "Use Docker Compose to run a full-stack app with 3 services"],
    mentorTip: "Containers are the atomic unit of modern deployment. If you can't containerize it, you can't ship it reliably.",
  },
  {
    id: "terraform", label: "Infrastructure as Code", icon: "📐",
    description: "Terraform fundamentals: providers, resources, state, modules, and managing real cloud infra.",
    xp: 175, difficulty: "INTERMEDIATE", tier: 2, x: 62, prereqs: ["python_cloud", "git_cloud"], state: "locked", isRequired: true,
    resources: [
      { title: "HashiCorp Terraform Tutorials (free)", url: "https://developer.hashicorp.com/terraform/tutorials", type: "course" },
      { title: "Terraform Up & Running (book)", url: "https://www.terraformupandrunning.com", type: "article" },
    ],
    challenges: ["Provision a full VPC + EC2 + RDS stack using Terraform", "Refactor flat Terraform code into reusable modules"],
    mentorTip: "If you're clicking in the AWS console to provision things, you're doing it wrong. Everything should be code.",
  },
  {
    id: "monitoring", label: "Monitoring & Observability", icon: "📡",
    description: "Metrics, logs, traces (the three pillars), alerting, dashboards, and SLOs.",
    xp: 125, difficulty: "INTERMEDIATE", tier: 2, x: 86, prereqs: ["aws_core"], state: "locked", isRequired: false,
    resources: [
      { title: "Grafana + Prometheus – getting started", url: "https://grafana.com/docs/grafana/latest/getting-started/get-started-grafana-prometheus/", type: "course" },
      { title: "Google SRE Book – free online", url: "https://sre.google/sre-book/table-of-contents/", type: "article" },
    ],
    challenges: ["Set up Prometheus + Grafana monitoring for a running service", "Define SLOs for an API and create an alert when they're breached"],
    mentorTip: "You can't own what you can't see. Observability is the difference between hoping your system works and knowing it does.",
  },
  // ── Tier 3 ──
  {
    id: "kubernetes", label: "Kubernetes", icon: "⎈",
    description: "Pods, deployments, services, ingress, Helm charts, and cluster operations.",
    xp: 200, difficulty: "ADVANCED", tier: 3, x: 22, prereqs: ["docker", "aws_core"], state: "locked", isRequired: true,
    resources: [
      { title: "Kubernetes in 100 Seconds – Fireship", url: "https://www.youtube.com/watch?v=PziYflu8cB8", type: "video" },
      { title: "KillerCoda – free K8s interactive labs", url: "https://killercoda.com/kubernetes", type: "practice" },
    ],
    challenges: ["Deploy a multi-container app to a local K8s cluster using Helm", "Set up horizontal pod autoscaling and load-test it"],
    mentorTip: "K8s is complex but unavoidable at scale. Learn it properly — there's a huge shortage of engineers who truly understand it.",
  },
  {
    id: "cicd", label: "CI/CD Pipelines", icon: "⚙️",
    description: "GitHub Actions, GitLab CI, automated testing, staging deployments, and blue/green releases.",
    xp: 175, difficulty: "INTERMEDIATE", tier: 3, x: 52, prereqs: ["git_cloud", "terraform"], state: "locked", isRequired: true,
    resources: [
      { title: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions", type: "article" },
      { title: "CI/CD with GitHub Actions – freeCodeCamp", url: "https://www.youtube.com/watch?v=R8_veQiYBjI", type: "video" },
    ],
    challenges: ["Build a pipeline that tests, builds a Docker image, and deploys to AWS on every merge to main", "Implement a blue/green deployment strategy for zero downtime releases"],
    mentorTip: "Manual deployments cause outages. Every company wants engineers who automate the path to production.",
  },
  {
    id: "cloud_security_eng", label: "Cloud Security", icon: "🔒",
    description: "IAM least privilege, secrets management, VPC security, compliance controls, and threat detection.",
    xp: 175, difficulty: "ADVANCED", tier: 3, x: 80, prereqs: ["aws_core", "monitoring"], state: "locked", isRequired: false,
    resources: [
      { title: "AWS Security Best Practices", url: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/welcome.html", type: "article" },
      { title: "flaws.cloud – AWS security challenge", url: "https://flaws.cloud", type: "practice" },
    ],
    challenges: ["Audit an AWS account and remediate all critical findings in AWS Security Hub", "Set up GuardDuty + automated response to flag exposed credentials"],
    mentorTip: "A single misconfigured IAM role can expose an entire company. Security is every cloud engineer's job.",
  },
  // ── Tier 4 ──
  {
    id: "multi_cloud", label: "Multi-Cloud & Arch", icon: "🌐",
    description: "Multi-cloud strategy, disaster recovery, service mesh, and designing for reliability.",
    xp: 250, difficulty: "ADVANCED", tier: 4, x: 28, prereqs: ["kubernetes", "cicd"], state: "locked", isRequired: false,
    resources: [
      { title: "AWS Well-Architected Framework", url: "https://aws.amazon.com/architecture/well-architected/", type: "article" },
      { title: "Designing Distributed Systems (free book)", url: "https://azure.microsoft.com/en-us/resources/designing-distributed-systems/", type: "article" },
    ],
    challenges: ["Design an active-active multi-region architecture with failover under 30s", "Deploy the same app to AWS and GCP using a shared Terraform codebase"],
    mentorTip: "Multi-cloud is hard. Don't do it unless you need it. But understanding why you would — and the tradeoffs — is senior-level thinking.",
  },
  {
    id: "capstone_cloud", label: "Production Infra", icon: "🏗️",
    description: "Ship production-grade infrastructure: multi-region, auto-scaling, zero-downtime deploys, full observability.",
    xp: 300, difficulty: "ADVANCED", tier: 4, x: 74, prereqs: ["kubernetes", "cicd", "cloud_security_eng"], state: "locked", isRequired: true,
    resources: [
      { title: "The Odin Project – DevOps supplement", url: "https://www.theodinproject.com", type: "course" },
      { title: "AWS Architecture Blog", url: "https://aws.amazon.com/blogs/architecture/", type: "article" },
    ],
    challenges: ["Deploy a production app that handles 1,000 RPS with autoscaling and full observability", "Achieve RTO < 1 minute and RPO < 5 minutes for a critical service"],
    mentorTip: "Your portfolio should show a production system, not a toy. Pick one project and make it genuinely production-ready.",
  },
];

const CLOUD_EDGES: [string, string][] = [
  ["cloud_found","linux_cloud"], ["cloud_found","python_cloud"], ["cloud_found","git_cloud"],
  ["linux_cloud","aws_core"], ["python_cloud","aws_core"],
  ["linux_cloud","docker"],
  ["python_cloud","terraform"], ["git_cloud","terraform"],
  ["aws_core","monitoring"],
  ["docker","kubernetes"], ["aws_core","kubernetes"],
  ["git_cloud","cicd"], ["terraform","cicd"],
  ["aws_core","cloud_security_eng"], ["monitoring","cloud_security_eng"],
  ["kubernetes","multi_cloud"], ["cicd","multi_cloud"],
  ["kubernetes","capstone_cloud"], ["cicd","capstone_cloud"], ["cloud_security_eng","capstone_cloud"],
];

const CLOUD_BADGES: Badge[] = [
  { id: "cloud_curious",  label: "Cloud Curious",    emoji: "☁️", unlockNodeId: "cloud_found"       },
  { id: "first_deploy",   label: "First Deploy",      emoji: "🟠", unlockNodeId: "aws_core"          },
  { id: "container_king", label: "Container King",    emoji: "🐳", unlockNodeId: "docker"            },
  { id: "iac_master",     label: "IaC Master",        emoji: "📐", unlockNodeId: "terraform"         },
  { id: "k8s_pilot",      label: "K8s Pilot",         emoji: "⎈",  unlockNodeId: "kubernetes"        },
  { id: "cloud_arch",     label: "Cloud Architect",   emoji: "🏗️", unlockNodeId: "capstone_cloud"    },
];

// ─── Exported tracks ──────────────────────────────────────────────────────────
export const CAREER_TRACKS: CareerTrack[] = [
  {
    id: "software_engineer",
    label: "Software Engineer",
    icon: "💻",
    color: "#60A5FA",
    colorDim: "#1e3a6a",
    nodes: SE_NODES,
    edges: SE_EDGES,
    badges: SE_BADGES,
    hiringManagerNote: "Strong DSA, system design basics, and at least one shipped full-stack project. React + Node preferred.",
    mentorRecommendation: "React + Node first → build 2 projects → deep DSA for FAANG → system design for senior roles.",
  },
  {
    id: "data_scientist",
    label: "Data Analyst",
    icon: "📊",
    color: "#FBBF24",
    colorDim: "#3a2a06",
    nodes: DA_NODES,
    edges: DA_EDGES,
    badges: DA_BADGES,
    hiringManagerNote: "SQL proficiency is mandatory. Python for analysis is strongly preferred. Storytelling matters as much as technical skill.",
    mentorRecommendation: "SQL daily → Python + Pandas → build a public Kaggle notebook → land on stats and A/B testing.",
  },
  {
    id: "ux_designer",
    label: "UI/UX Designer",
    icon: "🎨",
    color: "#F472B6",
    colorDim: "#3a0a2a",
    nodes: UX_NODES,
    edges: UX_EDGES,
    badges: UX_BADGES,
    hiringManagerNote: "Figma fluency is table stakes. We look for research instincts, design systems experience, and a portfolio with real case studies.",
    mentorRecommendation: "Master Figma first → run real user interviews → build a design system → write case studies for everything.",
  },
  // Same skill-tree structure as SWE — onboarding stores distinct goals (metadata / hiring copy differ).
  {
    id: "product_manager",
    label: "Product Manager",
    icon: "🗺️",
    color: "#22C55E",
    colorDim: "#0a2a18",
    nodes: SE_NODES,
    edges: SE_EDGES,
    badges: SE_BADGES,
    hiringManagerNote: "We look for structured problem solving, stakeholder communication, and proof you can ship outcomes — not just slide decks.",
    mentorRecommendation: "Practice writing PRDs → user discovery → prioritization frameworks → ship something small with engineers.",
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    icon: "🛡️",
    color: "#94A3B8",
    colorDim: "#1e293b",
    nodes: CYBER_NODES,
    edges: CYBER_EDGES,
    badges: CYBER_BADGES,
    hiringManagerNote: "Hands-on labs, networking fundamentals, and secure-by-default thinking beat buzzwords. Show CVE writeups or CTF progress.",
    mentorRecommendation: "Networking + Linux + one cert path (e.g. Security+) → home lab → OWASP → capture-the-flag basics.",
  },
  {
    id: "cloud_engineer",
    label: "Cloud Engineer",
    icon: "☁️",
    color: "#38BDF8",
    colorDim: "#0c4a6e",
    nodes: CLOUD_NODES,
    edges: CLOUD_EDGES,
    badges: CLOUD_BADGES,
    hiringManagerNote: "Prove you can ship infrastructure as code, debug IAM, and own reliability — showcase one multi-service deploy.",
    mentorRecommendation: "Pick one cloud deeply → IaC → containers → CI/CD → observability — then automate everything twice.",
  },
];

export function getTrack(goalId: string | undefined): CareerTrack {
  return CAREER_TRACKS.find(t => t.id === goalId) ?? CAREER_TRACKS[0];
}

// ── Persistence (user_dashboard_state.metadata.skill_tree) ────────────────────

/** Stored in Supabase JSON metadata under key `skill_tree`. */
export interface SkillTreePersistedV1 {
  v: 1;
  lastTrackId: string;
  tracks: Record<string, {
    completed: string[];
    inProgress?: string;
    challenges?: Record<string, number[]>;
  }>;
}

export function parseSkillTreePersisted(
  metadata: Record<string, unknown> | null | undefined
): SkillTreePersistedV1 | null {
  const raw = metadata?.skill_tree;
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (o.v !== 1) return null;
  const tracks = o.tracks;
  if (!tracks || typeof tracks !== "object") return null;
  const lastTrackId = typeof o.lastTrackId === "string" ? o.lastTrackId : "software_engineer";
  return { v: 1, lastTrackId, tracks: tracks as SkillTreePersistedV1["tracks"] };
}

/**
 * Applies saved completions to a track template: completed nodes, then unlocks
 * any node whose prerequisites are all completed.
 */
export function nodesFromProgress(
  templateNodes: SkillNode[],
  completedIds: string[],
  inProgressId?: string,
): SkillNode[] {
  const done = new Set(completedIds);
  return templateNodes.map(n => {
    if (done.has(n.id)) return { ...n, state: "completed" as NodeState };
    const prereqsMet = n.prereqs.every(p => done.has(p));
    if (n.id === inProgressId && prereqsMet) return { ...n, state: "in_progress" as NodeState };
    return { ...n, state: (prereqsMet ? "active" : "locked") as NodeState };
  });
}

/** When nothing is saved yet, clone template defaults from the data file. */
export function cloneTrackNodes(trackId: string): SkillNode[] {
  return getTrack(trackId).nodes.map(n => ({ ...n }));
}

export function computeXP(nodes: SkillNode[]): number {
  return nodes.filter(n => n.state === "completed").reduce((s, n) => s + n.xp, 0);
}

export function computeReadiness(nodes: SkillNode[]): number {
  const req = nodes.filter(n => n.isRequired);
  const done = req.filter(n => n.state === "completed");
  return req.length ? Math.round((done.length / req.length) * 100) : 0;
}

export const LEVEL_THRESHOLDS = [
  { level: 1, label: "Seedling",    min: 0    },
  { level: 2, label: "Sprout",      min: 500  },
  { level: 3, label: "Sapling",     min: 1200 },
  { level: 4, label: "Branch",      min: 2500 },
  { level: 5, label: "Ancient Oak", min: 5000 },
];

export function getLevel(xp: number) {
  let lv = LEVEL_THRESHOLDS[0];
  for (const t of LEVEL_THRESHOLDS) { if (xp >= t.min) lv = t; }
  const next = LEVEL_THRESHOLDS.find(t => t.min > xp);
  const nextMin = next?.min ?? lv.min + 1000;
  const prevMin = lv.min;
  return { ...lv, pct: Math.round(((xp - prevMin) / (nextMin - prevMin)) * 100), nextMin };
}
