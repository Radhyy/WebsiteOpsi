
"use client";
import React, { useState } from 'react';
import InterventionHub from '@/pages/InterventionHub';
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
        <InterventionHub />
        <div className="h-24"></div>
        <BottomNav />
        
      </main>
    </div>
  );
}
