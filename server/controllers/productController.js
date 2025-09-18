import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import ErrorResponse from '../utils/errorResponse.js';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';

// Configure Cloudinary
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

// Validate product data
const validateProductData = (data, isUpdate = false) => {
  const errors = [];
  
  if (!isUpdate || data.name !== undefined) {
    if (!data.name || data.name.trim().length < 3) {
      errors.push('Product name is required and must be at least 3 characters long');
    }
  }
  
  if (!isUpdate || data.price !== undefined) {
    if (data.price === undefined || isNaN(data.price) || data.price < 0) {
      errors.push('Valid price is required');
    }
  }
  
  if (data.salePrice !== undefined && data.salePrice >= data.price) {
    errors.push('Sale price must be less than regular price');
  }
  
  if (data.stock !== undefined && (isNaN(data.stock) || data.stock < 0)) {
    errors.push('Stock must be a non-negative number');
  }
  
  if (data.category && !mongoose.Types.ObjectId.isValid(data.category)) {
    errors.push('Invalid category ID');
  }
  
  if (data.brand && !mongoose.Types.ObjectId.isValid(data.brand)) {
    errors.push('Invalid brand ID');
  }
  
  return errors.length > 0 ? errors : null;
};

// @desc    Get all products with advanced filtering
// @route   GET /api/v1/products
// @access  Public
export const getProducts = asyncHandler(async (req, res, next) => {
  try {
    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude from filtering
    const removeFields = [
      'select', 'sort', 'page', 'limit', 'search', 
      'category', 'brand', 'minPrice', 'maxPrice', 
      'inStock', 'isActive', 'isFeatured', 'onSale'
    ];

    // Build query object
    let queryObj = {};
    
    // Category filter (by ID or slug)
    if (req.query.category) {
      const category = await Category.findOne({ 
        $or: [
          { _id: req.query.category },
          { slug: req.query.category }
        ]
      });
      
      if (category) {
        queryObj.category = category._id;
      } else if (mongoose.Types.ObjectId.isValid(req.query.category)) {
        // If it's a valid ObjectId but category not found
        return next(new ErrorResponse('Category not found', 404));
      }
    }
    
    // Brand filter (by ID or slug)
    if (req.query.brand) {
      const brand = await Brand.findOne({
        $or: [
          { _id: req.query.brand },
          { slug: req.query.brand }
        ]
      });
      
      if (brand) {
        queryObj.brand = brand._id;
      } else if (mongoose.Types.ObjectId.isValid(req.query.brand)) {
        // If it's a valid ObjectId but brand not found
        return next(new ErrorResponse('Brand not found', 404));
      }
    }
    
    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) {
        const minPrice = parseFloat(req.query.minPrice);
        if (isNaN(minPrice)) {
          return next(new ErrorResponse('Invalid minimum price', 400));
        }
        queryObj.price.$gte = minPrice;
      }
      if (req.query.maxPrice) {
        const maxPrice = parseFloat(req.query.maxPrice);
        if (isNaN(maxPrice)) {
          return next(new ErrorResponse('Invalid maximum price', 400));
        }
        queryObj.price.$lte = maxPrice;
      }
    }
    
    // Stock status filter
    if (req.query.inStock === 'true') {
      queryObj.stock = { $gt: 0 };
    } else if (req.query.inStock === 'false') {
      queryObj.stock = 0;
    }
    
    // Active status filter
    if (req.query.isActive === 'true' || req.query.isActive === 'false') {
      queryObj.isActive = req.query.isActive === 'true';
    } else if (!req.user?.isAdmin) {
      // For non-admin users, only show active products by default
      queryObj.isActive = true;
    }
    
    // Featured filter
    if (req.query.isFeatured === 'true') {
      queryObj.isFeatured = true;
    }
    
    // On sale filter
    if (req.query.onSale === 'true') {
      queryObj.salePrice = { $gt: 0 };
    }

    // Process other query parameters (e.g., specifications)
    removeFields.forEach(param => delete reqQuery[param]);
    
    // Process other filters (e.g., specifications)
    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in|regex)\b/g, match => `$${match}`);
    
    // Merge with existing query object
    try {
      const additionalFilters = JSON.parse(queryStr);
      queryObj = { ...queryObj, ...additionalFilters };
    } catch (error) {
      console.error('Error parsing query string:', error);
      return next(new ErrorResponse('Invalid filter parameters', 400));
    }

    // Build query with populated fields
    let query = Product.find(queryObj)
      .populate([
        { 
          path: 'category', 
          select: 'name slug',
          match: { isActive: true }
        },
        { 
          path: 'brand', 
          select: 'name slug',
          match: { isActive: true }
        }
      ]);

    // Full-text search
    if (req.query.search) {
      const searchRegex = new RegExp(escapeRegex(req.query.search), 'gi');
      query = query.or([
        { name: searchRegex },
        { description: searchRegex },
        { 'specifications.value': searchRegex },
        { sku: searchRegex },
        { tags: searchRegex }
      ]);
    }

    // Select specific fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sorting
    let sortOption = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        const sortOrder = field.startsWith('-') ? -1 : 1;
        const fieldName = field.replace(/^-/, '');
        sortOption[fieldName] = sortOrder;
      });
    } else {
      // Default sort order
      sortOption = { createdAt: -1 };
    }
    
    // Apply sorting
    query = query.sort(sortOption);

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100); // Max 100 items per page
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    // Get total count for pagination
    const total = await Product.countDocuments(query.getFilter());

    // Apply pagination
    query = query.skip(startIndex).limit(limit);

    // Execute query
    const products = await query.lean();
    
    // Filter out products with inactive categories/brands
    const filteredProducts = products.filter(product => 
      (!product.category || product.category) && 
      (!product.brand || product.brand)
    );

    // Pagination result
    const pagination = {
      currentPage: page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
    };

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    // Get filter options for the frontend
    const filterOptions = await getFilterOptions(queryObj);

    res.status(200).json({
      success: true,
      count: filteredProducts.length,
      pagination,
      filters: filterOptions,
      data: filteredProducts,
    });
  } catch (error) {
    console.error('Error in getProducts:', error);
    next(new ErrorResponse('Server error while fetching products', 500));
  }
});

