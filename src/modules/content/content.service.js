import SiteContent from './content.model.js';
import defaultSiteContent from './content.defaults.js';

const mergeDefaults = (content = {}) => ({
  ...defaultSiteContent,
  ...content,
  footer: {
    ...defaultSiteContent.footer,
    ...(content.footer || {}),
  },
  pages: {
    ...defaultSiteContent.pages,
    ...(content.pages || {}),
  },
});

const getSiteContent = async () => {
  const content = await SiteContent.findOneAndUpdate(
    { key: 'site' },
    { $setOnInsert: { key: 'site', ...defaultSiteContent } },
    { new: true, upsert: true }
  ).lean();

  return mergeDefaults(content);
};

const updateSiteContent = async (payload = {}) => {
  const nextContent = mergeDefaults(payload);
  return SiteContent.findOneAndUpdate(
    { key: 'site' },
    { $set: nextContent },
    { new: true, upsert: true, runValidators: true }
  ).lean();
};

export default { getSiteContent, updateSiteContent };
