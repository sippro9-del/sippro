import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App.tsx';
import './index.css';

// Register service worker for PWA support
registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
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
