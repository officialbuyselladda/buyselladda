import mongoose from 'mongoose';
import defaultSiteContent from './content.defaults.js';

const linkSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: '' },
  path: { type: String, trim: true, default: '' },
  url: { type: String, trim: true, default: '' },
  subLabel: { type: String, trim: true, default: '' },
}, { _id: false });

const footerColumnSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: '' },
  links: { type: [linkSchema], default: [] },
}, { _id: false });

const pageSectionSchema = new mongoose.Schema({
  heading: { type: String, trim: true, default: '' },
  body: { type: String, trim: true, default: '' },
}, { _id: false });

const pageSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: '' },
  subtitle: { type: String, trim: true, default: '' },
  accent: { type: String, trim: true, default: 'emerald' },
  updatedText: { type: String, trim: true, default: '' },
  sections: { type: [pageSectionSchema], default: [] },
}, { _id: false });

const siteContentSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'site' },
  footer: {
    brandName: { type: String, trim: true, default: defaultSiteContent.footer.brandName },
    logoUrl: { type: String, trim: true, default: defaultSiteContent.footer.logoUrl },
    tagline: { type: String, trim: true, default: defaultSiteContent.footer.tagline },
    trustTitle: { type: String, trim: true, default: defaultSiteContent.footer.trustTitle },
    trustSubtitle: { type: String, trim: true, default: defaultSiteContent.footer.trustSubtitle },
    bannerButtonText: { type: String, trim: true, default: defaultSiteContent.footer.bannerButtonText },
    bannerButtonPath: { type: String, trim: true, default: defaultSiteContent.footer.bannerButtonPath },
    copyrightText: { type: String, trim: true, default: defaultSiteContent.footer.copyrightText },
    columns: { type: [footerColumnSchema], default: defaultSiteContent.footer.columns },
    bottomLinks: { type: [linkSchema], default: defaultSiteContent.footer.bottomLinks },
    popularCities: { type: [String], default: defaultSiteContent.footer.popularCities },
    socialLinks: { type: [linkSchema], default: defaultSiteContent.footer.socialLinks },
    appButtons: { type: [linkSchema], default: defaultSiteContent.footer.appButtons },
  },
  pages: {
    privacy: { type: pageSchema, default: defaultSiteContent.pages.privacy },
    terms: { type: pageSchema, default: defaultSiteContent.pages.terms },
    help: { type: pageSchema, default: defaultSiteContent.pages.help },
    safety: { type: pageSchema, default: defaultSiteContent.pages.safety },
    support: { type: pageSchema, default: defaultSiteContent.pages.support },
  },
}, { timestamps: true });

const SiteContent = mongoose.model('SiteContent', siteContentSchema);

export default SiteContent;
