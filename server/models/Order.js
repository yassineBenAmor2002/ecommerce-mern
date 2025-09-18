import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  qty: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
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
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  color: {
    name: String,
    code: String,
  },
  size: String,
});

const shippingAddressSchema = new mongoose.Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
});

const paymentResultSchema = new mongoose.Schema({
  id: { type: String },
  status: { 
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  payment_method: { type: String },
  payment_provider: { type: String, enum: ['stripe', 'paypal', 'bank_transfer', 'cash_on_delivery', 'other'] },
  amount_paid: { type: Number },
  currency: { type: String, default: 'USD' },
  transaction_id: { type: String },
  transaction_time: { type: Date },
  receipt_url: { type: String },
  update_time: { type: String },
  email_address: { type: String },
  billing_details: {
    name: { type: String },
    email: { type: String },
    phone: { type: String },
    address: {
      line1: { type: String },
      line2: { type: String },
      city: { type: String },
      postal_code: { type: String },
      country: { type: String }
    }
  },
  refunds: [{
    amount: { type: Number },
    reason: { type: String },
    status: { type: String },
    created: { type: Date, default: Date.now },
    receipt_number: { type: String }
  }]
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    orderItems: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      required: true,
      enum: ['stripe', 'paypal', 'bank_transfer', 'cash_on_delivery'],
    },
    paymentResult: paymentResultSchema,
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Tax price must be at least 0'],
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Shipping price must be at least 0'],
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
      min: [0, 'Total price must be at least 0'],
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    trackingNumber: {
      type: String,
    },
    trackingUrl: {
      type: String,
    },
    shippingProvider: {
      type: String,
    },
    shippingMethod: {
      type: String,
      enum: ['standard', 'express', 'overnight', 'pickup'],
      default: 'standard',
    },
    shippingStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'returned'],
      default: 'pending',
    },
    status: {
      type: String,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'failed'
      ],
      default: 'pending',
    },
    trackingNumber: String,
    trackingCompany: String,
    trackingUrl: String,
    notes: String,
    coupon: {
      code: String,
      discount: {
        type: Number,
        min: [0, 'Discount must be at least 0'],
        max: [100, 'Discount cannot be more than 100'],
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Calculate total price before saving
orderSchema.pre('save', async function (next) {
  // Calculate items price
  const itemsPrice = this.orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  // Calculate total price
  this.totalPrice = itemsPrice + this.taxPrice + this.shippingPrice;

  // If there's a coupon, apply discount
  if (this.coupon && this.coupon.discount) {
    const discountAmount = (this.totalPrice * this.coupon.discount) / 100;
    this.totalPrice -= discountAmount;
  }

  next();
});

// Update product stock when order is created
orderSchema.post('save', async function (doc) {
  if (doc.orderItems && doc.orderItems.length > 0) {
    const bulkOps = doc.orderItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product },
        update: { $inc: { stock: -item.qty } },
      },
    }));

    await mongoose.model('Product').bulkWrite(bulkOps);
  }
});

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'shippingAddress.country': 1 });

const Order = mongoose.model('Order', orderSchema);

export default Order;
