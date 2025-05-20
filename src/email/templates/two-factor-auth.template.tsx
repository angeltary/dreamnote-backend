import {
	Body,
	Heading,
	Tailwind,
	Text
} from '@react-email/components';
import { Html } from '@react-email/html';
import * as React from 'react';

interface TwoFactorAuthTemplateProps {
	code: string;
}

export function TwoFactorAuthTemplate({ code }: TwoFactorAuthTemplateProps) {
	return (
		<Tailwind>
			<Html>
				<Body className='text-black'>
					<Heading>Двухфакторная аутентификация</Heading>
					<Text>Ваш код двухфакторной аутентификации: <strong>{code}</strong></Text>
					<Text>
						Пожалуйста, введите этот код в приложении для завершения процесса аутентификации.
					</Text>
					<Text>
						Если вы не запрашивали этот код, просто проигнорируйте это сообщение.
					</Text>
				</Body>
			</Html>
		</Tailwind>
	);
}
