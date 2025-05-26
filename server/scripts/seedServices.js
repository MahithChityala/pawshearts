const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Service = require('../models/Service');

// Helper function to generate random coordinates within Hyderabad area
const generateRandomLocation = () => {
  // Hyderabad bounds approximately
  const bounds = {
    north: 17.5851,
    south: 17.2865,
    east: 78.6181,
    west: 78.2867
  };
  
  const lat = bounds.south + (Math.random() * (bounds.north - bounds.south));
  const lng = bounds.west + (Math.random() * (bounds.east - bounds.west));
  
  return [lng, lat]; // [longitude, latitude]
};

// Helper function to generate random rating
const generateRating = () => {
  return (3.5 + Math.random() * 1.5).toFixed(1); // Generates rating between 3.5 and 5.0
};

// Helper function to generate phone number
const generatePhone = () => {
  return `+91 ${Math.floor(Math.random() * 90000 + 10000)} ${Math.floor(Math.random() * 90000 + 10000)}`;
};

// Base services (your original data)
const baseServices = [
  // Veterinary Hospitals
  {
    name: 'PAWS Pet Clinic',
    type: 'VETERINARY',
    description: '24/7 Emergency veterinary hospital with experienced staff and modern facilities',
    address: 'Plot 824, Road 41, Jubilee Hills, Hyderabad, Telangana 500033',
    location: {
      type: 'Point',
      coordinates: [78.4074, 17.4256] // [longitude, latitude]
    },
    phone: '+91 40 2354 8971',
    website: 'https://pawspetclinic.com',
    rating: 4.7,
    operatingHours: {
      monday: { open: '09:00 AM', close: '09:00 PM' },
      tuesday: { open: '09:00 AM', close: '09:00 PM' },
      wednesday: { open: '09:00 AM', close: '09:00 PM' },
      thursday: { open: '09:00 AM', close: '09:00 PM' },
      friday: { open: '09:00 AM', close: '09:00 PM' },
      saturday: { open: '09:00 AM', close: '09:00 PM' },
      sunday: { open: '10:00 AM', close: '06:00 PM' }
    }
  },
  {
    name: 'Blue Cross Animal Hospital',
    type: 'VETERINARY',
    description: 'Non-profit veterinary hospital providing affordable care for all animals',
    address: '1-8-340/1, St. John\'s Road, Secunderabad, Telangana 500003',
    location: {
      type: 'Point',
      coordinates: [78.4983, 17.4372]
    },
    phone: '+91 40 2784 3335',
    website: 'https://bluecrosshyd.org',
    rating: 4.5,
    operatingHours: {
      monday: { open: '10:00 AM', close: '08:00 PM' },
      tuesday: { open: '10:00 AM', close: '08:00 PM' },
      wednesday: { open: '10:00 AM', close: '08:00 PM' },
      thursday: { open: '10:00 AM', close: '08:00 PM' },
      friday: { open: '10:00 AM', close: '08:00 PM' },
      saturday: { open: '10:00 AM', close: '06:00 PM' },
      sunday: { open: '10:00 AM', close: '02:00 PM' }
    }
  },

  // Grooming Shops
  {
    name: 'Pawsome Grooming Spa',
    type: 'GROOMING',
    description: 'Luxury pet grooming services with certified groomers',
    address: 'Plot 135, Road No. 12, Banjara Hills, Hyderabad, Telangana 500034',
    location: {
      type: 'Point',
      coordinates: [78.4375, 17.4156]
    },
    phone: '+91 90001 23456',
    website: 'https://pawsomespa.in',
    rating: 4.8,
    operatingHours: {
      monday: { open: '11:00 AM', close: '08:00 PM' },
      tuesday: { open: '11:00 AM', close: '08:00 PM' },
      wednesday: { open: '11:00 AM', close: '08:00 PM' },
      thursday: { open: '11:00 AM', close: '08:00 PM' },
      friday: { open: '11:00 AM', close: '08:00 PM' },
      saturday: { open: '10:00 AM', close: '09:00 PM' },
      sunday: { open: '10:00 AM', close: '09:00 PM' }
    }
  },

  // Pet Stores
  {
    name: 'Petsville Store',
    type: 'PET_STORE',
    description: 'Complete pet store with food, accessories, and supplies',
    address: 'Shop 7, Ground Floor, Forum Sujana Mall, Kukatpally, Hyderabad, Telangana 500072',
    location: {
      type: 'Point',
      coordinates: [78.4324, 17.4849]
    },
    phone: '+91 90002 34567',
    website: 'https://petsville.in',
    rating: 4.6,
    operatingHours: {
      monday: { open: '10:30 AM', close: '09:30 PM' },
      tuesday: { open: '10:30 AM', close: '09:30 PM' },
      wednesday: { open: '10:30 AM', close: '09:30 PM' },
      thursday: { open: '10:30 AM', close: '09:30 PM' },
      friday: { open: '10:30 AM', close: '09:30 PM' },
      saturday: { open: '10:30 AM', close: '09:30 PM' },
      sunday: { open: '10:30 AM', close: '09:30 PM' }
    }
  },

  // Adoption Centers
  {
    name: 'People For Animals',
    type: 'ADOPTION_CENTER',
    description: 'Non-profit animal welfare organization and adoption center',
    address: 'Survey No. 18/A, Patighanpur Village, Medchal, Hyderabad, Telangana 501401',
    location: {
      type: 'Point',
      coordinates: [78.5493, 17.6012]
    },
    phone: '+91 90003 45678',
    website: 'https://pfahyd.org',
    rating: 4.9,
    operatingHours: {
      monday: { open: '10:00 AM', close: '05:00 PM' },
      tuesday: { open: '10:00 AM', close: '05:00 PM' },
      wednesday: { open: '10:00 AM', close: '05:00 PM' },
      thursday: { open: '10:00 AM', close: '05:00 PM' },
      friday: { open: '10:00 AM', close: '05:00 PM' },
      saturday: { open: '10:00 AM', close: '05:00 PM' },
      sunday: { open: '10:00 AM', close: '02:00 PM' }
    }
  },

  // Pet Shelters
  {
    name: 'Care & Compassion Animal Shelter',
    type: 'SHELTER',
    description: 'Safe haven for abandoned and rescued animals',
    address: 'Plot 45, Serilingampally, Hyderabad, Telangana 500019',
    location: {
      type: 'Point',
      coordinates: [78.3754, 17.4927]
    },
    phone: '+91 90004 56789',
    website: 'https://carecompassion.org',
    rating: 4.7,
    operatingHours: {
      monday: { open: '09:00 AM', close: '06:00 PM' },
      tuesday: { open: '09:00 AM', close: '06:00 PM' },
      wednesday: { open: '09:00 AM', close: '06:00 PM' },
      thursday: { open: '09:00 AM', close: '06:00 PM' },
      friday: { open: '09:00 AM', close: '06:00 PM' },
      saturday: { open: '09:00 AM', close: '06:00 PM' },
      sunday: { open: '10:00 AM', close: '04:00 PM' }
    }
  },

  // Pet Training
  {
    name: 'K9 School',
    type: 'TRAINING',
    description: 'Professional dog training and behavior modification',
    address: 'Plot 92, Madhapur, Hyderabad, Telangana 500081',
    location: {
      type: 'Point',
      coordinates: [78.3873, 17.4400]
    },
    phone: '+91 90005 67890',
    website: 'https://k9school.in',
    rating: 4.8,
    operatingHours: {
      monday: { open: '08:00 AM', close: '07:00 PM' },
      tuesday: { open: '08:00 AM', close: '07:00 PM' },
      wednesday: { open: '08:00 AM', close: '07:00 PM' },
      thursday: { open: '08:00 AM', close: '07:00 PM' },
      friday: { open: '08:00 AM', close: '07:00 PM' },
      saturday: { open: '09:00 AM', close: '05:00 PM' },
      sunday: { open: '09:00 AM', close: '05:00 PM' }
    }
  }
];

