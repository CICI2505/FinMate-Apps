// src/utils/notification-helper.js
const BASE_URL = 'https://story-api.dicoding.dev/v1';
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

// Helper functions
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

export async function isCurrentPushSubscriptionAvailable() {
    console.log('Checking push subscription...');
    if (!('serviceWorker' in navigator)) return false;

    try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        return subscription !== null;
    } catch (error) {
        console.error('Error checking subscription:', error);
        return false;
    }
}

export async function subscribe() {
    console.log('Subscribing to push notifications...');
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
    }

    if (!('PushManager' in window)) {
        throw new Error('Push notifications not supported');
    }

    const registration = await navigator.serviceWorker.ready;

    // Check existing subscription
    let subscription = await registration.pushManager.getSubscription();
    if (subscription) {
        return subscription;
    }

    // Subscribe to push notifications
    subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });

    // Send subscription to server
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
            endpoint: subscription.endpoint,
            keys: {
                p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
                auth: arrayBufferToBase64(subscription.getKey('auth'))
            }
        })
    });

    if (!response.ok) {
        await subscription.unsubscribe();
        throw new Error('Failed to save subscription to server');
    }

    return subscription;
}

export async function unsubscribe() {
    console.log('Unsubscribing from push notifications...');
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
        return;
    }

    // Send unsubscribe request to server first
    const response = await fetch(`${BASE_URL}/notifications/subscribe`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
            endpoint: subscription.endpoint
        })
    });

    if (!response.ok) {
        throw new Error('Failed to remove subscription from server');
    }

    // Then unsubscribe locally
    await subscription.unsubscribe();
}