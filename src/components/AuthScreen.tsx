import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Logo } from './Common';
import { ArrowRight, Phone, ShieldCheck, RefreshCw, Mail, Lock, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../firebase';
import { RecaptchaVerifier } from 'firebase/auth';

export const AuthScreen: React.FC = () => {
  const { setScreen, t, sendOTP, verifyOTP, loginWithGoogle, loginWithEmail, registerWithEmail, authError, setAuthError } = useApp();

  // Mode Selection
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [isLogin, setIsLogin] = useState(true);

  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  // Phone Auth States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [timer, setTimer] = useState(0);
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Cooldown timer for resend OTP
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Clean up reCAPTCHA verifier on unmount
  useEffect(() => {
    return () => {
      try {
        if ((window as any).recaptchaVerifier) {
          ((window as any).recaptchaVerifier).clear();
          (window as any).recaptchaVerifier = null;
        }
      } catch (e) {
        console.warn("Cleanup of RecaptchaVerifier failed:", e);
      }
    };
  }, []);

  const getOrCreateRecaptcha = () => {
    if ((window as any).recaptchaVerifier) {
      return (window as any).recaptchaVerifier;
    }
    try {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log("reCAPTCHA solved");
        },
        'expired-callback': () => {
          console.log("reCAPTCHA expired");
        }
      });
      (window as any).recaptchaVerifier = verifier;
      return verifier;
    } catch (err) {
      console.error("Error creating RecaptchaVerifier:", err);
      return null;
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneLoading) return;
    setAuthError(null);
    setPhoneLoading(true);

    const fullPhone = `${countryCode.trim()}${phoneNumber.trim()}`;
    if (!phoneNumber || phoneNumber.trim().length < 10) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      setPhoneLoading(false);
      return;
    }

    try {
      const verifier = getOrCreateRecaptcha();
      if (!verifier) {
        throw new Error("Failed to initialize security verification. Please try again.");
      }
      
      await sendOTP(fullPhone, verifier);
      setOtpSent(true);
      setTimer(30);
    } catch (err: any) {
      console.error("Error in handleSendOTP:", err);
      try {
        if ((window as any).recaptchaVerifier) {
          ((window as any).recaptchaVerifier).clear();
          (window as any).recaptchaVerifier = null;
        }
      } catch (e) {}
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0 || phoneLoading) return;
    setAuthError(null);
    setPhoneLoading(true);
    const fullPhone = `${countryCode.trim()}${phoneNumber.trim()}`;
    try {
      const verifier = getOrCreateRecaptcha();
      if (!verifier) {
        throw new Error("Failed to initialize security verification.");
      }
      await sendOTP(fullPhone, verifier);
      setTimer(30);
    } catch (err: any) {
      console.error("Resend OTP error:", err);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneLoading) return;
    setAuthError(null);
    setPhoneLoading(true);

    if (!otpCode || otpCode.trim().length !== 6) {
      setAuthError("Please enter a valid 6-digit OTP code.");
      setPhoneLoading(false);
      return;
    }

    try {
      await verifyOTP(otpCode.trim());
    } catch (err: any) {
      console.error("Error in handleVerifyOTP:", err);
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setEmailLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch (err: any) {
      console.error("Email auth error:", err);
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error("Google login error:", err);
    }
  };

  return (
    <div className="min-h-screen bg-main-gradient flex flex-col md:flex-row">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container"></div>

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
              {authMethod === 'phone'
                ? (otpSent ? t('verifyOtp') : t('loginTitle'))
                : (isLogin ? t('loginTitle') : t('createAccount'))}
            </h2>
            <p className="text-gray-500 mt-2">
              {authMethod === 'phone'
                ? (otpSent ? `${t('otpSentTo')} ${countryCode} ${phoneNumber}` : t('loginSubtitle'))
                : (isLogin ? t('loginSubtitle') : t('joinUsSubtitle'))}
            </p>
          </div>

          {/* Segment Selector for Phone vs Email */}
          {!otpSent && (
            <div className="flex bg-gray-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthMethod('phone');
                }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  authMethod === 'phone'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('phoneNumber') || 'Mobile Number'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthError(null);
                  setAuthMethod('email');
                }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all ${
                  authMethod === 'email'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {t('email') || 'Email'}
              </button>
            </div>
          )}

          {authError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 p-4 rounded-2xl border border-red-100"
            >
              <p className="text-red-600 text-sm font-medium">{authError}</p>
            </motion.div>
          )}

          <div className="space-y-4">
            {authMethod === 'phone' ? (
              /* PHONE OTP LOGIN FLOW */
              <>
                {!otpSent ? (
                  /* Step 1: Request OTP */
                  <form onSubmit={handleSendOTP} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">{t('phoneNumber')}</label>
                      <div className="flex gap-2">
                        <div className="w-24 relative">
                          <input
                            type="text"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            placeholder="+91"
                            className="w-full text-center py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none font-bold text-gray-800"
                          />
                        </div>
                        <div className="flex-1 relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            pattern="[0-9]*"
                            inputMode="numeric"
                            required
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none font-medium text-gray-800 font-bold"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={phoneLoading}
                      className="w-full bg-[#FF8C00] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 animate-fade-in"
                    >
                      {phoneLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {t('continue')}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  /* Step 2: Verify OTP */
                  <form onSubmit={handleVerifyOTP} className="space-y-4">
                    <div className="text-center p-4 bg-orange-50 rounded-2xl border border-orange-100 animate-fade-in">
                      <p className="text-xs text-gray-500">Wrong number entered?</p>
                      <button
                        type="button"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpCode('');
                          setAuthError(null);
                        }}
                        className="text-sm font-bold text-[#FF8C00] hover:underline mt-1"
                      >
                        {t('changeNumber')}
                      </button>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 ml-1">{t('verifyOtp')}</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          pattern="[0-9]*"
                          inputMode="numeric"
                          maxLength={6}
                          required
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="123456"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none text-center font-black tracking-[0.5em] text-lg text-gray-800"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={phoneLoading}
                      className="w-full bg-[#FF8C00] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {phoneLoading ? (
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          {t('verifyAndContinue')}
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>

                    <div className="text-center mt-2">
                      <button
                        type="button"
                        disabled={timer > 0 || phoneLoading}
                        onClick={handleResendOTP}
                        className="text-sm font-bold text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors inline-flex items-center gap-1.5"
                      >
                        <RefreshCw className={`w-4 h-4 ${phoneLoading ? 'animate-spin' : ''}`} />
                        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </form>
                )}
              </>
            ) : (
              /* EMAIL & PASSWORD LOGIN FLOW */
              <form onSubmit={handleSubmitEmail} className="space-y-4 animate-fade-in">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2 overflow-hidden"
                    >
                      <label className="text-sm font-semibold text-gray-700 ml-1">{t('fullName')}</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          required={!isLogin}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="John Doe"
                          className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none text-gray-800"
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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none text-gray-800"
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
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-[#FF8C00] focus:bg-white rounded-2xl transition-all outline-none text-gray-800"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={emailLoading}
                  className="w-full bg-[#FF8C00] text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-200 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {emailLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      {isLogin ? t('login') : t('signup')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <div className="text-center mt-4">
                  <button
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isLogin ? (
                      <>
                        {t('dontHaveAccount') || "Don't have an account?"}{' '}
                        <span className="text-[#FF8C00] font-bold">{t('signup')}</span>
                      </>
                    ) : (
                      <>
                        {t('alreadyHaveAccount') || "Already have an account?"}{' '}
                        <span className="text-[#FF8C00] font-bold">{t('login')}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Social Sign-In (Google) - Only displayed when not verifying OTP */}
          {!otpSent && (
            <div className="space-y-4">
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  {t('or') || 'Or continue with'}
                </span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-100 hover:border-gray-200 rounded-2xl font-bold text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.04,3.1v2.57h3.3c1.93,-1.78 3.04,-4.4 3.04,-7.47C21.68,11.96 21.56,11.5 21.35,11.1z" fill="#4285F4" />
                    <path d="M12,20.88c2.43,0 4.47,-0.8 5.96,-2.2l-3.3,-2.57c-0.9,0.6 -2.07,0.97 -3.3,0.97 -2.34,0 -4.33,-1.58 -5.03,-3.7H2.94v2.66C4.42,19.06 8.01,20.88 12,20.88z" fill="#34A853" />
                    <path d="M6.97,13.38c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7c0,-0.59 0.1,-1.16 0.28,-1.7V7.32H2.94C2.33,8.54 2,9.91 2,11.38c0,1.47 0.33,2.84 0.94,4.06l3.43,-2.66c-0.18,-0.54 -0.28,-1.11 -0.28,-1.7z" fill="#FBBC05" />
                    <path d="M12,5.2c1.32,0 2.51,0.45 3.44,1.35l2.58,-2.58C16.46,2.5 14.43,1.68 12,1.68 8.01,1.68 4.42,3.5 2.94,6.46l3.43,2.66C7.07,6.78 9.06,5.2 12,5.2z" fill="#EA4335" />
                  </g>
                </svg>
                Google
              </button>
            </div>
          )}

          <p className="text-center text-[10px] text-gray-400 leading-relaxed pt-2">
            {t('termsText')}
          </p>
        </div>
      </div>
    </div>
  );
};
