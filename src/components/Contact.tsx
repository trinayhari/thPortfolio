import React from 'react';
import { Mail, Github, Linkedin, Twitter } from 'lucide-react';

const Contact: React.FC = () => {
  const socialLinks = [
    { icon: <Github className="w-5 h-5" />, href: "https://github.com", label: "GitHub" },
    { icon: <Linkedin className="w-5 h-5" />, href: "https://linkedin.com", label: "LinkedIn" },
    { icon: <Twitter className="w-5 h-5" />, href: "https://twitter.com", label: "Twitter" },
  ];

  return (
    <section id="contact" className="py-20 px-6 sm:px-8 max-w-4xl mx-auto text-center">
      <div className="mb-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 flex items-center justify-center">
          <span className="text-teal-400 font-mono mr-2">04.</span>
          What's Next?
        </h2>
        <div className="w-20 h-0.5 bg-teal-400 mx-auto"></div>
      </div>

      <div className="max-w-2xl mx-auto">
        <h3 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Get In Touch
        </h3>
        <p className="text-white/70 text-lg leading-relaxed mb-12">
          I'm currently looking for new opportunities and my inbox is always open. 
          Whether you have a question or just want to say hi, I'll try my best to get back to you!
        </p>

        <div className="flex flex-col items-center gap-8">
          <a
            href="mailto:alex@example.com"
            className="group bg-transparent border-2 border-teal-400 text-teal-400 px-8 py-4 rounded-lg font-mono text-sm hover:bg-teal-400/10 transition-all duration-300 flex items-center gap-3"
          >
            <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Say Hello
          </a>

          <div className="flex gap-6">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-teal-400 transition-colors hover:scale-110 transform duration-200"
                aria-label={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-20 pt-8 border-t border-white/10">
        <p className="text-white/50 font-mono text-sm">
          Built with React & Tailwind CSS
        </p>
      </footer>
    </section>
  );
};

export default Contact;