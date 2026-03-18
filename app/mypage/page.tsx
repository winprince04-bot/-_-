'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import HeaderActions from '@/components/HeaderActions'
import { useSession } from '@/components/SessionProvider'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })

const localNetworkBaseUrl = process.env.NEXT_PUBLIC_LOCAL_NETWORK_URL || 'http://localhost:3000'

export default function MyPage() {
  const {
    currentUser,
    currentUserOrders,
    currentUserPaymentMethods,
    updateCurrentUserProfile,
    updateCurrentUserPayment,
  } = useSession()
  const [rangeStart, setRangeStart] = useState('')
  const [rangeEnd, setRangeEnd] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const latestPayment = currentUserPaymentMethods[currentUserPaymentMethods.length - 1]
  const [profileForm, setProfileForm] = useState({
    userId: currentUser?.userId ?? '',
    email: currentUser?.email ?? '',
    password: currentUser?.password ?? '',
    name: currentUser?.name ?? '',
    address: latestPayment?.address ?? '',
    paymentMethod: latestPayment ? `${latestPayment.bank} / ${latestPayment.cardNumber}` : '미등록',
  })

  const filteredOrders = useMemo(() => {
    return currentUserOrders.filter((order) => {
      const orderDate = new Date(order.orderedAt)
      if (rangeStart && orderDate < new Date(rangeStart)) return false
      if (rangeEnd) {
        const inclusiveEnd = new Date(rangeEnd)
        inclusiveEnd.setHours(23, 59, 59, 999)
        if (orderDate > inclusiveEnd) return false
      }
      return true
    })
  }, [currentUserOrders, rangeEnd, rangeStart])

  const sortedByDate = [...filteredOrders].sort(
    (a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
  )

  const groupedByCategory = useMemo(() => {
    return filteredOrders.reduce<Record<string, typeof filteredOrders>>((groups, order) => {
      if (!groups[order.category]) groups[order.category] = []
      groups[order.category].push(order)
      return groups
    }, {})
  }, [filteredOrders])

  const qrToken = useMemo(() => Math.random().toString(36).slice(2, 10), [])
  const downloadLink = useMemo(() => `${localNetworkBaseUrl}/api/download/order-summary/${qrToken}`, [qrToken])
  const qrImageUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(downloadLink)}`,
    [downloadLink]
  )

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-[#f6f1e8] px-4 py-8 text-[#241f1a] sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
          <HeaderActions />
          <section className="rounded-[2rem] border border-[#e1d3c2] bg-white/80 p-10 text-center shadow-[0_22px_60px_rgba(72,54,29,0.07)]">
            <h1 className="text-3xl font-black">나의페이지</h1>
            <p className="mt-4 text-sm text-[#6f5d4b]">로그인 후 주문내역과 회원정보를 확인할 수 있습니다.</p>
            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-[#2f241d] px-5 py-3 text-sm font-bold text-[#f8f1e7]"
            >
              메인으로 돌아가기
            </Link>
          </section>
        </div>
      </main>
    )
  }

  const submitProfileUpdate = () => {
    updateCurrentUserProfile({
      userId: profileForm.userId,
      email: profileForm.email,
      password: profileForm.password,
      name: profileForm.name,
      nickname: profileForm.userId,
    })
    updateCurrentUserPayment({
      address: profileForm.address,
      bank: profileForm.paymentMethod.split('/')[0]?.trim() ?? '미등록',
      cardNumber: profileForm.paymentMethod.split('/')[1]?.trim() ?? '',
    })
    setIsEditing(false)
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-8 text-[#241f1a] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <HeaderActions />

        <section className="rounded-[2rem] border border-[#e1d3c2] bg-[linear-gradient(180deg,_rgba(255,253,250,0.98),_rgba(245,238,229,0.94))] p-5 shadow-[0_28px_70px_rgba(72,54,29,0.08)] sm:p-7">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.34em] text-[#b08858]">My Page</p>
              <h1 className="mt-3 text-4xl font-black text-[#241f1a]">{currentUser.nickname}님의 나의페이지</h1>
              <p className="mt-3 text-sm leading-7 text-[#6f5d4b]">
                주문 내역, 회원정보, 결제수단과 주소, 최근 결제 정리 서비스까지 한 번에 볼 수 있도록 구성했습니다.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#eadfce] bg-white/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">기간 필터</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <input
                  type="date"
                  value={rangeStart}
                  onChange={(event) => setRangeStart(event.target.value)}
                  className="rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                />
                <input
                  type="date"
                  value={rangeEnd}
                  onChange={(event) => setRangeEnd(event.target.value)}
                  className="rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-8 xl:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[2rem] border border-[#e1d3c2] bg-white/80 p-6 shadow-[0_22px_60px_rgba(72,54,29,0.07)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">회원정보</p>
            <div className="mt-5 space-y-4 text-sm text-[#5f4d3d]">
              <div>
                <p className="font-semibold">아이디</p>
                {isEditing ? (
                  <input
                    value={profileForm.userId}
                    onChange={(event) => setProfileForm((current) => ({ ...current, userId: event.target.value }))}
                    className="mt-2 w-full rounded-[1rem] border border-[#dfd1bf] px-4 py-3 outline-none"
                  />
                ) : (
                  <p className="mt-2 rounded-[1rem] bg-[#f7efe4] px-4 py-3">{currentUser.userId}</p>
                )}
              </div>
              <div>
                <p className="font-semibold">이메일</p>
                {isEditing ? (
                  <input
                    value={profileForm.email}
                    onChange={(event) => setProfileForm((current) => ({ ...current, email: event.target.value }))}
                    className="mt-2 w-full rounded-[1rem] border border-[#dfd1bf] px-4 py-3 outline-none"
                  />
                ) : (
                  <p className="mt-2 rounded-[1rem] bg-[#f7efe4] px-4 py-3">{currentUser.email}</p>
                )}
              </div>
              <div>
                <p className="font-semibold">집주소</p>
                {isEditing ? (
                  <input
                    value={profileForm.address}
                    onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))}
                    className="mt-2 w-full rounded-[1rem] border border-[#dfd1bf] px-4 py-3 outline-none"
                  />
                ) : (
                  <p className="mt-2 rounded-[1rem] bg-[#f7efe4] px-4 py-3">{latestPayment?.address ?? '미등록'}</p>
                )}
              </div>
              <div>
                <p className="font-semibold">결제수단</p>
                {isEditing ? (
                  <input
                    value={profileForm.paymentMethod}
                    onChange={(event) =>
                      setProfileForm((current) => ({ ...current, paymentMethod: event.target.value }))
                    }
                    className="mt-2 w-full rounded-[1rem] border border-[#dfd1bf] px-4 py-3 outline-none"
                  />
                ) : (
                  <p className="mt-2 rounded-[1rem] bg-[#f7efe4] px-4 py-3">
                    {latestPayment ? `${latestPayment.bank} / ${latestPayment.cardNumber}` : '미등록'}
                  </p>
                )}
              </div>
              <div>
                <p className="font-semibold">비밀번호</p>
                {isEditing ? (
                  <input
                    value={profileForm.password}
                    onChange={(event) => setProfileForm((current) => ({ ...current, password: event.target.value }))}
                    className="mt-2 w-full rounded-[1rem] border border-[#dfd1bf] px-4 py-3 outline-none"
                  />
                ) : (
                  <p className="mt-2 rounded-[1rem] bg-[#f7efe4] px-4 py-3">{currentUser.password}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={submitProfileUpdate}
                    className="rounded-[1rem] bg-[#2f241d] px-5 py-3 text-sm font-bold text-[#f8f1e7]"
                  >
                    저장하기
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="rounded-[1rem] border border-[#d9c4aa] px-5 py-3 text-sm font-semibold text-[#6d4d2e]"
                  >
                    취소
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="rounded-[1rem] bg-[#2f241d] px-5 py-3 text-sm font-bold text-[#f8f1e7]"
                >
                  수정하기
                </button>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-[#e1d3c2] bg-white/80 p-6 shadow-[0_22px_60px_rgba(72,54,29,0.07)]">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">주문한 상품내역</p>
            <div className="mt-5 space-y-3">
              {sortedByDate.map((order) => (
                <div
                  key={order.id}
                  className="rounded-[1.2rem] border border-[#eadfce] bg-[#fffaf4] px-4 py-4 text-sm text-[#5f4d3d]"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-bold text-[#241f1a]">{order.productName}</p>
                      <p className="mt-1 text-[#8b775f]">
                        {formatDate(order.orderedAt)} / {order.category} / 수량 {order.quantity}
                      </p>
                    </div>
                    <p className="font-black text-[#8b6035]">{order.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-[#e1d3c2] bg-white/80 p-6 shadow-[0_22px_60px_rgba(72,54,29,0.07)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#b08a60]">최근 결제 정리 서비스</p>
              <h2 className="mt-3 text-3xl font-black text-[#241f1a]">날짜순 / 카테고리별 자동 정리</h2>
              <p className="mt-3 text-sm leading-7 text-[#6f5d4b]">
                최근 결제 목록을 날짜순 표와 카테고리별 표로 자동 정리하고, QR 코드로 휴대폰 다운로드 링크까지
                제공합니다.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#eadfce] bg-[#fffaf4] p-5 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrImageUrl} alt="주문 정리 다운로드 QR 코드" className="mx-auto h-52 w-52 rounded-[1rem]" />
              <p className="mt-3 text-sm font-semibold text-[#6d4d2e]">휴대폰으로 다운로드 링크 열기</p>
              <p className="mt-2 break-all text-xs text-[#8b775f]">{downloadLink}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-8 xl:grid-cols-2">
            <div>
              <h3 className="text-xl font-black text-[#241f1a]">날짜순 정리</h3>
              <div className="mt-4 overflow-hidden rounded-[1.3rem] border border-[#eadfce]">
                <table className="min-w-full bg-white text-sm">
                  <thead className="bg-[#f5ece1] text-[#6d4d2e]">
                    <tr>
                      <th className="px-4 py-3 text-left">주문일</th>
                      <th className="px-4 py-3 text-left">상품명</th>
                      <th className="px-4 py-3 text-left">금액</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedByDate.map((order) => (
                      <tr key={order.id} className="border-t border-[#f0e4d5]">
                        <td className="px-4 py-3">{formatDate(order.orderedAt)}</td>
                        <td className="px-4 py-3">{order.productName}</td>
                        <td className="px-4 py-3">{order.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-[#241f1a]">카테고리별 정리</h3>
              <div className="mt-4 overflow-hidden rounded-[1.3rem] border border-[#eadfce]">
                <table className="min-w-full bg-white text-sm">
                  <thead className="bg-[#f5ece1] text-[#6d4d2e]">
                    <tr>
                      <th className="px-4 py-3 text-left">카테고리</th>
                      <th className="px-4 py-3 text-left">주문건수</th>
                      <th className="px-4 py-3 text-left">상품 목록</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(groupedByCategory).map(([category, ordersByCategory]) => (
                      <tr key={category} className="border-t border-[#f0e4d5]">
                        <td className="px-4 py-3">{category}</td>
                        <td className="px-4 py-3">{ordersByCategory.length}건</td>
                        <td className="px-4 py-3">{ordersByCategory.map((order) => order.productName).join(', ')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
