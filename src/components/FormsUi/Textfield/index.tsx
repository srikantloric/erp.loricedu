import { TextField, TextFieldProps } from "@mui/material";
import { useField } from "formik";

type TextfieldWrapperProps = {
  name: string;
} & TextFieldProps;

function TextfieldWrapper({ name, ...otherProps }: TextfieldWrapperProps) {
  const [field, meta] = useField(name);

  const configTextfield: TextFieldProps = {
    ...field,
    ...otherProps,
    fullWidth: true,
    variant: "outlined",
  };

  if (meta.touched && meta.error) {
    configTextfield.error = true;
    configTextfield.helperText = meta.error;
  }

  return <TextField {...configTextfield} />;
}

export default TextfieldWrapper;
