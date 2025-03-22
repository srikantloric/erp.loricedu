import { TextField, TextFieldProps } from "@mui/material";
import { useFormikContext } from "formik";
import { useEffect } from "react";

type MonthlyFeeFieldProps = {
  defaultFee: Record<string, number>; // Object with class-based fees
} & TextFieldProps;

const MonthlyFeeField = ({ defaultFee, ...otherProps }: MonthlyFeeFieldProps) => {
  const { values, setFieldValue } = useFormikContext<{ class: string; monthly_fee: string }>();

  // Get the fee based on selected class
  const feeKey = `class_${values.class}`; // Convert class to match defaultFee keys
  const selectedFee = defaultFee[feeKey] || "";

  // Update Formik state when class changes
  useEffect(() => {
    setFieldValue("monthly_fee", Number(selectedFee));
  }, [values.class]); // Runs when 'class' changes

  return (
    <TextField
      {...otherProps} // Spread additional props
      label="Monthly Fee"
      name="monthly_fee"
      value={values.monthly_fee} // Controlled by Formik state
      onChange={(e) => setFieldValue("monthly_fee", Number(e.target.value))}
    />
  );
};

export default MonthlyFeeField;
