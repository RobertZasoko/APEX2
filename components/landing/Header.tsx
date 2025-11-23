import React, { useState } from 'react';

interface HeaderProps {
  onStart: () => void;
}

const Header: React.FC<HeaderProps> = ({ onStart }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href) {
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setIsMenuOpen(false);
  };
  
  const handleMobileActionClick = () => {
    onStart();
    setIsMenuOpen(false);
  }

  const navLinks = (
    <>
      <a href="#features" onClick={handleNavClick} className="text-text-secondary hover:text-text-primary transition-colors">Features</a>
      <a href="#pricing" onClick={handleNavClick} className="text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
    </>
  );

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-2xl font-bold font-heading text-text-primary">
            Apex AI
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 font-medium">
            {navLinks}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center gap-4">
            <button onClick={onStart} className="font-semibold text-text-secondary hover:text-text-primary transition-colors">
              Login
            </button>
            <button onClick={onStart} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-panel border-t border-border">
          <nav className="flex flex-col items-center gap-4 p-4 font-medium">
            {navLinks}
            <button onClick={handleMobileActionClick} className="font-semibold text-text-secondary hover:text-text-primary transition-colors w-full text-center py-2">
              Login
            </button>
            <button onClick={handleMobileActionClick} className="bg-primary hover:bg-primary-hover text-white font-semibold py-2 px-4 rounded-lg transition-colors w-full text-center">
              Get Started
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
