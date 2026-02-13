import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Product } from "@/types/product";

interface MoveProductFilterProps {
  products: Product[];
  selectedProductId?: string;
  isLoading: boolean;
  onChange: (productId?: string) => void;
}

export function MoveProductFilter({
  products,
  selectedProductId,
  isLoading,
  onChange,
}: MoveProductFilterProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Filtrar por produto</p>
      <Select
        value={selectedProductId ?? "all"}
        onValueChange={(value) => onChange(value === "all" ? undefined : value)}
        disabled={isLoading}
      >
        <SelectTrigger className="w-full sm:max-w-sm">
          <SelectValue placeholder="Todos os produtos" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os produtos</SelectItem>
          {products.map((product) => (
            <SelectItem key={product.id} value={product.id}>
              {product.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
