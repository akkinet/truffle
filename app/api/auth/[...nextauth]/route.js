import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { MongoClient } from "mongodb"; // <-- Add this
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

// Create a MongoDB client promise for the adapter
const client = new MongoClient(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const clientPromise = client.connect();

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise), // <-- Use clientPromise here
  session: {
    strategy: "database",
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
          await dbConnect();
          const user = await User.findOne({ email: credentials.email }).lean();
          if (!user) {
            return null;
          }

          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (isValid) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: `${user.firstName} ${user.lastName}` || null,
            };
          } else {
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
      await dbConnect();
      if (account?.provider === "google" || account?.provider === "facebook") {
        const existingUser = await User.findOne({ email: user.email });

        if (existingUser) {
          return true;
        } else {
          const newUser = new User({
            email: user.email,
            firstName: profile.first_name || (profile.name?.split(" ")[0] || "Unknown"),
            lastName: profile.last_name || (profile.name?.split(" ")[1] || "Unknown"),
            password: "oauth-user",
            receiveUpdates: false,
          });
          await newUser.save();
          console.log(`Created new user ${user.email}`);
        }
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
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id || null,
          email: token.email || null,
          name: token.name || null,
          provider: token.provider || null,
        };
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
