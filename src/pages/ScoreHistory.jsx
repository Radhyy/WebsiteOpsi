"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../LanguageContext';

const ScoreHistory = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const [scores, setScores] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showOnlyZero, setShowOnlyZero] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editScore, setEditScore] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fetchScores = async () => {
    try {
      const res = await fetch('/api/manual-scores');
      const data = await res.json();
      if (data.success) {
        setScores(data.scores);
      }
    } catch (error) {
      console.error('Error fetching scores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleEditClick = (scoreItem) => {
    setEditingId(scoreItem.id);
    setEditScore(scoreItem.score);
    setEditNotes(scoreItem.notes || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditScore('');
    setEditNotes('');
  };

  const handleSaveEdit = async (id) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/manual-scores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          score: Number(editScore),
          notes: editNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        // Update local state
        setScores(scores.map(s => s.id === id ? { ...s, score: Number(editScore), notes: editNotes } : s));
        handleCancelEdit();
      } else {
        alert('Gagal menyimpan nilai');
      }
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Terjadi kesalahan');
    } finally {
      setIsSaving(false);
    }
  };

  let filteredScores = scores.filter(s => 
    s.student_name.toLowerCase().includes(search.toLowerCase()) || 
    s.topic.toLowerCase().includes(search.toLowerCase())
  );

  if (showOnlyZero) {
    filteredScores = filteredScores.filter(s => s.score === 0 || s.score === '0');
  }

  // Group by Subject
  const groupedScores = filteredScores.reduce((acc, scoreItem) => {
    if (!acc[scoreItem.subject]) {
      acc[scoreItem.subject] = [];
    }
    acc[scoreItem.subject].push(scoreItem);
    return acc;
  }, {});

  return (
    <div className="pt-8 pb-12 px-4 md:px-gutter max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()}
          className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all"
        >
          arrow_back
        </button>
        <div>
          <h2 className="text-headline-md font-headline-md font-bold text-primary">Score History / Riwayat Nilai</h2>
          <p className="text-body-md text-on-surface-variant">Pantau seluruh nilai ujian dan tugas yang telah Anda masukkan.</p>
        </div>
      </div>

      {/* Tools & Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="relative w-full md:w-96">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input 
            type="text" 
            placeholder="Cari nama siswa atau topik..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-full pl-12 pr-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all shadow-sm"
          />
        </div>
        
        <label className="flex items-center gap-2 cursor-pointer p-3 bg-surface-container-lowest border border-outline-variant rounded-full hover:bg-surface-container transition-all">
          <input 
            type="checkbox" 
            checked={showOnlyZero}
            onChange={(e) => setShowOnlyZero(e.target.checked)}
            className="w-5 h-5 rounded text-primary focus:ring-primary border-outline-variant cursor-pointer"
          />
          <span className="font-bold text-label-md text-on-surface-variant flex items-center gap-1">
            Tampilkan Nilai 0 Saja
          </span>
        </label>
      </div>

      {/* Score List Grouped by Subject */}
      {isLoading ? (
        <div className="p-12 flex justify-center text-on-surface-variant">Memuat riwayat nilai...</div>
      ) : Object.keys(groupedScores).length === 0 ? (
        <div className="p-12 flex flex-col items-center justify-center text-center bg-surface-container-lowest rounded-xl border border-outline-variant">
          <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">history</span>
          <h3 className="text-title-lg font-bold text-on-surface">Tidak Ada Riwayat Nilai</h3>
          <p className="text-body-md text-on-surface-variant mt-2">Belum ada nilai ujian atau tugas yang diinput.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(groupedScores).map(([subject, subjectScores]) => (
            <div key={subject} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
              {/* Subject Header */}
              <div className="bg-primary/5 px-6 py-4 border-b border-outline-variant flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">book</span>
                <h3 className="text-title-md font-bold text-primary">{subject}</h3>
                <span className="bg-primary text-on-primary text-label-sm px-2 py-0.5 rounded-full font-bold ml-auto">{subjectScores.length} Data</span>
              </div>
              
              <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-outline-variant bg-surface-container-low font-bold text-label-md text-on-surface-variant uppercase tracking-wider">
                <div className="col-span-3">Nama Siswa</div>
                <div className="col-span-2">Kelas</div>
                <div className="col-span-2">Topik</div>
                <div className="col-span-2">Catatan</div>
                <div className="col-span-2 text-right">Nilai</div>
                <div className="col-span-1 text-center">Aksi</div>
              </div>
              
              <div className="divide-y divide-outline-variant/50">
                {subjectScores.map(scoreItem => (
                  <div key={scoreItem.id} className="flex flex-col md:grid md:grid-cols-12 gap-3 md:gap-4 p-4 md:items-center hover:bg-surface-container transition-colors group">
                    
                    {/* Mobile View / Desktop Col 1 */}
                    <div className="col-span-1 md:col-span-3 flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/150?u=${scoreItem.student_name.replace(' ', '')}`} alt={scoreItem.student_name} className="w-10 h-10 rounded-full border-2 border-surface-container bg-surface-container-high" />
                      <div>
                        <h3 className="font-bold text-on-surface text-label-lg group-hover:text-primary transition-colors">{scoreItem.student_name}</h3>
                        <div className="md:hidden text-label-sm text-on-surface-variant">
                          {scoreItem.class_name} • {new Date(scoreItem.created_at).toLocaleDateString('id-ID')}
                        </div>
                      </div>
                    </div>

                    {/* Desktop Columns */}
                    <div className="hidden md:flex col-span-2 flex-col justify-center text-body-sm text-on-surface">
                      <span className="font-bold">{scoreItem.class_name}</span>
                      <span className="text-on-surface-variant text-[11px]">{new Date(scoreItem.created_at).toLocaleDateString('id-ID')}</span>
                    </div>
                    
                    <div className="hidden md:flex col-span-2 flex-col text-label-sm">
                      <span className="font-bold text-on-surface">{scoreItem.topic}</span>
                    </div>

                    {/* Notes & Score (Edit Mode vs View Mode) */}
                    {editingId === scoreItem.id ? (
                      <>
                        <div className="col-span-1 md:col-span-2 mt-2 md:mt-0">
                          <input 
                            type="text" 
                            value={editNotes} 
                            onChange={(e) => setEditNotes(e.target.value)} 
                            className="w-full p-2 border border-primary rounded bg-white text-sm"
                            placeholder="Catatan..."
                          />
                        </div>
                        <div className="col-span-1 md:col-span-3 flex justify-between md:justify-end items-center gap-4 mt-2 md:mt-0">
                          <input 
                            type="number" 
                            value={editScore} 
                            onChange={(e) => setEditScore(e.target.value)} 
                            className="w-24 md:w-20 p-2 border border-primary rounded bg-white text-sm md:text-right font-bold"
                            min="0" max="100"
                          />
                          <div className="flex gap-2">
                            <button onClick={() => handleSaveEdit(scoreItem.id)} disabled={isSaving} className="text-green-600 hover:bg-green-50 p-2 md:p-1 rounded transition-colors bg-green-50/50 md:bg-transparent">
                              <span className="material-symbols-outlined text-[20px]">check</span>
                            </button>
                            <button onClick={handleCancelEdit} disabled={isSaving} className="text-red-600 hover:bg-red-50 p-2 md:p-1 rounded transition-colors bg-red-50/50 md:bg-transparent">
                              <span className="material-symbols-outlined text-[20px]">close</span>
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-1 md:col-span-2 text-body-sm text-on-surface-variant italic mt-1 md:mt-0">
                          {scoreItem.notes ? scoreItem.notes : <span className="md:hidden">Tanpa catatan</span>}
                          {!scoreItem.notes && <span className="hidden md:inline">-</span>}
                        </div>
                        <div className="col-span-1 md:col-span-3 flex justify-between items-center mt-3 md:mt-0">
                          <span className={`px-4 py-1.5 rounded-full text-label-lg font-bold flex items-center justify-center min-w-[3.5rem] ${
                            scoreItem.score >= 80 ? 'bg-primary/10 text-primary' : 
                            scoreItem.score >= 60 ? 'bg-tertiary-container text-tertiary' : 
                            'bg-error/10 text-error'
                          }`}>
                            {scoreItem.score}
                          </span>
                          <button onClick={() => handleEditClick(scoreItem)} className="text-on-surface-variant hover:text-primary hover:bg-surface-container p-2 rounded-full transition-colors opacity-100 md:opacity-0 group-hover:opacity-100 flex items-center gap-2 border border-outline-variant md:border-none">
                            <span className="material-symbols-outlined text-[20px]">edit</span>
                            <span className="md:hidden text-label-sm font-bold">Edit</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScoreHistory;
