import type { UnitType } from "@/types/product";

export function formatCurrency(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

export function centavosToReais(centavos: number): number {
  return centavos / 100;
}

export function reaisToCentavos(reais: number): number {
  return Math.round(reais * 100);
}

export function formatQuantity(quantity: string): string {
  const num = Number.parseFloat(quantity);
  if (Number.isNaN(num)) {
    return "0";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

export const unitTypeLabels: Record<UnitType, string> = {
  kg: "Quilograma (kg)",
  g: "Grama (g)",
  l: "Litro (l)",
  ml: "Mililitro (ml)",
  un: "Unidade (un)",
};

export const unitTypeShortLabels: Record<UnitType, string> = {
  kg: "kg",
  g: "g",
  l: "L",
  ml: "mL",
  un: "un",
};

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}
