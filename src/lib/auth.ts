import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Teste Local",
      credentials: {
        email: { label: "Email (qualquer)", type: "email", placeholder: "teste@perronhas.com" },
        password: { label: "Senha (ignorada)", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.email) {
          return { id: "teste123", name: "Usuario Teste", email: credentials.email as string };
        }
        return null;
      }
    })
  ],
  callbacks: {
    session({ session }) {
      return session;
    },
  },
});
