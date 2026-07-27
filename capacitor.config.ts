import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.blitzcrm.app',
  appName: 'Blitz CRM',
  webDir: 'out',
  server: {
    url: 'https://blitz-smart-sales.vercel.app/login',
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
