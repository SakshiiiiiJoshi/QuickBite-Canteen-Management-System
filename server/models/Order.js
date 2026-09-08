const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Food',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema(
  {
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    tableNumber: {
      type: Number,
      required: [true, 'Table number is required'],
      min: 1,
    },
    status: {
      type: String,
      enum: ['Placed', 'Preparing', 'Ready', 'Delivered'],
      default: 'Placed',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Paid'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Order', orderSchema);
