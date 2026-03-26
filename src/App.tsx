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
    <div className="min-h-screen bg-main-gradient relative overflow-x-hidden">
      <div className="max-w-7xl mx-auto bg-transparent min-h-screen shadow-lg relative">
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
