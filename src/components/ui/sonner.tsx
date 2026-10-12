import { useTheme } from "next-themes";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * The one toast system. Bottom-centre, a compact paper/graphite strip with the action on the
 * right ("Undo"), and success/error shown by a small coloured edge rather than loud fills.
 */
const Toaster = ({ ...props }: ToasterProps) => {
  const { resolvedTheme = "dark" } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme as ToasterProps["theme"]}
      position="bottom-center"
      offset={24}
      visibleToasts={3}
      toastOptions={{
        classNames: {
          toast:
            "group toast !rounded-lg !border !border-border !bg-popover !font-sans !text-sm !text-popover-foreground !shadow-float data-[type=success]:!border-l-[3px] data-[type=success]:!border-l-success data-[type=error]:!border-l-[3px] data-[type=error]:!border-l-destructive",
          title: "!font-semibold",
          description: "!text-muted-foreground",
          actionButton: "!rounded-md !bg-foreground !px-3 !font-semibold !text-background",
          cancelButton: "!rounded-md !bg-surface-3 !text-foreground",
          closeButton: "!border-border !bg-popover !text-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
