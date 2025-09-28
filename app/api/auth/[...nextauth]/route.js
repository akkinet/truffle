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
    strategy: "jwt",
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

          // Check if this is an OAuth user trying to authenticate with credentials
          // OAuth users have hashed "oauth-user" password
          const isValid = await bcrypt.compare(credentials.password, user.password);
          
          // Special case: if user is trying to authenticate with "oauth-user" and it's an OAuth user
          if (!isValid && credentials.password === "oauth-user") {
            // Check if this user was created via OAuth (has hashed "oauth-user" password)
            const isOAuthUser = await bcrypt.compare("oauth-user", user.password);
            if (isOAuthUser) {
              return {
                id: user._id.toString(),
                email: user.email,
                name: `${user.firstName} ${user.lastName}` || null,
                membership: user.membership,
                membershipStatus: user.membershipStatus,
              };
            }
          }
          
          if (isValid) {
            return {
              id: user._id.toString(),
              email: user.email,
              name: `${user.firstName} ${user.lastName}` || null,
              membership: user.membership,
              membershipStatus: user.membershipStatus,
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
      if (account?.provider === "google" || account?.provider === "facebook" || account?.provider === "credentials") {
        await dbConnect();
        const existingUser = await User.findOne({ email: user.email }).lean();

        if (existingUser) {
          // Update user object with fresh membership info for JWT token
          user.membership = existingUser.membership;
          user.membershipStatus = existingUser.membershipStatus;
          user.firstName = existingUser.firstName;
          user.lastName = existingUser.lastName;
          return true;
        } else {
          // Hash the OAuth password before saving
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash("oauth-user", salt);
          
          const newUser = new User({
            email: user.email,
            firstName: profile.first_name || (profile.name?.split(" ")[0] || "Unknown"),
            lastName: profile.last_name || (profile.name?.split(" ")[1] || "Unknown"),
            password: hashedPassword,
            receiveUpdates: false,
          });
          await newUser.save();
          // Set membership info for new OAuth users
          user.membership = newUser.membership;
          user.membershipStatus = newUser.membershipStatus;
        }
      }
      return true;
    },
    async jwt({ token, account, user, trigger }) {
      if (account) {
        token.provider = account.provider;
      }
      
      // Always fetch fresh user data from database to ensure latest membership info
      if (token.email) {
        try {
          await dbConnect();
          const dbUser = await User.findOne({ email: token.email }).lean();
          if (dbUser) {
            token.id = dbUser._id.toString();
            token.email = dbUser.email;
            token.name = `${dbUser.firstName} ${dbUser.lastName}`;
            token.membership = dbUser.membership;
            token.membershipStatus = dbUser.membershipStatus;
          }
        } catch (error) {
          console.error('Error fetching fresh user data:', error);
          // Fallback to user object if database fetch fails
          if (user) {
            token.id = user.id;
            token.email = user.email;
            token.name = user.name;
            token.membership = user.membership;
            token.membershipStatus = user.membershipStatus;
          }
        }
      } else if (user) {
        // For new logins, use user object from authorize
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.membership = user.membership;
        token.membershipStatus = user.membershipStatus;
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
          membership: token.membership || 'free',
          membershipStatus: token.membershipStatus || 'active',
        };
      }

      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
