import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Please add a title for the review'],
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, 'Please add some text'],
      maxlength: [1000, 'Review cannot be more than 1000 characters'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: [true, 'Please add a rating between 1 and 5'],
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        url: String,
        alt: String,
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    dislikes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],
    verifiedPurchase: {
      type: Boolean,
      default: false,
    },
    helpfulCount: {
      type: Number,
      default: 0,
    },
    response: {
      text: String,
      date: Date,
      admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Prevent user from submitting more than one review per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static method to get average rating of reviews for a product
reviewSchema.statics.getAverageRating = async function (productId) {
  const obj = await this.aggregate([
    {
      $match: { product: productId, isApproved: true },
    },
    {
      $group: {
        _id: '$product',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  try {
    await this.model('Product').findByIdAndUpdate(productId, {
      rating: obj[0] ? obj[0].averageRating : 0,
      numReviews: obj[0] ? obj[0].reviewCount : 0,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.product);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.product);
});

// Add a method to check if user has already liked or disliked the review
reviewSchema.methods.hasLiked = function (userId) {
  return this.likes.some(
    (like) => like.user && like.user.toString() === userId.toString()
  );
};

reviewSchema.methods.hasDisliked = function (userId) {
  return this.dislikes.some(
    (dislike) =>
      dislike.user && dislike.user.toString() === userId.toString()
  );
};

// Add a method to toggle like/dislike
reviewSchema.methods.toggleLike = function (userId) {
  const hasLiked = this.hasLiked(userId);
  const hasDisliked = this.hasDisliked(userId);

  if (hasLiked) {
    // If already liked, remove like
    this.likes = this.likes.filter(
      (like) => like.user.toString() !== userId.toString()
    );
  } else {
    // Add like
    this.likes.push({ user: userId });
    
    // If was disliked, remove dislike
    if (hasDisliked) {
      this.dislikes = this.dislikes.filter(
        (dislike) => dislike.user.toString() !== userId.toString()
      );
    }
  }

  // Update helpful count
  this.helpfulCount = this.likes.length - this.dislikes.length;
  return this.save();
};

reviewSchema.methods.toggleDislike = function (userId) {
  const hasLiked = this.hasLiked(userId);
  const hasDisliked = this.hasDisliked(userId);

  if (hasDisliked) {
    // If already disliked, remove dislike
    this.dislikes = this.dislikes.filter(
      (dislike) => dislike.user.toString() !== userId.toString()
    );
  } else {
    // Add dislike
    this.dislikes.push({ user: userId });
    
    // If was liked, remove like
    if (hasLiked) {
      this.likes = this.likes.filter(
        (like) => like.user.toString() !== userId.toString()
      );
    }
  }

  // Update helpful count
  this.helpfulCount = this.likes.length - this.dislikes.length;
  return this.save();
};

// Add a method to check if review is helpful
reviewSchema.methods.markHelpful = function (userId) {
  if (!this.helpfulVotes) {
    this.helpfulVotes = [];
  }

  const existingVoteIndex = this.helpfulVotes.findIndex(
    (vote) => vote.user.toString() === userId.toString()
  );

  if (existingVoteIndex > -1) {
    // Toggle helpful vote
    this.helpfulVotes.splice(existingVoteIndex, 1);
  } else {
    // Add helpful vote
    this.helpfulVotes.push({ user: userId });
  }

  this.helpfulCount = this.helpfulVotes.length;
  return this.save();
};

// Add a method to add a response to a review
reviewSchema.methods.addResponse = function (text, adminId) {
  this.response = {
    text,
    admin: adminId,
    date: Date.now(),
  };
  return this.save();
};

// Indexes for better query performance
reviewSchema.index({ product: 1, isApproved: 1 });
reviewSchema.index({ user: 1 });
reviewSchema.index({ rating: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
