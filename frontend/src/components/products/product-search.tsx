import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function ProductSearch({ value, onChange }: ProductSearchProps) {
  return (
    <div className="space-y-2">
      <div className="relative max-w-md">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Buscar por nome do produto"
          className="pl-9"
        />
      </div>
      <p className="text-muted-foreground text-xs">
        A busca envia o filtro `name` apenas com 2 ou mais caracteres.
      </p>
    </div>
  );
}
