import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

// Basic User Schema can be extended here if using an adapter later
// For now, we persist user info in the session

export const authOptions: AuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    callbacks: {
        async session({ session, token }) {
            // Pass user ID to session
            if (session.user && token.sub) {
                // session.user.id = token.sub; // requires type augmentation
            }
            return session;
        },
    },
    // pages: {
    //     signIn: '/login', // Removed to fix 404
    // },
    theme: {
        colorScheme: "light",
    },
    debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
