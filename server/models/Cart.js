import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: [0, 'Price must be at least 0'],
  },
  countInStock: {
    type: Number,
    required: true,
    min: [0, 'Stock count must be at least 0'],
  },
  qty: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    max: [100, 'Quantity cannot be more than 100'],
  },
  color: {
    name: String,
    code: String,
  },
  size: String,
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
    coupon: {
      code: String,
      discount: {
        type: Number,
        min: [0, 'Discount must be at least 0'],
        max: [100, 'Discount cannot be more than 100'],
      },
      minPurchase: Number,
      maxDiscount: Number,
      expiryDate: Date,
    },
    shippingAddress: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Address',
    },
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'bank_transfer', 'cash_on_delivery'],
    },
    taxPrice: {
      type: Number,
      default: 0.0,
      min: [0, 'Tax price must be at least 0'],
    },
    shippingPrice: {
      type: Number,
      default: 0.0,
      min: [0, 'Shipping price must be at least 0'],
    },
    totalPrice: {
      type: Number,
      default: 0.0,
      min: [0, 'Total price must be at least 0'],
    },
    priceBeforeDiscount: {
      type: Number,
      default: 0.0,
      min: [0, 'Price before discount must be at least 0'],
    },
    discount: {
      type: Number,
      default: 0.0,
      min: [0, 'Discount must be at least 0'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate cart totals before saving
cartSchema.pre('save', function (next) {
  if (this.isModified('items') || this.isModified('coupon') || this.isNew) {
    // Calculate items total
    const itemsPrice = this.items.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    // Calculate price before discount
    this.priceBeforeDiscount = itemsPrice + this.shippingPrice + this.taxPrice;
    
    // Apply coupon discount if valid
    let discountAmount = 0;
    if (
      this.coupon && 
      this.coupon.discount && 
      (!this.coupon.minPurchase || this.priceBeforeDiscount >= this.coupon.minPurchase) &&
      (!this.coupon.expiryDate || new Date() < new Date(this.coupon.expiryDate))
    ) {
      discountAmount = (this.priceBeforeDiscount * this.coupon.discount) / 100;
      
      // Apply maximum discount if set
      if (this.coupon.maxDiscount && discountAmount > this.coupon.maxDiscount) {
        discountAmount = this.coupon.maxDiscount;
      }
    }
    
    this.discount = discountAmount;
    this.totalPrice = this.priceBeforeDiscount - this.discount;
  }
  
  next();
});

// Add a method to get cart summary
cartSchema.methods.getCartSummary = function () {
  const summary = {
    itemsCount: this.items.reduce((acc, item) => acc + item.qty, 0),
    itemsQty: this.items.length,
    itemsPrice: this.items.reduce((acc, item) => acc + item.price * item.qty, 0),
    taxPrice: this.taxPrice,
    shippingPrice: this.shippingPrice,
    priceBeforeDiscount: this.priceBeforeDiscount,
    discount: this.discount,
    totalPrice: this.totalPrice,
    currency: 'USD', // You can make this dynamic based on user's location
  };

  return summary;
};

// Add a method to check if a product exists in the cart
cartSchema.methods.itemExists = function (productId, color, size) {
  return this.items.findIndex(
    (item) =>
      item.product.toString() === productId.toString() &&
      item.color?.code === color?.code &&
      item.size === size
  );
};

// Add a method to add an item to the cart
cartSchema.methods.addItem = function (item) {
  const itemIndex = this.itemExists(item.product, item.color, item.size);
  
  if (itemIndex > -1) {
    // Item exists, update quantity
    this.items[itemIndex].qty += item.qty;
    
    // Ensure quantity doesn't exceed available stock
    if (this.items[itemIndex].qty > this.items[itemIndex].countInStock) {
      this.items[itemIndex].qty = this.items[itemIndex].countInStock;
      throw new Error('Requested quantity exceeds available stock');
    }
  } else {
    // Add new item to cart
    this.items.push(item);
  }
  
  return this;
};

// Add a method to remove an item from the cart
cartSchema.methods.removeItem = function (itemId) {
  const itemIndex = this.items.findIndex(
    (item) => item._id.toString() === itemId.toString()
  );
  
  if (itemIndex > -1) {
    this.items.splice(itemIndex, 1);
    return true;
  }
  
  return false;
};

// Add a method to update item quantity
cartSchema.methods.updateItemQuantity = function (itemId, newQty) {
  const itemIndex = this.items.findIndex(
    (item) => item._id.toString() === itemId.toString()
  );
  
  if (itemIndex > -1) {
    if (newQty <= 0) {
      return this.removeItem(itemId);
    }
    
    if (newQty > this.items[itemIndex].countInStock) {
      throw new Error('Requested quantity exceeds available stock');
    }
    
    this.items[itemIndex].qty = newQty;
    return true;
  }
  
  return false;
};

// Add a method to clear the cart
cartSchema.methods.clearCart = function () {
  this.items = [];
  this.coupon = undefined;
  this.shippingAddress = undefined;
  this.paymentMethod = undefined;
  this.taxPrice = 0;
  this.shippingPrice = 0;
  this.totalPrice = 0;
  this.priceBeforeDiscount = 0;
  this.discount = 0;
  return this;
};

// Indexes for better query performance
cartSchema.index({ user: 1 }, { unique: true });
cartSchema.index({ 'items.product': 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;