// Helper function to escape regex characters
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

// Helper function to get filter options based on current filters
const getFilterOptions = async (currentFilters = {}) => {
  try {
    // Get all active categories with product counts
    const categories = await Category.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'products',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$category', '$$categoryId'] },
                    ...(currentFilters.brand ? [{ $eq: ['$brand', new mongoose.Types.ObjectId(currentFilters.brand)] }] : []),
                    ...(currentFilters.price ? [
                      ...(currentFilters.price.$gte ? [{ $gte: ['$price', currentFilters.price.$gte] }] : []),
                      ...(currentFilters.price.$lte ? [{ $lte: ['$price', currentFilters.price.$lte] }] : [])
                    ] : []),
                    { $eq: ['$isActive', true] }
                  ]
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'productCount'
        }
      },
      { $unwind: '$productCount' },
      { $match: { 'productCount.count': { $gt: 0 } } },
      { 
        $project: { 
          _id: 1, 
          name: 1, 
          slug: 1, 
          count: '$productCount.count' 
        } 
      },
      { $sort: { name: 1 } }
    ]);
    
    // Get all active brands with product counts
    const brands = await Brand.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'products',
          let: { brandId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$brand', '$$brandId'] },
                    ...(currentFilters.category ? [{ $eq: ['$category', new mongoose.Types.ObjectId(currentFilters.category)] }] : []),
                    ...(currentFilters.price ? [
                      ...(currentFilters.price.$gte ? [{ $gte: ['$price', currentFilters.price.$gte] }] : []),
                      ...(currentFilters.price.$lte ? [{ $lte: ['$price', currentFilters.price.$lte] }] : [])
                    ] : []),
                    { $eq: ['$isActive', true] }
                  ]
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'productCount'
        }
      },
      { $unwind: '$productCount' },
      { $match: { 'productCount.count': { $gt: 0 } } },
      { 
        $project: { 
          _id: 1, 
          name: 1, 
          slug: 1, 
          count: '$productCount.count' 
        } 
      },
      { $sort: { name: 1 } }
    ]);
    
    // Get price range for current filters
    const priceRange = await Product.aggregate([
      {
        $match: {
          ...(currentFilters.category ? { category: new mongoose.Types.ObjectId(currentFilters.category) } : {}),
          ...(currentFilters.brand ? { brand: new mongoose.Types.ObjectId(currentFilters.brand) } : {}),
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          min: { $min: '$price' },
          max: { $max: '$price' },
          avg: { $avg: '$price' }
        }
      }
    ]);
    
    // Get count of products on sale
    const onSaleCount = await Product.countDocuments({
      ...currentFilters,
      salePrice: { $gt: 0 },
      isActive: true
    });
    
    // Get count of in-stock products
    const inStockCount = await Product.countDocuments({
      ...currentFilters,
      stock: { $gt: 0 },
      isActive: true
    });

    return {
      categories,
      brands,
      priceRange: priceRange[0] || { min: 0, max: 1000, avg: 500 },
      onSaleCount,
      inStockCount
    };
  } catch (error) {
    console.error('Error getting filter options:', error);
    return {};
  }
};

