import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import { Logo } from './Common';
import { ArrowRight, Phone, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { auth } from '../firebase';
import { RecaptchaVerifier } from 'firebase/auth';

export const AuthScreen: React.FC = () => {
  const { setScreen, t, sendOTP, verifyOTP, authError, setAuthError } = useApp();

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
              {otpSent ? t('verifyOtp') : t('loginTitle')}
            </h2>
            <p className="text-gray-500 mt-2">
              {otpSent ? `${t('otpSentTo')} ${countryCode} ${phoneNumber}` : t('loginSubtitle')}
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

          <div className="space-y-4">
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
          </div>

          <p className="text-center text-[10px] text-gray-400 leading-relaxed">
            {t('termsText')}
          </p>
        </div>
      </div>
    </div>
  );
};
