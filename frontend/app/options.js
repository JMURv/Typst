import CredentialsProvider from "next-auth/providers/credentials"
import jwtDecode from "jwt-decode"


async function refreshAccessToken(token) {
    try {
        const response = await fetch("http://backend:8000/api/token/refresh/", {
            method: "POST",
            body: JSON.stringify({refresh: token.refresh}),
            headers: {"Content-Type": "application/json"},
        })
        const refreshedToken = await response.json()
        if (response.status !== 200) throw refreshedToken
        return {
            ...token,
            ...refreshedToken,
        }
    } catch (error) {
        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const options = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type: 'password'},
            },
            async authorize(credentials) {
                try {
                    const response = await fetch(`http://backend:8000/api/login/`, {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify(credentials),
                    })
                    if (response.ok) {
                        const data = await response.json()
                        return {
                            user: {
                                user_id: data.id,
                                name: data.username,
                                image: data.avatar,
                                email: data.email,
                            },
                            access: data.access,
                            refresh: data.refresh,
                        }
                    } else {
                        console.error('Login failed:', response.statusText)
                    }
                } catch (error) {
                    console.error('Login failed:', error.message)
                }
                return null
            },
        }),
    ],
    callbacks: {

        async jwt({token, user, account, isNewUser}) {
            if (account && user) {
                return user
            }
            const now = Date.now()
            const {exp} = jwtDecode(token.access)
            const tokenExp = exp * 1000

            const refreshBuffer = 5 * 60 * 1000
            const shouldRefreshTime = Math.round(tokenExp - refreshBuffer - now)
            console.log("shouldRefreshTime: ", shouldRefreshTime)
            console.log("now:", now)
            console.log("tokenExp:", tokenExp)
            console.log("Condition result:", now < tokenExp)

            if (now < tokenExp) {
                return token
            }

            console.log('UPDATING TOKEN')
            return await refreshAccessToken(token)
        },

        async session({session, token}) {
            session.user = token.user
            session.access = token.access
            session.refresh = token.refresh
            return session
        }
    },
    session: {strategy: "jwt"},
    pages: {
        signIn: '/login',
    }
}