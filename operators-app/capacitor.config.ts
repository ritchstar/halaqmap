/**
 * Copyright © 2026 HalaqMap. All Rights Reserved.
 *
 * غلاف iOS للوحة مشغّلي خريطة الحل — مشروع مستقل عن غلاف المستخدم.
 * المحتوى حي من `store.halaqmap.com`. لا شراء داخل التطبيق.
 * تُشغَّل أوامر Capacitor من داخل هذا المجلد وحده.
 */
import type { CapacitorConfig } from '@capacitor/cli';
import {
  OPERATORS_APP_ALLOWED_HOSTS,
  OPERATORS_APP_BACKGROUND_COLOR,
  OPERATORS_APP_DISPLAY_NAME_AR,
  OPERATORS_APP_LIVE_URL,
  OPERATORS_APP_PACKAGE_ID,
} from '../src/config/operatorsAppShell';

const config: CapacitorConfig = {
  appId: OPERATORS_APP_PACKAGE_ID,
  appName: OPERATORS_APP_DISPLAY_NAME_AR,
  webDir: 'web',
  backgroundColor: OPERATORS_APP_BACKGROUND_COLOR,
  server: {
    url: OPERATORS_APP_LIVE_URL,
    cleartext: false,
    errorPath: 'offline.html',
    allowNavigation: [...OPERATORS_APP_ALLOWED_HOSTS],
  },
  ios: {
    scheme: 'App',
    contentInset: 'automatic',
    backgroundColor: OPERATORS_APP_BACKGROUND_COLOR,
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1400,
      launchAutoHide: true,
      backgroundColor: OPERATORS_APP_BACKGROUND_COLOR,
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: OPERATORS_APP_BACKGROUND_COLOR,
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
