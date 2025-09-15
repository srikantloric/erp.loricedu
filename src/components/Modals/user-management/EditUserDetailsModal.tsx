import {
    DialogTitle,
    Divider,
    Modal,
    ModalDialog,
    Button,
    Stack,
    FormLabel,
    Switch,
    Input,
    Select,
    Option,
    Typography,
} from "@mui/joy";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Users } from "types/Users";
import { useEffect } from "react";
import { serverTimestamp } from "firebase/firestore";

// ---------------- Zod Schema ----------------
const userSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email"),
    role: z.enum(["admin", "operator", "teacher"]), // extend as needed
    permissions: z.object({
        manageUsers: z.boolean(),
        editFee: z.boolean(),
        deleteFee: z.boolean(),
        viewReports: z.boolean(),
    }),
});

type UserFormData = z.infer<typeof userSchema>;

// ---------------- Props ----------------
type EditUserDetailsModalProps = {
    open: boolean;
    onClose: () => void;
    user: Users;
    onSubmitForm: (data: UserFormData) => void;
};

const EditUserDetailsModal: React.FC<EditUserDetailsModalProps> = ({
    open,
    onClose,
    user,
    onSubmitForm,
}) => {
    const {
        control,
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<UserFormData>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            name: user?.name || "",
            email: user?.email || "",
            role: (user?.role as UserFormData["role"]) || "operator",
            permissions: {
                manageUsers: user?.permissions?.manageUsers || false,
                editFee: user?.permissions?.editFee || false,
                deleteFee: user?.permissions?.deleteFee || false,
                viewReports: user?.permissions?.viewReports || false,
            },
        },
    });

    const watchedRole = watch("role");

    // Update permissions if role is admin
    useEffect(() => {
        if (watchedRole === "admin") {
            setValue("permissions", {
                manageUsers: true,
                editFee: true,
                deleteFee: true,
                viewReports: true,
            });
        } else if (user) {
            // reset to user's actual permissions for non-admin roles
            setValue("permissions", {
                manageUsers: user?.permissions?.manageUsers || false,
                editFee: user?.permissions?.editFee || false,
                deleteFee: user?.permissions?.deleteFee || false,
                viewReports: user?.permissions?.viewReports || false,
            });
        }
    }, [watchedRole, setValue, user]);

    const onSubmit = (data: any) => {
        const dataForUpdate = {
            ...data,
            updatedAt: serverTimestamp(),
        };
        onSubmitForm(dataForUpdate as any);
        onClose();
    };

    useEffect(() => {
        if (user) {
            reset({
                name: user?.name || "",
                email: user?.email || "",
                role: (user?.role as UserFormData["role"]) || "operator",
                permissions: {
                    manageUsers: user?.permissions?.manageUsers || false,
                    editFee: user?.permissions?.editFee || false,
                    deleteFee: user?.permissions?.deleteFee || false,
                    viewReports: user?.permissions?.viewReports || false,
                },
            });
        }
    }, [user, reset]);

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog minWidth="md" sx={{ maxHeight: "90vh", overflow: "auto" }}>
                <DialogTitle>Update User Details</DialogTitle>
                <Divider sx={{ mb: 2 }} />

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={2}>
                        {/* User Name */}
                        <div>
                            <FormLabel>Name</FormLabel>
                            <Input {...register("name")} placeholder="Enter name" />
                            {errors.name && (
                                <Typography level="body-md" color="danger">
                                    {errors.name.message}
                                </Typography>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <FormLabel>Email</FormLabel>
                            <Input
                                {...register("email")}
                                type="email"
                                placeholder="Enter email"
                            />
                            {errors.email && (
                                <Typography level="body-md" color="danger">
                                    {errors.email.message}
                                </Typography>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <FormLabel>Role</FormLabel>
                            <Controller
                                name="role"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} placeholder="Select role">
                                        <Option value="admin">Admin</Option>
                                        <Option value="operator">Operator</Option>
                                        <Option value="teacher">Teacher</Option>
                                    </Select>
                                )}
                            />
                            {errors.role && (
                                <Typography level="body-md" color="danger">
                                    {errors.role.message}
                                </Typography>
                            )}
                        </div>

                        <Divider />

                        {/* Permissions */}
                        <div>
                            <FormLabel>User Permissions</FormLabel>
                            <Stack spacing={1} mt={1}>
                                {["manageUsers", "editFee", "deleteFee", "viewReports"].map(
                                    (perm) => (
                                        <Controller
                                            key={perm}
                                            name={`permissions.${perm}` as any}
                                            control={control}
                                            render={({ field }) => (
                                                <Switch
                                                    {...field}
                                                    checked={field.value}
                                                    disabled={watchedRole === "admin"}
                                                    onChange={(e) =>
                                                        field.onChange(e.target.checked)
                                                    }
                                                    endDecorator={perm
                                                        .replace(/([A-Z])/g, " $1")
                                                        .replace(/^./, (str) => str.toUpperCase())}
                                                />
                                            )}
                                        />
                                    )
                                )}
                            </Stack>
                        </div>

                        <Divider />

                        {/* Action Buttons */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button variant="outlined" color="neutral" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button type="submit" color="primary">
                                Save Changes
                            </Button>
                        </Stack>
                    </Stack>
                </form>
            </ModalDialog>
        </Modal>
    );
};

export default EditUserDetailsModal;
