import mongoose from 'mongoose'

const PaymentMethodSchema = new mongoose.Schema(
  {
    bank: { type: String, default: '' },
    cardNumber: { type: String, default: '' },
    expiry: { type: String, default: '' },
    cvc: { type: String, default: '' },
    address: { type: String, default: '' },
  },
  { _id: false }
)

const SellerProfileSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: '' },
    companyAddress: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false }
)

const UserSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    paymentMethod: { type: PaymentMethodSchema, default: () => ({}) },
    sellerProfile: { type: SellerProfileSchema, default: () => ({}) },
    profile_image_url: { type: String, default: '' },
    user_type: { type: String, default: 'user' },
  },
  {
    timestamps: true,
    collection: 'user',
  }
)

const User = mongoose.models.User || mongoose.model('User', UserSchema)

export default User
