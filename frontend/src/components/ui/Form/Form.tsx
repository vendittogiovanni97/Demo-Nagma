"use client";

import {
  FormGroup,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  Switch,
  FormControl,
  FormLabel,
  FormHelperText,
  Box,
  useTheme,
  type FormControlProps,
} from "@mui/material";
import { forwardRef, type ReactNode } from "react";

type FormFieldType = "checkbox" | "radio" | "switch";

interface FormFieldProps {
  label: string;
  name: string;
  type: FormFieldType;
  value?: string | boolean;
  onChange?: (value: string | boolean) => void;
  error?: string;
  disabled?: boolean;
  helperText?: string;
}

interface FormProps extends FormControlProps {
  children: ReactNode;
  error?: boolean;
}

const FormField = ({
  label,
  name,
  type,
  value,
  onChange,
  error,
  disabled = false,
  helperText,
}: FormFieldProps) => {
  const theme = useTheme();
  const isError = Boolean(error);

  const checkboxStyle = {
    color: `${theme.palette.primary.main}80`,
    "&.Mui-checked": { color: theme.palette.primary.main },
    "&:hover": { backgroundColor: `${theme.palette.primary.main}14` },
  };

  const radioStyle = {
    color: `${theme.palette.primary.main}80`,
    "&.Mui-checked": { color: theme.palette.primary.main },
  };

  const switchStyle = {
    "& .MuiSwitch-switchBase": {
      color: `${theme.palette.primary.main}80`,
      "&.Mui-checked": {
        color: theme.palette.primary.main,
        "& + .MuiSwitch-track": { backgroundColor: theme.palette.primary.main },
      },
    },
    "& .MuiSwitch-track": {
      backgroundColor: `${theme.palette.primary.main}33`,
    },
  };

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = event.target as HTMLInputElement;
    const newValue =
      type === "checkbox" || type === "switch" ? target.checked : target.value;
    onChange?.(newValue);
  };

  const labelComponent = (
    <span
      style={{
        color: isError ? theme.palette.error.main : theme.palette.text.primary,
        fontSize: "0.9375rem",
      }}
    >
      {label}
    </span>
  );

  const commonProps = { label: labelComponent, name, disabled };

  let fieldComponent;

  switch (type) {
    case "checkbox":
      fieldComponent = (
        <FormControlLabel
          control={
            <Checkbox checked={Boolean(value)} onChange={handleChange} sx={checkboxStyle} />
          }
          {...commonProps}
        />
      );
      break;
    case "radio":
      fieldComponent = (
        <FormControlLabel
          control={
            <Radio checked={value === name} onChange={handleChange} sx={radioStyle} />
          }
          {...commonProps}
        />
      );
      break;
    case "switch":
      fieldComponent = (
        <FormControlLabel
          control={
            <Switch checked={Boolean(value)} onChange={handleChange} sx={switchStyle} />
          }
          {...commonProps}
        />
      );
      break;
    default:
      fieldComponent = null;
  }

  return (
    <Box sx={{ mb: 2 }}>
      {fieldComponent}
      {(error || helperText) && (
        <FormHelperText
          error={isError}
          sx={{
            ml: 4,
            color: isError ? theme.palette.error.main : theme.palette.text.secondary,
            fontSize: "0.75rem",
            mt: 0.5,
          }}
        >
          {error || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};

const Form = forwardRef<HTMLDivElement, FormProps>(
  ({ error = false, children, sx = {}, ...props }, ref) => {
    const theme = useTheme();

    const customSx = {
      "& .MuiFormGroup-root": { gap: 2 },
      "& .MuiFormControlLabel-root": { marginLeft: 0 },
      "& .MuiFormLabel-root": {
        color: theme.palette.text.primary,
        fontSize: "0.9375rem",
        "&.Mui-focused": { color: theme.palette.primary.main },
      },
      ...sx,
    };

    return (
      <FormControl ref={ref} fullWidth error={error} sx={customSx} {...props}>
        <FormGroup>{children}</FormGroup>
      </FormControl>
    );
  }
);

Form.displayName = "Form";

export default Form;
export { FormField };
export type { FormProps, FormFieldProps, FormFieldType };
