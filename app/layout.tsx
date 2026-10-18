import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'All India Government Job Portal',
  description:
    'Complete All-India Central and State Government Job Portal featuring live notifications, admit cards, exam results, answer keys, syllabus, age calculator, and CMS admin panel.',
  openGraph: {
    title: 'All India Government Job Portal',
    description:
      'Complete All-India Central and State Government Job Portal featuring live notifications, admit cards, exam results, answer keys, syllabus, age calculator, and CMS admin panel.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'All India Government Job Portal',
    description:
      'Complete All-India Central and State Government Job Portal featuring live notifications, admit cards, exam results, answer keys, syllabus, age calculator, and CMS admin panel.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plusJakarta.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
