import {
  Alert,
  Avatar,
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  IconButton,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Stack,
  SvgIcon,
  Typography,
  styled,
} from "@mui/joy";
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from "config/schoolConfig";
import { Edit, Warning2 } from "iconsax-react";
import { StudentDetailsType } from "types/student";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import LockIcon from "@mui/icons-material/Lock";
import { doc, serverTimestamp, Timestamp, updateDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

const VisuallyHiddenInput = styled("input")`
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  overflow: hidden;
  position: absolute;
  bottom: 0;
  left: 0;
  white-space: nowrap;
  width: 1px;
`;

const schema = z.object({
  aadhar_number: z
    .string()
    .optional()
    .refine((value) => !value || /^[0-9]{12}$/.test(value), {
      message: "Invalid aadhar number, it should be of 12 digit.",
    }),
  address: z.string().min(2, "Address is required!"),
  // admission_no: z.string(),
  alternate_number: z
    .string()
    .optional()
    .refine(
      (value: string | undefined) => {
        if (typeof value === "undefined" || value === "") {
          return true;
        }
        const numberValue = parseFloat(value);
        return !isNaN(numberValue) && numberValue >= 0 && value.length === 10;
      },
      {
        message:
          "If provided, the number must be a 10-character string",
      }
    ),
  blood_group: z.string().min(1, "Blood Group is required!"),
  caste: z.string(),
  city: z.string().min(1, "City is required!"),
  class: z.number().min(1, "Class is required!"),
  class_roll: z.string().min(1),
  contact_number: z
    .string()
    .regex(/^\d{10}$/, { message: "Invalid phone number" }),
  // date_of_addmission: z.string().min(1, "DOB is required!"),
  dob: z.string().min(1, "Gender is required!"),
  // email: z.string().email().optional(),
  father_name: z.string().min(1, "Father name is required!"),
  father_occupation: z.string(),
  father_qualification: z.string(),
  gender: z.string().min(1),
  id: z.string().optional(),
  mother_name: z.string().min(1, "Mother name is required!"),
  mother_occupation: z.string(),
  motherqualifiation: z.string(),
  postal_code: z
    .string()
    .regex(/^\d{6}$/, "Postal code must be exactly 6 digits")
    .min(1),
  profil_url: z.string().optional(),
  religion: z.string().min(1, "Religion is required!"),
  section: z.string().length(1, "Section is required!"),
  state: z.string().min(1, "State is required!"),
  student_name: z.string().min(1, "Student is required!"),
  monthly_fee: z.number().min(1, "Monthly Fee is required!"),
  computer_fee: z.number(),
  // admission_fee: z.number().optional(),
  transportation_fee: z.number(),
  fee_discount: z.number(),
  updated_at: z.union([z.instanceof(Timestamp), z.any()]).optional(),
});

type UpdateFormFields = z.infer<typeof schema>;

interface StudentProfileProps {
  studentData: StudentDetailsType;
}

interface alertDialogType {
  open: boolean;
  caller: string | null;
  keyRequired: boolean;
}

const PersonalTab: React.FC<StudentProfileProps> = ({ studentData }) => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState<alertDialogType>({
    open: false,
    caller: null,
    keyRequired: false,
  });
  const [paymentDetailsChangeBlocked, setPaymentDetailsChangeBlocked] =
    useState<boolean>(true);
  const [admissionDetailsChangeBlocked, setAdmissionDetailsChangeBlocked] =
    useState<boolean>(true);

  const [changeKeyInput, setChangeKeyInput] = useState<string>("");
  const [changeKeyAccessError, setChangeKeyAccessError] = useState<string>("");

  //Get Firebase DB instance
  const {db} = useFirebase();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<UpdateFormFields>({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      aadhar_number: studentData.aadhar_number,
      address: studentData.address,
      alternate_number: studentData.alternate_number!,
      blood_group: studentData.blood_group,
      caste: studentData.caste,
      city: studentData.city,
      class: studentData.class!,
      class_roll: studentData.class_roll!,
      dob: studentData.dob,
      // email: studentData.email,
      father_name: studentData.father_name,
      father_occupation: studentData.father_occupation!,
      father_qualification: studentData.father_qualification,
      gender: studentData.gender,
      mother_name: studentData.mother_name,
      mother_occupation: studentData.mother_occupation,
      motherqualifiation: studentData.motherqualifiation,
      postal_code: studentData.postal_code,
      profil_url: studentData.profil_url,
      religion: studentData.religion,
      contact_number: studentData.contact_number,
      section: studentData.section,
      state: studentData.state,
      student_name: studentData.student_name,
      monthly_fee: studentData.monthly_fee || 0,
      computer_fee: studentData.computer_fee || 0,
      // admission_fee: studentData.admission_fee || 0,
      transportation_fee: studentData.transportation_fee || 0,
      fee_discount: studentData.fee_discount || 0,
    },
  });

  const onSubmit = async (updatedData: UpdateFormFields) => {
    if (studentData) {
      try {
        setIsUpdating(true);
  
        if (!updatedData.profil_url) {
          updatedData["profil_url"] =
            "https://firebasestorage.googleapis.com/v0/b/apx-international-dev.firebasestorage.app/o/images%2F360_F_542361185_VFRJWpR2FH5OiAEVveWO7oZnfSccZfD3.jpg?alt=media&token=db86876d-97cc-4bd9-9694-75a6fe70107f";
        }
  
        updatedData["updated_at"] = serverTimestamp();
  
        const studentRef = doc(db, "STUDENTS", studentData.id);
        await updateDoc(studentRef, updatedData);
  
        console.log("Update successful!");
        enqueueSnackbar("Profile updated successfully!", { variant: "success" });
        setPaymentDetailsChangeBlocked(true);
      } catch (err) {
        console.error("Firestore Update Error:", err);
        enqueueSnackbar("Something went wrong while updating data!", { variant: "error" });
      } finally {
        setIsUpdating(false);
      }
    } else {
      enqueueSnackbar("Unable to update!", { variant: "error" });
    }
  };

  const onError = async (data: any) => {
    console.log(data)
    enqueueSnackbar("Please check the fields!", {
      variant: "error",
    });
  };

  return (
    <Box
      sx={{ display: "flex", flexDirection: "column" }}
      component="form"
      onSubmit={handleSubmit(onSubmit, onError)}
    >
      <Box sx={{ display: "flex", gap: "1.6rem", mt: "1rem" }}>
        <Box
          sx={{
            flex: "1.2",
            border: "1px solid var(--bs-gray-300)",
            borderRadius: "12px",
          }}
        >
          <Typography sx={{ m: "0.8rem" }} level="title-md">
            Personal Details
          </Typography>

          <Divider />
          <Box sx={{ p: "1rem" }}>
            <Grid container justifyContent="space-between">
              <Grid md={5} xs={7}>
                <FormControl>
                  <FormLabel required>Student Name</FormLabel>
                  <Input
                    type="text"
                    error={errors.student_name ? true : false}
                    {...register("student_name")}
                  />
                  <FormHelperText>
                    {errors.student_name && errors.student_name.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid md={3} xs={5}>
                <FormControl error={errors.gender ? true : false}>
                  <FormLabel required>Gender</FormLabel>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field: { onChange, value } }) => (
                      <Select
                        value={value}
                        onChange={(e, val) => {
                          onChange(val);
                        }}
                      >
                        <Option value="male">Male</Option>
                        <Option value="female">Female</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    )}
                  />
                  <FormHelperText>
                    {errors.gender && errors.gender.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid md={3} xs={5}>
                <FormControl>
                  <FormLabel>Date Of Birth</FormLabel>
                  <Input
                    type="date"
                    {...register("dob")}
                    error={errors.dob ? true : false}
                  />
                  <FormHelperText>
                    {errors.dob && errors.dob.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" mt="1rem">
              <Grid md={3} xs={12}>
                <FormControl>
                  <FormLabel>Bloog Group</FormLabel>
                  <Input
                    type="text"
                    {...register("blood_group")}
                    error={errors.blood_group ? true : false}
                  />
                  <FormHelperText>
                    {errors.blood_group && errors.blood_group.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid md={4} xs={12}>
                <FormControl>
                  <FormLabel>Father Name</FormLabel>
                  <Input
                    type="text"
                    {...register("father_name")}
                    error={errors.father_name ? true : false}
                  />
                  <FormHelperText>
                    {errors.father_name && errors.father_name.message}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid md={4} xs={12}>
                <FormControl>
                  <FormLabel>Mother Name</FormLabel>
                  <Input
                    type="text"
                    {...register("mother_name")}
                    error={errors.mother_name ? true : false}
                  />
                  <FormHelperText>
                    {errors.mother_name && errors.mother_name.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" mt="1rem">
              <Grid md={3} xs={12}>
                <FormControl>
                  <FormLabel>Religion</FormLabel>
                  <Input
                    type="text"
                    {...register("religion")}
                    error={errors.religion ? true : false}
                  />
                  <FormHelperText>
                    {errors.religion && errors.religion.message}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid md={3} xs={12}>
                <FormControl>
                  <FormLabel>Cast</FormLabel>
                  <Input
                    type="text"
                    {...register("caste")}
                    error={errors.caste ? true : false}
                  />
                  <FormHelperText>
                    {errors.caste && errors.caste.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid md={5.4} xs={12}>
                <FormControl>
                  <FormLabel>Aadhar Number</FormLabel>
                  <Input
                    type="number"
                    {...register("aadhar_number")}
                    error={errors.aadhar_number ? true : false}
                  />
                  <FormHelperText>
                    {errors.aadhar_number && errors.aadhar_number.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" mt="1rem">
              <Grid md={3} xs={12}>
                <FormControl>
                  <FormLabel>Father Qualification</FormLabel>
                  <Input
                    type="text"
                    {...register("father_qualification")}
                    error={errors.father_qualification ? true : false}
                  />
                  <FormHelperText>
                    {" "}
                    {errors.father_qualification &&
                      errors.father_qualification.message}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid md={2.6} xs={12}>
                <FormControl>
                  <FormLabel>Occupation</FormLabel>
                  <Input
                    type="text"
                    {...register("father_occupation")}
                    error={errors.father_occupation ? true : false}
                  />
                  <FormHelperText>
                    {errors.father_occupation &&
                      errors.father_occupation.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid md={3} xs={12}>
                <FormControl>
                  <FormLabel>Mother Qualification</FormLabel>
                  <Input
                    type="text"
                    {...register("motherqualifiation")}
                    error={errors.motherqualifiation ? true : false}
                  />
                  <FormHelperText>
                    {errors.motherqualifiation &&
                      errors.motherqualifiation.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid md={2.6} xs={12}>
                <FormControl>
                  <FormLabel>Occupation</FormLabel>
                  <Input
                    type="text"
                    {...register("mother_occupation")}
                    error={errors.mother_occupation ? true : false}
                  />
                  <FormHelperText>
                    {errors.mother_occupation &&
                      errors.mother_occupation.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" mt="1rem">
              <Grid md={5.8} xs={12}>
                <FormControl>
                  <FormLabel>Phone Number (Primary)</FormLabel>
                  <Input
                    type="number"
                    {...register("contact_number")}
                    error={errors.contact_number ? true : false}
                  />
                  <FormHelperText>
                    {errors.contact_number && errors.contact_number.message}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid md={5.8} xs={12}>
                <FormControl>
                  <FormLabel>Phone Number 2</FormLabel>
                  <Input
                    type="number"
                    {...register("alternate_number")}
                    error={errors.alternate_number ? true : false}
                  />
                  <FormHelperText>
                    {errors.alternate_number && errors.alternate_number.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" mt="1rem">
              <Grid md={12} xs={12}>
                <FormControl>
                  <FormLabel>Present Address</FormLabel>
                  <Input
                    type="text"
                    {...register("address")}
                    error={errors.address ? true : false}
                  />
                  <FormHelperText>
                    {" "}
                    {errors.address && errors.address.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
            <Grid container justifyContent="space-between" mt="1rem">
              <Grid md={4} xs={12}>
                <FormControl>
                  <FormLabel>City</FormLabel>
                  <Input
                    type="text"
                    {...register("city")}
                    error={errors.city ? true : false}
                  />
                  <FormHelperText>
                    {" "}
                    {errors.city && errors.city.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid md={4} xs={12}>
                <FormControl>
                  <FormLabel>State</FormLabel>
                  <Input
                    type="text"
                    {...register("state")}
                    error={errors.state ? true : false}
                  />
                  <FormHelperText>
                    {" "}
                    {errors.state && errors.state.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid md={3} xs={12}>
                <FormControl>
                  <FormLabel>Pin Code</FormLabel>
                  <Input
                    type="number"
                    {...register("postal_code")}
                    error={errors.postal_code ? true : false}
                  />
                  <FormHelperText>
                    {" "}
                    {errors.postal_code && errors.postal_code.message}
                  </FormHelperText>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Stack direction="column" gap="1rem" flex="0.8">
          <Box
            sx={{
              border: "1px solid var(--bs-gray-300)",
              borderRadius: "12px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack
              justifyContent="space-between"
              direction="row"
              alignItems="center"
              m="0.8rem"
            >
              <Typography level="title-md">Fee Details (Locked)</Typography>
              <IconButton
                onClick={() =>
                  setAlertDialogOpen({
                    open: true,
                    caller: "PAYMENT",
                    keyRequired: false,
                  })
                }
              >
                <Edit size="20" />
              </IconButton>
            </Stack>
            <Divider />
            <Box sx={{ p: "1rem" }}>
              <Grid container gap="1rem" justifyContent="space-between">
                <Grid md={5.5}>
                  <FormControl>
                    <FormLabel required>Monthly Fee</FormLabel>
                    <Input
                      type="number"
                      startDecorator={"Rs."}
                      {...register("monthly_fee", { valueAsNumber: true })}
                      error={errors.monthly_fee ? true : false}
                      disabled={paymentDetailsChangeBlocked}
                    />
                    <FormHelperText>
                      {errors.monthly_fee && errors.monthly_fee.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid md={5.5}>
                  <FormControl>
                    <FormLabel>Transport Fee</FormLabel>
                    <Input
                      type="number"
                      startDecorator={"Rs."}
                      {...register("transportation_fee", {
                        valueAsNumber: true,
                      })}
                      disabled={paymentDetailsChangeBlocked}
                      error={errors.transportation_fee ? true : false}
                    />
                    <FormHelperText>
                      {errors.transportation_fee &&
                        errors.transportation_fee.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
              <Grid
                container
                gap="1rem"
                mt="1rem"
                justifyContent="space-between"
              >
                <Grid md={5.5}>
                  <FormControl>
                    <FormLabel>Computer Fee</FormLabel>
                    <Input
                      type="number"
                      startDecorator={"Rs."}
                      {...register("computer_fee", { valueAsNumber: true })}
                      error={errors.computer_fee ? true : false}
                      disabled={paymentDetailsChangeBlocked}
                    />
                    <FormHelperText>
                      {errors.computer_fee && errors.computer_fee.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid md={5.5}>
                  <FormControl>
                    <FormLabel>Student Discount</FormLabel>
                    <Input
                      type="number"
                      startDecorator={"Rs."}
                      {...register("fee_discount", { valueAsNumber: true })}
                      error={errors.fee_discount ? true : false}
                      disabled={paymentDetailsChangeBlocked}
                    />
                    <FormHelperText>
                      {errors.fee_discount && errors.fee_discount.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box
            sx={{
              flex: "0.8",
              border: "1px solid var(--bs-gray-300)",
              borderRadius: "12px",
            }}
          >
            <Stack
              justifyContent="space-between"
              direction="row"
              alignItems="center"
              m="0.8rem"
            >
              <Typography level="title-md">
                Admission Details (Locked)
              </Typography>
              <IconButton
                onClick={() =>
                  setAlertDialogOpen({
                    open: true,
                    caller: "ADMISSION",
                    keyRequired: true,
                  })
                }
              >
                <Edit size="20" />
              </IconButton>
            </Stack>
            <Divider />
            <Box sx={{ p: "1rem" }}>
              <Grid container sx={{ justifyContent: "space-between" }}>
                <Grid md={4} xs={12}>
                  <FormControl error={errors.class ? true : false}>
                    <FormLabel required>Class</FormLabel>
                    <Controller
                      name="class"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          value={value}
                          placeholder="student current class"
                          onChange={(e, val) => onChange(val)}
                          disabled={admissionDetailsChangeBlocked}
                        >
                          {SCHOOL_CLASSES.map((item) => {
                            return (
                              <Option key={item.id} value={item.value}>
                                {item.title}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    />
                    <FormHelperText>
                      {errors.class && errors.class.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid md={4} xs={12}>
                  <FormControl error={errors.section ? true : false}>
                    <FormLabel>Section</FormLabel>
                    <Controller
                      name="section"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <Select
                          placeholder="student section"
                          value={value}
                          onChange={(e, val) => onChange(val)}
                          disabled={admissionDetailsChangeBlocked}
                        >
                          {SCHOOL_SECTIONS.map((item) => {
                            return (
                              <Option key={item.id} value={item.value}>
                                {item.title}
                              </Option>
                            );
                          })}
                        </Select>
                      )}
                    />
                    <FormHelperText>
                      {errors.section && errors.section.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid md={3} xs={12}>
                  <FormControl>
                    <FormLabel>Roll Number</FormLabel>
                    <Input
                      type="text"
                      {...register("class_roll")}
                      error={errors.class_roll ? true : false}
                      disabled={admissionDetailsChangeBlocked}
                    />
                    <FormHelperText>
                      {errors.class_roll && errors.class_roll.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box
            sx={{
              flex: "0.8",
              border: "1px solid var(--bs-gray-300)",
              borderRadius: "12px",
            }}
          >
            <Stack
              justifyContent="space-between"
              direction="row"
              alignItems="center"
              m="0.8rem"
            >
              <Typography level="title-md">Update Profile Picture</Typography>
            </Stack>
            <Divider />
            <Box
              sx={{
                p: "1rem",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <Avatar
                alt="Remy Sharp"
                sx={{ "--Avatar-size": "6rem" }}
                src={studentData.profil_url}
              />
              <Button
                component="label"
                role={undefined}
                tabIndex={-1}
                variant="outlined"
                color="neutral"
                sx={{ height: "20px" }}
                startDecorator={
                  <SvgIcon>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z"
                      />
                    </svg>
                  </SvgIcon>
                }
              >
                Choose Profile Photo
                <VisuallyHiddenInput type="file" />
              </Button>
            </Box>
          </Box>
        </Stack>
      </Box>
      <Box
        sx={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "flex-end",
          justifyContent: "end",
          mt: "2rem",
        }}
      >
        <Button variant="outlined">Cancel</Button>
        <Button variant="solid" type="submit" loading={isUpdating}>
          Update Profile
        </Button>
      </Box>
      <Modal
        open={alertDialogOpen.open}
        onClose={() =>
          setAlertDialogOpen({ open: false, caller: null, keyRequired: false })
        }
      >
        <ModalDialog variant="outlined" role="alertdialog">
          <DialogTitle>
            <Warning2 />
            Information
          </DialogTitle>
          <Divider />
          <DialogContent>
            Warning! it seems you are going to do ciritical change, are you sure
            ?
            {alertDialogOpen.keyRequired ? (
              <FormControl sx={{ mt: "1rem", mb: "1rem" }}>
                <FormLabel>Enter Change Key</FormLabel>
                <Input
                  placeholder="enter change key"
                  value={changeKeyInput}
                  onChange={(e) => setChangeKeyInput(e.target.value)}
                ></Input>
                <FormHelperText>
                  Key will be required to change these values, please contact
                  admin.
                </FormHelperText>
                {changeKeyAccessError === "" ? null : (
                  <Alert
                    variant="soft"
                    color="danger"
                    sx={{ mt: "1rem" }}
                    startDecorator={<LockIcon />}
                  >
                    {changeKeyAccessError}
                  </Alert>
                )}
                {/* <Typography level="body-sm" mt="1rem" color="danger"> */}

                {/* </Typography> */}
              </FormControl>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button
              variant="solid"
              color="danger"
              onClick={() => {
                if (
                  alertDialogOpen.caller &&
                  alertDialogOpen.caller === "PAYMENT"
                ) {
                  setPaymentDetailsChangeBlocked(!paymentDetailsChangeBlocked);
                  setAlertDialogOpen({
                    open: false,
                    caller: null,
                    keyRequired: false,
                  });
                  enqueueSnackbar("Edit Option Enabled For Payment Details !", {
                    variant: "success",
                  });
                } else if (
                  alertDialogOpen.caller &&
                  alertDialogOpen.caller === "ADMISSION"
                ) {
                  if (changeKeyInput === "123456") {
                    setAdmissionDetailsChangeBlocked(
                      !admissionDetailsChangeBlocked
                    );
                    setAlertDialogOpen({
                      open: false,
                      caller: null,
                      keyRequired: false,
                    });
                    enqueueSnackbar(
                      "Edit Option Enabled For Admission Details !",
                      {
                        variant: "success",
                      }
                    );
                  } else {
                    setChangeKeyAccessError(
                      "Incorrect key , please try again!"
                    );
                  }
                }
              }}
            >
              Agree
            </Button>
            <Button
              variant="plain"
              color="neutral"
              onClick={() =>
                setAlertDialogOpen({
                  open: false,
                  caller: null,
                  keyRequired: false,
                })
              }
            >
              Cancel
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </Box>
  );
};

export default PersonalTab;
