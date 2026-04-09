import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Logo } from './Common';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AuthScreen: React.FC = () => {
  const { setScreen, t, loginWithGoogle, loginWithEmail, registerWithEmail, authError, setAuthError } = useApp();
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-main-gradient flex flex-col md:flex-row">
      {/* Banner Area */}
      <div className="h-48 md:h-screen md:w-1/2 bg-warm-gradient relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 md:w-64 h-32 md:h-64 bg-white rounded-full -translate-x-16 md:-translate-x-32 -translate-y-16 md:-translate-y-32" />
          <div className="absolute bottom-0 right-0 w-48 md:w-96 h-48 md:h-96 bg-white rounded-full translate-x-16 md:translate-x-32 translate-y-16 md:translate-y-32" />
        </div>
        <Logo className="w-24 h-24 md:w-64 md:h-64 z-10" light />
      </div>

      <div className="flex-1 bg-white -mt-8 md:mt-0 rounded-t-[40px] md:rounded-t-none md:rounded-l-[40px] px-6 md:px-20 py-10 md:py-20 shadow-lg z-20 flex flex-col justify-center overflow-y-auto">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              {isLogin ? t('loginTitle') : t('createAccount')}
            </h2>
            <p className="text-gray-500 mt-2">
              {isLogin ? t('loginSubtitle') : t('joinUsSubtitle')}
            </p>
          </div>

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 p-4 rounded-2xl border border-red-100"
            >
              <p className="text-red-600 text-sm font-medium">{authError}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <label className="text-sm font-semibold text-gray-700 ml-1">{t('fullName')}</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 ml-1">{t('email')}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-semibold text-gray-700">{t('password')}</label>
                {isLogin && (
                  <button type="button" className="text-xs font-bold text-[#FF8C00] hover:underline">
                    {t('forgotPassword')}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF8C00] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? t('login') : t('signup')}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-4 text-gray-400 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="flex items-center justify-center gap-3 bg-white border-2 border-gray-100 text-gray-700 font-bold py-4 rounded-2xl active:scale-[0.98] transition-all hover:bg-gray-50 disabled:opacity-50 shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" referrerPolicy="no-referrer" />
              Google
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              {isLogin ? (
                <>
                  {t('dontHaveAccount')}{' '}
                  <span className="text-[#FF8C00] font-bold">{t('signup')}</span>
                </>
              ) : (
                <>
                  {t('alreadyHaveAccount')}{' '}
                  <span className="text-[#FF8C00] font-bold">{t('login')}</span>
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[10px] text-gray-400 leading-relaxed">
            {t('termsText')}
          </p>
        </div>
      </div>
    </div>
  );
};
