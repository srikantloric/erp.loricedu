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
    Switch,
    Typography,
    Card,
    CardContent,
    IconButton,
    Box,
    Textarea
} from "@mui/joy";
import { useFormik } from "formik";
import * as Yup from "yup";
import { User, Camera, DocumentUpload, Trash } from "iconsax-react";
import { FacultyType } from "types/facuities";
import { useState, useRef } from "react";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { getFirestoreInstance } from "context/firebaseUtility";
import { useDispatch } from "react-redux";
import { fetchTeacher } from "store/reducers/facultiesSlice";

const validationSchema = Yup.object({
    facultyName: Yup.string().required("Faculty name is required"),
    facultyEmail: Yup.string().email("Invalid email format"),
    facultyPhone: Yup.string()
        .matches(/^[0-9]{10}$/, "Phone number must be exactly 10 digits")
        .required("Phone number is required"),
    facultyAddress: Yup.string(),
    facultyGender: Yup.string().required("Gender is required"),
    facultyQualification: Yup.string().required("Qualification is required"),
    facultySpecification: Yup.string().required("Specification is required"),
    facultyDob: Yup.string().required("Date of birth is required"),
    facultyDoj: Yup.string().required("Date of joining is required"),
    facultyAadhar: Yup.string().matches(/^[0-9]{12}$/, "Aadhar number must be exactly 12 digits"),
    facultyPass: Yup.string(),
    rfidCode: Yup.string(),
    isFromManagement: Yup.boolean(),
    isSendingSms: Yup.boolean(),
    isActive: Yup.boolean(),
});

// Create async thunk for adding faculty
export const addFaculty = createAsyncThunk<FacultyType, Partial<FacultyType>>(
    "teachers/addFaculty",
    async (facultyData) => {
        const db = await getFirestoreInstance();
        console.log("Adding new faculty...");

        const facultyToAdd = {
            ...facultyData,
            isFaculty: true,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, "STUDENTS"), facultyToAdd);

        return {
            ...facultyData,
            facultyId: docRef.id,
        } as FacultyType;
    }
);

interface AddFacultyDialogProps {
    open: boolean;
    onClose: () => void;
}

