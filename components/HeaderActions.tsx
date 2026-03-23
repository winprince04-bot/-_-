'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'

import { useSession } from './SessionProvider'

const bankBrands = [
  'KB국민은행',
  '신한은행',
  '하나은행',
  '우리은행',
  'NH농협은행',
  'IBK기업은행',
  '카카오뱅크',
  '토스뱅크',
  'SC제일은행',
  '씨티은행',
  '부산은행',
  '대구은행',
  '광주은행',
  '전북은행',
  '제주은행',
  '수협은행',
  '새마을금고',
  '우체국',
]

const roadAddressSamples = [
  '서울특별시 강남구 테헤란로 152',
  '서울특별시 강남구 봉은사로 201',
  '서울특별시 송파구 올림픽로 300',
  '서울특별시 마포구 월드컵북로 396',
  '경기도 성남시 분당구 판교역로 235',
  '경기도 수원시 영통구 광교중앙로 140',
  '부산광역시 해운대구 센텀중앙로 97',
  '대구광역시 수성구 동대구로 95',
  '인천광역시 연수구 컨벤시아대로 165',
  '광주광역시 서구 상무중앙로 110',
  '서울특별시 성북구 안암로 145',
  '서울특별시 종로구 안국동길 41',
  '서울특별시 중구 안중근로 40',
  '부산광역시 금정구 안뜰로 18',
  '대전광역시 동구 안골로 27',
  '울산광역시 남구 안심로 52',
  '경기도 고양시 덕양구 안골로 88',
  '경기도 용인시 처인구 안말로 12',
  '경기도 용인시 기흥구 안말로 27',
  '경기도 의왕시 안말로 44',
  '경기도 남양주시 안말로58번길 9',
  '경기도 파주시 안말길 33',
  '강원특별자치도 춘천시 안마산로 61',
  '충청북도 청주시 상당구 안덕벌로 73',
  '충청남도 천안시 동남구 안서로 120',
  '전북특별자치도 전주시 덕진구 안덕원로 29',
  '전라남도 순천시 안풍길 17',
  '경상북도 포항시 북구 안심길 14',
  '경상남도 창원시 성산구 안민로 203',
  '제주특별자치도 제주시 안덕면 화순로 88',
]

type ModalType = 'login' | 'signup' | 'payment' | null

const initialSignupForm = {
  userId: '',
  email: '',
  password: '',
  passwordConfirm: '',
  name: '',
  phone: '',
  verificationCode: '',
}

const initialPaymentForm = {
  bank: bankBrands[0],
  cardNumber: '',
  expiry: '',
  cvc: '',
  addressSearch: '',
  address: '',
}

const idPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{9,}$/
const phonePattern = /^010\d{8}$/
const showDevVerificationCode = process.env.NEXT_PUBLIC_DEV_SHOW_SIGNUP_CODE === 'true'

const getRoadName = (address: string) => {
  const parts = address.split(' ')
  return parts[2] ?? parts[parts.length - 2] ?? address
}

