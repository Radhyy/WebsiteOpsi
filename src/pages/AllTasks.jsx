"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AllTasks = () => {
  const router = useRouter();
  const [filter, setFilter] = useState('Semua');
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks/all');
        const data = await res.json();
        if (data.success) {
          // Map backend data to frontend format
          const formattedTasks = data.tasks.map(t => ({
            id: t.id,
            title: t.title,
            target: `${t.student_name} (${t.student_grade || '-'})`,
            time: new Date(t.created_at).toLocaleDateString('id-ID'),
            status: t.status === 'completed' ? 'Sudah Dinilai' : 'Menunggu Nilai',
            score: t.score
          }));
          setTasks(formattedTasks);
        }
      } catch (error) {
        console.error('Error fetching all tasks:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(t => {
    const matchFilter = filter === 'Semua' || t.status === filter;
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase()) || t.target.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="pt-8 pb-12 px-gutter max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all"
        >
          arrow_back
        </button>
        <div>
          <h2 className="text-headline-md font-headline-md font-bold text-primary">Semua Tugas Latihan Khusus</h2>
          <p className="text-body-md text-on-surface-variant">Kelola dan pantau seluruh tugas yang pernah Anda berikan.</p>
        </div>
      </div>

      {/* Tools & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        
        {/* Search */}
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Cari nama tugas atau siswa..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-full pl-12 pr-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
          {['Semua', 'Menunggu Nilai', 'Sudah Dinilai'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full font-bold text-label-sm whitespace-nowrap transition-all border ${
                filter === f 
                  ? 'bg-primary text-on-primary border-primary' 
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant hover:bg-surface-container'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-outline-variant bg-surface-container-low font-bold text-label-md text-on-surface-variant uppercase tracking-wider">
          <div className="col-span-5">Nama Tugas</div>
          <div className="col-span-3">Diberikan Kepada</div>
          <div className="col-span-2">Waktu</div>
          <div className="col-span-2 text-right">Status</div>
        </div>
        
        <div className="divide-y divide-outline-variant/50">
          {isLoading ? (
            <div className="p-8 flex justify-center text-on-surface-variant">Memuat data tugas...</div>
          ) : (
            filteredTasks.map(task => (
              <div key={task.id} onClick={() => router.push(`/tasks/${task.id}`)} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 items-center hover:bg-surface-container transition-colors cursor-pointer group">
                
                {/* Mobile View / Desktop Col 1 */}
                <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${task.status === 'Menunggu Nilai' ? 'bg-tertiary-container text-tertiary' : 'bg-primary/10 text-primary'}`}>
                    <span className="material-symbols-outlined">description</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-surface text-label-lg group-hover:text-primary transition-colors">{task.title}</h3>
                    <div className="md:hidden flex flex-col gap-1 mt-1 text-label-sm text-on-surface-variant">
                      <span>Target: {task.target}</span>
                      <span>{task.time}</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Columns */}
                <div className="hidden md:block col-span-3 text-body-md text-on-surface">
                  {task.target}
                </div>
                <div className="hidden md:block col-span-2 text-label-sm text-on-surface-variant">
                  {task.time}
                </div>

                {/* Status Column */}
                <div className="col-span-1 md:col-span-2 flex flex-col items-start md:items-end justify-center gap-1">
                  {task.status === 'Menunggu Nilai' ? (
                    <span className="bg-tertiary-container/30 text-tertiary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">schedule</span> Menunggu Nilai
                    </span>
                  ) : (
                    <>
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span> Sudah Dinilai
                      </span>
                      <span className="text-label-sm font-bold mt-1">Rata-rata: {task.score || 0}</span>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        
        {filteredTasks.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">inbox</span>
            <h3 className="text-title-lg font-bold text-on-surface">Tidak Ada Tugas</h3>
            <p className="text-body-md text-on-surface-variant mt-2">Belum ada tugas dengan status tersebut.</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default AllTasks;
