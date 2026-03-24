import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Logo } from './Common';

export const AuthScreen: React.FC = () => {
  const { setScreen, t, loginWithGoogle, loginWithFacebook, authError, setAuthError } = useApp();
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      await loginWithFacebook();
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main-gradient flex flex-col md:flex-row">
      {/* Banner Area */}
      <div className="h-64 md:h-screen md:w-1/2 bg-warm-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-white rounded-full -translate-x-16 md:-translate-x-32 -translate-y-16 md:-translate-y-32" />
          <div className="absolute bottom-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-white rounded-full translate-x-16 md:translate-x-32 translate-y-16 md:translate-y-32" />
        </div>
        <Logo className="w-32 h-32 md:w-64 md:h-64 z-10" light />
      </div>

      <div className="flex-1 bg-white -mt-8 md:mt-0 rounded-t-[40px] md:rounded-t-none md:rounded-l-[40px] px-8 md:px-20 py-10 md:py-20 shadow-lg z-20 flex flex-col justify-center">
        <div className="space-y-8 md:space-y-12 max-w-md mx-auto w-full">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('loginTitle')}</h2>
            <p className="text-gray-500 mt-2 md:text-lg">{t('loginSubtitle')}</p>
          </div>

          <div className="space-y-4 md:space-y-6">
            {authError && (
              <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                <p className="text-red-600 text-sm font-medium">{authError}</p>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 bg-white border-2 border-gray-100 text-gray-700 font-bold py-4 md:py-6 rounded-2xl active:scale-95 transition-all hover:bg-gray-50 disabled:opacity-50 shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6 md:w-8 md:h-8" referrerPolicy="no-referrer" />
              {t('googleContinue')}
            </button>

            <button
              onClick={handleFacebookSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-4 bg-[#1877F2] text-white font-bold py-4 md:py-6 rounded-2xl active:scale-95 transition-all hover:bg-[#166fe5] disabled:opacity-50 shadow-[0_6px_16px_rgba(0,0,0,0.12)]"
            >
              <svg className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              {t('facebookContinue')}
            </button>
          </div>

          <p className="text-center text-xs md:text-sm text-gray-400">
            {t('termsText')}
          </p>
        </div>
      </div>
    </div>
  );
};
