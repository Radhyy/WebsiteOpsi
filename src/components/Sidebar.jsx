"use client";
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../LanguageContext';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const [profilePic, setProfilePic] = useState('https://lh3.googleusercontent.com/aida-public/AB6AXuD1-8wHS5x95bqoZ3fb23lPjAzwQPITtCxdy0oc_1exccBt9h6mtZMhKLPqqRLbyq0nphqk0z_ylPF0b890vZm8f2fnfh3ZDkvbofYic9IwZRNmzxX30iGVonE2lVGBYjWiVRbmz2BZ3F-3UmtzO26VCdHAoQ_-wm5nOxSIY6fiCGWUuM_mrR_lYGIvOji2vaN3iB7BxZMa58Is6tIhBGdbq8Y14mHGGphUNq7N3QWZJGpsRQc7BJ9YBcheS670N8aiejz-yw7P70s8');

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
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[45] md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed left-0 top-0 h-full w-[280px] bg-surface-container-lowest border-r border-dashed border-outline-variant flex flex-col pt-8 pb-24 md:pb-8 px-4 gap-8 z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex flex-col gap-1 px-4 relative">
          {/* Close button for mobile */}
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden absolute -right-2 top-0 p-2 text-on-surface-variant hover:bg-surface-container rounded-full"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        <span className="text-headline-md font-headline-md font-bold text-primary">{t('appName')}</span>
        <span className="text-label-md font-label-md text-on-surface-variant">{t('appSubtitle')}</span>
      </div>
      
      <div className="flex flex-col gap-2 flex-grow mt-4">
        <Link href="/" className={`hidden md:flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === '/' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label-md text-label-md">{t('navHome')}</span>
        </Link>
        <Link href="/students" className={`hidden md:flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === '/students' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">group</span>
          <span className="font-label-md text-label-md">{t('navStudents')}</span>
        </Link>
        <Link href="/analytics" className={`hidden md:flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === '/analytics' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">analytics</span>
          <span className="font-label-md text-label-md">{t('navAnalytics')}</span>
        </Link>
        <Link href="/interventions" className={`hidden md:flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === '/interventions' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">psychology</span>
          <span className="font-label-md text-label-md">{t('navInterventions')}</span>
        </Link>
        <Link href="/timeline" className={`flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === '/timeline' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">auto_stories</span>
          <span className="font-label-md text-label-md">{t('navTimeline')}</span>
        </Link>
        <Link href="/input-score" className={`flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === '/input-score' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">edit_document</span>
          <span className="font-label-md text-label-md">{language === 'en' ? 'Data Input' : 'Input Nilai'}</span>
        </Link>
        <Link href="/score-history" className={`flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === '/score-history' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">history</span>
          <span className="font-label-md text-label-md">{language === 'en' ? 'Score History' : 'Riwayat Nilai'}</span>
        </Link>
        <Link href="/settings" className={`flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === '/settings' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-md text-label-md">{t('navSettings')}</span>
        </Link>
      </div>

      <button className="bg-primary text-on-primary rounded-full px-6 py-4 font-bold shadow-[0_4px_0_#134e3a] active:translate-y-1 active:shadow-[0_0px_0_#134e3a] transition-all flex items-center justify-center gap-2 mx-4">
        <span className="material-symbols-outlined">add</span>
        {t('newAnalysis')}
      </button>
      
      <div className="mt-auto px-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary-container overflow-hidden shrink-0 border border-outline-variant">
           <img className="w-full h-full object-cover" alt="Teacher avatar" src={profilePic}/>
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="text-label-md font-bold text-on-surface truncate">Ms. Sarah</span>
          <span className="text-label-sm text-on-surface-variant truncate">Class 4-B</span>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
