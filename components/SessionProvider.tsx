'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

import { flashSaleProducts } from '@/data/products'

export type RegisteredUser = {
  userId: string
  email: string
  password: string
  name: string
  nickname: string
  phone: string
}

export type PaymentMethod = {
  ownerUserId: string
  bank: string
  cardNumber: string
  expiry: string
  cvc: string
  address: string
}

export type OrderItem = {
  id: string
  ownerUserId: string
  orderedAt: string
  productName: string
  category: string
  amount: string
  quantity: number
  paymentMethod: string
  address: string
}

type SessionContextValue = {
  currentUser: RegisteredUser | null
  registeredUsers: RegisteredUser[]
  paymentMethods: PaymentMethod[]
  currentUserPaymentMethods: PaymentMethod[]
  orders: OrderItem[]
  currentUserOrders: OrderItem[]
  sessionNotice: string
  login: (identifier: string, password: string) => boolean
  logout: () => void
  registerUser: (user: RegisteredUser) => void
  savePaymentMethod: (method: Omit<PaymentMethod, 'ownerUserId'>) => void
  updateCurrentUserProfile: (updates: Partial<RegisteredUser>) => void
  updateCurrentUserPayment: (updates: Partial<Omit<PaymentMethod, 'ownerUserId'>>) => void
  recordActivity: (activity: 'cart' | 'purchase') => void
}

const SessionContext = createContext<SessionContextValue | null>(null)
const AUTO_LOGOUT_MS = 10 * 60 * 1000

const createMockOrders = (ownerUserId: string): OrderItem[] =>
  flashSaleProducts.slice(0, 6).map((product, index) => ({
    id: `${ownerUserId}-order-${index + 1}`,
    ownerUserId,
    orderedAt: new Date(2026, 2, 18 - index * 3, 10 + index, 15).toISOString(),
    productName: product.name,
    category: product.category,
    amount: product.salePrice,
    quantity: (index % 2) + 1,
    paymentMethod: index % 2 === 0 ? '신한은행 / 1234' : '카카오뱅크 / 4321',
    address: '서울특별시 성북구 안암로 145',
  }))

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([])
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [lastActivityAt, setLastActivityAt] = useState<number | null>(null)
  const [sessionNotice, setSessionNotice] = useState('')

  useEffect(() => {
    if (!currentUser || !lastActivityAt) return

    const remainingTime = AUTO_LOGOUT_MS - (Date.now() - lastActivityAt)
    if (remainingTime <= 0) {
      setCurrentUser(null)
      setLastActivityAt(null)
      setSessionNotice('장바구니 또는 구매 활동이 10분간 없어 자동 로그아웃되었습니다.')
      return
    }

    const timeout = window.setTimeout(() => {
      setCurrentUser(null)
      setLastActivityAt(null)
      setSessionNotice('장바구니 또는 구매 활동이 10분간 없어 자동 로그아웃되었습니다.')
    }, remainingTime)

    return () => window.clearTimeout(timeout)
  }, [currentUser, lastActivityAt])

  const currentUserPaymentMethods = useMemo(
    () => paymentMethods.filter((method) => method.ownerUserId === currentUser?.userId),
    [currentUser?.userId, paymentMethods]
  )

  const currentUserOrders = useMemo(
    () => orders.filter((order) => order.ownerUserId === currentUser?.userId),
    [currentUser?.userId, orders]
  )

  const value = useMemo<SessionContextValue>(
    () => ({
      currentUser,
      registeredUsers,
      paymentMethods,
      currentUserPaymentMethods,
      orders,
      currentUserOrders,
      sessionNotice,
      login: (identifier, password) => {
        const matchedUser = registeredUsers.find(
          (user) => (user.userId === identifier || user.email === identifier) && user.password === password
        )

        if (!matchedUser) {
          setSessionNotice('아이디, 이메일 또는 비밀번호를 다시 확인해 주세요.')
          return false
        }

        setCurrentUser(matchedUser)
        setLastActivityAt(Date.now())
        if (!orders.some((order) => order.ownerUserId === matchedUser.userId)) {
          setOrders((current) => [...current, ...createMockOrders(matchedUser.userId)])
        }
        return true
      },
      logout: () => {
        setCurrentUser(null)
        setLastActivityAt(null)
        setSessionNotice('로그아웃되었습니다.')
      },
      registerUser: (user) => {
        setRegisteredUsers((current) => [...current, user])
        setOrders((current) => [...current, ...createMockOrders(user.userId)])
        setSessionNotice('휴대폰 인증이 완료되어 회원가입이 완료되었습니다.')
      },
      savePaymentMethod: (method) => {
        if (!currentUser) {
          setSessionNotice('로그인 후 결제수단을 등록해 주세요.')
          return
        }

        setPaymentMethods((current) => [...current, { ...method, ownerUserId: currentUser.userId }])
        setSessionNotice('결제수단과 주소가 등록되었습니다.')
      },
      updateCurrentUserProfile: (updates) => {
        if (!currentUser) return

        const updatedUser = { ...currentUser, ...updates }
        setCurrentUser(updatedUser)
        setRegisteredUsers((current) =>
          current.map((user) => (user.userId === currentUser.userId ? updatedUser : user))
        )
        setSessionNotice('회원정보가 수정되었습니다.')
      },
      updateCurrentUserPayment: (updates) => {
        if (!currentUser) return

        const existingMethod = paymentMethods.find((method) => method.ownerUserId === currentUser.userId)

        if (existingMethod) {
          setPaymentMethods((current) =>
            current.map((method) =>
              method.ownerUserId === currentUser.userId
                ? { ...method, ...updates, ownerUserId: currentUser.userId }
                : method
            )
          )
        } else {
          setPaymentMethods((current) => [
            ...current,
            {
              ownerUserId: currentUser.userId,
              bank: updates.bank ?? '미등록',
              cardNumber: updates.cardNumber ?? '',
              expiry: updates.expiry ?? '',
              cvc: updates.cvc ?? '',
              address: updates.address ?? '',
            },
          ])
        }

        setSessionNotice('주소 또는 결제수단 정보가 수정되었습니다.')
      },
      recordActivity: (activity) => {
        if (!currentUser) {
          setSessionNotice('로그인 후 이용해 주세요.')
          return
        }

        setLastActivityAt(Date.now())
        setSessionNotice(activity === 'cart' ? '장바구니 활동이 기록되었습니다.' : '구매 활동이 기록되었습니다.')
      },
    }),
    [currentUser, currentUserOrders, currentUserPaymentMethods, orders, paymentMethods, registeredUsers, sessionNotice]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export const useSession = () => {
  const context = useContext(SessionContext)

  if (!context) {
    throw new Error('useSession must be used within SessionProvider')
  }

  return context
}
