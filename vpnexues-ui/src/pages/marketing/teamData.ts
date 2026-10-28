const REACT_TEAM = '/images/team';

export interface TeamMember {
  slug: string;
  name: string;
  role?: string;
  isDirector?: boolean;
  photo: string;
  bio: string;
  /** Saved via the sub-admin Team & News form; undefined falls back to role content. */
  responsibilities?: { title: string; description: string }[];
  keySkills?: string[];
}

export interface RoleContent {
  introduction: string;
  overview: string;
  responsibilities: { title: string; description: string }[];
  skills: string[];
}

export const ROLE_CONTENT: Record<string, RoleContent> = {
  'web developer': {
    introduction:
      'As part of the VPNexues development team, this role focuses on building and maintaining reliable, responsive, and user-friendly web experiences that support the company\'s digital operations.',
    overview:
      'The Web Developer is responsible for developing, improving, and maintaining VPNexues web applications and website interfaces. The role focuses on performance, responsive design, functionality, maintainability, and collaboration with design and backend teams.',
    responsibilities: [
      { title: 'Frontend Development', description: 'Build responsive, accessible interfaces with modern frontend technologies.' },
      { title: 'UI Implementation', description: 'Convert approved designs into accurate, functional web pages.' },
      { title: 'API Integration', description: 'Connect frontend interfaces with backend services and APIs.' },
      { title: 'Performance & Bug Fixing', description: 'Improve page speed and resolve UI and browser compatibility issues.' },
    ],
    skills: ['React', 'JavaScript / TypeScript', 'HTML5', 'CSS3', 'Responsive Design', 'REST API Integration', 'Git / GitHub', 'Performance Optimization'],
  },
  'ai developer': {
    introduction:
      'As part of the VPNexues technology team, this role focuses on developing AI-powered solutions that improve automation, intelligence, decision-making, and digital customer experiences.',
    overview:
      'The AI Developer researches, develops, integrates, and improves artificial intelligence solutions used within VPNexues applications and internal workflows. The role focuses on practical AI implementation, automation, data processing, model integration, and continuous improvement.',
    responsibilities: [
      { title: 'AI Solution Development', description: 'Design and implement AI-powered features from business requirements.' },
      { title: 'Model Integration', description: 'Integrate AI models, APIs, and intelligent services into applications.' },
      { title: 'Data & Automation', description: 'Prepare data for AI workflows and automate repetitive processes.' },
      { title: 'Testing & Evaluation', description: 'Measure AI accuracy, reliability, latency, and overall performance.' },
    ],
    skills: ['Python', 'Artificial Intelligence', 'Machine Learning', 'Generative AI', 'LLM Integration', 'Prompt Engineering', 'API Integration', 'Data Processing', 'Automation'],
  },
  'team lead': {
    introduction:
      'The Team Lead supports both technical execution and team coordination, helping the VPNexues development team deliver reliable, maintainable, and high-quality solutions.',
    overview:
      'The Team Lead is responsible for coordinating development activities, supporting team members, reviewing technical work, managing task execution, and ensuring project goals are delivered according to agreed quality and timelines.',
    responsibilities: [
      { title: 'Task Planning', description: 'Break requirements into clear tasks and assign work effectively.' },
      { title: 'Code Review', description: 'Review code quality, maintainability, and implementation standards.' },
      { title: 'Team Coordination', description: 'Coordinate work across developers, design, QA, and stakeholders.' },
      { title: 'Mentoring', description: 'Guide team members and support continuous skill development.' },
    ],
    skills: ['Leadership', 'Project Coordination', 'Technical Guidance', 'Code Review', 'Problem Solving', 'Communication', 'Git Workflow', 'Team Management'],
  },
  'manager': {
    introduction:
      'As Manager at VPNexues, this role leads day-to-day delivery — balancing hands-on execution with people management and clear communication across the team.',
    overview:
      'The Manager is responsible for planning and coordinating work, guiding team members, unblocking delivery, and maintaining quality across the projects and modules the team owns.',
    responsibilities: [
      { title: 'Team Leadership', description: 'Guide team members, align priorities and support day-to-day execution.' },
      { title: 'Delivery Management', description: 'Plan the work, remove blockers and keep projects moving to schedule.' },
      { title: 'Quality & Process', description: 'Review output, uphold standards and improve how the team works.' },
      { title: 'Stakeholder Communication', description: 'Keep leadership, clients and the wider team informed with clear updates.' },
    ],
    skills: ['Team Leadership', 'Delivery Management', 'Planning & Prioritisation', 'Quality Assurance', 'Mentoring', 'Stakeholder Communication', 'Problem Solving', 'Agile Delivery'],
  },
  'module lead': {
    introduction:
      'As Module Lead at VPNexues, this role drives end-to-end ownership of key product modules — from planning and architecture to delivery and continuous improvement — while mentoring the team and ensuring engineering excellence.',
    overview:
      'The Module Lead owns delivery of assigned modules (e.g., B2B platform, mobile integrations, AI services), balancing hands-on development with coordination. The role bridges product requirements, technical design, and execution — ensuring modules are reliable, scalable, and aligned with VPNexues business goals.',
    responsibilities: [
      { title: 'Module Ownership', description: 'Own planning, development, and delivery of assigned product modules.' },
      { title: 'Architecture & Design', description: 'Design scalable module architecture, data flows, and API contracts.' },
      { title: 'Hands-on Development', description: 'Build core features across AI integrations, B2B workflows, and services.' },
      { title: 'Team Mentoring', description: 'Guide developers on technical decisions, reviews, and best practices.' },
    ],
    skills: ['Module Ownership', 'System Architecture', 'AI Integration', 'B2B Workflows', 'Code Review', 'Mentoring', 'Release Management', 'Cross-functional Coordination'],
  },
  'hr executive': {
    introduction:
      'The HR Executive supports VPNexues employees and organizational operations by managing recruitment, employee coordination, records, communication, and day-to-day HR activities.',
    overview:
      'The HR Executive is responsible for supporting recruitment, onboarding, employee documentation, attendance coordination, internal communication, employee engagement, and other human-resource activities required for smooth organizational operations.',
    responsibilities: [
      { title: 'Recruitment Support', description: 'Coordinate job postings, candidate screening, and interviews.' },
      { title: 'Onboarding & Records', description: 'Support new hires and maintain accurate employee documents.' },
      { title: 'Attendance Coordination', description: 'Track attendance, leave information, and related records.' },
      { title: 'Internal Communication', description: 'Share HR information clearly across employees and teams.' },
    ],
    skills: ['Recruitment', 'Employee Relations', 'Communication', 'HR Operations', 'Documentation', 'Onboarding', 'Employee Engagement', 'Coordination'],
  },
  'android/ios developer': {
    introduction:
      'As part of the VPNexues mobile development team, this role focuses on creating reliable, responsive, and user-friendly mobile applications for Android and iOS platforms.',
    overview:
      'The Android / iOS Developer is responsible for developing, maintaining, testing, and improving VPNexues mobile applications. The role focuses on mobile UI implementation, API integration, performance, platform compatibility, and delivering a smooth user experience.',
    responsibilities: [
      { title: 'Mobile Development', description: 'Build and maintain applications for Android and iOS platforms.' },
      { title: 'Mobile UI Implementation', description: 'Implement friendly mobile interfaces from approved designs.' },
      { title: 'API Integration', description: 'Connect mobile apps with backend APIs and application services.' },
      { title: 'Testing & Debugging', description: 'Resolve bugs, crashes, and device-specific compatibility issues.' },
    ],
    skills: ['Android Development', 'iOS Development', 'Flutter / React Native', 'Kotlin', 'Swift', 'Mobile UI/UX', 'REST API Integration', 'Git / GitHub'],
  },
  'ui/ux designer': {
    introduction:
      'As part of the VPNexues design team, this role focuses on creating intuitive, visually appealing, and user-centered interfaces that enhance the overall digital experience.',
    overview:
      'The UI/UX Designer is responsible for designing, prototyping, and refining user interfaces and experiences across VPNexues digital products. The role focuses on user research, wireframing, visual design, usability, and collaboration with development teams.',
    responsibilities: [
      { title: 'User Research', description: 'Research and analyze feedback to inform design decisions.' },
      { title: 'Wireframing & Prototyping', description: 'Create wireframes and interactive mockups for web and mobile.' },
      { title: 'Visual Design', description: 'Design interfaces aligned with VPNexues brand guidelines.' },
      { title: 'Usability Testing', description: 'Test designs to identify usability issues and improvements.' },
    ],
    skills: ['Figma', 'Adobe XD', 'User Research', 'Wireframing', 'Prototyping', 'Visual Design', 'Design Systems', 'Usability Testing'],
  },
  'accountant': {
    introduction:
      'As part of the VPNexues finance team, this role focuses on managing financial records, ensuring accuracy in transactions, and supporting the company\'s financial health and compliance.',
    overview:
      'The Accountant is responsible for managing financial records, processing transactions, preparing financial reports, ensuring compliance with accounting standards, and supporting budgeting and financial planning activities for VPNexues.',
    responsibilities: [
      { title: 'Financial Records', description: 'Maintain accurate financial records, ledgers, and accounts.' },
      { title: 'Transaction Processing', description: 'Record and verify payments, receipts, and invoices.' },
      { title: 'Financial Reporting', description: 'Prepare monthly, quarterly, and annual financial reports.' },
      { title: 'Compliance', description: 'Ensure compliance with accounting standards and company policies.' },
    ],
    skills: ['Accounting', 'Financial Reporting', 'Tax Compliance', 'MS Excel', 'Tally / QuickBooks', 'Audit Support', 'Reconciliation', 'Attention to Detail'],
  },
  'seo content writer': {
    introduction:
      'As part of the VPNexues content team, this role focuses on creating high-quality, SEO-optimized content that drives organic traffic, engages audiences, and supports the company\'s digital marketing goals.',
    overview:
      'The SEO Content Writer is responsible for researching, writing, editing, and optimizing content for web pages, blogs, product descriptions, and marketing materials. The role focuses on search engine optimization, keyword research, content strategy, and producing engaging copy that ranks well on search engines.',
    responsibilities: [
      { title: 'Content Creation', description: 'Write engaging, SEO-optimized articles, blogs, and web content.' },
      { title: 'Keyword Research', description: 'Identify keyword opportunities to improve search rankings.' },
      { title: 'On-Page SEO', description: 'Optimize titles, descriptions, headers, and content structure.' },
      { title: 'Editing & Proofreading', description: 'Refine content for grammar, clarity, and brand consistency.' },
    ],
    skills: ['SEO', 'Content Writing', 'Keyword Research', 'Copywriting', 'Google Analytics', 'WordPress', 'HTML Basics', 'Creative Writing'],
  },
  'business development': {
    introduction:
      'As part of the VPNexues business team, this role focuses on identifying growth opportunities, building client relationships, and driving revenue through strategic partnerships and market expansion.',
    overview:
      'The Business Development Executive is responsible for identifying new business opportunities, building and maintaining client relationships, generating leads, negotiating deals, and contributing to the company\'s revenue growth. The role focuses on market research, strategic partnerships, client acquisition, and representing VPNexues in business dealings.',
    responsibilities: [
      { title: 'Lead Generation', description: 'Identify new business opportunities, clients, and partnerships.' },
      { title: 'Client Relationships', description: 'Build and maintain strong relationships with clients.' },
      { title: 'Sales Pipeline', description: 'Manage prospects through negotiation to deal closure.' },
      { title: 'Negotiations', description: 'Finalize deals and drive revenue aligned with company goals.' },
    ],
    skills: ['Business Development', 'Client Acquisition', 'Negotiation', 'Market Research', 'Lead Generation', 'Sales Strategy', 'Communication', 'Relationship Management'],
  },
  'backend developer': {
    introduction:
      'As part of the VPNexues development team, this role focuses on building and maintaining server-side logic, databases, APIs, and core application infrastructure that powers the platform.',
    overview:
      'The Backend Developer is responsible for designing, developing, testing, and maintaining server-side applications, APIs, databases, and integration layers. The role focuses on performance, scalability, security, data integrity, and seamless integration with frontend and third-party services.',
    responsibilities: [
      { title: 'API Development', description: 'Design and implement RESTful or GraphQL APIs.' },
      { title: 'Database Management', description: 'Create and optimize database schemas and queries.' },
      { title: 'Server-Side Logic', description: 'Build core business logic and data processing pipelines.' },
      { title: 'Security & Performance', description: 'Implement authentication, data protection, and optimization.' },
    ],
    skills: ['Java / Spring Boot', 'Python / Django', 'REST API Design', 'SQL / PostgreSQL', 'Microservices', 'Docker', 'Git / GitHub', 'Performance Optimization'],
  },
  'director': {
    introduction:
      'As a Director at VPNexues, this role contributes to the strategic direction, business growth, operational oversight, and long-term development of the organization while supporting the company\'s commitment to quality, reliability, and sustainable business practices.',
    overview:
      'The Director plays a key role in guiding VPNexues toward its business objectives by supporting strategic planning, organizational decision-making, operational development, partnerships, quality standards, and sustainable growth across the company\'s import, export, B2B, and customer-focused operations.',
    responsibilities: [
      { title: 'Strategic Planning', description: 'Support the long-term vision, priorities, and growth initiatives.' },
      { title: 'Business Development', description: 'Strengthen market presence, partnerships, and sustainable growth.' },
      { title: 'Operational Oversight', description: 'Direct key operations to maintain efficiency and quality standards.' },
      { title: 'Leadership & Partnerships', description: 'Guide major decisions and maintain stakeholder relationships.' },
    ],
    skills: ['Strategic Planning', 'Business Development', 'Leadership', 'Operational Oversight', 'Business Partnerships', 'Quality Management', 'Import & Export', 'B2B & B2C Strategy', 'Decision Making', 'Team Guidance'],
  },
};

