import type { Metadata } from "next";
import StyledComponentsRegistry from "@/lib/registry";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PDF Graph Viewer",
  description: "Generated for Assignment",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>{`PDF Graph Viewer`}</title>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <main>{children}</main>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
