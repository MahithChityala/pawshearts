const Service = require('../models/Service');

const serviceController = {
  // Get all services
  getAllServices: async (req, res) => {
    try {
      const services = await Service.find();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get services by type
  getServicesByType: async (req, res) => {
    try {
      const { type } = req.params;
      const services = await Service.find({ type });
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get nearby services by type and location
  getNearbyServices: async (req, res) => {
    try {
      const { type } = req.params;
      const { latitude, longitude, radius = 5000 } = req.query; // radius in meters, default 5km

      const services = await Service.find({
        type,
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: radius
          }
        }
      });

      res.json(services);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add a new service
  addService: async (req, res) => {
    try {
      const service = new Service(req.body);
      const savedService = await service.save();
      res.status(201).json(savedService);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Update a service
  updateService: async (req, res) => {
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
  },

  // Delete a service
  deleteService: async (req, res) => {
    try {
      const { id } = req.params;
      await Service.findByIdAndDelete(id);
      res.json({ message: 'Service deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Add a review to a service
  addReview: async (req, res) => {
    try {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = req.user._id;

      const service = await Service.findById(id);
      service.reviews.push({
        user: userId,
        rating,
        comment
      });

      // Update average rating
      const totalRating = service.reviews.reduce((sum, review) => sum + review.rating, 0);
      service.rating = totalRating / service.reviews.length;

      const updatedService = await service.save();
      res.json(updatedService);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
};

module.exports = serviceController; 