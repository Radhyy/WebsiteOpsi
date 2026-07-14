"use client";
import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { useRouter } from 'next/navigation';

const AddStudent = () => {
  const { t } = useLanguage();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    grade: 'Grade 4',
    email: '',
    parentPhone: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGeneratePassword = () => {
    // Generate a random 8-character password
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let newPassword = '';
    for (let i = 0; i < 8; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password: newPassword });
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Terjadi kesalahan saat menyimpan data');
        setLoading(false);
        return;
      }

      // Success
      router.push('/students');
    } catch (err) {
      console.error(err);
      setErrorMsg('Koneksi ke server terputus');
      setLoading(false);
    }
  };

  return (
    <div className="px-4 md:px-gutter py-8 max-w-[800px] mx-auto pb-24">
      {/* Header Section */}
      <div className="mb-8 flex items-center gap-4">
        <button 
          onClick={() => router.back()}
          className="w-12 h-12 flex items-center justify-center bg-surface-container-low hover:bg-surface-container rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </button>
        <div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{t('addStudentTitle')}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            {t('addStudentDesc')}
          </p>
        </div>
      </div>

      <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm p-6 md:p-10">
        
        {errorMsg && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleEnroll} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('fullName')}</label>
              <input 
                type="text" 
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="e.g. Mia Chen"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('gradeLabel')}</label>
              <select 
                name="grade"
                value={formData.grade}
                onChange={handleChange}
                className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="Grade 4">{t('grade4')}</option>
                <option value="Grade 5">{t('grade5')}</option>
              </select>
            </div>
          </div>

          <hr className="border-outline-variant/50" />

          <h3 className="font-headline-sm text-headline-sm text-primary mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined">manage_accounts</span>
            Account Credentials
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('studentEmail')}</label>
              <input 
                type="email" 
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="student@school.edu"
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-label-md font-bold text-on-surface">{t('parentEmail')}</label>
              <input 
                type="tel" 
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="+62 812 3456 7890"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-label-md font-bold text-on-surface">{t('createPassword')}</label>
            <div className="flex gap-4">
              <input 
                type="text" 
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full p-4 bg-surface-container-low border border-outline-variant rounded-xl focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="••••••••"
              />
              <button 
                type="button"
                onClick={handleGeneratePassword}
                className="whitespace-nowrap px-6 bg-secondary-container text-on-secondary-container font-bold rounded-xl hover:brightness-95 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">password</span>
                {t('generatePassword')}
              </button>
            </div>
          </div>

          <div className="mt-10 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full md:w-auto bg-primary text-on-primary px-10 py-4 rounded-full font-bold shadow-[0_4px_0_#134e3a] active:translate-y-1 active:shadow-[0_0px_0_#134e3a] transition-all flex items-center justify-center gap-2 text-label-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <span className="material-symbols-outlined">person_add</span>
              {loading ? 'Menyimpan...' : t('enrollBtn')}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AddStudent;