export default function HeaderActions() {
  const {
    currentUser,
    registeredUsers,
    paymentMethods,
    sessionNotice,
    login,
    logout,
    registerUser,
    savePaymentMethod,
  } = useSession()
  const [modalType, setModalType] = useState<ModalType>(null)
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupForm, setSignupForm] = useState(initialSignupForm)
  const [signupError, setSignupError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [generatedCode, setGeneratedCode] = useState('')
  const [signupComplete, setSignupComplete] = useState(false)
  const [paymentForm, setPaymentForm] = useState(initialPaymentForm)

  const addressSuggestions = useMemo(() => {
    const query = paymentForm.addressSearch.trim()
    if (!query) return []

    const normalizedQuery = query.toLowerCase()
    const startsWithRoad = roadAddressSamples.filter((address) =>
      getRoadName(address).toLowerCase().startsWith(normalizedQuery)
    )
    const startsWithFull = roadAddressSamples.filter((address) => address.toLowerCase().startsWith(normalizedQuery))
    const includesRoad = roadAddressSamples.filter((address) =>
      getRoadName(address).toLowerCase().includes(normalizedQuery)
    )
    const includesFull = roadAddressSamples.filter((address) => address.toLowerCase().includes(normalizedQuery))

    return [...startsWithRoad, ...startsWithFull, ...includesRoad, ...includesFull]
      .filter((address, index, array) => array.indexOf(address) === index)
      .slice(0, 20)
  }, [paymentForm.addressSearch])

  const closeModal = () => {
    setModalType(null)
    setSignupForm(initialSignupForm)
    setSignupError('')
    setVerificationSent(false)
    setGeneratedCode('')
    setSignupComplete(false)
  }

  const submitLogin = () => {
    const isLoggedIn = login(loginId.trim(), loginPassword)
    if (isLoggedIn) {
      setLoginId('')
      setLoginPassword('')
      setModalType(null)
    }
  }

  const validateSignupForm = () => {
    if (!idPattern.test(signupForm.userId)) {
      return '아이디는 영문과 숫자를 모두 포함하고 9자리 이상이어야 합니다.'
    }

    if (!emailPattern.test(signupForm.email)) {
      return '이메일 형식을 정확히 입력해 주세요.'
    }

    if (!passwordPattern.test(signupForm.password)) {
      return '비밀번호는 영문과 숫자를 모두 포함하고 9자리 이상이어야 합니다.'
    }

    if (signupForm.password.includes(signupForm.userId) || signupForm.password === signupForm.userId) {
      return '비밀번호는 아이디와 중복되거나 포함되면 안 됩니다.'
    }

    if (signupForm.passwordConfirm !== signupForm.password) {
      return '비밀번호 확인이 일치하지 않습니다.'
    }

    if (signupForm.name.trim().length < 1) {
      return '이름은 한 글자 이상 입력해야 합니다.'
    }

    if (!phonePattern.test(signupForm.phone)) {
      return '휴대폰 번호는 010으로 시작하고 뒤에 8자리를 입력해야 합니다.'
    }

    if (registeredUsers.some((user) => user.userId === signupForm.userId)) {
      return '이미 사용 중인 아이디입니다.'
    }

    if (registeredUsers.some((user) => user.email === signupForm.email)) {
      return '이미 가입된 이메일입니다.'
    }

    if (registeredUsers.some((user) => user.phone === signupForm.phone)) {
      return '이미 가입된 휴대폰 번호입니다.'
    }

    return ''
  }

  const submitSignup = () => {
    const validationMessage = validateSignupForm()
    if (validationMessage) {
      setSignupError(validationMessage)
      return
    }

    setSignupError(
      '보안을 위해 인증번호는 페이지에 표시하지 않습니다. 실제 문자 발송과 실사용 휴대폰/이메일 존재 확인은 SMS/이메일 인증 서비스 연동이 필요합니다.'
    )
    setGeneratedCode(String(Math.floor(100000 + Math.random() * 900000)))
    setVerificationSent(true)
  }

  const verifySignup = async () => {
    if (!verificationSent) {
      setSignupError('먼저 인증문자를 요청해 주세요.')
      return
    }

    if (!signupForm.verificationCode.trim()) {
      setSignupError('문자로 받은 인증번호를 입력해 주세요.')
      return
    }

    if (signupForm.verificationCode !== generatedCode) {
      setSignupError('인증번호가 일치하지 않습니다.')
      return
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: signupForm.userId,
          email: signupForm.email,
          password: signupForm.password,
          passwordConfirm: signupForm.passwordConfirm,
          name: signupForm.name,
          phone: signupForm.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setSignupError(data.message ?? '회원가입 저장에 실패했습니다.')
        return
      }

      registerUser({
        userId: signupForm.userId,
        email: signupForm.email,
        password: signupForm.password,
        name: signupForm.name,
        nickname: signupForm.userId,
        phone: signupForm.phone,
      })
      setSignupComplete(true)
      setSignupForm(initialSignupForm)
      setGeneratedCode('')
      setVerificationSent(false)
      setSignupError('')
    } catch {
      setSignupError('회원가입 저장 중 오류가 발생했습니다.')
    }
  }

  const submitPayment = async () => {
    if (!paymentForm.cardNumber || !paymentForm.expiry || !paymentForm.cvc || !paymentForm.address) {
      return
    }

    if (!currentUser) {
      return
    }

    try {
      const response = await fetch('/api/account/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.userId,
          bank: paymentForm.bank,
          cardNumber: paymentForm.cardNumber,
          expiry: paymentForm.expiry,
          cvc: paymentForm.cvc,
          address: paymentForm.address,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        return
      }

      savePaymentMethod({
        bank: data.paymentMethod?.bank ?? paymentForm.bank,
        cardNumber: data.paymentMethod?.cardNumber ?? paymentForm.cardNumber,
        expiry: data.paymentMethod?.expiry ?? paymentForm.expiry,
        cvc: data.paymentMethod?.cvc ?? paymentForm.cvc,
        address: data.paymentMethod?.address ?? paymentForm.address,
      })
      setPaymentForm(initialPaymentForm)
      setModalType(null)
    } catch {
      return
    }
  }

  return (
    <>
      <header className="flex flex-col gap-4 rounded-[1.8rem] border border-[#e2d5c5] bg-white/70 px-5 py-4 shadow-[0_16px_40px_rgba(74,56,31,0.08)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b08858]">Member Service</p>
          <p className="mt-2 text-sm text-[#756554]">
            로그인, 회원가입, 결제수단 등록을 이 영역에서 바로 진행할 수 있습니다.
          </p>
          {sessionNotice && <p className="mt-2 text-sm font-medium text-[#8a6238]">{sessionNotice}</p>}
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setModalType('payment')}
            className="rounded-full border border-[#ddc7aa] bg-[#fff8ef] px-5 py-3 text-sm font-semibold text-[#6d4d2e] transition hover:bg-white"
          >
            결제수단 등록
          </button>

          {currentUser ? (
            <>
              <Link
                href="/mypage"
                className="rounded-full border border-[#d8c4a7] bg-[#fff8ef] px-5 py-3 text-sm font-semibold text-[#6d4d2e] transition hover:bg-white"
              >
                나의페이지
              </Link>
              <div className="rounded-full border border-[#e1d3c1] bg-white px-5 py-3 text-sm font-bold text-[#2f241d]">
                로그인
                <span className="ml-2 text-[#8d6237]">{currentUser.nickname}</span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-full bg-[#2f241d] px-5 py-3 text-sm font-bold text-[#f8f1e7] transition hover:bg-[#47362b]"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setModalType('login')}
                className="rounded-full border border-[#e1d3c1] bg-white px-5 py-3 text-sm font-semibold text-[#2f241d] transition hover:bg-[#fff8ef]"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => setModalType('signup')}
                className="rounded-full bg-[#2f241d] px-5 py-3 text-sm font-bold text-[#f8f1e7] transition hover:bg-[#47362b]"
              >
                회원가입
              </button>
            </>
          )}
        </div>
      </header>

      {modalType && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#120d09]/40 px-4 py-6 backdrop-blur-sm">
          <div className="flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-[#e3d6c6] bg-[linear-gradient(180deg,_#fffdfa,_#f5ede3)] shadow-[0_30px_80px_rgba(59,43,21,0.24)]">
            <div className="flex items-center justify-between gap-4 border-b border-[#eadfce] px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#b08858]">Member Modal</p>
                <h2 className="mt-2 text-2xl font-black text-[#241f1a]">
                  {modalType === 'login' && '로그인'}
                  {modalType === 'signup' && '회원가입'}
                  {modalType === 'payment' && '결제수단 및 주소 등록'}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-[#ddc7aa] px-4 py-2 text-sm font-semibold text-[#6d4d2e]"
              >
                닫기
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6">
              {modalType === 'login' && (
                <div className="space-y-4">
                  <input
                    value={loginId}
                    onChange={(event) => setLoginId(event.target.value)}
                    placeholder="아이디 또는 이메일"
                    className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                  />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(event) => setLoginPassword(event.target.value)}
                    placeholder="비밀번호"
                    className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                  />
                  <button
                    type="button"
                    onClick={submitLogin}
                    className="w-full rounded-[1rem] bg-[#2f241d] px-5 py-4 text-base font-bold text-[#f8f1e7]"
                  >
                    아이디 이메일 로그인하기
                  </button>
                  <Link
                    href="/auth?type=forgetpass"
                    className="flex w-full items-center justify-center rounded-[1rem] border border-[#ccb093] bg-[#fff8ef] px-5 py-4 text-base font-bold text-[#6d4d2e]"
                  >
                    비밀번호 재설정
                  </Link>
                  {registeredUsers.length === 0 && (
                    <p className="text-sm text-[#8a775f]">아직 가입된 회원이 없어서 먼저 회원가입을 진행해야 합니다.</p>
                  )}
                </div>
              )}

              {modalType === 'signup' && (
                <div className="space-y-4">
                  {signupComplete ? (
                    <div className="rounded-[1.3rem] border border-[#eadfce] bg-white/80 p-6 text-center">
                      <p className="text-lg font-black text-[#2f241d]">회원가입 완료</p>
                      <p className="mt-3 text-sm text-[#6f5d4b]">
                        휴대폰 인증이 끝나서 회원가입이 완료되었습니다. 로그인으로 이어서 사용할 수 있습니다.
                      </p>
                    </div>
                  ) : (
                    <>
                      <input
                        value={signupForm.userId}
                        onChange={(event) => setSignupForm((current) => ({ ...current, userId: event.target.value }))}
                        placeholder="아이디"
                        className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                      />
                      <input
                        value={signupForm.email}
                        onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                        placeholder="이메일"
                        className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                      />
                      <input
                        type="password"
                        value={signupForm.password}
                        onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                        placeholder="비밀번호"
                        className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                      />
                      <input
                        type="password"
                        value={signupForm.passwordConfirm}
                        onChange={(event) =>
                          setSignupForm((current) => ({ ...current, passwordConfirm: event.target.value }))
                        }
                        placeholder="비밀번호 확인"
                        className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                      />
                      <input
                        value={signupForm.name}
                        onChange={(event) => setSignupForm((current) => ({ ...current, name: event.target.value }))}
                        placeholder="이름"
                        className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                      />
                      <input
                        value={signupForm.phone}
                        onChange={(event) => setSignupForm((current) => ({ ...current, phone: event.target.value }))}
                        placeholder="휴대폰번호 예: 01012345678"
                        className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                      />
                      <div className="rounded-[1.2rem] border border-[#eadfce] bg-white/80 p-4 text-sm leading-7 text-[#6f5d4b]">
                        아이디: 영문/숫자 포함 9자리 이상
                        <br />
                        비밀번호: 아이디와 중복 불가, 영문/숫자 포함 9자리 이상
                        <br />
                        이름: 1글자 이상
                        <br />
                        휴대폰: `010`으로 시작하고 뒤에 8자리 입력
                      </div>
                      <button
                        type="button"
                        onClick={submitSignup}
                        className="w-full rounded-[1rem] bg-[#2f241d] px-5 py-4 text-base font-bold text-[#f8f1e7]"
                      >
                        회원가입
                      </button>

                      {signupError && (
                        <div className="rounded-[1rem] border border-[#e8d7c2] bg-[#fff7ef] px-4 py-3 text-sm text-[#7a5a39]">
                          {signupError}
                        </div>
                      )}

                      {verificationSent && (
                        <div className="rounded-[1.3rem] border border-[#eadfce] bg-white/80 p-5">
                          <p className="text-sm font-semibold text-[#8a6238]">문자로 받은 인증번호를 입력해 주세요.</p>
                          {showDevVerificationCode && (
                            <div className="mt-3 rounded-[1rem] border border-[#ecd7bc] bg-[#fff6ea] px-4 py-3 text-sm text-[#7a5a39]">
                              테스트용 표시 인증번호: <span className="font-black">{generatedCode}</span>
                            </div>
                          )}
                          <input
                            value={signupForm.verificationCode}
                            onChange={(event) =>
                              setSignupForm((current) => ({ ...current, verificationCode: event.target.value }))
                            }
                            placeholder="인증번호 6자리 입력"
                            className="mt-4 w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                          />
                          <button
                            type="button"
                            onClick={verifySignup}
                            className="mt-4 w-full rounded-[1rem] border border-[#ccb093] bg-[#fff8ef] px-5 py-4 text-base font-bold text-[#6d4d2e]"
                          >
                            인증 후 회원가입 완료
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {modalType === 'payment' && (
                <div className="space-y-4">
                  <select
                    value={paymentForm.bank}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, bank: event.target.value }))}
                    className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                  >
                    {bankBrands.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  <input
                    value={paymentForm.cardNumber}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, cardNumber: event.target.value }))}
                    placeholder="카드번호 16자리"
                    className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <input
                      value={paymentForm.expiry}
                      onChange={(event) => setPaymentForm((current) => ({ ...current, expiry: event.target.value }))}
                      placeholder="사용기한 00/00"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    <input
                      value={paymentForm.cvc}
                      onChange={(event) => setPaymentForm((current) => ({ ...current, cvc: event.target.value }))}
                      placeholder="CVC 번호"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                  </div>
                  <div className="rounded-[1.3rem] border border-[#eadfce] bg-white/80 p-4">
                    <input
                      value={paymentForm.addressSearch}
                      onChange={(event) =>
                        setPaymentForm((current) => ({ ...current, addressSearch: event.target.value }))
                      }
                      placeholder="도로명 주소 검색"
                      className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                    />
                    {addressSuggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {addressSuggestions.map((address) => (
                          <button
                            key={address}
                            type="button"
                            onClick={() =>
                              setPaymentForm((current) => ({ ...current, addressSearch: address, address }))
                            }
                            className="block w-full rounded-[1rem] border border-[#e7d8c7] bg-[#fff9f1] px-4 py-3 text-left text-sm text-[#5f4d3d]"
                          >
                            {address}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <textarea
                    value={paymentForm.address}
                    onChange={(event) => setPaymentForm((current) => ({ ...current, address: event.target.value }))}
                    placeholder="직접 입력 또는 검색한 주소 선택"
                    rows={3}
                    className="w-full rounded-[1rem] border border-[#dfd1bf] bg-white px-4 py-3 text-sm outline-none focus:border-[#b98d5a]"
                  />
                  <button
                    type="button"
                    onClick={submitPayment}
                    className="w-full rounded-[1rem] bg-[#2f241d] px-5 py-4 text-base font-bold text-[#f8f1e7]"
                  >
                    결제수단 저장
                  </button>
                  {paymentMethods.length > 0 && (
                    <div className="rounded-[1.3rem] border border-[#eadfce] bg-white/80 p-4 text-sm text-[#6b5947]">
                      최근 등록: {paymentMethods[paymentMethods.length - 1].bank} /{' '}
                      {paymentMethods[paymentMethods.length - 1].cardNumber}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
