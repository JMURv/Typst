/** @type {import('next').NextConfig} */

const nextTranslate = require('next-translate-plugin')

module.exports = nextTranslate({
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'backend',
                port: '8000'
            }
        ]
    },
    async rewrites() {
        return [
            {
                source: '/admin/:path*',
                destination: 'http://backend:8000/admin/:path*/',
                locale: false
            },
            {
                source: '/api/v1/:path*',
                destination: 'http://backend:8000/api/:path*/',
                locale: false
            },
            {
                source: '/api/chat/:path*',
                destination: 'http://backend:8000/api/chat/:path*/',
                locale: false
            },
            {
                source: '/ws/chat/:path*',
                destination: 'http://backend:8000/ws/chat/:path*/',
                locale: false
            },
            {
                source: '/media/:path*',
                destination: 'http://backend:8000/media/:path*/',
                locale: false
            }
        ]
    }
})
