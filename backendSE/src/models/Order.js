const mongoose = require('mongoose');
const { Schema } = mongoose;

const OrderItemSchema = new Schema({
  supplement: { type: Schema.Types.ObjectId, ref: 'Supplement', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true, min: 1 },
  unitPriceCents: { type: Number, required: true },
  totalPriceCents: { type: Number, required: true }
}, { _id: true });

const AddressSchema = new Schema({
  fullName: String,
  street: String,
  city: String,
  state: String,
  postalCode: String,
  country: String,
  phone: String
}, { _id: false });

const OrderSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: { type: [OrderItemSchema], required: true },
  subtotalCents: { type: Number, required: true },
  shippingCents: { type: Number, default: 0 },
  taxCents: { type: Number, default: 0 },
  totalCents: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  paymentIntentId: { type: String }, // Stripe payment intent id
  paymentStatus: { type: String, enum: ['pending','paid','failed','refunded'], default: 'pending' },
  status: { type: String, enum: ['created','processing','shipped','delivered','cancelled'], default: 'created' },
  shippingAddress: { type: AddressSchema, required: true },
  billingAddress: { type: AddressSchema },
  meta: { type: Schema.Types.Mixed }
}, { timestamps: true });

OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ paymentIntentId: 1 });

module.exports = mongoose.model('Order', OrderSchema);
