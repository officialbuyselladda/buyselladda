const defaultSiteContent = {
  footer: {
    brandName: 'BuySellAdda',
    logoUrl: '/logo-1.png',
    tagline: 'Har Deal, Ek Nayi Shuruaat.\nBuy and sell locally with confidence.',
    trustTitle: 'Trusted by 10M+ users',
    trustSubtitle: "India's #1 buying & selling platform",
    bannerButtonText: 'Post Your Ad',
    bannerButtonPath: '/create-product',
    copyrightText: 'BuySellAdda. All rights reserved',
    columns: [
      {
        title: 'Buy & Sell',
        links: [
          { label: 'Post Free Ad', path: '/create-product' },
          { label: 'My Ads', path: '/my-products' },
          { label: 'Profile', path: '/profile' },
        ],
      },
      {
        title: 'Browse',
        links: [
          { label: 'All Categories', path: '/categories' },
          { label: 'Search', path: '/search' },
          { label: 'Favorites', path: '/favorites' },
        ],
      },
      {
        title: 'Account',
        links: [
          { label: 'Login', path: '/login' },
          { label: 'Sign Up', path: '/register' },
          { label: 'Messages', path: '/chats' },
        ],
      },
      {
        title: 'Help',
        links: [
          { label: 'Contact', path: '/contact' },
          { label: 'Safety', path: '/safety' },
          { label: 'Report Problem', path: '/report' },
          { label: 'Support', path: '/support' },
        ],
      },
    ],
    bottomLinks: [
      { label: 'Privacy Policy', path: '/privacy' },
      { label: 'Terms of Use', path: '/terms' },
      { label: 'Help', path: '/help' },
    ],
    popularCities: ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'],
    socialLinks: [
      { label: 'Facebook', url: 'https://www.facebook.com/buyselladda' },
      { label: 'Twitter', url: 'https://x.com/buyselladda' },
      { label: 'Instagram', url: 'https://www.instagram.com/buyselladda/' },
      { label: 'Youtube', url: 'https://www.youtube.com/@buyselladda' },
    ],
    appButtons: [
      { label: 'App Store', subLabel: 'iOS', url: '#' },
      { label: 'Google Play', subLabel: 'Android', url: '#' },
    ],
  },
  pages: {
    privacy: {
      title: 'Privacy Policy',
      subtitle: 'Your privacy matters. We protect your personal information and explain how we collect, use, and safeguard your data.',
      accent: 'orange',
      updatedText: 'January 1, 2025',
      sections: [
        { heading: '1. Information We Collect', body: 'We collect information you provide directly, such as your name, email, phone number, and location when you create an account, post ads, or contact us.' },
        { heading: '2. How We Use Your Information', body: 'Your data helps us provide services, improve our platform, communicate with you, and prevent fraud. We never sell your personal information.' },
        { heading: '3. Data Sharing', body: 'We share data only with service providers under strict agreements and when required by law. Your ads may be visible to other users.' },
        { heading: '4. Your Rights', body: 'You can access, update, or delete your information anytime. Contact us for help with privacy requests.' },
      ],
    },
    terms: {
      title: 'Terms of Use',
      subtitle: 'By using BuySellAdda, you agree to these terms. Please read carefully.',
      accent: 'emerald',
      updatedText: 'January 1, 2025',
      sections: [
        { heading: '1. Acceptance of Terms', body: 'These Terms govern your use of BuySellAdda platform. Continued use means acceptance.' },
        { heading: '2. User Conduct', body: 'No spam, illegal content, scams, harassment, or counterfeit goods. Respect other users and post genuine local buying and selling listings.' },
        { heading: '3. Account Responsibility', body: "Keep your login secure. You're responsible for all activity under your account." },
      ],
    },
    help: {
      title: 'Help',
      subtitle: 'Find answers and get support for using BuySellAdda.',
      accent: 'blue',
      updatedText: 'January 1, 2025',
      sections: [
        { heading: 'Buying safely', body: 'Check product details, meet in safe public places, and avoid advance payments to unknown users.' },
        { heading: 'Selling faster', body: 'Use clear photos, honest descriptions, and fair pricing to receive better responses.' },
      ],
    },
    safety: {
      title: 'Safety',
      subtitle: 'Stay safe while buying and selling locally.',
      accent: 'orange',
      updatedText: 'January 1, 2025',
      sections: [
        { heading: 'Meet safely', body: 'Prefer public places and tell someone where you are going.' },
        { heading: 'Avoid scams', body: 'Never share OTPs, passwords, banking PINs, or sensitive account details.' },
      ],
    },
    support: {
      title: 'Support',
      subtitle: 'Need help? Our team is here for you.',
      accent: 'emerald',
      updatedText: 'January 1, 2025',
      sections: [
        { heading: 'Contact support', body: 'Send us details about your issue and our team will review it as soon as possible.' },
      ],
    },
  },
};

export default defaultSiteContent;
