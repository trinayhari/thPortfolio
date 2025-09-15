import React from 'react';
import { ExternalLink, Github, Folder } from 'lucide-react';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  featured: boolean;
}

const Projects: React.FC = () => {
  const projects: Project[] = [
    {
      title: "E-Commerce Platform",
      description: "A full-stack e-commerce solution with user authentication, payment processing, and admin dashboard. Built with React, Node.js, and PostgreSQL.",
      technologies: ["React", "Node.js", "PostgreSQL", "Stripe", "JWT"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true
    },
    {
      title: "Task Management App",
      description: "A collaborative task management application with real-time updates, drag-and-drop functionality, and team collaboration features.",
      technologies: ["React", "TypeScript", "Socket.io", "MongoDB"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true
    },
    {
      title: "Weather Dashboard",
      description: "A responsive weather dashboard with location-based forecasts, interactive maps, and historical weather data visualization.",
      technologies: ["Vue.js", "Chart.js", "Weather API", "Tailwind"],
      githubUrl: "https://github.com",
      liveUrl: "https://example.com",
      featured: true
    },
    {
      title: "Portfolio Website",
      description: "A personal portfolio showcasing projects and skills with smooth animations and responsive design.",
      technologies: ["React", "Tailwind", "Framer Motion"],
      githubUrl: "https://github.com",
      featured: false
    },
    {
      title: "Recipe Finder",
      description: "An app to discover recipes based on available ingredients with nutritional information.",
      technologies: ["JavaScript", "Recipe API", "CSS Grid"],
      githubUrl: "https://github.com",
      featured: false
    },
    {
      title: "Expense Tracker",
      description: "A personal finance app for tracking expenses with categorization and budget management.",
      technologies: ["React Native", "SQLite", "Chart.js"],
      githubUrl: "https://github.com",
      featured: false
    }
  ];

  const featuredProjects = projects.filter(project => project.featured);
  const otherProjects = projects.filter(project => !project.featured);

  return (
    <section id="projects" className="py-20 px-6 sm:px-8 max-w-6xl mx-auto">
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center">
          <span className="text-teal-400 font-mono mr-2">03.</span>
          Some Things I've Built
        </h2>
        <div className="w-20 h-0.5 bg-teal-400"></div>
      </div>

      {/* Featured Projects */}
      <div className="space-y-16 mb-20">
        {featuredProjects.map((project, index) => (
          <div
            key={index}
            className={`grid lg:grid-cols-12 gap-8 items-center ${
              index % 2 === 1 ? 'lg:text-right' : ''
            }`}
          >
            <div className={`lg:col-span-7 ${index % 2 === 1 ? 'lg:col-start-6' : ''}`}>
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-64 flex items-center justify-center relative overflow-hidden group hover:bg-white/10 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/20 to-teal-600/20 group-hover:from-teal-400/30 group-hover:to-teal-600/30 transition-all duration-300"></div>
                <Folder className="w-16 h-16 text-teal-400" />
              </div>
            </div>

            <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
              <p className="text-teal-400 font-mono text-sm mb-2">Featured Project</p>
              <h3 className="text-2xl font-bold text-white mb-4">{project.title}</h3>
              <div className="bg-teal-900/40 backdrop-blur-sm border border-teal-400/20 rounded-lg p-6 mb-4">
                <p className="text-white/70">{project.description}</p>
              </div>
              
              <div className={`flex flex-wrap gap-2 mb-4 ${index % 2 === 1 ? 'lg:justify-end' : ''}`}>
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="text-white/70 font-mono text-sm">
                    {tech}
                  </span>
                ))}
              </div>

              <div className={`flex gap-4 ${index % 2 === 1 ? 'lg:justify-end' : ''}`}>
                {project.githubUrl && (
                  <a
                    href={project.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-teal-400 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {project.liveUrl && (
                  <a
                    href={project.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-teal-400 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Other Projects */}
      <div className="mb-16">
        <h3 className="text-xl font-bold text-white mb-8 text-center">Other Noteworthy Projects</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {otherProjects.map((project, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:scale-105 transition-all duration-300 group"
            >
              <div className="flex justify-between items-center mb-4">
                <Folder className="w-8 h-8 text-teal-400" />
                <div className="flex gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-teal-400 transition-colors"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 hover:text-teal-400 transition-colors"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              <h4 className="text-lg font-semibold text-white mb-3 group-hover:text-teal-400 transition-colors">
                {project.title}
              </h4>
              <p className="text-white/70 text-sm mb-4 flex-1">{project.description}</p>

              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, techIndex) => (
                  <span key={techIndex} className="text-white/60 font-mono text-xs">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;