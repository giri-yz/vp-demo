export interface JobSection {
  title: string;
  items: string[];
}

export interface JobData {
  id: string;
  title: string;
  breadcrumb: string;
  badges: string[];
  meta: { key: string; val: string }[];
  aboutRole: string;
  sections: JobSection[];
  expectations: string[];
  skills: string[];
  goodToHave: string[];
}

const COMPANY = {
  about: "VPNexues is Tamil Nadu's premier organic farm-to-table export company, founded in 2022. We connect farmers directly to consumers and businesses across Singapore, UAE, Europe, and India \u2014 eliminating middlemen and delivering the freshest certified organic produce worldwide.",
  mission: "We are building digital infrastructure to power real-world food exports. Our team is lean, ambitious, and deeply mission-driven.",
  website: "www.vpnexues.com",
  indiaOffice: "No 312/11, Siva Towers, Salem, Tamil Nadu 636004",
  singapore: "412 Race Course Road, Singapore 218660",
  email: "support@vpnexues.com",
  phone: "+91 78100 77636 | +91 8148197842",
};

export const COMPANY_INFO = COMPANY;

export const LIFE_AT_VPNEXUES = [
  { emoji: "\uD83C\uDF31", name: "Real Ownership", desc: "Ship code to real users from week one." },
  { emoji: "\uD83C\uDF0D", name: "Global Products", desc: "Used across Singapore, UAE & India." },
  { emoji: "\uD83D\uDCA1", name: "Founder Mentorship", desc: "Direct access, no middle layers." },
  { emoji: "\uD83C\uDFE0", name: "Fully Remote", desc: "Flexible hours, async-first culture." },
  { emoji: "\uD83D\uDCCB", name: "Certification", desc: "Letter + LinkedIn recommendation." },
  { emoji: "\uD83D\uDE80", name: "PPO Potential", desc: "Top performers may get a full-time offer." },
];

