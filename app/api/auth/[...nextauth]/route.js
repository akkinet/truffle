import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { MongoClient } from "mongodb";
import dbConnect from "../../../../lib/mongodb";
import User from "../../../../models/User";
import bcrypt from "bcryptjs";

// MongoDB client for NextAuth adapter with timeout handling
let client;
let clientPromise;
let adapterAvailable = false;

async function createMongoClient() {
  try {
    if (!process.env.MONGODB_URI) {
      console.log('⚠️  MONGODB_URI not found, NextAuth will use JWT strategy only');
      return null;
    }

    console.log('🔄 Attempting to create MongoDB client for NextAuth...');
    
    // Create client with timeout settings
    const client = new MongoClient(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    // Test connection with timeout
    await Promise.race([
      client.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);

    console.log('✅ MongoDB client created and connected for NextAuth adapter');
    adapterAvailable = true;
    return client;
  } catch (error) {
    console.log('⚠️  MongoDB connection failed for NextAuth adapter:', error.message);
    console.log('📝 NextAuth will use JWT strategy only');
    adapterAvailable = false;
    return null;
  }
}

// Initialize MongoDB client
clientPromise = createMongoClient();

export const authOptions = {
  // Use MongoDB adapter only if connection is available
  adapter: adapterAvailable ? MongoDBAdapter(clientPromise) : undefined,
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
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
        console.log('🔐 NextAuth authorize called with:', { email: credentials?.email, password: credentials?.password ? '[HIDDEN]' : 'undefined' });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }

        try {
          console.log('📡 Connecting to database...');
          await dbConnect();
          console.log('✅ Database connected');
          
          console.log(`🔍 Looking for user: ${credentials.email}`);
          const user = await User.findOne({ email: credentials.email }).lean();
          if (!user) {
            console.log('❌ User not found in database');
            return null;
          }

          console.log('✅ User found:', {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            membership: user.membership,
            membershipStatus: user.membershipStatus
          });

          // Check if this is an OAuth user trying to authenticate with credentials
          // OAuth users have hashed "oauth-user" password
          console.log('🔐 Testing password comparison...');
          const isValid = await bcrypt.compare(credentials.password, user.password);
          console.log(`  - bcrypt.compare("${credentials.password}", hash): ${isValid}`);
          
          // Special case: if user is trying to authenticate with "oauth-user" and it's an OAuth user
          if (!isValid && credentials.password === "oauth-user") {
            console.log('🔄 Entering special OAuth user case...');
            // Check if this user was created via OAuth (has hashed "oauth-user" password)
            const isOAuthUser = await bcrypt.compare("oauth-user", user.password);
            console.log(`  - isOAuthUser check: ${isOAuthUser}`);
            
            if (isOAuthUser) {
              console.log('✅ OAuth user authentication successful');
              const result = {
                id: user._id.toString(),
                email: user.email,
                name: `${user.firstName} ${user.lastName}` || null,
                membership: user.membership,
                membershipStatus: user.membershipStatus,
              };
              console.log('📤 Returning user data:', result);
              return result;
            }
          }
          
          if (isValid) {
            console.log('✅ Normal authentication successful');
            const result = {
              id: user._id.toString(),
              email: user.email,
              name: `${user.firstName} ${user.lastName}` || null,
              membership: user.membership,
              membershipStatus: user.membershipStatus,
            };
            console.log('📤 Returning user data:', result);
            return result;
          } else {
            console.log('❌ Authentication failed - password mismatch');
            return null;
          }
        } catch (error) {
          console.error("❌ Error in authorize callback:", error);
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
        // For OAuth providers, try to sync with our User model if MongoDB is available
        if (adapterAvailable) {
          try {
            await dbConnect();
            console.log('🔍 Checking for existing OAuth user:', user.email);
            
            let existingUser = await User.findOne({ email: user.email });
            
            if (!existingUser) {
              // Create new user in our User model
              console.log('👤 Creating new OAuth user in database:', user.email);
              
              const salt = await bcrypt.genSalt(10);
              const hashedPassword = await bcrypt.hash("oauth-user", salt);
              
              // Extract name parts
              const nameParts = user.name?.split(' ') || ['Unknown', 'User'];
              const firstName = nameParts[0] || 'Unknown';
              const lastName = nameParts.slice(1).join(' ') || 'User';
              
              existingUser = new User({
                email: user.email,
                firstName: firstName,
                lastName: lastName,
                password: hashedPassword,
                receiveUpdates: false,
                membership: 'free',
                membershipStatus: 'active',
                provider: account.provider
              });
              
              await existingUser.save();
              console.log('✅ OAuth user created in database:', user.email);
            } else {
              console.log('✅ Existing OAuth user found:', user.email);
            }
            
            // Update user object with database info
            user.id = existingUser._id.toString();
            user.membership = existingUser.membership;
            user.membershipStatus = existingUser.membershipStatus;
            user.firstName = existingUser.firstName;
            user.lastName = existingUser.lastName;
            
            return true;
          } catch (error) {
            console.error('❌ Error syncing OAuth user:', error);
            // Still allow sign-in even if database sync fails
            return true;
          }
        } else {
          // MongoDB not available, use JWT-only mode
          console.log('⚠️  MongoDB not available, using JWT-only mode for OAuth user:', user.email);
          
          // Extract name parts for JWT token
          const nameParts = user.name?.split(' ') || ['Unknown', 'User'];
          user.firstName = nameParts[0] || 'Unknown';
          user.lastName = nameParts.slice(1).join(' ') || 'User';
          user.membership = 'free';
          user.membershipStatus = 'active';
          
          return true;
        }
      } else if (account?.provider === "credentials") {
        // For credentials provider, we still need database access
        try {
          await dbConnect();
          const existingUser = await User.findOne({ email: user.email }).lean();

          if (existingUser) {
            // Update user object with fresh membership info for JWT token
            user.membership = existingUser.membership;
            user.membershipStatus = existingUser.membershipStatus;
            user.firstName = existingUser.firstName;
            user.lastName = existingUser.lastName;
            console.log('✅ Existing user found and updated:', user.email);
            return true;
          } else {
            console.log('❌ User not found for credentials login:', user.email);
            return false;
          }
        } catch (error) {
          console.error('❌ Database error during credentials signIn:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, user, trigger }) {
      if (account) {
        token.provider = account.provider;
      }
      
      // For OAuth users, use data from signIn callback (DB or JWT-only)
      if (account?.provider === "google" || account?.provider === "facebook") {
        if (user) {
          // Use the user data that was processed in signIn callback
          token.id = user.id || `oauth-${Date.now()}`; // Generate ID if not available
          token.email = user.email;
          token.name = user.name;
          token.membership = user.membership || 'free';
          token.membershipStatus = user.membershipStatus || 'active';
          token.firstName = user.firstName;
          token.lastName = user.lastName;
          console.log('✅ OAuth user token created:', user.email, adapterAvailable ? 'with DB' : 'JWT-only');
        }
      } else if (account?.provider === "credentials") {
        // For credentials provider, try to fetch from database
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
              console.log('✅ Fresh user data fetched from database:', token.email);
            }
          } catch (error) {
            console.error('❌ Error fetching fresh user data:', error);
            // Fallback to user object if database fetch fails
            if (user) {
              token.id = user.id;
              token.email = user.email;
              token.name = user.name;
              token.membership = user.membership || 'free';
              token.membershipStatus = user.membershipStatus || 'active';
              console.log('⚠️  Using fallback user data:', token.email);
            }
          }
        } else if (user) {
          // For new logins, use user object from authorize
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.membership = user.membership || 'free';
          token.membershipStatus = user.membershipStatus || 'active';
          console.log('✅ New credentials login token created:', token.email);
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id || null,
          email: token.email || null,
          name: token.name || null,
          firstName: token.firstName || null,
          lastName: token.lastName || null,
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
