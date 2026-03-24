import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../AppContext';
import { Header, BottomNav } from './Common';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { languages } from '../translations';
import { NotificationPreferences } from '../types';

export const ProfileScreen: React.FC = () => {
  const { profile, setScreen, updateProfile, t, setLanguage, language, updateNotificationPreferences } = useApp();
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [isEditingLanguage, setIsEditingLanguage] = useState(false);
  const [isEditingNotifications, setIsEditingNotifications] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    city: profile?.city || '',
    state: profile?.state || '',
    pincode: profile?.pincode || '',
  });
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    setScreen('login');
  };

  const handleUpdateAddress = async () => {
    setLoading(true);
    try {
      await updateProfile(formData);
      setIsEditingAddress(false);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = async (key: keyof NotificationPreferences) => {
    if (!profile?.notificationPreferences) return;
    const newPrefs = {
      ...profile.notificationPreferences,
      [key]: !profile.notificationPreferences[key]
    };
    await updateNotificationPreferences(newPrefs);
  };

  if (isEditingAddress) {
    return (
      <div className="pb-24 md:pb-12 bg-main-gradient min-h-screen">
        <Header title={t('shippingAddress')} showBack onBack={() => setIsEditingAddress(false)} />
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-6">
          <div className="bg-white p-6 md:p-10 rounded-2xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] space-y-6">
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-400 uppercase ml-1">{t('fullName')}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 md:px-6 md:py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all mt-1 md:text-lg"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-400 uppercase ml-1">{t('phoneNumber')}</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 md:px-6 md:py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all mt-1 md:text-lg"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-400 uppercase ml-1">{t('fullAddress')}</label>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-3 md:px-6 md:py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all mt-1 h-24 md:h-32 resize-none md:text-lg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="text-xs md:text-sm font-bold text-gray-400 uppercase ml-1">{t('city')}</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 md:px-6 md:py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all mt-1 md:text-lg"
                />
              </div>
              <div>
                <label className="text-xs md:text-sm font-bold text-gray-400 uppercase ml-1">{t('state')}</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 md:px-6 md:py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all mt-1 md:text-lg"
                />
              </div>
            </div>
            <div>
              <label className="text-xs md:text-sm font-bold text-gray-400 uppercase ml-1">{t('pincode')}</label>
              <input
                type="text"
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-3 md:px-6 md:py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-1 focus:ring-primary outline-none transition-all mt-1 md:text-lg"
              />
            </div>
          </div>
          <button 
            onClick={handleUpdateAddress}
            disabled={loading}
            className="w-full bg-primary text-white font-bold py-4 md:py-6 rounded-2xl shadow-[0_4px_10px_rgba(249,115,22,0.3)] active:scale-95 transition-all disabled:opacity-50 md:text-xl"
          >
            {loading ? t('processing') : t('saveChanges')}
          </button>
        </div>
        <BottomNav active="profile" onNavigate={setScreen} />
      </div>
    );
  }

  if (isEditingLanguage) {
    return (
      <div className="pb-24 md:pb-12 bg-main-gradient min-h-screen">
        <Header title={t('language')} showBack onBack={() => setIsEditingLanguage(false)} />
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsEditingLanguage(false);
              }}
              className={`w-full flex items-center justify-between p-6 md:p-8 rounded-2xl border-2 transition-all ${
                language === lang.code 
                ? 'bg-primary/5 border-primary shadow-sm' 
                : 'bg-white border-gray-100 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-start">
                <span className={`font-bold md:text-lg ${language === lang.code ? 'text-primary' : 'text-gray-700'}`}>
                  {lang.nativeName}
                </span>
                <span className="text-xs md:text-sm text-gray-400">{lang.name}</span>
              </div>
              {language === lang.code && (
                <div className="w-6 h-6 md:w-8 md:h-8 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 md:w-5 md:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
        <BottomNav active="profile" onNavigate={setScreen} />
      </div>
    );
  }

  if (isEditingNotifications) {
    const prefs = profile?.notificationPreferences || { orderUpdates: true, specialOffers: true, newProducts: true };
    return (
      <div className="pb-24 md:pb-12 bg-main-gradient min-h-screen">
        <Header title={t('notifications')} showBack onBack={() => setIsEditingNotifications(false)} />
        <div className="max-w-3xl mx-auto px-4 py-8 md:py-12 space-y-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] overflow-hidden">
            <NotificationToggle 
              label={t('orderUpdates')} 
              active={prefs.orderUpdates} 
              onToggle={() => handleToggleNotification('orderUpdates')} 
            />
            <NotificationToggle 
              label={t('specialOffers')} 
              active={prefs.specialOffers} 
              onToggle={() => handleToggleNotification('specialOffers')} 
            />
            <NotificationToggle 
              label={t('newProducts')} 
              active={prefs.newProducts} 
              onToggle={() => handleToggleNotification('newProducts')} 
            />
          </div>
        </div>
        <BottomNav active="profile" onNavigate={setScreen} />
      </div>
    );
  }

  return (
    <div className="pb-24 md:pb-12 bg-main-gradient min-h-screen">
      <Header title={t('profile')} />
      
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-24">
        {/* Profile Header */}
        <div className="flex flex-col items-center mb-12 md:mb-16">
          <div className="w-32 h-32 md:w-48 md:h-48 bg-primary rounded-full flex items-center justify-center text-white text-5xl md:text-7xl font-bold shadow-[0_6px_16px_rgba(0,0,0,0.12)] mb-8 md:mb-10 ring-8 ring-white">
            {profile?.name?.charAt(0) || 'U'}
          </div>
          <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2 tracking-tight drop-shadow-sm">{profile?.name || 'User'}</h3>
          <p className="text-gray-500 text-lg md:text-xl font-medium opacity-70">{profile?.email || 'email@example.com'}</p>
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {profile?.role === 'admin' && (
            <ProfileMenuItem 
              icon="🛠️" 
              label={t('adminPanel')} 
              onClick={() => setScreen('admin-dashboard')} 
            />
          )}
          <ProfileMenuItem 
            icon="📦" 
            label={t('orders')} 
            onClick={() => setScreen('orders')} 
          />
          <ProfileMenuItem 
            icon="📍" 
            label={t('shippingAddress')} 
            onClick={() => setIsEditingAddress(true)} 
          />
          <ProfileMenuItem 
            icon="🌐" 
            label={t('language')} 
            onClick={() => setIsEditingLanguage(true)} 
          />
          <ProfileMenuItem 
            icon="🔔" 
            label={t('notifications')} 
            onClick={() => setIsEditingNotifications(true)} 
          />
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-between p-6 md:p-8 bg-white rounded-2xl text-red-600 font-bold active:scale-95 transition-all hover:bg-red-50 border border-red-100 md:col-span-2 mt-4 md:mt-6 shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center gap-4 md:gap-6">
              <span className="text-2xl md:text-3xl">🚪</span>
              <span className="text-lg md:text-xl">{t('logout')}</span>
            </div>
            <svg className="w-6 h-6 md:w-8 md:h-8 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" />
            </svg>
          </button>
        </div>
      </div>

      <BottomNav active="profile" onNavigate={setScreen} />
    </div>
  );
};

const NotificationToggle: React.FC<{ label: string; active: boolean; onToggle: () => void }> = ({ label, active, onToggle }) => (
  <div className="flex items-center justify-between p-5 md:p-8 border-b border-gray-50 last:border-0">
    <span className="font-bold text-gray-700 md:text-xl">{label}</span>
    <button 
      onClick={onToggle}
      className={`w-14 h-7 md:w-16 md:h-8 rounded-full transition-all relative ${active ? 'bg-primary shadow-sm' : 'bg-gray-200'}`}
    >
      <div className={`absolute top-1 w-5 h-5 md:w-6 md:h-6 bg-white rounded-full transition-all shadow-md ${active ? 'right-1' : 'left-1'}`} />
    </button>
  </div>
);

const ProfileMenuItem: React.FC<{ icon: string; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 md:p-6 bg-white rounded-2xl border border-gray-100 shadow-[0_6px_16px_rgba(0,0,0,0.12)] active:scale-98 transition-all hover:bg-gray-50"
  >
    <div className="flex items-center gap-4 md:gap-6">
      <span className="text-xl md:text-2xl">{icon}</span>
      <span className="font-bold text-gray-700 md:text-lg">{label}</span>
    </div>
    <svg className="w-5 h-5 md:w-6 md:h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  </button>
);
