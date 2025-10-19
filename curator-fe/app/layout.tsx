import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "./contexts/AuthContext";
import { GuestProvider } from "./contexts/GuestContext";
import { TutorialProvider } from "./contexts/TutorialContext";
import Navigation from "./components/Navigation";
import ImagePreloader from "./components/ImagePreloader";
import GuestDataPrompt from "./components/GuestDataPrompt";
import TutorialOverlay from "./components/TutorialOverlay";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Curator",
  description: "Discover and curate artworks from world-renowned museums",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <GuestProvider>
            <TutorialProvider>
              <ImagePreloader />
              <Navigation />
              <GuestDataPrompt />
              <TutorialOverlay />
              <main>
                {children}
              </main>
            </TutorialProvider>
          </GuestProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
