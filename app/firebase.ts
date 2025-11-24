// lib/firebase.ts
//
// Client-side Firebase + FCM helper for Next.js + TypeScript.
// - Initializes Firebase app (singleton)
// - Provides functions to get FCM token
// - Optionally schedules daily notifications by POSTing to /api/schedule

"use client";

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getMessaging,
  isSupported,
  Messaging,
  getToken,
} from "firebase/messaging";
import moment,{ Moment } from "moment-timezone";
import {firebaseConfig} from "./firebaseConfig";
import {fcmVapidKey} from "./fcmVapidKey";
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  // This will help you catch config issues in dev
  // (In production you might want to log instead of throw)
  console.warn("Firebase config env vars are missing.");
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Lazily create Messaging instance only in environments that support it
const messagingPromise: Promise<Messaging | null> =
  typeof window === "undefined"
    ? Promise.resolve(null)
    : isSupported().then((supported) =>
        supported ? getMessaging(app) : null
      );

// Helper to register the FCM service worker
async function registerFcmServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }

  // This must match your actual SW path in public/
  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

// Core helper to actually get the FCM token
async function internalGetFcmToken(): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("FCM token can only be obtained in the browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Notification permission was not granted.");
  }

  const messaging = await messagingPromise;
  if (!messaging) {
    throw new Error("Firebase Messaging is not supported in this environment.");
  }

  const registration = await registerFcmServiceWorker();

  const vapidKey = fcmVapidKey;
  if (!vapidKey) {
    throw new Error("vapid key is not set.");
  }

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Failed to obtain FCM token (null/empty).");
  }

  return token;
}

// --- Public API ---

/**
 * Just get the FCM token for the current user/device.
 * Use this if you want to control what happens with the token yourself.
 */
export async function getFcmTokenOnly(): Promise<string> {
  return internalGetFcmToken();
}

/**
 * Get the FCM token and immediately schedule a daily notification
 * by POSTing token + hour + minute + timezone to your /api/schedule endpoint.
 *
 * @param hour   0–23
 * @param minute 0–59
 */
export async function getFcmTokenAndSchedule(time: Moment): Promise<{ token: string }> {
    const hour = time.hour();
    const minute = time.minute();
    if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Hour must be 0–23 and minute must be 0–59.");
  }

  const token = await internalGetFcmToken();

  const timezone = moment.tz.guess();

  const res = await fetch("/api/scheduleNotifications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fcmToken: token,
      time,
      timeZone:timezone,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Failed to save schedule: ${res.status} ${res.statusText} ${text}`
    );
  }

  return { token };
}
