"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

const InterventionHub = () => {
  const { t } = useLanguage();
  const [data, setData] = useState({ group: null, individual: null, history: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const res = await fetch('/api/interventions');
        const json = await res.json();
        if (json.success) {
          setData({
            group: json.group,
            individual: json.individual,
            history: json.history || []
          });
        }
      } catch (error) {
        console.error('Error fetching interventions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInterventions();
  }, []);

  return (
    <div className="pt-8 pb-12 px-gutter max-w-[1440px] mx-auto">
      {/* Dashboard Header */}
      <div className="mb-section-margin flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <h1 className="font-headline-lg text-headline-lg text-primary mb-2">{t('interventionHubTitle')}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {t('interventionHubDesc')}
          </p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-2 rounded-full border-2 border-outline-variant text-on-surface hover:bg-surface-container transition-colors font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">filter_list</span>
            {t('filterBtn')}
          </button>
          <button className="px-6 py-2 rounded-full bg-secondary text-on-secondary hover:brightness-110 active:scale-95 transition-all font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">ios_share</span>
            {t('exportReportBtn')}
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-card-gap">
        {/* SECTION 1: Targeted Interventions (Large Card) */}
        <section className="col-span-12 lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-lg p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary-container rounded-2xl">
                <span className="material-symbols-outlined text-on-primary-container">psychology</span>
              </div>
              <h2 className="text-headline-md font-headline-md">{t('targetedInterventions')}</h2>
            </div>
            <span className="text-label-md bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full">{t('newInsightsCount')}</span>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="p-6 text-center text-on-surface-variant">Memuat data rekomendasi AI...</div>
            ) : (
              <>
                {/* Intervention Item 1 (Group) */}
                {data.group ? (
                  <div className="group p-4 md:p-6 bg-surface-container-low rounded-lg border-2 border-transparent hover:border-primary-fixed-dim transition-all hover:scale-[1.02] cursor-pointer flex flex-col sm:flex-row gap-4 md:gap-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-primary text-[20px] md:text-[24px]">diversity_3</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-2 gap-2 xl:gap-0">
                        <h3 className="font-bold text-base md:text-lg text-on-surface break-words leading-tight">Fokus Topik: {data.group.topic}</h3>
                        <span className="text-label-sm text-error bg-error-container px-2 py-0.5 rounded self-start shrink-0">{t('urgent')}</span>
                      </div>
                      <p className="text-on-surface-variant text-sm md:text-base mb-4">
                        {data.group.recommendation}
                      </p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex -space-x-2 shrink-0">
                          {data.group.students.slice(0, 3).map((student, idx) => (
                            <div key={student.id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold ${idx % 2 === 0 ? 'bg-blue-200 text-blue-800' : 'bg-green-200 text-green-800'}`}>
                              {student.initials}
                            </div>
                          ))}
                          {data.group.students.length > 3 && (
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-800">
                              +{data.group.students.length - 3}
                            </div>
                          )}
                        </div>
                        <span className="text-[11px] md:text-label-sm text-outline-variant leading-tight">Siswa Butuh Bantuan</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-surface-container-low rounded-lg text-center text-on-surface-variant">
                    Tidak ada siswa yang tertinggal dalam topik saat ini. Bagus!
                  </div>
                )}
                
                {/* Intervention Item 2 (Individual) */}
                {data.individual ? (
                  <div className="group p-4 md:p-6 bg-surface-container-low rounded-lg border-2 border-transparent hover:border-primary-fixed-dim transition-all hover:scale-[1.02] cursor-pointer flex flex-col sm:flex-row gap-4 md:gap-6">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                      <span className="material-symbols-outlined text-secondary text-[20px] md:text-[24px]">person</span>
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-2 gap-2 xl:gap-0">
                        <h3 className="font-bold text-base md:text-lg text-on-surface break-words leading-tight">Individu: {data.individual.name}</h3>
                        <span className="text-label-sm text-tertiary bg-tertiary-container px-2 py-0.5 rounded self-start shrink-0">{t('moderate')}</span>
                      </div>
                      <p className="text-on-surface-variant text-sm md:text-base mb-4">
                        {data.individual.issue} {data.individual.recommendation}
                      </p>
                      <div className="flex gap-2">
                         <button className="px-4 py-2 bg-primary/10 text-primary rounded-full font-bold text-xs md:text-label-sm hover:bg-primary/20 transition-colors w-full sm:w-auto text-center">{t('assignSessionBtn')}</button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>
        
        {/* Placeholder for Side Column to balance layout */}
        <section className="col-span-12 lg:col-span-4 flex flex-col gap-card-gap">
           <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <h3 className="font-headline-md mb-4 text-primary">{t('interventionHistory')}</h3>
              <p className="text-body-md text-on-surface-variant mb-6">{t('interventionHistoryDesc')}</p>
              
              <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-sm text-outline">Memuat...</div>
                  ) : data.history.length > 0 ? (
                    data.history.map((hist, idx) => (
                      <div key={idx} className="p-4 border border-outline-variant rounded-lg bg-surface-container-low">
                          <p className="font-bold text-sm text-on-surface mb-1">{hist.title}</p>
                          <p className="text-xs text-outline mb-2">{hist.description}</p>
                          <div className={`flex items-center gap-2 font-bold text-xs ${hist.result === 'Selesai Dikerjakan' ? 'text-primary' : 'text-tertiary'}`}>
                              <span className="material-symbols-outlined text-sm">
                                {hist.result === 'Selesai Dikerjakan' ? 'check_circle' : 'pending'}
                              </span>
                              {hist.result}
                          </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-sm text-outline">Belum ada riwayat.</div>
                  )}
              </div>
           </div>
        </section>
      </div>
    </div>
  );
};

export default InterventionHub;
