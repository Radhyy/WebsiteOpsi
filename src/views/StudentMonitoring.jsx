"use client";
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useRouter } from 'next/navigation';

const StudentMonitoring = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Micro-interaction for hover lift on cards
    const initCards = () => {
      const cards = document.querySelectorAll('.glass-card');
      cards.forEach(card => {
          card.addEventListener('mouseenter', () => {
              card.style.transform = 'translateY(-4px)';
              card.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
          });
          card.addEventListener('mouseleave', () => {
              card.style.transform = 'translateY(0)';
          });
      });
    };

    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
        }
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setLoading(false);
        // Add small delay to ensure DOM is updated before binding events
        setTimeout(initCards, 100);
      }
    };

    fetchStudents();
  }, []);

  return (
    <div className="pt-8 pb-12 px-gutter max-w-[1440px] mx-auto">
      {/* Filters & Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-2">{t('studentMonitoringTitle')}</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            {t('studentMonitoringDesc')}
          </p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline mr-2">{t('gradeLabel')}</span>
            <select className="bg-transparent border-none focus:ring-0 text-label-md font-label-md p-0 pr-6 cursor-pointer">
              <option>{t('allGrades')}</option>
              <option>{t('grade4')}</option>
              <option>{t('grade5')}</option>
            </select>
          </div>
          <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full border border-outline-variant">
            <span className="text-label-sm font-label-sm uppercase tracking-wider text-outline mr-2">{t('riskLabel')}</span>
            <select className="bg-transparent border-none focus:ring-0 text-label-md font-label-md p-0 pr-6 cursor-pointer text-error">
              <option>{t('anyStatus')}</option>
              <option>{t('struggling')}</option>
              <option>{t('developing')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bento Grid of Students */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-card-gap">
          
          {students.map((student, index) => {
            const scoreNum = Number(student.average_score) || 0;
            const isStruggling = scoreNum < 60;
            const isDeveloping = scoreNum >= 60 && scoreNum < 80;
            const isMastered = scoreNum >= 80;
            const score = `${scoreNum}%`;
            
            let statusColor = 'primary';
            let statusBadge = t('onTrack');
            let statusText = t('mastered');
            
            if (isStruggling) {
              statusColor = 'error';
              statusBadge = t('struggling');
              statusText = t('needsSupport');
            } else if (isDeveloping) {
              statusColor = 'tertiary';
              statusBadge = t('developing');
              statusText = t('improving');
            }

            return (
              <div key={student.id} className={`glass-card rounded-lg p-6 flex flex-col gap-4 border border-outline-variant hover:border-${statusColor} transition-all group bg-surface-container-lowest`}>
                <div className="flex justify-between items-start">
                  <div className="h-16 w-16 rounded-lg bg-surface-container overflow-hidden border-2 border-outline-variant flex items-center justify-center">
                    {student.profile_picture ? (
                      <img src={student.profile_picture} alt={student.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="material-symbols-outlined text-4xl text-outline">person</span>
                    )}
                  </div>
                  <span className={`bg-${statusColor}-container text-on-${statusColor}-container px-3 py-1 rounded-full text-label-sm font-label-sm`}>{statusBadge}</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">{student.name}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant truncate">{student.email}</p>
                </div>
                <div className={`bg-${statusColor === 'error' ? 'error-container/20' : statusColor === 'tertiary' ? 'tertiary-container/30' : 'surface-container-low'} p-4 rounded-lg flex justify-between items-center border-dashed border ${statusColor === 'error' ? 'border-error/30' : statusColor === 'tertiary' ? 'border-tertiary/40' : 'border-outline-variant'} h-24`}>
                  <div>
                    <p className={`text-label-sm font-label-sm ${statusColor === 'primary' ? 'text-outline' : `text-${statusColor}`} uppercase`}>AVERAGE SCORE</p>
                    <p className={`text-headline-md font-bold text-${statusColor}`}>{score}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-label-sm font-label-sm ${statusColor === 'primary' ? 'text-outline' : `text-${statusColor}`} uppercase`}>{isStruggling ? t('aiAlert') : isDeveloping ? t('trend') : t('status')}</p>
                    <p className={`font-label-md text-${statusColor} font-bold`}>{statusText}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className={`flex-grow py-3 px-2 whitespace-nowrap rounded-full ${isStruggling ? 'bg-error text-on-error shadow-[0_2px_0_#93000a] active:translate-y-0.5 active:shadow-[0_0px_0_#93000a]' : 'bg-surface-container hover:bg-surface-container-high text-on-surface'} font-bold text-label-md transition-colors`}>
                    {isStruggling ? t('quickHelpBtn') : t('historyBtn')}
                  </button>
                  <button onClick={() => router.push(`/students/${student.id}`)} className={`flex-grow py-3 px-2 whitespace-nowrap rounded-full border-2 ${isStruggling ? 'border-outline-variant text-on-surface-variant hover:bg-surface-container' : `border-${statusColor} text-${statusColor} hover:bg-${statusColor}/5`} font-bold text-label-md transition-colors`}>
                    {isStruggling ? t('profileBtn') : t('viewProfileBtn')}
                  </button>
                </div>
              </div>
            );
          })}

          {/* Add Student Placeholder Card */}
          <div onClick={() => router.push('/add-student')} className="rounded-lg p-6 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-outline-variant hover:bg-surface-container-low transition-all cursor-pointer group min-h-[250px]">
            <div className="h-16 w-16 rounded-full bg-surface-container-highest flex items-center justify-center text-outline group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined text-4xl">person_add</span>
            </div>
            <div className="text-center">
              <p className="font-headline-md text-on-surface group-hover:text-primary transition-colors">{t('addStudent')}</p>
              <p className="font-body-md text-on-surface-variant">{t('enrollLearner')}</p>
            </div>
          </div>

        </div>
      )}

      {/* Empty State / Analysis Tip (Bottom Section) */}
      <div className="mt-section-margin bg-secondary-container rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 border-2 border-secondary/20">
        <div className="flex-shrink-0 relative">
          <div className="w-32 h-32 bg-white/50 rounded-full flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-6xl text-secondary">psychology</span>
          </div>
          {/* Micro-interaction dot */}
          <div className="absolute top-0 right-0 w-6 h-6 bg-primary rounded-full border-4 border-secondary-container"></div>
        </div>
        <div className="text-center md:text-left flex-grow">
          <h4 className="font-headline-md text-headline-md text-on-secondary-container mb-2">{t('aiClassInsight')}</h4>
          <p className="font-body-lg text-on-secondary-container/80 max-w-3xl">
            {t('aiClassInsightDesc')}
          </p>
        </div>
        <button className="whitespace-nowrap px-8 py-4 bg-secondary text-on-secondary rounded-full font-bold shadow-lg hover:brightness-110 transition-all active:scale-95">
          {t('generateLessonPlan')}
        </button>
      </div>

    </div>
  );
};

export default StudentMonitoring;
