import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a product name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    slug: String,
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Please add a price'],
      min: [0, 'Price must be at least 0'],
    },
    salePrice: {
      type: Number,
      min: [0, 'Sale price must be at least 0'],
    },
    cost: {
      type: Number,
      min: [0, 'Cost must be at least 0'],
    },
    sku: {
      type: String,
      required: true,
      unique: true,
    },
    stock: {
      type: Number,
      required: [true, 'Please add a quantity in stock'],
      min: [0, 'Stock cannot be less than 0'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please add a category'],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subcategory',
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    images: [
      {
        url: String,
        alt: String,
        isMain: { type: Boolean, default: false },
      },
    ],
    specifications: [
      {
        name: String,
        value: String,
      },
    ],
    colors: [
      {
        name: String,
        code: String,
        stock: Number,
      },
    ],
    sizes: [
      {
        name: String,
        stock: Number,
      },
    ],
    rating: {
      type: Number,
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5'],
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    weight: {
      type: Number,
      min: [0, 'Weight must be at least 0'],
    },
    dimensions: {
      length: { type: Number, min: 0 },
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
    },
    tags: [String],
    relatedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create product slug from the name
productSchema.pre('save', function (next) {
  this.slug = this.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove non-word [a-zA-Z0-9_], non-whitespace, non-hyphen characters
    .replace(/[\s-]+/g, '-') // swap any length of whitespace, underscore, hyphen characters with a single -
    .replace(/^-+|-+$/g, ''); // remove leading, trailing -
  next();
});

// Cascade delete reviews when a product is deleted
productSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ product: this._id });
  next();
});

// Reverse populate with virtuals
productSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false,
});

// Static method to get average rating
productSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
      },
    },
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      rating: obj[0] ? obj[0].averageRating : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
productSchema.post('save', function () {
  this.constructor.getAverageRating(this._id);
});

// Call getAverageRating before remove
productSchema.post('remove', function () {
  this.constructor.getAverageRating(this._id);
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ price: 1 });
productSchema.index({ category: 1 });
productSchema.index({ brand: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
