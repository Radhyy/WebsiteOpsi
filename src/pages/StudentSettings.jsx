"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const StudentSettings = () => {
  const { t, language, toggleLanguage } = useLanguage();
  const router = useRouter();

  const [profilePic, setProfilePic] = useState('https://i.pravatar.cc/150?u=mia');
  const [isUploading, setIsUploading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedPic = localStorage.getItem('profilePic');
    if (savedPic) setProfilePic(savedPic);
    
    // Listen to changes from other tabs if needed
    const handleUpdate = () => {
      const pic = localStorage.getItem('profilePic');
      if (pic) setProfilePic(pic);
    };
    window.addEventListener('profilePicUpdated', handleUpdate);
    return () => window.removeEventListener('profilePicUpdated', handleUpdate);
  }, []);

  const handleImageChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      const reader = new FileReader();
      reader.onload = (e) => setProfilePic(e.target.result);
      reader.readAsDataURL(file);

      setIsUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      try {
        const imgbbKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
        const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        
        if (data.success) {
          const imageUrl = data.data.url;
          setProfilePic(imageUrl);
          
          const userId = localStorage.getItem('userId') || 2;
          await fetch(`/api/users/${userId}/profile-picture`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile_picture: imageUrl })
          });
          
          localStorage.setItem('profilePic', imageUrl);
          window.dispatchEvent(new Event('profilePicUpdated'));
          
          showToast('Foto profil berhasil diunggah dan disimpan!', 'success');
        } else {
          showToast('Gagal mengunggah foto ke ImgBB.', 'error');
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        showToast('Terjadi kesalahan saat mengunggah foto.', 'error');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-24 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full font-bold shadow-lg transition-all animate-fade-in flex items-center gap-2 ${toast.type === 'success' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}
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
          
          {/* Middle: Links */}
          <nav className="hidden md:flex items-center gap-8 text-label-md font-bold text-on-surface-variant">
            <Link href="/student-dashboard" className="hover:text-primary transition-colors">Beranda</Link>
            <a href="#" className="hover:text-primary transition-colors">Misi Khusus</a>
            <a href="#" className="hover:text-primary transition-colors">Jadwal</a>
            <Link href="/student-settings" className="text-primary">Pengaturan</Link>
          </nav>
          
          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-3 border-r border-outline-variant/50 pr-4">
              <button onClick={toggleLanguage} className="flex items-center font-bold text-label-sm text-on-surface-variant hover:text-primary transition-colors">
                {language.toUpperCase()}
              </button>
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary">
                <img src={profilePic} alt="Mia" className="w-full h-full object-cover" />
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
      <main className="px-4 md:px-gutter max-w-[800px] mx-auto py-8">
        <h1 className="font-display-sm text-display-sm font-bold text-on-surface mb-8">Pengaturan Akun</h1>

        <div className="bg-white border border-outline-variant/50 rounded-3xl p-8 shadow-sm">
          
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-10 pb-10 border-b border-outline-variant/30">
            <div className="relative group cursor-pointer overflow-hidden rounded-full w-32 h-32 border-4 border-primary/20 group-hover:border-primary transition-colors">
                <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
              
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                {isUploading ? (
                  <span className="material-symbols-outlined text-white text-3xl animate-spin">refresh</span>
                ) : (
                  <span className="material-symbols-outlined text-white text-3xl">photo_camera</span>
                )}
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" title="Ganti Foto Profil" />
            </div>
            <div className="flex flex-col justify-center text-center sm:text-left mt-2">
              <h3 className="font-headline-sm font-bold text-on-surface">Foto Profil</h3>
              <p className="text-body-md text-on-surface-variant mb-4">Maksimal ukuran file 2MB (JPG, PNG).</p>
              <div className="relative inline-block">
                <button className="bg-primary-container text-on-primary-container hover:brightness-95 px-6 py-2 rounded-full font-bold transition-colors">
                  {isUploading ? 'Mengunggah...' : 'Ubah Foto'}
                </button>
                <input type="file" accept="image/*" onChange={handleImageChange} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
              </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Personal Info */}
            <div>
              <h3 className="font-bold text-on-surface text-lg mb-4">Informasi Pribadi</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-label-md font-bold text-on-surface-variant">Nama Lengkap</label>
                  <input type="text" defaultValue="Mia Chen" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface" />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-label-md font-bold text-on-surface-variant">Alamat Email (Tidak bisa diubah)</label>
                  <input type="email" defaultValue="mia@sekolah.com" disabled className="w-full bg-surface-container border border-outline-variant/50 rounded-xl px-4 py-3 text-on-surface-variant cursor-not-allowed" />
                </div>
              </div>
            </div>

            <hr className="border-outline-variant/30 my-8" />

            {/* Password Security */}
            <div>
              <h3 className="font-bold text-on-surface text-lg mb-4">Keamanan Akun</h3>
              <div className="flex flex-col gap-4 max-w-md">
                <div className="flex flex-col gap-2">
                  <label className="text-label-md font-bold text-on-surface-variant">Kata Sandi Lama</label>
                  <div className="relative">
                    <input type="password" placeholder="Masukkan kata sandi saat ini" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface" />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface">visibility_off</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-label-md font-bold text-on-surface-variant">Kata Sandi Baru</label>
                  <div className="relative">
                    <input type="password" placeholder="Buat kata sandi baru" className="w-full bg-surface-container-lowest border border-outline-variant rounded-xl px-4 py-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface" />
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant cursor-pointer hover:text-on-surface">visibility_off</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-8 flex justify-end gap-4">
              <button type="button" className="px-6 py-3 rounded-full font-bold text-on-surface-variant hover:bg-surface-container transition-colors">
                Batal
              </button>
              <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-md hover:brightness-110 active:translate-y-1 active:shadow-sm transition-all">
                Simpan Perubahan
              </button>
            </div>

          </form>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-outline-variant/30 flex justify-around items-center pb-safe pt-2 px-2 z-50 shadow-[0_-4px_20px_rgb(0,0,0,0.05)]">
        <Link href="/student-dashboard" className="flex flex-col items-center p-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl mb-1">home</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
        </Link>
        <a href="#" className="flex flex-col items-center p-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl mb-1">assignment</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Misi</span>
        </a>
        <a href="#" className="flex flex-col items-center p-2 text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-2xl mb-1">calendar_today</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Jadwal</span>
        </a>
        <Link href="/student-settings" className="flex flex-col items-center p-2 text-primary">
          <span className="material-symbols-outlined text-2xl mb-1">settings</span>
          <span className="text-[10px] font-bold uppercase tracking-wider">Pengaturan</span>
        </Link>
      </div>
    </div>
  );
};

export default StudentSettings;