const ROLE_LOOKUP: Record<string, string> = {
  'web developer': 'web developer',
  'frontend developer': 'web developer',
  'ai developer': 'ai developer',
  'team lead': 'team lead',
  'module lead': 'module lead',
  'manager': 'manager',
  'hr executive': 'hr executive',
  'junior hr executive': 'hr executive',
  'android/ios developer': 'android/ios developer',
  'android developer': 'android/ios developer',
  'ios developer': 'android/ios developer',
  'mobile developer': 'android/ios developer',
  'ui/ux designer': 'ui/ux designer',
  'director': 'director',
  'accountant': 'accountant',
  'seo content writer': 'seo content writer',
  'seo writer': 'seo content writer',
  'business development': 'business development',
  'backend developer': 'backend developer',
};

export function getRoleContent(role?: string, isDirector?: boolean): RoleContent | null {
  if (isDirector) return ROLE_CONTENT['director'] ?? null;
  if (!role) return null;
  const key = ROLE_LOOKUP[role.toLowerCase()];
  return key ? ROLE_CONTENT[key] ?? null : null;
}

export function roleKeyFor(role?: string, isDirector?: boolean): string | null {
  if (isDirector) return 'director';
  if (!role) return null;
  return ROLE_LOOKUP[role.toLowerCase()] ?? null;
}

