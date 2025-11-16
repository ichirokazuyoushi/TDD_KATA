import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User';

dotenv.config();

const makeAdmin = async () => {
  try {
    // Connect to database
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sweet-shop';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Get email or username from command line arguments
    const identifier = process.argv[2];

    if (!identifier) {
      console.error('❌ Please provide an email or username');
      console.log('Usage: npm run make-admin <email-or-username>');
      process.exit(1);
    }

    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) {
      console.error(`❌ User not found: ${identifier}`);
      process.exit(1);
    }

    // Update user role to admin
    user.role = 'admin';
    await user.save();

    console.log(`✅ User "${user.username}" (${user.email}) is now an admin!`);
    console.log('   Please log out and log back in to see admin features.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

makeAdmin();


