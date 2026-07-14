"use client";
import React, { useEffect, useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useRouter } from 'next/navigation';

const Analytics = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [tasks, setTasks] = useState([]);
  const [trends, setTrends] = useState([]);
  const [pulse, setPulse] = useState([]);
  const [intervention, setIntervention] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const [tasksRes, trendsRes, pulseRes, intRes] = await Promise.all([
          fetch('/api/tasks/all'),
          fetch('/api/analytics/trends'),
          fetch('/api/analytics/iot-pulse'),
          fetch('/api/analytics/intervention-rate')
        ]);
        
        const tasksData = await tasksRes.json();
        const trendsData = await trendsRes.json();
        const pulseData = await pulseRes.json();
        const intData = await intRes.json();

        if (tasksData.success) setTasks(tasksData.tasks);
        if (trendsData.success) setTrends(trendsData.trends);
        if (pulseData.success) setPulse(pulseData.pulse);
        if (intData.success) setIntervention(intData.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
    // Micro-interactions for heat cells
    const heatCells = document.querySelectorAll('.heat-cell');
    heatCells.forEach(cell => {
        cell.addEventListener('mouseenter', () => {
            // Potential to show a tooltip or more details
        });
    });
  }, []);

  return (
    <div className="px-gutter py-8 max-w-[1440px] mx-auto pb-24">
      {/* Header Section */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{t('analyticsTitle')}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            {t('analyticsDesc')}
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-secondary-container text-on-secondary-container px-6 py-2 rounded-full font-bold flex items-center gap-2 border border-secondary">
            <span className="material-symbols-outlined" data-icon="calendar_month">calendar_month</span>
            {t('last30Days')}
          </div>
        </div>
      </div>

      {/* Bento Grid Content */}
      <div className="grid grid-cols-12 gap-card-gap">
        {/* Class-wide Concept Mastery Heatmap (Large Card) */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-lg border border-outline-variant p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">Riwayat Tugas Latihan Khusus</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">Pantau status tugas terbaru yang telah diberikan kepada siswa.</p>
            </div>
            <span className="material-symbols-outlined text-primary text-4xl bg-primary-container/30 p-2 rounded-lg">assignment</span>
          </div>

          {/* Task List */}
          <div className="flex flex-col gap-4 flex-grow overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col gap-4 animate-pulse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-surface-container rounded-xl"></div>
                ))}
              </div>
            ) : tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl mb-2 opacity-50">inbox</span>
                <p>Belum ada tugas khusus yang diberikan.</p>
              </div>
            ) : tasks.map((task) => {
              const isCompleted = task.status === 'completed';
              return (
                <div key={task.id} onClick={() => router.push(`/tasks/${task.id}`)} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-outline-variant rounded-xl hover:bg-surface-container transition-colors cursor-pointer shrink-0 gap-2 sm:gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${isCompleted ? 'bg-surface-container-high text-on-surface-variant' : 'bg-primary-container text-primary'}`}>
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-on-surface text-label-lg truncate">{task.title}</h3>
                      <p className="text-label-sm text-on-surface-variant truncate">
                        Diberikan ke {task.student_name} ({task.student_grade || '-'}) • {new Date(task.created_at).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>
                    <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-start gap-2 pl-16 sm:pl-0 mt-1 sm:mt-0">
                    {isCompleted ? (
                      <>
                        <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span> Sudah Dinilai
                        </span>
                        <span className="text-label-sm font-bold shrink-0">Rata-rata: {task.score || 0}</span>
                      </>
                    ) : (
                      <span className="bg-tertiary-container/30 text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shrink-0">
                        <span className="material-symbols-outlined text-[12px]">schedule</span> Menunggu Nilai
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => router.push('/tasks')}
            className="w-full mt-6 py-3 border-2 border-outline-variant text-on-surface-variant rounded-full font-bold text-label-md hover:bg-surface-container transition-colors flex items-center justify-center gap-2"
          >
            Lihat Semua Tugas Khusus
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
        </div>

        {/* Engagement Pulse (Smaller Card) */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-lg border border-outline-variant p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="mb-6">
            <h2 className="font-headline-md text-headline-md text-secondary">{t('engagementPulse')}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">{t('classInteractivity')}</p>
          </div>
            <div className="flex flex-col gap-6">
              <div className="flex items-end justify-between h-32 gap-2">
                {pulse.length > 0 ? pulse.map((p, index) => {
                  const maxCount = Math.max(...pulse.map(x => Number(x.count)), 10);
                  const percentage = Math.max(10, Math.round((Number(p.count) / maxCount) * 100));
                  const isToday = index === pulse.length - 1;
                  return (
                    <div key={index} className={`w-full ${isToday ? 'bg-primary-container' : 'bg-secondary-container'} rounded-t-full transition-all hover:opacity-80`} style={{height: `${percentage}%`}} title={`${p.count} interaksi`}></div>
                  );
                }) : (
                  <>
                    <div className="w-full bg-secondary-container rounded-t-full h-[40%] transition-all hover:h-[50%]"></div>
                    <div className="w-full bg-secondary-container rounded-t-full h-[65%] transition-all hover:h-[75%]"></div>
                    <div className="w-full bg-primary-container rounded-t-full h-[90%] transition-all hover:h-[100%]"></div>
                    <div className="w-full bg-secondary-container rounded-t-full h-[55%] transition-all hover:h-[65%]"></div>
                    <div className="w-full bg-secondary-container rounded-t-full h-[70%] transition-all hover:h-[80%]"></div>
                    <div className="w-full bg-secondary-container rounded-t-full h-[85%] transition-all hover:h-[95%]"></div>
                  </>
                )}
              </div>
              <div className="flex justify-between text-label-sm text-outline px-1">
                {pulse.length > 0 ? pulse.map((p, index) => {
                  const date = new Date(p.day_date);
                  const isToday = index === pulse.length - 1;
                  return <span key={index}>{isToday ? t('today') : date.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                }) : (
                  <>
                    <span>{t('mon')}</span><span>{t('tue')}</span><span>{t('wed')}</span><span>{t('thu')}</span><span>{t('fri')}</span><span>{t('today')}</span>
                  </>
                )}
              </div>
          </div>
          <div className="mt-8 p-4 bg-secondary/5 rounded-lg border border-secondary/10 flex items-center gap-4">
            <div className="bg-secondary p-2 rounded-full text-white">
              <span className="material-symbols-outlined" data-icon="bolt">bolt</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-secondary">{t('insight')}</p>
              <p className="text-body-md font-body-md">{t('insightDesc')}</p>
            </div>
          </div>
        </div>

        {/* Detailed Trend Analytics (Middle Card) */}
        <div className="col-span-12 lg:col-span-7 bg-surface-container-lowest rounded-lg border border-outline-variant p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="font-headline-md text-headline-md text-primary">{t('detailedTrend')}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{t('topicPerformance')}</p>
            </div>
            <div className="flex gap-2">
              <button className="p-2 border border-outline-variant rounded hover:bg-surface-container transition-all">
                <span className="material-symbols-outlined" data-icon="filter_alt">filter_alt</span>
              </button>
            </div>
          </div>
          <div className="space-y-6">
            {trends.length === 0 ? (
               <div className="text-on-surface-variant text-center py-8">Belum ada data nilai topik.</div>
            ) : trends.map((trend, index) => {
              const score = Number(trend.average_score);
              let colorClass = 'primary';
              if (score < 80 && score >= 60) colorClass = 'secondary';
              if (score < 60) colorClass = 'error';

              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md">{trend.topic} <span className="text-[10px] text-on-surface-variant font-normal">({trend.subject})</span></span>
                    <span className={`text-${colorClass} font-bold`}>{score}%</span>
                  </div>
                  <div className="h-4 bg-surface-container-high rounded-full overflow-hidden">
                    <div className={`h-full bg-${colorClass}-container rounded-full border-r-4 border-${colorClass}`} style={{width: `${score}%`}}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Intervention Success Rate (Side Card) */}
        <div className="col-span-12 lg:col-span-5 bg-surface-container-lowest rounded-lg border border-outline-variant p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
          <div className="mb-8">
            <h2 className="font-headline-md text-headline-md text-primary">{t('interventionSuccess')}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">{t('trackingRecovery')}</p>
          </div>
          <div className="flex-grow flex items-center justify-center relative">
            {/* Decorative Circular Progress */}
            <div className="relative w-48 h-48 rounded-full border-8 border-surface-container-high flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-8 border-primary border-t-transparent -rotate-45" style={{
                clipPath: intervention?.total_students > 0 
                  ? `polygon(50% 50%, 50% 0%, ${Math.round((intervention.recovered_count / intervention.total_students) * 100)}% 0%, 100% 100%, 0% 100%, 0% 0%)` 
                  : 'none',
                transform: `rotate(${intervention?.total_students > 0 ? (intervention.recovered_count / intervention.total_students) * 360 - 90 : -90}deg)`
              }}></div>
              <div className="text-center">
                <span className="text-4xl font-bold text-primary">
                  {intervention?.total_students > 0 
                    ? Math.round((intervention.recovered_count / intervention.total_students) * 100) 
                    : 0}%
                </span>
                <p className="text-label-sm font-label-sm">{t('success')}</p>
              </div>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between p-4 bg-primary-container/10 border-l-4 border-primary rounded-r-lg">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" data-icon="check_circle">check_circle</span>
                <span className="font-label-md text-label-md">
                  {intervention?.recovered_count || 0} Siswa Nilai Baik
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-surface-container-low border-l-4 border-outline rounded-r-lg">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-outline" data-icon="pending">pending</span>
                <span className="font-label-md text-label-md">
                  {intervention?.pending_count || 0} Siswa Kurang
                </span>
              </div>
              <button className="text-primary font-bold text-label-md hover:underline">{t('actNow')}</button>
            </div>
          </div>
        </div>

        {/* Bottom Feature: Student Spotlight */}
        <div className="col-span-12 bg-white rounded-lg border border-outline-variant p-6 md:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-section-margin">
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-container rounded-xl flex items-center justify-center shrink-0 border border-dashed border-outline mx-auto md:mx-0">
              <span className="material-symbols-outlined text-5xl md:text-6xl text-outline-variant" data-icon="psychology">psychology</span>
            </div>
            <div className="w-full">
              <h3 className="font-headline-md text-headline-md text-on-surface text-center md:text-left">{t('aiRecEngine')}</h3>
              <p className="font-body-md md:font-body-lg text-body-md md:text-body-lg text-on-surface-variant max-w-3xl mb-6 text-center md:text-left">
                {t('aiRecEngineDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <button className="w-full sm:w-auto bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-[0_4px_0_#134e3a] active:translate-y-1 active:shadow-[0_0px_0_#134e3a] transition-all text-center">{t('generateSlides')}</button>
                <button className="w-full sm:w-auto border border-primary text-primary px-8 py-3 rounded-full font-bold hover:bg-primary/5 transition-all text-center">{t('dismissInsight')}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
