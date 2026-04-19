// Career track data for the Skill Tree page.
// Each track has nodes (skills), edges (dependencies), and badges.
// Runtime node states are derived from `SkillTreePersistedV1` in user_dashboard_state.metadata.skill_tree.

export type NodeState  = "completed" | "active" | "locked";
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
  {
    id: "web_found", label: "Web Foundations", icon: "🌐",
    description: "How the internet works — HTTP, browsers, DNS, and the client-server model.",
    xp: 50, difficulty: "BEGINNER", tier: 0, x: 50, prereqs: [], state: "completed", isRequired: true,
    resources: [
      { title: "How the Web Works – MDN", url: "#", type: "article" },
      { title: "CS50 Web – Harvard (free)", url: "#", type: "course" },
    ],
    challenges: ["Explain DNS in your own words", "Draw a client-server request diagram"],
    mentorTip: "Every SWE interview eventually asks 'what happens when you type google.com?' Know this cold.",
  },
  {
    id: "html_css", label: "HTML & CSS", icon: "🎨",
    description: "Semantic HTML, the box model, flexbox, grid, and responsive design.",
    xp: 75, difficulty: "BEGINNER", tier: 1, x: 18, prereqs: ["web_found"], state: "completed", isRequired: true,
    resources: [
      { title: "Kevin Powell CSS – YouTube", url: "#", type: "video" },
      { title: "The Odin Project – Foundations", url: "#", type: "course" },
    ],
    challenges: ["Build a personal landing page", "Recreate a design from a screenshot using only CSS"],
    mentorTip: "Don't underestimate CSS. Most junior devs do — interviewers always notice.",
  },
  {
    id: "js_basics", label: "JavaScript", icon: "⚡",
    description: "Variables, functions, closures, DOM manipulation, and async/await basics.",
    xp: 100, difficulty: "BEGINNER", tier: 1, x: 50, prereqs: ["web_found"], state: "completed", isRequired: true,
    resources: [
      { title: "javascript.info", url: "#", type: "article" },
      { title: "Eloquent JavaScript (free book)", url: "#", type: "course" },
    ],
    challenges: ["Build a todo app without a framework", "Write a debounce function from scratch"],
    mentorTip: "Master closures, the event loop, and 'this' before your first technical interview.",
  },
  {
    id: "git", label: "Git & GitHub", icon: "🌿",
    description: "Version control, branching, pull requests, and team collaboration workflows.",
    xp: 75, difficulty: "BEGINNER", tier: 1, x: 82, prereqs: ["web_found"], state: "active", isRequired: true,
    resources: [
      { title: "Pro Git Book (free)", url: "#", type: "article" },
      { title: "Oh My Git! – interactive game", url: "#", type: "practice" },
    ],
    challenges: ["Push 10 commits to a repo with meaningful messages", "Open a real PR on an OSS project"],
    mentorTip: "Git is non-negotiable. Learn it before your first internship, not during.",
  },
  {
    id: "react", label: "React", icon: "⚛️",
    description: "Components, hooks, state management, and the React mental model.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 2, x: 14, prereqs: ["html_css", "js_basics"], state: "active", isRequired: true,
    resources: [
      { title: "React Docs – react.dev", url: "#", type: "article" },
      { title: "Full Stack Open – Helsinki (free)", url: "#", type: "course" },
    ],
    challenges: ["Build a weather app consuming a public API", "Implement a custom hook for data fetching"],
    mentorTip: "Learn hooks deeply — useState, useEffect, useContext. Most interviews test these specifically.",
  },
  {
    id: "nodejs", label: "Node.js", icon: "🖥️",
    description: "Server-side JavaScript, Express, middleware, and building REST APIs.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 2, x: 36, prereqs: ["js_basics"], state: "locked", isRequired: true,
    resources: [
      { title: "Node.js Official Docs", url: "#", type: "article" },
      { title: "The Net Ninja – Node Crash Course", url: "#", type: "video" },
    ],
    challenges: ["Build a REST API with 5 endpoints", "Add JWT-based authentication to your API"],
    mentorTip: "Don't just follow tutorials — build something real with Node to truly understand it.",
  },
  {
    id: "sql", label: "SQL & Databases", icon: "🗄️",
    description: "Relational databases, joins, aggregations, indexing, and schema design.",
    xp: 125, difficulty: "INTERMEDIATE", tier: 2, x: 62, prereqs: ["js_basics"], state: "locked", isRequired: true,
    resources: [
      { title: "Mode SQL Tutorial", url: "#", type: "course" },
      { title: "SQLZoo – interactive practice", url: "#", type: "practice" },
    ],
    challenges: ["Solve 20 SQL problems on LeetCode", "Design a relational schema for a social app"],
    mentorTip: "SQL shows up in 80% of SWE interviews. Practice joins and window functions daily.",
  },
  {
    id: "dsa", label: "DSA", icon: "🧮",
    description: "Arrays, linked lists, trees, graphs, sorting algorithms, and dynamic programming.",
    xp: 200, difficulty: "INTERMEDIATE", tier: 2, x: 84, prereqs: ["js_basics", "git"], state: "locked", isRequired: true,
    resources: [
      { title: "NeetCode 150 – structured roadmap", url: "#", type: "practice" },
      { title: "Grokking Algorithms (book)", url: "#", type: "article" },
    ],
    challenges: ["Solve 30 LeetCode easy problems", "Implement a binary search tree from scratch"],
    mentorTip: "Start with arrays and hashmaps, then trees. Don't try to learn everything at once.",
  },
  {
    id: "apis", label: "REST APIs", icon: "🔌",
    description: "API design principles, HTTP methods, status codes, auth, and versioning.",
    xp: 175, difficulty: "INTERMEDIATE", tier: 3, x: 22, prereqs: ["react", "nodejs"], state: "locked", isRequired: true,
    resources: [
      { title: "REST API Design Best Practices", url: "#", type: "article" },
      { title: "Postman Learning Center", url: "#", type: "course" },
    ],
    challenges: ["Build a full CRUD API with proper error handling", "Add OpenAPI/Swagger documentation"],
    mentorTip: "Understand idempotency and HTTP status codes — these come up constantly in system design rounds.",
  },
  {
    id: "testing", label: "Testing", icon: "🧪",
    description: "Unit tests, integration tests, TDD approach, and testing best practices.",
    xp: 150, difficulty: "INTERMEDIATE", tier: 3, x: 50, prereqs: ["nodejs", "sql"], state: "locked", isRequired: false,
    resources: [
      { title: "Testing JavaScript – Kent C. Dodds", url: "#", type: "course" },
      { title: "Jest Documentation", url: "#", type: "article" },
    ],
    challenges: ["Achieve 80% test coverage on a project", "Write tests before code (TDD) for one full feature"],
    mentorTip: "Companies that care about quality will ask about testing. Don't skip it.",
  },
  {
    id: "sys_design", label: "System Design", icon: "🏗️",
    description: "Scalable architectures, load balancing, caching, and database sharding.",
    xp: 250, difficulty: "ADVANCED", tier: 3, x: 78, prereqs: ["sql", "dsa"], state: "locked", isRequired: false,
    resources: [
      { title: "System Design Primer – GitHub", url: "#", type: "article" },
      { title: "Grokking System Design – Educative", url: "#", type: "course" },
    ],
    challenges: ["Design a URL shortener end-to-end", "Design a real-time notification system"],
    mentorTip: "System design is for senior rounds — but starting early puts you years ahead.",
  },
  {
    id: "fullstack", label: "Full Stack App", icon: "🚀",
    description: "Build and deploy a complete app with auth, database, CI/CD, and real users.",
    xp: 300, difficulty: "ADVANCED", tier: 4, x: 32, prereqs: ["apis", "testing"], state: "locked", isRequired: true,
    resources: [
      { title: "The Odin Project – Full Stack Path", url: "#", type: "course" },
      { title: "Next.js Documentation", url: "#", type: "article" },
    ],
    challenges: ["Deploy to production with a CI/CD pipeline", "Get 50 GitHub stars on your project"],
    mentorTip: "This is your portfolio centerpiece. Recruiters will actually use it — spend real time here.",
  },
  {
    id: "oss", label: "Open Source", icon: "🌍",
    description: "Contribute to OSS, navigate code review culture, and build your public reputation.",
    xp: 250, difficulty: "ADVANCED", tier: 4, x: 68, prereqs: ["sys_design"], state: "locked", isRequired: false,
    resources: [
      { title: "First Contributions – GitHub", url: "#", type: "article" },
      { title: "Up For Grabs – OSS finder", url: "#", type: "practice" },
    ],
    challenges: ["Get 3 PRs merged into active projects", "Become a maintainer of a small npm package"],
    mentorTip: "OSS contributions are a differentiator at top-tier companies. Start small and be consistent.",
  },
];