// @desc    Get single product
// @route   GET /api/v1/products/:id
// @access  Public
export const getProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate([
      { path: 'category', select: 'name slug' },
      { path: 'subcategory', select: 'name slug' },
      { path: 'brand', select: 'name' },
      {
        path: 'reviews',
        select: 'rating comment user createdAt',
        populate: {
          path: 'user',
          select: 'name',
        },
      },
      {
        path: 'relatedProducts',
        select: 'name price images rating numReviews',
      },
    ])
    .lean();

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Add related products if none are assigned
  if (!product.relatedProducts || product.relatedProducts.length === 0) {
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    })
      .limit(4)
      .select('name price images rating numReviews')
      .lean();

    product.relatedProducts = relatedProducts;
  }

  res.status(200).json({
    success: true,
    data: product,
  });
});

// @desc    Bulk create products (Admin only)
// @route   POST /api/v1/products/bulk
// @access  Private/Admin
export const bulkCreateProducts = asyncHandler(async (req, res, next) => {
  if (!req.body.products || !Array.isArray(req.body.products)) {
    return next(new ErrorResponse('Please provide an array of products', 400));
  }
  
  // Validate each product
  const validationErrors = [];
  const validProducts = [];
  
  for (let i = 0; i < req.body.products.length; i++) {
    const productData = req.body.products[i];
    const errors = validateProductData(productData);
    
    if (errors) {
      validationErrors.push({
        index: i,
        errors
      });
    } else {
      validProducts.push({
        ...productData,
        user: req.user.id,
        isActive: req.user.role === 'admin' ? (productData.isActive !== false) : false
      });
    }
  }
  
  if (validationErrors.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed for some products',
      validationErrors,
      validCount: validProducts.length,
      errorCount: validationErrors.length
    });
  }
  
  try {
    const createdProducts = await Product.insertMany(validProducts);
    
    res.status(201).json({
      success: true,
      count: createdProducts.length,
      data: createdProducts
    });
  } catch (error) {
    console.error('Bulk create error:', error);
    next(new ErrorResponse('Error creating products', 500));
  }
});

