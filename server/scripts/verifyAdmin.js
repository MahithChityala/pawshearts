const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawshearts';

async function verifyAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = 'admin@1234';

    // Check if admin user exists
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      // Create new admin user
      adminUser = new User({
        email: adminEmail,
        password: adminPassword, // Let the User model handle hashing
        userType: 'admin',
        isVerified: true,
        firstName: 'Admin',
        lastName: 'User',
        name: 'Admin User',
        phoneNumber: '1234567890' // Required field
      });
      await adminUser.save();
      console.log('Admin user created successfully');
    } else {
      // Verify password
      const isPasswordValid = await bcrypt.compare(adminPassword, adminUser.password);
      if (!isPasswordValid) {
        // Update password if it doesn't match
        adminUser.password = adminPassword; // Let the User model handle hashing
        await adminUser.save();
        console.log('Admin password updated successfully');
      } else {
        console.log('Admin user exists and password is correct');
      }
    }

    console.log('Admin user details:', {
      email: adminUser.email,
      userType: adminUser.userType,
      isVerified: adminUser.isVerified
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

verifyAdmin(); 