const SE_EDGES: [string, string][] = [
  ["web_found","html_css"],["web_found","js_basics"],["web_found","git"],
  ["html_css","react"],["js_basics","react"],["js_basics","nodejs"],["js_basics","sql"],
  ["git","dsa"],["js_basics","dsa"],
  ["react","apis"],["nodejs","apis"],["nodejs","testing"],["sql","testing"],
  ["sql","sys_design"],["dsa","sys_design"],
  ["apis","fullstack"],["testing","fullstack"],
  ["sys_design","oss"],
];

const SE_BADGES: Badge[] = [
  { id:"hello_world", label:"Hello World",    emoji:"🌐", unlockNodeId:"web_found"  },
  { id:"git_good",    label:"Git Good",        emoji:"🌿", unlockNodeId:"git"        },
  { id:"react_hero",  label:"React Hero",      emoji:"⚛️", unlockNodeId:"react"      },
  { id:"db_guru",     label:"Database Guru",   emoji:"🗄️", unlockNodeId:"sql"        },
  { id:"ship_it",     label:"Ship It",         emoji:"🚀", unlockNodeId:"fullstack"  },
];

// ─── DATA ANALYST ─────────────────────────────────────────────────────────────
const DA_NODES: SkillNode[] = [
  {
    id:"data_found", label:"Data Foundations", icon:"📊",
    description:"Understand data types, spreadsheets, basic stats, and how data flows in an organization.",
    xp:50, difficulty:"BEGINNER", tier:0, x:50, prereqs:[], state:"completed", isRequired:true,
    resources:[
      { title:"Google Data Analytics Certificate", url:"#", type:"course" },
      { title:"Statistics Fundamentals – StatQuest", url:"#", type:"video" },
    ],
    challenges:["Calculate mean, median, mode on a real dataset","Explain the difference between correlation and causation"],
    mentorTip:"The best analysts translate numbers into decisions. Practice storytelling with data from day one.",
  },
  {
    id:"excel", label:"Excel / Sheets", icon:"📋",
    description:"Formulas, pivot tables, VLOOKUP, data cleaning, and basic charting.",
    xp:75, difficulty:"BEGINNER", tier:1, x:18, prereqs:["data_found"], state:"completed", isRequired:true,
    resources:[
      { title:"Excel for Beginners – Chandoo", url:"#", type:"video" },
      { title:"Google Sheets Training Center", url:"#", type:"course" },
    ],
    challenges:["Build a sales dashboard in Sheets","Use VLOOKUP + INDEX/MATCH to join two datasets"],
    mentorTip:"Every analyst uses Sheets daily. It's your Swiss Army knife — master it before anything else.",
  },
  {
    id:"python_da", label:"Python Basics", icon:"🐍",
    description:"Python syntax, data types, functions, and foundational scripting for data work.",
    xp:100, difficulty:"BEGINNER", tier:1, x:50, prereqs:["data_found"], state:"active", isRequired:true,
    resources:[
      { title:"Automate the Boring Stuff (free)", url:"#", type:"course" },
      { title:"Python for Everybody – Coursera", url:"#", type:"course" },
    ],
    challenges:["Write a script to clean a messy CSV file","Scrape a public website and save data to JSON"],
    mentorTip:"Python is the analyst's superpower. Even basic scripting saves hours of manual work.",
  },
  {
    id:"sql_da", label:"SQL", icon:"🗃️",
    description:"SELECT, JOIN, GROUP BY, subqueries, CTEs, and window functions.",
    xp:125, difficulty:"BEGINNER", tier:1, x:82, prereqs:["data_found"], state:"locked", isRequired:true,
    resources:[
      { title:"Mode SQL Tutorial (free)", url:"#", type:"course" },
      { title:"StrataScratch – SQL interview prep", url:"#", type:"practice" },
    ],
    challenges:["Solve 25 SQL problems on HackerRank","Write a query using window functions to rank users by activity"],
    mentorTip:"SQL is the #1 skill for data analysts. Every interview will test it — practice daily.",
  },
  {
    id:"pandas", label:"Pandas / NumPy", icon:"🐼",
    description:"DataFrames, data cleaning, transformation, merging, and exploratory analysis.",
    xp:150, difficulty:"INTERMEDIATE", tier:2, x:14, prereqs:["python_da"], state:"locked", isRequired:true,
    resources:[
      { title:"Kaggle Pandas Course (free)", url:"#", type:"course" },
      { title:"Pandas Documentation", url:"#", type:"article" },
    ],
    challenges:["Clean a real-world dirty dataset from Kaggle","Perform a full EDA on a public dataset"],
    mentorTip:"Pandas + SQL is the core analyst stack. Get very comfortable with groupby and merge.",
  },
  {
    id:"stats", label:"Statistics", icon:"📐",
    description:"Probability, hypothesis testing, confidence intervals, and regression basics.",
    xp:150, difficulty:"INTERMEDIATE", tier:2, x:38, prereqs:["python_da","excel"], state:"locked", isRequired:true,
    resources:[
      { title:"Statistics Fundamentals – StatQuest YT", url:"#", type:"video" },
      { title:"Khan Academy Statistics", url:"#", type:"course" },
    ],
    challenges:["Run an A/B test on mock data and interpret results","Explain p-value to a non-technical person"],
    mentorTip:"Stats separates good analysts from great ones. Hiring managers test this heavily.",
  },
  {
    id:"viz", label:"Data Visualization", icon:"📈",
    description:"Chart selection, design principles, Matplotlib, Seaborn, and Tableau basics.",
    xp:125, difficulty:"INTERMEDIATE", tier:2, x:62, prereqs:["pandas"], state:"locked", isRequired:true,
    resources:[
      { title:"From Data to Viz (chart guide)", url:"#", type:"article" },
      { title:"Tableau Public Training", url:"#", type:"course" },
    ],
    challenges:["Build 5 different chart types for the same dataset","Create a public Tableau dashboard"],
    mentorTip:"Most business decisions are made from dashboards. Make yours impossible to misread.",
  },
  {
    id:"bi_tools", label:"BI Tools", icon:"🔭",
    description:"Looker, Power BI, or Tableau for business dashboards and reporting.",
    xp:100, difficulty:"INTERMEDIATE", tier:2, x:84, prereqs:["sql_da"], state:"locked", isRequired:false,
    resources:[
      { title:"Power BI Guided Learning – Microsoft", url:"#", type:"course" },
      { title:"Looker Documentation", url:"#", type:"article" },
    ],
    challenges:["Build a monthly KPI report in a BI tool","Connect a BI tool to a live database"],
    mentorTip:"Most companies use Looker or Power BI. Learn one end-to-end — it's often a job requirement.",
  },
  {
    id:"ml_basics", label:"ML Basics", icon:"🤖",
    description:"Supervised learning, regression, classification, model evaluation, and scikit-learn.",
    xp:200, difficulty:"ADVANCED", tier:3, x:22, prereqs:["pandas","stats"], state:"locked", isRequired:false,
    resources:[
      { title:"Kaggle Machine Learning Course", url:"#", type:"course" },
      { title:"Hands-On ML – Aurélien Géron", url:"#", type: "article" },
    ],
    challenges:["Build a price prediction model with scikit-learn","Participate in a Kaggle competition"],
    mentorTip:"You don't need to be an ML engineer — but knowing when to apply ML is a huge analyst advantage.",
  },
  {
    id:"ab_testing", label:"A/B Testing", icon:"🔬",
    description:"Experimental design, statistical significance, power analysis, and business impact.",
    xp:175, difficulty:"INTERMEDIATE", tier:3, x:50, prereqs:["stats","viz"], state:"locked", isRequired:true,
    resources:[
      { title:"Udacity A/B Testing Course (free)", url:"#", type:"course" },
      { title:"Evan Miller's A/B Test Tools", url:"#", type:"practice" },
    ],
    challenges:["Design and analyze a mock A/B test end-to-end","Calculate sample size for a given power and significance level"],
    mentorTip:"A/B testing fluency is what separates senior analysts. Every product team runs experiments.",
  },
  {
    id:"dashboards", label:"Live Dashboards", icon:"🖥️",
    description:"Build production dashboards with refresh logic, alerts, and stakeholder-ready design.",
    xp:150, difficulty:"INTERMEDIATE", tier:3, x:78, prereqs:["viz","bi_tools"], state:"locked", isRequired:true,
    resources:[
      { title:"Streamlit Documentation", url:"#", type:"article" },
      { title:"Grafana Getting Started", url:"#", type:"course" },
    ],
    challenges:["Build a live dashboard connected to a database","Add automated email alerts to a dashboard"],
    mentorTip:"Stakeholders won't log in to see your analysis — bring the data to them via live dashboards.",
  },
  {
    id:"capstone_da", label:"Capstone Analysis", icon:"🏆",
    description:"End-to-end analysis project: question → data → insights → recommendations.",
    xp:300, difficulty:"ADVANCED", tier:4, x:32, prereqs:["ab_testing","dashboards"], state:"locked", isRequired:true,
    resources:[
      { title:"Kaggle Datasets – find a project", url:"#", type:"practice" },
      { title:"Towards Data Science – project guides", url:"#", type:"article" },
    ],
    challenges:["Publish a full analysis on GitHub","Present findings to 3 non-technical people and get feedback"],
    mentorTip:"Your portfolio is your job application. One great analysis beats 10 mediocre ones.",
  },
  {
    id:"portfolio_da", label:"Data Portfolio", icon:"🌟",
    description:"3+ published projects showing breadth: SQL, Python, viz, storytelling, and impact.",
    xp:250, difficulty:"ADVANCED", tier:4, x:68, prereqs:["ml_basics"], state:"locked", isRequired:false,
    resources:[
      { title:"Dataquest Portfolio Guide", url:"#", type:"article" },
      { title:"Maven Analytics Portfolio Tips", url:"#", type:"video" },
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
      { title:"Refactoring UI (book/course)", url:"#", type:"course" },
      { title:"Design principles – Google Material", url:"#", type:"article" },
    ],
    challenges:["Critique 5 real app interfaces with specific feedback","Redesign a bad UI from a screenshot"],
    mentorTip:"Good designers explain why their choices work. Train your eye — then your reasoning.",
  },
  {
    id:"principles", label:"Design Principles", icon:"🎯",
    description:"Color theory, typography, spacing, alignment, and visual consistency.",
    xp:75, difficulty:"BEGINNER", tier:1, x:18, prereqs:["design_found"], state:"completed", isRequired:true,
    resources:[
      { title:"Laws of UX – lawsofux.com", url:"#", type:"article" },
      { title:"Typography for Developers – Kevin Powell", url:"#", type:"video" },
    ],
    challenges:["Create a consistent color palette and type scale","Apply Fitt's Law to improve a button layout"],
    mentorTip:"Typography alone accounts for 95% of how polished your work looks. Invest in learning it.",
  },
  {
    id:"figma", label:"Figma", icon:"🖌️",
    description:"Components, auto layout, design tokens, prototyping, and team collaboration.",
    xp:100, difficulty:"BEGINNER", tier:1, x:50, prereqs:["design_found"], state:"active", isRequired:true,
    resources:[
      { title:"Figma YouTube Channel (official)", url:"#", type:"video" },
      { title:"Figma for Beginners – Scrimba", url:"#", type:"course" },
    ],
    challenges:["Recreate an existing app screen pixel-perfect in Figma","Build a component library with 10+ components"],
    mentorTip:"Figma is the industry standard. Learn auto layout deeply — it will save you hours every week.",
  },
  {
    id:"research", label:"User Research", icon:"🔍",
    description:"User interviews, surveys, affinity mapping, and synthesizing insights.",
    xp:100, difficulty:"BEGINNER", tier:1, x:82, prereqs:["design_found"], state:"locked", isRequired:true,
    resources:[
      { title:"Just Enough Research (book)", url:"#", type:"article" },
      { title:"Nielsen Norman Group – Research Methods", url:"#", type:"article" },
    ],
    challenges:["Conduct 5 user interviews and synthesize themes","Run a usability test on an existing app"],
    mentorTip:"Design without research is decoration. Interviews will ask how you validate your decisions.",
  },
  {
    id:"wireframe", label:"Wireframing", icon:"📐",
    description:"Low-fidelity sketching, information architecture, and rapid ideation.",
    xp:100, difficulty:"BEGINNER", tier:2, x:14, prereqs:["principles","figma"], state:"locked", isRequired:true,
    resources:[
      { title:"Wireframing – UX Collective", url:"#", type:"article" },
      { title:"Crazy 8s – Google Design Sprint", url:"#", type:"practice" },
    ],
    challenges:["Sketch 20 wireframes in 20 minutes (crazy 8s × 2.5)","Build a 10-screen wireframe for an app idea"],
    mentorTip:"Fast, messy wireframes beat slow, polished ones. Speed is the skill — ideas come later.",
  },
  {
    id:"proto", label:"Prototyping", icon:"▶️",
    description:"Interactive prototypes, user flows, micro-interactions in Figma.",
    xp:125, difficulty:"INTERMEDIATE", tier:2, x:36, prereqs:["figma","wireframe"], state:"locked", isRequired:true,
    resources:[
      { title:"Figma Prototyping Docs", url:"#", type:"article" },
      { title:"Prototyping 101 – InVision", url:"#", type:"course" },
    ],
    challenges:["Build a clickable prototype and test it with 3 users","Add micro-animations to a key interaction"],
    mentorTip:"Prototypes expose assumptions you didn't know you had. Always test before going high-fidelity.",
  },
  {
    id:"typography", label:"Typography & Color", icon:"🔤",
    description:"Type pairing, scale, hierarchy, color accessibility, and brand systems.",
    xp:100, difficulty:"INTERMEDIATE", tier:2, x:60, prereqs:["principles"], state:"locked", isRequired:true,
    resources:[
      { title:"Practical Typography (web book)", url:"#", type:"article" },
      { title:"Color & Accessibility – A11Y Project", url:"#", type:"article" },
    ],
    challenges:["Create a full type scale for a product","Audit an app for WCAG AA color contrast compliance"],
    mentorTip:"Accessible design is good design. Contrast ratios and font sizes matter for real users.",
  },
  {
    id:"ia", label:"Info Architecture", icon:"🗺️",
    description:"Navigation patterns, card sorting, sitemaps, and content hierarchy.",
    xp:100, difficulty:"INTERMEDIATE", tier:2, x:83, prereqs:["research"], state:"locked", isRequired:false,
    resources:[
      { title:"Information Architecture – Nielsen Norman", url:"#", type:"article" },
      { title:"Card Sorting Guide – Optimal Workshop", url:"#", type:"practice" },
    ],
    challenges:["Run a card sort with 5 participants","Draw a sitemap for an e-commerce app"],
    mentorTip:"Great IA is invisible. Users only notice when it's broken — which is exactly why it matters.",
  },
  {
    id:"design_sys", label:"Design Systems", icon:"🧱",
    description:"Component libraries, tokens, documentation, and cross-team design consistency.",
    xp:200, difficulty:"ADVANCED", tier:3, x:22, prereqs:["proto","typography"], state:"locked", isRequired:false,
    resources:[
      { title:"Design Systems by Alla Kholmatova", url:"#", type:"article" },
      { title:"Storybook Documentation", url:"#", type:"article" },
    ],
    challenges:["Build a mini design system with 20+ components","Document every component with usage guidelines"],
    mentorTip:"Companies like Airbnb and Uber have full-time design system teams. It's a valuable specialization.",
  },
  {
    id:"usability", label:"Usability Testing", icon:"🧑‍💻",
    description:"Moderated and unmoderated testing, task analysis, and iterating on findings.",
    xp:175, difficulty:"INTERMEDIATE", tier:3, x:50, prereqs:["proto","ia"], state:"locked", isRequired:true,
    resources:[
      { title:"Rocket Surgery Made Easy – Steve Krug", url:"#", type:"article" },
      { title:"Maze – remote usability testing tool", url:"#", type:"practice" },
    ],
    challenges:["Run 3 moderated usability sessions and synthesize findings","Track task completion rate and error rate"],
    mentorTip:"One hour of user testing will reveal more issues than a week of your own review.",
  },
  {
    id:"motion", label:"Motion & Interaction", icon:"✨",
    description:"Animation principles, easing curves, transition design, and tool handoff.",
    xp:150, difficulty:"ADVANCED", tier:3, x:78, prereqs:["proto","design_sys"], state:"locked", isRequired:false,
    resources:[
      { title:"Google Motion Design Guidelines", url:"#", type:"article" },
      { title:"After Effects for UX Designers", url:"#", type:"video" },
    ],
    challenges:["Design an onboarding animation with 3 stages","Prototype a swipe-to-dismiss interaction"],
    mentorTip:"Motion design is the difference between an app that feels built vs. crafted.",
  },
  {
    id:"portfolio_ux", label:"Portfolio Project", icon:"🖼️",
    description:"Full case study: problem → research → design → test → iterate → ship.",
    xp:300, difficulty:"ADVANCED", tier:4, x:32, prereqs:["usability","design_sys"], state:"locked", isRequired:true,
    resources:[
      { title:"UX Portfolio Tips – Sarah Doody", url:"#", type:"video" },
      { title:"Bestfolios – portfolio inspiration", url:"#", type:"article" },
    ],
    challenges:["Publish a portfolio site with 3 case studies","Get feedback from 3 senior designers on LinkedIn"],
    mentorTip:"Your portfolio is your interview. Every slide should answer: what problem, what decision, what impact.",
  },
  {
    id:"casestudy", label:"Case Study", icon:"📝",
    description:"Written deep-dive of a design project showing process, decisions, and outcomes.",
    xp:250, difficulty:"ADVANCED", tier:4, x:68, prereqs:["motion","usability"], state:"locked", isRequired:false,
    resources:[
      { title:"How to Write a UX Case Study – UX Collective", url:"#", type:"article" },
      { title:"Notion Case Study Templates", url:"#", type:"practice" },
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
    nodes: SE_NODES,
    edges: SE_EDGES,
    badges: SE_BADGES,
    hiringManagerNote: "Hands-on labs, networking fundamentals, and secure-by-default thinking beat buzzwords. Show CVE writeups or CTF progress.",
    mentorRecommendation: "Networking + Linux + one cert path (e.g. Security+) → home lab → OWASP → capture-the-flag basics.",
  },
  {
    id: "cloud_engineer",
    label: "Cloud Engineer",
    icon: "☁️",
    color: "#38BDF8",
    colorDim: "#0c4a6e",
    nodes: SE_NODES,
    edges: SE_EDGES,
    badges: SE_BADGES,
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
  /** Last tab the user had open */
  lastTrackId: string;
  /** Completed node ids per career track */
  tracks: Record<string, { completed: string[] }>;
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
  return { v: 1, lastTrackId, tracks: tracks as Record<string, { completed: string[] }> };
}

/**
 * Applies saved completions to a track template: completed nodes, then unlocks
 * any node whose prerequisites are all completed.
 */
export function nodesFromProgress(templateNodes: SkillNode[], completedIds: string[]): SkillNode[] {
  const done = new Set(completedIds);
  return templateNodes.map(n => {
    if (done.has(n.id)) return { ...n, state: "completed" as NodeState };
    const prereqsMet = n.prereqs.every(p => done.has(p));
    return {
      ...n,
      state: (prereqsMet ? "active" : "locked") as NodeState,
    };
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
