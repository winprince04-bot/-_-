import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'

import dbConnect from '@/db/dbConnect'
import SellerProduct from '@/db/models/sellerProduct'
import User from '@/db/models/user'
import { buildSellerProductSlug, getSellerProducts } from '@/lib/productCatalog'

type SellerProfileCheckResult = {
  userId: string
  sellerProfile?: {
    companyName?: string
  }
}

const requiredFields = [
  'userId',
  'name',
  'category',
  'subcategory',
  'origin',
  'capacity',
  'expiration',
  'dimensions',
  'originalPrice',
  'salePrice',
  'saleRate',
  'badge',
  'description',
] as const

const sanitizePathSegment = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')

const getStringField = (formData: FormData, key: (typeof requiredFields)[number] | 'saleEndsIn') =>
  String(formData.get(key) ?? '').trim()

const getFileExtension = (file: File) => {
  const typeExtension = file.type.split('/')[1]
  if (typeExtension) return typeExtension

  const nameParts = file.name.split('.')
  return nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'jpg'
}

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') ?? undefined
    const products = await getSellerProducts(userId)

    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error('SELLER_PRODUCTS_GET_ERROR', error)
    return NextResponse.json({ message: '판매자 상품을 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const missingField = requiredFields.find((field) => !getStringField(formData, field))
    if (missingField) {
      return NextResponse.json({ message: '상품 정보를 모두 입력해 주세요.' }, { status: 400 })
    }

    const file = formData.get('image')
    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json({ message: '상품 이미지를 등록해 주세요.' }, { status: 400 })
    }

    const userId = getStringField(formData, 'userId')
    const name = getStringField(formData, 'name')
    const category = getStringField(formData, 'category')
    const subcategory = getStringField(formData, 'subcategory')
    const origin = getStringField(formData, 'origin')
    const capacity = getStringField(formData, 'capacity')
    const expiration = getStringField(formData, 'expiration')
    const dimensions = getStringField(formData, 'dimensions')
    const originalPrice = getStringField(formData, 'originalPrice')
    const salePrice = getStringField(formData, 'salePrice')
    const saleRate = getStringField(formData, 'saleRate')
    const saleEndsIn = getStringField(formData, 'saleEndsIn')
    const badge = getStringField(formData, 'badge')
    const description = getStringField(formData, 'description')

    await dbConnect()

    const existingUser = (await User.findOne(
      { userId },
      { userId: 1, sellerProfile: 1 }
    ).lean()) as SellerProfileCheckResult | null

    if (!existingUser) {
      return NextResponse.json({ message: '판매자 회원을 찾을 수 없습니다.' }, { status: 404 })
    }

    if (!existingUser.sellerProfile?.companyName) {
      return NextResponse.json({ message: '먼저 판매자 정보를 등록해 주세요.' }, { status: 400 })
    }

    const fileExtension = getFileExtension(file)
    const blobPath = `seller-products/${sanitizePathSegment(userId)}/${Date.now()}-${sanitizePathSegment(name) || 'item'}.${fileExtension}`
    const uploadedImage = await put(blobPath, file, { access: 'public' })

    const createdProduct = await SellerProduct.create({
      sellerUserId: userId,
      slug: buildSellerProductSlug(userId, name),
      name,
      category,
      subcategory,
      origin,
      capacity,
      expiration,
      dimensions,
      originalPrice,
      salePrice,
      saleRate,
      saleEndsIn,
      badge,
      description,
      imageUrl: uploadedImage.url,
    })

    const [createdCatalogProduct] = await getSellerProducts(userId)
    const savedProduct =
      createdCatalogProduct?.slug === createdProduct.slug
        ? createdCatalogProduct
        : (await getSellerProducts()).find((product) => product.slug === createdProduct.slug)

    return NextResponse.json(
      {
        message: '판매 상품이 MongoDB에 저장되었습니다.',
        product: savedProduct,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('SELLER_PRODUCTS_POST_ERROR', error)
    return NextResponse.json({ message: '판매 상품 저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
