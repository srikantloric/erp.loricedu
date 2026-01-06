import {
    Button,
    DialogContent,
    DialogTitle,
    FormControl,
    FormLabel,
    Input,
    Modal,
    ModalDialog,
    Stack,
    Select,
    Option,
    Typography,
    Divider,
} from "@mui/joy";

import { saveFeeHead } from "modules/fees/services/feeHead.service";
import { enqueueSnackbar } from "notistack";
import React from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";


// --------------------------
// Zod Schema
// --------------------------
const schema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().min(5, "Description must be at least 5 characters"),
    amount: z.coerce.number().min(1, "Amount must be greater than 0"),
    frequency: z.enum(["monthly", "quarterly", "yearly", "one-time"]),
});

type FeeHeadForm = z.infer<typeof schema>;

// --------------------------
// Component
// --------------------------
interface AddFeeHeadsModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const AddFeeHeadsModal: React.FC<AddFeeHeadsModalProps> = ({ open, setOpen }) => {
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors, isValid },
    } = useForm<FeeHeadForm>({
        resolver: zodResolver(schema),
        mode: "onChange", // real-time validation
        defaultValues: {
            name: "",
            description: "",
            amount: 0,
            frequency: "monthly",
        },
    });

    const frequency = watch("frequency");

    const onSubmit = async (data: FeeHeadForm) => {
        const save = await saveFeeHead(data);

        if (save.success) {
            enqueueSnackbar("Fee Head Added Successfully!", { variant: "success" });
            reset();
            setOpen(false);
        }
    };

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <ModalDialog>
                <DialogTitle>Create Fee Head</DialogTitle>
                <Divider />
                <DialogContent>Fill in the details.</DialogContent>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>

                        {/* NAME */}
                        <FormControl error={!!errors.name}>
                            <FormLabel>Head Title</FormLabel>
                            <Input {...register("name")} />
                            {errors.name && (
                                <Typography level="body-xs" color="danger">
                                    {errors.name.message}
                                </Typography>
                            )}
                        </FormControl>

                        {/* DESCRIPTION */}
                        <FormControl error={!!errors.description}>
                            <FormLabel>Head Description</FormLabel>
                            <Input {...register("description")} />
                            {errors.description && (
                                <Typography level="body-xs" color="danger">
                                    {errors.description.message}
                                </Typography>
                            )}
                        </FormControl>

                        {/* AMOUNT */}
                        <FormControl error={!!errors.amount}>
                            <FormLabel>Amount</FormLabel>
                            <Input type="number" {...register("amount")} />
                            {errors.amount && (
                                <Typography level="body-xs" color="danger">
                                    {errors.amount.message}
                                </Typography>
                            )}
                        </FormControl>

                        {/* FREQUENCY */}
                        <FormControl error={!!errors.frequency}>
                            <FormLabel>Frequency</FormLabel>

                            <Select
                                value={frequency}
                                onChange={(_, val) => setValue("frequency", val as any)}
                            >
                                <Option value="monthly">Monthly</Option>
                                <Option value="quarterly">Quarterly</Option>
                                <Option value="yearly">Yearly</Option>
                                <Option value="one-time">One Time</Option>
                            </Select>

                            {errors.frequency && (
                                <Typography level="body-xs" color="danger">
                                    {errors.frequency.message}
                                </Typography>
                            )}
                        </FormControl>

                        <Button type="submit" disabled={!isValid}>
                            Submit
                        </Button>
                    </Stack>
                </form>
            </ModalDialog>
        </Modal>
    );
};

export default AddFeeHeadsModal;
