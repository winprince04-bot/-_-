'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import HeaderActions from '@/components/HeaderActions'
import type { Product } from '@/data/products'
import { useSession } from '@/components/SessionProvider'

type Props = {
  product: Product
  recommendedProducts: Product[]
}

type TabKey = 'details' | 'reviews' | 'inquiries' | 'shipping'

type Review = {
  id: number
  nickname: string
  profile: string
  rating: number
  text: string
  imageLabel?: string
  createdAt: string
}

type InquiryItem = {
  id: string
  label: string
  checked: boolean
}

const detailSections = [
  {
    title: '브랜드 포인트',
    body: '첫 화면에서 보였던 감도 높은 무드를 상세에서도 이어가도록 레이아웃과 설명 영역을 사진형 배너처럼 구성했습니다.',
    tone: 'linear-gradient(135deg, #8f6b4d, #d0a57c)',
  },
  {
    title: '추천 이유',
    body: '실사용 장면을 떠올릴 수 있도록 배치, 소재, 마감, 분위기 포인트를 중심으로 소개합니다.',
    tone: 'linear-gradient(135deg, #6e7f8d, #a8bbc9)',
  },
  {
    title: '스타일 제안',
    body: '비슷한 카테고리의 상품과 함께 매치했을 때 잘 어울리도록 색감과 디테일의 균형을 강조했습니다.',
    tone: 'linear-gradient(135deg, #9b7a6a, #e2c0af)',
  },
]

const defaultReviews: Review[] = [
  {
    id: 1,
    nickname: '모카라떼',
    profile: 'ML',
    rating: 5,
    text: '실제로 받아보니 화면에서 본 분위기랑 비슷하고 마감도 깔끔해서 만족해요.',
    imageLabel: '리뷰 사진 1장 첨부',
    createdAt: '2026-03-16 10:20',
  },
  {
    id: 2,
    nickname: '차분한하루',
    profile: 'CH',
    rating: 4,
    text: '디자인이 예쁘고 사용감도 무난했어요. 다음에도 같은 세부 카테고리 상품을 더 보고 싶습니다.',
    createdAt: '2026-03-14 18:05',
  },
]

const makePurchaseOptions = (product: Product): InquiryItem[] => {
  if (product.category === '의류') {
    return [
      { id: 'size-s', label: `${product.name} / S / 1개`, checked: true },
      { id: 'size-m', label: `${product.name} / M / 1개`, checked: false },
      { id: 'size-l', label: `${product.name} / L / 1개`, checked: false },
    ]
  }

  return [
    { id: 'qty-1', label: `${product.name} / 기본 옵션 / 1개`, checked: true },
    { id: 'qty-2', label: `${product.name} / 기본 옵션 / 2개`, checked: false },
    { id: 'gift', label: `${product.name} / 선물용 포장 / 1개`, checked: false },
  ]
}

