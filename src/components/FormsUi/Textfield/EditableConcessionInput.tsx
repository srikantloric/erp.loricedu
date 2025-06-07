import React, { useEffect, useState } from "react";
import { Input, FormHelperText } from "@mui/joy";
import CurrencyRupeeIcon from '@mui/icons-material/CurrencyRupee';

type EditableConcessionInputProps = {
    value: number;
    onChange: (val: number) => void;
    error?: boolean;
    helperText?: string;
};

const EditableConcessionInput: React.FC<EditableConcessionInputProps> = ({
    value,
    onChange,
    error,
    helperText
}) => {
    const [localValue, setLocalValue] = useState(value);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <>
            <Input
                size="sm"
                type="number"
                sx={{ width: 100, fontWeight: "bold" }}
                value={localValue}
                startDecorator={<CurrencyRupeeIcon fontSize="small" />}
                onChange={(e) => {
                    const val = parseFloat(e.target.value || "0");
                    if (val >= 0) setLocalValue(val);
                }}
                onBlur={() => {
                    onChange(localValue);
                }}
                error={error}
            />
            {helperText && (
                <FormHelperText sx={{ color: "red" }}>{helperText}</FormHelperText>
            )}
        </>
    );
};

export default EditableConcessionInput;
