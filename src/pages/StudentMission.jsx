"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const StudentMission = () => {
  const router = useRouter();
  
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchMission = async () => {
      try {
        const res = await fetch('/api/tasks/active?studentId=2');
        const data = await res.json();
        if (data.success && data.mission) {
          setMission(data.mission);
        }
      } catch (error) {
        console.error('Error fetching mission:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMission();
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  if (!mission || !mission.questions || mission.questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center p-6">
        <span className="material-symbols-outlined text-6xl text-outline-variant mb-4">task_alt</span>
        <h2 className="text-headline-md font-bold text-on-surface mb-2">Tidak ada misi aktif</h2>
        <p className="text-on-surface-variant mb-6">Kamu sudah menyelesaikan semua tugas hari ini!</p>
        <button 
          onClick={() => router.push('/student-dashboard')}
          className="bg-primary text-white px-8 py-3 rounded-full font-bold shadow-md hover:brightness-110 transition-all"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  const questions = mission.questions;
  const currentQuestion = questions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex) / questions.length) * 100;

  const handleNext = async () => {
    // Save answer
    const newAnswers = [...answers, { questionId: currentQuestion.id, selectedOption }];
    setAnswers(newAnswers);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(null);
    } else {
      setSubmitting(true);
      try {
        const res = await fetch(`/api/tasks/${mission.id}/submit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers })
        });
        const data = await res.json();
        if (data.success) {
          setScore(data.score);
        }
      } catch (error) {
        console.error('Error submitting mission:', error);
      } finally {
        setFinished(true);
        setSubmitting(false);
      }
    }
  };

  if (finished) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-center p-6">
        <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce shadow-lg border-4 border-white">
          <span className="material-symbols-outlined text-6xl text-green-600">emoji_events</span>
        </div>
        <h2 className="text-display-sm font-bold text-on-surface mb-2">Misi Selesai!</h2>
        
        {score !== null && (
          <div className="mb-6">
            <span className="text-display-md font-bold text-primary">{score}</span>
            <span className="text-headline-sm text-on-surface-variant">/100</span>
          </div>
        )}

        <p className="text-body-lg text-on-surface-variant mb-8 max-w-md">
          Kerja bagus! Kamu telah menyelesaikan misi "{mission.title}" dengan sukses.
        </p>
        <button 
          onClick={() => router.push('/student-dashboard')}
          className="bg-primary text-white px-8 py-4 rounded-full font-bold shadow-md hover:brightness-110 active:scale-95 transition-all text-title-md"
        >
          Kembali ke Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      
      {/* Top Header - Mission Progress */}
      <header className="bg-white border-b border-outline-variant/30 px-4 md:px-8 py-4 sticky top-0 z-50 shadow-sm flex items-center justify-between">
        <button 
          onClick={() => router.push('/student-dashboard')}
          className="flex items-center gap-2 text-on-surface-variant hover:text-error transition-colors font-bold text-label-md"
        >
          <span className="material-symbols-outlined">close</span>
          <span className="hidden md:inline">Keluar dari Misi</span>
        </button>

        <div className="flex-grow max-w-xl mx-8">
          <div className="flex justify-between items-center mb-1 text-label-sm font-bold text-on-surface-variant">
            <span>Progress ({currentQuestionIndex + 1}/{questions.length})</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-bold text-primary bg-primary-container/30 px-4 py-2 rounded-full">
          <span className="material-symbols-outlined text-lg">timer</span>
          <span className="text-label-md">14:59</span>
        </div>
      </header>

      {/* Main Mission Content */}
      <main className="flex-grow px-4 md:px-gutter max-w-[800px] mx-auto w-full py-8 md:py-12 flex flex-col">
        
        {/* Question Card */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-outline-variant/30 mb-8 flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>
          
          <span className="bg-primary-container text-primary font-bold text-label-sm px-4 py-1.5 rounded-full mb-6">Pertanyaan {currentQuestionIndex + 1}</span>
          
          <h2 className="font-display-sm text-display-sm md:font-display-md md:text-display-md text-on-surface font-bold mb-6">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Answer Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {currentQuestion.options.map((optText, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D...
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                onClick={() => setSelectedOption(idx)}
                className={`p-6 rounded-2xl border-2 flex items-center gap-4 transition-all ${
                  isSelected 
                    ? 'border-primary bg-primary/5 shadow-[0_4px_0_#134e3a] translate-y-[-2px]' 
                    : 'border-outline-variant/50 bg-white hover:border-primary/30 hover:bg-surface-container-lowest'
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${
                  isSelected ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'
                }`}>
                  {letter}
                </div>
                <div className="flex flex-col items-start text-left">
                  <span className="font-bold text-title-md text-on-surface">{optText}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Action Button */}
        <div className="mt-auto pb-8">
          <button 
            onClick={handleNext}
            disabled={selectedOption === null || submitting}
            className={`w-full py-4 rounded-full font-bold text-title-md transition-all shadow-md flex justify-center items-center gap-2 ${
              selectedOption !== null && !submitting
                ? 'bg-primary text-white hover:brightness-110 active:translate-y-1 active:shadow-sm' 
                : 'bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Menyimpan...' : (currentQuestionIndex < questions.length - 1 ? 'Pilih & Lanjut' : 'Selesaikan Misi')}
            {!submitting && <span className="material-symbols-outlined">{currentQuestionIndex < questions.length - 1 ? 'arrow_forward' : 'done_all'}</span>}
          </button>
        </div>

      </main>
    </div>
  );
};

export default StudentMission;
