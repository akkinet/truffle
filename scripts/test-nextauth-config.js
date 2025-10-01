// Simple test to verify NextAuth configuration
const fs = require('fs');
const path = require('path');

function testNextAuthConfig() {
  console.log('🔍 Testing NextAuth configuration...\n');
  
  const nextAuthFile = path.join(__dirname, '../app/api/auth/[...nextauth]/route.js');
  
  try {
    const content = fs.readFileSync(nextAuthFile, 'utf8');
    
    // Check for required imports
    const hasNextAuth = content.includes('import NextAuth from "next-auth"');
    const hasGoogleProvider = content.includes('import GoogleProvider from "next-auth/providers/google"');
    const hasFacebookProvider = content.includes('import FacebookProvider from "next-auth/providers/facebook"');
    const hasCredentialsProvider = content.includes('import CredentialsProvider from "next-auth/providers/credentials"');
    
    console.log('1. Checking NextAuth imports:');
    console.log(`   ${hasNextAuth ? '✅' : '❌'} NextAuth import`);
    console.log(`   ${hasGoogleProvider ? '✅' : '❌'} GoogleProvider import`);
    console.log(`   ${hasFacebookProvider ? '✅' : '❌'} FacebookProvider import`);
    console.log(`   ${hasCredentialsProvider ? '✅' : '❌'} CredentialsProvider import`);
    
    // Check for provider configuration
    const hasGoogleConfig = content.includes('GoogleProvider({');
    const hasFacebookConfig = content.includes('FacebookProvider({');
    const hasCredentialsConfig = content.includes('CredentialsProvider({');
    
    console.log('\n2. Checking provider configurations:');
    console.log(`   ${hasGoogleConfig ? '✅' : '❌'} GoogleProvider configuration`);
    console.log(`   ${hasFacebookConfig ? '✅' : '❌'} FacebookProvider configuration`);
    console.log(`   ${hasCredentialsConfig ? '✅' : '❌'} CredentialsProvider configuration`);
    
    // Check for environment variable usage
    const hasGoogleEnvVars = content.includes('process.env.GOOGLE_CLIENT_ID') && content.includes('process.env.GOOGLE_CLIENT_SECRET');
    const hasFacebookEnvVars = content.includes('process.env.FACEBOOK_CLIENT_ID') && content.includes('process.env.FACEBOOK_CLIENT_SECRET');
    const hasNextAuthSecret = content.includes('process.env.NEXTAUTH_SECRET');
    
    console.log('\n3. Checking environment variable usage:');
    console.log(`   ${hasGoogleEnvVars ? '✅' : '❌'} Google OAuth environment variables`);
    console.log(`   ${hasFacebookEnvVars ? '✅' : '❌'} Facebook OAuth environment variables`);
    console.log(`   ${hasNextAuthSecret ? '✅' : '❌'} NextAuth secret`);
    
    // Check for MongoDB adapter
    const hasMongoAdapter = content.includes('MongoDBAdapter');
    const hasMongoClient = content.includes('MongoClient');
    const adapterDisabled = content.includes('// adapter:') || content.includes('//adapter:');
    
    console.log('\n4. Checking MongoDB integration:');
    console.log(`   ${hasMongoAdapter ? '✅' : '❌'} MongoDB adapter`);
    console.log(`   ${hasMongoClient ? '✅' : '❌'} MongoDB client`);
    console.log(`   ${adapterDisabled ? '✅' : '❌'} MongoDB adapter disabled (JWT-only mode)`);
    
    // Check for error handling
    const hasErrorHandling = content.includes('try {') && content.includes('catch (error)');
    
    console.log('\n5. Checking error handling:');
    console.log(`   ${hasErrorHandling ? '✅' : '❌'} Error handling for MongoDB connection`);
    
    const allChecks = hasNextAuth && hasGoogleProvider && hasFacebookProvider && hasCredentialsProvider &&
                     hasGoogleConfig && hasFacebookConfig && hasCredentialsConfig &&
                     hasGoogleEnvVars && hasFacebookEnvVars && hasNextAuthSecret &&
                     hasErrorHandling && adapterDisabled;
    
    console.log('\n📊 Overall Status:');
    if (allChecks) {
      console.log('   ✅ NextAuth configuration looks good!');
      console.log('\n📝 Next steps:');
      console.log('1. Create .env.local file with required environment variables');
      console.log('2. Start the development server: npm run dev');
      console.log('3. Test authentication endpoints');
    } else {
      console.log('   ❌ Some issues found in NextAuth configuration');
      console.log('\n📝 Please check the missing components above');
    }
    
  } catch (error) {
    console.error('❌ Error reading NextAuth configuration file:', error.message);
  }
}

testNextAuthConfig();
