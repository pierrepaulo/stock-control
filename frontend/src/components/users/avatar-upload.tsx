"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ImagePlus, Trash2, UserRound } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/jpg"];

interface AvatarUploadProps {
  currentAvatar: string | null;
  value: File | null;
  disabled?: boolean;
  onChange: (file: File | null) => void;
}

const formatBytes = (bytes: number) => {
  const megaBytes = bytes / (1024 * 1024);
  return `${megaBytes.toFixed(1)} MB`;
};

export function AvatarUpload({
  currentAvatar,
  value,
  disabled = false,
  onChange,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);

  const previewUrl = useMemo(() => {
    if (!value) {
      return null;
    }

    return URL.createObjectURL(value);
  }, [value]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const resolvedPreview = previewUrl ?? currentAvatar ?? undefined;

  const handleInputClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (file: File | null) => {
    if (!file) {
      setLocalError(null);
      onChange(null);
      return;
    }

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError("Formato invalido. Envie JPEG ou PNG.");
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      setLocalError(
        `Arquivo muito grande (${formatBytes(file.size)}). Maximo permitido: 5 MB.`
      );
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      return;
    }

    setLocalError(null);
    onChange(file);
  };

  const handleRemove = () => {
    setLocalError(null);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Avatar size="lg">
          <AvatarImage src={resolvedPreview} alt="Preview do avatar" />
          <AvatarFallback>
            <UserRound className="size-4" />
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            className="hidden"
            disabled={disabled}
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              handleFileChange(selectedFile);
            }}
          />

          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={handleInputClick}
          >
            <ImagePlus className="size-4" />
            Selecionar avatar
          </Button>

          {value || currentAvatar ? (
            <Button
              type="button"
              variant="ghost"
              disabled={disabled}
              onClick={handleRemove}
            >
              <Trash2 className="size-4" />
              Remover
            </Button>
          ) : null}
        </div>
      </div>

      <p className="text-muted-foreground text-xs">
        Formatos aceitos: JPEG/PNG. Tamanho maximo: 5 MB.
      </p>

      {localError ? <p className="text-sm text-red-600">{localError}</p> : null}
    </div>
  );
}

