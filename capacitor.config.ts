export interface CapacitorConfig {
  appId: string;
  appName: string;
  webDir: string;
  bundledWebRuntime?: boolean;
  server?: Record<string, unknown>;
  android?: Record<string, unknown>;
  plugins?: Record<string, unknown>;
}

const config: CapacitorConfig = {
  appId: 'com.aaknova.enterprise',
  appName: 'AAKNOVA',
  webDir: 'dist',
  bundledWebRuntime: false,
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: ['*'],
  },
  android: {
    backgroundColor: '#060E1D',
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    buildOptions: {
      keystorePath: 'aaknova-release.jks',
      keystoreAlias: 'aaknova-release',
      releaseType: 'APK',
      signingType: 'apksigner',
    },
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2200,
      launchAutoHide: true,
      launchFadeOutDuration: 350,
      backgroundColor: '#060E1D',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#060E1D',
      overlaysWebView: false,
    },
    Keyboard: {
      resize: 'body',
      style: 'DARK',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
