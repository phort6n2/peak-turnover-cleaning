/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return {
      afterFiles: [
        { source: '/', destination: '/index.html' },
        { source: '/services', destination: '/services.html' },
        { source: '/pricing', destination: '/pricing.html' },
        { source: '/areas', destination: '/areas.html' },
        { source: '/areas/:city', destination: '/areas/:city.html' },
        { source: '/story', destination: '/story.html' },
        { source: '/faq', destination: '/faq.html' },
        { source: '/contact', destination: '/contact.html' },
        { source: '/privacy', destination: '/privacy.html' },
        { source: '/terms', destination: '/terms.html' },
        { source: '/thank-you', destination: '/thank-you.html' }
      ]
    };
  }
};

export default nextConfig;