export default function ProductDetailClient({ product, recommendedProducts }: Props) {
  const { recordActivity } = useSession()
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [activeTab, setActiveTab] = useState<TabKey>('details')
  const [detailsExpanded, setDetailsExpanded] = useState(false)
  const [reviews, setReviews] = useState<Review[]>(defaultReviews)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [reviewImage, setReviewImage] = useState('')
  const [purchaseItems, setPurchaseItems] = useState<InquiryItem[]>(() => makePurchaseOptions(product))
  const [inquiryVerified, setInquiryVerified] = useState(false)
  const [inquiryUserId, setInquiryUserId] = useState('')
  const [inquiryPassword, setInquiryPassword] = useState('')
  const [inquiryText, setInquiryText] = useState('')
  const [inquiryImage, setInquiryImage] = useState('')
  const [isPrivateInquiry, setIsPrivateInquiry] = useState(false)

  const activeImage = product.images[activeImageIndex]

  const sortedReviews = useMemo(
    () => [...reviews].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [reviews]
  )

  const showPrevImage = () => {
    setActiveImageIndex((current) => (current === 0 ? product.images.length - 1 : current - 1))
  }

  const showNextImage = () => {
    setActiveImageIndex((current) => (current === product.images.length - 1 ? 0 : current + 1))
  }

  const submitReview = () => {
    if (!reviewText.trim()) return

    setReviews((current) => [
      {
        id: Date.now(),
        nickname: '현재회원',
        profile: 'ME',
        rating: reviewRating,
        text: reviewText.trim(),
        imageLabel: reviewImage ? `첨부 이미지: ${reviewImage}` : undefined,
        createdAt: new Date().toISOString(),
      },
      ...current,
    ])
    setReviewText('')
    setReviewImage('')
    setReviewRating(5)
  }

  const verifyInquiryWriter = () => {
    if (!inquiryUserId.trim() || !inquiryPassword.trim()) return
    setInquiryVerified(true)
  }

  const togglePurchaseItem = (id: string) => {
    setPurchaseItems((current) => current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)))
  }

  const tabs: Array<{ key: TabKey; label: string }> = [
    { key: 'details', label: '상품상세정보' },
    { key: 'reviews', label: '상품평' },
    { key: 'inquiries', label: '상품문의' },
    { key: 'shipping', label: '배송/교환/환불' },
  ]

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-8 text-[#241f1a] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <HeaderActions />

        <Link
          href="/"
          className="w-fit rounded-full border border-[#ddcfbf] bg-white/80 px-4 py-2 text-sm font-semibold text-[#75583c] transition hover:bg-white"
        >
          메인으로 돌아가기
        </Link>

        <section className="rounded-[2rem] border border-[#e1d3c2] bg-[linear-gradient(180deg,_rgba(255,253,250,0.98),_rgba(245,238,229,0.94))] p-5 shadow-[0_28px_70px_rgba(72,54,29,0.08)] sm:p-7">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <div className="relative overflow-hidden rounded-[1.9rem] border border-[#e8dccd] bg-white">
                <button
                  type="button"
                  onClick={showPrevImage}
                  className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/50 bg-white/75 px-3 py-2 text-lg font-bold text-[#5f442a] backdrop-blur-sm transition hover:bg-white"
                  aria-label="이전 사진 보기"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={showNextImage}
                  className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full border border-white/50 bg-white/75 px-3 py-2 text-lg font-bold text-[#5f442a] backdrop-blur-sm transition hover:bg-white"
                  aria-label="다음 사진 보기"
                >
                  ›
                </button>

                <div
                  className="flex min-h-[420px] items-end rounded-[1.9rem] p-6 sm:p-8"
                  style={{ background: activeImage.background }}
                >
                  <div className="rounded-[1.3rem] bg-white/15 p-5 text-white backdrop-blur-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.34em]">{product.badge}</p>
                    <p className="mt-3 text-3xl font-black leading-tight">{product.name}</p>
                    <p className="mt-2 text-sm font-medium text-white/85">{activeImage.label}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image, index) => {
                  const isActive = activeImageIndex === index

                  return (
                    <button
                      key={image.id}
                      type="button"
                      onClick={() => setActiveImageIndex(index)}
                      className={`min-w-[120px] rounded-[1.2rem] border p-3 text-left transition ${
                        isActive
                          ? 'border-[#8b6035] bg-[#f3e7d7] shadow-[0_10px_24px_rgba(84,62,34,0.14)]'
                          : 'border-[#e5d8c9] bg-white/75'
                      }`}
                    >
                      <div className="h-20 rounded-[1rem]" style={{ background: image.background }} />
                      <p className="mt-3 text-sm font-semibold text-[#2b221a]">{image.label}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#8f7250]">
                  <span>{product.category}</span>
                  <span>/</span>
                  <span>{product.subcategory}</span>
                </div>

                <h1 className="mt-4 text-4xl font-black text-[#241f1a]">{product.name}</h1>
                <p className="mt-4 text-base leading-7 text-[#6f5d4b]">{product.description}</p>

                <div className="mt-6 flex flex-wrap gap-3 text-sm text-[#705f4e]">
                  <span className="rounded-full bg-white/80 px-4 py-2">원산지 {product.origin}</span>
                  <span className="rounded-full bg-white/80 px-4 py-2">용량 {product.capacity}</span>
                  <span className="rounded-full bg-white/80 px-4 py-2">유통기한 {product.expiration}</span>
                  <span className="rounded-full bg-white/80 px-4 py-2">치수 {product.dimensions}</span>
                </div>

                <div className="mt-8 rounded-[1.6rem] border border-[#eadfce] bg-[linear-gradient(180deg,_#fffdfa,_#f4ece1)] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">Sale Information</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3 text-[#2a211a]">
                    <span className="text-xl font-semibold text-[#9c856f] line-through">{product.originalPrice}</span>
                    <span className="text-2xl font-black text-[#8b6035]">→</span>
                    <span className="text-3xl font-black">{product.salePrice}</span>
                    <span className="rounded-full bg-[#8b6035] px-3 py-1 text-sm font-bold text-[#fff7ee]">
                      {product.saleRate} 할인
                    </span>
                  </div>
                </div>

                <div className="mt-8 rounded-[1.5rem] border border-[#eadfce] bg-white/70 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b28b62]">Quick Summary</p>
                  <div className="mt-4 grid gap-3 text-sm text-[#695847] sm:grid-cols-2">
                    <div className="rounded-[1rem] bg-[#f7efe4] px-4 py-3">
                      현재 세부 카테고리: {product.subcategory}
                    </div>
                    <div className="rounded-[1rem] bg-[#f7efe4] px-4 py-3">
                      남은 타임세일: {product.saleEndsIn ?? '상시 판매'}
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => recordActivity('cart')}
                    className="rounded-[1.25rem] border border-[#cab093] bg-white px-5 py-4 text-base font-bold text-[#5f442a] transition hover:bg-[#fff8f0]"
                  >
                    장바구니 담기
                  </button>
                  <button
                    type="button"
                    onClick={() => recordActivity('purchase')}
                    className="rounded-[1.25rem] bg-[#2f241d] px-5 py-4 text-base font-bold text-[#f8f1e7] transition hover:bg-[#453327]"
                  >
                    바로 구매
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#e1d3c2] bg-[linear-gradient(180deg,_rgba(255,254,251,0.98),_rgba(244,238,230,0.96))] p-5 shadow-[0_22px_60px_rgba(72,54,29,0.07)] sm:p-7">
          <div className="flex flex-wrap gap-3 border-b border-[#eadfce] pb-5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#2f241d] text-[#f8f1e7] shadow-[0_16px_35px_rgba(60,41,16,0.16)]'
                      : 'border border-[#dfd1bf] bg-white/80 text-[#6f614f] hover:border-[#c6a06f] hover:text-[#8a6030]'
                  }`}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {activeTab === 'details' && (
            <div className="pt-6">
              <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/75 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">Product Story</p>
                    <h2 className="mt-2 text-2xl font-black text-[#241f1a]">상품상세정보</h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDetailsExpanded((current) => !current)}
                    className="rounded-full border border-[#ccb093] bg-[#fff8ef] px-5 py-3 text-sm font-bold text-[#6a4c2d]"
                  >
                    {detailsExpanded ? '접기' : '더보기'}
                  </button>
                </div>

                <div className="mt-6 space-y-5">
                  <div className="rounded-[1.6rem] p-6 text-white" style={{ background: product.images[0].background }}>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em]">Main Feature</p>
                    <p className="mt-4 text-3xl font-black">{product.name}</p>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90">{product.description}</p>
                  </div>

                  {detailsExpanded && (
                    <>
                      {detailSections.map((section, index) => (
                        <div
                          key={section.title}
                          className="overflow-hidden rounded-[1.6rem] border border-[#eadfce] bg-white"
                        >
                          <div className="p-6 text-white" style={{ background: section.tone }}>
                            <p className="text-xs font-semibold uppercase tracking-[0.32em]">Detail 0{index + 1}</p>
                            <h3 className="mt-3 text-2xl font-black">{section.title}</h3>
                            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/90">{section.body}</p>
                          </div>
                          <div className="grid gap-4 p-6 lg:grid-cols-[1.2fr_0.8fr]">
                            <div className="rounded-[1.4rem] bg-[#f7efe4] p-5 text-sm leading-7 text-[#6c5946]">
                              상품 상세 설명 영역입니다. 실제 서비스에서는 여기에서 소재 설명, 사용 팁, 연출컷, 세부
                              디테일 안내, 브랜드 스토리 같은 내용을 길게 이어서 보여줄 수 있습니다.
                            </div>
                            <div
                              className="min-h-[220px] rounded-[1.4rem]"
                              style={{ background: product.images[(index + 1) % product.images.length].background }}
                            />
                          </div>
                        </div>
                      ))}
                      <div className="rounded-[1.6rem] border border-[#eadfce] bg-[#fffaf4] p-6 text-sm leading-7 text-[#6b5947]">
                        하단 설명 영역입니다. 상품 관리자가 꼭 전달하고 싶은 주의사항, 보관 방법, 스타일링 팁, 함께
                        구매하면 좋은 상품 제안 등을 길게 적을 수 있도록 구성했습니다.
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="pt-6">
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">Write Review</p>
                  <div className="mt-5 flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2f241d] text-sm font-black text-[#f8f1e7]">
                      ME
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#241f1a]">현재회원</p>
                      <div className="mt-2 flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className={`text-2xl ${star <= reviewRating ? 'text-[#d99b3f]' : 'text-[#d7c6b1]'}`}
                            aria-label={`${star}점 선택`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <input
                      value={reviewImage}
                      onChange={(event) => setReviewImage(event.target.value)}
                      placeholder="사진 첨부 이름 또는 URL 입력"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <textarea
                      value={reviewText}
                      onChange={(event) => setReviewText(event.target.value)}
                      placeholder="상품평을 작성해 주세요."
                      rows={6}
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="rounded-[1rem] border border-[#ccb093] bg-[#fff8ef] px-4 py-3 text-sm font-bold text-[#6a4c2d]"
                      >
                        사진첨부
                      </button>
                      <button
                        type="button"
                        onClick={submitReview}
                        className="rounded-[1rem] bg-[#2f241d] px-4 py-3 text-sm font-bold text-[#f8f1e7]"
                      >
                        상품평 작성
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {sortedReviews.map((review) => (
                    <article
                      key={review.id}
                      className="rounded-[1.5rem] border border-[#eadfce] bg-white/80 p-5 shadow-[0_10px_24px_rgba(84,62,34,0.05)]"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f2e4d3] text-sm font-black text-[#6b4b2e]">
                            {review.profile}
                          </div>
                          <div>
                            <p className="font-bold text-[#241f1a]">{review.nickname}</p>
                            <p className="text-sm text-[#8b775f]">{review.createdAt}</p>
                          </div>
                        </div>
                        <div className="text-[#d99b3f]">
                          {'★'.repeat(review.rating)}
                          {'☆'.repeat(5 - review.rating)}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-7 text-[#645341]">{review.text}</p>
                      {review.imageLabel && (
                        <div className="mt-4 rounded-[1rem] bg-[#f7efe4] px-4 py-3 text-sm text-[#6c5946]">
                          {review.imageLabel}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inquiries' && (
            <div className="pt-6">
              <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/75 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">
                    Purchase Information
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-[#241f1a]">상품문의</h2>
                  <p className="mt-3 text-sm leading-7 text-[#6f5d4b]">
                    현재 상품에 맞는 구매정보를 자동으로 불러왔고, 문의할 항목만 부분 체크할 수 있도록 구성했습니다.
                  </p>

                  <div className="mt-5 space-y-3">
                    {purchaseItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 rounded-[1rem] border border-[#eadfce] bg-[#fffaf4] px-4 py-3 text-sm text-[#5f4d3d]"
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => togglePurchaseItem(item.id)}
                          className="h-4 w-4 accent-[#8b6035]"
                        />
                        <span>{item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/80 p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">
                        Writer Verification
                      </p>
                      <p className="mt-2 text-sm text-[#6e5c49]">
                        문의 작성 전 아이디와 비밀번호를 한 번 더 입력합니다.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={verifyInquiryWriter}
                      className="rounded-[1rem] bg-[#2f241d] px-4 py-3 text-sm font-bold text-[#f8f1e7]"
                    >
                      문의 작성
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <input
                      value={inquiryUserId}
                      onChange={(event) => setInquiryUserId(event.target.value)}
                      placeholder="아이디 입력"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <input
                      type="password"
                      value={inquiryPassword}
                      onChange={(event) => setInquiryPassword(event.target.value)}
                      placeholder="비밀번호 입력"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                  </div>

                  {inquiryVerified && (
                    <div className="mt-5 space-y-4 rounded-[1.2rem] border border-[#eadfce] bg-[#fffaf4] p-4">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="rounded-[1rem] border border-[#ccb093] bg-white px-4 py-3 text-sm font-bold text-[#6a4c2d]"
                        >
                          사진첨부
                        </button>
                        <button
                          type="button"
                          className="rounded-[1rem] bg-[#8b6035] px-4 py-3 text-sm font-bold text-[#fff7ee]"
                        >
                          글 작성
                        </button>
                      </div>
                      <input
                        value={inquiryImage}
                        onChange={(event) => setInquiryImage(event.target.value)}
                        placeholder="첨부할 사진 이름 또는 URL 입력"
                        className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                      />
                      <textarea
                        value={inquiryText}
                        onChange={(event) => setInquiryText(event.target.value)}
                        placeholder="문의 내용을 입력해 주세요."
                        rows={6}
                        className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                      />
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setIsPrivateInquiry(false)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            !isPrivateInquiry
                              ? 'bg-[#2f241d] text-[#f8f1e7]'
                              : 'border border-[#dfd1bf] bg-white text-[#6f614f]'
                          }`}
                        >
                          공개
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPrivateInquiry(true)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold ${
                            isPrivateInquiry
                              ? 'bg-[#2f241d] text-[#f8f1e7]'
                              : 'border border-[#dfd1bf] bg-white text-[#6f614f]'
                          }`}
                        >
                          비공개
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="pt-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {[
                  {
                    title: '배송 안내',
                    body: '주문 확인 후 1~3영업일 내 출고되며, 도서산간 지역은 추가 배송일이 소요될 수 있습니다.',
                  },
                  {
                    title: '교환 안내',
                    body: '상품 수령 후 7일 이내 접수 가능하며, 사용 흔적이 없는 경우에 한해 교환 처리됩니다.',
                  },
                  {
                    title: '환불 안내',
                    body: '단순 변심 환불은 왕복 배송비가 부과될 수 있으며, 불량 상품은 확인 후 전액 환불됩니다.',
                  },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-[#eadfce] bg-white/80 p-5 shadow-[0_10px_24px_rgba(84,62,34,0.05)]"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">{item.title}</p>
                    <p className="mt-4 text-sm leading-7 text-[#665644]">{item.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="rounded-[2rem] border border-[#e1d3c2] bg-[linear-gradient(180deg,_rgba(255,254,251,0.98),_rgba(244,238,230,0.96))] p-5 shadow-[0_22px_60px_rgba(72,54,29,0.07)] sm:p-7">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d6846]">Similar Products</p>
              <h2 className="mt-3 text-3xl font-black text-[#241f1a]">비슷한 상품 추천</h2>
              <p className="mt-3 text-sm leading-7 text-[#756554]">
                현재 보고 있는 세부 카테고리인 {product.subcategory} 기준으로 유사한 상품을 먼저 추천합니다.
              </p>
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recommendedProducts.map((recommended) => (
              <Link
                key={recommended.slug}
                href={`/products/${recommended.slug}`}
                className="group rounded-[1.5rem] border border-[#e8dbcd] bg-white/80 p-4 shadow-[0_14px_32px_rgba(84,62,34,0.07)] transition hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(84,62,34,0.12)]"
              >
                <div
                  className="flex min-h-[180px] items-end rounded-[1.3rem] p-4"
                  style={{ background: recommended.images[0].background }}
                >
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    {recommended.subcategory}
                  </span>
                </div>
                <div className="mt-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#b08b61]">{recommended.category}</p>
                  <p className="mt-2 text-lg font-black text-[#251f19]">{recommended.name}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-black text-[#241f1a]">{recommended.salePrice}</p>
                    <p className="text-sm font-semibold text-[#916946]">{recommended.saleRate} 할인</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {product.sellerProfile && (
          <section className="rounded-[2rem] border border-[#e1d3c2] bg-[linear-gradient(180deg,_rgba(255,253,250,0.98),_rgba(244,236,227,0.96))] p-5 shadow-[0_22px_60px_rgba(72,54,29,0.07)] sm:p-7">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8d6846]">Seller Information</p>
            <div className="mt-4 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-[1.5rem] bg-[#2f241d] p-5 text-[#f8f1e7]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#d8c0a0]">Company</p>
                <h2 className="mt-3 text-3xl font-black">{product.sellerProfile.companyName}</h2>
                <p className="mt-4 text-sm leading-7 text-[#f3e6d6]">
                  {product.sellerProfile.description || '등록된 판매자 소개가 아직 없습니다.'}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b08a60]">Company Address</p>
                  <p className="mt-4 text-sm leading-7 text-[#5f4d3d]">{product.sellerProfile.companyAddress}</p>
                </div>
                <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/80 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#b08a60]">Contact Number</p>
                  <p className="mt-4 text-sm leading-7 text-[#5f4d3d]">{product.sellerProfile.contactNumber}</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
