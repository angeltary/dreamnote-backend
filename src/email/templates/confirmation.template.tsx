import { Body, Heading, Link, Tailwind, Text } from '@react-email/components'
import { Html } from '@react-email/html'
import * as React from 'react'

interface ConfirmationTemplateProps {
  domain: string
  code: string
}

export function ConfirmationTemplate({ domain, code }: ConfirmationTemplateProps) {
  const confirmLink = `${domain}/auth/verify?code=${code}`

  return (
    <Tailwind>
      <Html>
        <Body className='text-black'>
          <Heading>Подтверждение почты</Heading>
          <Text>
            Привет! Чтобы подтвердить свой адрес электронной почты, пожалуйста, перейди по
            следующей ссылке:
          </Text>
          <Link href={confirmLink}>Подтвердить почту</Link>
          <Text>
            Эта ссылка действительна в течение 15 минут. Если ты не запрашивал подтверждение,
            просто проигнорируй это сообщение.
          </Text>
        </Body>
      </Html>
    </Tailwind>
  )
}
