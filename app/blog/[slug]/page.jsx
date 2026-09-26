import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BlogLayout } from '../page';
import { getPost, posts } from '../posts';

export function generateStaticParams() {
  return posts.map(({ slug }) => ({ slug }));
}

export function generateMetadata({ params }) {
  const post = getPost(params.slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: 'article', url: `/blog/${post.slug}`, title: post.title, description: post.description, images: [{ url: post.image, alt: post.imageAlt }] }
  };
}

export default function BlogPost({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();
  const articleSchema = { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: post.title, description: post.description, datePublished: '2026-09-26', dateModified: '2026-09-26', image: `https://highalpinecleaning.com${post.image}`, author: { '@type': 'Organization', name: 'High Alpine Cleaning' }, publisher: { '@type': 'Organization', name: 'High Alpine Cleaning', logo: { '@type': 'ImageObject', url: 'https://highalpinecleaning.com/brand-icon-512.png' } }, mainEntityOfPage: `https://highalpinecleaning.com/blog/${post.slug}` };
  return <BlogLayout><article className="article"><header className="article-header"><span className="blog-kicker">Vacation rental host guide</span><h1>{post.title}</h1><p className="article-deck">{post.description}</p><span className="post-meta">Published {post.date}</span></header><img className="article-image" src={post.image} alt={post.imageAlt} width="1448" height="1086" /><div className="article-content">{post.sections.map((section) => <section key={section.heading}><h2>{section.heading}</h2>{section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}{section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}</section>)}</div><aside className="article-cta"><h2>Want a turnover partner you can trust?</h2><p>High Alpine Cleaning provides owner-run vacation rental cleaning, on-site linen and towel laundry, restocking, and photo-verified turnover reports.</p><Link href="/contact">Check availability and pricing →</Link></aside><p><Link href="/blog">← All host guides</Link></p></article><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} /></BlogLayout>;
}
