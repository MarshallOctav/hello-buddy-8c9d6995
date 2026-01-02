import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  jsonLd?: Record<string, any>;
}

const defaultSEO = {
  title: 'Diagnospace - AI-Powered Business & Career Diagnostic Platform',
  description: 'Diagnospace adalah platform diagnostik berbasis AI yang membantu profesional dan pengusaha mengidentifikasi kelemahan tersembunyi dalam bisnis dan karir. Dapatkan analisis komprehensif dalam 5 menit.',
  keywords: 'business diagnostic, career assessment, AI analysis, productivity audit, leadership test, financial health check, business health, career growth, professional development, skill gap analysis',
  image: 'https://diagnospace.lovable.app/og-image.jpg',
  url: 'https://diagnospace.lovable.app',
  siteName: 'Diagnospace',
  locale: 'id_ID',
  twitterHandle: '@diagnospace',
};

export const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
  jsonLd,
}: SEOProps) => {
  const seoTitle = title ? `${title} | Diagnospace` : defaultSEO.title;
  const seoDescription = description || defaultSEO.description;
  const seoKeywords = keywords || defaultSEO.keywords;
  const seoImage = image || defaultSEO.image;
  const seoUrl = url || defaultSEO.url;

  useEffect(() => {
    // Update document title
    document.title = seoTitle;

    // Helper function to update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement;
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attr, name);
        document.head.appendChild(meta);
      }
      meta.content = content;
    };

    // Basic Meta Tags
    updateMetaTag('description', seoDescription);
    updateMetaTag('keywords', seoKeywords);
    updateMetaTag('author', author || 'Diagnospace Team');
    updateMetaTag('robots', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    updateMetaTag('googlebot', 'index, follow');
    
    // Open Graph Tags
    updateMetaTag('og:title', seoTitle, true);
    updateMetaTag('og:description', seoDescription, true);
    updateMetaTag('og:image', seoImage, true);
    updateMetaTag('og:image:width', '1200', true);
    updateMetaTag('og:image:height', '630', true);
    updateMetaTag('og:image:alt', seoTitle, true);
    updateMetaTag('og:url', seoUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', defaultSEO.siteName, true);
    updateMetaTag('og:locale', defaultSEO.locale, true);

    // Twitter Card Tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', seoTitle);
    updateMetaTag('twitter:description', seoDescription);
    updateMetaTag('twitter:image', seoImage);
    updateMetaTag('twitter:site', defaultSEO.twitterHandle);
    updateMetaTag('twitter:creator', defaultSEO.twitterHandle);

    // Article specific tags
    if (type === 'article') {
      if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
      if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
      if (author) updateMetaTag('article:author', author, true);
    }

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = seoUrl;

    // JSON-LD Structured Data
    const defaultJsonLd = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${defaultSEO.url}/#website`,
          'url': defaultSEO.url,
          'name': defaultSEO.siteName,
          'description': defaultSEO.description,
          'publisher': { '@id': `${defaultSEO.url}/#organization` },
          'potentialAction': {
            '@type': 'SearchAction',
            'target': {
              '@type': 'EntryPoint',
              'urlTemplate': `${defaultSEO.url}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          }
        },
        {
          '@type': 'Organization',
          '@id': `${defaultSEO.url}/#organization`,
          'name': defaultSEO.siteName,
          'url': defaultSEO.url,
          'logo': {
            '@type': 'ImageObject',
            'url': `${defaultSEO.url}/logo.png`,
            'width': 512,
            'height': 512
          },
          'sameAs': [
            'https://twitter.com/diagnospace',
            'https://linkedin.com/company/diagnospace',
            'https://instagram.com/diagnospace'
          ]
        },
        {
          '@type': 'WebPage',
          '@id': `${seoUrl}/#webpage`,
          'url': seoUrl,
          'name': seoTitle,
          'description': seoDescription,
          'isPartOf': { '@id': `${defaultSEO.url}/#website` },
          'about': { '@id': `${defaultSEO.url}/#organization` },
          'image': {
            '@type': 'ImageObject',
            'url': seoImage
          }
        },
        ...(jsonLd ? [jsonLd] : [])
      ]
    };

    let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(defaultJsonLd);

    return () => {
      // Cleanup if needed
    };
  }, [seoTitle, seoDescription, seoKeywords, seoImage, seoUrl, type, author, publishedTime, modifiedTime, jsonLd]);

  return null;
};

// Specialized SEO for Product/Service pages
export const ProductSEO = ({
  name,
  description,
  price,
  currency = 'IDR',
  availability = 'InStock',
  image,
  url,
}: {
  name: string;
  description: string;
  price: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  image?: string;
  url?: string;
}) => {
  const productJsonLd = {
    '@type': 'Product',
    'name': name,
    'description': description,
    'image': image,
    'offers': {
      '@type': 'Offer',
      'price': price,
      'priceCurrency': currency,
      'availability': `https://schema.org/${availability}`,
      'url': url
    }
  };

  return <SEO title={name} description={description} image={image} url={url} type="product" jsonLd={productJsonLd} />;
};

// FAQ SEO Component
export const FAQSeo = ({ items }: { items: { question: string; answer: string }[] }) => {
  const faqJsonLd = {
    '@type': 'FAQPage',
    'mainEntity': items.map(item => ({
      '@type': 'Question',
      'name': item.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.answer
      }
    }))
  };

  return <SEO jsonLd={faqJsonLd} />;
};

export default SEO;
