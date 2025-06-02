import { Body, Heading, Tailwind, Text } from '@react-email/components'
import { Html } from '@react-email/html'
import * as React from 'react'

interface ResetPasswordTemplateProps {
  code: string
}

export function ResetPasswordTemplate({ code }: ResetPasswordTemplateProps) {
  return (
    <Tailwind>
      <Html>
        <Body className='text-black'>
          <Heading>Сброс пароля</Heading>
          <Text>Привет! Ты запросил сброс пароля.</Text>
          <Text>
            Твой код для сброса пароля: <strong>{code}</strong>
          </Text>
        </Body>
      </Html>
    </Tailwind>
  )
}
