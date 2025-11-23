import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-background py-8 border-t border-border">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-center sm:text-left">
        <p className="text-sm text-text-secondary">
          &copy; {new Date().getFullYear()} Apex AI. All rights reserved.
        </p>
        <div className="flex gap-6 mt-4 sm:mt-0">
          <a href="mailto:contact@apexai.com" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Contact</a>
          <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-text-secondary cursor-default opacity-70">Privacy Policy</a>
          <a href="#" onClick={(e) => e.preventDefault()} className="text-sm text-text-secondary cursor-default opacity-70">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;