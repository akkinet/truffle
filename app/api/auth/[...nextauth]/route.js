import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOptions = {
  adapter: MongoDBAdapter(dbConnect()),
  session: {
    strategy: "database", // Use database sessions
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await User.findOne({ email: credentials.email }).lean();
          if (!user) {
            console.log("No user found with email:", credentials.email);
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            // in case where session isn't presistent
            if (typeof window !== 'undefined') {
              window.localStorage.setItem("userLoggedIn", JSON.stringify({
                id: user._id.toString(),
                email: user.email,
                name: `${user.firstName} ${user.lastName}` || null,
              }))
            }
            return {
              id: user._id.toString(),
              email: user.email,
              name: `${user.firstName} ${user.lastName}` || null,
            };
          } else {
            console.log("Invalid password for email:", credentials.email);
            return null;
          }
        } catch (error) {
          console.error("Error in authorize callback:", error);
          return null;
        }
      },
    }),
  ],
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "facebook") {
        const customProfile = profile;
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          return true;
        } else {
          const newUser = new User({
            email: user.email,
            firstName: customProfile.given_name || (customProfile.name?.split(" ")[0] || "Unknown"),
            lastName: customProfile.family_name || (customProfile.name?.split(" ")[1] || "Unknown"),
            password: "oauth-user",
            receiveUpdates: false,
          });
          await newUser.save();
          console.log(`Created new user ${user.email}`);
        }
        return true;
      }
      return true;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.provider = account.provider;
      }
      // For credentials provider, the 'user' object from authorize is available here
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      console.log("JWT token updated:", token);
      return token;
    },
    async session({ session, token }) {
      console.log("Session token before update:", token);
      // Ensure session.user is always populated from the token
      if (token) {
        session.user = {
          id: token.id || null,
          email: token.email || null,
          name: token.name || null,
          // Add other user properties from token if needed
        };
      }

      // If session.user.email exists, try to fetch more detailed user data from DB
      if (session.user?.email) {
        try {
          const dbuser = await User.findOne({ email: session.user.email }).lean();
          if (dbuser) {
            session.user.id = dbuser._id.toString();
            session.user.email = dbuser.email;
            session.user.name = `${dbuser.firstName} ${dbuser.lastName}` || session.user.name;
            // Add any other fields you want to expose in the session
            // For example: session.user.role = dbuser.role;
          } else {
            console.warn("No user found for email:", session.user.email);
          }
        } catch (error) {
          console.error("Error fetching user in session callback:", error);
        }
      }
      console.log("Session after update:", session);
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
