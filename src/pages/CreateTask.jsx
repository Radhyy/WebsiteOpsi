"use client";
import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

const CreateTask = () => {
  const router = useRouter();
  const params = useParams();
  
  const [questions, setQuestions] = useState([
    { id: 1, type: 'multiple_choice', text: '', image: null, options: ['', '', '', ''], correctOption: 0 }
  ]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [student, setStudent] = useState(null);
  
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null); // { message, type: 'success' | 'error' }

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const fetchStudent = async () => {
      if (!params?.id) return;
      try {
        const res = await fetch(`/api/students/${params.id}`);
        const data = await res.json();
        if (data.success) {
          setStudent(data.student);
        }
      } catch (error) {
        console.error('Error fetching student:', error);
      }
    };
    fetchStudent();
  }, [params?.id]);

  const addQuestion = () => {
    setQuestions([...questions, { id: Date.now(), type: 'essay', text: '', image: null, options: [], correctOption: 0 }]);
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestionType = (id, newType) => {
    setQuestions(questions.map(q => {
      if (q.id === id) {
        return { 
          ...q, 
          type: newType, 
          options: newType === 'multiple_choice' ? ['', '', '', ''] : [],
          correctOption: 0
        };
      }
      return q;
    }));
  };

  const handleAiAssist = async () => {
    if (!title) {
      showToast('Tulis Judul Tugas terlebih dahulu. AI butuh topik.', 'error');
      return;
    }
    
    // Find empty questions
    const emptyIndexes = [];
    questions.forEach((q, index) => {
      if (!q.text || q.text.trim() === '') {
        emptyIndexes.push(index);
      }
    });

    // If there are no empty questions, we append 5 new ones.
    // If there are empty questions, we generate exactly that many to fill them.
    const countToGenerate = emptyIndexes.length > 0 ? emptyIndexes.length : 5;
    
    setIsAiGenerating(true);
    try {
      const res = await fetch('/api/ai/generate-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student?.name,
          grade: student?.grade,
          topic: title,
          count: countToGenerate
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const generatedQuestions = data.data.questions;
        const newQuestions = [...questions];
        let genIndex = 0;

        if (emptyIndexes.length > 0) {
          // Fill existing empty slots
          for (let idx of emptyIndexes) {
            if (genIndex < generatedQuestions.length) {
              newQuestions[idx] = { 
                ...newQuestions[idx], 
                ...generatedQuestions[genIndex],
                type: 'multiple_choice',
                id: newQuestions[idx].id // preserve the original id
              };
              genIndex++;
            }
          }
        }

        // Append any remaining generated questions (happens if emptyIndexes was 0)
        while (genIndex < generatedQuestions.length) {
          newQuestions.push({
            ...generatedQuestions[genIndex],
            id: Date.now() + genIndex,
            type: 'multiple_choice'
          });
          genIndex++;
        }

        setQuestions(newQuestions);
        showToast('Soal berhasil di-generate dengan AI!', 'success');
      } else {
        showToast('Gagal menghasilkan soal: ' + (data.error || 'Unknown error'), 'error');
      }
    } catch (e) {
      console.error(e);
      showToast('Terjadi kesalahan saat menghubungi server AI.', 'error');
    } finally {
      setIsAiGenerating(false);
    }
  };

  return (
    <div className="pt-8 pb-12 px-gutter max-w-[1000px] mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-full font-bold shadow-lg transition-all animate-fade-in flex items-center gap-2 ${toast.type === 'success' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="material-symbols-outlined p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-all"
          >
            arrow_back
          </button>
          <div>
            <h2 className="text-headline-md font-headline-md font-bold text-primary">Buat Tugas Latihan Khusus</h2>
            <p className="text-body-md text-on-surface-variant">
              Untuk {student ? `${student.name} (${student.grade || 'Tidak ada kelas'})` : 'Memuat data siswa...'}
            </p>
          </div>
        </div>
        <button 
          onClick={handleAiAssist}
          disabled={isAiGenerating}
          className="bg-secondary-container text-on-secondary-container px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:brightness-95 transition-all shadow-sm"
        >
          <span className={`material-symbols-outlined ${isAiGenerating ? 'animate-spin' : ''}`}>
            {isAiGenerating ? 'sync' : 'smart_toy'}
          </span>
          {isAiGenerating ? 'AI Sedang Berpikir...' : 'Bantu dengan AI'}
        </button>
      </div>

      <div className="space-y-6">
        
        {/* General Info */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface-variant">Judul Tugas</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Pemulihan Pecahan Dasar" 
                className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all" 
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface-variant">Tenggat Waktu (Deadline)</label>
              <input 
                type="date" 
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-surface-container border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all text-on-surface-variant" 
              />
            </div>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-6 py-3 border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-bold text-on-surface text-label-lg">Soal Nomor {index + 1}</h3>
                <div className="flex items-center gap-4">
                  <select 
                    value={q.type}
                    onChange={(e) => updateQuestionType(q.id, e.target.value)}
                    className="bg-white border border-outline-variant rounded-md px-3 py-1 text-sm outline-none cursor-pointer"
                  >
                    <option value="multiple_choice">Pilihan Ganda (ABCD)</option>
                    <option value="essay">Esai Panjang</option>
                  </select>
                  <button onClick={() => removeQuestion(q.id)} className="text-error hover:bg-error-container/50 p-1.5 rounded-full transition-colors flex items-center justify-center">
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6 flex flex-col gap-6">
                
                {/* Question Text & Image */}
                <div className="flex flex-col gap-2">
                  <label className="text-label-md font-bold text-on-surface-variant">Pertanyaan</label>
                  <textarea 
                    rows="3" 
                    placeholder="Ketik pertanyaan di sini..." 
                    value={q.text}
                    onChange={(e) => setQuestions(questions.map(question => question.id === q.id ? { ...question, text: e.target.value } : question))}
                    className="bg-surface-container border border-outline-variant rounded-lg px-4 py-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all w-full resize-y"
                  ></textarea>
                </div>

                {/* Photo Upload Area */}
                <div className="border-2 border-dashed border-outline-variant rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-surface-container transition-colors cursor-pointer group">
                  <span className="material-symbols-outlined text-3xl text-outline-variant group-hover:text-primary transition-colors mb-2">add_photo_alternate</span>
                  <p className="text-label-sm font-bold text-on-surface-variant group-hover:text-primary transition-colors">Tambah Foto / Ilustrasi Soal</p>
                  <p className="text-xs text-outline-variant mt-1">Opsional (Maks. 2MB)</p>
                </div>

                {/* Options for Multiple Choice */}
                {q.type === 'multiple_choice' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-label-md font-bold text-on-surface-variant">Pilihan Jawaban</label>
                      <span className="text-label-sm text-outline">Klik huruf (A, B, C, D) untuk memilih jawaban benar</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-3">
                          <button 
                            type="button"
                            onClick={() => setQuestions(questions.map(question => question.id === q.id ? { ...question, correctOption: oIndex } : question))}
                            className={`w-8 h-8 rounded-full border border-outline-variant flex items-center justify-center font-bold shrink-0 transition-colors cursor-pointer hover:brightness-95 ${q.correctOption === oIndex ? 'bg-primary text-on-primary border-primary ring-2 ring-primary ring-offset-1' : 'text-on-surface-variant bg-surface-container'}`}
                            title="Jadikan Jawaban Benar"
                          >
                            {String.fromCharCode(65 + oIndex)}
                          </button>
                          <input 
                            type="text" 
                            value={opt}
                            onChange={(e) => {
                              const newOptions = [...q.options];
                              newOptions[oIndex] = e.target.value;
                              setQuestions(questions.map(question => question.id === q.id ? { ...question, options: newOptions } : question));
                            }}
                            placeholder={`Pilihan ${String.fromCharCode(65 + oIndex)}`}
                            className={`flex-grow bg-surface-container border rounded-lg px-3 py-2 outline-none transition-all ${q.correctOption === oIndex ? 'border-primary ring-1 ring-primary' : 'border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary'}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Essay Placeholder */}
                {q.type === 'essay' && (
                  <div className="bg-surface-container-low border border-outline-variant border-dashed rounded-lg p-4 text-center">
                    <p className="text-label-sm text-on-surface-variant">Siswa akan diberikan kotak teks besar untuk mengetikkan jawaban panjang.</p>
                  </div>
                )}

              </div>
            </div>
          ))}
        </div>

        {/* Add Question Button */}
        <button 
          onClick={addQuestion}
          className="w-full border-2 border-dashed border-primary/50 text-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-container/20 transition-all"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Tambah Soal Baru
        </button>

        {/* Bottom Actions */}
        <div className="pt-6 border-t border-outline-variant flex justify-end gap-4">
          <button className="px-6 py-2.5 rounded-full font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
            Simpan Draft
          </button>
          <button 
            onClick={async () => {
              if (!title || !student) return showToast('Mohon isi judul tugas terlebih dahulu.', 'error');
              setIsSubmitting(true);
              try {
                const res = await fetch('/api/tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ studentId: student.id, title, deadline, questions })
                });
                if (res.ok) {
                  showToast('Tugas berhasil dikirim ke siswa!', 'success');
                  setTimeout(() => router.push(`/students/${student.id}`), 1500);
                } else {
                  showToast('Gagal mengirim tugas.', 'error');
                }
              } catch (e) {
                showToast('Terjadi kesalahan koneksi.', 'error');
              }
              setIsSubmitting(false);
            }}
            disabled={isSubmitting}
            className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-bold shadow-md hover:brightness-110 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined text-sm">{isSubmitting ? 'sync' : 'send'}</span>
            {isSubmitting ? 'Mengirim...' : 'Kirim Tugas ke Siswa'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default CreateTask;
