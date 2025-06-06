import { useEffect, type ReactNode } from "react";
import {
  useForm,
  FormProvider,
  type UseFormProps,
  type FieldValues,
  type DefaultValues,
  type UseFormReturn,
} from "react-hook-form";
import "./FormLayout.scss";

interface FormLayoutProps<T extends FieldValues> extends UseFormProps<T> {
  children: ((methods: UseFormReturn<T>) => ReactNode) | ReactNode;
  showsSubmitButton?: boolean;
  showsCancelButton?: boolean;
  submitText?: string;
  cancelText?: string;
  onSubmit?: (data: T) => void | Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  error?: string | null;
  mode?: "onChange" | "onBlur" | "onSubmit" | "onTouched" | "all";
  isOpen?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  description?: string;
  descriptionStyle?: React.CSSProperties;
  defaultValues?: DefaultValues<T>;
  enableBeforeUnloadProtection?: boolean;
}

function FormLayout<T extends FieldValues>({
  children,
  showsSubmitButton = true,
  showsCancelButton = false,
  submitText = "Submit",
  cancelText = "Cancel",
  onSubmit,
  onCancel,
  isLoading = false,
  error,
  mode = "onSubmit",
  isOpen = true,
  disabled = false,
  style,
  description,
  descriptionStyle,
  defaultValues,
  enableBeforeUnloadProtection = false,
  ...formProps
}: FormLayoutProps<T>) {
  const methods = useForm<T>({
    mode,
    defaultValues,
    ...formProps,
  });

  useEffect(() => {
    if (!enableBeforeUnloadProtection || !isOpen) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (methods.formState.isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enableBeforeUnloadProtection, isOpen, methods.formState.isDirty]);

  const handleSubmit = async (data: T) => {
    if (onSubmit) {
      try {
        await onSubmit(data);
      } catch (error) {
        console.error("Form submission error:", error);
      }
    }
  };

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
        style={style}
        className="form"
        noValidate
      >
        {description && (
          <p className="form-description\" style={descriptionStyle}>
            {description}
          </p>
        )}

        {typeof children === "function" ? children(methods) : children}

        {error && <p className="form-error-message">{error}</p>}

        <div className="form-actions">
          {showsCancelButton && (
            <button
              type="button"
              onClick={onCancel}
              className="btn"
              disabled={isLoading}
            >
              {cancelText}
            </button>
          )}
          {showsSubmitButton && (
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || disabled}
            >
              {isLoading ? "Loading..." : submitText}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}

export default FormLayout;
