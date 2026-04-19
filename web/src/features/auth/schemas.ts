import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email({ message: '올바른 이메일 주소를 입력해주세요.' }),
  next: z.string().startsWith('/').optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
