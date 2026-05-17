import mongoose from 'mongoose';
import defaultAppConfig from './appConfig.defaults.js';

const appConfigSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'mobile-app' },
  identity: {
    appName: { type: String, trim: true, default: defaultAppConfig.identity.appName },
    tagline: { type: String, trim: true, default: defaultAppConfig.identity.tagline },
    versionName: { type: String, trim: true, default: defaultAppConfig.identity.versionName },
    versionCode: { type: String, trim: true, default: defaultAppConfig.identity.versionCode },
    packageName: { type: String, trim: true, default: defaultAppConfig.identity.packageName },
    buildNumber: { type: String, trim: true, default: defaultAppConfig.identity.buildNumber },
  },
  branding: {
    logoUrl: { type: String, trim: true, default: defaultAppConfig.branding.logoUrl },
    appIconUrl: { type: String, trim: true, default: defaultAppConfig.branding.appIconUrl },
    primaryColor: { type: String, trim: true, default: defaultAppConfig.branding.primaryColor },
    secondaryColor: { type: String, trim: true, default: defaultAppConfig.branding.secondaryColor },
    accentColor: { type: String, trim: true, default: defaultAppConfig.branding.accentColor },
    backgroundColor: { type: String, trim: true, default: defaultAppConfig.branding.backgroundColor },
  },
  splash: {
    enabled: { type: Boolean, default: defaultAppConfig.splash.enabled },
    title: { type: String, trim: true, default: defaultAppConfig.splash.title },
    subtitle: { type: String, trim: true, default: defaultAppConfig.splash.subtitle },
    loadingText: { type: String, trim: true, default: defaultAppConfig.splash.loadingText },
    backgroundColor: { type: String, trim: true, default: defaultAppConfig.splash.backgroundColor },
    logoUrl: { type: String, trim: true, default: defaultAppConfig.splash.logoUrl },
    chips: { type: [String], default: defaultAppConfig.splash.chips },
  },
  preview: {
    locationText: { type: String, trim: true, default: defaultAppConfig.preview.locationText },
    searchPlaceholder: { type: String, trim: true, default: defaultAppConfig.preview.searchPlaceholder },
    featuredCategories: { type: [String], default: defaultAppConfig.preview.featuredCategories },
  },
  controls: {
    maintenanceMode: { type: Boolean, default: defaultAppConfig.controls.maintenanceMode },
    maintenanceMessage: { type: String, trim: true, default: defaultAppConfig.controls.maintenanceMessage },
    forceUpdate: { type: Boolean, default: defaultAppConfig.controls.forceUpdate },
    minimumVersion: { type: String, trim: true, default: defaultAppConfig.controls.minimumVersion },
    updateMessage: { type: String, trim: true, default: defaultAppConfig.controls.updateMessage },
    playStoreUrl: { type: String, trim: true, default: defaultAppConfig.controls.playStoreUrl },
    appStoreUrl: { type: String, trim: true, default: defaultAppConfig.controls.appStoreUrl },
  },
  contact: {
    supportEmail: { type: String, trim: true, default: defaultAppConfig.contact.supportEmail },
    supportPhone: { type: String, trim: true, default: defaultAppConfig.contact.supportPhone },
    privacyUrl: { type: String, trim: true, default: defaultAppConfig.contact.privacyUrl },
    termsUrl: { type: String, trim: true, default: defaultAppConfig.contact.termsUrl },
  },
}, { timestamps: true });

const AppConfig = mongoose.model('AppConfig', appConfigSchema);

export default AppConfig;
