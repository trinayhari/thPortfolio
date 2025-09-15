import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';

interface Job {
  company: string;
  title: string;
  period: string;
  description: string[];
  technologies: string[];
  link?: string;
}

const Experience: React.FC = () => {
  const [activeJob, setActiveJob] = useState(0);

  const jobs: Job[] = [
    {
      company: "TechCorp",
      title: "Senior Full Stack Developer",
      period: "January 2023 - Present",
      description: [
        "Lead development of customer-facing web applications serving 100K+ users",
        "Architected and implemented microservices infrastructure reducing load times by 40%",
        "Mentored junior developers and established coding standards across the team",
        "Collaborated with design and product teams to deliver pixel-perfect implementations"
      ],
      technologies: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
      link: "https://techcorp.com"
    },
    {
      company: "StartupXYZ",
      title: "Full Stack Developer",
      period: "June 2021 - December 2022",
      description: [
        "Built and maintained React-based dashboard for internal analytics platform",
        "Developed RESTful APIs handling 10M+ requests per month",
        "Implemented automated testing reducing bug reports by 60%",
        "Optimized database queries improving application performance by 35%"
      ],
      technologies: ["React", "Python", "Django", "MongoDB", "Docker"],
      link: "https://startupxyz.com"
    },
    {
      company: "Digital Agency",
      title: "Frontend Developer",
      period: "September 2019 - May 2021",
      description: [
        "Developed responsive websites for 20+ clients across various industries",
        "Collaborated with designers to create pixel-perfect implementations",
        "Integrated third-party APIs and payment systems",
        "Maintained and updated existing client websites"
      ],
      technologies: ["JavaScript", "HTML/CSS", "WordPress", "PHP", "jQuery"]
    }
  ];

  return (
    <section id="experience" className="py-20 px-6 sm:px-8 max-w-6xl mx-auto">
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center">
          <span className="text-teal-400 font-mono mr-2">02.</span>
          Where I've Worked
        </h2>
        <div className="w-20 h-0.5 bg-teal-400"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Company Tabs */}
        <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
          {jobs.map((job, index) => (
            <button
              key={index}
              onClick={() => setActiveJob(index)}
              className={`whitespace-nowrap lg:whitespace-normal px-6 py-3 text-left border-l-2 lg:border-l-2 lg:border-b-0 transition-all font-mono text-sm ${
                activeJob === index
                  ? 'border-teal-400 text-teal-400 bg-teal-400/10'
                  : 'border-white/20 text-white/60 hover:text-teal-400 hover:bg-teal-400/5'
              }`}
            >
              {job.company}
            </button>
          ))}
        </div>

        {/* Job Details */}
        <div className="flex-1 min-h-[400px]">
          <div className="animate-fade-in">
            <h3 className="text-xl font-semibold text-white mb-2">
              {jobs[activeJob].title}{' '}
              {jobs[activeJob].link && (
                <a
                  href={jobs[activeJob].link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-teal-400 hover:text-teal-300 ml-2"
                >
                  @ {jobs[activeJob].company}
                  <ExternalLink className="w-4 h-4 ml-1" />
                </a>
              )}
              {!jobs[activeJob].link && (
                <span className="text-teal-400">@ {jobs[activeJob].company}</span>
              )}
            </h3>
            
            <p className="text-white/60 font-mono text-sm mb-6">
              {jobs[activeJob].period}
            </p>

            <ul className="space-y-3 mb-6">
              {jobs[activeJob].description.map((item, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-teal-400 mr-3 mt-1">▹</span>
                  <span className="text-white/70">{item}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap gap-2">
              {jobs[activeJob].technologies.map((tech, index) => (
                <span
                  key={index}
                  className="bg-teal-400/10 text-teal-400 px-3 py-1 rounded-full text-sm font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Experience;