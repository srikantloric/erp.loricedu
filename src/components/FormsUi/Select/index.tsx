import { MenuItem, TextField, TextFieldProps } from "@mui/material";
import { useField, useFormikContext } from "formik";

type SelectOption = {
  value: string | number;
  title: string;
};

type SelectWrapperProps = {
  name: string;
  options: SelectOption[];
} & TextFieldProps;

function SelectWrapper({ name, options, ...otherProps }: SelectWrapperProps) {
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

  return (
    <TextField {...configSelect}>
      {options.map((item, index) => (
        <MenuItem key={index} value={item.value}>
          {item.title}
        </MenuItem>
      ))}
    </TextField>
  );
}

export default SelectWrapper;
