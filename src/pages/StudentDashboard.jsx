"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '../LanguageContext';
import { useRouter } from 'next/navigation';

const StudentDashboard = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/student-dashboard?studentId=2');
        const data = await res.json();
        if (data.success) {
          setDashboardData(data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleConfirmAttendance = async () => {
    if (!dashboardData || !dashboardData.upcomingSchedule || confirming) return;
    
    setConfirming(true);
    try {
      const res = await fetch(`/api/schedules/${dashboardData.upcomingSchedule.id}/confirm`, {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        // Refetch to get updated status
        await fetchDashboard();
      }
    } catch (error) {
      console.error('Error confirming schedule:', error);
    } finally {
      setConfirming(false);
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const { student, pendingTasksCount, latestTask, upcomingSchedule, onlineUsers } = dashboardData || {};

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      
      {/* Floating Capsule Header */}
      <div className="sticky top-0 z-50 px-4 py-6">
        <header className="bg-white rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-outline-variant/30 px-6 py-3 flex justify-between items-center max-w-[1000px] mx-auto">
          
          {/* Left: Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/student-dashboard')}>
            <div className="w-10 h-10 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined" data-icon="school">school</span>
            </div>
            <h1 className="font-headline-sm text-headline-sm font-extrabold text-on-surface tracking-tight">Smart Learning.</h1>
          </div>
          
          {/* Middle: Links (Mockup like screenshot) */}
          <nav className="hidden md:flex items-center gap-8 text-label-md font-bold text-on-surface-variant">
            <Link href="/student-dashboard" className="text-primary">Beranda</Link>
            <a href="#" className="hover:text-primary transition-colors">Misi Khusus</a>
            <a href="#" className="hover:text-primary transition-colors">Jadwal</a>
            <Link href="/student-settings" className="hover:text-primary transition-colors">Pengaturan</Link>
          </nav>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            
            <div className="hidden md:flex items-center gap-3 border-r border-outline-variant/50 pr-4">
              <button onClick={toggleLanguage} className="flex items-center font-bold text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                {language.toUpperCase()}
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary bg-surface-container">
                {student && (
                  <img src={`https://i.pravatar.cc/150?u=${student.email}`} alt={student.name} className="w-full h-full object-cover" />
                )}
              </div>
            </div>
            
            <button 
              onClick={handleLogout}
              className="bg-[#0f172a] hover:bg-[#1e293b] text-white w-10 h-10 md:w-auto md:px-6 md:py-2.5 rounded-full font-bold text-label-md transition-colors flex items-center justify-center gap-2 shrink-0"
              title="Keluar"
            >
              <span className="hidden md:inline">Keluar</span>
              <span className="material-symbols-outlined text-sm md:text-base">logout</span>
            </button>
          </div>
        </header>
      </div>

      {/* Main Content */}
      <main className="px-4 md:px-gutter max-w-[1000px] mx-auto py-8">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary to-[#4ade80] rounded-3xl p-6 md:p-12 text-white shadow-lg relative overflow-hidden mb-10">
          <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/20 rounded-full blur-2xl"></div>
          <div className="relative z-10 max-w-xl">
            <h1 className="text-headline-md md:text-display-md font-bold mb-4">
              Hi {student?.name.split(' ')[0]}! You have {pendingTasksCount} special mission{pendingTasksCount > 1 ? 's' : ''} today.
            </h1>
            <p className="text-body-md md:text-body-lg text-white/90 mb-8">
              {t('studentDashDesc')}
            </p>
            <button 
              onClick={() => router.push('/student-mission')}
              disabled={pendingTasksCount === 0}
              className="bg-white text-primary px-6 py-3 md:px-8 md:py-4 rounded-full font-bold shadow-[0_4px_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-[0_0px_0_rgba(0,0,0,0.2)] transition-all flex items-center gap-2 text-label-md md:text-label-lg hover:brightness-95 w-full md:w-auto justify-center md:justify-start disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined">play_arrow</span>
              {t('startMission')}
            </button>
          </div>
          
          {/* Illustration placeholder */}
          <div className="flex absolute top-auto bottom-[-30px] right-[-20px] md:top-1/2 md:-translate-y-1/2 md:bottom-auto md:right-12 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full border border-white/30 items-center justify-center pointer-events-none">
            <span className="material-symbols-outlined text-5xl md:text-8xl text-white/30 md:text-white/50">rocket_launch</span>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Left Column (Main Content) */}
          <div className="col-span-1 md:col-span-8 flex flex-col gap-6">
            
            {/* Mission Card */}
            <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">star</span>
                  Today's Special Mission
                </h2>
                {latestTask && (
                  <span className="bg-primary-container text-on-primary-container text-label-sm font-bold px-3 py-1 rounded-full">
                    {latestTask.subject}
                  </span>
                )}
              </div>

              {latestTask ? (
                <div className="flex flex-col md:flex-row gap-6 items-center bg-surface-container-low p-6 rounded-xl border-2 border-primary/20 relative overflow-hidden group hover:border-primary/50 transition-colors cursor-pointer">
                  <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center shrink-0 shadow-inner">
                    <span className="material-symbols-outlined text-4xl text-primary">pie_chart</span>
                  </div>
                  <div className="flex-grow text-center md:text-left">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{latestTask.title}</h3>
                    <p className="text-body-md text-on-surface-variant mb-4">
                      {latestTask.description || 'Guru Anda telah memberikan tugas khusus ini untuk Anda kerjakan.'}
                    </p>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{width: '0%'}}></div>
                    </div>
                  </div>
                  <button 
                    onClick={() => router.push('/student-mission')}
                    className="w-full md:w-auto mt-4 md:mt-0 whitespace-nowrap bg-primary text-on-primary px-6 py-3 rounded-full font-bold shadow-[0_4px_0_#134e3a] active:translate-y-1 active:shadow-[0_0px_0_#134e3a] transition-all"
                  >
                    Let's Go!
                  </button>
                </div>
              ) : (
                <div className="text-center p-8 bg-surface-container-lowest rounded-xl border-2 border-dashed border-outline-variant">
                  <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">task_alt</span>
                  <p className="text-on-surface-variant font-bold">Yeay! Tidak ada tugas hari ini.</p>
                </div>
              )}
            </div>

            {/* Meet Teacher / Scheduling Card */}
            {upcomingSchedule && (
              <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary-container/30 rounded-bl-full"></div>
                
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-6 flex items-center gap-2 relative z-10">
                  <span className="material-symbols-outlined text-primary">calendar_month</span>
                  Jadwal Bimbingan
                </h2>
                
                <p className="text-body-md text-on-surface-variant mb-6 relative z-10">
                  {upcomingSchedule.teacher_name} ingin bertemu denganmu untuk bimbingan khusus.
                  {upcomingSchedule.notes && ` Catatan: ${upcomingSchedule.notes}`}
                </p>

                <div className="flex flex-col md:flex-row items-center gap-4 relative z-10">
                  <div className="bg-primary-container/20 border border-primary/20 p-4 rounded-xl flex flex-grow gap-4 items-center w-full">
                    <div className="w-12 h-12 bg-white rounded-lg flex flex-col items-center justify-center border border-outline-variant shadow-sm shrink-0">
                      <span className="text-xs font-bold text-error uppercase">
                        {new Date(upcomingSchedule.date).toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                      <span className="text-lg font-bold text-on-surface leading-none">
                        {new Date(upcomingSchedule.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-primary mb-1">{upcomingSchedule.location}</h4>
                      <p className="text-label-sm text-on-surface-variant">Pukul {upcomingSchedule.time}</p>
                    </div>
                  </div>

                  {upcomingSchedule.status === 'confirmed' ? (
                    <button 
                      disabled
                      className="w-full md:w-auto whitespace-nowrap bg-green-100 text-green-700 border-2 border-green-500 px-6 py-4 rounded-xl font-bold shadow-[0_4px_0_#22c55e] transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Hadir Terkonfirmasi
                    </button>
                  ) : (
                    <button 
                      onClick={handleConfirmAttendance}
                      disabled={confirming}
                      className="w-full md:w-auto whitespace-nowrap bg-primary text-on-primary px-6 py-4 rounded-xl font-bold shadow-[0_4px_0_#134e3a] active:translate-y-1 active:shadow-[0_0px_0_#134e3a] transition-all hover:brightness-110"
                    >
                      {confirming ? 'Menyimpan...' : 'Konfirmasi Kehadiran'}
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

          {/* Right Column (Sidebar) */}
          <div className="col-span-1 md:col-span-4 flex flex-col gap-6">

            {/* Calendar Widget */}
            <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm">
              <h2 className="font-headline-sm text-headline-sm text-center text-on-surface font-bold mb-4">Calendar</h2>
              <h3 className="text-center font-bold text-on-surface-variant mb-4">July 2026</h3>
              <div className="grid grid-cols-7 text-center gap-y-2 text-label-sm">
                <div className="font-bold text-on-surface-variant">Mon</div>
                <div className="font-bold text-on-surface-variant">Tue</div>
                <div className="font-bold text-on-surface-variant">Wed</div>
                <div className="font-bold text-on-surface-variant">Thu</div>
                <div className="font-bold text-on-surface-variant">Fri</div>
                <div className="font-bold text-on-surface-variant">Sat</div>
                <div className="font-bold text-on-surface-variant">Sun</div>
                
                <div className="text-outline-variant">29</div>
                <div className="text-outline-variant">30</div>
                <div className="text-primary font-bold">1</div>
                <div>2</div>
                <div>3</div>
                <div>4</div>
                <div>5</div>
                
                <div>6</div>
                <div>7</div>
                <div>8</div>
                <div className="bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-sm">9</div>
                <div>10</div>
                <div>11</div>
                <div>12</div>
                
                <div>13</div>
                <div>14</div>
                <div>15</div>
                <div>16</div>
                <div>17</div>
                <div>18</div>
                <div>19</div>
                
                <div>20</div>
                <div>21</div>
                <div>22</div>
                <div>23</div>
                <div>24</div>
                <div>25</div>
                <div>26</div>

                <div>27</div>
                <div>28</div>
                <div>29</div>
                <div>30</div>
                <div>31</div>
                <div className="text-outline-variant">1</div>
                <div className="text-outline-variant">2</div>
              </div>
            </div>

            {/* Online Users Widget */}
            <div className="bg-white border border-outline-variant/50 rounded-2xl p-6 shadow-sm">
              <h2 className="font-headline-sm text-headline-sm text-center text-on-surface font-bold mb-2">Online users</h2>
              <p className="text-center text-label-md text-on-surface-variant mb-6">4 online users (last 5 minutes)</p>
              
              <div className="flex flex-col gap-3">
                {onlineUsers?.length > 0 ? (
                  onlineUsers.map(u => (
                    <div key={u.id} className="flex items-center gap-3 p-2 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-low cursor-pointer transition-colors">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?u=${u.email}`} alt="User" className="w-10 h-10 rounded-full" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-label-md text-on-surface">{u.name}</h4>
                        <p className="text-xs text-on-surface-variant">{u.role === 'teacher' ? 'Guru' : u.grade || 'Siswa'}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-label-sm text-on-surface-variant">Belum ada user yang online.</p>
                )}
                
                <button className="text-primary font-bold text-label-sm w-full py-2 bg-primary-container/20 rounded-lg mt-2 hover:bg-primary-container/40 transition-colors">
                  View all online users
                </button>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 flex justify-around items-center pb-safe pt-2 px-2 z-50 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
        <Link href="/student-dashboard" className="flex flex-col items-center p-2 text-primary">
          <span className="material-symbols-outlined text-2xl mb-1">home</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <Link href="/student-settings" className="flex flex-col items-center p-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl mb-1">settings</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Pengaturan</span>
        </Link>
      </div>

    </div>
  );
};

export default StudentDashboard;
