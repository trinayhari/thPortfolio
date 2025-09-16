import React, { useState, useEffect } from 'react';
import { ArrowUpRight, Github, Linkedin, Mail, Download } from 'lucide-react';

const MinimalistPortfolio: React.FC = () => {
  const [activeSection, setActiveSection] = useState('about');
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const sections = ['about', 'education', 'experience', 'projects', 'skills'];

  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      const scrollContainer = document.getElementById('content-scroll');
      if (scrollContainer) {
        // Update active section based on scroll position
        const sectionElements = sections.map(id => document.getElementById(`${id}-section`));
        
        let currentSection = 'about';
        sectionElements.forEach((element, index) => {
          if (element) {
            const rect = element.getBoundingClientRect();
            const containerRect = scrollContainer.getBoundingClientRect();
            if (rect.top <= containerRect.height / 2) {
              currentSection = sections[index];
            }
          }
        });
        
        setActiveSection(currentSection);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const scrollContainer = document.getElementById('content-scroll');
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }
    
    document.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`${sectionId}-section`);
    const scrollContainer = document.getElementById('content-scroll');
    if (element && scrollContainer) {
      const offsetTop = element.offsetTop;
      scrollContainer.scrollTo({ top: offsetTop, behavior: 'smooth' });
    }
  };

  const experiences = [
    {
      period: 'MAY 2025 — AUGUST 2025',
      title: 'Software Development Engineering Intern',
      company: 'Amazon Web Services (AWS)',
      description: 'Architected and developed a scalable internal dashboard to monitor global AWS Lambda invocation patterns and detect accounts with recursive function loops to prevent runaway workloads.',
      technologies: ['AWS Lambda', 'Redshift', 'S3', 'AWS Glue', 'Athena', 'QuickSight', 'AWS CDK'],
      link: 'https://aws.amazon.com/',
      achievements: [
        'Designed an ETL pipeline using AWS Lambda to extract data from Redshift via the Data API',
        'Leveraged AWS Glue and Athena for data analysis and built insightful dashboards in Amazon QuickSight',
        'Implemented complete infrastructure automation using AWS CDK and integrated CI/CD pipelines'
      ]
    },
    {
      period: 'MAY 2024 — AUGUST 2024',
      title: 'Software Engineering Intern',
      company: 'Travelers Insurance',
      description: 'Developed and implemented new features for an Enhanced XML Utility Tool to streamline data retrieval and parsing for underwriters, leveraging AWS S3 and DynamoDB for efficient data storage and access.',
      technologies: ['AWS S3', 'DynamoDB', 'Lambda', 'Jenkins', 'Databricks', 'XML'],
      link: 'https://www.travelers.com/',
      achievements: [
        'Designed and deployed a Lambda function to automate data updates in DynamoDB',
        'Gained expertise in Jenkins CI/CD pipelines, ensuring a seamless SDLC',
        'Developed Databricks notebooks to create ETL pipelines for XML Messages to land in AWS S3'
      ]
    },
    {
      period: 'APRIL 2022 — PRESENT',
      title: 'Founder',
      company: 'PayBridge Technologies LLC',
      description: 'Pioneered a FinTech startup enabling seamless cross-platform payments between major platforms like PayPal and Venmo, leveraging diverse APIs to automate secure transactions and establish a robust backend infrastructure.',
      technologies: ['PayPal API', 'Discord API', 'Twilio API', 'Slack', 'Backend Infrastructure'],
      link: 'https://paybridgetech.com/',
      achievements: [
        'Created transactions clearing 10x faster and establishing a positive P&L',
        'Delivered compelling pitches to Venture Capitalists nationwide, securing funding',
        'Collaborated on integrating Slack to streamline internal communication and project management'
      ]
    }
  ];

  const projects = [
    {
      title: 'EchoBoard',
      description: 'Built and shipped an AI-powered analytics platform (Next.js + Supabase + OpenAI) to extract insights from qualitative surveys, following emphasis on high-quality UX and reliability.',
      technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'OpenAI API', 'Supabase', 'AWS'],
      link: 'https://www.echoboard.us/',
      highlights: [
        'Developed a fully responsive frontend with Next.js and Tailwind, supported by a secure backend',
        'Created customizable dashboards, AI-driven sentiment analysis, and automated recommendations',
        'Built for HR teams, researchers, and business leaders',
        'Integrated Supabase, Amazon RDS, and OpenAI-powered analytics'
      ]
    },
    {
      title: 'Sailo',
      description: 'Built an AI-powered ETL agent that connects directly to large-scale data warehouses (Redshift, Snowflake, BigQuery) and automatically generates pipelines to extract, transform, and load data.',
      technologies: ['Python', 'Modal', 'AWS', 'Redshift', 'LLM APIs', 'Streamlit'],
      link: 'https://devpost.com/software/sailo',
      highlights: [
        'Implemented schema interpretation with LLMs to recommend monitoring pipelines',
        'Detect anomalies and trigger automated actions (e.g., Slack alerts, downstream API calls)',
        'Deployed agents on Modal serverless infrastructure',
        'Deliver real-time insights and automate workflow execution with zero manual intervention'
      ]
    },
    {
      title: 'Routini',
      description: 'Built an AI-powered developer tool for intelligent LLM model routing using Streamlit, enabling cost-effective and accurate model selection from providers like OpenRouter.',
      technologies: ['Python', 'Streamlit', 'OpenRouter', 'LLM APIs', 'SHA-256', 'JSON'],
      link: 'https://github.com/trinayhari/routini',
      highlights: [
        'Implemented prompt hashing using SHA-256 to optimize performance',
        'Reduce redundant LLM calls, saving compute costs and latency',
        'Provided routing rationale, developer toggles, and prompt-specific insights',
        'Interactive UI with real-time feedback and model comparisons'
      ]
    }
  ];

  const skills = {
    'Languages & Frameworks': [
      'Java', 'Python', 'HTML', 'CSS', 'JavaScript', 'Flask', 'React', 'Bootstrap', 'Next.js', 'C++'
    ],
    'Developer Tools': [
      'Visual Studio Code', 'Git', 'Sublime Text', 'Xcode', 'Jenkins'
    ],
    'Libraries & Databases': [
      'NumPy', 'Pandas', 'TensorFlow', 'Matplotlib', 'Scikit-learn', 'SQL', 'SQLite', 'MongoDB', 'DynamoDB'
    ],
    'Cloud & AWS': [
      'AWS', 'AWS Lambda', 'S3', 'Redshift', 'DynamoDB', 'Glue', 'Athena', 'QuickSight', 'AWS CDK'
    ],
    'Other Skills': [
      'Database Management', 'Business Analytics', 'Capital Markets', 'Accounting', 'Compliance', 'P&L'
    ]
  };

  return (
    <div 
      className={`min-h-screen text-white flex transition-all duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'} relative overflow-hidden`}
      style={{
        background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(20, 184, 166, 0.1), transparent 50%), #0f172a`
      }}
    >
      {/* Fixed Left Sidebar */}
      <div className={`w-1/2 fixed left-0 top-0 h-screen flex flex-col p-12 lg:p-24 pt-8 lg:pt-16 transform transition-all duration-1000 ${isVisible ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Profile Image and Name Section */}
        <div className={`space-y-6 transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} mb-12`}>
          {/* Profile Picture */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <img
                src="/profileprof.jpeg"
                alt="Trinayaan Hariharan"
                className="w-32 h-32 rounded-full object-cover border-2 border-slate-700 group-hover:border-teal-400 transition-all duration-500 transform group-hover:scale-105 shadow-lg shadow-slate-900/50 group-hover:shadow-teal-400/20"
              />
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-teal-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>
          </div>

          {/* Name and Title */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
              Trinayaan
              <br />
              <span className="text-teal-400 transition-colors duration-500 hover:text-teal-300">Hariharan</span>
            </h1>
            <p className="text-xl text-slate-400 max-w-md mx-auto transition-colors duration-300 hover:text-slate-300">
              Computer Science Student & Software Engineer
            </p>
            <p className="text-slate-500 max-w-md mx-auto leading-relaxed transition-colors duration-300 hover:text-slate-400">
              Building scalable solutions and AI-powered applications at the intersection of technology and innovation.
            </p>
            
            {/* Resume Download Button */}
            <div className="pt-2 flex justify-center">
              <a
                href="/Trinayaan-OpenAi.pdf"
                download="Trinayaan_Hariharan_Resume.pdf"
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/50 hover:bg-teal-400/20 border border-slate-700 hover:border-teal-400/50 rounded-lg text-slate-300 hover:text-teal-400 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-teal-400/10 group"
              >
                <Download className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" />
                <span className="text-sm font-medium">Download Resume</span>
              </a>
            </div>
            
            {/* Social Links */}
            <div className="pt-4 flex justify-center">
              <div className="flex gap-4 items-center">
                <a
                  href="https://github.com/trinayhari"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                >
                  <Github className="w-5 h-5" />
                </a>
                <a
                  href="https://www.linkedin.com/in/trinayaan-hariharan-0559b720a/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a
                  href="mailto:trinayhari@gmail.com"
                  className="text-slate-500 hover:text-white transition-all duration-300 transform hover:scale-110"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`space-y-4 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'} flex-1 flex flex-col justify-center px-8`}>
          {sections.map((section) => (
            <button
              key={section}
              onClick={() => scrollToSection(section)}
              className="flex items-center gap-4 text-left group hover:text-white transition-all duration-300 transform hover:translate-x-2"
            >
              <div className={`h-px transition-all duration-500 ${
                activeSection === section
                  ? 'w-16 bg-white shadow-lg shadow-white/20'
                  : 'w-8 bg-slate-600 group-hover:w-12 group-hover:bg-slate-400'
              }`}></div>
              <span className="text-xs font-mono uppercase tracking-widest transition-all duration-300 group-hover:tracking-wider">
                {section}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Scrollable Right Content */}
      <div className={`w-1/2 ml-auto transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-x-0' : 'translate-x-full'}`}>
        <div id="content-scroll" className="h-screen overflow-y-auto scroll-smooth">
          <div className="p-12 lg:p-24 pt-4 lg:pt-8 space-y-24">
            {/* About Section */}
            <section id="about-section" className="min-h-screen flex flex-col justify-center">
              <div className={`space-y-6 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>

                <p className="text-slate-400 leading-relaxed">
                  I'm a Computer Science student at Georgia Tech passionate about building scalable 
                  software solutions and AI-powered applications. My experience spans from developing 
                  internal dashboards at AWS to creating FinTech startups that revolutionize 
                  cross-platform payments.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Currently pursuing my B.S. in Computer Science at <span className="text-white font-medium">Georgia Institute of Technology</span> 
                  . I have hands-on experience with cloud infrastructure, data engineering, 
                  and full-stack development through internships at <span className="text-white font-medium">Amazon Web Services</span> and 
                  <span className="text-white font-medium"> Travelers Insurance</span>.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  As the founder of <span className="text-white font-medium">PayBridge Technologies LLC</span>, I've successfully pitched to VCs 
                  nationwide and built a platform that processes transactions 10x faster than traditional methods. 
                  I'm also active in the Georgia Tech community as <span className="text-white font-medium">Director of Operations</span> for 
                  Startup Exchange GT, managing a team of 80+ members.
                </p>
                
                <div className="grid grid-cols-2 gap-6 mt-8">
                  <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70 hover:scale-105 hover:shadow-lg hover:shadow-teal-400/10">
                    <div className="text-teal-400 text-2xl font-bold mb-1 transition-colors duration-300 hover:text-teal-300">50K+</div>
                    <div className="text-slate-400 text-sm">Lines of Code</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70 hover:scale-105 hover:shadow-lg hover:shadow-teal-400/10">
                    <div className="text-teal-400 text-2xl font-bold mb-1 transition-colors duration-300 hover:text-teal-300">3</div>
                    <div className="text-slate-400 text-sm">Major Internships</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70 hover:scale-105 hover:shadow-lg hover:shadow-teal-400/10">
                    <div className="text-teal-400 text-2xl font-bold mb-1 transition-colors duration-300 hover:text-teal-300">500+</div>
                    <div className="text-slate-400 text-sm">Students Mentored</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 transition-all duration-300 hover:bg-slate-800/70 hover:scale-105 hover:shadow-lg hover:shadow-teal-400/10">
                    <div className="text-teal-400 text-2xl font-bold mb-1 transition-colors duration-300 hover:text-teal-300">15+</div>
                    <div className="text-slate-400 text-sm">Technologies Mastered</div>
                  </div>
                </div>

              </div>
            </section>

            {/* Education Section */}
            <section id="education-section" className="min-h-screen flex flex-col justify-center">
              <div className="space-y-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Education</h2>
                  <div className="w-12 h-0.5 bg-teal-400"></div>
                </div>

                <div className="bg-slate-800/30 rounded-lg p-6">
                  <div className="flex items-start gap-2 mb-3">
                    <h3 className="text-white font-medium text-lg">
                      Georgia Institute of Technology
                    </h3>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-teal-400 font-medium">Bachelor of Science in Computer Science</div>
                    <div className="text-slate-500 text-sm">May 2027</div>
                  </div>
                  <div className="mb-4">
                    <div className="text-white text-sm font-medium mb-2">GPA: 3.64/4.0</div>
                    <div className="text-slate-400 text-sm mb-3">
                      <strong>Relevant Coursework:</strong> Object Oriented Programming, Data Structures & Algorithms, 
                      Human Centered Technology, Algorithms, Artificial Intelligence, Machine Learning, 
                      Database Systems, UI Design, Computer Architecture
                    </div>
                    <div className="text-slate-400 text-sm">
                      <strong>Organizations:</strong> Startup Exchange, AI@GT, Trading Club, South Indian Association
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-700/50 rounded p-3">
                      <div className="text-teal-400 text-lg font-bold">2027</div>
                      <div className="text-slate-400 text-xs">Expected Graduation</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Experience Section */}
            <section id="experience-section" className="min-h-screen flex flex-col justify-center">
              <div className="space-y-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Professional Experience</h2>
                  <div className="w-12 h-0.5 bg-teal-400"></div>
                </div>

                {experiences.map((exp, index) => (
                  <div key={index} className="group relative transform transition-all duration-500 hover:scale-[1.02]">
                    {exp.link && (
                      <a href={exp.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                    )}
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-700 transition-colors duration-300 group-hover:bg-teal-400/50"></div>
                    <div className="absolute left-0 top-6 w-2 h-2 bg-teal-400 rounded-full -translate-x-0.5 transition-all duration-300 group-hover:w-3 group-hover:h-3 group-hover:shadow-lg group-hover:shadow-teal-400/50"></div>
                    <div className="pl-8">
                      <div className="text-xs text-slate-500 font-mono mb-2 uppercase tracking-wide">
                        {exp.period}
                      </div>
                      <div className="flex items-start gap-2 mb-3">
                        <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors">
                          {exp.title} · {exp.company}
                        </h3>
                        {exp.link && (
                          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-3">
                        {exp.description}
                      </p>
                      
                      {exp.achievements && (
                        <ul className="space-y-1 mb-3">
                          {exp.achievements.map((achievement, achIndex) => (
                            <li key={achIndex} className="flex items-start gap-2 text-slate-400 text-sm">
                              <span className="text-teal-400 mt-1">•</span>
                              <span>{achievement}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {exp.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Projects Section */}
            <section id="projects-section" className="min-h-screen flex flex-col justify-center">
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Featured Projects</h2>
                  <div className="w-12 h-0.5 bg-teal-400"></div>
                </div>

                <div className="grid gap-6">
                  {projects.map((project, index) => (
                    <div key={index} className="group bg-slate-800/30 rounded-lg p-6 hover:bg-slate-800/50 transition-all duration-500 relative transform hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-400/10">
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                      )}
                      <div className="flex items-start gap-2 mb-3">
                        <h3 className="text-white font-medium group-hover:text-teal-400 transition-colors">
                          {project.title}
                        </h3>
                        {project.link && (
                          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-all duration-300 transform group-hover:scale-110 group-hover:rotate-12" />
                        )}
                      </div>
                      <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        {project.description}
                      </p>
                      
                      {project.highlights && (
                        <div className="grid grid-cols-2 gap-2 mb-4">
                          {project.highlights.map((highlight, hlIndex) => (
                            <div key={hlIndex} className="flex items-start gap-2 text-slate-400 text-sm">
                              <span className="text-teal-400 mt-1">•</span>
                              <span>{highlight}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map((tech, techIndex) => (
                          <span
                            key={techIndex}
                            className="bg-slate-700 text-slate-300 px-2 py-1 rounded text-xs"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Skills Section */}
            <section id="skills-section" className="min-h-screen flex flex-col justify-center">
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Skills & Expertise</h2>
                  <div className="w-12 h-0.5 bg-teal-400"></div>
                </div>

                <div className="space-y-6">
                  {Object.entries(skills).map(([category, skillList], index) => (
                    <div key={index} className="bg-slate-800/30 rounded-lg p-6">
                      <h3 className="text-white font-medium mb-4">{category}</h3>
                      <div className="flex flex-wrap gap-2">
                        {skillList.map((skill, skillIndex) => (
                          <span key={skillIndex} className="bg-slate-700 text-slate-300 px-3 py-1 rounded-full text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-8 bg-slate-800/30 rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">Certifications & Leadership</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="text-white text-sm font-medium">AWS Certified Cloud Practitioner (CLF-02)</div>
                      <div className="text-slate-500 text-xs">Amazon Web Services • Current</div>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">Director of Operations</div>
                      <div className="text-slate-500 text-xs">Startup Exchange GT • May 2024 – Present</div>
                    </div>
                    <div>
                      <div className="text-white text-sm font-medium">U.S. Citizen</div>
                      <div className="text-slate-500 text-xs">Eligible to work in the United States</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalistPortfolio;