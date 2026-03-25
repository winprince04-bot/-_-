import dbConnect from '@/db/dbConnect'
import SellerProduct from '@/db/models/sellerProduct'
import User from '@/db/models/user'
import { products as staticProducts, type Product, type ProductImage } from '@/data/products'

type SellerProfile = {
  companyName: string
  companyAddress: string
  contactNumber: string
  description: string
}

type SellerProductDocument = {
  sellerUserId: string
  slug: string
  name: string
  category: Product['category']
  subcategory: string
  origin: string
  capacity: string
  expiration: string
  dimensions: string
  originalPrice: string
  salePrice: string
  saleRate: string
  saleEndsIn?: string
  clickCount?: number
  badge: string
  description: string
  imageUrl: string
}

type UserDocument = {
  userId: string
  sellerProfile?: SellerProfile
}

const imagePalettes = [
  ['#8d6e63', '#c8a27a', '#f2dec6'],
  ['#6c8aa3', '#9cbad1', '#dfeaf3'],
  ['#d08ca1', '#f0b7c8', '#f9dde6'],
  ['#7ea17f', '#aaceaa', '#e1efe0'],
  ['#a26b44', '#d39a65', '#f3ddc5'],
  ['#67516b', '#967aa4', '#e2d8e7'],
]

const buildImages = (slug: string, seed: string, imageUrl?: string): ProductImage[] => {
  if (imageUrl) {
    return [
      {
        id: `${slug}-1`,
        label: '대표 이미지',
        accent: '#d6b17a',
        background: `linear-gradient(135deg, rgba(36, 31, 26, 0.16), rgba(36, 31, 26, 0.04)), url(${imageUrl})`,
        src: imageUrl,
      },
      {
        id: `${slug}-2`,
        label: '상세 이미지',
        accent: '#c49b70',
        background: `linear-gradient(135deg, rgba(36, 31, 26, 0.16), rgba(36, 31, 26, 0.04)), url(${imageUrl})`,
        src: imageUrl,
      },
      {
        id: `${slug}-3`,
        label: '연출 컷',
        accent: '#9f7b4d',
        background: `linear-gradient(135deg, rgba(36, 31, 26, 0.16), rgba(36, 31, 26, 0.04)), url(${imageUrl})`,
        src: imageUrl,
      },
    ]
  }

  const palette =
    imagePalettes[
      Math.abs(seed.split('').reduce((total, char) => total + char.charCodeAt(0), 0)) % imagePalettes.length
    ]

  return [
    {
      id: `${slug}-1`,
      label: '대표 이미지',
      accent: palette[0],
      background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})`,
    },
    {
      id: `${slug}-2`,
      label: '상세 이미지',
      accent: palette[1],
      background: `linear-gradient(135deg, ${palette[1]}, ${palette[2]})`,
    },
    {
      id: `${slug}-3`,
      label: '연출 컷',
      accent: palette[2],
      background: `linear-gradient(135deg, ${palette[2]}, ${palette[0]})`,
    },
  ]
}

const toCatalogProduct = (product: SellerProductDocument, sellerProfile?: SellerProfile): Product => ({
  slug: product.slug,
  name: product.name,
  category: product.category,
  subcategory: product.subcategory,
  origin: product.origin,
  capacity: product.capacity,
  expiration: product.expiration,
  dimensions: product.dimensions,
  originalPrice: product.originalPrice,
  salePrice: product.salePrice,
  saleRate: product.saleRate,
  saleEndsIn: product.saleEndsIn || undefined,
  clickCount: product.clickCount ?? 0,
  badge: product.badge,
  description: product.description,
  images: buildImages(product.slug, `${product.name}-${product.sellerUserId}`, product.imageUrl),
  isSellerProduct: true,
  sellerUserId: product.sellerUserId,
  imageUrl: product.imageUrl,
  sellerProfile: sellerProfile ?? null,
})

export const buildSellerProductSlug = (userId: string, productName: string) => {
  const normalizedName = productName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')

  const fallbackName = normalizedName || 'item'
  return `${userId}-${fallbackName}-${Date.now().toString(36)}`
}

export async function getSellerProducts(userId?: string): Promise<Product[]> {
  try {
    await dbConnect()
  } catch (error) {
    console.error('GET_SELLER_PRODUCTS_DB_ERROR', error)
    return []
  }

  const query = userId ? { sellerUserId: userId } : {}
  const sellerProducts = (await SellerProduct.find(query)
    .sort({ createdAt: -1 })
    .lean()) as unknown as SellerProductDocument[]

  if (!sellerProducts.length) {
    return []
  }

  const sellerIds = Array.from(new Set(sellerProducts.map((product) => product.sellerUserId)))
  const sellerUsers = (await User.find(
    { userId: { $in: sellerIds } },
    { userId: 1, sellerProfile: 1, _id: 0 }
  ).lean()) as unknown as UserDocument[]
  const sellerProfileMap = new Map(sellerUsers.map((user) => [user.userId, user.sellerProfile]))

  return sellerProducts.map((product) => toCatalogProduct(product, sellerProfileMap.get(product.sellerUserId)))
}

export async function getAllProducts(): Promise<Product[]> {
  const sellerProducts = await getSellerProducts()
  return [...sellerProducts, ...staticProducts]
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const allProducts = await getAllProducts()
  return allProducts.find((product) => product.slug === slug)
}

export async function getRecommendedProducts(product: Product): Promise<Product[]> {
  const allProducts = await getAllProducts()

  const sameSubcategory = allProducts.filter(
    (candidate) => candidate.slug !== product.slug && candidate.subcategory === product.subcategory
  )

  if (sameSubcategory.length >= 4) {
    return sameSubcategory.slice(0, 4)
  }

  const sameCategory = allProducts.filter(
    (candidate) => candidate.slug !== product.slug && candidate.category === product.category
  )

  return [...sameSubcategory, ...sameCategory.filter((candidate) => !sameSubcategory.includes(candidate))].slice(0, 4)
}
