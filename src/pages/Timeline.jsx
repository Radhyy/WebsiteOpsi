"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

const Timeline = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');
  const [timelineData, setTimelineData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = [
    { id: 'all', label: t('filterAll') },
    { id: 'ai', label: t('filterAI') },
    { id: 'alert', label: t('filterAlerts') },
    { id: 'action', label: t('filterActions') }
  ];

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await fetch('/api/timeline');
        const data = await res.json();
        if (data.success) {
          setTimelineData(data.timeline);
        }
      } catch (error) {
        console.error('Error fetching timeline:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const filteredData = activeFilter === 'all' 
    ? timelineData 
    : timelineData.filter(item => item.type === activeFilter);

  return (
    <div className="px-4 md:px-gutter py-8 max-w-[1000px] mx-auto pb-24">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{t('timelineTitle')}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            {t('timelineDesc')}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-10 overflow-x-auto pb-2 scrollbar-hide">
        {filters.map(f => (
          <button 
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`whitespace-nowrap px-6 py-2 rounded-full font-bold transition-all border ${
              activeFilter === f.id 
                ? 'bg-primary text-on-primary border-primary shadow-[0_4px_0_#134e3a] active:translate-y-1 active:shadow-[0_0px_0_#134e3a]' 
                : 'bg-surface-container-low text-on-surface border-outline-variant hover:bg-surface-container'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-outline-variant/30 ml-4 md:ml-8 space-y-8 pb-12">
        {isLoading ? (
          <div className="pl-8 text-on-surface-variant font-body-lg">Memuat riwayat aktivitas...</div>
        ) : filteredData.length > 0 ? (
          filteredData.map((item) => (
          <div key={item.id} className="relative pl-8 md:pl-12">
            {/* Timeline dot/icon */}
            <div className={`absolute -left-[1.35rem] md:-left-[1.4rem] top-0 w-10 h-10 md:w-11 md:h-11 rounded-full ${item.iconBg} flex items-center justify-center border-4 border-background shadow-sm`}>
              <span className={`material-symbols-outlined text-lg md:text-xl ${item.iconColor}`}>{item.icon}</span>
            </div>
            
            {/* Content Card */}
            <div className="bg-surface-container-lowest border border-outline-variant p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-2">
                <span className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider bg-surface-container px-3 py-1 rounded-full">
                  {item.date} • {item.time}
                </span>
                {item.hasButton && (
                  <button className="text-primary font-bold text-label-md flex items-center gap-1 hover:underline">
                    {t('viewMorningBriefing')} 
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                )}
              </div>
              <p className="font-body-lg text-body-lg text-on-surface mt-2">{item.content}</p>
            </div>
          </div>
        ))
        ) : (
          <div className="pl-8 text-on-surface-variant font-body-lg">
            Tidak ada aktivitas ditemukan untuk filter ini.
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
