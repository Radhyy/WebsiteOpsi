const fs = require('fs');
const path = require('path');

const appDir = path.join(__dirname, 'src', 'app');
const pagesDir = path.join(__dirname, 'src', 'pages');

if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

// 1. Create Root Layout
const rootLayout = `
import '../index.css';
import { LanguageProvider } from '../LanguageContext';

export const metadata = {
  title: 'Belajar Pintar - Asisten AI',
  description: 'AI-Powered Smart Learning Companion',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
`;
fs.writeFileSync(path.join(appDir, 'layout.jsx'), rootLayout);

// 2. Define Route Mapping (based on App.jsx)
const routeMapping = [
  { route: '/', component: 'Dashboard', isStandalone: false },
  { route: '/login', component: 'Login', isStandalone: true },
  { route: '/students', component: 'StudentMonitoring', isStandalone: false },
  { route: '/students/[id]', component: 'StudentProfile', isStandalone: false },
  { route: '/students/[id]/create-task', component: 'CreateTask', isStandalone: false },
  { route: '/tasks', component: 'AllTasks', isStandalone: false },
  { route: '/analytics', component: 'Analytics', isStandalone: false },
  { route: '/interventions', component: 'InterventionHub', isStandalone: false },
  { route: '/timeline', component: 'Timeline', isStandalone: false },
  { route: '/input-score', component: 'InputScore', isStandalone: false },
  { route: '/add-student', component: 'AddStudent', isStandalone: false },
  { route: '/settings', component: 'TeacherSettings', isStandalone: false },
  { route: '/student-dashboard', component: 'StudentDashboard', isStandalone: true },
  { route: '/student-settings', component: 'StudentSettings', isStandalone: true },
  { route: '/student-mission', component: 'StudentMission', isStandalone: true },
];

// 3. Create route folders and page.jsx
routeMapping.forEach(({ route, component, isStandalone }) => {
  const routePath = route === '/' ? '' : route;
  const targetDir = path.join(appDir, routePath);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  let pageContent = '';
  
  if (isStandalone) {
    pageContent = `
"use client";
import ${component} from '@/pages/${component}';

export default function Page() {
  return (
    <main className="w-full min-h-screen bg-background">
      <${component} />
    </main>
  );
}
`;
  } else {
    pageContent = `
"use client";
import React, { useState } from 'react';
import ${component} from '@/pages/${component}';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex overflow-hidden bg-background min-h-screen font-body-md text-on-surface">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <main className="ml-0 md:ml-[280px] w-full flex-grow h-screen overflow-y-auto bg-background relative pb-16 md:pb-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <${component} />
        <div className="h-24"></div>
        <BottomNav />
        <button className="fixed bottom-20 md:bottom-10 right-4 md:right-10 w-14 h-14 md:w-16 md:h-16 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all primary-button-lift z-40">
          <span className="material-symbols-outlined text-2xl md:text-3xl" data-icon="auto_awesome">auto_awesome</span>
        </button>
      </main>
    </div>
  );
}
`;
  }

  fs.writeFileSync(path.join(targetDir, 'page.jsx'), pageContent);
});

console.log('Migration routing files generated successfully!');
