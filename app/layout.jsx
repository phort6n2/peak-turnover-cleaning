import './site.css';

export const metadata = {
  metadataBase: new URL('https://highalpinecleaning.com'),
  title: { default: 'High Alpine Cleaning', template: '%s | High Alpine Cleaning' },
  description: 'Owner-run Airbnb and vacation rental turnover cleaning across Colorado Springs and the Pikes Peak region.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
