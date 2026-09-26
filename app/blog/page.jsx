import Link from 'next/link';
import { posts } from './posts';

export const metadata = {
  title: 'Vacation Rental Cleaning Blog',
  description: 'Practical turnover, cleaning, and guest-readiness guidance for Colorado Springs and Pikes Peak vacation rental hosts.',
  alternates: { canonical: '/blog' },
  openGraph: { type: 'website', url: '/blog', title: 'Vacation Rental Cleaning Blog | High Alpine Cleaning' }
};

export default function BlogIndex() {
  return <BlogLayout><section className="blog-hero"><span className="blog-kicker">For Pikes Peak hosts</span><h1>Better turnovers, better guest stays.</h1><p>Practical guidance for vacation rental hosts in Colorado Springs and the Pikes Peak region—from cleaning systems to the small details that protect five-star reviews.</p></section><section className="post-grid" aria-label="Blog posts">{posts.map((post) => <Link className="post-card" href={`/blog/${post.slug}`} key={post.slug}><img src={post.image} alt={post.imageAlt} width="1448" height="1086" /><div className="post-card-copy"><span className="post-meta">{post.date}</span><h2>{post.title}</h2><p>{post.description}</p></div></Link>)}</section></BlogLayout>;
}

export function BlogLayout({ children }) {
  return <div className="blog-shell"><header className="blog-header"><div className="blog-header-inner"><Link className="blog-brand" href="/"><img src="/brand-icon-96.png" alt="" width="36" height="36" />High Alpine Cleaning</Link><nav className="blog-nav" aria-label="Blog navigation"><Link href="/services">Services</Link><Link href="/areas">Service areas</Link><Link href="/blog">Blog</Link><Link href="/contact">Get a quote</Link></nav></div></header><main className="blog-main">{children}</main><footer className="blog-footer"><div className="blog-footer-inner"><p>Owner-run vacation rental turnover cleaning across Colorado Springs and the Pikes Peak region.</p></div></footer></div>;
}
