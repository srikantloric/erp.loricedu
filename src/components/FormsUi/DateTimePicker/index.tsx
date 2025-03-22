import { TextField, TextFieldProps } from "@mui/material";
import { useField } from "formik";

type DateTimePickerProps = {
  name: string;
} & TextFieldProps;

function DateTimePicker({ name, ...otherProps }: DateTimePickerProps) {
  const [field, meta] = useField(name);

  const configDateTimePicker: TextFieldProps = {
    ...otherProps,
    ...field,
    type: "date",
    variant: "outlined",
    fullWidth: true,
    InputLabelProps: {
      shrink: true,
    },
  };

  if (meta.touched && meta.error) {
    configDateTimePicker.error = true;
    configDateTimePicker.helperText = meta.error;
  }

  return <TextField {...configDateTimePicker} />;
}

export default DateTimePicker;
