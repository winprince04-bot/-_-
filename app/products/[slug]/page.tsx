import { notFound } from 'next/navigation'

import ProductDetailClient from './ProductDetailClient'

import { findProductBySlug, getRecommendedProducts } from '@/data/products'

type Props = {
  params: {
    slug: string
  }
}

export default function ProductDetailPage({ params }: Props) {
  const product = findProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const recommendedProducts = getRecommendedProducts(product)

  return <ProductDetailClient product={product} recommendedProducts={recommendedProducts} />
}
