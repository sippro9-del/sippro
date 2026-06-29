import React from 'react';
import { Header, BottomNav } from './Common';
import { useApp } from '../AppContext';
import { Shield, Lock, Eye, Mail, AlertTriangle } from 'lucide-react';

export const PrivacyPolicyScreen: React.FC = () => {
  const { setScreen } = useApp();

  return (
    <div className="pb-32 bg-main-gradient min-h-screen">
      <Header showBack onBack={() => setScreen('profile')} title="Privacy Policy" />
      
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        <section className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-sm border border-orange-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
              <Shield size={24} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Data Privacy Commitment</h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            This app collects and processes limited user data to improve functionality and user experience. 
            We are committed to protecting your personal information and your right to privacy.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Eye size={20} />
              <h3 className="font-bold text-lg">Data Collection</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
              <li>User inputs (chat messages with AI)</li>
              <li>Basic device information for analytics</li>
              <li>Authentication details via Firebase</li>
              <li>Order history and favorites</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 text-green-600">
              <Lock size={20} />
              <h3 className="font-bold text-lg">Usage & Purpose</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 list-disc pl-4">
              <li>To provide AI-generated responses</li>
              <li>To process and track your orders</li>
              <li>To improve app performance</li>
              <li>To personalize your experience</li>
            </ul>
          </div>
        </section>

        <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Third-party Services</h3>
          <p className="text-gray-600 text-sm mb-6 leading-relaxed">
            We use trusted third-party services to provide essential app features:
          </p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-medium text-gray-700">Google Firebase</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">AUTH • NOTIFICATIONS</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
              <span className="font-medium text-gray-700">Google Gemini AI</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold">AI CHATBOT</span>
            </div>
          </div>
        </section>

        <section className="bg-amber-50 border border-amber-100 rounded-3xl p-8">
          <div className="flex items-center gap-3 mb-4 text-amber-700">
            <AlertTriangle size={24} />
            <h3 className="text-xl font-bold">Disclaimer</h3>
          </div>
          <p className="text-amber-800 text-sm leading-relaxed font-medium">
            AI-generated responses (Spice Assistant) may not always be 100% accurate. 
            Users should verify important information, especially related to health or safety, independently.
          </p>
        </section>

        <section className="flex flex-col items-center text-center py-8">
          <Mail className="text-gray-400 mb-4" size={32} />
          <h3 className="text-lg font-bold text-gray-800 mb-2">Questions?</h3>
          <p className="text-gray-500 text-sm max-w-sm">
            If you have any privacy concerns or want to request data deletion, contact us at:
          </p>
          <a href="mailto:sippro9@gmail.com" className="text-primary font-bold mt-2 hover:underline">
            sippro9@gmail.com
          </a>
        </section>

        <div className="text-center text-[10px] text-gray-400 font-medium pt-8">
          LAST UPDATED: APRIL 17, 2026
        </div>
      </div>

      <BottomNav active="profile" onNavigate={setScreen} />
    </div>
  );
};
