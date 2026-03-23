'use client'

import Link from 'next/link'
import { useState } from 'react'

import HeaderActions from '@/components/HeaderActions'
import { categories, flashSaleProducts, heroHighlights, popularProducts, type CategoryKey } from '@/data/products'

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('의류')
  const currentCategory = categories.find((category) => category.key === activeCategory)

  return (
    <main className="min-h-screen overflow-hidden bg-[#f6f1e8] px-4 py-6 text-[#241f1a] sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(214,177,111,0.28),_transparent_58%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-32 mx-auto hidden h-72 max-w-6xl rounded-full bg-[radial-gradient(circle,_rgba(255,255,255,0.75),_transparent_65%)] blur-3xl lg:block" />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-8">
        <HeaderActions />

        <section className="overflow-hidden rounded-[2rem] border border-white/60 bg-[linear-gradient(135deg,_#1f1a16_0%,_#2f241d_36%,_#7b5f3b_100%)] shadow-[0_30px_80px_rgba(60,41,16,0.25)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.35fr_0.75fr] lg:px-12 lg:py-12">
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.42em] text-[#d8c0a0]">Curated Promotion</p>
                <h1 className="mt-5 max-w-3xl text-4xl font-black leading-[1.05] text-[#f8f1e7] sm:text-5xl lg:text-6xl">
                  오늘의 감도를 담은
                  <br />
                  프리미엄 쇼핑 메인
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#e8dcca] sm:text-base">
                  상품 카드를 누르면 바로 상세 화면으로 이동하고, 메인에서는 타임세일과 인기상품을 한 번에 둘러볼 수
                  있도록 구성했습니다.
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/products/${flashSaleProducts[0].slug}`}
                  className="rounded-full bg-[#f8f1e7] px-6 py-3 text-sm font-bold text-[#2a211a] transition hover:bg-white"
                >
                  대표 상품 보기
                </Link>
                <Link
                  href={`/products/${popularProducts[0].slug}`}
                  className="rounded-full border border-[#b59a73] px-6 py-3 text-sm font-semibold text-[#f8f1e7] transition hover:border-[#e8dcca] hover:bg-white/10"
                >
                  인기 상품 보기
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.34em] text-[#d8c0a0]">Today Only</p>
                <div className="mt-5 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-[#eadfce]">메인 프로모션</p>
                    <p className="mt-2 text-3xl font-black text-white">최대 70% 할인</p>
                  </div>
                  <div className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-[#f7efe1]">
                    자정 종료
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                {heroHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,_rgba(255,255,255,0.15),_rgba(255,255,255,0.06))] p-5"
                  >
                    <p className="text-xs uppercase tracking-[0.3em] text-[#ccb391]">{item.label}</p>
                    <p className="mt-3 text-lg font-bold text-[#fff8f0]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#e4d8c8] bg-[linear-gradient(180deg,_rgba(255,252,247,0.95),_rgba(248,243,236,0.92))] p-5 shadow-[0_25px_70px_rgba(76,57,31,0.09)] backdrop-blur sm:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(135deg,_#2f241d,_#7a6041)] text-sm font-black tracking-[0.3em] text-[#f8f1e7] shadow-[0_15px_35px_rgba(60,41,16,0.22)]">
                SHOP
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#b38a57]">Category</p>
                <h2 className="mt-2 text-3xl font-black text-[#241f1a]">카테고리 셀렉션</h2>
                <p className="mt-2 text-sm text-[#7a6a57]">큰 카테고리를 누르면 아래에 세부 카테고리가 펼쳐집니다.</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {categories.map((category) => {
                const isActive = activeCategory === category.key

                return (
                  <button
                    key={category.key}
                    type="button"
                    onClick={() => setActiveCategory(category.key)}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
                      isActive
                        ? 'bg-[#2f241d] text-[#f8f1e7] shadow-[0_16px_35px_rgba(60,41,16,0.22)]'
                        : 'border border-[#dfd1bf] bg-white/80 text-[#6f614f] hover:border-[#c6a06f] hover:text-[#8a6030]'
                    }`}
                  >
                    {category.key}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-6 grid gap-5 rounded-[1.75rem] border border-[#e8ddd0] bg-white/70 p-5 lg:grid-cols-[0.92fr_1.08fr] lg:p-6">
            <div className="rounded-[1.5rem] bg-[linear-gradient(135deg,_#faf4ec,_#f1e7d9)] p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#bb9060]">Focused Category</p>
              <h3 className="mt-4 text-3xl font-black text-[#2f241d]">{activeCategory}</h3>
              <p className="mt-3 text-sm leading-7 text-[#786958]">
                메인 카테고리를 강조하고 오른쪽에는 세부 카테고리를 배치해 선택 구조가 더 정돈되어 보이도록
                구성했습니다.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {currentCategory?.items.map((item, index) => (
                <div
                  key={item}
                  className="rounded-[1.25rem] border border-[#eadfce] bg-[linear-gradient(180deg,_#fffdf9,_#f6efe6)] p-4 shadow-[0_12px_30px_rgba(91,69,39,0.07)]"
                >
                  <p className="text-xs uppercase tracking-[0.28em] text-[#c19a6d]">0{index + 1}</p>
                  <p className="mt-3 text-base font-bold text-[#2f241d]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#e7d9ca] bg-[linear-gradient(180deg,_rgba(255,252,249,0.98),_rgba(247,241,234,0.95))] p-5 shadow-[0_28px_80px_rgba(76,57,31,0.08)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#bc7c52]">Time Sale</p>
              <h2 className="mt-3 text-3xl font-black text-[#241f1a] sm:text-4xl">기간 한정 세일 상품</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756554]">
                상품 사진 영역을 누르면 상세 페이지로 이동하며, 상세에서는 여러 장의 이미지를 넘겨볼 수 있습니다.
              </p>
            </div>

            <div className="flex items-center gap-3 self-start rounded-full border border-[#eadbc9] bg-white/80 px-5 py-3 text-sm font-semibold text-[#8a6a47] lg:self-auto">
              <span className="h-2.5 w-2.5 rounded-full bg-[#c5905e]" />총 {flashSaleProducts.length}개 상품
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {flashSaleProducts.map((product, index) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group relative overflow-hidden rounded-[1.7rem] border border-[#eadfce] bg-[linear-gradient(180deg,_#fffdf9,_#f5ede3)] p-4 shadow-[0_18px_45px_rgba(85,61,29,0.07)] transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_55px_rgba(85,61,29,0.14)]"
              >
                <div className="absolute inset-x-6 top-0 h-24 rounded-b-full bg-[radial-gradient(circle,_rgba(212,172,114,0.18),_transparent_72%)]" />
                <div
                  className="relative rounded-[1.35rem] px-4 py-6 text-center shadow-inner"
                  style={{ background: product.images[0].background }}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/85">{product.badge}</p>
                  <p className="mt-10 text-lg font-black leading-snug text-white">{product.name}</p>
                </div>

                <div className="relative mt-5">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#f2e5d3] px-3 py-1 text-xs font-bold text-[#8b6035]">
                      {product.category}
                    </span>
                    <span className="text-xs font-semibold tracking-[0.22em] text-[#b68d61]">D-{(index % 3) + 1}</span>
                  </div>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[#ae8a62]">Price</p>
                      <p className="mt-2 text-2xl font-black text-[#241f1a]">{product.salePrice}</p>
                    </div>
                    <div className="rounded-full bg-[#8b6035] px-3 py-1 text-sm font-bold text-[#fff7ee]">
                      {product.saleRate} OFF
                    </div>
                  </div>
                  <p className="mt-3 text-sm font-medium text-[#6e5c49]">남은 시간 {product.saleEndsIn}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#ddcfbf] bg-[linear-gradient(180deg,_rgba(255,254,251,0.98),_rgba(244,238,230,0.96))] p-5 shadow-[0_24px_70px_rgba(74,56,31,0.08)] sm:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#8e6748]">Popular Products</p>
              <h2 className="mt-3 text-3xl font-black text-[#241f1a] sm:text-4xl">인기상품</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[#756554]">
                고객들이 많이 클릭한 상품을 기준으로 정렬해 타임세일 아래에 가로 5, 세로 2 형태로 배치했습니다.
              </p>
            </div>
            <div className="rounded-full border border-[#e4d5c3] bg-white/80 px-5 py-3 text-sm font-semibold text-[#7a6147]">
              클릭 수 상위 {popularProducts.length}개
            </div>
          </div>

          <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {popularProducts.map((product) => (
              <Link
                key={product.slug}
                href={`/products/${product.slug}`}
                className="group rounded-[1.6rem] border border-[#e8dbcd] bg-white/80 p-4 shadow-[0_14px_32px_rgba(84,62,34,0.07)] transition hover:-translate-y-1 hover:shadow-[0_20px_36px_rgba(84,62,34,0.12)]"
              >
                <div
                  className="flex min-h-[150px] items-end rounded-[1.3rem] p-4"
                  style={{ background: product.images[1].background }}
                >
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                    {product.subcategory}
                  </span>
                </div>
                <div className="mt-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[#b08b61]">{product.category}</p>
                    <p className="mt-2 text-lg font-black text-[#251f19]">{product.name}</p>
                  </div>
                  <span className="rounded-full bg-[#f4eadf] px-3 py-1 text-xs font-bold text-[#8d6237]">
                    {product.clickCount}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-xl font-black text-[#241f1a]">{product.salePrice}</p>
                  <p className="text-sm font-semibold text-[#916946]">{product.saleRate} 할인</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <Link
          href="/seller"
          className="fixed bottom-8 right-8 z-30 flex items-center gap-3 rounded-full bg-[#2f241d] px-5 py-4 text-sm font-bold text-[#f8f1e7] shadow-[0_18px_45px_rgba(60,41,16,0.28)] transition hover:-translate-y-1 hover:bg-[#47362b]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-xl font-light">
            +
          </span>
          판매자 전용
        </Link>
      </div>
    </main>
  )
}
