importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCrQfHdxkMVoaU75EJsap23A9w7_hJ5wyA",
  authDomain: "sippro-a0656.firebaseapp.com",
  projectId: "sippro-a0656",
  storageBucket: "sippro-a0656.firebasestorage.app",
  messagingSenderId: "937781357519",
  appId: "1:937781357519:web:d5b4c647fbdeed7c3940ba",
  measurementId: "G-XWPE3FJW6L"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/pwa-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
