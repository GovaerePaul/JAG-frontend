import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.justgift.app',
  appName: 'JustGift',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  // Remove basePath for mobile builds
  plugins: {
    CapacitorHttp: {
      enabled: true
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#1976d2',
      showSpinner: false,
    },
  },
};

export default config;
