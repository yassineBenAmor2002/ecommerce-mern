import { TAX_RATE, SHIPPING_RATE } from '../config/constants.js';

/**
 * Calculate cart totals including subtotal, tax, shipping, and total
 * @param {Object} cart - The cart document
 * @returns {Promise<Object>} - Updated cart with calculated totals
 */
export const calculateCartTotals = async (cart) => {
  try {
    // Calculate subtotal (sum of all items' price * quantity)
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.price * item.qty;
    }, 0);

    // Calculate tax (default to 0 if no tax)
    const tax = TAX_RATE ? subtotal * (TAX_RATE / 100) : 0;

    // Calculate shipping (default to 0 if no shipping rate or free shipping)
    let shipping = 0;
    if (SHIPPING_RATE && subtotal > 0) {
      // Check if cart qualifies for free shipping (example: orders over $50)
      const FREE_SHIPPING_THRESHOLD = 50; // Example threshold
      if (subtotal < FREE_SHIPPING_THRESHOLD) {
        shipping = SHIPPING_RATE;
      }
    }

    // Calculate total
    let total = subtotal + tax + shipping;

    // Apply coupon discount if exists and valid
    let discountAmount = 0;
    if (cart.coupon && cart.coupon.code) {
      // In a real app, validate coupon against database
      // This is a simplified example
      const coupon = cart.coupon;
      
      // Check if coupon meets minimum purchase requirement
      if (coupon.minPurchase && subtotal < coupon.minPurchase) {
        // Remove invalid coupon
        cart.coupon = undefined;
      } else {
        // Calculate discount amount
        discountAmount = (subtotal * coupon.discount) / 100;
        
        // Apply maximum discount if set
        if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
          discountAmount = coupon.maxDiscount;
        }
        
        // Update total with discount
        total -= discountAmount;
        
        // Add discount amount to coupon object
        cart.coupon.discountAmount = discountAmount;
      }
    }

    // Update cart with calculated values
    cart.subtotal = subtotal;
    cart.tax = tax;
    cart.shipping = shipping;
    cart.total = Math.max(0, total); // Ensure total is not negative

    return cart;
  } catch (error) {
    console.error('Error calculating cart totals:', error);
    throw error;
  }
};

/**
 * Validate cart items (check stock, prices, etc.)
 * @param {Array} items - Array of cart items
 * @returns {Promise<{valid: boolean, errors: Array, updatedItems: Array}>}
 */
export const validateCartItems = async (items) => {
  const errors = [];
  const updatedItems = [];
  let valid = true;

  for (const item of items) {
    try {
      const product = await Product.findById(item.product).select('price salePrice countInStock');
      
      if (!product) {
        errors.push(`Product ${item.product} not found`);
        valid = false;
        continue;
      }

      // Check if product is in stock
      if (product.countInStock <= 0) {
        errors.push(`Product ${item.name} is out of stock`);
        valid = false;
        continue;
      }

      // Check if requested quantity is available
      if (item.qty > product.countInStock) {
        errors.push(
          `Only ${product.countInStock} items available for ${item.name}`
        );
        item.qty = product.countInStock; // Update to max available
        valid = false;
      }

      // Check if price has changed
      const currentPrice = product.salePrice || product.price;
      if (currentPrice !== item.price) {
        errors.push(
          `Price for ${item.name} has changed from $${item.price} to $${currentPrice}`
        );
        item.price = currentPrice; // Update to current price
        valid = false;
      }

      updatedItems.push(item);
    } catch (error) {
      console.error(`Error validating cart item ${item.product}:`, error);
      errors.push(`Error validating ${item.name}`);
      valid = false;
    }
  }

  return { valid, errors, updatedItems };
};

/**
 * Format cart for response
 * @param {Object} cart - The cart document
 * @returns {Object} - Formatted cart response
 */
export const formatCartResponse = (cart) => {
  if (!cart) return null;

  const formattedCart = cart.toObject();
  
  // Format items
  formattedCart.items = formattedCart.items || [];
  
  // Format coupon
  if (formattedCart.coupon) {
    formattedCart.coupon = {
      code: formattedCart.coupon.code,
      discount: formattedCart.coupon.discount,
      discountAmount: formattedCart.coupon.discountAmount || 0,
    };
  }

  // Add summary
  formattedCart.summary = {
    itemsCount: formattedCart.items.reduce((sum, item) => sum + item.qty, 0),
    subtotal: formattedCart.subtotal || 0,
    tax: formattedCart.tax || 0,
    shipping: formattedCart.shipping || 0,
    discount: formattedCart.coupon?.discountAmount || 0,
    total: formattedCart.total || 0,
    currency: 'USD',
  };

  return formattedCart;
};

/**
 * Merge guest cart with user cart
 * @param {Object} userCart - The user's existing cart
 * @param {Array} guestItems - Items from guest cart
 * @returns {Promise<Object>} - Updated cart with merged items
 */
export const mergeCarts = async (userCart, guestItems) => {
  if (!userCart) {
    // If user doesn't have a cart, create one with guest items
    return await Cart.create({
      user: userCart.user,
      items: guestItems,
    });
  }

  // Merge guest items with user's existing items
  for (const guestItem of guestItems) {
    const existingItemIndex = userCart.items.findIndex(
      (item) =>
        item.product.toString() === guestItem.product.toString() &&
        item.color?.code === guestItem.color?.code &&
        item.size === guestItem.size
    );

    if (existingItemIndex > -1) {
      // Update quantity if item already exists
      userCart.items[existingItemIndex].qty += guestItem.qty;
    } else {
      // Add new item to cart
      userCart.items.push(guestItem);
    }
  }

  // Recalculate totals
  await calculateCartTotals(userCart);
  await userCart.save();

  return userCart;
};