export const JOB_DATA: Record<string, JobData> = {
  fullstack: {
    id: "fullstack",
    title: "Full Stack Web Developer Intern",
    breadcrumb: "Full Stack Developer",
    badges: ["Internship", "Remote"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "Remote (India)" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "2 days ago" },
    ],
    aboutRole:
      'As a <strong>Full Stack Web Developer Intern</strong>, you will work directly with our founding team to build and ship customer-facing web products end to end \u2014 Node.js and React on the frontend, Java on the backend, and MongoDB for data. This is a high-ownership role. You will write production code from day one.',
    sections: [
      {
        title: "Frontend Development (Node.js + React)",
        items: [
          "Build responsive, accessible UI components using Node.js, React, and modern CSS",
          "Develop product listing pages, checkout flows, and customer dashboards",
          "Implement SEO best practices \u2014 metadata, structured data, Core Web Vitals",
          "Translate Figma designs into pixel-perfect, production-ready interfaces",
        ],
      },
      {
        title: "Backend Development (Java)",
        items: [
          "Design and build REST APIs using Java (Spring Boot)",
          "Implement business logic, authentication, and third-party integrations (payments, logistics, CRM)",
          "Write clean, maintainable, well-documented server-side code",
        ],
      },
      {
        title: "Database & Integration (MongoDB)",
        items: [
          "Model and manage data using MongoDB \u2014 schemas, indexes, and aggregation queries",
          "Connect frontend and backend systems through REST APIs",
          "Write clean, well-documented code and participate in code reviews via GitHub",
        ],
      },
    ],
    expectations: [
      "Strong grasp of HTML, CSS, and modern JavaScript (ES6+)",
      "Hands-on experience or strong coursework in React.js",
      "Basic understanding of Node.js and REST APIs",
      "Familiarity with Java fundamentals (Spring Boot is a plus)",
      "Basic knowledge of MongoDB or any NoSQL database",
      "Ability to work independently, manage your time, and communicate clearly",
    ],
    skills: ["Node.js", "React", "Java", "Spring Boot", "MongoDB", "REST APIs", "HTML / CSS", "Git / GitHub"],
    goodToHave: [
      "Experience with TypeScript",
      "Familiarity with Express or other Node.js frameworks",
      "Understanding of data modeling in NoSQL databases",
      "Prior internship, freelance, or personal project experience",
      "Interest in agriculture, food exports, or sustainability",
    ],
  },

  seo: {
    id: "seo",
    title: "SEO Content Writer",
    breadcrumb: "SEO Content Writer",
    badges: ["Fresher", "Remote"],
    meta: [
      { key: "Role Type", val: "Full-Time" },
      { key: "Location", val: "Remote (India)" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "3 days ago" },
    ],
    aboutRole:
      'As an <strong>SEO Content Writer</strong>, you will create SEO-optimized blog posts, product descriptions, and website content that drive organic traffic and showcase our organic produce to global audiences.',
    sections: [
      {
        title: "Content Creation",
        items: [
          "Write SEO-optimized blog posts about organic farming, sustainability, and food exports",
          "Create compelling product descriptions for our organic produce catalog",
          "Develop landing page content that converts visitors into customers",
          "Build content calendars aligned with seasonal produce and marketing campaigns",
        ],
      },
      {
        title: "SEO & Analytics",
        items: [
          "Conduct keyword research to identify high-value content opportunities",
          "Optimize existing content for better search engine rankings",
          "Track content performance using Google Analytics and Search Console",
          "Implement on-page SEO best practices across the website",
        ],
      },
      {
        title: "Brand Voice & Strategy",
        items: [
          "Maintain consistent brand voice across all content channels",
          "Research industry trends and competitor content strategies",
          "Collaborate with the marketing team on campaign content",
          "Create shareable content for social media platforms",
        ],
      },
    ],
    expectations: [
      "Excellent written English with strong grammar and storytelling skills",
      "Basic understanding of SEO principles and keyword optimization",
      "Familiarity with content management systems (WordPress, CMS)",
      "Ability to research and write about technical topics in simple language",
      "Portfolio of previous writing samples (blog, academic, or freelance)",
    ],
    skills: ["SEO Writing", "Keyword Research", "Content Strategy", "WordPress", "Google Analytics", "Copywriting"],
    goodToHave: [
      "Experience with Ahrefs, SEMrush, or similar SEO tools",
      "Knowledge of agriculture or food industry",
      "Social media content creation experience",
      "Basic HTML knowledge",
      "Photography or graphic design skills",
    ],
  },

  sales: {
    id: "sales",
    title: "Sales & Marketing Executive",
    breadcrumb: "Sales & Marketing",
    badges: ["Fresher", "On-Site"],
    meta: [
      { key: "Role Type", val: "Full-Time" },
      { key: "Location", val: "On-Site" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "₹10,000 - ₹15,000" },
      { key: "Posted", val: "1 week ago" },
    ],
    aboutRole:
      'As a <strong>Sales & Marketing Executive</strong>, you will drive B2B and retail sales while executing marketing campaigns to promote our organic products across India and international markets.',
    sections: [
      {
        title: "Sales Activities",
        items: [
          "Identify and acquire new B2B clients \u2014 restaurants, hotels, and retailers",
          "Manage existing client relationships and ensure repeat orders",
          "Conduct product demos and presentations for potential buyers",
          "Achieve monthly and quarterly sales targets",
        ],
      },
      {
        title: "Marketing Execution",
        items: [
          "Execute digital marketing campaigns on social media and email",
          "Create promotional materials for trade shows and events",
          "Manage customer inquiries and convert leads into sales",
          "Track campaign performance and ROI metrics",
        ],
      },
      {
        title: "Market Development",
        items: [
          "Research new market opportunities in domestic and international markets",
          "Build partnerships with distributors and resellers",
          "Attend industry events and networking opportunities",
          "Provide market feedback to the product and operations team",
        ],
      },
    ],
    expectations: [
      "Strong communication and negotiation skills",
      "Ability to build and maintain client relationships",
      "Basic knowledge of digital marketing and social media",
      "Willingness to travel within Tamil Nadu and occasionally interstate",
      "Freshers with passion for sales and organic products are welcome",
    ],
    skills: ["B2B Sales", "Digital Marketing", "Client Relations", "Negotiation", "Market Research", "CRM Tools"],
    goodToHave: [
      "Experience in FMCG or organic food sales",
      "Knowledge of export regulations",
      "Existing network in hospitality or retail sector",
      "Proficiency in Hindi or other regional languages",
      "MBA or business degree",
    ],
  },

  agriculture: {
    id: "agriculture",
    title: "Agriculture Executive",
    breadcrumb: "Agriculture",
    badges: ["Full-Time", "On-Site"],
    meta: [
      { key: "Role Type", val: "Full-Time" },
      { key: "Location", val: "Salem, Tamil Nadu" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "1 week ago" },
    ],
    aboutRole:
      'As an <strong>Agriculture Executive</strong>, you will manage farmer partnerships, coordinate organic certifications, and ensure quality supply chain operations for our export business.',
    sections: [
      {
        title: "Farmer Relations",
        items: [
          "Build and maintain relationships with organic farmers in Tamil Nadu",
          "Conduct regular farm visits to ensure quality standards",
          "Provide training on organic farming best practices",
          "Negotiate pricing and procurement contracts with farmers",
        ],
      },
      {
        title: "Quality & Certification",
        items: [
          "Coordinate organic certification processes with regulatory bodies",
          "Implement quality control measures across the supply chain",
          "Maintain documentation for traceability and compliance",
          "Conduct regular quality audits of produce and packaging",
        ],
      },
      {
        title: "Supply Chain Operations",
        items: [
          "Manage inventory and logistics for farm-to-warehouse operations",
          "Coordinate with logistics partners for timely deliveries",
          "Optimize supply chain processes to reduce waste and costs",
          "Track and report on supply chain KPIs and metrics",
        ],
      },
    ],
    expectations: [
      "Degree in Agriculture, Food Science, or related field",
      "Understanding of organic farming practices and certifications",
      "Strong interpersonal skills for farmer relationship management",
      "Willingness to travel to farm locations in rural Tamil Nadu",
      "Basic knowledge of supply chain and logistics operations",
    ],
    skills: ["Farm Management", "Supply Chain", "Organic Certification", "Quality Control", "Procurement", "Agricultural Science"],
    goodToHave: [
      "Experience with organic certification bodies",
      "Knowledge of export quality standards",
      "Familiarity with agricultural technology",
      "Strong report writing and documentation skills",
      "Language skills: Tamil + Hindi or English",
    ],
  },

  hr: {
    id: "hr",
    title: "HR Executive",
    breadcrumb: "HR Executive",
    badges: ["Internship", "Remote & On-Site"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "Remote & On-Site" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "1 week ago" },
    ],
    aboutRole:
      'As an <strong>HR Executive</strong>, you will manage recruitment, employee relations, and HR operations to build and sustain a motivated team across our farm and office locations.',
    sections: [
      {
        title: "Recruitment & Onboarding",
        items: [
          "Manage end-to-end recruitment for all positions across the organization",
          "Source candidates through job portals, referrals, and campus hiring",
          "Conduct initial screening interviews and coordinate hiring process",
          "Manage new employee onboarding and orientation programs",
        ],
      },
      {
        title: "Employee Relations",
        items: [
          "Address employee queries and resolve workplace issues",
          "Conduct regular engagement surveys and implement feedback",
          "Organize team-building activities and company events",
          "Maintain positive work culture aligned with company values",
        ],
      },
      {
        title: "HR Operations",
        items: [
          "Maintain employee records and HRMS systems",
          "Process payroll inputs, attendance, and leave management",
          "Ensure compliance with labor laws and statutory requirements",
          "Prepare HR reports and analytics for management review",
        ],
      },
    ],
    expectations: [
      "Degree in HR, Business Administration, or related field",
      "Strong interpersonal and communication skills",
      "Knowledge of labor laws and statutory compliance",
      "Proficiency in MS Office and HRMS tools",
      "Freshers with passion for people management are welcome",
    ],
    skills: ["Recruitment", "Employee Relations", "HR Operations", "Payroll Management", "Compliance", "HRMS"],
    goodToHave: [
      "Experience with ATS and recruitment tools",
      "Knowledge of Tamil labor laws",
      "Performance management experience",
      "Training and development skills",
      "SHRM or similar HR certification",
    ],
  },

  accountant: {
    id: "accountant",
    title: "Accountant",
    breadcrumb: "Accountant",
    badges: ["Fresher", "On-Site"],
    meta: [
      { key: "Role Type", val: "Full-Time" },
      { key: "Location", val: "Salem, Tamil Nadu" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "1 week ago" },
    ],
    aboutRole:
      'As an <strong>Accountant</strong>, you will manage bookkeeping, invoicing, and financial records to keep our farm-to-table export operations running smoothly and profitably.',
    sections: [
      {
        title: "Financial Operations",
        items: [
          "Maintain accurate books of accounts using Tally or similar software",
          "Process vendor and customer invoices, payments, and receipts",
          "Manage accounts payable and accounts receivable cycles",
          "Prepare bank reconciliation statements monthly",
        ],
      },
      {
        title: "Tax & Compliance",
        items: [
          "Handle GST filing, returns, and compliance documentation",
          "Assist in TDS calculations and quarterly filings",
          "Maintain records for statutory audits and tax assessments",
          "Ensure compliance with Indian accounting standards",
        ],
      },
      {
        title: "Reporting & Analysis",
        items: [
          "Generate daily, weekly, and monthly financial reports",
          "Track expenses, budgets, and variance analysis",
          "Support management with financial data for decision-making",
          "Maintain organized digital and physical filing systems",
        ],
      },
    ],
    expectations: [
      "Commerce background (B.Com, M.Com, or equivalent)",
      "Proficiency in Tally and MS Excel",
      "Basic knowledge of GST and Indian taxation",
      "Attention to detail and accuracy in data entry",
      "Strong organizational and time-management skills",
    ],
    skills: ["Tally", "GST", "Bookkeeping", "MS Excel", "Financial Reporting", "Accounting"],
    goodToHave: [
      "Experience with Tally Prime",
      "Knowledge of export accounting and FEMA regulations",
      "Familiarity with cloud accounting software",
      "CA Inter or similar certification",
      "Experience in FMCG or export businesses",
    ],
  },

  "customer-support": {
    id: "customer-support",
    title: "Customer Support Intern",
    breadcrumb: "Customer Support",
    badges: ["Internship", "Remote"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "Remote" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "2 days ago" },
    ],
    aboutRole:
      'As a <strong>Customer Support Intern</strong>, you will be the first point of contact for our customers, ensuring they receive prompt and professional support for all their queries.',
    sections: [
      {
        title: "Customer Engagement",
        items: [
          "Handle customer inquiries via email, chat, and phone",
          "Resolve product, order, and delivery-related issues promptly",
          "Maintain a professional and empathetic tone in all interactions",
          "Document customer feedback for product and service improvements",
        ],
      },
      {
        title: "Order Support",
        items: [
          "Process order requests and track delivery status",
          "Coordinate with logistics teams for shipment updates",
          "Handle returns, replacements, and refund requests",
          "Maintain accurate customer interaction records",
        ],
      },
      {
        title: "Process Improvement",
        items: [
          "Identify recurring issues and suggest process improvements",
          "Create FAQ documents and help articles for common queries",
          "Participate in team meetings and training sessions",
          "Contribute to building a customer-first support culture",
        ],
      },
    ],
    expectations: [
      "Excellent communication skills (written and verbal)",
      "Patient, empathetic, and customer-focused attitude",
      "Basic computer skills and familiarity with email/chat tools",
      "Problem-solving mindset with attention to detail",
      "Ability to work flexible hours including weekends if needed",
    ],
    skills: ["Customer Support", "Communication", "Order Management", "Problem Solving", "CRM Tools"],
    goodToHave: [
      "Experience with Zendesk, Freshdesk, or similar tools",
      "Knowledge of e-commerce operations",
      "Multilingual abilities (Tamil, Hindi, English)",
      "Previous customer service experience",
      "Interest in organic food and sustainability",
    ],
  },

  "supply-chain": {
    id: "supply-chain",
    title: "Supply Chain Intern",
    breadcrumb: "Supply Chain",
    badges: ["Internship", "Hybrid & On-Site"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "Hybrid & On-Site" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "3 days ago" },
    ],
    aboutRole:
      'As a <strong>Supply Chain Intern</strong>, you will learn the end-to-end supply chain process from farm to customer, ensuring timely delivery of fresh organic produce.',
    sections: [
      {
        title: "Inventory & Logistics",
        items: [
          "Track inventory levels across warehouse and farm locations",
          "Coordinate with suppliers for procurement and delivery schedules",
          "Monitor order shipments and update tracking systems",
          "Assist in demand forecasting and stock planning",
        ],
      },
      {
        title: "Operations Coordination",
        items: [
          "Liaise between farmers, warehouse teams, and logistics partners",
          "Update supply chain data in ERP systems daily",
          "Assist in quality checks at receiving and dispatch points",
          "Support route optimization for delivery vehicles",
        ],
      },
      {
        title: "Data & Reporting",
        items: [
          "Maintain supply chain documentation and records",
          "Generate daily dispatch and delivery reports",
          "Track KPIs such as delivery time and fill rates",
          "Assist in process improvement initiatives",
        ],
      },
    ],
    expectations: [
      "Strong organizational and coordination skills",
      "Basic Excel knowledge for data tracking",
      "Attention to detail and accuracy",
      "Willingness to work on-site in Salem",
      "Interest in logistics, agriculture, or supply chain management",
    ],
    skills: ["Supply Chain", "Inventory Management", "Logistics", "Coordination", "Excel", "Data Entry"],
    goodToHave: [
      "Familiarity with ERP systems",
      "Knowledge of cold chain logistics",
      "Basic understanding of agricultural supply chains",
      "Experience with route planning tools",
      "Strong numerical and analytical skills",
    ],
  },

  "ea-director": {
    id: "ea-director",
    title: "Executive Assistant to Director",
    breadcrumb: "Executive Assistant",
    badges: ["Full-Time", "Remote & On-Site"],
    meta: [
      { key: "Role Type", val: "Full-Time" },
      { key: "Location", val: "Remote & On-Site" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "4 days ago" },
    ],
    aboutRole:
      'As an <strong>Executive Assistant to the Director</strong>, you will be the right hand to our Director, managing their schedule and ensuring smooth day-to-day operations.',
    sections: [
      {
        title: "Calendar & Schedule Management",
        items: [
          "Manage Director's daily, weekly, and monthly calendar",
          "Schedule and coordinate internal and external meetings",
          "Prioritize conflicting commitments and reschedule as needed",
          "Send meeting reminders and prepare agendas in advance",
        ],
      },
      {
        title: "Communication & Documentation",
        items: [
          "Draft, review, and manage correspondence on behalf of the Director",
          "Prepare meeting minutes, presentations, and reports",
          "Handle confidential information with discretion",
          "Coordinate travel arrangements including flights, hotels, and itineraries",
        ],
      },
      {
        title: "Administrative Coordination",
        items: [
          "Follow up on action items and deadlines from meetings",
          "Liaise between departments and external stakeholders",
          "Organize company events, offsites, and team activities",
          "Maintain organized filing systems (digital and physical)",
        ],
      },
    ],
    expectations: [
      "Excellent organizational and time-management skills",
      "Strong verbal and written communication in English",
      "Proficiency in MS Office (Word, Excel, PowerPoint, Outlook)",
      "Discretion and professionalism with confidential matters",
      "Proactive attitude and ability to anticipate needs",
    ],
    skills: ["Scheduling", "Documentation", "Communication", "Coordination", "MS Office", "Time Management"],
    goodToHave: [
      "Prior experience as an EA or personal assistant",
      "Experience supporting C-level executives",
      "Knowledge of project management tools (Notion, Asana, Trello)",
      "Strong multitasking abilities",
      "Experience in startups or export businesses",
    ],
  },

  "pa-director": {
    id: "pa-director",
    title: "Personal Assistant to Director",
    breadcrumb: "Personal Assistant",
    badges: ["Full-Time", "Remote & On-Site"],
    meta: [
      { key: "Role Type", val: "Full-Time" },
      { key: "Location", val: "Remote & On-Site" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "4 days ago" },
    ],
    aboutRole:
      'As a <strong>Personal Assistant to the Director</strong>, you will provide comprehensive personal and administrative support to ensure the Director operates efficiently.',
    sections: [
      {
        title: "Daily Management",
        items: [
          "Manage the Director's daily schedule, appointments, and reminders",
          "Handle personal correspondence and communications",
          "Coordinate travel bookings and personal errands",
          "Manage personal expenses and reimbursements",
        ],
      },
      {
        title: "Meeting & Event Support",
        items: [
          "Prepare meeting materials and briefing documents",
          "Accompany the Director to meetings and take notes",
          "Organize personal and professional events",
          "Coordinate with vendors for office and personal needs",
        ],
      },
      {
        title: "Confidential Support",
        items: [
          "Handle sensitive personal and business information",
          "Manage personal contacts and relationships on behalf of the Director",
          "Maintain strict confidentiality at all times",
          "Act as a gatekeeper and filter communications as needed",
        ],
      },
    ],
    expectations: [
      "Strong time management and organizational skills",
      "Excellent verbal and written communication",
      "Proactive attitude with high attention to detail",
      "Ability to handle multiple tasks simultaneously",
      "Absolute discretion and trustworthiness",
    ],
    skills: ["Time Management", "Communication", "Scheduling", "Administration", "Organization", "Discretion"],
    goodToHave: [
      "Prior experience as a personal assistant",
      "Experience with domestic and international travel coordination",
      "Knowledge of etiquette and protocol",
      "Strong networking abilities",
      "Fluency in multiple languages",
    ],
  },

  quality: {
    id: "quality",
    title: "Produce Quality / Food Quality Intern",
    breadcrumb: "Food Quality",
    badges: ["Internship", "On-Site"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "Salem, Tamil Nadu" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "5 days ago" },
    ],
    aboutRole:
      'As a <strong>Produce Quality Intern</strong>, you will ensure our organic produce meets the highest quality standards through inspection and documentation.',
    sections: [
      {
        title: "Quality Inspection",
        items: [
          "Inspect fresh produce at receiving and dispatch points",
          "Check for visual defects, ripeness, and quality parameters",
          "Document quality findings in standard inspection forms",
          "Flag non-conforming produce for rejection or regrading",
        ],
      },
      {
        title: "Food Safety & Compliance",
        items: [
          "Monitor handling practices during storage and transport",
          "Assist in maintaining food safety documentation",
          "Support quality audits and compliance checks",
          "Help implement HACCP and organic certification standards",
        ],
      },
      {
        title: "Reporting & Improvement",
        items: [
          "Generate daily quality reports and dashboards",
          "Track quality metrics and identify trends",
          "Support root cause analysis for quality issues",
          "Assist in process improvement initiatives",
        ],
      },
    ],
    expectations: [
      "Degree in Food Science, Agriculture, or related field",
      "Basic food safety and hygiene knowledge",
      "Strong attention to detail and documentation skills",
      "Willingness to work on-site in warehouse/farm environments",
      "Good observational and analytical skills",
    ],
    skills: ["Quality Inspection", "Food Safety", "Documentation", "HACCP", "Analytical Skills", "Fresh Produce"],
    goodToHave: [
      "Experience with organic certification standards",
      "Knowledge of FSSAI regulations",
      "Familiarity with quality management systems",
      "Basic lab testing knowledge",
      "Strong report writing skills",
    ],
  },

  procurement: {
    id: "procurement",
    title: "Procurement Intern",
    breadcrumb: "Procurement",
    badges: ["Internship", "On-Site"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "Salem, Tamil Nadu" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "5 days ago" },
    ],
    aboutRole:
      'As a <strong>Procurement Intern</strong>, you will learn the procurement process from sourcing to purchase, working with agricultural suppliers and vendors.',
    sections: [
      {
        title: "Vendor Management",
        items: [
          "Assist with vendor outreach and communication",
          "Maintain supplier database and contact records",
          "Track vendor performance and delivery timelines",
          "Support negotiations and contract renewals",
        ],
      },
      {
        title: "Purchase Operations",
        items: [
          "Track purchase orders and delivery schedules",
          "Process purchase requests and approvals",
          "Maintain procurement records and documentation",
          "Compare prices and quality across multiple vendors",
        ],
      },
      {
        title: "Sourcing & Research",
        items: [
          "Research new suppliers for agricultural inputs and packaging",
          "Support sourcing activities for seasonal produce",
          "Assist in market price comparisons and benchmarking",
          "Help identify cost-saving opportunities",
        ],
      },
    ],
    expectations: [
      "Analytical and detail-oriented mindset",
      "Basic Excel knowledge for tracking and reporting",
      "Good negotiation and communication skills",
      "Ability to work on-site in Salem",
      "Interest in procurement, supply chain, or agriculture",
    ],
    skills: ["Procurement", "Vendor Management", "Sourcing", "Purchase Tracking", "Excel", "Negotiation"],
    goodToHave: [
      "Familiarity with ERP procurement modules",
      "Knowledge of agricultural inputs and packaging materials",
      "Experience with vendor evaluation frameworks",
      "Basic understanding of import/export regulations",
      "Strong numerical aptitude",
    ],
  },

  "digital-marketing": {
    id: "digital-marketing",
    title: "Digital Marketing Intern",
    breadcrumb: "Digital Marketing",
    badges: ["Internship", "Remote"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "Remote" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "4 days ago" },
    ],
    aboutRole:
      'As a <strong>Digital Marketing Intern</strong>, you will support our digital marketing efforts across social media, content, and online campaigns.',
    sections: [
      {
        title: "Social Media Management",
        items: [
          "Create and schedule posts across Instagram, Facebook, LinkedIn, and Twitter",
          "Engage with followers and respond to comments and DMs",
          "Track social media metrics and report on engagement",
          "Develop content ideas aligned with brand guidelines",
        ],
      },
      {
        title: "Campaign Support",
        items: [
          "Assist with paid advertising campaigns on Google and Meta",
          "Create promotional content for seasonal campaigns",
          "Track campaign performance and ROI",
          "Support email marketing campaigns and newsletters",
        ],
      },
      {
        title: "Content & Analytics",
        items: [
          "Create blog posts, infographics, and video content",
          "Monitor website analytics and traffic sources",
          "Research competitor strategies and industry trends",
          "Support SEO efforts with content optimization",
        ],
      },
    ],
    expectations: [
      "Familiarity with major social media platforms",
      "Creative mindset with good writing skills",
      "Basic understanding of digital marketing concepts",
      "Interest in analytics and data-driven decision making",
      "Ability to work independently in a remote environment",
    ],
    skills: ["Digital Marketing", "Social Media", "Content Marketing", "Analytics", "SEO", "Copywriting"],
    goodToHave: [
      "Experience with Google Ads or Meta Ads Manager",
      "Knowledge of Canva or similar design tools",
      "Familiarity with Mailchimp or email marketing platforms",
      "Basic video editing skills",
      "Interest in organic food or sustainability",
    ],
  },

  "android-dev": {
    id: "android-dev",
    title: "Android Developer",
    breadcrumb: "Android Developer",
    badges: ["Internship", "Remote"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "Remote" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "Based on the performance" },
      { key: "Posted", val: "5 days ago" },
    ],
    aboutRole:
      'As an <strong>Android Developer</strong>, you will build mobile applications that connect farmers and customers across our organic supply chain.',
    sections: [
      {
        title: "Mobile Development",
        items: [
          "Develop and maintain Android applications using Kotlin/Java",
          "Implement clean architecture with MVVM/MVI patterns",
          "Build responsive UIs following Material Design guidelines",
          "Handle offline data synchronization and caching",
        ],
      },
      {
        title: "API Integration",
        items: [
          "Integrate REST APIs for real-time data communication",
          "Implement authentication flows (JWT, OAuth)",
          "Handle push notifications and background services",
          "Optimize network calls and data caching strategies",
        ],
      },
      {
        title: "Quality & Performance",
        items: [
          "Write unit and integration tests for reliable code",
          "Profile and optimize app performance and memory usage",
          "Fix bugs promptly and conduct thorough code reviews",
          "Publish and manage releases on Google Play Store",
        ],
      },
    ],
    expectations: [
      "Strong Android development experience with Kotlin or Java",
      "Proficiency in Android SDK, Material Design, and Jetpack",
      "Experience with REST API integration and JSON parsing",
      "Familiarity with Git version control",
      "Problem-solving skills and attention to detail",
    ],
    skills: ["Android", "Kotlin / Java", "REST API", "Mobile Development", "Material Design", "Git"],
    goodToHave: [
      "Experience with Jetpack Compose",
      "Knowledge of Firebase services (Auth, Firestore, FCM)",
      "Familiarity with CI/CD for mobile apps",
      "Experience with Kotlin Coroutines and Flow",
      "Published apps on Google Play Store",
    ],
  },

  "b2b-sales": {
    id: "b2b-sales",
    title: "B2B / Retail Sales Executive Intern",
    breadcrumb: "B2B / Retail Sales",
    badges: ["Internship", "On-Site & Field"],
    meta: [
      { key: "Role Type", val: "Internship" },
      { key: "Location", val: "On-Site & Field" },
      { key: "Duration", val: "6 Months" },
      { key: "Stipend", val: "₹10,000 - ₹15,000" },
      { key: "Posted", val: "1 day ago" },
    ],
    aboutRole:
      'As a <strong>B2B / Retail Sales Executive Intern</strong>, you will identify and connect with potential B2B and retail customers, generate and follow up on sales leads, and achieve assigned sales targets for VPNexues.',
    sections: [
      {
        title: "Lead Generation & Outreach",
        items: [
          "Identify potential B2B and retail customers through research and outreach",
          "Generate, qualify, and follow up on sales leads",
          "Maintain an up-to-date lead and prospect database",
          "Coordinate product inquiries and follow-up communication",
        ],
      },
      {
        title: "Sales Execution",
        items: [
          "Promote organic products across B2B and retail channels",
          "Support negotiations and work toward assigned sales targets",
          "Build and maintain strong customer relationships",
          "Track conversions and report sales pipeline progress",
        ],
      },
    ],
    expectations: [
      "Good communication and interpersonal skills",
      "Interest in sales, business development, or marketing",
      "Self-motivated with a target-driven mindset",
      "Basic computer and CRM familiarity",
      "Willingness to engage with customers remotely and in the field",
    ],
    skills: ["B2B Sales", "Lead Generation", "Negotiation", "Communication", "Relationship Management"],
    goodToHave: [
      "Experience with CRM tools",
      "Familiarity with FMCG, agri-business, or organic products",
      "Prior internship or project work in sales",
      "Knowledge of the Tamil Nadu or Singapore market",
      "Basic Excel or spreadsheet reporting skills",
    ],
  },
};

export const JOB_IDS = Object.keys(JOB_DATA);