// Generate additional services
const generateAdditionalServices = () => {
  const areas = [
    'Gachibowli', 'Kondapur', 'Madhapur', 'Kukatpally', 'Miyapur', 
    'Begumpet', 'Banjara Hills', 'Jubilee Hills', 'Secunderabad', 'Uppal',
    'Dilsukhnagar', 'Ameerpet', 'Manikonda', 'Financial District', 'Nallagandla',
    'Chandanagar', 'KPHB', 'LB Nagar', 'Mehdipatnam', 'Attapur'
  ];

  const vetNames = ['Pet Care Center', 'Animal Hospital', 'Vet Clinic', 'Pet Hospital', 'Animal Care'];
  const groomNames = ['Pet Spa', 'Grooming Studio', 'Pet Salon', 'Pawfect Grooming', 'Pet Style'];
  const storeNames = ['Pet Shop', 'Pet Mart', 'Pet Store', 'Pet Supplies', 'Pet Zone'];
  const shelterNames = ['Animal Shelter', 'Pet Haven', 'Animal Rescue', 'Pet Sanctuary', 'Animal Home'];
  const trainingNames = ['Pet Training School', 'Dog Academy', 'Pet Behavior Center', 'K9 Training', 'Pet Education'];
  const adoptionNames = ['Adoption Center', 'Pet Adoption', 'Forever Home', 'Pet Family', 'New Beginnings'];

  const additionalServices = [];

  // Generate services for each area
  areas.forEach(area => {
    // Add veterinary hospitals
    for (let i = 0; i < 2; i++) {
      additionalServices.push({
        name: `${area} ${vetNames[Math.floor(Math.random() * vetNames.length)]}`,
        type: 'VETERINARY',
        description: '24/7 veterinary care with experienced staff and modern facilities',
        address: `${Math.floor(Math.random() * 300 + 1)}, ${area}, Hyderabad`,
        location: {
          type: 'Point',
          coordinates: generateRandomLocation()
        },
        phone: generatePhone(),
        website: `https://example.com/${area.toLowerCase().replace(' ', '')}-vet-${i}`,
        rating: generateRating(),
        operatingHours: {
          monday: { open: '09:00 AM', close: '09:00 PM' },
          tuesday: { open: '09:00 AM', close: '09:00 PM' },
          wednesday: { open: '09:00 AM', close: '09:00 PM' },
          thursday: { open: '09:00 AM', close: '09:00 PM' },
          friday: { open: '09:00 AM', close: '09:00 PM' },
          saturday: { open: '09:00 AM', close: '06:00 PM' },
          sunday: { open: '10:00 AM', close: '02:00 PM' }
        }
      });
    }

    // Add grooming services
    additionalServices.push({
      name: `${area} ${groomNames[Math.floor(Math.random() * groomNames.length)]}`,
      type: 'GROOMING',
      description: 'Professional pet grooming services with certified groomers',
      address: `${Math.floor(Math.random() * 300 + 1)}, ${area}, Hyderabad`,
      location: {
        type: 'Point',
        coordinates: generateRandomLocation()
      },
      phone: generatePhone(),
      website: `https://example.com/${area.toLowerCase().replace(' ', '')}-groom`,
      rating: generateRating(),
      operatingHours: {
        monday: { open: '10:00 AM', close: '08:00 PM' },
        tuesday: { open: '10:00 AM', close: '08:00 PM' },
        wednesday: { open: '10:00 AM', close: '08:00 PM' },
        thursday: { open: '10:00 AM', close: '08:00 PM' },
        friday: { open: '10:00 AM', close: '08:00 PM' },
        saturday: { open: '09:00 AM', close: '09:00 PM' },
        sunday: { open: '09:00 AM', close: '06:00 PM' }
      }
    });

    // Add pet stores
    additionalServices.push({
      name: `${area} ${storeNames[Math.floor(Math.random() * storeNames.length)]}`,
      type: 'PET_STORE',
      description: 'One-stop shop for all pet needs including food, toys, and accessories',
      address: `${Math.floor(Math.random() * 300 + 1)}, ${area}, Hyderabad`,
      location: {
        type: 'Point',
        coordinates: generateRandomLocation()
      },
      phone: generatePhone(),
      website: `https://example.com/${area.toLowerCase().replace(' ', '')}-store`,
      rating: generateRating(),
      operatingHours: {
        monday: { open: '10:00 AM', close: '09:00 PM' },
        tuesday: { open: '10:00 AM', close: '09:00 PM' },
        wednesday: { open: '10:00 AM', close: '09:00 PM' },
        thursday: { open: '10:00 AM', close: '09:00 PM' },
        friday: { open: '10:00 AM', close: '09:00 PM' },
        saturday: { open: '10:00 AM', close: '09:00 PM' },
        sunday: { open: '11:00 AM', close: '08:00 PM' }
      }
    });
  });

  // Add some shelters (fewer than other services)
  ['Kompally', 'Shamshabad', 'Medchal', 'Shamirpet', 'Gandipet'].forEach(area => {
    additionalServices.push({
      name: `${area} ${shelterNames[Math.floor(Math.random() * shelterNames.length)]}`,
      type: 'SHELTER',
      description: 'Safe haven for abandoned and rescued animals with rehabilitation facilities',
      address: `${Math.floor(Math.random() * 300 + 1)}, ${area}, Hyderabad`,
      location: {
        type: 'Point',
        coordinates: generateRandomLocation()
      },
      phone: generatePhone(),
      website: `https://example.com/${area.toLowerCase().replace(' ', '')}-shelter`,
      rating: generateRating(),
      operatingHours: {
        monday: { open: '09:00 AM', close: '06:00 PM' },
        tuesday: { open: '09:00 AM', close: '06:00 PM' },
        wednesday: { open: '09:00 AM', close: '06:00 PM' },
        thursday: { open: '09:00 AM', close: '06:00 PM' },
        friday: { open: '09:00 AM', close: '06:00 PM' },
        saturday: { open: '09:00 AM', close: '06:00 PM' },
        sunday: { open: '10:00 AM', close: '04:00 PM' }
      }
    });
  });

  // Add training centers
  ['Gachibowli', 'Jubilee Hills', 'Secunderabad', 'Kukatpally', 'Banjara Hills'].forEach(area => {
    additionalServices.push({
      name: `${area} ${trainingNames[Math.floor(Math.random() * trainingNames.length)]}`,
      type: 'TRAINING',
      description: 'Professional pet training and behavior modification services',
      address: `${Math.floor(Math.random() * 300 + 1)}, ${area}, Hyderabad`,
      location: {
        type: 'Point',
        coordinates: generateRandomLocation()
      },
      phone: generatePhone(),
      website: `https://example.com/${area.toLowerCase().replace(' ', '')}-training`,
      rating: generateRating(),
      operatingHours: {
        monday: { open: '08:00 AM', close: '07:00 PM' },
        tuesday: { open: '08:00 AM', close: '07:00 PM' },
        wednesday: { open: '08:00 AM', close: '07:00 PM' },
        thursday: { open: '08:00 AM', close: '07:00 PM' },
        friday: { open: '08:00 AM', close: '07:00 PM' },
        saturday: { open: '09:00 AM', close: '05:00 PM' },
        sunday: { open: '09:00 AM', close: '05:00 PM' }
      }
    });
  });

  return additionalServices;
};

// Combine base services with additional services
const allServices = [...baseServices, ...generateAdditionalServices()];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in .env file');
    }

    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB successfully');

    // Clear existing services
    await Service.deleteMany({});
    console.log('Cleared existing services');

    // Insert all services
    await Service.insertMany(allServices);
    console.log(`Added ${allServices.length} services successfully`);

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase(); 