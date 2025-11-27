import { precacheAndRoute } from "workbox-precaching";
import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

// Injected by Workbox
precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCJnkRJfxoFGnjbpzFweHcA88RFNZ6gLIU",
  authDomain: "fcm1-f49bf.firebaseapp.com",
  projectId: "fcm1-f49bf",
  storageBucket: "fcm1-f49bf.firebasestorage.app",
  messagingSenderId: "33514454153",
  appId: "1:33514454153:web:1b0b71240313e0f3c65a58",
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Handle FCM background messages (Android only)
onBackgroundMessage(messaging, (payload) => {
  const notificationTitle = payload.data?.title || "Notification";
  const notificationBody = payload.data?.body || "You have a new message.";
  const notificationOptions = {
    body: notificationBody,
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

// (Optional) Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});
