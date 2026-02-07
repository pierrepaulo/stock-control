import z from "zod";

export const dateRangeSchema = z.object({
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Data inválida")
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Data inválida")
    .optional(),
});
export type DateRangeInput = z.infer<typeof dateRangeSchema>;
