import React from 'react';
import { AppProvider, useApp } from './AppContext';
import { SplashScreen } from './components/SplashScreen';
import { AuthScreen } from './components/AuthScreen';
import { HomeScreen } from './components/HomeScreen';
import { ProductDetailsScreen } from './components/ProductDetailsScreen';
import { CartScreen } from './components/CartScreen';
import { CheckoutScreen } from './components/CheckoutScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { AdminDashboard } from './components/AdminDashboard';
import { AllProductsScreen } from './components/AllProductsScreen';
import { WishlistScreen } from './WishlistScreen';
import { AIChatBot } from './components/AIChatBot';
import { PrivacyPolicyScreen } from './components/PrivacyPolicyScreen';
import { LoadingSpinner } from './components/Common';

import { Toaster } from 'sonner';
import { OfflineUI } from './components/OfflineUI';
import { initializePushNotifications } from './services/PushNotificationService';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-6">The application encountered an unexpected error. Please try refreshing the page.</p>
            <div className="text-left bg-gray-50 p-4 rounded-lg mb-6 overflow-auto max-h-40">
              <code className="text-xs text-red-500">{this.state.error?.message}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
            >
              Refresh App
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  const context = useApp();
  
  // Safe destructuring with defaults
  const { currentScreen = 'splash', loading = false } = context || {};
  
  console.log(">>> [FLOW] AppContent render. Screen:", currentScreen, "Loading:", loading);

  const params = new URLSearchParams(window.location.search);
  const isExternalSignIn = params.get('google_signin_external') === 'true';
  const syncId = params.get('syncId');
  const user = context?.user;

  const renderExternalOverlay = () => {
    if (!isExternalSignIn || !syncId) return null;

    return (
      <div className="fixed inset-0 bg-gray-900/95 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-fade-in">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 text-center space-y-6">
          {user ? (
            <>
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="text-4xl">🎉</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Google Login Successful!
              </h2>
              <p className="text-gray-600 font-medium">
                You have successfully authenticated. You can now close this browser tab and safely return to your Android app!
              </p>
              <div className="p-4 bg-green-50 rounded-2xl border border-green-100 text-sm font-semibold text-green-700 break-all">
                Logged in as: {user.email}
              </div>
              <button 
                onClick={() => {
                  try {
                    window.close();
                  } catch (e) {
                    console.warn("Could not close window automatically:", e);
                  }
                }}
                className="w-full py-4 bg-[#3B2F2F] text-white rounded-2xl font-black hover:bg-[#3B2F2F]/90 transition-all shadow-md active:scale-95"
              >
                Done
              </button>
            </>
          ) : (
            <>
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <span className="text-4xl">🔐</span>
              </div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                Authenticating...
              </h2>
              <p className="text-gray-600 font-medium">
                Completing Google authentication in Chrome. Please do not close this window.
              </p>
              <div className="flex justify-center py-2">
                <div className="w-12 h-12 border-4 border-[#3B2F2F] border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  const renderScreen = () => {
    try {
      switch (currentScreen) {
        case 'splash':
          return <SplashScreen />;
        case 'auth':
        case 'login':
        case 'signup':
          return <AuthScreen />;
        case 'home':
          return <HomeScreen />;
        case 'product-details':
          return <ProductDetailsScreen />;
        case 'cart':
          return <CartScreen />;
        case 'checkout':
          return <CheckoutScreen />;
        case 'orders':
          return <OrdersScreen />;
        case 'profile':
          return <ProfileScreen />;
        case 'admin-dashboard':
          return <AdminDashboard />;
        case 'all-products':
          return <AllProductsScreen />;
        case 'wishlist':
          return <WishlistScreen />;
        case 'chat':
          return <AIChatBot />;
        case 'privacy-policy':
          return <PrivacyPolicyScreen />;
        default:
          return <HomeScreen />;
      }
    } catch (error) {
      console.error("Error rendering screen:", error);
      return (
        <div className="p-4 text-center">
          <h2 className="text-xl font-bold text-red-500">Screen Render Error</h2>
          <p className="text-gray-600">Failed to load {currentScreen} screen.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            Retry
          </button>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <div className="w-full min-h-screen relative">
        {renderExternalOverlay()}
        {renderScreen()}
        
        {loading && currentScreen !== 'splash' && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-[100] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  React.useEffect(() => {
    initializePushNotifications();
  }, []);

  return (
    <ErrorBoundary>
      <AppProvider>
        <OfflineUI />
        <AppContent />
        <Toaster position="top-center" richColors />
      </AppProvider>
    </ErrorBoundary>
  );
}
