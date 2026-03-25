'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'

import HeaderActions from '@/components/HeaderActions'
import { categories, type CategoryKey, type Product, type ProductImage } from '@/data/products'
import { useSession } from '@/components/SessionProvider'

const initialSellerForm = {
  companyName: '',
  companyAddress: '',
  contactNumber: '',
  description: '',
}

const initialProductForm = {
  name: '',
  category: categories[0]?.key ?? ('의류' as CategoryKey),
  subcategory: categories[0]?.items[0] ?? '',
  origin: '',
  capacity: '',
  expiration: '',
  dimensions: '',
  originalPrice: '',
  salePrice: '',
  saleRate: '',
  saleEndsIn: '',
  badge: '',
  description: '',
}

const getImageCardStyle = (image?: ProductImage) =>
  image?.src
    ? {
        backgroundImage: `linear-gradient(135deg, rgba(36, 31, 26, 0.12), rgba(36, 31, 26, 0.05)), url(${image.src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
    : { background: image?.background ?? 'linear-gradient(135deg, #8d6e63, #c8a27a)' }

export default function SellerPage() {
  const { currentUser, sellerProfile, saveSellerProfile } = useSession()
  const [showSellerForm, setShowSellerForm] = useState(!sellerProfile)
  const [showProductForm, setShowProductForm] = useState(true)
  const [isSavingSeller, setIsSavingSeller] = useState(false)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [sellerMessage, setSellerMessage] = useState('')
  const [productMessage, setProductMessage] = useState('')
  const [registeredProducts, setRegisteredProducts] = useState<Product[]>([])
  const [sellerForm, setSellerForm] = useState({
    companyName: sellerProfile?.companyName ?? initialSellerForm.companyName,
    companyAddress: sellerProfile?.companyAddress ?? initialSellerForm.companyAddress,
    contactNumber: sellerProfile?.contactNumber ?? initialSellerForm.contactNumber,
    description: sellerProfile?.description ?? initialSellerForm.description,
  })
  const [productForm, setProductForm] = useState(initialProductForm)
  const [productImageFile, setProductImageFile] = useState<File | null>(null)
  const [productImagePreview, setProductImagePreview] = useState('')

  const currentCategory = useMemo(
    () => categories.find((category) => category.key === productForm.category) ?? categories[0],
    [productForm.category]
  )

  useEffect(() => {
    if (!sellerProfile) return

    setSellerForm({
      companyName: sellerProfile.companyName,
      companyAddress: sellerProfile.companyAddress,
      contactNumber: sellerProfile.contactNumber,
      description: sellerProfile.description,
    })
  }, [sellerProfile])

  useEffect(() => {
    if (!currentUser) return

    const loadRegisteredProducts = async () => {
      try {
        const response = await fetch(`/api/seller/products?userId=${encodeURIComponent(currentUser.userId)}`)
        const data = await response.json()

        if (response.ok) {
          setRegisteredProducts(data.products ?? [])
        }
      } catch {
        setProductMessage('등록한 상품을 불러오지 못했습니다.')
      }
    }

    loadRegisteredProducts()
  }, [currentUser])

  useEffect(() => {
    return () => {
      if (productImagePreview) {
        URL.revokeObjectURL(productImagePreview)
      }
    }
  }, [productImagePreview])

  const resetProductForm = (nextCategory: CategoryKey) => {
    setProductForm({
      ...initialProductForm,
      category: nextCategory,
      subcategory: categories.find((category) => category.key === nextCategory)?.items[0] ?? '',
    })
    if (productImagePreview) {
      URL.revokeObjectURL(productImagePreview)
    }
    setProductImagePreview('')
    setProductImageFile(null)
  }

  const handleSellerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!sellerForm.companyName.trim() || !sellerForm.companyAddress.trim() || !sellerForm.contactNumber.trim()) {
      setSellerMessage('회사명, 주소, 문의 번호를 모두 입력해 주세요.')
      return
    }

    if (!currentUser) {
      setSellerMessage('로그인 후 판매자 정보를 저장할 수 있습니다.')
      return
    }

    setIsSavingSeller(true)
    setSellerMessage('')

    try {
      const response = await fetch('/api/seller/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          companyName: sellerForm.companyName.trim(),
          companyAddress: sellerForm.companyAddress.trim(),
          contactNumber: sellerForm.contactNumber.trim(),
          description: sellerForm.description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSellerMessage(data.message ?? '판매자 정보 저장에 실패했습니다.')
        return
      }

      saveSellerProfile({
        companyName: data.sellerProfile?.companyName ?? sellerForm.companyName.trim(),
        companyAddress: data.sellerProfile?.companyAddress ?? sellerForm.companyAddress.trim(),
        contactNumber: data.sellerProfile?.contactNumber ?? sellerForm.contactNumber.trim(),
        description: data.sellerProfile?.description ?? sellerForm.description.trim(),
      })

      setSellerMessage(data.message ?? '판매자 정보가 저장되었습니다.')
      setShowSellerForm(false)
    } catch {
      setSellerMessage('판매자 정보를 저장하는 중 오류가 발생했습니다.')
    } finally {
      setIsSavingSeller(false)
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    setProductImageFile(file)

    if (productImagePreview) {
      URL.revokeObjectURL(productImagePreview)
    }

    if (file) {
      setProductImagePreview(URL.createObjectURL(file))
      setProductMessage('')
      return
    }

    setProductImagePreview('')
  }

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!currentUser) {
      setProductMessage('로그인 후 판매 상품을 등록할 수 있습니다.')
      return
    }

    if (!sellerProfile?.companyName) {
      setProductMessage('먼저 판매자 정보를 등록해 주세요.')
      return
    }

    if (!productImageFile) {
      setProductMessage('메인과 상세에 보여줄 상품 사진을 선택해 주세요.')
      return
    }

    const requiredValues = [
      productForm.name,
      productForm.category,
      productForm.subcategory,
      productForm.origin,
      productForm.capacity,
      productForm.expiration,
      productForm.dimensions,
      productForm.originalPrice,
      productForm.salePrice,
      productForm.saleRate,
      productForm.badge,
      productForm.description,
    ]

    if (requiredValues.some((value) => !value.trim())) {
      setProductMessage('상품 상세페이지에 필요한 정보를 모두 입력해 주세요.')
      return
    }

    setIsSavingProduct(true)
    setProductMessage('')

    try {
      const formData = new FormData()
      formData.append('userId', currentUser.userId)
      formData.append('name', productForm.name.trim())
      formData.append('category', productForm.category.trim())
      formData.append('subcategory', productForm.subcategory.trim())
      formData.append('origin', productForm.origin.trim())
      formData.append('capacity', productForm.capacity.trim())
      formData.append('expiration', productForm.expiration.trim())
      formData.append('dimensions', productForm.dimensions.trim())
      formData.append('originalPrice', productForm.originalPrice.trim())
      formData.append('salePrice', productForm.salePrice.trim())
      formData.append('saleRate', productForm.saleRate.trim())
      formData.append('saleEndsIn', productForm.saleEndsIn.trim())
      formData.append('badge', productForm.badge.trim())
      formData.append('description', productForm.description.trim())
      formData.append('image', productImageFile)

      const response = await fetch('/api/seller/products', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setProductMessage(data.message ?? '판매 상품 저장에 실패했습니다.')
        return
      }

      if (data.product) {
        setRegisteredProducts((current) => [data.product, ...current])
      }

      setProductMessage(data.message ?? '판매 상품이 저장되었습니다.')
      resetProductForm(productForm.category)
      setShowProductForm(false)
    } catch {
      setProductMessage('판매 상품을 저장하는 중 오류가 발생했습니다.')
    } finally {
      setIsSavingProduct(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-8 text-[#241f1a] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <HeaderActions />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b08a60]">Seller Zone</p>
            <h1 className="mt-3 text-4xl font-black text-[#241f1a]">판매자 관리</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#6f5d4b]">
              먼저 판매자 프로필을 저장하고, 상품 사진과 상세 정보를 등록하면 메인과 상세페이지에 바로 노출됩니다.
            </p>
          </div>

          <Link
            href="/"
            className="w-fit rounded-full border border-[#ddcfbf] bg-white/80 px-5 py-3 text-sm font-semibold text-[#75583c] transition hover:bg-white"
          >
            메인으로 돌아가기
          </Link>
        </div>

        <section className="rounded-[2rem] border border-[#e1d3c2] bg-[linear-gradient(180deg,_rgba(255,253,250,0.98),_rgba(245,238,229,0.94))] p-6 shadow-[0_28px_70px_rgba(72,54,29,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">Seller Profile</p>
              <h2 className="mt-3 text-3xl font-black text-[#241f1a]">판매자 정보 등록</h2>
              <p className="mt-3 text-sm leading-7 text-[#6f5d4b]">
                상품 상세 하단에 노출될 회사명, 주소, 문의번호, 소개글을 저장합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSellerForm((current) => !current)}
              className="rounded-full bg-[#2f241d] px-5 py-3 text-sm font-bold text-[#f8f1e7] transition hover:bg-[#47362b]"
            >
              {showSellerForm ? '폼 닫기' : '폼 열기'}
            </button>
          </div>

          {showSellerForm && (
            <form onSubmit={handleSellerSubmit} className="mt-6 grid gap-4 rounded-[1.6rem] bg-white/75 p-5">
              <input
                value={sellerForm.companyName}
                onChange={(event) => setSellerForm((current) => ({ ...current, companyName: event.target.value }))}
                placeholder="회사명"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />
              <input
                value={sellerForm.companyAddress}
                onChange={(event) => setSellerForm((current) => ({ ...current, companyAddress: event.target.value }))}
                placeholder="회사 주소"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />
              <input
                value={sellerForm.contactNumber}
                onChange={(event) => setSellerForm((current) => ({ ...current, contactNumber: event.target.value }))}
                placeholder="문의 번호"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />
              <textarea
                rows={4}
                value={sellerForm.description}
                onChange={(event) => setSellerForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="회사 소개 또는 판매 안내"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />
              <button
                type="submit"
                disabled={isSavingSeller}
                className="w-full rounded-[1rem] bg-[#2f241d] px-5 py-4 text-base font-bold text-[#f8f1e7] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingSeller ? '저장 중...' : '판매자 정보 저장'}
              </button>
            </form>
          )}

          {sellerMessage && <p className="mt-4 text-sm font-medium text-[#8a6238]">{sellerMessage}</p>}

          {sellerProfile && (
            <div className="mt-6 rounded-[1.6rem] border border-[#eadfce] bg-[#fffaf4] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">Saved Seller</p>
              <h3 className="mt-3 text-2xl font-black text-[#241f1a]">{sellerProfile.companyName}</h3>
              <div className="mt-4 grid gap-3 text-sm text-[#5f4d3d] sm:grid-cols-2">
                <div className="rounded-[1rem] bg-white px-4 py-3">회사 주소: {sellerProfile.companyAddress}</div>
                <div className="rounded-[1rem] bg-white px-4 py-3">문의 번호: {sellerProfile.contactNumber}</div>
              </div>
              {sellerProfile.description && (
                <p className="mt-4 rounded-[1rem] bg-white px-4 py-4 text-sm leading-7 text-[#645341]">
                  {sellerProfile.description}
                </p>
              )}
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-[#e1d3c2] bg-[linear-gradient(180deg,_rgba(255,253,250,0.98),_rgba(245,238,229,0.94))] p-6 shadow-[0_28px_70px_rgba(72,54,29,0.08)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">Seller Product</p>
              <h2 className="mt-3 text-3xl font-black text-[#241f1a]">판매 상품 등록</h2>
              <p className="mt-3 text-sm leading-7 text-[#6f5d4b]">
                상품 사진은 Vercel Blob에 저장되고, 저장된 링크가 MongoDB와 연결되어 메인과 상세페이지에 노출됩니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowProductForm((current) => !current)}
              className="rounded-full bg-[#2f241d] px-5 py-3 text-sm font-bold text-[#f8f1e7] transition hover:bg-[#47362b]"
            >
              {showProductForm ? '상품 폼 닫기' : '상품 폼 열기'}
            </button>
          </div>

          {!sellerProfile?.companyName && (
            <div className="mt-6 rounded-[1.4rem] border border-[#eadfce] bg-[#fffaf4] px-5 py-4 text-sm leading-7 text-[#6c5946]">
              판매자 정보를 먼저 저장해야 상품 등록이 가능합니다.
            </div>
          )}

          {showProductForm && (
            <form onSubmit={handleProductSubmit} className="mt-6 grid gap-4 rounded-[1.6rem] bg-white/75 p-5">
              <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                <div className="grid gap-4">
                  <input
                    value={productForm.name}
                    onChange={(event) => setProductForm((current) => ({ ...current, name: event.target.value }))}
                    placeholder="상품명"
                    className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <select
                      value={productForm.category}
                      onChange={(event) =>
                        setProductForm((current) => {
                          const nextCategory = event.target.value as CategoryKey
                          return {
                            ...current,
                            category: nextCategory,
                            subcategory: categories.find((category) => category.key === nextCategory)?.items[0] ?? '',
                          }
                        })
                      }
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    >
                      {categories.map((category) => (
                        <option key={category.key} value={category.key}>
                          {category.key}
                        </option>
                      ))}
                    </select>

                    <select
                      value={productForm.subcategory}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, subcategory: event.target.value }))
                      }
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    >
                      {currentCategory?.items.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={productForm.origin}
                      onChange={(event) => setProductForm((current) => ({ ...current, origin: event.target.value }))}
                      placeholder="원산지"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <input
                      value={productForm.capacity}
                      onChange={(event) => setProductForm((current) => ({ ...current, capacity: event.target.value }))}
                      placeholder="용량 또는 구성"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={productForm.expiration}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, expiration: event.target.value }))
                      }
                      placeholder="유통기한 또는 사용기한"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <input
                      value={productForm.dimensions}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, dimensions: event.target.value }))
                      }
                      placeholder="사이즈 또는 규격"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <input
                      value={productForm.originalPrice}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, originalPrice: event.target.value }))
                      }
                      placeholder="정가 예: 39,000원"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <input
                      value={productForm.salePrice}
                      onChange={(event) => setProductForm((current) => ({ ...current, salePrice: event.target.value }))}
                      placeholder="판매가 예: 29,000원"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <input
                      value={productForm.saleRate}
                      onChange={(event) => setProductForm((current) => ({ ...current, saleRate: event.target.value }))}
                      placeholder="할인율 예: 25%"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      value={productForm.saleEndsIn}
                      onChange={(event) =>
                        setProductForm((current) => ({ ...current, saleEndsIn: event.target.value }))
                      }
                      placeholder="타임세일 시간 예: 02:15:00"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <input
                      value={productForm.badge}
                      onChange={(event) => setProductForm((current) => ({ ...current, badge: event.target.value }))}
                      placeholder="배지 문구 예: Seller Pick"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#eadfce] bg-[#fffaf4] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">Product Photo</p>
                  <label className="mt-4 flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[1.4rem] border border-dashed border-[#d8c6b3] bg-white px-4 py-6 text-center">
                    {productImagePreview ? (
                      <div
                        className="h-full min-h-[240px] w-full rounded-[1.2rem]"
                        style={{
                          backgroundImage: `url(${productImagePreview})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      />
                    ) : (
                      <>
                        <span className="rounded-full bg-[#f4eadf] px-4 py-2 text-sm font-bold text-[#8d6237]">
                          사진 선택
                        </span>
                        <p className="mt-4 text-sm leading-7 text-[#6f5d4b]">
                          메인 카드와 상품 상세 상단에 노출될 대표 이미지를 업로드해 주세요.
                        </p>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  <p className="mt-3 text-xs leading-6 text-[#8b775f]">
                    Vercel Blob에 업로드된 후 MongoDB에는 이미지 링크만 저장됩니다.
                  </p>
                </div>
              </div>

              <textarea
                rows={5}
                value={productForm.description}
                onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="상세페이지 상단에 보여줄 상품 설명"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />

              <button
                type="submit"
                disabled={isSavingProduct || !sellerProfile?.companyName}
                className="w-full rounded-[1rem] bg-[#2f241d] px-5 py-4 text-base font-bold text-[#f8f1e7] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingProduct ? '상품 저장 중...' : '판매 상품 등록'}
              </button>
            </form>
          )}

          {productMessage && <p className="mt-4 text-sm font-medium text-[#8a6238]">{productMessage}</p>}

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">My Products</p>
                <h3 className="mt-2 text-2xl font-black text-[#241f1a]">등록된 판매 상품</h3>
              </div>
              <div className="rounded-full border border-[#eadfce] bg-white/80 px-4 py-2 text-sm font-semibold text-[#7a6147]">
                총 {registeredProducts.length}개
              </div>
            </div>

            {registeredProducts.length === 0 ? (
              <div className="mt-5 rounded-[1.5rem] border border-dashed border-[#d8c6b3] bg-white/60 px-5 py-8 text-sm leading-7 text-[#786958]">
                아직 등록된 상품이 없습니다. 위 폼에서 첫 상품을 올리면 메인과 상세페이지에서 바로 확인할 수 있습니다.
              </div>
            ) : (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {registeredProducts.map((product) => (
                  <Link
                    key={product.slug}
                    href={`/products/${product.slug}`}
                    className="rounded-[1.6rem] border border-[#e8dbcd] bg-white/80 p-4 shadow-[0_14px_32px_rgba(84,62,34,0.07)] transition hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(84,62,34,0.12)]"
                  >
                    <div
                      className="flex min-h-[180px] items-end rounded-[1.3rem] p-4"
                      style={getImageCardStyle(product.images[0])}
                    >
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                        {product.badge}
                      </span>
                    </div>
                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-[#b08b61]">{product.category}</p>
                      <p className="mt-2 text-lg font-black text-[#251f19]">{product.name}</p>
                      <p className="mt-3 text-sm leading-6 text-[#6f5d4b]">{product.description}</p>
                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xl font-black text-[#241f1a]">{product.salePrice}</p>
                        <p className="text-sm font-semibold text-[#916946]">{product.saleRate} 할인</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}
