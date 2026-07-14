"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useRouter } from 'next/navigation';

const SUBJECTS_DATA = {
  "Mathematics": ["Fractions & Ratios", "Geometry", "Algebraic Equations", "Calculus", "Statistics"],
  "Science": ["Physics", "Chemistry", "Biology", "Ecology", "Astronomy"],
  "English": ["Grammar", "Literature", "Essay Writing", "Reading Comprehension"],
  "History": ["World War II", "Ancient Egypt", "Industrial Revolution", "Cold War"],
  "Geography": ["Physical Geography", "Human Geography", "Cartography", "Climate Change"],
  "Arts": ["Drawing", "Painting", "Sculpture", "Art History"],
  "Computer Science": ["Programming Basics", "Data Structures", "Web Development", "Artificial Intelligence"]
};

const InputScore = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('manual');
  
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Form states
  const [className, setClassName] = useState('Class 4-B');
  const [subject, setSubject] = useState('Mathematics');
  const [topic, setTopic] = useState('Fractions & Ratios');
  const [scoresData, setScoresData] = useState({}); // { student_id: { score: '', notes: '' } }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('/api/students');
        const data = await res.json();
        if (data.success) {
          setStudents(data.students);
          // Initialize scoresData
          const initData = {};
          data.students.forEach(s => {
            initData[s.id] = { score: '', notes: '' };
          });
          setScoresData(initData);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleScoreChange = (id, field, value) => {
    setScoresData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value
      }
    }));
  };

  const handleSaveScores = async () => {
    // Transform scoresData to array
    const dataToSend = Object.entries(scoresData).map(([id, data]) => ({
      student_id: parseInt(id),
      score: data.score,
      notes: data.notes
    })).filter(item => item.score !== ''); // Only send filled scores

    if (dataToSend.length === 0) {
      showToast('Tidak ada nilai yang diinput', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/manual-scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          className, subject, topic, scoresData: dataToSend
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Nilai berhasil disimpan!', 'success');
        // Redirect to Score History page after a short delay
        setTimeout(() => {
          router.push('/score-history');
        }, 1500);
      } else {
        showToast('Gagal menyimpan nilai: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (e) {
      showToast('Terjadi kesalahan jaringan', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 md:px-gutter py-8 max-w-[1200px] mx-auto pb-24 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold shadow-lg transition-all animate-fade-in flex items-center gap-2 ${toast.type === 'success' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}

      {/* Header Section */}
      <div className="mb-8">
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{t('inputScoreTitle')}</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
          {t('inputScoreDesc')}
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tabs */}
        <div className="flex border-b border-outline-variant bg-surface-container-low/50">
          <button 
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-4 font-bold text-label-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'manual' 
                ? 'text-primary border-b-2 border-primary bg-surface-container-lowest' 
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined">edit_document</span>
            {t('manualInputTab')}
          </button>
          <button 
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-4 font-bold text-label-lg transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'import' 
                ? 'text-primary border-b-2 border-primary bg-surface-container-lowest' 
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <span className="material-symbols-outlined">upload_file</span>
            {t('importDataTab')}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 md:p-8">
          
          {/* Filters (Common for both tabs) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-bold text-on-surface-variant">{t('selectClass')}</label>
              <select 
                value={className}
                onChange={e => setClassName(e.target.value)}
                className="p-3 bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md font-body-md"
              >
                <option value="Class 4-B">Class 4-B</option>
                <option value="Class 4-A">Class 4-A</option>
                <option value="Class 5-C">Class 5-C</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-bold text-on-surface-variant">{t('selectSubject')}</label>
              <select 
                value={subject}
                onChange={e => {
                  setSubject(e.target.value);
                  setTopic(SUBJECTS_DATA[e.target.value][0]);
                }}
                className="p-3 bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md font-body-md"
              >
                {Object.keys(SUBJECTS_DATA).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-label-sm font-bold text-on-surface-variant">{t('selectTopic')}</label>
              <select 
                value={topic}
                onChange={e => setTopic(e.target.value)}
                className="p-3 bg-surface border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md font-body-md"
              >
                {SUBJECTS_DATA[subject]?.map(top => (
                  <option key={top} value={top}>{top}</option>
                ))}
              </select>
            </div>
          </div>

          {activeTab === 'manual' ? (
            /* Manual Input Form */
            <div className="flex flex-col gap-4">
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 border-b border-outline-variant/50 text-label-md font-bold text-on-surface-variant">
                <div className="col-span-5">{t('studentName')}</div>
                <div className="col-span-3">{t('score')}</div>
                <div className="col-span-4">{t('notes')}</div>
              </div>
              
              {isLoading ? (
                <div className="p-8 text-center text-on-surface-variant">Memuat data siswa...</div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-on-surface-variant">Belum ada siswa yang terdaftar.</div>
              ) : (
                students.map((student) => (
                  <div key={student.id} className="flex flex-col md:flex-row md:items-center gap-4 bg-surface-container-low/30 p-4 rounded-xl border border-outline-variant/50 hover:bg-surface-container transition-colors">
                    <div className="w-full md:w-5/12 flex items-center gap-3">
                      <img src={`https://i.pravatar.cc/150?u=${student.email}`} alt={student.name} className="w-10 h-10 rounded-full border-2 border-surface-container bg-surface-container-high" />
                      <span className="font-bold text-on-surface text-body-lg">{student.name}</span>
                    </div>
                    <div className="w-full md:w-7/12 flex gap-4">
                      <div className="flex-1 md:flex-none md:w-1/3">
                        <label className="md:hidden text-label-sm text-on-surface-variant mb-1 block truncate">{t('score')}</label>
                        <input 
                          type="number" 
                          min="0" max="100" 
                          placeholder="0-100"
                          value={scoresData[student.id]?.score || ''}
                          onChange={e => handleScoreChange(student.id, 'score', e.target.value)}
                          className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-md font-bold text-primary"
                        />
                      </div>
                      <div className="flex-[2] md:flex-none md:w-2/3">
                        <label className="md:hidden text-label-sm text-on-surface-variant mb-1 block truncate">{t('notes')}</label>
                        <input 
                          type="text" 
                          placeholder="..."
                          value={scoresData[student.id]?.notes || ''}
                          onChange={e => handleScoreChange(student.id, 'notes', e.target.value)}
                          className="w-full p-3 bg-surface-container-lowest border border-outline-variant rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none text-body-sm text-on-surface"
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}

              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleSaveScores}
                  disabled={isSubmitting || students.length === 0}
                  className="w-full md:w-auto bg-primary text-on-primary px-8 py-4 rounded-full font-bold shadow-[0_4px_0_#134e3a] active:translate-y-1 active:shadow-[0_0px_0_#134e3a] transition-all flex items-center justify-center gap-2 text-label-lg disabled:opacity-50 disabled:active:translate-y-0 disabled:active:shadow-[0_4px_0_#134e3a]"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin">sync</span>
                  ) : (
                    <span className="material-symbols-outlined">analytics</span>
                  )}
                  {t('saveScores')}
                </button>
              </div>
            </div>
          ) : (
            /* Import Data View */
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-primary/40 bg-primary-container/10 rounded-2xl p-12 text-center h-[400px]">
              <div className="w-20 h-20 bg-primary-container rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl text-primary">cloud_upload</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">{t('uploadExcelBtn')}</h3>
              <p className="text-body-lg text-on-surface-variant max-w-md mb-8">
                {t('uploadDesc')}
              </p>
              <button className="bg-surface-container-low text-on-surface border border-outline-variant px-8 py-3 rounded-full font-bold hover:bg-surface-container transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined">folder_open</span>
                Browse Files
              </button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default InputScore;
