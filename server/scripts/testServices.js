const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Service = require('../models/Service');

// Sample services near Hyderabad
const sampleServices = [
  {
    name: 'Test Pet Clinic',
    type: 'VETERINARY',
    description: 'A test veterinary clinic',
    address: 'Test Address, Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4867, 17.3850] // Hyderabad longitude, latitude
    },
    phone: '+91 1234567890',
    website: 'https://example.com',
    rating: 4.5,
    operatingHours: {
      monday: { open: '09:00', close: '18:00' },
      tuesday: { open: '09:00', close: '18:00' },
      wednesday: { open: '09:00', close: '18:00' },
      thursday: { open: '09:00', close: '18:00' },
      friday: { open: '09:00', close: '18:00' },
      saturday: { open: '10:00', close: '16:00' },
      sunday: { open: 'Closed', close: 'Closed' }
    }
  },
  {
    name: 'Test Pet Store',
    type: 'PET_STORE',
    description: 'A test pet store',
    address: 'Test Store Address, Hyderabad',
    location: {
      type: 'Point',
      coordinates: [78.4900, 17.3900] // Hyderabad longitude, latitude
    },
    phone: '+91 9876543210',
    website: 'https://example.com/store',
    rating: 4.2,
    operatingHours: {
      monday: { open: '10:00', close: '20:00' },
      tuesday: { open: '10:00', close: '20:00' },
      wednesday: { open: '10:00', close: '20:00' },
      thursday: { open: '10:00', close: '20:00' },
      friday: { open: '10:00', close: '20:00' },
      saturday: { open: '10:00', close: '20:00' },
      sunday: { open: '12:00', close: '18:00' }
    }
  }
];

async function testServiceAPI() {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear test services
    await Service.deleteMany({ name: /Test/ });
    console.log('Cleared existing test services');

    // Insert sample services
    const result = await Service.insertMany(sampleServices);
    console.log(`Added ${result.length} test services to the database`);

    // Test a query to verify
    const testQuery = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [78.4867, 17.3850] // Hyderabad
          },
          $maxDistance: 10000 // 10km
        }
      }
    };

    const nearbyServices = await Service.find(testQuery);
    console.log(`Found ${nearbyServices.length} nearby services`);
    
    if (nearbyServices.length > 0) {
      console.log('First service:', {
        name: nearbyServices[0].name,
        coordinates: nearbyServices[0].location.coordinates,
        distance: getDistance(
          [78.4867, 17.3850],
          nearbyServices[0].location.coordinates
        )
      });
    }

    console.log('Test completed successfully');
    mongoose.disconnect();
  } catch (error) {
    console.error('Error in test script:', error);
  }
}

// Helper function to calculate distance between coordinates in meters
function getDistance(coord1, coord2) {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  
  const R = 6371e3; // Earth radius in meters
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}

testServiceAPI(); 