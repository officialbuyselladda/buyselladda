const defaultAppConfig = {
  identity: {
    appName: 'BuySellAdda',
    tagline: 'Har Deal, Ek Nayi Shuruaat',
    versionName: '1.0.0',
    versionCode: '1',
    packageName: 'com.dealkro.app',
    buildNumber: '1',
  },
  branding: {
    logoUrl: '',
    appIconUrl: '',
    primaryColor: '#10B981',
    secondaryColor: '#3B82F6',
    accentColor: '#F97316',
    backgroundColor: '#FFFFFF',
  },
  splash: {
    enabled: true,
    title: 'BuySellAdda',
    subtitle: 'Har Deal, Ek Nayi Shuruaat',
    loadingText: 'Loading fresh deals near you',
    backgroundColor: '#FFFFFF',
    logoUrl: '',
    chips: ['Nearby', 'Verified', 'Chat'],
  },
  preview: {
    locationText: 'India',
    searchPlaceholder: 'Search cars, phones, furniture...',
    featuredCategories: ['Electronics', 'Vehicles', 'Property', 'Services'],
  },
  controls: {
    maintenanceMode: false,
    maintenanceMessage: 'App maintenance is in progress. Please try again later.',
    forceUpdate: false,
    minimumVersion: '1.0.0',
    updateMessage: 'Please update the app to continue.',
    playStoreUrl: '',
    appStoreUrl: '',
  },
  contact: {
    supportEmail: 'support@buyselladda.com',
    supportPhone: '',
    privacyUrl: '/privacy',
    termsUrl: '/terms',
  },
};

export default defaultAppConfig;
