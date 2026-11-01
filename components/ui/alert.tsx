import * as React from "react";
import { cn } from "@/lib/utils";

function Alert({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="alert" className={cn("relative w-full rounded-md border border-border bg-card p-4 text-sm", className)} {...props} />;
}

export { Alert };
