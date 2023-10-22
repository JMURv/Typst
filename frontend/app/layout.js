import './globals.css'
import {Inter} from 'next/font/google'
import {Poppins} from 'next/font/google';
import { Providers } from './providers'
import GeolocationServerComponent from "@/components/Geo/GeolocationServerComponent";

const inter = Inter({subsets: ['latin']})
const poppinsFont = Poppins({
    weight: '700',
    subsets: ['latin'],
    variable: '--font-poppins',
})

export const metadata = {
    title: 'TYP.ST',
    description: "Place u'll find your love",
    keywords: ['Next.js', 'React', 'JavaScript'],
    openGraph: {
        title: 'TYP.ST',
        description: "Place u'll find your love",
        url: 'https://nextjs.org',
        siteName: 'typ.st',
        images: [
            {
                url: 'https://nextjs.org/og.png',
                width: 800,
                height: 600,
            },
            {
                url: 'https://nextjs.org/og-alt.png',
                width: 1800,
                height: 1600,
                alt: 'My custom alt',
            },
        ],
        type: 'website',
    },
    robots: {
        index: true,
        follow: true,
        nocache: true,
        googleBot: {
            index: true,
            follow: false,
            noimageindex: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
}

export default function RootLayout({children}) {
    return (
        <html suppressHydrationWarning lang="en">
            <body className={`${poppinsFont.variable} h-screen`}>
                <GeolocationServerComponent />
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
