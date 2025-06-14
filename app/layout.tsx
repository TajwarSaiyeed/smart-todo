import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart Todo Canvas - Visual Task Management App",
  description: "Organize your tasks visually with Smart Todo Canvas. Drag-and-drop todo cards, advanced filtering, keyboard shortcuts, and templates. Free online productivity tool.",
  keywords: "todo app, task management, visual organizer, drag and drop, productivity, canvas, free todo list, task planner",
  authors: [{ name: "Smart Todo Team" }],
  creator: "Smart Todo Team",
  publisher: "Smart Todo Team",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('http://smart-todo-canvas.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Smart Todo Canvas - Visual Task Management",
    description: "Organize your tasks visually with drag-and-drop functionality, filters, and keyboard shortcuts. Free online productivity tool.",
    url: 'http://smart-todo-canvas.vercel.app',
    siteName: 'Smart Todo Canvas',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Smart Todo Canvas - Visual Task Management App',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Smart Todo Canvas - Visual Task Management',
    description: 'Organize your tasks visually with drag-and-drop functionality, filters, and keyboard shortcuts.',
    images: ['/twitter-image.png'],
    creator: '@smarttodoapp',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'manifest', url: '/site.webmanifest' },
    ],
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Smart Todo Canvas",
    "description": "A visual task management application with drag-and-drop functionality",
    "url": "http://smart-todo-canvas.vercel.app",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web Browser",
    "featureList": [
      "Drag and drop todo cards",
      "Visual canvas interface",
      "Advanced filtering and search",
      "Keyboard shortcuts",
      "Todo templates",
      "Bulk operations"
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#2563eb" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Smart Todo" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster visibleToasts={3} richColors />
      </body>
    </html>
  );
}
