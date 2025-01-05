// Import Firebase SDK for Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.2/firebase-messaging.js');

// Firebase config (same config used in index.html)
const firebaseConfig = {
    apiKey: "AIzaSyCyDWTxee3XOcbUNF4e8HF4z7yVHVagzlA",
    authDomain: "vitalityshare.firebaseapp.com",
    projectId: "vitalityshare",
    storageBucket: "vitalityshare.firebasestorage.app",
    messagingSenderId: "568086704658",
    appId: "1:568086704658:web:40fc7126bfa4ed33a35ecb",
    measurementId: "G-LYQDC3SGC9"
};

firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(function(payload) {
  console.log('Received background message: ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
