import { useEffect } from 'react';

export default function PWAHead() {
  useEffect(() => {
    const existingLink = document.querySelector('link[rel="manifest"]');
    if (!existingLink) {
      const link = document.createElement('link');
      link.rel = 'manifest';
      link.href = '/manifest.json';
      document.head.appendChild(link);
    }

    const existingMeta = document.querySelector('meta[name="theme-color"]');
    if (!existingMeta) {
      const meta = document.createElement('meta');
      meta.name = 'theme-color';
      meta.content = '#9333ea';
      document.head.appendChild(meta);
    }

    const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]');
    if (!appleMeta) {
      const meta1 = document.createElement('meta');
      meta1.name = 'apple-mobile-web-app-capable';
      meta1.content = 'yes';
      document.head.appendChild(meta1);

      const meta2 = document.createElement('meta');
      meta2.name = 'apple-mobile-web-app-status-bar-style';
      meta2.content = 'black-translucent';
      document.head.appendChild(meta2);

      const meta3 = document.createElement('meta');
      meta3.name = 'apple-mobile-web-app-title';
      meta3.content = 'Favela Shopping';
      document.head.appendChild(meta3);
    }

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes');
    }
  }, []);

  return null;
}