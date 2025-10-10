
import type { Metadata } from "next";
import { Inter, EB_Garamond } from "next/font/google";
import { Providers } from "@/components/providers";
import { cn } from "@/utils";
import { Toaster } from "sonner";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const eb_garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
});

export const metadata: Metadata = {
  title: "Kyve ",
  description:
    "Kyve  ensures fair, transparent, and secure digital transactions by holding funds safely until both parties’ conditions are met.",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Kyve ",
    description:
      "A secure platform built for trust. Kyve Escrow protects buyers and sellers by holding funds until terms are fulfilled.",
    url: "https://escrow-rosy.vercel.app/", // Replace with your actual domain
    siteName: "Kyve ",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Kyve  Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kyve ",
    description:
      "Experience secure and transparent digital transactions with Kyve Escrow.",
    images: ["/android-chrome-512x512.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <SessionProvider session={session}>
      <html lang="en" className={cn(inter.variable, eb_garamond.variable)}>
        <body className="min-h-[calc(100vh-1px)] flex flex-col font-sans bg-[#FFF] text-brand-950 antialiased">
          <main className="relative flex-1 flex flex-col">
            <Providers>
              {children}
              <Toaster richColors closeButton position="top-right" />
            </Providers>
          </main>
        </body>
      </html>
    </SessionProvider>
  );
}



// import type { Metadata } from "next"
// import { Inter } from "next/font/google"
// import { Providers } from "@/components/providers"
// import { EB_Garamond } from "next/font/google"
// import { cn } from "@/utils"
// import { Toaster } from "sonner"
// import "./globals.css"
// import { SessionProvider } from "next-auth/react"
// import { auth } from "@/auth"

// const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
// const eb_garamond = EB_Garamond({
//   subsets: ["latin"],
//   variable: "--font-heading",
// })

// export const metadata: Metadata = {
//   title: "jStack App",
//   description: "Created using jStack",
//   icons: [{ rel: "icon", url: "/favicon.ico" }],
// }

// export default async function RootLayout({
//   children,
// }: Readonly<{
//   children: React.ReactNode
// }>) 

// {
//    const session = await auth();
//   return (
//    <SessionProvider session={session}>
//       <html lang="en" className={cn(inter.variable, eb_garamond.variable)}>
//         <body className="min-h-[calc(100vh-1px)] flex flex-col font-sans bg-[#FFF] text-brand-950 antialiased">
//           <main className="relative flex-1 flex flex-col">
//             <Providers>
//               {children}
//                <Toaster richColors closeButton position="top-right" />
//             </Providers>
//           </main>
//         </body>
//       </html>
//     </SessionProvider>
//   )
// }
