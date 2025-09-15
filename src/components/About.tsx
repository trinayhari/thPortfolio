import React from 'react';
import { Code, Palette, Zap, Users } from 'lucide-react';

const About: React.FC = () => {
  const skills = [
    'JavaScript (ES6+)', 'TypeScript', 'React', 'Node.js', 
    'Python', 'PostgreSQL', 'MongoDB', 'AWS', 
    'Docker', 'Git', 'Figma', 'Tailwind CSS'
  ];

  const highlights = [
    {
      icon: <Code className="w-6 h-6" />,
      title: "Clean Code",
      description: "Writing maintainable, scalable, and well-documented code"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Design Systems",
      description: "Creating consistent and beautiful user interfaces"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Performance",
      description: "Optimizing applications for speed and efficiency"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Collaboration",
      description: "Working effectively in cross-functional teams"
    }
  ];

  return (
    <section id="about" className="py-20 px-6 sm:px-8 max-w-6xl mx-auto">
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center">
          <span className="text-teal-400 font-mono mr-2">01.</span>
          About Me
        </h2>
        <div className="w-20 h-0.5 bg-teal-400"></div>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <p className="text-white/70 text-lg leading-relaxed">
            Hello! I'm Alex, a passionate full-stack developer based in San Francisco. 
            I enjoy creating digital experiences that live on the internet, whether 
            that be websites, applications, or anything in between.
          </p>
          <p className="text-white/70 text-lg leading-relaxed">
            My interest in web development started in 2019 when I decided to build 
            my first website. Fast-forward to today, and I've had the privilege of 
            working at startups, agencies, and large corporations.
          </p>
          <p className="text-white/70 text-lg leading-relaxed">
            Here are a few technologies I've been working with recently:
          </p>

          <div className="grid grid-cols-2 gap-2 mt-6">
            {skills.map((skill, index) => (
              <div key={index} className="flex items-center">
                <span className="text-teal-400 mr-2">▹</span>
                <span className="text-white/70 font-mono text-sm">{skill}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {highlights.map((highlight, index) => (
            <div 
              key={index} 
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              <div className="text-teal-400 mb-3">
                {highlight.icon}
              </div>
              <h3 className="text-white font-semibold mb-2">{highlight.title}</h3>
              <p className="text-white/60 text-sm">{highlight.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default About;