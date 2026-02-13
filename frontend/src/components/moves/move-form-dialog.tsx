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
import type { MoveType } from "@/types/move";
import type { Product } from "@/types/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { z } from "zod";

const MOVE_TYPE_OPTIONS: MoveType[] = ["in", "out"];

const moveFormSchema = z.object({
  productId: z.string().uuid("Selecione um produto valido."),
  type: z.enum(MOVE_TYPE_OPTIONS),
  quantity: z.number().positive("Quantidade deve ser maior que zero."),
  unitPriceReais: z.number().min(0, "Preco nao pode ser negativo.").optional(),
});

export type MoveFormValues = z.infer<typeof moveFormSchema>;

interface MoveFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  productsLoading: boolean;
  productsError: unknown;
  isSubmitting: boolean;
  onSubmit: (values: MoveFormValues) => Promise<void>;
}

const defaultMoveFormValues: MoveFormValues = {
  productId: "",
  type: "in",
  quantity: 1,
  unitPriceReais: undefined,
};

const getErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export function MoveFormDialog({
  open,
  onOpenChange,
  products,
  productsLoading,
  productsError,
  isSubmitting,
  onSubmit,
}: MoveFormDialogProps) {
  const form = useForm<MoveFormValues>({
    resolver: zodResolver(moveFormSchema),
    defaultValues: defaultMoveFormValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    form.reset({
      ...defaultMoveFormValues,
      productId: products[0]?.id ?? "",
    });
  }, [form, open, products]);

  const isSubmitDisabled =
    isSubmitting || productsLoading || Boolean(productsError) || products.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Nova movimentacao</DialogTitle>
          <DialogDescription>
            Registre entrada ou saida de estoque para um produto.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => void onSubmit(values))}
        >
          <div className="space-y-2">
            <Label htmlFor="move-product">Produto</Label>
            <Controller
              control={form.control}
              name="productId"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={field.onChange}
                  disabled={productsLoading || Boolean(productsError)}
                >
                  <SelectTrigger id="move-product" className="w-full">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.productId?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.productId.message}
              </p>
            ) : null}
            {productsLoading ? (
              <p className="text-muted-foreground text-xs">
                Carregando produtos...
              </p>
            ) : null}
            {productsError ? (
              <p className="text-xs text-red-600">
                {getErrorMessage(
                  productsError,
                  "Nao foi possivel carregar produtos."
                )}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="move-type">Tipo</Label>
              <Controller
                control={form.control}
                name="type"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="move-type" className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Entrada</SelectItem>
                      <SelectItem value="out">Saida</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="move-quantity">Quantidade</Label>
              <Input
                id="move-quantity"
                type="number"
                step="0.01"
                min="0.01"
                {...form.register("quantity", { valueAsNumber: true })}
              />
              {form.formState.errors.quantity?.message ? (
                <p className="text-sm text-red-600">
                  {form.formState.errors.quantity.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="move-unit-price">Preco unitario (R$) - opcional</Label>
            <Input
              id="move-unit-price"
              type="number"
              step="0.01"
              min="0"
              placeholder="Deixe em branco para usar o preco atual do produto"
              {...form.register("unitPriceReais", {
                setValueAs: (value) => {
                  if (value === "" || value === undefined || value === null) {
                    return undefined;
                  }

                  const parsed = Number(value);
                  return Number.isFinite(parsed) ? parsed : undefined;
                },
              })}
            />
            {form.formState.errors.unitPriceReais?.message ? (
              <p className="text-sm text-red-600">
                {form.formState.errors.unitPriceReais.message}
              </p>
            ) : (
              <p className="text-muted-foreground text-xs">
                Se vazio, o backend usa o preco unitario atual do produto.
              </p>
            )}
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
              {isSubmitting ? "Registrando..." : "Registrar movimentacao"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
