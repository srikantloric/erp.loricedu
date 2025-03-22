import { TextField, TextFieldProps } from "@mui/material";
import { useFormikContext } from "formik";
import { useEffect } from "react";
import { TransportLocationType } from "types/transport";

type TransportFeeFieldProps = {
  transportLocations: TransportLocationType[];
} & TextFieldProps;

const TransportFeeField = ({ transportLocations, ...otherProps }: TransportFeeFieldProps) => {
  const { values, setFieldValue } = useFormikContext<{ transport_location: string; transportation_fee: string }>();

  // Find the selected transport location
  const selectedLocation = transportLocations.find((item) => item.locationId === values.transport_location);

  // Update the transportation fee when transport_location changes
  useEffect(() => {
    if (selectedLocation) {
      setFieldValue("transportation_fee", Number(selectedLocation.monthlyCharge));
    }
  }, [values.transport_location, selectedLocation, setFieldValue]);

  return (
    <TextField
      {...otherProps}
      label="Transport Fee"
      name="transportation_fee"
      value={values.transportation_fee || ""}
      onChange={(e) => setFieldValue("transportation_fee", Number(e.target.value))}
    />
  );
};

export default TransportFeeField;
