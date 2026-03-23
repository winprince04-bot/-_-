'use client'

import Link from 'next/link'
import { useState } from 'react'

import HeaderActions from '@/components/HeaderActions'
import { useSession } from '@/components/SessionProvider'

const initialForm = {
  companyName: '',
  companyAddress: '',
  contactNumber: '',
  description: '',
}

export default function SellerPage() {
  const { currentUser, sellerProfile, saveSellerProfile } = useSession()
  const [showForm, setShowForm] = useState(!sellerProfile)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [form, setForm] = useState({
    companyName: sellerProfile?.companyName ?? initialForm.companyName,
    companyAddress: sellerProfile?.companyAddress ?? initialForm.companyAddress,
    contactNumber: sellerProfile?.contactNumber ?? initialForm.contactNumber,
    description: sellerProfile?.description ?? initialForm.description,
  })

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.companyName.trim() || !form.companyAddress.trim() || !form.contactNumber.trim()) {
      setSaveMessage('회사명, 회사 주소, 문의 번호를 먼저 입력해 주세요.')
      return
    }

    if (!currentUser) {
      setSaveMessage('로그인 후 판매자 정보를 저장할 수 있습니다.')
      return
    }

    setIsSaving(true)
    setSaveMessage('')

    try {
      const response = await fetch('/api/seller/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          companyName: form.companyName.trim(),
          companyAddress: form.companyAddress.trim(),
          contactNumber: form.contactNumber.trim(),
          description: form.description.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSaveMessage(data.message ?? '판매자 정보 저장에 실패했습니다.')
        return
      }

      saveSellerProfile({
        companyName: data.sellerProfile?.companyName ?? form.companyName.trim(),
        companyAddress: data.sellerProfile?.companyAddress ?? form.companyAddress.trim(),
        contactNumber: data.sellerProfile?.contactNumber ?? form.contactNumber.trim(),
        description: data.sellerProfile?.description ?? form.description.trim(),
      })

      setSaveMessage(data.message ?? '판매자 정보가 저장되었습니다.')
      setShowForm(false)
    } catch {
      setSaveMessage('판매자 정보 저장 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f1e8] px-4 py-8 text-[#241f1a] sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <HeaderActions />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b08a60]">Seller Zone</p>
            <h1 className="mt-3 text-4xl font-black text-[#241f1a]">판매자 전용</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f5d4b]">
              판매자 등록 버튼을 눌러 회사명, 회사 주소, 문의 번호를 입력하면 상품 상세페이지 하단에 자동 표시됩니다.
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
              <h2 className="mt-3 text-3xl font-black text-[#241f1a]">판매자 등록</h2>
              <p className="mt-3 text-sm leading-7 text-[#6f5d4b]">
                플러스 버튼을 눌러 판매자 정보를 입력하고 저장해 주세요.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowForm((current) => !current)}
              className="flex h-14 w-14 items-center justify-center rounded-full bg-[#2f241d] text-3xl font-light text-[#f8f1e7] shadow-[0_16px_35px_rgba(60,41,16,0.2)] transition hover:bg-[#47362b]"
              aria-label="판매자 등록 폼 열기"
            >
              +
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSubmit} className="mt-6 grid gap-4 rounded-[1.6rem] bg-white/75 p-5">
              <input
                value={form.companyName}
                onChange={(event) => setForm((current) => ({ ...current, companyName: event.target.value }))}
                placeholder="회사명"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />
              <input
                value={form.companyAddress}
                onChange={(event) => setForm((current) => ({ ...current, companyAddress: event.target.value }))}
                placeholder="회사 주소"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />
              <input
                value={form.contactNumber}
                onChange={(event) => setForm((current) => ({ ...current, contactNumber: event.target.value }))}
                placeholder="문의 번호"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />
              <textarea
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="회사 소개 또는 판매 안내"
                className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
              />
              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded-[1rem] bg-[#2f241d] px-5 py-4 text-base font-bold text-[#f8f1e7] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSaving ? '저장 중...' : '판매자 등록 저장'}
              </button>
            </form>
          )}

          {saveMessage && <p className="mt-4 text-sm font-medium text-[#8a6238]">{saveMessage}</p>}

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
      </div>
    </main>
  )
}
