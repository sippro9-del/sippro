import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Logo } from './Common';
import { useApp } from '../AppContext';

export const SplashScreen: React.FC = () => {
  const { setScreen, user, loading } = useApp();

  useEffect(() => {
    console.log(">>> [FLOW] SplashScreen check. Loading:", loading, "User:", user?.uid);
    if (!loading) {
      const timer = setTimeout(() => {
        if (user) {
          console.log(">>> [FLOW] SplashScreen transitioning to home");
          setScreen('home');
        } else {
          console.log(">>> [FLOW] SplashScreen transitioning to login");
          setScreen('login');
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [loading, user, setScreen]);

  return (
    <div className="fixed inset-0 bg-warm-gradient flex flex-col items-center justify-center z-[100] overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-32 translate-y-32 blur-3xl" />
      </div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <Logo className="w-40 h-40" light />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="mt-16"
      >
        <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
      </motion.div>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="mt-10 text-white font-bold text-lg md:text-xl"
      >
        Pure Spices, Pure Life
      </motion.p>
    </div>
  );
};
