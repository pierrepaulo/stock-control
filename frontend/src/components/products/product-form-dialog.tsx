"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { centavosToReais, unitTypeLabels } from "@/lib/format";
import type { Category } from "@/types/category";
import type { Product, UnitType } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";

const UNIT_TYPE_OPTIONS: UnitType[] = ["kg", "g", "l", "ml", "un"];

const productFormSchema = z
  .object({
    name: z.string().trim().min(2, "Nome precisa ter ao menos 2 caracteres."),
    categoryId: z.string().uuid("Selecione uma categoria valida."),
    unitPriceReais: z.number().min(0, "Preco nao pode ser negativo."),
    unitType: z.enum(UNIT_TYPE_OPTIONS),
    quantity: z.number().min(0, "Quantidade nao pode ser negativa."),
    minimumQuantity: z
      .number()
      .min(0, "Quantidade minima nao pode ser negativa."),
    maximumQuantity: z
      .number()
      .min(0, "Quantidade maxima nao pode ser negativa."),
  })
  .superRefine((data, context) => {
    if (data.maximumQuantity < data.minimumQuantity) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantidade maxima deve ser maior ou igual a minima.",
        path: ["maximumQuantity"],
      });
    }
  });

export type ProductFormValues = z.infer<typeof productFormSchema>;

const defaultProductValues: ProductFormValues = {
  name: "",
  categoryId: "",
  unitPriceReais: 0,
  unitType: "un",
  quantity: 0,
  minimumQuantity: 0,
  maximumQuantity: 0,
};

const parseNumericString = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingProduct: Product | null;
  categories: Category[];
  categoriesLoading: boolean;
  categoriesError: unknown;
  isSubmitting: boolean;
  isSubmitDisabled: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
  categories,
  categoriesLoading,
  categoriesError,
  isSubmitting,
  isSubmitDisabled,
  onSubmit,
}: ProductFormDialogProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultProductValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (editingProduct) {
      form.reset({
        name: editingProduct.name,
        categoryId: editingProduct.categoryId,
        unitPriceReais: centavosToReais(editingProduct.unitPrice),
        unitType: editingProduct.unitType,
        quantity: parseNumericString(editingProduct.quantity),
        minimumQuantity: parseNumericString(editingProduct.minimumQuantity),
        maximumQuantity: parseNumericString(editingProduct.maximumQuantity),
      });
      return;
    }

    form.reset(defaultProductValues);
  }, [editingProduct, form, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editingProduct ? "Editar produto" : "Novo produto"}</DialogTitle>
          <DialogDescription>
            {editingProduct
              ? "Atualize os dados do produto selecionado."
              : "Preencha os dados para cadastrar um novo produto."}
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="product-name">Nome</Label>
            <Input
              id="product-name"
              placeholder="Ex: Coca-Cola 2L"
              autoFocus
              {...form.register("name")}
            />
            {form.formState.errors.name?.message ? (
              <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-category">Categoria</Label>
              <Controller
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger id="product-category" className="w-full">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.categoryId?.message ? (
                <p className="text-sm text-red-600">{form.formState.errors.categoryId.message}</p>
              ) : null}
              {categoriesLoading ? (
                <p className="text-muted-foreground text-xs">Carregando categorias...</p>
              ) : null}
              {categoriesError ? (
                <p className="text-xs text-red-600">
                  {getErrorMessage(
                    categoriesError,
                    "Nao foi possivel carregar categorias."
                  )}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-unit-type">Tipo de unidade</Label>
              <Controller
                control={form.control}
                name="unitType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="product-unit-type" className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_TYPE_OPTIONS.map((unitType) => (
                        <SelectItem key={unitType} value={unitType}>
                          {unitTypeLabels[unitType]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.unitType?.message ? (
                <p className="text-sm text-red-600">{form.formState.errors.unitType.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-unit-price">Preco unitario (R$)</Label>
              <Input
                id="product-unit-price"
                type="number"
                step="0.01"
                min="0"
                {...form.register("unitPriceReais", { valueAsNumber: true })}
              />
              {form.formState.errors.unitPriceReais?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.unitPriceReais.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-quantity">Quantidade atual</Label>
              <Input
                id="product-quantity"
                type="number"
                step="0.01"
                min="0"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity?.message ? (
                <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product-minimum-quantity">Quantidade minima</Label>
              <Input
                id="product-minimum-quantity"
                type="number"
                step="0.01"
                min="0"
                {...form.register("minimumQuantity", { valueAsNumber: true })}
              />
              {form.formState.errors.minimumQuantity?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.minimumQuantity.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="product-maximum-quantity">Quantidade maxima</Label>
              <Input
                id="product-maximum-quantity"
                type="number"
                step="0.01"
                min="0"
                {...form.register("maximumQuantity", { valueAsNumber: true })}
              />
              {form.formState.errors.maximumQuantity?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.maximumQuantity.message}
                </p>
              ) : null}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isSubmitting
                ? editingProduct
                  ? "Salvando..."
                  : "Criando..."
                : editingProduct
                  ? "Salvar alteracoes"
                  : "Criar produto"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
