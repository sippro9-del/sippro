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

const AppContent: React.FC = () => {
  const appData = useApp() || {};
const currentScreen = appData.currentScreen || "home";
const loading = appData.loading || false;

  const renderScreen = () => {
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
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
