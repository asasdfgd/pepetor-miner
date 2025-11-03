require('dotenv').config();
const mongoose = require('mongoose');

console.log('🔍 Testing MongoDB Connection...\n');
console.log('Connection String (without password):', process.env.MONGODB_URI.replace(/:[^@]+@/, ':****@'));

(async () => {
  try {
    console.log('\n⏳ Attempting to connect...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('\n✅ SUCCESS! MongoDB connected!');
    console.log('Database Name:', mongoose.connection.name);
    console.log('Host:', mongoose.connection.host);
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected successfully');
    process.exit(0);
  } catch (error) {
    console.log('\n❌ CONNECTION FAILED');
    console.log('Error:', error.message);
    console.log('\nPossible reasons:');
    console.log('1. Username is wrong (should be: clearnetmoney)');
    console.log('2. Password is wrong (should be: Gabby123!)');
    console.log('3. Database user does not exist in MongoDB Atlas');
    console.log('4. Password has special characters that need encoding');
    console.log('5. IP address is not whitelisted in MongoDB Atlas');
    process.exit(1);
  }
})();