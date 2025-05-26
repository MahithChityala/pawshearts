const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../.env' });

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/pawshearts';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    if (existingAdmin) {
      console.log('Admin user already exists');
      await mongoose.disconnect();
      process.exit();
    }

    // Create admin user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin@1234', salt);

    const admin = new User({
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      userType: 'admin',
      phoneNumber: '1234567890',
      firstName: 'Admin',
      lastName: 'User',
      avatar: 'default-avatar.jpg',
      address: {
        street: 'Admin Street',
        city: 'Admin City',
        state: 'Admin State',
        country: 'Admin Country',
        zipCode: '12345'
      },
      isVerified: true,
      verificationStatus: 'approved',
      lastLogin: new Date(),
      loginHistory: [{
        date: new Date(),
        ip: '127.0.0.1',
        device: 'Admin Creation Script'
      }]
    });

    await admin.save();
    console.log('Admin user created successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    process.exit();
  } catch (error) {
    console.error('Error creating admin user:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin(); 