
"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '../LanguageContext';

const BottomNav = () => {
  const { t } = useLanguage();
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-md border-t border-outline-variant/50 flex items-center justify-around h-16 md:hidden z-40 px-2 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <Link href="/" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="text-[10px] font-bold mt-1">{t('navHome')}</span>
      </Link>
      
      <Link href="/students" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/students' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/students' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
        <span className="text-[10px] font-bold mt-1">{t('navStudents')}</span>
      </Link>
      
      <Link href="/analytics" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/analytics' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/analytics' ? "'FILL' 1" : "'FILL' 0" }}>analytics</span>
        <span className="text-[10px] font-bold mt-1">{t('navAnalytics')}</span>
      </Link>
      
      <Link href="/interventions" className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === '/interventions' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/interventions' ? "'FILL' 1" : "'FILL' 0" }}>psychology</span>
        <span className="text-[10px] font-bold mt-1">{t('navInterventions')}</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
