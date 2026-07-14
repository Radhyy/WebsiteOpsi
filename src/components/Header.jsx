"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

const Header = ({ onMenuClick }) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [profilePic, setProfilePic] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuBeIRcwJ1Ivk82iI3xvPWi9oSmMG_ugtEBjHapxk8WkVa-DWThObwXIsgo7rfYkoVD0YFri2qqtUgE4WFsuyxV0IqYSN5Fu64sVWhzYKurp6YY93OS4eR7PC-x5bF5Iyxz9erEupwmRFK9cykIF616Ej86Zupt5Y-gHKws8IZg2TGBZwCQgxDG8gXj41fj4XRIHl3aGKsJpfZaJ5BVCUtkwFO-IyTE3HKCv_8w1gj5V797XRxFrcNNyagY9LIJKlh9tg6dj52n3qwEl');

  useEffect(() => {
    const savedPic = localStorage.getItem('profilePic');
    if (savedPic) setProfilePic(savedPic);
    
    const handleUpdate = () => {
      const pic = localStorage.getItem('profilePic');
      if (pic) setProfilePic(pic);
    };
    window.addEventListener('profilePicUpdated', handleUpdate);
    return () => window.removeEventListener('profilePicUpdated', handleUpdate);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-surface/80 backdrop-blur-xl flex justify-between items-center h-20 px-4 md:px-gutter w-full">
      <div className="flex items-center gap-2 md:gap-4 w-full md:w-1/2">
        <button onClick={onMenuClick} className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">search</span>
          <input className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border-2 border-outline-variant focus:border-primary focus:ring-0 rounded-full font-body-md text-body-md transition-all" placeholder={t('searchPlaceholder')} type="text"/>
        </div>
        <button className="hover:bg-surface-container rounded-full p-2 transition-all">
          <span className="material-symbols-outlined text-on-surface-variant">tune</span>
        </button>
      </div>
      <div className="flex items-center gap-4">
        {/* Language Toggle Button */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-1 md:gap-2 hover:bg-surface-container rounded-full px-2 md:px-3 py-1.5 transition-all active:scale-95 duration-150 border border-outline-variant"
          title={language === 'en' ? "Ubah ke Bahasa Indonesia" : "Switch to English"}
        >
          <span className="material-symbols-outlined text-on-surface-variant text-lg md:text-xl">language</span>
          <span className="font-bold text-[10px] md:text-label-sm text-on-surface-variant uppercase">{language}</span>
        </button>

        <button className="hover:bg-surface-container rounded-full p-2 transition-all active:scale-90 duration-150">
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </button>
        <button className="hidden md:block hover:bg-surface-container rounded-full p-2 transition-all active:scale-90 duration-150">
          <span className="material-symbols-outlined text-on-surface-variant">help</span>
        </button>
        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-secondary-container flex items-center justify-center border-2 border-outline-variant overflow-hidden shrink-0">
          <img className="w-full h-full object-cover" alt="Teacher profile" src={profilePic} />
        </div>
      </div>
    </header>
  );
};

export default Header;
