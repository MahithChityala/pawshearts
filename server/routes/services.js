const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const auth = require('../middleware/auth');
const Service = require('../models/Service');

// Public routes
router.get('/', async (req, res) => {
  try {
    const services = await Service.find();
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/type/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const services = await Service.find({ type });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/nearby/:type', async (req, res) => {
  try {
    const { type } = req.params;
    const { latitude, longitude, radius = 45000 } = req.query;

    console.log('Received nearby services request:', {
      type,
      latitude,
      longitude,
      radius
    });

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Missing required parameters: latitude and longitude are required',
        receivedParams: req.query
      });
    }

    const query = {
      type,
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius)
        }
      }
    };

    console.log('Executing MongoDB query:', JSON.stringify(query, null, 2));

    const services = await Service.find(query);
    
    console.log(`Found ${services.length} nearby services within ${radius/1000}km`);
    if (services.length > 0) {
      console.log('First service:', {
        name: services[0].name,
        coordinates: services[0].location.coordinates
      });
    }

    res.json(services);
  } catch (error) {
    console.error('Error in nearby services route:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Protected routes (require authentication)
router.post('/', auth, async (req, res) => {
  try {
    const service = new Service(req.body);
    const savedService = await service.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedService = await Service.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );
    res.json(updatedService);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    await Service.findByIdAndDelete(id);
    res.json({ message: 'Service deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/reviews', auth, serviceController.addReview);

// Add test route to verify the API is accessible
router.get('/test', (req, res) => {
  console.log('Service API test route accessed');
  res.json({ message: 'Service API is working' });
});

module.exports = router; 