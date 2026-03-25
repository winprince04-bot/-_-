import mongoose from 'mongoose'

const SellerProductSchema = new mongoose.Schema(
  {
    sellerUserId: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, required: true, trim: true },
    origin: { type: String, required: true, trim: true },
    capacity: { type: String, required: true, trim: true },
    expiration: { type: String, required: true, trim: true },
    dimensions: { type: String, required: true, trim: true },
    originalPrice: { type: String, required: true, trim: true },
    salePrice: { type: String, required: true, trim: true },
    saleRate: { type: String, required: true, trim: true },
    saleEndsIn: { type: String, default: '' },
    clickCount: { type: Number, default: 0 },
    badge: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true, trim: true },
  },
  {
    timestamps: true,
    collection: 'seller_product',
  }
)

const SellerProduct = mongoose.models.SellerProduct || mongoose.model('SellerProduct', SellerProductSchema)

export default SellerProduct
