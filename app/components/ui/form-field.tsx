import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface FormFieldProps extends React.ComponentProps<"input"> {
  label: string;
  error?: string;
  hint?: string;
}

const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
    
    return (
      <div className={cn("space-y-1.5", className)}>
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-foreground"
        >
          {label}
        </label>
        <Input
          id={inputId}
          ref={ref}
          className={cn(
            error && "border-destructive focus-visible:ring-destructive/20 focus-visible:border-destructive"
          )}
          {...props}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
        {hint && !error && (
          <p className="text-sm text-muted-foreground">{hint}</p>
        )}
      </div>
    );
  }
);
FormField.displayName = "FormField";

export { FormField };
