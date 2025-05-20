import { Body, Heading, Link, Tailwind, Text } from '@react-email/components'
import { Html } from '@react-email/html'
import * as React from 'react'

interface ResetPasswordTemplateProps {
  domain: string
  code: string
}

export function ResetPasswordTemplate({ domain, code }: ResetPasswordTemplateProps) {
  const resetLink = `${domain}/auth/reset-password?code=${code}`

  return (
    <Tailwind>
      <Html>
        <Body className='text-black'>
          <Heading>Сброс пароля</Heading>
          <Text>
            Привет! Ты запросил сброс пароля. Пожалуйста, перейди по следующей ссылке, чтобы
            создать новый пароль:
          </Text>
          <Link href={resetLink}>Сбросить пароль</Link>
          <Text>
            Эта ссылка действительна в течение 15 минут. Если ты не запрашивал сброс пароля,
            просто проигнорируй это сообщение.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  )
}
