import { database } from "@/actions/database";
import { DICTIONARY_SERVER } from "@/config";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Ultra-simple NextAuth configuration
const authConfig: NextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  // Add this to make session work properly
  session: { 
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("JWT callback triggered", { user, account });
      
      // If neither user nor account is defined, this is likely a session refresh
      // Just return the existing token without modification
      if (!user && !account) {
        console.log("Session refresh detected, returning existing token");
        return token;
      }

      try {
        if(!user.email) throw "No email";
        console.log(`Logging in user in backend: ${user.id}`);
        
        let result = await database.collection("users").findOne({
          email: user.email
        });
        

        if(!result) {
          let result = await database.collection("users").insertOne({
            created_at: new Date(),
            updated_at: new Date(),
            provider: "google",

            email: user.email,
            name: user.name,
            picture: user.image,
            decks: []
          })

          if(!result) throw "User failed to register into database"

          console.log(`User registered successfully: ${result.insertedId}`);
        
          token = {
            id: result.insertedId.toHexString(),
            name: user.name,
            email: user.email,
            picture: user.image,
          };

        }else {
          console.log(`User logged in successfully: ${result._id}`);
          
          token = {
            id: result._id.toHexString(),
            name: user.name,
            email: user.email,
            picture: user.image,
          };

        }

      } catch (error) {
        console.error("User registration error:", error);
      }
    
      
      console.log("Final token contents:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session callback triggered", { token });
      
      // When preparing session for the client, copy token data back to session
      if (session.user) {
        // Set user ID from token (prioritize Google ID format if available)
        session.user.id = (token.id as string) || (token.sub as string) || "";
        
        // Copy other user data
        session.user.email = token.email as string || session.user.email;
        session.user.name = token.name as string || session.user.name;
        session.user.image = token.picture as string || session.user.image;
        
        console.log(`Session created with user ID: ${session.user.id}`);
      }
      
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  debug: true, // Set to true to get more debugging information
};

// Export the handlers and auth function with CSRF protection disabled
export const { handlers, auth } = NextAuth({
  ...authConfig,
  trustHost: true
}); 