// @desc    Create new product
// @route   POST /api/v1/products
// @access  Private/Admin
export const createProduct = asyncHandler(async (req, res, next) => {
  try {
    // Add user to req.body
    req.body.user = req.user.id;
    
    // Set default status based on user role
    req.body.isActive = req.user.role === 'admin' ? (req.body.isActive !== false) : false;

    // Validate product data
    const validationErrors = validateProductData(req.body);
    if (validationErrors) {
      return next(new ErrorResponse(validationErrors.join(', '), 400));
    }

    // Handle image upload
    if (req.files && req.files.length > 0) {
      configureCloudinary();
      const images = [];
      
      // Process each uploaded file
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'ecommerce/products',
            width: 1000,
            height: 1000,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto'
          });

          images.push({
            url: result.secure_url,
            alt: file.originalname || 'Product image',
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
          });
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue with other images if one fails
        } finally {
          // Delete file from server
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }

      if (images.length > 0) {
        req.body.images = images;
      } else {
        return next(new ErrorResponse('Failed to upload product images', 400));
      }
    }

    // Check for SKU uniqueness
    if (req.body.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        return next(new ErrorResponse('SKU already exists', 400));
      }
    } else {
      // Generate SKU if not provided
      const prefix = req.body.name 
        ? req.body.name.substring(0, 3).toUpperCase()
        : 'PRD';
      const random = Math.floor(1000 + Math.random() * 9000);
      req.body.sku = `${prefix}-${random}`;
    }

    // Create product
    const product = await Product.create(req.body);

    // Populate references
    await product.populate([
      { path: 'category', select: 'name slug' },
      { path: 'brand', select: 'name slug' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Create product error:', error);
    next(new ErrorResponse('Error creating product', 500));
  }
});

