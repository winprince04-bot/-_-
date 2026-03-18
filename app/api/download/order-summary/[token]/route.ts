import { NextRequest } from 'next/server'

type Props = {
  params: {
    token: string
  }
}

export async function GET(_request: NextRequest, { params }: Props) {
  const issuedAt = new Date().toLocaleString('ko-KR')
  const svg = `
    <svg width="1200" height="1600" viewBox="0 0 1200 1600" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="1600" fill="#f6f1e8"/>
      <rect x="72" y="72" width="1056" height="1456" rx="36" fill="#fffdfa" stroke="#e5d7c6" stroke-width="4"/>
      <text x="120" y="180" fill="#b08858" font-size="28" font-family="Arial" font-weight="700">ORDER SUMMARY DOWNLOAD</text>
      <text x="120" y="250" fill="#241f1a" font-size="68" font-family="Arial" font-weight="800">주문 정리 이미지</text>
      <text x="120" y="320" fill="#6f5d4b" font-size="30" font-family="Arial">휴대폰에서 저장 가능한 이미지 형식의 주문 정리본입니다.</text>

      <rect x="120" y="390" width="960" height="180" rx="24" fill="#f7efe4"/>
      <text x="160" y="465" fill="#8b6035" font-size="24" font-family="Arial" font-weight="700">다운로드 토큰</text>
      <text x="160" y="525" fill="#241f1a" font-size="44" font-family="Arial" font-weight="800">${params.token}</text>

      <rect x="120" y="620" width="960" height="660" rx="28" fill="#fff" stroke="#eadfce" stroke-width="3"/>
      <text x="160" y="700" fill="#241f1a" font-size="40" font-family="Arial" font-weight="800">최근 결제 정리 안내</text>
      <text x="160" y="780" fill="#6b5947" font-size="28" font-family="Arial">1. 마이페이지에서 선택한 기간의 주문내역을 날짜순으로 정리했습니다.</text>
      <text x="160" y="840" fill="#6b5947" font-size="28" font-family="Arial">2. 카테고리별 주문도 함께 확인할 수 있도록 별도 표로 분류했습니다.</text>
      <text x="160" y="900" fill="#6b5947" font-size="28" font-family="Arial">3. 이 화면은 로컬 네트워크 테스트용 다운로드 이미지입니다.</text>
      <text x="160" y="1020" fill="#8b6035" font-size="24" font-family="Arial" font-weight="700">생성 시각</text>
      <text x="160" y="1080" fill="#241f1a" font-size="36" font-family="Arial" font-weight="700">${issuedAt}</text>
      <text x="160" y="1180" fill="#8b6035" font-size="24" font-family="Arial" font-weight="700">저장 방법</text>
      <text x="160" y="1240" fill="#6b5947" font-size="28" font-family="Arial">iPhone에서는 공유 버튼을 눌러 이미지 저장을 선택하면 됩니다.</text>

      <text x="120" y="1420" fill="#8b775f" font-size="24" font-family="Arial">Local Network Download Route</text>
    </svg>
  `.trim()

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Content-Disposition': `inline; filename="order-summary-${params.token}.svg"`,
      'Cache-Control': 'no-store',
    },
  })
}
