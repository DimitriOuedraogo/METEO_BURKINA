import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";


export default NextAuth({

    adapter: PrismaAdapter(prisma),
    providers: [
        CredentialsProvider({
            name: "Email et mot de passe",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                console.log("Credentials reçues :", credentials);
                if (!credentials?.email || !credentials.password) return null;

                // Chercher l'utilisateur dans la DB
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                console.log("user trouve:", user);

                if (!user) return null;

                // Vérifier si l'email est validé
                if (!user.emailVerified) {
                    throw new Error("Vous devez vérifier votre email avant de vous connecter.");
                }

                // Vérifier le mot de passe
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;
                console.log("Mot de passe valide ?", isValid);

                return { id: user.id, name: user.username, email: user.email };
            },
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
                secure: true, // SSL/TLS
            },
            from: process.env.EMAIL_FROM,
        }),

        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    pages: {
        signIn: "/auth/signin",
    },

    session: {
        strategy: "jwt", // session stockée dans le JWT
    },

    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name || user.email?.split("@")[0]; // fallback nom
            }
             console.log("token actuel:", token);
            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;   // assure un name
            }
            return session;
        },
    },

    secret: process.env.NEXTAUTH_SECRET,
});