// @desc    Bulk update products (Admin only)
// @route   PUT /api/v1/products/bulk
// @access  Private/Admin
export const bulkUpdateProducts = asyncHandler(async (req, res, next) => {
  if (!req.body.ids || !Array.isArray(req.body.ids) || !req.body.updateData) {
    return next(new ErrorResponse('Please provide product IDs and update data', 400));
  }
  
  // Remove restricted fields
  const { ids, updateData } = req.body;
  const { user, _id, createdAt, ...safeUpdateData } = updateData;
  
  // Validate update data
  const validationErrors = [];
  if (safeUpdateData.price !== undefined && isNaN(safeUpdateData.price)) {
    validationErrors.push('Price must be a valid number');
  }
  
  if (safeUpdateData.stock !== undefined && (isNaN(safeUpdateData.stock) || safeUpdateData.stock < 0)) {
    validationErrors.push('Stock must be a non-negative number');
  }
  
  if (validationErrors.length > 0) {
    return next(new ErrorResponse(validationErrors.join(', '), 400));
  }
  
  try {
    // Find all products to be updated
    const productsToUpdate = await Product.find({ 
      _id: { $in: ids },
      $or: [
        { user: req.user.id },
        { role: 'admin' } // Admin can update any product
      ]
    });
    
    if (productsToUpdate.length === 0) {
      return next(new ErrorResponse('No products found or unauthorized', 404));
    }
    
    // Update products
    const result = await Product.updateMany(
      { _id: { $in: productsToUpdate.map(p => p._id) } },
      { 
        $set: { 
          ...safeUpdateData,
          updatedAt: new Date()
        } 
      },
      { runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      data: {
        matchedCount: result.matchedCount,
        modifiedCount: result.modifiedCount,
        acknowledged: result.acknowledged
      }
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    next(new ErrorResponse('Error updating products', 500));
  }
});

// @desc    Update product
// @route   PUT /api/v1/products/:id
// @access  Private/Admin
export const updateProduct = asyncHandler(async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is product owner or admin
    if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to update this product`,
          403
        )
      );
    }
    
    // Validate update data
    if (req.body.price !== undefined && isNaN(req.body.price)) {
      return next(new ErrorResponse('Price must be a valid number', 400));
    }
    
    if (req.body.stock !== undefined && (isNaN(req.body.stock) || req.body.stock < 0)) {
      return next(new ErrorResponse('Stock must be a non-negative number', 400));
    }
    
    // Handle image updates
    if (req.files && req.files.length > 0) {
      configureCloudinary();
      const images = [];
      
      // Upload new images
      for (const file of req.files) {
        try {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: 'ecommerce/products',
            width: 1000,
            height: 1000,
            crop: 'limit',
            quality: 'auto',
            fetch_format: 'auto'
          });

          images.push({
            url: result.secure_url,
            alt: file.originalname || 'Product image',
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
          });
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          // Continue with other images if one fails
        } finally {
          // Delete file from server
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        }
      }
      
      if (images.length > 0) {
        // Keep existing images if not explicitly removed
        const existingImages = req.body.keepExistingImages !== false ? 
          (product.images || []) : [];
        req.body.images = [...existingImages, ...images];
      }
    }
    
    // Handle SKU update
    if (req.body.sku && req.body.sku !== product.sku) {
      const existingProduct = await Product.findOne({ sku: req.body.sku });
      if (existingProduct) {
        return next(new ErrorResponse('SKU already exists', 400));
      }
    }

    // Update product
    product = await Product.findByIdAndUpdate(
      req.params.id, 
      { 
        ...req.body,
        // Only update updatedAt if not explicitly set
        $currentDate: { updatedAt: true }
      },
      {
        new: true,
        runValidators: true,
      }
    ).populate([
      { path: 'category', select: 'name slug' },
      { path: 'brand', select: 'name slug' },
      { path: 'user', select: 'name email' }
    ]);

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error('Update product error:', error);
    next(new ErrorResponse('Error updating product', 500));
  }
});

// @desc    Bulk delete products (Admin only)
// @route   DELETE /api/v1/products/bulk
// @access  Private/Admin
export const bulkDeleteProducts = asyncHandler(async (req, res, next) => {
  if (!req.body.ids || !Array.isArray(req.body.ids)) {
    return next(new ErrorResponse('Please provide product IDs to delete', 400));
  }
  
  try {
    // Get products to be deleted for cleanup
    const productsToDelete = await Product.find({ 
      _id: { $in: req.body.ids },
      $or: [
        { user: req.user.id },
        { role: 'admin' } // Admin can delete any product
      ]
    });
    
    if (productsToDelete.length === 0) {
      return next(new ErrorResponse('No products found or unauthorized', 404));
    }
    
    // Delete from Cloudinary in the background
    if (process.env.ENABLE_SOFT_DELETE !== 'true') {
      configureCloudinary();
      
      for (const product of productsToDelete) {
        if (product.images && product.images.length > 0) {
          for (const img of product.images) {
            if (img.public_id) {
              try {
                await cloudinary.uploader.destroy(img.public_id);
              } catch (error) {
                console.error(`Error deleting image ${img.public_id}:`, error);
                // Continue with next image
              }
            }
          }
        }
      }
    }
    
    let result;
    if (process.env.ENABLE_SOFT_DELETE === 'true') {
      // Soft delete: mark as inactive
      result = await Product.updateMany(
        { _id: { $in: productsToDelete.map(p => p._id) } },
        { 
          $set: { 
            isActive: false,
            deletedAt: new Date(),
            deletedBy: req.user.id
          } 
        }
      );
    } else {
      // Hard delete: remove from database
      result = await Product.deleteMany({ _id: { $in: productsToDelete.map(p => p._id) } });
    }
    
    res.status(200).json({
      success: true,
      data: {
        deletedCount: result.modifiedCount || result.deletedCount,
        acknowledged: result.acknowledged
      },
      message: process.env.ENABLE_SOFT_DELETE === 'true' 
        ? 'Products archived successfully' 
        : 'Products deleted successfully'
    });
  } catch (error) {
    console.error('Bulk delete error:', error);
    next(new ErrorResponse('Error deleting products', 500));
  }
});

// @desc    Delete product
// @route   DELETE /api/v1/products/:id
// @access  Private/Admin
export const deleteProduct = asyncHandler(async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(
        new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
      );
    }

    // Make sure user is product owner or admin
    if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(
        new ErrorResponse(
          `User ${req.user.id} is not authorized to delete this product`,
          403
        )
      );
    }

    // Check if product is in any active orders
    const isInOrder = await Order.exists({ 
      'orderItems.product': product._id, 
      status: { $nin: ['cancelled', 'delivered', 'returned'] } 
    });
    
    if (isInOrder) {
      return next(
        new ErrorResponse(
          'Cannot delete product as it is part of active orders. Consider archiving instead.',
          400
        )
      );
    }

    // Soft delete if enabled in config, otherwise hard delete
    if (process.env.ENABLE_SOFT_DELETE === 'true') {
      // Soft delete: mark as inactive and set deletedAt
      product.isActive = false;
      product.deletedAt = new Date();
      product.deletedBy = req.user.id;
      await product.save();
      
      res.status(200).json({
        success: true,
        data: {},
        message: 'Product archived successfully'
      });
    } else {
      // Hard delete: remove from database and cloud storage
      
      // Delete images from Cloudinary
      if (product.images && product.images.length > 0) {
        configureCloudinary();
        
        for (const img of product.images) {
          if (img.public_id) {
            try {
              await cloudinary.uploader.destroy(img.public_id);
            } catch (error) {
              console.error(`Error deleting image ${img.public_id}:`, error);
              // Continue with next image
            }
          }
        }
      }

      // Delete from database
      await product.remove();

      res.status(200).json({
        success: true,
        data: {},
        message: 'Product deleted successfully'
      });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    next(new ErrorResponse('Error deleting product', 500));
  }
});

// @desc    Upload photo for product
// @route   PUT /api/v1/products/:id/photo
// @access  Private/Admin
export const productPhotoUpload = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is product owner or admin
  if (product.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new ErrorResponse(
        `User ${req.user.id} is not authorized to update this product`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  const maxSize = process.env.MAX_FILE_UPLOAD || 1000000;
  if (file.size > maxSize) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${maxSize / 1000}KB`,
        400
      )
    );
  }

  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload image to Cloudinary
  const result = await cloudinary.uploader.upload(file.tempFilePath, {
    folder: 'ecommerce/products',
    width: 1000,
    height: 1000,
    crop: 'limit',
  });

  // Add new image to product
  product.images.push({
    url: result.secure_url,
    alt: file.name,
    public_id: result.public_id,
  });

  await product.save();

  res.status(200).json({
    success: true,
    data: result.secure_url,
  });
});

