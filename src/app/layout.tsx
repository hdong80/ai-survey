import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '풍문 자동 설문 플랫폼',
  description: '누구나 만들고, 비밀번호로 보호하거나 공개로 공유하는 AI 설문',
  icons: [{ rel: 'icon', url: '/icon.svg' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}


