import { Button, ButtonProps } from "@mui/material";
import { useFormikContext } from "formik";
import { ReactNode } from "react";

type ButtonWrapperProps = {
  children: ReactNode;
} & ButtonProps;

function ButtonWrapper({ children, ...otherProps }: ButtonWrapperProps) {
  const { submitForm } = useFormikContext();

  const handleSubmit = () => {
    submitForm();
  };

  const configButton: ButtonProps = {
    ...otherProps,
    onClick: handleSubmit,
    variant: "contained",
    color: "primary",
    fullWidth: true,
  };

  return <Button {...configButton} >{children}</Button>;
}

export default ButtonWrapper;
