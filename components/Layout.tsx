
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/authContext';
import { useLanguage } from '../services/languageContext';

import { Activity, LayoutDashboard, LogOut, Menu, X, Globe, ChevronRight, ScrollText, Shield, Compass, Stethoscope, User, ChevronDown } from 'lucide-react';
import { LanguageSwitcher } from './LanguageSwitcher';
import NotificationBell from './NotificationBell';

import Button from './Button';
import { Modal } from './Modal';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, content } = useLanguage();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const profileDropdownRef = React.useRef<HTMLDivElement>(null);

  const isLandingPage = location.pathname === '/';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Hide navbar after idle (3 seconds of no movement)
  useEffect(() => {
    let idleTimer: NodeJS.Timeout;
    
    const resetIdleTimer = () => {
      setIsIdle(false);
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        if (window.scrollY > 80) {
          setIsIdle(true);
        }
      }, 3000);
    };

    const events = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, resetIdleTimer));
    
    resetIdleTimer();
    
    return () => {
      clearTimeout(idleTimer);
      events.forEach(event => window.removeEventListener(event, resetIdleTimer));
    };
  }, []);


  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  // Remove old toggle function - now using LanguageSwitcher component

  const scrollToSection = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    if (!isLandingPage) {
      navigate(`/#${id}`);
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { id: 'problem', label: language === 'id' ? 'Masalah' : 'Problem' },
    { id: 'solution', label: language === 'id' ? 'Solusi' : 'Solution' },
    { id: 'how-it-works', label: language === 'id' ? 'Cara Kerja' : 'How It Works' },
    { id: 'tests', label: language === 'id' ? 'Tes' : 'Tests' },
    { id: 'pricing', label: language === 'id' ? 'Harga' : 'Pricing' },
    { id: 'faq', label: 'FAQ' },
  ];

  return (
    <nav className={`fixed top-0 z-50 w-full transition-all duration-300 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm ${
      isVisible && !isIdle ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="mx-auto flex h-16 sm:h-20 max-w-6xl items-center justify-between px-8 sm:px-10 lg:px-12">
        <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg transition-all">
            <Stethoscope className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold text-foreground transition-colors">Diagnospace</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex lg:items-center lg:gap-10">
          {!user || isLandingPage ? (
            <>
              {navLinks.map((link) => (
                <a 
                  key={link.id}
                  href={`#${link.id}`} 
                  onClick={(e) => scrollToSection(e, link.id)} 
                  className="text-sm font-medium transition-colors text-muted-foreground hover:text-primary"
                >
                  {link.label}
                </a>
              ))}
            </>
          ) : (
            <>
              <Link to="/catalog" className="flex items-center gap-2 text-sm font-medium transition-colors text-muted-foreground hover:text-primary">
                <Compass className="h-4 w-4" />
                {content.nav.catalog}
              </Link>
              <Link to="/dashboard" className="flex items-center gap-2 text-sm font-medium transition-colors text-muted-foreground hover:text-primary">
                <LayoutDashboard className="h-4 w-4" />
                {content.nav.dashboard}
              </Link>
            </>
          )}
          
          <LanguageSwitcher variant="default" />

          {user ? (
            <div className="relative flex items-center gap-3 border-l border-border/30 pl-8" ref={profileDropdownRef}>
              <NotificationBell />
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                {user.avatarUrl ? (
                  <img 
                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8000${user.avatarUrl}`}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover border-2 border-primary/20"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold uppercase ${user.avatarUrl ? 'hidden' : ''}`}>
                  {user.name.charAt(0)}
                </div>
                <div className="hidden xl:flex items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">{user.name}</p>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>
              
              {/* Desktop Profile Dropdown */}
              {isProfileDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                  <button 
                    onClick={() => { handleLogout(); setIsProfileDropdownOpen(false); }}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-destructive hover:bg-destructive/10 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    {content.nav.logout}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-5">
              <Button variant="ghost" onClick={() => navigate('/auth')} className="text-muted-foreground">
                {content.nav.login}
              </Button>
              <Button variant="gradient" onClick={() => navigate('/auth')} className="rounded-xl shadow-lg shadow-indigo-500/20">
                {content.nav.signup}
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-5 lg:hidden">
          <LanguageSwitcher variant="compact" />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-foreground">
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="absolute top-16 sm:top-20 left-0 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 p-4 shadow-xl lg:hidden">
          <div className="flex flex-col gap-2">
            {!user || isLandingPage ? (
              <>
                {navLinks.map((link) => (
                  <a 
                    key={link.id}
                    href={`#${link.id}`} 
                    onClick={(e) => scrollToSection(e, link.id)} 
                    className="py-3 px-4 text-sm font-medium text-foreground hover:bg-muted rounded-xl transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </>
            ) : (
              <>
                <Link to="/catalog" onClick={() => setIsMenuOpen(false)} className="py-3 px-4 text-sm font-medium text-foreground hover:bg-muted rounded-xl flex items-center gap-3">
                  <Compass className="h-4 w-4" />
                  {content.nav.catalog}
                </Link>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="py-3 px-4 text-sm font-medium text-foreground hover:bg-muted rounded-xl flex items-center gap-3">
                  <LayoutDashboard className="h-4 w-4" />
                  {content.nav.dashboard}
                </Link>
              </>
            )}
            
            <div className="h-px bg-border my-2" />
            
            {user ? (
              <div className="space-y-2">
                {/* Mobile Profile Section */}
                <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-xl">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `http://localhost:8000${user.avatarUrl}`}
                      alt={user.name}
                      className="h-10 w-10 rounded-full object-cover border-2 border-primary/20"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-sm font-bold uppercase">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                
                <Button onClick={handleLogout} variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-destructive/10">
                  <LogOut className="mr-2 h-4 w-4" /> {content.nav.logout}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} variant="outline" className="w-full">Login</Button>
                <Button onClick={() => { navigate('/auth'); setIsMenuOpen(false); }} variant="gradient" className="w-full">Sign Up Free</Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

interface FooterProps {
    onOpenLegal: (type: 'privacy' | 'terms') => void;
}

const Footer: React.FC<FooterProps> = ({ onOpenLegal }) => {
    const { content, language } = useLanguage();
    const navigate = useNavigate();

    return (
        <footer className="bg-slate-900 pt-16 pb-12">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-12 md:grid-cols-4 lg:gap-16">
                <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-4 cursor-pointer" onClick={() => navigate('/')}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                        <Stethoscope className="h-5 w-5" />
                    </div>
                    <span className="text-lg font-bold text-white">Diagnospace</span>
                </div>
                <p className="text-sm leading-relaxed text-slate-400">
                    {language === 'id' ? 'Memberdayakan individu dengan wawasan berbasis data untuk pertumbuhan berkelanjutan.' : 'Empowering individuals with data-driven insights for continuous growth.'}
                </p>
                </div>
                <div>
                <h3 className="mb-4 text-sm font-semibold text-white">Platform</h3>
                <ul className="space-y-2">
                    <li><button onClick={() => navigate('/catalog')} className="text-sm text-slate-400 hover:text-white transition-colors">Catalog</button></li>
                    <li><a href="#pricing" className="text-sm text-slate-400 hover:text-white transition-colors">{language === 'id' ? 'Harga' : 'Pricing'}</a></li>
                    <li><a href="#faq" className="text-sm text-slate-400 hover:text-white transition-colors">FAQ</a></li>
                </ul>
                </div>
                <div>
                <h3 className="mb-4 text-sm font-semibold text-white">{language === 'id' ? 'Perusahaan' : 'Company'}</h3>
                <ul className="space-y-2">
                    <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{language === 'id' ? 'Tentang Kami' : 'About Us'}</a></li>
                    <li><a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">{language === 'id' ? 'Kontak' : 'Contact'}</a></li>
                </ul>
                </div>
                <div>
                <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
                <ul className="space-y-2">
                    <li>
                        <button onClick={() => onOpenLegal('privacy')} className="text-sm text-slate-400 hover:text-white transition-colors text-left">
                            {content.legal?.privacyTitle || 'Privacy Policy'}
                        </button>
                    </li>
                    <li>
                        <button onClick={() => onOpenLegal('terms')} className="text-sm text-slate-400 hover:text-white transition-colors text-left">
                            {content.legal?.termsTitle || 'Terms of Service'}
                        </button>
                    </li>
                </ul>
                </div>
            </div>
            <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-700 pt-8 md:flex-row">
                <p className="text-xs text-slate-500">
                &copy; 2024 Diagnospace. All rights reserved.
                </p>
            </div>
            </div>
        </footer>
    );
};

export const Layout = ({ children }: React.PropsWithChildren) => {
  const { content } = useLanguage();
  const location = useLocation();
  const [legalDoc, setLegalDoc] = useState<'privacy' | 'terms' | null>(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className={`flex-1 ${location.pathname !== '/' ? 'pt-16 sm:pt-20' : ''}`}>
        {children}
      </main>
      <Footer onOpenLegal={setLegalDoc} />

      <Modal 
        isOpen={!!legalDoc} 
        onClose={() => setLegalDoc(null)} 
        title={legalDoc === 'privacy' ? (content.legal?.privacyTitle || 'Privacy Policy') : (content.legal?.termsTitle || 'Terms of Service')}
      >
        <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-muted rounded-xl border border-border">
                {legalDoc === 'privacy' ? <Shield className="h-6 w-6 text-primary" /> : <ScrollText className="h-6 w-6 text-primary" />}
                <div>
                     <p className="text-sm font-bold text-foreground">Legal Document</p>
                     <p className="text-xs text-muted-foreground">Effective Date: October 2023</p>
                </div>
            </div>
            <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed whitespace-pre-line dark:prose-invert">
                {legalDoc === 'privacy' 
                    ? (content.legal?.privacyContent || 'Loading privacy policy...') 
                    : (content.legal?.termsContent || 'Loading terms of service...')}
            </div>
            <div className="flex justify-end pt-4 border-t border-border">
                <Button onClick={() => setLegalDoc(null)} variant="outline">Close</Button>
            </div>
        </div>
      </Modal>
    </div>
  );
};
