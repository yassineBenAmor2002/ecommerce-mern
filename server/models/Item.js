import mongoose from 'mongoose';

const ItemSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Item', ItemSchema);
