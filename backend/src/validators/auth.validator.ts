import { z } from "zod";

export const authLoginSchema = z.object({
  email: z.email("E-mail inválido"),
  password: z.string().min(6, "Senha precisa ter no minimo 6 caracteres"),
});
