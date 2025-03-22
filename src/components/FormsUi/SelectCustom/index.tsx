import { TextField, TextFieldProps } from "@mui/material";
import { useField, useFormikContext } from "formik";
import React from "react";

type SelectWrapperProps = {
  name: string;
  children: React.ReactNode;
} & TextFieldProps;

function SelectWrapper({ name, children, ...otherProps }: SelectWrapperProps) {
  const [field, meta] = useField(name);
  const { setFieldValue } = useFormikContext();

  const handleChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setFieldValue(name, e.target.value);
  };

  const configSelect: TextFieldProps = {
    ...field,
    ...otherProps,
    select: true,
    variant: "outlined",
    fullWidth: true,
    onChange: handleChange,
    InputLabelProps: { shrink: true },
  };

  if (meta.touched && meta.error) {
    configSelect.error = true;
    configSelect.helperText = meta.error;
  }

  return <TextField {...configSelect}>{children}</TextField>;
}

export default SelectWrapper;
