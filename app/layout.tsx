import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ClientLayout } from "@/components/ClientLayout";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "Flowva Rewards Hub",
  description: "Earn points, unlock rewards, and celebrate your progress!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href="/flowva.svg" />
      </head>
      <body className={`${roboto.variable}`}>
        <Providers>
          <ClientLayout>{children}</ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
