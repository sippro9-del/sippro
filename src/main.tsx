import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App.tsx';
import './index.css';

// Global error handling for WebView debugging
window.onerror = function(message, source, lineno, colno, error) {
  console.error('Global Error:', { message, source, lineno, colno, error });
  
  // Safe string conversion
  const msgStr = String(message).toLowerCase();
  const srcStr = String(source || '').toLowerCase();
  
  // Ignore/swallow cross-origin script error, third-party files, chrome-extensions and other benign events to prevent platform iframe errors
  if (
    msgStr.includes('script error') || 
    msgStr.includes('third-party') || 
    srcStr.includes('chrome-extension') ||
    srcStr.includes('google-analytics') ||
    srcStr.includes('apis.google.com') ||
    (srcStr === '' && lineno === 0)
  ) {
    console.warn('Swallowing cross-origin / third-party / extension error for preview stability:', { message, source });
    return true; // Prevent default error handling / propagation
  }
  return false;
};

window.onunhandledrejection = function(event) {
  console.error('Unhandled Promise Rejection:', event.reason);
  
  const reasonStr = String(event.reason || '').toLowerCase();
  // Prevent propagation of harmless platform-level promise rejections
  if (
    reasonStr.includes('script error') || 
    reasonStr.includes('firebase') || 
    reasonStr.includes('auth/unauthorized-domain') ||
    reasonStr.includes('third-party')
  ) {
    console.warn('Swallowing unhandled promise rejection for preview stability:', event.reason);
    event.preventDefault();
  }
};

// Log environment info
console.log('App Environment:', {
  isCapacitor: !!(window as any).Capacitor,
  platform: (window as any).Capacitor?.getPlatform() || 'web',
  userAgent: navigator.userAgent,
  location: window.location.href
});

// Hide Capacitor splash screen after app loads
window.addEventListener('load', async () => {
  try {
    await SplashScreen.hide();
  } catch (e) {
    console.warn('Capacitor SplashScreen not available');
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  const errorDiv = document.createElement('div');
  errorDiv.style.color = 'red';
  errorDiv.style.padding = '20px';
  errorDiv.style.textAlign = 'center';
  errorDiv.innerHTML = '<h1>Critical Error: Root element not found</h1><p>Please check your index.html file.</p>';
  document.body.appendChild(errorDiv);
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
