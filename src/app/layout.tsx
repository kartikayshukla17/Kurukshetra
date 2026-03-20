import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kurukshetra — Ask the Mahabharata",
  description:
    "A conversational oracle for the Mahabharata. Ask about dharma, characters, the Bhagavad Gita, and the great war of Kurukshetra.",
  openGraph: {
    title: "Kurukshetra — Ask the Mahabharata",
    description:
      "A conversational oracle powered by the wisdom of the Mahabharata and the Bhagavad Gita.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600&family=Spectral:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400;1,500&family=Noto+Serif+Devanagari:wght@300;400;500&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#0c0a14] text-[#f0e6d2]">
        {children}
      </body>
    </html>
  );
}
