"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '../LanguageContext';

const Login = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const [role, setRole] = useState('teacher'); // 'teacher', 'student', or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'Login gagal');
        setLoading(false);
        return;
      }

      // Berhasil login
      if (role === 'student') {
        router.push('/student-dashboard');
      } else {
        // Teacher atau Admin masuk ke dashboard utama
        router.push('/');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan pada server');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary-container/40 rounded-full blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-tertiary-container/30 rounded-full blur-3xl"></div>
      
      {/* Language Toggle floating */}
      <div className="absolute top-6 right-6">
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 bg-surface-container border border-outline-variant px-4 py-2 rounded-full font-bold text-label-md hover:bg-surface-container-high transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-xl">language</span>
          <span>{language.toUpperCase()}</span>
        </button>
      </div>

      <div className="w-full max-w-md bg-white rounded-3xl shadow-[0_8px_40px_rgb(0,0,0,0.08)] border border-outline-variant/30 p-8 md:p-10 relative z-10">
        
        {/* Logo/Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-primary text-on-primary rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <span className="material-symbols-outlined text-4xl" data-icon="psychology">psychology</span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">{t('loginTitle')}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {t('loginDesc')}
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-surface-container-low rounded-xl p-1 mb-8 shadow-inner overflow-x-auto whitespace-nowrap scrollbar-hide">
          <button 
            type="button"
            onClick={() => { setRole('teacher'); setErrorMsg(''); }}
            className={`flex-1 py-3 px-4 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              role === 'teacher' 
                ? 'bg-white text-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">school</span>
            Guru
          </button>
          <button 
            type="button"
            onClick={() => { setRole('student'); setErrorMsg(''); }}
            className={`flex-1 py-3 px-4 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              role === 'student' 
                ? 'bg-white text-tertiary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">face</span>
            Siswa
          </button>
          <button 
            type="button"
            onClick={() => { setRole('admin'); setErrorMsg(''); }}
            className={`flex-1 py-3 px-4 font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              role === 'admin' 
                ? 'bg-white text-error shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
            Admin
          </button>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-error-container text-on-error-container text-sm rounded-lg font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-label-sm font-bold text-on-surface ml-1">
              {role === 'student' ? 'Student Email (Gmail)' : 'Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">mail</span>
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-lg" 
                placeholder={role === 'student' ? 'student@school.edu' : 'teacher@school.edu'}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-label-sm font-bold text-on-surface ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="material-symbols-outlined text-outline">lock</span>
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-12 pr-4 py-4 bg-surface-container-lowest border border-outline-variant rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-body-lg" 
                placeholder="••••••••"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button type="button" className="text-label-md font-bold text-primary hover:underline">
                {t('forgotPassword')}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-label-lg shadow-lg active:translate-y-1 transition-all flex items-center justify-center gap-2 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            } ${
              role === 'teacher' 
                ? 'bg-primary text-on-primary hover:brightness-110 shadow-primary/30' 
                : role === 'student'
                ? 'bg-tertiary text-on-tertiary hover:brightness-110 shadow-tertiary/30'
                : 'bg-error text-on-error hover:brightness-110 shadow-error/30'
            }`}
          >
            {loading ? 'Sedang masuk...' : t('loginBtn')}
            {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
          </button>
        </form>

      </div>
    </div>
  );
};

export default Login;
