import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/components/providers"
import { EB_Garamond } from "next/font/google"
import { cn } from "@/utils"
import { Toaster } from "sonner"
import "./globals.css"
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const eb_garamond = EB_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  title: "jStack App",
  description: "Created using jStack",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) 

{
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
  )
}
