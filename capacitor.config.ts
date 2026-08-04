/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف iOS للمستخدم — Capacitor + Live URL (المحتوى من الإنتاج).
 * لا يوجد شراء داخل التطبيق. مسارات الشريك/الدفع تُفتح في Safari من الكود.
 */
import type { CapacitorConfig } from '@capacitor/cli';
import {
  CONSUMER_APP_DISPLAY_NAME_AR,
  CONSUMER_APP_LIVE_ORIGIN,
  CONSUMER_IOS_PACKAGE_ID,
} from './src/config/consumerAppShell';

const config: CapacitorConfig = {
  appId: CONSUMER_IOS_PACKAGE_ID,
  appName: CONSUMER_APP_DISPLAY_NAME_AR,
  webDir: 'dist',
  server: {
    url: CONSUMER_APP_LIVE_ORIGIN,
    cleartext: false,
    allowNavigation: [
      'halaqmap.com',
      'www.halaqmap.com',
      '*.halaqmap.com',
      'https://halaqmap.com/*',
      'https://www.halaqmap.com/*',
    ],
  },
  ios: {
    contentInset: 'automatic',
    scheme: 'HalaqMap',
    backgroundColor: '#0A4F4A',
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1200,
      launchAutoHide: true,
      backgroundColor: '#0A4F4A',
      showSpinner: false,
      androidSplashResourceName: 'splash',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0A4F4A',
    },
  },
};

export default config;
