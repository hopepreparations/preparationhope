import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import hopeLogoHeader from '@/assets/hope-logo-header.jpeg';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Topbar */}
      <div className="bg-primary-dark text-primary-foreground/90 text-xs py-1.5">
        <div className="container flex justify-between items-center flex-wrap gap-1">
          <span><i className="fas fa-map-marker-alt text-gold mr-1"></i> 05-Q Masjid Shuhhada Chowk, Farid Town, Sahiwal</span>
          <span className="flex gap-4">
            <a href="tel:03457345203" className="hover:text-gold transition-colors"><i className="fas fa-phone text-gold mr-1"></i> 0345-7345203</a>
            <a href="tel:0404555203" className="hover:text-gold transition-colors"><i className="fas fa-phone-volume text-gold mr-1"></i> 040-4555203</a>
          </span>
        </div>
      </div>
      {/* Navbar */}
      <nav className={`sticky top-0 z-50 bg-background transition-all duration-300 ${scrolled ? 'shadow-hope-md bg-background/97 backdrop-blur-lg' : 'shadow-hope-sm'}`}>
        <div className="container flex items-center justify-between h-[70px]">
          <Link to="/" className="flex items-center" aria-label="HOPE Preparations">
            <img src={hopeLogoHeader} alt="HOPE Preparations - House of Progressive Education" className="h-12 md:h-14 w-auto object-contain" />
          </Link>
          <ul className={`md:flex items-center gap-1 ${menuOpen ? 'flex flex-col absolute top-[70px] left-0 right-0 bg-background shadow-hope-lg p-5 gap-1 z-50' : 'hidden'}`}>
            {[
              { to: '/', label: 'Home' },
              { to: '/#about', label: 'About' },
              { to: '/#courses', label: 'Courses' },
              { to: '/#faculty', label: 'Faculty' },
              { to: '/#schedule', label: 'Schedule' },
              { to: '/#admissions', label: 'Admissions' },
              { to: '/#contact', label: 'Contact' },
            ].map(item => (
              <li key={item.label}>
                <a href={item.to} className="block px-3.5 py-2 text-sm font-bold text-text-dark rounded-lg hover:text-accent hover:bg-accent/5 transition-all" onClick={() => setMenuOpen(false)}>
                  {item.label}
                </a>
              </li>
            ))}
            <li>
              {user ? (
                <button onClick={() => navigate(role === 'admin' ? '/admin' : '/student')} className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-bold hover:bg-accent transition-colors">
                  <i className="fas fa-tachometer-alt mr-1"></i> Dashboard
                </button>
              ) : (
                <Link to="/login" className="bg-primary text-primary-foreground rounded-full px-5 py-2 text-sm font-bold hover:bg-accent transition-colors" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-user mr-1"></i> Login
                </Link>
              )}
            </li>
          </ul>
          <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
            <span className={`block w-6 h-0.5 bg-text-dark rounded transition-transform ${menuOpen ? 'translate-y-2 rotate-45' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-text-dark rounded transition-opacity ${menuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block w-6 h-0.5 bg-text-dark rounded transition-transform ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`}></span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