export function roleNameKeyFor(role?: string, isDirector?: boolean): string | null {
  if (isDirector) return 'director';
  if (!role) return null;
  return role.toLowerCase();
}

export const TEAM: TeamMember[] = [
  {
    slug: 'nageswaran-duraiswamy',
    name: 'Nageswaran Duraiswamy',
    isDirector: true,
    photo: `${REACT_TEAM}/nageswaran.jpg`,
    bio: 'Nageswaran is one of the directors at VPNexues, helping set the company\'s overall direction.',
  },
  {
    slug: 'pradeep-kumar',
    name: 'Pradeep Kumar',
    isDirector: true,
    photo: `${REACT_TEAM}/pradeep.jpeg`,
    bio: 'Pradeep is one of the directors at VPNexues, helping set the company\'s overall direction.',
  },
  {
    slug: 'hemaanth-kumar-t-n',
    name: 'Hemaanth Kumar T N',
    role: 'Manager',
    photo: `${REACT_TEAM}/Hemaanth.jpeg`,
    bio: 'Hemaanth is part of the VPNexues team, focused on Development.',
  },
  {
    slug: 'shereen',
    name: 'Shereen',
    role: 'HR Executive',
    photo: `${REACT_TEAM}/Shreen.jpeg`,
    bio: 'Shereen is part of the VPNexues team, focused on HR.',
  },
  {
    slug: 'kiruba',
    name: 'Kiruba',
    role: 'Junior HR Executive',
    photo: `${REACT_TEAM}/Kiruba.webp`,
    bio: 'Kiruba is part of the VPNexues team, focused on HR.',
  },
  {
    slug: 'sathish-r',
    name: 'Sathish R',
    role: 'Web Developer',
    photo: `${REACT_TEAM}/Satheesh.jpeg`,
    bio: 'Sathish is part of the VPNexues team, focused on Development.',
  },
  {
    slug: 'monika-v',
    name: 'Monika V',
    role: 'UI/UX Designer',
    photo: `${REACT_TEAM}/Monika.jpeg`,
    bio: 'Monika is part of the VPNexues team, focused on Design.',
  },
  {
    slug: 'sunil-kumar-r',
    name: 'Sunil Kumar R',
    role: 'Web Developer',
    photo: `${REACT_TEAM}/SunilKumar.jpeg`,
    bio: 'Sunil is part of the VPNexues team, focused on Development.',
  },
  {
    slug: 'jegatheeswaran',
    name: 'Jegatheeswaran',
    role: 'Web Developer',
    photo: `${REACT_TEAM}/Jagadeesh.jpeg`,
    bio: 'Jegatheeswaran is part of the VPNexues team, focused on Development.',
  },
  {
    slug: 'keerthi-vardhan',
    name: 'Keerthi Vardhan',
    role: 'UI/UX Designer',
    photo: `${REACT_TEAM}/Keerthi.jpeg`,
    bio: 'Keerthi is part of the VPNexues team, focused on Design.',
  },
  {
    slug: 'anees',
    name: 'Anees',
    role: 'Android/iOS Developer',
    photo: `${REACT_TEAM}/Annes.jpeg`,
    bio: 'Anees is part of the VPNexues team, focused on Development.',
  },
  {
    slug: 'arun',
    name: 'Arun',
    role: 'Module Lead',
    photo: `${REACT_TEAM}/Arun.jpeg`,
    bio: 'Arun is Module Lead at VPNexues, owning key modules while mentoring the team.',
  },
  {
    slug: 'sachin',
    name: 'Sachin',
    role: 'Android/iOS Developer',
    photo: `${REACT_TEAM}/Sachein.jpeg`,
    bio: 'Sachin is part of the VPNexues team, focused on Development.',
  },
  {
    slug: 'siddhika',
    name: 'Siddhika',
    role: 'Accountant',
    photo: `${REACT_TEAM}/siddhika.jpeg`,
    bio: 'Siddhika is part of the VPNexues team, focused on Finance.',
  },
  {
    slug: 'gurudheep',
    name: 'Gurudheep',
    role: 'Web Developer',
    photo: `${REACT_TEAM}/gurudheep.jpeg`,
    bio: 'Gurudheep is part of the VPNexues team, focused on Development.',
  },
  {
    slug: 'pavithra',
    name: 'Pavithra',
    role: 'Team Lead',
    photo: `${REACT_TEAM}/Pavithra.jpeg`,
    bio: 'Pavithra is Team Lead at VPNexues, leading the team and keeping delivery on track.',
  },
  {
    slug: 'jacith',
    name: 'Jacinth',
    role: 'Android Developer',
    photo: `${REACT_TEAM}/jacinth.jpeg`,
    bio: 'Jacinth is part of the VPNexues team, focused on Android Development.',
  },
  {
    slug: 'kokila-vani',
    name: 'Kokila Vani',
    role: 'SEO Content Writer',
    photo: `${REACT_TEAM}/kokila%20vani.jpeg`,
    bio: 'Kokila Vani is part of the VPNexues team, focused on Content & SEO.',
  },
  {
    slug: 'rohan',
    name: 'Rohan',
    role: 'SEO Content Writer',
    photo: `${REACT_TEAM}/rohan.jpeg`,
    bio: 'Rohan is part of the VPNexues team, focused on Content & SEO.',
  },

  {
    slug: 'mahmooda-fareeha',
    name: 'Mahmooda Fareeha',
    role: 'Junior HR Executive',
    photo: `${REACT_TEAM}/Mahmooda%20Fareeha.png`,
    bio: 'Mahmooda Fareeha is part of the VPNexues team, focused on HR.',
  },
  {
    slug: 'pavithra-u-v',
    name: 'Pavithra U V',
    role: 'Business Development',
    photo: `${REACT_TEAM}/pavithra%20uv.jpeg`,
    bio: 'Pavithra U V is part of the VPNexues team, focused on Business Development.',
  },
  {
    slug: 'rasika',
    name: 'Rasika',
    role: 'SEO Writer',
    photo: `${REACT_TEAM}/rasika.jpeg`,
    bio: 'Rasika is part of the VPNexues team, focused on Content & SEO.',
  },
];