export function AddFacultyDialog({ open, onClose }: AddFacultyDialogProps) {
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();

    const formik = useFormik({
        initialValues: {
            facultyName: "",
            facultyEmail: "",
            facultyPhone: "",
            facultyAddress: "",
            facultyGender: "",
            facultyQualification: "",
            facultySpecification: "",
            facultyDob: "",
            facultyDoj: "",
            facultyAadhar: "",
            facultyPass: "",
            rfidCode: "",
            isFromManagement: false,
            isSendingSms: false,
            isActive: true,
        },
        validationSchema,
        onSubmit: async (values) => {
            setIsSubmitting(true);
            try {
                const faculty: Partial<FacultyType> = {
                    ...values,
                    facultyImage: selectedImage || undefined,
                    facultyImageThumb: selectedImage || undefined, // You might want to create a thumbnail version
                };

                await dispatch(addFaculty(faculty) as any);
                await dispatch(fetchTeacher() as any);

                console.log("Faculty added successfully");
                onClose();
                formik.resetForm();
                setSelectedImage(null);
            } catch (error) {
                console.error("Error adding faculty:", error);
            } finally {
                setIsSubmitting(false);
            }
        },
    });

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // In a real app, you would upload this to Firebase Storage
            // For now, we'll create a local URL
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ width: 800, maxWidth: '95vw', p: 3, maxHeight: '90vh', overflow: 'auto' }}>
                <DialogTitle>Add New Faculty</DialogTitle>
                <DialogContent>
                    <form onSubmit={formik.handleSubmit}>
                        <Stack spacing={3}>
                            {/* Image Upload Section */}
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography level="title-md" mb={2}>Profile Image</Typography>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        {selectedImage ? (
                                            <Box sx={{ position: 'relative' }}>
                                                <img
                                                    src={selectedImage}
                                                    alt="Profile"
                                                    style={{
                                                        width: 100,
                                                        height: 100,
                                                        objectFit: 'cover',
                                                        borderRadius: 8
                                                    }}
                                                />
                                                <IconButton
                                                    size="sm"
                                                    color="danger"
                                                    variant="solid"
                                                    onClick={removeImage}
                                                    sx={{
                                                        position: 'absolute',
                                                        top: -8,
                                                        right: -8,
                                                        minHeight: 24,
                                                        minWidth: 24,
                                                    }}
                                                >
                                                    <Trash size={12} />
                                                </IconButton>
                                            </Box>
                                        ) : (
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    height: 100,
                                                    borderRadius: 2,
                                                    border: '2px dashed',
                                                    borderColor: 'neutral.300',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        borderColor: 'primary.400',
                                                        backgroundColor: 'primary.50',
                                                    }
                                                }}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                <Camera size={24} />
                                            </Box>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            style={{ display: 'none' }}
                                        />
                                        <Button
                                            variant="outlined"
                                            startDecorator={<DocumentUpload />}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {selectedImage ? 'Change Image' : 'Upload Image'}
                                        </Button>
                                    </Stack>
                                </CardContent>
                            </Card>

                            {/* Basic Information */}
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultyName && formik.touched.facultyName}>
                                    <FormLabel>Name *</FormLabel>
                                    <Input
                                        autoFocus
                                        name="facultyName"
                                        onChange={formik.handleChange}
                                        value={formik.values.facultyName}
                                    />
                                    {formik.errors.facultyName && formik.touched.facultyName && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultyName}
                                        </Typography>
                                    )}
                                </FormControl>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultyEmail && formik.touched.facultyEmail}>
                                    <FormLabel>Email</FormLabel>
                                    <Input
                                        name="facultyEmail"
                                        type="email"
                                        onChange={formik.handleChange}
                                        value={formik.values.facultyEmail}
                                    />
                                    {formik.errors.facultyEmail && formik.touched.facultyEmail && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultyEmail}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultyPhone && formik.touched.facultyPhone}>
                                    <FormLabel>Phone Number *</FormLabel>
                                    <Input
                                        name="facultyPhone"
                                        onChange={formik.handleChange}
                                        value={formik.values.facultyPhone}
                                    />
                                    {formik.errors.facultyPhone && formik.touched.facultyPhone && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultyPhone}
                                        </Typography>
                                    )}
                                </FormControl>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultyGender && formik.touched.facultyGender}>
                                    <FormLabel>Gender *</FormLabel>
                                    <Select
                                        name="facultyGender"
                                        value={formik.values.facultyGender}
                                        onChange={(_, value) => formik.setFieldValue('facultyGender', value)}
                                    >
                                        <Option value="Male">Male</Option>
                                        <Option value="Female">Female</Option>
                                        <Option value="Other">Other</Option>
                                    </Select>
                                    {formik.errors.facultyGender && formik.touched.facultyGender && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultyGender}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultyQualification && formik.touched.facultyQualification}>
                                    <FormLabel>Qualification *</FormLabel>
                                    <Input
                                        name="facultyQualification"
                                        onChange={formik.handleChange}
                                        value={formik.values.facultyQualification}
                                    />
                                    {formik.errors.facultyQualification && formik.touched.facultyQualification && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultyQualification}
                                        </Typography>
                                    )}
                                </FormControl>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultySpecification && formik.touched.facultySpecification}>
                                    <FormLabel>Specification *</FormLabel>
                                    <Input
                                        name="facultySpecification"
                                        onChange={formik.handleChange}
                                        value={formik.values.facultySpecification}
                                    />
                                    {formik.errors.facultySpecification && formik.touched.facultySpecification && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultySpecification}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultyDob && formik.touched.facultyDob}>
                                    <FormLabel>Date of Birth *</FormLabel>
                                    <Input
                                        name="facultyDob"
                                        type="date"
                                        onChange={formik.handleChange}
                                        value={formik.values.facultyDob}
                                    />
                                    {formik.errors.facultyDob && formik.touched.facultyDob && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultyDob}
                                        </Typography>
                                    )}
                                </FormControl>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultyDoj && formik.touched.facultyDoj}>
                                    <FormLabel>Date of Joining *</FormLabel>
                                    <Input
                                        name="facultyDoj"
                                        type="date"
                                        onChange={formik.handleChange}
                                        value={formik.values.facultyDoj}
                                    />
                                    {formik.errors.facultyDoj && formik.touched.facultyDoj && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultyDoj}
                                        </Typography>
                                    )}
                                </FormControl>
                            </Stack>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <FormControl sx={{ flex: 1 }} error={!!formik.errors.facultyAadhar && formik.touched.facultyAadhar}>
                                    <FormLabel>Aadhar Number</FormLabel>
                                    <Input
                                        name="facultyAadhar"
                                        onChange={formik.handleChange}
                                        value={formik.values.facultyAadhar}
                                        placeholder="12 digit Aadhar number"
                                    />
                                    {formik.errors.facultyAadhar && formik.touched.facultyAadhar && (
                                        <Typography level="body-sm" color="danger">
                                            {formik.errors.facultyAadhar}
                                        </Typography>
                                    )}
                                </FormControl>
                                <FormControl sx={{ flex: 1 }}>
                                    <FormLabel>RFID Code</FormLabel>
                                    <Input
                                        name="rfidCode"
                                        onChange={formik.handleChange}
                                        value={formik.values.rfidCode}
                                        placeholder="RFID card code"
                                    />
                                </FormControl>
                            </Stack>

                            <FormControl>
                                <FormLabel>Password</FormLabel>
                                <Input
                                    name="facultyPass"
                                    type="password"
                                    onChange={formik.handleChange}
                                    value={formik.values.facultyPass}
                                    placeholder="Set faculty password"
                                />
                            </FormControl>

                            <FormControl error={!!formik.errors.facultyAddress && formik.touched.facultyAddress}>
                                <FormLabel>Address</FormLabel>
                                <Textarea
                                    name="facultyAddress"
                                    onChange={formik.handleChange}
                                    value={formik.values.facultyAddress}
                                    minRows={2}
                                    placeholder="Complete address"
                                />
                            </FormControl>

                            {/* Settings */}
                            <Card variant="outlined">
                                <CardContent>
                                    <Typography level="title-md" mb={2}>Settings</Typography>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack>
                                                <Typography level="body-md">Management Member</Typography>
                                                <Typography level="body-sm" color="neutral">
                                                    Is this faculty a management member?
                                                </Typography>
                                            </Stack>
                                            <Switch
                                                checked={formik.values.isFromManagement}
                                                onChange={(event) =>
                                                    formik.setFieldValue('isFromManagement', event.target.checked)
                                                }
                                            />
                                        </Stack>

                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack>
                                                <Typography level="body-md">SMS Notifications</Typography>
                                                <Typography level="body-sm" color="neutral">
                                                    Send SMS notifications to this faculty
                                                </Typography>
                                            </Stack>
                                            <Switch
                                                checked={formik.values.isSendingSms}
                                                onChange={(event) =>
                                                    formik.setFieldValue('isSendingSms', event.target.checked)
                                                }
                                            />
                                        </Stack>

                                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                                            <Stack>
                                                <Typography level="body-md">Active Status</Typography>
                                                <Typography level="body-sm" color="neutral">
                                                    Is this faculty currently active?
                                                </Typography>
                                            </Stack>
                                            <Switch
                                                checked={formik.values.isActive}
                                                onChange={(event) =>
                                                    formik.setFieldValue('isActive', event.target.checked)
                                                }
                                            />
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                                <Button variant="plain" color="neutral" onClick={onClose} disabled={isSubmitting}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    startDecorator={<User />}
                                    loading={isSubmitting}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Adding Faculty...' : 'Add Faculty'}
                                </Button>
                            </Stack>
                        </Stack>
                    </form>
                </DialogContent>
            </ModalDialog>
        </Modal>
    );
}