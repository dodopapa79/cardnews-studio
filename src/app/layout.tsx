import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CardNews Studio',
  description: 'AI 기반 인스타그램 카드뉴스 & 숏츠 자동 생성',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard-dynamic-subset.css"
        />
      </head>
      <body className="bg-surface-bg text-ink-primary antialiased">{children}</body>
    </html>
  );
}