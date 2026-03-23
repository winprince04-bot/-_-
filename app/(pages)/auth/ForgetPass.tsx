'use client'

import { Gaitwise } from '@/public/svg'
import Image from 'next/image'
import { useState } from 'react'
import styled from 'styled-components'

const phonePattern = /^010\d{8}$/
const showDevVerificationCode = process.env.NEXT_PUBLIC_DEV_SHOW_SIGNUP_CODE === 'true'

export default function ForgetPassword() {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sentCode, setSentCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)

  const handleSendCode = () => {
    if (!email.trim()) {
      setMessage('가입한 이메일을 먼저 입력해 주세요.')
      return
    }

    if (!phonePattern.test(phone.trim())) {
      setMessage('전화번호는 010으로 시작하는 11자리 숫자로 입력해 주세요.')
      return
    }

    const nextCode = String(Math.floor(100000 + Math.random() * 900000))
    setSentCode(nextCode)
    setCodeSent(true)
    setMessage('전화번호 인증번호 6자리를 입력해 주세요.')
  }

  const handleResetPassword = async () => {
    if (!codeSent) {
      setMessage('먼저 인증번호 발송 버튼을 눌러 주세요.')
      return
    }

    if (verificationCode.trim() !== sentCode) {
      setMessage('인증번호 6자리가 일치하지 않습니다.')
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          phone: phone.trim(),
          newPassword: newPassword.trim(),
          newPasswordConfirm: newPasswordConfirm.trim(),
        }),
      })

      const data = await res.json()
      setMessage(data.message ?? '요청 처리 결과를 확인해 주세요.')

      if (res.ok) {
        setVerificationCode('')
        setNewPassword('')
        setNewPasswordConfirm('')
        setCodeSent(false)
        setSentCode('')
      }
    } catch {
      setMessage('비밀번호 재설정 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ForgetPasswordBox>
      <Image src={Gaitwise} alt="logo" width={100} height={100} layout="responsive" />
      <Title>비밀번호 재설정</Title>
      <Subtitle>이메일과 전화번호 인증 후 새 비밀번호로 변경할 수 있습니다.</Subtitle>

      <InputField type="email" placeholder="가입한 이메일" value={email} onChange={(e) => setEmail(e.target.value)} />

      <PhoneRow>
        <PhoneInput
          type="text"
          placeholder="전화번호 01012345678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <CodeButton type="button" onClick={handleSendCode}>
          인증번호 발송
        </CodeButton>
      </PhoneRow>

      {codeSent && showDevVerificationCode && (
        <DevCodeBox>
          테스트용 인증번호: <strong>{sentCode}</strong>
        </DevCodeBox>
      )}

      <InputField
        type="text"
        placeholder="인증번호 6자리"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value)}
      />
      <InputField
        type="password"
        placeholder="새 비밀번호 입력"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <InputField
        type="password"
        placeholder="새 비밀번호 확인"
        value={newPasswordConfirm}
        onChange={(e) => setNewPasswordConfirm(e.target.value)}
      />

      <SendCodeButton type="button" onClick={handleResetPassword} disabled={isSubmitting}>
        {isSubmitting ? '처리 중...' : '비밀번호 재설정'}
      </SendCodeButton>

      {message && <Message>{message}</Message>}
    </ForgetPasswordBox>
  )
}

const ForgetPasswordBox = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 380px;
`

const Title = styled.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
`

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
`

const PhoneRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  margin-bottom: 1rem;
`

const InputField = styled.input`
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f9f9f9;
`

const PhoneInput = styled(InputField)`
  margin-bottom: 0;
`

const CodeButton = styled.button`
  padding: 0.75rem 1rem;
  border: 1px solid #d8c4a7;
  border-radius: 8px;
  background: #fff8ef;
  color: #6d4d2e;
  font-weight: 700;
  cursor: pointer;
`

const SendCodeButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: #1a202c;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`

const DevCodeBox = styled.div`
  margin-bottom: 1rem;
  border: 1px solid #ecd7bc;
  border-radius: 10px;
  background: #fff6ea;
  padding: 0.9rem 1rem;
  color: #7a5a39;
  text-align: left;
`

const Message = styled.p`
  margin-top: 1rem;
  color: #7a5532;
  font-size: 0.95rem;
  line-height: 1.5;
`
