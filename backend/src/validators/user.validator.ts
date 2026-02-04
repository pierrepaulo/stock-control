import z from "zod";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome é obrigatorio"),
  email: z.email("Formato de e-mail inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});
