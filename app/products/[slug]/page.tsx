import { notFound } from 'next/navigation'

import ProductDetailClient from './ProductDetailClient'

import { getProductBySlug, getRecommendedProducts } from '@/lib/productCatalog'

type Props = {
  params: {
    slug: string
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const recommendedProducts = await getRecommendedProducts(product)

  return <ProductDetailClient product={product} recommendedProducts={recommendedProducts} />
}
