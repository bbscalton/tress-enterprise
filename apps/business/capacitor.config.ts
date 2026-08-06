import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tressenterprise.business',
  appName: 'Tress Enterprise',
  webDir: 'dist',
  server: {
    url: 'https://fleetrentals-app.web.app',
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
  },
};

export default config;
