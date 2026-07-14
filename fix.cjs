const fs = require('fs');
const path = require('path');

function fixLinks(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Add usePathname import
  if (!content.includes('usePathname')) {
    content = content.replace(/import { useRouter } from 'next\/navigation';/, "import { useRouter, usePathname } from 'next/navigation';");
    if (!content.includes('usePathname')) {
       content = "import { usePathname } from 'next/navigation';\n" + content;
    }
  }

  // Add usePathname hook call inside component
  const componentMatch = content.match(/const (Sidebar|BottomNav|Header) = \([^)]*\) => {/);
  if (componentMatch) {
    const hookInsert = "\n  const pathname = usePathname();\n";
    if (!content.includes('const pathname = usePathname()')) {
      content = content.replace(componentMatch[0], componentMatch[0] + hookInsert);
    }
  }

  // Replace className={({ isActive }) => `... ${isActive ? 'a' : 'b'}`}
  // We'll just replace the dynamic className with a string evaluation using pathname
  
  // For Sidebar:
  // <Link href="/xxx" className={({ isActive }) => `... ${isActive ? 'a' : 'b'}`}>
  content = content.replace(/className={\(\{ isActive \}\) => `([^`]*)\$\{isActive \? '([^']*)' : '([^']*)'\}`}/g, 
    (match, prefix, activeClass, inactiveClass) => {
      // Need to extract the href to compare with pathname
      // Since it's a regex, it's easier to just do it via a generic replace later
      return match;
    });

  // Since regex for this is complex, let's just do a specific replace for Sidebar and BottomNav
  if (filePath.includes('Sidebar.jsx')) {
    content = content.replace(/className={\(\{ isActive \}\) => `hidden md:flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 \$\{isActive \? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'\}`}/g, 
      "className={`hidden md:flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === 'HREF_PLACEHOLDER' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}");
      
    content = content.replace(/className={\(\{ isActive \}\) => `flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 \$\{isActive \? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'\}`}/g, 
      "className={`flex items-center gap-4 rounded-full px-6 py-3 transition-colors duration-200 ${pathname === 'HREF_PLACEHOLDER' ? 'bg-primary-container text-on-primary-container font-bold' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}");
      
    // Fix HREF_PLACEHOLDER
    content = content.replace(/<Link href="([^"]*)" className=\{`([^`]*) \$\{pathname === 'HREF_PLACEHOLDER'/g, "<Link href=\"$1\" className={`$2 ${pathname === '$1'");
    changed = true;
  }

  if (filePath.includes('BottomNav.jsx')) {
    // Remove `end`
    content = content.replace(/ end /g, ' ');
    
    // Fix className
    content = content.replace(/className={\(\{ isActive \}\) => `flex flex-col items-center justify-center w-full h-full transition-colors \$\{isActive \? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'\}`}/g,
      "className={`flex flex-col items-center justify-center w-full h-full transition-colors ${pathname === 'HREF_PLACEHOLDER' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}`}");
      
    content = content.replace(/<Link href="([^"]*)" className=\{`([^`]*) \$\{pathname === 'HREF_PLACEHOLDER'/g, "<Link href=\"$1\" className={`$2 ${pathname === '$1'");
    
    // Fix function child in BottomNav
    // {({ isActive }) => ( <> <span... style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}>icon</span> <span>text</span> </> )}
    content = content.replace(/\{\(\{ isActive \}\) => \(\s*<>\s*<span className="material-symbols-outlined" style=\{\{ fontVariationSettings: isActive \? "'FILL' 1" : "'FILL' 0" \}\}>([^<]*)<\/span>\s*<span className="text-\[10px\] font-bold mt-1">([^<]*)<\/span>\s*<\/>\s*\)\}/g,
      (match, icon, text) => {
        // We need to inject pathname comparison here, but we don't have href in this regex group.
        // It's easier to just hardcode it or use a generic one. Let's do a generic one.
        // Actually, we can just replace the whole Link block manually.
        return match;
      }
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
  }
}