// @desc    Get product statistics (Admin only)
// @route   GET /api/v1/products/stats
// @access  Private/Admin
export const getProductStats = asyncHandler(async (req, res, next) => {
  try {
    // Get total products count
    const totalProducts = await Product.countDocuments();
    
    // Get products by category
    const productsByCategory = await Product.aggregate([
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: '$categoryInfo' },
      {
        $group: {
          _id: '$categoryInfo.name',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Get inventory status
    const inventoryStatus = await Product.aggregate([
      {
        $facet: {
          outOfStock: [
            { $match: { stock: 0 } },
            { $count: 'count' }
          ],
          lowStock: [
            { $match: { stock: { $gt: 0, $lte: 10 } } },
            { $count: 'count' }
          ],
          inStock: [
            { $match: { stock: { $gt: 10 } } },
            { $count: 'count' }
          ]
        }
      }
    ]);
    
    // Get price distribution
    const priceDistribution = await Product.aggregate([
      {
        $bucket: {
          groupBy: '$price',
          boundaries: [0, 10, 25, 50, 100, 250, 500, 1000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            products: { $push: { name: '$name', price: '$price', stock: '$stock' } }
          }
        }
      }
    ]);
    
    // Get recent products
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price stock images createdAt')
      .lean();
    
    // Get products with low stock
    const lowStockProducts = await Product.find({ stock: { $gt: 0, $lte: 10 } })
      .sort({ stock: 1 })
      .limit(5)
      .select('name price stock images')
      .lean();
    
    // Get products by status
    const productsByStatus = await Product.aggregate([
      {
        $group: {
          _id: {
            isActive: '$isActive',
            isFeatured: '$isFeatured'
          },
          count: { $sum: 1 },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      },
      {
        $project: {
          _id: 0,
          status: {
            $cond: [
              { $eq: ['$_id.isActive', true] },
              { $cond: [
                { $eq: ['$_id.isFeatured', true] }, 
                'Featured', 
                'Active'
              ] },
              'Inactive'
            ]
          },
          count: 1,
          totalValue: 1
        }
      }
    ]);
    
    // Get monthly product growth
    const monthlyGrowth = await Product.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          period: {
            $dateToString: {
              format: '%Y-%m',
              date: {
                $dateFromParts: {
                  year: '$_id.year',
                  month: '$_id.month',
                  day: 1
                }
              }
            }
          },
          count: 1
        }
      }
    ]);
    
    // Calculate total inventory value
    const inventoryValue = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } },
          avgPrice: { $avg: '$price' },
          totalStock: { $sum: '$stock' }
        }
      }
    ]);
    
    // Prepare response
    const stats = {
      summary: {
        totalProducts,
        ...(inventoryValue[0] || { totalValue: 0, avgPrice: 0, totalStock: 0 }),
        ...(inventoryStatus[0]?.outOfStock?.[0] || { outOfStock: 0 }),
        ...(inventoryStatus[0]?.lowStock?.[0] || { lowStock: 0 }),
        ...(inventoryStatus[0]?.inStock?.[0] || { inStock: 0 })
      },
      byCategory: productsByCategory,
      byStatus: productsByStatus,
      priceDistribution,
      recentProducts,
      lowStockProducts,
      monthlyGrowth
    };
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    next(new ErrorResponse('Error getting product statistics', 500));
  }
});

