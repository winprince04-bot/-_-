import crypto from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d).{9,}$/

const hashPassword = (password: string) => crypto.createHash('sha256').update(password).digest('hex')

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, phone, newPassword, newPasswordConfirm } = body

    if (!email || !phone || !newPassword || !newPasswordConfirm) {
      return NextResponse.json({ message: '이메일, 전화번호, 새 비밀번호를 모두 입력해 주세요.' }, { status: 400 })
    }

    if (!passwordPattern.test(newPassword)) {
      return NextResponse.json({ message: '비밀번호는 영문과 숫자를 포함한 9자리 이상이어야 합니다.' }, { status: 400 })
    }

    if (newPassword !== newPasswordConfirm) {
      return NextResponse.json({ message: '비밀번호 확인이 일치하지 않습니다.' }, { status: 400 })
    }

    await dbConnect()

    const updatedUser = await User.findOneAndUpdate(
      { email: email.trim(), phone: phone.trim() },
      {
        $set: {
          passwordHash: hashPassword(newPassword),
        },
      },
      { new: true }
    ).lean()

    if (!updatedUser) {
      return NextResponse.json({ message: '입력한 이메일과 전화번호의 회원을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json({ message: '비밀번호가 재설정되었습니다.' }, { status: 200 })
  } catch (error) {
    console.error('RESET_PASSWORD_API_ERROR', error)
    return NextResponse.json({ message: '비밀번호 재설정 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
