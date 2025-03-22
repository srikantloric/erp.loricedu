import { Button, ButtonProps } from "@mui/joy";
import { useFormikContext } from "formik";
import { ReactNode } from "react";

type ButtonWrapperProps = {
    children: ReactNode;
} & ButtonProps;

function LoadingButtonWrapper({ children, ...otherProps }: ButtonWrapperProps) {
    const { submitForm } = useFormikContext();

    const handleSubmit = () => {
        submitForm();
    };

    const configButton: ButtonProps = {
        ...otherProps,
        onClick: handleSubmit,
        variant: "solid",
        color: "primary",
        fullWidth: true,
    };

    return <Button {...configButton}>{children}</Button>;
}

export default LoadingButtonWrapper;
