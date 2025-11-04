import { cn } from "@/lib & database connection/utils"

// Skeleton: placeholder loading beranimasi untuk konten yang belum siap.
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  )
}

export { Skeleton }
