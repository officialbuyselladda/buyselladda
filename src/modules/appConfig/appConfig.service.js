import AppConfig from './appConfig.model.js';
import defaultAppConfig from './appConfig.defaults.js';

const mergeConfig = (config = {}) => ({
  identity: { ...defaultAppConfig.identity, ...(config.identity || {}) },
  branding: { ...defaultAppConfig.branding, ...(config.branding || {}) },
  splash: { ...defaultAppConfig.splash, ...(config.splash || {}) },
  preview: { ...defaultAppConfig.preview, ...(config.preview || {}) },
  controls: { ...defaultAppConfig.controls, ...(config.controls || {}) },
  contact: { ...defaultAppConfig.contact, ...(config.contact || {}) },
  homeLayout: { ...defaultAppConfig.homeLayout, ...(config.homeLayout || {}) },
  features: { ...defaultAppConfig.features, ...(config.features || {}) },
  trustSafety: { ...defaultAppConfig.trustSafety, ...(config.trustSafety || {}) },
  growth: { ...defaultAppConfig.growth, ...(config.growth || {}) },
});

const getAppConfig = async () => {
  const config = await AppConfig.findOneAndUpdate(
    { key: 'mobile-app' },
    { $setOnInsert: { key: 'mobile-app', ...defaultAppConfig } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return mergeConfig(config);
};

const updateAppConfig = async (payload = {}) => {
  const merged = mergeConfig(payload);
  const config = await AppConfig.findOneAndUpdate(
    { key: 'mobile-app' },
    { $set: merged },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();

  return mergeConfig(config);
};

export default { getAppConfig, updateAppConfig };
