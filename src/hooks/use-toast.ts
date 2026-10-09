import { toast as sonner } from "sonner";

/**
 * Compatibility adapter: the old Radix toast API on top of the single Sonner toaster.
 * New code should call `toast` from "sonner" directly; this exists until the last caller moves.
 */
interface LegacyToast {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

function toast({ title, description, variant }: LegacyToast) {
  const message = title ?? description ?? "";
  const opts = title && description ? { description } : undefined;
  return variant === "destructive" ? sonner.error(message, opts) : sonner(message, opts);
}

export function useToast() {
  return { toast };
}

export { toast };