// @desc    Get sales analytics for products
// @route   GET /api/v1/products/analytics/sales
// @access  Private/Admin
export const getProductSalesAnalytics = asyncHandler(async (req, res, next) => {
  try {
    // This would typically come from an Order model
    // For now, we'll return a placeholder response
    res.status(200).json({
      success: true,
      data: {
        message: 'Sales analytics endpoint - requires order data integration',
        topSellingProducts: [],
        revenueByProduct: [],
        salesTrends: []
      }
    });
  } catch (error) {
    console.error('Get sales analytics error:', error);
    next(new ErrorResponse('Error getting sales analytics', 500));
  }
});

// @desc    Get inventory valuation report
// @route   GET /api/v1/products/analytics/inventory-valuation
// @access  Private/Admin
export const getInventoryValuation = asyncHandler(async (req, res, next) => {
  try {
    const { category, minStock, maxStock } = req.query;
    
    const matchStage = {};
    
    if (category) {
      matchStage.category = new mongoose.Types.ObjectId(category);
    }
    
    if (minStock || maxStock) {
      matchStage.stock = {};
      if (minStock) matchStage.stock.$gte = parseInt(minStock);
      if (maxStock) matchStage.stock.$lte = parseInt(maxStock);
    }
    
    const inventoryValuation = await Product.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      { $unwind: { path: '$categoryInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          name: 1,
          sku: 1,
          price: 1,
          cost: { $ifNull: ['$cost', 0] },
          stock: 1,
          category: { $ifNull: ['$categoryInfo.name', 'Uncategorized'] },
          inventoryValue: { $multiply: ['$price', '$stock'] },
          costValue: { $multiply: [{ $ifNull: ['$cost', 0] }, '$stock'] },
          profitMargin: {
            $cond: [
              { $gt: ['$price', 0] },
              {
                $multiply: [
                  { $divide: [{ $subtract: ['$price', { $ifNull: ['$cost', 0] }] }, '$price'] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { inventoryValue: -1 } }
    ]);
    
    // Calculate totals
    const totals = inventoryValuation.reduce((acc, item) => {
      acc.totalInventoryValue = (acc.totalInventoryValue || 0) + item.inventoryValue;
      acc.totalCostValue = (acc.totalCostValue || 0) + (item.costValue || 0);
      acc.totalItems = (acc.totalItems || 0) + (item.stock || 0);
      return acc;
    }, {});
    
    // Calculate average profit margin
    if (inventoryValuation.length > 0) {
      totals.averageProfitMargin = inventoryValuation.reduce(
        (sum, item) => sum + (item.profitMargin || 0), 0
      ) / inventoryValuation.length;
    }
    
    res.status(200).json({
      success: true,
      data: {
        products: inventoryValuation,
        totals,
        count: inventoryValuation.length
      }
    });
  } catch (error) {
    console.error('Get inventory valuation error:', error);
    next(new ErrorResponse('Error getting inventory valuation', 500));
  }
});

// @desc    Get top rated products
// @route   GET /api/v1/products/top
// @access  Public
// @desc    Get featured products
// @route   GET /api/v1/products/featured
// @access  Public
export const getFeaturedProducts = asyncHandler(async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    
    const products = await Product.find({ 
      isFeatured: true,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category', 'name slug')
    .populate('brand', 'name');

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error('Error in getFeaturedProducts:', error);
    next(new ErrorResponse('Server error while fetching featured products', 500));
  }
});

// @desc    Get top products
// @route   GET /api/v1/products/top
// @access  Public
export const getTopProducts = asyncHandler(async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const minReviews = parseInt(req.query.minReviews) || 3;
    
    const products = await Product.aggregate([
      {
        $match: {
          rating: { $gte: 3 }, // At least 3 stars
          numReviews: { $gte: minReviews }
        }
      },
      {
        $addFields: {
          // Calculate a score that considers both rating and number of reviews
          score: {
            $add: [
              { $multiply: ['$rating', 0.7] },
              { $multiply: [{ $log: ['$numReviews'] }, 0.3] }
            ]
          }
        }
      },
      { $sort: { score: -1 } },
      { $limit: limit },
      {
        $project: {
          name: 1,
          price: 1,
          salePrice: 1,
          images: { $slice: ['$images', 1] },
          rating: 1,
          numReviews: 1,
          slug: 1,
          sku: 1
        }
      }
    ]);
    
    // If not enough highly rated products, fill with most reviewed
    if (products.length < limit) {
      const additionalProducts = await Product.find({
        _id: { $nin: products.map(p => p._id) },
        numReviews: { $gt: 0 }
      })
        .sort({ numReviews: -1, rating: -1 })
        .limit(limit - products.length)
        .select('name price salePrice images rating numReviews slug sku')
        .lean();
      
      products.push(...additionalProducts);
    }

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error('Get top products error:', error);
    next(new ErrorResponse('Error getting top products', 500));
  }
});

// @desc    Get products by category
// @route   GET /api/v1/products/category/:categoryId
// @access  Public
export const getProductsByCategory = asyncHandler(async (req, res, next) => {
  const { categoryId } = req.params;
  
  // Check if category exists
  const category = await Category.findById(categoryId);
  
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${categoryId}`, 404)
    );
  }

  const products = await Product.find({ category: categoryId })
    .populate('category', 'name slug')
    .populate('brand', 'name');

  res.status(200).json({
    success: true,
    count: products.length,
    data: products,
  });
});

// @desc    Update product stock
// @route   PUT /api/v1/products/:id/stock
// @access  Private/Admin
export const updateProductStock = asyncHandler(async (req, res, next) => {
  const { stock, operation } = req.body;
  
  if (!stock || isNaN(stock) || stock <= 0) {
    return next(
      new ErrorResponse('Please provide a valid stock number greater than 0', 400)
    );
  }

  const product = await Product.findById(req.params.id);
  
  if (!product) {
    return next(
      new ErrorResponse(`Product not found with id of ${req.params.id}`, 404)
    );
  }

  // Update stock based on operation
  if (operation === 'add') {
    product.stock += parseInt(stock);
  } else if (operation === 'subtract') {
    if (product.stock < stock) {
      return next(
        new ErrorResponse('Insufficient stock for this operation', 400)
      );
    }
    product.stock -= parseInt(stock);
  } else if (operation === 'set') {
    product.stock = parseInt(stock);
  } else {
    return next(
      new ErrorResponse('Invalid operation. Use add, subtract, or set', 400)
    );
  }

  await product.save();

  res.status(200).json({
    success: true,
    data: product,
  });
});
