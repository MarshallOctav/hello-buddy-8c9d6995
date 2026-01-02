import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Calendar, Shield, ArrowUpRight, Save, Edit2, X, Check, Phone, Camera, Trash2, Loader2 } from 'lucide-react';
import Button from './Button';
import { useAuth } from '../services/authContext';
import { User } from '../types';
import { ChangeEmailModal } from './ChangeEmailModal';
import { updateUserProfile, uploadAvatar, deleteAvatar } from '../services/api';

interface ProfileTabProps {
  user: User;
  language: string;
  content: any;
  completedTests: number;
  avgScore: number;
  totalXP: number;
  currentStreak: number;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  language,
  content,
  completedTests,
  avgScore,
  totalXP,
  currentStreak
}) => {
  const navigate = useNavigate();
  const { updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showChangeEmailModal, setShowChangeEmailModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Editable fields
  const [editName, setEditName] = useState(user.name);
  const [editRole, setEditRole] = useState(user.role || '');
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editPhone, setEditPhone] = useState(user.phone || '');

  // Sync edit fields when user changes
  useEffect(() => {
    setEditName(user.name);
    setEditRole(user.role || '');
    setEditBio(user.bio || '');
    setEditPhone(user.phone || '');
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setErrorMessage('');
    
    try {
      const result = await updateUserProfile({
        name: editName,
        role: editRole,
        bio: editBio,
        phone: editPhone
      });
      
      if (result.success) {
        // Update local state
        updateProfile({
          name: editName,
          role: editRole,
          bio: editBio,
          phone: editPhone
        });
        
        setIsEditing(false);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      } else {
        setErrorMessage(result.message || (language === 'id' ? 'Gagal menyimpan perubahan' : 'Failed to save changes'));
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setErrorMessage(language === 'id' ? 'Terjadi kesalahan saat menyimpan' : 'An error occurred while saving');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditName(user.name);
    setEditRole(user.role || '');
    setEditBio(user.bio || '');
    setEditPhone(user.phone || '');
    setIsEditing(false);
  };

  const handleEmailChanged = (newEmail: string) => {
    updateProfile({ email: newEmail });
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage(language === 'id' ? 'Ukuran file maksimal 2MB' : 'Maximum file size is 2MB');
      return;
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage(language === 'id' ? 'Format file tidak valid. Gunakan JPG, PNG, GIF, atau WebP' : 'Invalid file format. Use JPG, PNG, GIF, or WebP');
      return;
    }

    setIsUploadingAvatar(true);
    setErrorMessage('');

    try {
      const result = await uploadAvatar(file);
      
      if (result.success && result.avatar_url) {
        updateProfile({ avatarUrl: result.avatar_url });
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      } else {
        setErrorMessage(result.message || (language === 'id' ? 'Gagal mengupload foto' : 'Failed to upload photo'));
      }
    } catch (err) {
      console.error('Error uploading avatar:', err);
      setErrorMessage(language === 'id' ? 'Terjadi kesalahan saat mengupload' : 'An error occurred while uploading');
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteAvatar = async () => {
    if (!user.avatarUrl) return;

    setIsUploadingAvatar(true);
    setErrorMessage('');

    try {
      const result = await deleteAvatar();
      
      if (result.success) {
        updateProfile({ avatarUrl: undefined });
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      } else {
        setErrorMessage(result.message || (language === 'id' ? 'Gagal menghapus foto' : 'Failed to delete photo'));
      }
    } catch (err) {
      console.error('Error deleting avatar:', err);
      setErrorMessage(language === 'id' ? 'Terjadi kesalahan saat menghapus' : 'An error occurred while deleting');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const t = {
    id: {
      fullName: 'Nama Lengkap',
      editProfile: 'Edit Profil',
      cancel: 'Batal',
      saving: 'Menyimpan...',
      saved: 'Tersimpan!',
      bio: 'Bio',
      bioPlaceholder: 'Ceritakan tentang diri Anda...',
      changeEmail: 'Ganti Email',
      phone: 'Nomor Telepon',
      phonePlaceholder: '08xxxxxxxxxx',
      changePhoto: 'Ubah Foto',
      deletePhoto: 'Hapus Foto'
    },
    en: {
      fullName: 'Full Name',
      editProfile: 'Edit Profile',
      cancel: 'Cancel',
      saving: 'Saving...',
      saved: 'Saved!',
      bio: 'Bio',
      bioPlaceholder: 'Tell us about yourself...',
      changeEmail: 'Change Email',
      phone: 'Phone Number',
      phonePlaceholder: '08xxxxxxxxxx',
      changePhoto: 'Change Photo',
      deletePhoto: 'Delete Photo'
    }
  };

  const text = t[language as keyof typeof t] || t.en;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-8 text-white relative">
          {showSaved && (
            <div className="absolute top-4 right-4 flex items-center gap-2 px-4 py-2 bg-green-500 rounded-full animate-fade-in">
              <Check className="h-4 w-4" />
              <span className="text-sm font-bold">{text.saved}</span>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Avatar with upload functionality */}
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                onChange={handleAvatarChange}
                className="hidden"
              />
              
              {user.avatarUrl ? (
                <img
                  src={`http://localhost:8000${user.avatarUrl}`}
                  alt={user.name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-white/30"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center text-4xl font-black border-4 border-white/30">
                  {user.name.charAt(0)}
                </div>
              )}
              
              {/* Avatar overlay with actions */}
              <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {isUploadingAvatar ? (
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleAvatarClick}
                      className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                      title={text.changePhoto}
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </button>
                    {user.avatarUrl && (
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        className="p-2 bg-red-500/50 hover:bg-red-500/70 rounded-full transition-colors"
                        title={text.deletePhoto}
                      >
                        <Trash2 className="h-4 w-4 text-white" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black">{user.name}</h2>
              {user.role && (
                <p className="text-indigo-200 font-semibold mt-0.5">{user.role}</p>
              )}
              <p className="text-indigo-200/80 font-medium mt-1">{user.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-3 mt-3">
                <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider">
                  {user.plan} Plan
                </span>
                <span className="text-xs text-indigo-200">{language === 'id' ? 'Bergabung' : 'Joined'} {user.joinedDate || 'Jan 2024'}</span>
              </div>
            </div>
            
            {/* Edit Button */}
            <div className="md:ml-auto">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                >
                  <Edit2 className="h-4 w-4" />
                  <span className="font-bold text-sm">{text.editProfile}</span>
                </button>
              ) : (
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-xl transition-colors"
                >
                  <X className="h-4 w-4" />
                  <span className="font-bold text-sm">{text.cancel}</span>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <div className="p-8">
          <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
            <UserIcon className="h-5 w-5 text-slate-400" />
            {content.dashboard.profile.personalInfo}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Full Name & Phone */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                {text.fullName}
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-4 bg-white rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-0 font-bold text-slate-900 transition-colors"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <UserIcon className="h-5 w-5 text-slate-400" />
                  <span className="font-bold text-slate-900">{user.name}</span>
                </div>
              )}
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                {text.phone}
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder={text.phonePlaceholder}
                  className="w-full px-4 py-4 bg-white rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-0 font-bold text-slate-900 transition-colors"
                />
              ) : (
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <Phone className="h-5 w-5 text-slate-400" />
                  <span className="font-bold text-slate-900">{user.phone || '-'}</span>
                </div>
              )}
            </div>
            
            {/* Row 2: Email & Member Since */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                {content.dashboard.profile.email}
              </label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="font-bold text-slate-900 flex-1">{user.email}</span>
              </div>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => setShowChangeEmailModal(true)}
                  className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                >
                  {text.changeEmail}
                </button>
              )}
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
                {content.dashboard.profile.memberSince}
              </label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <Calendar className="h-5 w-5 text-slate-400" />
                <span className="font-bold text-slate-900">{user.joinedDate || 'January 2024'}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
              {errorMessage}
            </div>
          )}

          {/* Bio Section */}
          <div className="mt-6">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">
              {text.bio}
            </label>
            {isEditing ? (
              <textarea
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder={text.bioPlaceholder}
                rows={3}
                className="w-full px-4 py-4 bg-white rounded-xl border-2 border-indigo-200 focus:border-indigo-500 focus:ring-0 font-medium text-slate-900 transition-colors resize-none"
              />
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-sm text-slate-600 leading-relaxed">
                  {user.bio || (language === 'id' ? 'Belum ada bio. Klik Edit Profil untuk menambahkan.' : 'No bio yet. Click Edit Profile to add one.')}
                </p>
              </div>
            )}
          </div>
          
          {/* Stats Summary */}
          <div className="mt-8 pt-8 border-t border-slate-100">
            <h3 className="text-lg font-black text-slate-900 mb-6">{content.dashboard.profile.accountStatus}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-2xl text-center">
                <p className="text-2xl font-black text-blue-600">{completedTests}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mt-1">{content.dashboard.stats.tests}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-2xl text-center">
                <p className="text-2xl font-black text-green-600">{avgScore}%</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-400 mt-1">{content.dashboard.stats.score}</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-2xl text-center">
                <p className="text-2xl font-black text-yellow-600">{totalXP}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-500 mt-1">{content.dashboard.stats.xp}</p>
              </div>
              <div className="p-4 bg-orange-50 rounded-2xl text-center">
                <p className="text-2xl font-black text-orange-600">{currentStreak}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-400 mt-1">{content.dashboard.stats.streak}</p>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            {isEditing ? (
              <>
                <Button 
                  variant="primary" 
                  className="flex-1 h-14 rounded-2xl"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  <Save className="mr-2 h-5 w-5" />
                  {isSaving ? text.saving : content.dashboard.profile.save}
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1 h-14 rounded-2xl border-slate-300"
                  onClick={handleCancel}
                >
                  <X className="mr-2 h-5 w-5" />
                  {text.cancel}
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="primary" 
                  className="flex-1 h-14 rounded-2xl"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit2 className="mr-2 h-5 w-5" />
                  {text.editProfile}
                </Button>
                <Button 
                  variant="gradient" 
                  onClick={() => navigate('/plans')} 
                  className="flex-1 h-14 rounded-2xl shadow-lg shadow-indigo-500/30"
                >
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  {content.dashboard.profile.upgrade}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Change Email Modal */}
      <ChangeEmailModal
        isOpen={showChangeEmailModal}
        onClose={() => setShowChangeEmailModal(false)}
        currentEmail={user.email}
        language={language}
        onEmailChanged={handleEmailChanged}
      />
    </div>
  );
};
