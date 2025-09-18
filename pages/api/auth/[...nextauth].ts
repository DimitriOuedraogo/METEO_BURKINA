import { PrismaAdapter } from "@next-auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import GoogleProvider from "next-auth/providers/google";
import prisma from "../../../lib/prisma";

export default NextAuth({
    // Utiliser Prisma comme adapter pour NextAuth
    adapter: PrismaAdapter(prisma),

    // Définir les providers disponibles pour l'authentification
    providers: [
        // Authentification par email + mot de passe
        CredentialsProvider({
            name: "Email et mot de passe",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Mot de passe", type: "password" },
            },
            async authorize(credentials) {
                console.log("Credentials reçues :", credentials);

                if (!credentials?.email || !credentials.password) return null;

                // Chercher l'utilisateur correspondant à l'email
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                console.log("user trouvé:", user);

                if (!user) return null;

                // Vérifier que l'email est validé
                if (!user.emailVerified) {
                    throw new Error("Vous devez vérifier votre email avant de vous connecter.");
                }

                // Vérifier le mot de passe
                if(user.password) {
                const isValid = await bcrypt.compare(credentials.password, user.password);
                if (!isValid) return null;
                console.log("Mot de passe valide ?", isValid);

                }

                // Retourner les informations de l'utilisateur pour NextAuth
                return { id: user.id, name: user.username, email: user.email };
            },
        }),

        // Authentification par email (Magic link)
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
                secure: true, // Utiliser SSL/TLS
            },
            from: process.env.EMAIL_FROM,
        }),

        // Authentification via Google OAuth
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],

    // Pages personnalisées
    pages: {
        signIn: "/auth/signin",
    },

    // Stockage de la session dans JWT
    session: {
        strategy: "jwt",
    },

    callbacks: {
        // Gestion lors de la connexion
        async signIn({ user, account, profile }) {
            // Si l'utilisateur se connecte avec Google et existe dans la DB
            if (account?.provider === "google" && profile?.sub && user.email) {
                const existingUser = await prisma.user.findUnique({
                    where: { email: user.email },
                });

                if (existingUser) {
                    // Upsert du compte Google pour lier à l'utilisateur existant
                    await prisma.account.upsert({
                        where: {
                            provider_providerAccountId: {
                                provider: "google",
                                providerAccountId: profile.sub,
                            },
                        },
                        update: {},
                        create: {
                            userId: existingUser.id,
                            type: "oauth",
                            provider: "google",
                            providerAccountId: profile.sub,
                            access_token: account.access_token ?? "",
                            refresh_token: account.refresh_token ?? "",
                            expires_at: account.expires_at ?? 0,
                        },
                    });
                }
            }

            return true;
        },

        // Ajouter des infos dans le token JWT
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name || user.email?.split("@")[0];
            }
            return token;
        },

        // Ajouter les infos du token à la session côté front
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = token.id as string;
                session.user.name = token.name as string;
            }
            return session;
        },
    },

    // Secret pour sécuriser les JWT
    secret: process.env.NEXTAUTH_SECRET,
});