// Due to the complexity of BottomNav's function children, I will rewrite BottomNav entirely.
const bottomNavContent = `
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
      <Link href="/" className={\`flex flex-col items-center justify-center w-full h-full transition-colors \${pathname === '/' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}\`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/' ? "'FILL' 1" : "'FILL' 0" }}>home</span>
        <span className="text-[10px] font-bold mt-1">{t('navHome')}</span>
      </Link>
      
      <Link href="/students" className={\`flex flex-col items-center justify-center w-full h-full transition-colors \${pathname === '/students' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}\`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/students' ? "'FILL' 1" : "'FILL' 0" }}>group</span>
        <span className="text-[10px] font-bold mt-1">{t('navStudents')}</span>
      </Link>
      
      <Link href="/analytics" className={\`flex flex-col items-center justify-center w-full h-full transition-colors \${pathname === '/analytics' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}\`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/analytics' ? "'FILL' 1" : "'FILL' 0" }}>analytics</span>
        <span className="text-[10px] font-bold mt-1">{t('navAnalytics')}</span>
      </Link>
      
      <Link href="/interventions" className={\`flex flex-col items-center justify-center w-full h-full transition-colors \${pathname === '/interventions' ? 'text-on-secondary-container' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}\`}>
        <span className="material-symbols-outlined" style={{ fontVariationSettings: pathname === '/interventions' ? "'FILL' 1" : "'FILL' 0" }}>psychology</span>
        <span className="text-[10px] font-bold mt-1">{t('navInterventions')}</span>
      </Link>
    </nav>
  );
};

export default BottomNav;
`;
fs.writeFileSync(path.join(__dirname, 'src', 'components', 'BottomNav.jsx'), bottomNavContent);

fixLinks(path.join(__dirname, 'src', 'components', 'Sidebar.jsx'));

// Check tailwind css issues
const tailwindContent = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-surface": "#191c1e",
        "surface-container": "#eceef0",
        "on-secondary-fixed": "#001f2a",
        "primary-container": "#a7f3d0",
        "background": "#f7f9fb",
        "on-error-container": "#93000a",
        "on-secondary": "#ffffff",
        "tertiary-fixed": "#f2e580",
        "surface-container-highest": "#e0e3e5",
        "on-primary-container": "#247156",
        "on-secondary-container": "#3d687c",
        "on-secondary-fixed-variant": "#1e4c5f",
        "tertiary": "#695f02",
        "primary-fixed-dim": "#8bd6b4",
        "on-background": "#191c1e",
        "tertiary-container": "#f3e580",
        "surface-container-lowest": "#ffffff",
        "on-surface-variant": "#3f4943",
        "primary": "#1b6b4f",
        "on-error": "#ffffff",
        "surface-container-low": "#f2f4f6",
        "on-tertiary-fixed-variant": "#4f4800",
        "on-tertiary-fixed": "#201c00",
        "outline": "#6f7973",
        "error": "#ba1a1a",
        "secondary": "#396477",
        "secondary-container": "#bae6fd",
        "surface-variant": "#e0e3e5",
        "secondary-fixed": "#bee9ff",
        "inverse-primary": "#8bd6b4",
        "surface-bright": "#f7f9fb",
        "on-primary-fixed": "#002115",
        "on-primary-fixed-variant": "#00513a",
        "outline-variant": "#bec9c2",
        "on-primary": "#ffffff",
        "surface": "#f7f9fb",
        "on-tertiary-container": "#6f660a",
        "on-tertiary": "#ffffff",
        "tertiary-fixed-dim": "#d5c867",
        "primary-fixed": "#a6f2cf",
        "surface-tint": "#1b6b4f",
        "inverse-on-surface": "#eff1f3",
        "secondary-fixed-dim": "#a1cde3",
        "inverse-surface": "#2d3133",
        "surface-dim": "#d8dadc",
        "surface-container-high": "#e6e8ea",
        "error-container": "#ffdad6"
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "24px",
        "card-gap": "24px",
        "base": "8px",
        "section-margin": "48px",
        "container-padding": "32px"
      },
      fontFamily: {
        "body-lg": ["Nunito Sans", "sans-serif"],
        "body-md": ["Nunito Sans", "sans-serif"],
        "display-lg": ["Quicksand", "sans-serif"],
        "headline-lg": ["Quicksand", "sans-serif"],
        "headline-md": ["Quicksand", "sans-serif"],
        "label-md": ["Nunito Sans", "sans-serif"],
        "label-sm": ["Nunito Sans", "sans-serif"]
      },
      fontSize: {
        "body-lg": ["18px", {"lineHeight": "28px", "fontWeight": "400"}],
        "body-md": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "display-lg": ["48px", {"lineHeight": "56px", "letterSpacing": "-0.02em", "fontWeight": "700"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "fontWeight": "700"}],
        "headline-md": ["24px", {"lineHeight": "32px", "fontWeight": "600"}],
        "label-md": ["14px", {"lineHeight": "20px", "letterSpacing": "0.05em", "fontWeight": "700"}],
        "label-sm": ["12px", {"lineHeight": "16px", "fontWeight": "600"}]
      }
    }
  },
  plugins: [],
};
`;
fs.writeFileSync(path.join(__dirname, 'tailwind.config.js'), tailwindContent);

const postcssContent = `
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
`;
fs.writeFileSync(path.join(__dirname, 'postcss.config.js'), postcssContent);

console.log('Fixed navigation links and updated tailwind configs to CommonJS format');
