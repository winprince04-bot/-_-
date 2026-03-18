import { NextRequest, NextResponse } from 'next/server'

import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, bank, cardNumber, expiry, cvc, address } = body

    if (!userId || !bank || !cardNumber || !expiry || !cvc || !address) {
      return NextResponse.json({ message: '결제수단과 주소 정보를 모두 입력해 주세요.' }, { status: 400 })
    }

    await dbConnect()

    const updatedUser = await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          paymentMethod: {
            bank,
            cardNumber,
            expiry,
            cvc,
            address,
          },
        },
      },
      { new: true }
    ).lean()

    if (!updatedUser) {
      return NextResponse.json({ message: '해당 회원을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: '결제수단과 주소 정보가 MongoDB에 저장되었습니다.',
        paymentMethod: updatedUser.paymentMethod,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('PAYMENT_API_ERROR', error)
    return NextResponse.json({ message: '결제수단 저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
