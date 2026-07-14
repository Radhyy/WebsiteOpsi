"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';

const TeacherSettings = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('profil');
  const [profilePic, setProfilePic] = useState('https://i.pravatar.cc/150?u=sarah');
  
  const [name, setName] = useState('Ms. Sarah');
  const [email, setEmail] = useState('sarah.teacher@school.edu');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const savedPic = localStorage.getItem('profilePic');
    if (savedPic) setProfilePic(savedPic);
  }, []);

  const [isUploading, setIsUploading] = useState(false);

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
          
          const userId = localStorage.getItem('userId') || 1;
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

  const handleSaveProfile = (e) => {
    e.preventDefault();
    showToast('Profil berhasil diperbarui!', 'success');
  };

  const handleSavePassword = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast('Password baru dan konfirmasi tidak cocok!', 'error');
      return;
    }
    showToast('Password berhasil diperbarui!', 'success');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="p-4 md:p-8 max-w-[1000px] mx-auto relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-[60] px-6 py-3 rounded-full font-bold shadow-lg transition-all animate-fade-in flex items-center gap-2 ${toast.type === 'success' ? 'bg-primary text-on-primary' : 'bg-error text-on-error'}`}>
          <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
          {toast.message}
        </div>
      )}
      <div className="mb-8">
        <h2 className="text-headline-md font-headline-md font-bold text-primary mb-2">Pengaturan Akun</h2>
        <p className="text-body-md text-on-surface-variant">Kelola profil, keamanan, dan preferensi akun guru Anda.</p>
      </div>

      <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Settings */}
        <div className="w-full md:w-64 bg-surface-container-low border-b md:border-b-0 md:border-r border-outline-variant flex md:flex-col p-4 gap-2 overflow-x-auto shrink-0">
          <button 
            onClick={() => setActiveTab('profil')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'profil' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined">person</span>
            Profil Saya
          </button>
          <button 
            onClick={() => setActiveTab('keamanan')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'keamanan' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined">lock</span>
            Keamanan
          </button>
          <button 
            onClick={() => setActiveTab('notifikasi')}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === 'notifikasi' ? 'bg-primary/10 text-primary' : 'text-on-surface-variant hover:bg-surface-container'}`}
          >
            <span className="material-symbols-outlined">notifications</span>
            Notifikasi
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow p-6 md:p-10">
          
          {/* PROFIL TAB */}
          {activeTab === 'profil' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-title-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-4">Profil Saya</h3>
              
              <form onSubmit={handleSaveProfile} className="flex flex-col gap-8 max-w-xl">
                
                {/* Profile Picture */}
                <div className="flex items-center gap-6">
                  <div className="relative group cursor-pointer">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-surface-container-high shadow-md">
                      <img src={profilePic} alt="Profile" className="w-full h-full object-cover group-hover:brightness-75 transition-all" />
                    </div>
                    <div className={`absolute inset-0 flex items-center justify-center transition-opacity ${isUploading ? 'opacity-100 bg-black/50' : 'opacity-0 group-hover:opacity-100'}`}>
                      {isUploading ? (
                        <span className="material-symbols-outlined text-white animate-spin">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined text-white drop-shadow-md">photo_camera</span>
                      )}
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageChange} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" title="Ganti Foto Profil" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface text-label-lg">Foto Profil</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Klik gambar untuk mengganti. Maks 2MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-label-md text-on-surface-variant">Nama Lengkap</label>
                    <input 
                      type="text" 
                      value={name} 
                      onChange={e => setName(e.target.value)} 
                      className="bg-surface-container border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-label-md text-on-surface-variant">Alamat Email (Gmail)</label>
                    <input 
                      type="email" 
                      value={email} 
                      disabled
                      className="bg-surface-container-high border border-outline-variant rounded-xl px-4 py-3 text-on-surface-variant outline-none w-full cursor-not-allowed opacity-70"
                      title="Email tidak bisa diubah langsung"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-label-md text-on-surface-variant">Kelas Wali</label>
                    <input 
                      type="text" 
                      value="Kelas 4-B" 
                      disabled
                      className="bg-surface-container-high border border-outline-variant rounded-xl px-4 py-3 text-on-surface-variant outline-none w-full cursor-not-allowed opacity-70"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-md hover:brightness-110 transition-all active:scale-95">
                    Simpan Perubahan
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* KEAMANAN TAB */}
          {activeTab === 'keamanan' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-title-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-4">Keamanan Akun</h3>
              
              <form onSubmit={handleSavePassword} className="flex flex-col gap-6 max-w-xl">
                
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-label-md text-on-surface-variant">Password Lama</label>
                  <input 
                    type="password" 
                    value={oldPassword} 
                    onChange={e => setOldPassword(e.target.value)} 
                    placeholder="Masukkan password lama"
                    required
                    className="bg-surface-container border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-label-md text-on-surface-variant">Password Baru</label>
                  <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="Minimal 8 karakter"
                    required
                    className="bg-surface-container border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-full"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-label-md text-on-surface-variant">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="Ulangi password baru"
                    required
                    className="bg-surface-container border border-outline-variant rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all w-full"
                  />
                </div>

                <div className="mt-6 flex justify-end">
                  <button type="submit" className="bg-primary text-on-primary px-8 py-3 rounded-full font-bold shadow-md hover:brightness-110 transition-all active:scale-95">
                    Perbarui Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* NOTIFIKASI TAB (MOCKUP) */}
          {activeTab === 'notifikasi' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-title-lg font-bold text-on-surface mb-6 border-b border-outline-variant pb-4">Preferensi Notifikasi</h3>
              
              <div className="flex flex-col gap-6 max-w-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-on-surface">Peringatan Risiko (IoT)</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Dapatkan notifikasi jika siswa terdeteksi frustrasi tinggi.</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                    <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between opacity-50">
                  <div>
                    <h4 className="font-bold text-on-surface">Email Ringkasan Mingguan</h4>
                    <p className="text-label-sm text-on-surface-variant mt-1">Kirim ringkasan performa kelas setiap hari Jumat.</p>
                  </div>
                  <div className="w-12 h-6 bg-surface-container-high border border-outline-variant rounded-full relative cursor-pointer shadow-inner">
                    <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TeacherSettings;
