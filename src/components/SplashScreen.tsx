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
    <div className="fixed inset-0 bg-[#9A3412] flex flex-col items-center justify-center z-[100] overflow-hidden">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <Logo className="w-48 h-48" light />
      </motion.div>
      
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: 200 }}
        transition={{ duration: 2, ease: "easeInOut" }}
        className="mt-12 h-1 bg-white/20 rounded-full overflow-hidden"
      >
        <motion.div 
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="h-full w-1/2 bg-white"
        />
      </motion.div>
      
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-white/60 font-medium tracking-widest uppercase text-xs"
      >
        Loading Experience
      </motion.p>
    </div>
  );
};
