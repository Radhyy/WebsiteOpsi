"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

const Dashboard = () => {
  const { t } = useLanguage();
  const [metrics, setMetrics] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recs, setRecs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await fetch('/api/dashboard/metrics');
        const data = await res.json();
        if (data.success) {
          setMetrics(data.metrics);
          setChartData(data.chart || []);
          setRecs(data.recommendations || []);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMetrics();

    // Micro-interaction for cards
    const cards = document.querySelectorAll('.card-shadow');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-4px)';
            card.style.transition = 'transform 0.3s ease';
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
        });
    });
  }, []);

  return (
    <div className="pt-8 pb-12 px-gutter max-w-[1440px] mx-auto">
      {/* Welcome Section */}
      <div className="mb-section-margin flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-4">
        <div className="max-w-2xl">
          <h1 className="font-display-lg text-display-lg text-primary mb-2">{t('goodMorning')}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {t('dashboardDesc')}
          </p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
        </div>
      </div>

      {/* Quick Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-card-gap mb-section-margin">
        {/* Metric 1 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant card-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary-container rounded-lg">
              <span className="material-symbols-outlined text-on-primary-container">groups</span>
            </div>
            <span className="material-symbols-outlined text-outline">more_vert</span>
          </div>
          <p className="text-label-md font-label-md text-on-surface-variant mb-1">{t('dailyAttendance')}</p>
          <div className="flex items-end gap-2">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {isLoading ? '...' : `${metrics?.attendance?.present}/${metrics?.attendance?.total}`}
            </h2>
            <span className="text-primary font-bold text-sm mb-1 flex items-center">
              <span className="material-symbols-outlined text-sm">arrow_upward</span> 
              {isLoading ? '0' : metrics?.attendance?.percentage}%
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant card-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-secondary-container rounded-lg">
              <span className="material-symbols-outlined text-on-secondary-container">touch_app</span>
            </div>
          </div>
          <p className="text-label-md font-label-md text-on-surface-variant mb-1">{t('responseRate')}</p>
          <div className="flex items-end gap-2">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {isLoading ? '...' : `${metrics?.responseRate?.rate}%`}
            </h2>
            <span className="text-primary font-bold text-sm mb-1">
              {isLoading ? '...' : metrics?.responseRate?.trend}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant card-shadow cursor-pointer relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-container/30 rounded-bl-full -z-10"></div>
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-tertiary-container rounded-lg">
              <span className="material-symbols-outlined text-on-tertiary-container">mood</span>
            </div>
          </div>
          <p className="text-label-md font-label-md text-on-surface-variant mb-1">{t('classroomMood')}</p>
          <div className="flex items-end gap-2">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">
              {isLoading ? '...' : metrics?.mood?.level === 'High' ? t('high') : 'Low'}
            </h2>
            <span className="text-tertiary font-bold text-sm mb-1">
              {isLoading ? '...' : metrics?.mood?.desc === 'Cheerful' ? t('cheerful') : 'Stressed'}
            </span>
          </div>
        </div>

        {/* Metric 4 (Alert) */}
        <div className="bg-error-container/20 rounded-xl p-6 border border-error/30 card-shadow cursor-pointer">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-error-container rounded-lg">
              <span className="material-symbols-outlined text-error">warning</span>
            </div>
          </div>
          <p className="text-label-md font-label-md text-on-surface-variant mb-1">{t('riskAlerts')}</p>
          <div className="flex items-end gap-2">
            <h2 className="font-headline-lg text-headline-lg text-error">
              {isLoading ? '...' : metrics?.risk?.count}
            </h2>
            <span className="text-error font-bold text-sm mb-1">{t('alert')}</span>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-12 gap-card-gap">
        {/* Left Column: Progress Chart */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-8 card-shadow">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="font-headline-md text-headline-md text-on-surface">{t('weeklyProgress')}</h2>
              <p className="text-body-md text-on-surface-variant">{t('weeklyProgressDesc')}</p>
            </div>
            <select className="bg-surface-container-low border-none rounded-lg px-4 py-2 font-label-md focus:ring-0 cursor-pointer">
              <option>{t('last7Days')}</option>
              <option>{t('last30Days')}</option>
            </select>
          </div>
          
          {/* Chart Area */}
          <div className="h-[300px] w-full flex items-end justify-between gap-4 pt-8">
            {isLoading ? (
              <div className="w-full text-center text-on-surface-variant my-auto">Memuat grafik...</div>
            ) : chartData.length > 0 ? (
              chartData.map((data, idx) => (
                <div key={idx} className="w-full bg-primary-container/40 hover:bg-primary-container rounded-t-lg relative group cursor-pointer transition-colors" style={{ height: data.height }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-surface-container-high px-2 py-1 rounded text-xs font-bold transition-opacity">
                    {data.value}%
                  </div>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-on-surface-variant my-auto">Tidak ada data grafik.</div>
            )}
          </div>
          <div className="flex justify-between w-full mt-4 text-label-sm text-outline border-t border-outline-variant pt-4 px-2">
            {isLoading ? null : chartData.map((data, idx) => (
              <span key={idx}>{data.day}</span>
            ))}
          </div>
        </div>

        {/* Right Column: AI Recommendations */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-card-gap">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 card-shadow flex-grow">
            <h2 className="font-headline-md text-headline-md text-secondary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">psychology</span>
              {t('aiRecommendations')}
            </h2>

            <div className="flex flex-col gap-4">
              {isLoading ? (
                <div className="text-on-surface-variant text-sm text-center py-8">Menganalisis data AI...</div>
              ) : recs.length > 0 ? (
                <>
                  {/* Rec 1 */}
                  <div className="p-4 bg-secondary-container/20 border border-secondary-container rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-label-sm font-bold text-secondary uppercase tracking-wider">{t('diffContent')}</span>
                      <span className="material-symbols-outlined text-secondary text-sm">arrow_forward</span>
                    </div>
                    <h3 className="font-bold text-on-surface mb-1">{recs[0]?.title}</h3>
                    <p className="text-sm text-on-surface-variant mb-3">{recs[0]?.desc}</p>
                    <button className="text-secondary font-bold text-sm hover:underline">{t('assignTask')}</button>
                  </div>

                  {/* Rec 2 */}
                  {recs[1] && (
                    <div className="p-4 bg-tertiary-container/20 border border-tertiary-container rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-label-sm font-bold text-tertiary uppercase tracking-wider">{t('motivationBoost')}</span>
                        <span className="material-symbols-outlined text-tertiary text-sm">arrow_forward</span>
                      </div>
                      <h3 className="font-bold text-on-surface mb-1">{recs[1]?.title}</h3>
                      <p className="text-sm text-on-surface-variant mb-3">{recs[1]?.desc}</p>
                      <button className="text-tertiary font-bold text-sm hover:underline">{t('sendNote')}</button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-on-surface-variant text-sm text-center py-8">Tidak ada rekomendasi saat ini.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
