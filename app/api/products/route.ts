import { NextResponse } from 'next/server'

import { getSellerProducts } from '@/lib/productCatalog'

export async function GET() {
  try {
    const products = await getSellerProducts()
    return NextResponse.json({ products }, { status: 200 })
  } catch (error) {
    console.error('PRODUCTS_API_ERROR', error)
    return NextResponse.json({ message: '상품을 불러오는 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
