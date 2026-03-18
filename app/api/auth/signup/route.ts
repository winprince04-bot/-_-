import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

const idPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{9,}$/
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{9,}$/
const phonePattern = /^010\d{8}$/

const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, email, password, passwordConfirm, name, phone } = body

    if (!userId || !email || !password || !passwordConfirm || !name || !phone) {
      return NextResponse.json({ message: '필수 항목을 모두 입력해 주세요.' }, { status: 400 })
    }

    if (!idPattern.test(userId)) {
      return NextResponse.json(
        { message: '아이디는 영문과 숫자를 모두 포함하고 9자리 이상이어야 합니다.' },
        { status: 400 }
      )
    }

    if (!emailPattern.test(email)) {
      return NextResponse.json({ message: '올바른 이메일 형식을 입력해 주세요.' }, { status: 400 })
    }

    if (!passwordPattern.test(password) || password.includes(userId)) {
      return NextResponse.json(
        { message: '비밀번호는 영문/숫자를 포함한 9자리 이상이며 아이디를 포함하면 안 됩니다.' },
        { status: 400 }
      )
    }

    if (password !== passwordConfirm) {
      return NextResponse.json({ message: '비밀번호 확인이 일치하지 않습니다.' }, { status: 400 })
    }

    if (!name.trim()) {
      return NextResponse.json({ message: '이름은 한 글자 이상 입력해야 합니다.' }, { status: 400 })
    }

    if (!phonePattern.test(phone)) {
      return NextResponse.json(
        { message: '휴대폰 번호는 010으로 시작하고 뒤에 8자리를 입력해야 합니다.' },
        { status: 400 }
      )
    }

    await dbConnect()

    const existingUser = await User.findOne({
      $or: [{ userId }, { email }, { phone }],
    }).lean()

    if (existingUser) {
      return NextResponse.json({ message: '이미 가입된 아이디, 이메일 또는 휴대폰 번호입니다.' }, { status: 409 })
    }

    const createdUser = await User.create({
      userId,
      email,
      passwordHash: hashPassword(password),
      name,
      phone,
      paymentMethod: {
        bank: '',
        cardNumber: '',
        expiry: '',
        cvc: '',
        address: '',
      },
    })

    return NextResponse.json(
      {
        message: '회원가입 정보가 MongoDB에 저장되었습니다.',
        user: {
          id: createdUser._id,
          userId: createdUser.userId,
          email: createdUser.email,
          name: createdUser.name,
          phone: createdUser.phone,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('SIGNUP_API_ERROR', error)
    return NextResponse.json({ message: '회원가입 저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
