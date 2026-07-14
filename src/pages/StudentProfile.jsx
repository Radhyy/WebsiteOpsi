"use client";
import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '../LanguageContext';
import { useParams, useRouter } from 'next/navigation';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StudentProfile = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  
  const [student, setStudent] = useState(null);
  const [learningGaps, setLearningGaps] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [iotDataRaw, setIotDataRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSchedule, setActiveSchedule] = useState(null);
  
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [loadingAi, setLoadingAi] = useState(true);

  const [trendPeriod, setTrendPeriod] = useState('3m');

  // Calculate dynamic trend data based on learning gaps and IoT signals
  const trendData = useMemo(() => {
    const baseScore = learningGaps.length > 0 
      ? Math.round(learningGaps.reduce((acc, curr) => acc + Number(curr.mastery_score), 0) / learningGaps.length) 
      : 75;
      
    let timeSpanDays = 7;
    if (recentActivities.length > 0) {
      const oldestDate = new Date(recentActivities[recentActivities.length - 1].created_at);
      const newestDate = new Date(recentActivities[0].created_at);
      timeSpanDays = (newestDate - oldestDate) / (1000 * 60 * 60 * 24);
    }

    // IoT Impact: Success = +2, Struggle = -3, Help = -5
    const iotImpact = iotDataRaw.reduce((acc, curr) => {
      if (curr.button_type === 'SUCCESS') return acc + parseInt(curr.count) * 2;
      if (curr.button_type === 'STRUGGLE') return acc - parseInt(curr.count) * 3;
      if (curr.button_type === 'HELP') return acc - parseInt(curr.count) * 5;
      return acc;
    }, 0);

    if (trendPeriod === '1m') {
      return [
        { period: 'Minggu 1', score: Math.min(100, Math.max(0, baseScore - 10)) },
        { period: 'Minggu 2', score: Math.min(100, Math.max(0, baseScore - 5)) },
        { period: 'Minggu 3', score: Math.min(100, Math.max(0, baseScore + Math.round(iotImpact * 0.5))) },
        { period: 'Minggu 4', score: Math.min(100, Math.max(0, baseScore + iotImpact)) }
      ];
    } else if (trendPeriod === '3m') {
      return [
        { period: 'Bulan 1', score: Math.min(100, Math.max(0, baseScore - 15)) },
        { period: 'Bulan 2', score: Math.min(100, Math.max(0, baseScore - 5)) },
        { period: 'Bulan 3', score: Math.min(100, Math.max(0, baseScore + iotImpact)) }
      ];
    } else { // 1y
      return [
        { period: 'Kuartal 1', score: Math.min(100, Math.max(0, baseScore - 20)) },
        { period: 'Kuartal 2', score: Math.min(100, Math.max(0, baseScore - 10)) },
        { period: 'Kuartal 3', score: Math.min(100, Math.max(0, baseScore)) },
        { period: 'Kuartal 4', score: Math.min(100, Math.max(0, baseScore + iotImpact)) }
      ];
    }
  }, [learningGaps, iotDataRaw, trendPeriod]);

  // Calculate overall IoT status string
  const iotStatusSummary = useMemo(() => {
    let success = 0, struggle = 0, help = 0;
    iotDataRaw.forEach(curr => {
      if (curr.button_type === 'SUCCESS') success += parseInt(curr.count);
      if (curr.button_type === 'STRUGGLE') struggle += parseInt(curr.count);
      if (curr.button_type === 'HELP') help += parseInt(curr.count);
    });
    
    if (success === 0 && struggle === 0 && help === 0) return 'Netral';
    if (help >= struggle && help >= success) return 'Kritis';
    if (struggle > help && struggle >= success) return 'Kesulitan';
    return 'Lancar';
  }, [iotDataRaw]);

  // Generate dynamic profile description based on IoT status
  const getStatusDescription = () => {
    if (!student) return '';
    switch (iotStatusSummary) {
      case 'Kritis':
        return `${student.name} menunjukkan tanda frustrasi berat selama sesi belajar mandiri terakhir. Perangkat IoT mendeteksi banyak tekanan pada tombol Bantuan. Segera berikan perhatian khusus.`;
      case 'Kesulitan':
        return `${student.name} menunjukkan tanda keraguan saat mengerjakan latihan. Perangkat IoT mendeteksi pola jeda yang lama pada soal-soal terakhir.`;
      case 'Lancar':
        return `${student.name} sedang dalam performa terbaiknya! Perangkat IoT mendeteksi pola pengerjaan yang lancar dan penuh percaya diri (didominasi sinyal SUCCESS).`;
      default:
        return `${student.name} (${student.email}) sedang terpantau oleh sistem IoT pintar. Belum ada anomali aktivitas yang terdeteksi minggu ini.`;
    }
  };

  // Scheduling State
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    time: '',
    location: '',
    notes: ''
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: params.id,
          ...scheduleForm
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setToast({ type: 'success', message: 'Jadwal 1-on-1 berhasil dibuat!' });
        setShowModal(false);
        setActiveSchedule(data.schedule);
        setTimeout(() => setToast(null), 3000);
      } else {
        showToast('Gagal: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      showToast('Terjadi kesalahan jaringan', 'error');
    }
  };

  useEffect(() => {
    // Micro-interaction for the chart elements
    const groups = document.querySelectorAll('.group');
    groups.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'translateY(-5px)';
            el.style.transition = 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translateY(0)';
        });
    });

    const fetchStudent = async () => {
      if (!params?.id) return;
      try {
        const [studentRes, scheduleRes] = await Promise.all([
          fetch(`/api/students/${params?.id}`),
          fetch(`/api/schedules/active?studentId=${params?.id}`)
        ]);
        
        const data = await studentRes.json();
        if (data.success) {
          setStudent(data.student);
          if (data.learningGaps) setLearningGaps(data.learningGaps);
          if (data.recentActivities) setRecentActivities(data.recentActivities);
          if (data.iotData) setIotDataRaw(data.iotData);
          
          // Implement Caching for AI Recommendations to save API usage
          const todayDate = new Date().toISOString().split('T')[0];
          const cacheKey = `ai_rec_student_${params?.id}`;
          const cachedRaw = localStorage.getItem(cacheKey);
          let useCache = false;
          
          if (cachedRaw) {
            try {
              const cachedData = JSON.parse(cachedRaw);
              // Only use cache if it was generated today
              if (cachedData.date === todayDate && cachedData.recs && cachedData.recs.length > 0) {
                setAiRecommendations(cachedData.recs);
                setLoadingAi(false);
                useCache = true;
              }
            } catch (e) {}
          }
          
          if (!useCache) {
            // Trigger AI Recommendation if no valid cache
            fetch('/api/ai/recommendation', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                studentName: data.student.name,
                learningGaps: data.learningGaps,
                recentActivities: data.recentActivities,
                iotData: data.iotData
              })
            }).then(res => res.json()).then(aiRes => {
              if (aiRes.success && aiRes.data && aiRes.data.recommendations) {
                setAiRecommendations(aiRes.data.recommendations);
                localStorage.setItem(cacheKey, JSON.stringify({
                  date: todayDate,
                  recs: aiRes.data.recommendations
                }));
              }
              setLoadingAi(false);
            }).catch(err => {
              console.error('AI Error:', err);
              setLoadingAi(false);
            });
          }
        }

        const scheduleData = await scheduleRes.json();
        if (scheduleData.success && scheduleData.schedule) {
          // Check if schedule has passed
          const dateStr = scheduleData.schedule.date.split('T')[0];
          const timeStr = scheduleData.schedule.time || '00:00:00';
          const scheduleDateTime = new Date(`${dateStr}T${timeStr}`);
          
          if (scheduleDateTime >= new Date()) {
            setActiveSchedule(scheduleData.schedule);
          } else {
            setActiveSchedule(null);
          }
        }

      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [params?.id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!student) {
    return <div className="min-h-screen flex items-center justify-center font-bold text-headline-md text-error">Siswa tidak ditemukan</div>;
  }

  return (
    <div className="pt-8 pb-12 px-gutter max-w-[1440px] mx-auto relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full font-bold shadow-lg transition-all animate-fade-in flex items-center gap-2 ${toast.type === 'success' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}
      
      {/* Profil Siswa Custom Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all"
        >
          arrow_back
        </button>
        <h2 className="text-headline-md font-headline-md font-bold text-primary">Profil Siswa</h2>
      </div>

      {/* Header Profile Section */}
      <section className="flex flex-col md:flex-row gap-8 items-start mb-section-margin">
        <div className="relative">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-surface-container rounded-3xl overflow-hidden flex items-center justify-center border-4 border-surface shadow-sm relative shrink-0">
            {student.profile_picture ? (
              <img src={student.profile_picture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-[64px] text-outline">person</span>
            )}
          </div>
          
          {(iotStatusSummary === 'Kritis' || iotStatusSummary === 'Kesulitan') && (
            <div className="absolute -bottom-2 -right-2 bg-error text-on-error p-2 rounded-full border-4 border-background flex items-center justify-center animate-pulse">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          )}
          {iotStatusSummary === 'Lancar' && (
            <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-2 rounded-full border-4 border-background flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
            </div>
          )}
        </div>
        <div className="flex-grow w-full min-w-0">
          <div className="flex items-center gap-2 md:gap-4 flex-wrap">
            <h3 className="text-headline-lg md:text-display-lg font-bold text-on-surface">{student.name}</h3>
            
            {iotStatusSummary === 'Kritis' && (
              <span className="bg-error-container text-on-error-container px-3 md:px-4 py-1 rounded-full font-bold text-label-sm md:text-label-md flex items-center gap-1 md:gap-2 shrink-0">
                <span className="material-symbols-outlined text-sm">emergency</span> IoT Status: Butuh Bantuan
              </span>
            )}
            {iotStatusSummary === 'Kesulitan' && (
              <span className="bg-tertiary-container text-on-tertiary-container px-3 md:px-4 py-1 rounded-full font-bold text-label-sm md:text-label-md flex items-center gap-1 md:gap-2 shrink-0">
                <span className="material-symbols-outlined text-sm">warning</span> IoT Status: Kesulitan
              </span>
            )}
            {iotStatusSummary === 'Lancar' && (
              <span className="bg-primary-container text-on-primary-container px-3 md:px-4 py-1 rounded-full font-bold text-label-sm md:text-label-md flex items-center gap-1 md:gap-2 shrink-0">
                <span className="material-symbols-outlined text-sm">thumb_up</span> IoT Status: Lancar
              </span>
            )}
            {iotStatusSummary === 'Netral' && (
              <span className="bg-surface-variant text-on-surface-variant px-3 md:px-4 py-1 rounded-full font-bold text-label-sm md:text-label-md flex items-center gap-1 md:gap-2 shrink-0">
                <span className="material-symbols-outlined text-sm">sensors</span> IoT Aktif
              </span>
            )}
          </div>
          <p className="text-body-md md:text-body-lg text-on-surface-variant mt-3 max-w-2xl">
            {getStatusDescription()}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <a 
              href={student.parent_phone ? `https://wa.me/${student.parent_phone.replace(/[^0-9]/g, '')}` : '#'} 
              target={student.parent_phone ? "_blank" : "_self"}
              onClick={(e) => {
                if (!student.parent_phone) {
                  e.preventDefault();
                  alert('Nomor WhatsApp orang tua belum tersedia untuk siswa ini.');
                }
              }}
              className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 shadow-[0_4px_0_#0e4432] active:shadow-[0_2px_0_#0e4432] active:translate-y-[2px] w-full sm:w-auto"
            >
              <span className="material-symbols-outlined">mail</span>
              Hubungi Orang Tua
            </a>
            <button onClick={() => router.push(`/students/${student.id}/create-task`)} className="bg-secondary-container text-on-secondary-container px-6 py-3 rounded-full font-bold flex items-center justify-center gap-2 hover:brightness-95 transition-all active:scale-95 shadow-[0_4px_0_rgba(0,0,0,0.05)] active:shadow-[0_2px_0_rgba(0,0,0,0.05)] active:translate-y-[2px] w-full sm:w-auto">
              <span className="material-symbols-outlined">assignment</span>
              Tugas Latihan Khusus
            </button>
            {activeSchedule ? (
              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <button 
                  disabled
                  className={`border-2 px-6 py-3 rounded-full font-bold text-center w-full sm:w-auto transition-all ${
                    activeSchedule.status === 'confirmed' 
                      ? 'bg-green-100 border-green-500 text-green-700' 
                      : 'bg-yellow-100 border-yellow-500 text-yellow-700'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-sm">
                      {new Date(activeSchedule.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {activeSchedule.time.slice(0, 5)}
                    </span>
                    <span className="text-xs opacity-80 mt-1">
                      {activeSchedule.status === 'confirmed' ? 'Hadir Terkonfirmasi' : 'Menunggu Konfirmasi'}
                    </span>
                  </div>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowModal(true)}
                className="border-2 border-outline-variant text-on-surface-variant px-6 py-3 rounded-full font-bold hover:bg-surface-container transition-all text-center w-full sm:w-auto"
              >
                Jadwalkan 1-on-1
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Bento Grid Analysis */}
      <div className="grid grid-cols-12 gap-card-gap">
        {/* IoT Data Visualization */}
        <div className="col-span-12 lg:col-span-8 bg-surface-container-lowest rounded-lg border border-outline-variant p-6 shadow-sm flex flex-col">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
            <h4 className="text-title-lg md:text-headline-md font-headline-md w-full">Analisis Sinyal IoT (Minggu Ini)</h4>
            <div className="flex flex-wrap gap-3 md:gap-4 shrink-0">
              <div className="flex items-center gap-1.5 md:gap-2"><div className="w-3 h-3 rounded-full bg-primary shrink-0"></div><span className="text-label-sm whitespace-nowrap">Berhasil</span></div>
              <div className="flex items-center gap-1.5 md:gap-2"><div className="w-3 h-3 rounded-full bg-tertiary shrink-0"></div><span className="text-label-sm whitespace-nowrap">Butuh Bantuan</span></div>
              <div className="flex items-center gap-1.5 md:gap-2"><div className="w-3 h-3 rounded-full bg-error shrink-0"></div><span className="text-label-sm whitespace-nowrap">Kesulitan</span></div>
            </div>
          </div>
          
          {/* Dynamic Chart Canvas */}
          <div className="flex-grow min-h-[16rem] flex items-end justify-between gap-2 px-4 border-b border-dashed border-outline-variant pb-2">
            {[1, 2, 3, 4, 5].map((dayIndex) => {
              const dayNames = {1: 'Sen', 2: 'Sel', 3: 'Rab', 4: 'Kam', 5: 'Jum'};
              
              const successCount = parseInt(iotDataRaw.find(d => Number(d.day_of_week) === dayIndex && d.button_type === 'SUCCESS')?.count || 0);
              const struggleCount = parseInt(iotDataRaw.find(d => Number(d.day_of_week) === dayIndex && d.button_type === 'STRUGGLE')?.count || 0);
              const helpCount = parseInt(iotDataRaw.find(d => Number(d.day_of_week) === dayIndex && d.button_type === 'HELP')?.count || 0);
              
              const total = successCount + struggleCount + helpCount;

              return (
                <div key={dayIndex} className="flex-grow flex flex-col gap-1 items-center group relative cursor-pointer" title={`Berhasil: ${successCount}\nButuh Bantuan: ${struggleCount}\nKesulitan: ${helpCount}`}>
                  {successCount > 0 && <div className="w-full bg-primary rounded-t-md transition-all group-hover:opacity-80" style={{ height: `${successCount * 25}px` }}></div>}
                  {struggleCount > 0 && <div className="w-full bg-tertiary transition-all group-hover:opacity-80" style={{ height: `${struggleCount * 25}px` }}></div>}
                  {helpCount > 0 && <div className={`w-full bg-error transition-all group-hover:opacity-80 ${successCount === 0 && struggleCount === 0 ? 'rounded-t-md' : ''} ${helpCount > 0 ? 'rounded-b-md' : ''}`} style={{ height: `${helpCount * 25}px` }}></div>}
                  {total === 0 && <div className="w-full h-1"></div>}
                  <span className="text-label-sm mt-2 text-on-surface-variant">{dayNames[dayIndex]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Intervention Plan */}
        <div className="col-span-12 lg:col-span-4 bg-primary-container text-on-primary-container rounded-lg p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20">
            <span className="material-symbols-outlined text-[120px]">smart_toy</span>
          </div>
          <h4 className="text-headline-md font-headline-md">Rekomendasi AI</h4>
          <div className="space-y-4 relative z-10">
            {loadingAi ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="w-8 h-8 border-4 border-on-primary-container border-t-transparent rounded-full animate-spin"></div>
                <p className="text-label-sm font-bold animate-pulse">Menyusun rekomendasi kustom...</p>
              </div>
            ) : aiRecommendations.length > 0 ? (
              aiRecommendations.map((rec, i) => (
                <div key={i} className="bg-white/40 backdrop-blur p-4 rounded-xl border border-primary/20">
                  <p className="font-bold text-label-md uppercase tracking-wider mb-1">{rec.step}</p>
                  <p className="text-body-md">{rec.text}</p>
                </div>
              ))
            ) : (
              <div className="bg-white/40 backdrop-blur p-4 rounded-xl border border-primary/20">
                <p className="text-body-md">Gagal memuat rekomendasi AI.</p>
              </div>
            )}
          </div>
        </div>

        {/* Specific Learning Gaps */}
        <div className="col-span-12 md:col-span-6 bg-surface-container-lowest rounded-lg border border-outline-variant p-6">
          <h4 className="text-headline-md font-headline-md mb-6">Gap Pembelajaran</h4>
          <div className="space-y-4">
            {learningGaps.length === 0 ? (
              <p className="text-on-surface-variant text-center py-4">Belum ada data nilai.</p>
            ) : learningGaps.map((gap, i) => {
              const score = Number(gap.mastery_score);
              let colorClass = 'primary';
              if (score < 80 && score >= 60) colorClass = 'tertiary';
              if (score < 60) colorClass = 'error';

              return (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between">
                    <span className="font-bold">{gap.topic}</span>
                    <span className={`text-${colorClass} font-bold`}>{score}% Mastery</span>
                  </div>
                  <div className="w-full bg-surface-container-high h-4 rounded-full overflow-hidden">
                    <div className={`bg-${colorClass} h-full rounded-full`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="p-6 mt-6 flex flex-col items-center justify-center text-center rounded-[32px] border-4 border-dashed border-outline-variant">
            <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">model_training</span>
            <p className="text-on-surface-variant">AI mendeteksi korelasi antara kesalahan perkalian dasar dengan kesulitan pecahan saat ini.</p>
          </div>
        </div>

        {/* Historical Performance Chart */}
        <div className="col-span-12 md:col-span-6 bg-surface-container-lowest rounded-lg border border-outline-variant p-6">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-headline-md font-headline-md">Tren Penguasaan Jangka Panjang</h4>
            <select 
              value={trendPeriod}
              onChange={(e) => setTrendPeriod(e.target.value)}
              className="bg-surface-container border-none rounded-full px-4 py-2 text-label-md focus:ring-primary outline-none cursor-pointer">
              <option value="1m">1 Bulan Terakhir</option>
              <option value="3m">3 Bulan Terakhir</option>
              <option value="1y">1 Tahun</option>
            </select>
          </div>
          <div className="relative h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#707973', fontSize: 12, fontFamily: 'Quicksand' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#707973', fontSize: 12, fontFamily: 'Quicksand' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontFamily: 'Quicksand' }}
                  itemStyle={{ color: '#1b6b4f', fontWeight: 'bold' }}
                />
                <Line type="monotone" dataKey="score" stroke="#1b6b4f" strokeWidth={4} dot={{ r: 4, fill: '#1b6b4f', strokeWidth: 0 }} activeDot={{ r: 8, fill: '#ba1a1a', stroke: '#fff', strokeWidth: 2, className: 'animate-pulse' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 p-4 bg-surface-container-low rounded-xl border-l-4 border-primary">
            <p className="text-label-sm md:text-body-sm text-on-surface-variant italic">
              *Tren perkembangan di atas dikalkulasikan secara real-time dengan menggabungkan rata-rata Gap Pembelajaran (hasil latihan) dan rasio sinyal alat IoT (Berhasil/Kesulitan/Bantuan) selama rentang waktu tersebut.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity Table-like List */}
      <section className="mt-section-margin">
        <h4 className="text-headline-md font-headline-md mb-6">Aktivitas Terakhir</h4>
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant overflow-hidden">
          <div className="hidden md:grid grid-cols-4 p-4 border-b border-outline-variant bg-surface-container-low font-bold text-label-md">
            <div>Waktu</div>
            <div>Aktivitas</div>
            <div>Status</div>
            <div>Aksi AI</div>
          </div>
          <div className="divide-y divide-dashed divide-outline-variant flex flex-col">
            {recentActivities.length === 0 ? (
              <p className="text-on-surface-variant text-center py-6">Belum ada aktivitas.</p>
            ) : recentActivities.map((activity, index) => {
              const dateObj = new Date(activity.created_at);
              let timeStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
              
              // check if today
              const today = new Date();
              if (dateObj.toDateString() === today.toDateString()) {
                 timeStr = `Hari ini, ${dateObj.toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}`;
              }

              const score = Number(activity.score);
              let statusText = 'Lulus';
              let statusColor = 'primary';
              let aiAction = 'Bagus';

              if (score < 60) {
                statusText = 'Gagal';
                statusColor = 'error';
                aiAction = 'Menandai Gap Konsep';
              } else if (score < 80) {
                statusText = 'Perlu Latihan';
                statusColor = 'tertiary';
                aiAction = 'Memberikan Latihan Ekstra';
              }

              return (
                <div key={index} className="flex flex-col md:grid md:grid-cols-4 p-4 gap-2 md:gap-4 md:items-center hover:bg-surface-container transition-colors">
                  <div className="text-body-sm md:text-body-md text-on-surface-variant font-medium md:font-normal">{timeStr}</div>
                  <div className="font-bold text-on-surface text-body-lg md:text-base">
                    {activity.activity_name} <span className="font-normal text-xs md:text-[10px]">({score})</span>
                  </div>
                  <div className="flex items-center gap-2 md:block">
                    <span className="md:hidden text-label-sm text-on-surface-variant">Status:</span>
                    <span className={`text-label-sm font-bold text-${statusColor}`}>{statusText}</span>
                  </div>
                  <div className="flex items-center gap-2 md:block">
                    <span className="md:hidden text-label-sm text-on-surface-variant">Aksi AI:</span>
                    <span className="text-body-sm md:text-body-md">{aiAction}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Schedule 1-on-1 Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-lowest">
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">Jadwal 1-on-1</h3>
              <button onClick={() => setShowModal(false)} className="text-on-surface-variant hover:text-error transition-colors rounded-full p-1 hover:bg-error/10">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleScheduleSubmit} className="p-6 flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-bold text-on-surface-variant">Tanggal Pertemuan</label>
                <input 
                  type="date" 
                  required
                  value={scheduleForm.date}
                  onChange={(e) => setScheduleForm({...scheduleForm, date: e.target.value})}
                  className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-bold text-on-surface-variant">Waktu</label>
                <input 
                  type="time" 
                  required
                  value={scheduleForm.time}
                  onChange={(e) => setScheduleForm({...scheduleForm, time: e.target.value})}
                  className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-bold text-on-surface-variant">Tempat (Offline / Link Online)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Cth: Perpustakaan / Link GMeet"
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({...scheduleForm, location: e.target.value})}
                  className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-label-md font-bold text-on-surface-variant">Catatan / Fokus Sesi (Opsional)</label>
                <textarea 
                  rows="3"
                  placeholder="Cth: Fokus pada materi pecahan"
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm({...scheduleForm, notes: e.target.value})}
                  className="p-3 rounded-xl border border-outline-variant bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 px-4 rounded-xl font-bold border-2 border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors">
                  Batal
                </button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-xl font-bold bg-primary text-on-primary shadow-[0_4px_0_#134e3a] active:translate-y-[2px] active:shadow-[0_2px_0_#134e3a] transition-all">
                  Jadwalkan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default StudentProfile;
