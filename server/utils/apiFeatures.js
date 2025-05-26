class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.filterObj = {};
  }

  filter() {
    // 1) Create a shallow copy of the query object
    const queryObj = { ...this.queryString };
    
    // 2) Exclude reserved fields
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'q'];
    excludedFields.forEach(field => delete queryObj[field]);
    
    // 3) Handle specific filter fields for products
    if (queryObj.category) {
      this.filterObj.category = queryObj.category;
    }
    
    if (queryObj.petType) {
      this.filterObj.petType = queryObj.petType;
    }
    
    if (queryObj.brand) {
      this.filterObj.brand = queryObj.brand;
    }
    
    if (queryObj.isFeatured) {
      this.filterObj.isFeatured = queryObj.isFeatured === 'true' ? true : false;
    }
    
    if (queryObj.isOnSale) {
      this.filterObj.isOnSale = queryObj.isOnSale === 'true' ? true : false;
    }
    
    // 4) Handle price range
    if (queryObj.priceMin || queryObj.priceMax) {
      this.filterObj.price = {};
      
      if (queryObj.priceMin) {
        this.filterObj.price.$gte = Number(queryObj.priceMin);
      }
      
      if (queryObj.priceMax) {
        this.filterObj.price.$lte = Number(queryObj.priceMax);
      }
    }
    
    // 5) Handle rating filter
    if (queryObj.ratingMin) {
      this.filterObj.rating = { $gte: Number(queryObj.ratingMin) };
    }
    
    // 6) Handle availability filter
    if (queryObj.inStock === 'true') {
      this.filterObj.countInStock = { $gt: 0 };
    }
    
    // 7) Advanced filtering for other fields
    let advancedQueryObj = { ...queryObj };
    excludedFields.concat(['category', 'petType', 'brand', 'isFeatured', 'isOnSale', 
      'priceMin', 'priceMax', 'ratingMin', 'inStock']).forEach(el => delete advancedQueryObj[el]);
    
    // 8) Format operators ($gt, $gte, etc.)
    let queryStr = JSON.stringify(advancedQueryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    // Merge the filterObj with the advanced query
    this.filterObj = { ...this.filterObj, ...JSON.parse(queryStr) };
    
    this.query = this.query.find(this.filterObj);
    
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      // Default sort by createdAt descending (newest first)
      this.query = this.query.sort('-createdAt');
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      // Exclude the MongoDB internal __v field by default
      this.query = this.query.select('-__v');
    }

    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIFeatures; 