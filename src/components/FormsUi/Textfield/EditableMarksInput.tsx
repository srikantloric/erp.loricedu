import React, { useEffect, useState } from "react";
import { Input, FormHelperText } from "@mui/joy";

type EditableMarksInputInputProps = {
    value: number;
    onChange: (val: number) => void;
    error?: boolean;
    helperText?: string;
};

const EditableMarksInput: React.FC<EditableMarksInputInputProps> = ({
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

export default EditableMarksInput;
