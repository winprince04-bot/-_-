import { NextRequest, NextResponse } from 'next/server'

import dbConnect from '@/db/dbConnect'
import User from '@/db/models/user'

type SellerProfilePayload = {
  companyName: string
  companyAddress: string
  contactNumber: string
  description: string
}

type UpdatedSellerResult = {
  sellerProfile?: SellerProfilePayload
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, companyName, companyAddress, contactNumber, description } = body

    if (!userId || !companyName || !companyAddress || !contactNumber) {
      return NextResponse.json({ message: '판매자 정보를 모두 입력해 주세요.' }, { status: 400 })
    }

    await dbConnect()

    const updatedUser = (await User.findOneAndUpdate(
      { userId },
      {
        $set: {
          sellerProfile: {
            companyName,
            companyAddress,
            contactNumber,
            description: description ?? '',
          },
        },
      },
      { new: true }
    ).lean()) as UpdatedSellerResult | null

    if (!updatedUser) {
      return NextResponse.json({ message: '해당 회원을 찾을 수 없습니다.' }, { status: 404 })
    }

    return NextResponse.json(
      {
        message: '판매자 정보가 MongoDB에 저장되었습니다.',
        sellerProfile: updatedUser.sellerProfile,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('SELLER_PROFILE_API_ERROR', error)
    return NextResponse.json({ message: '판매자 정보 저장 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
