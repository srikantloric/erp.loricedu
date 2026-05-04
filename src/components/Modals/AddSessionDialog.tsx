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
  Switch,
  Typography,
  Card,
  CardContent,
} from "@mui/joy";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SessionType } from "types/session";
import { useState } from "react";
import { enqueueSnackbar } from "notistack";

const validationSchema = Yup.object({
  name: Yup.string(),
  value: Yup.string(),
  startDate: Yup.string().required("Start date is required"),
  endDate: Yup.string().required("End date is required"),
  isActive: Yup.boolean(),
  isLocked: Yup.boolean(),
});

interface AddSessionDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (session: SessionType) => void;
}

export function AddSessionDialog({ open, onClose, onSubmit }: AddSessionDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate session name and value from dates
  const generateSessionData = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return { name: "", value: "" };

    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();
    const endYearSuffix = endYear.toString().slice(-2);

    return {
      name: `${startYear}-${endYearSuffix}`,
      value: `${startYear}_${endYear}`,
    };
  };

  const formik = useFormik({
    initialValues: {
      name: "",
      value: "",
      startDate: "",
      endDate: "",
      isActive: true,
      isLocked: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const session: SessionType = {
          ...values,
          createdAt: Date.now(),
        };
        onSubmit(session);
        formik.resetForm();
      } catch (error) {
        enqueueSnackbar("Failed to add session. Please try again.", { variant: "error" });
        console.error("Error adding session:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  const handleDateChange = (field: "startDate" | "endDate") => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    formik.setFieldValue(field, value);

    // Auto-generate session name and value when dates are set
    const startDate = field === "startDate" ? value : formik.values.startDate;
    const endDate = field === "endDate" ? value : formik.values.endDate;

    if (startDate && endDate) {
      const { name, value: sessionValue } = generateSessionData(startDate, endDate);
      formik.setFieldValue("name", name);
      formik.setFieldValue("value", sessionValue);
    }
  };

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ width: 600, maxWidth: "95vw", p: 3, maxHeight: "90vh", overflow: "auto" }}>
        <DialogTitle>Add New Session</DialogTitle>
        <DialogContent>
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={3}>
              {/* Dates */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <FormControl sx={{ flex: 1 }} error={!!formik.errors.startDate && formik.touched.startDate}>
                  <FormLabel>Start Date *</FormLabel>
                  <Input
                    name="startDate"
                    type="date"
                    onChange={handleDateChange("startDate")}
                    value={formik.values.startDate}
                  />
                  {formik.errors.startDate && formik.touched.startDate && (
                    <Typography level="body-sm" color="danger">
                      {formik.errors.startDate}
                    </Typography>
                  )}
                </FormControl>
                <FormControl sx={{ flex: 1 }} error={!!formik.errors.endDate && formik.touched.endDate}>
                  <FormLabel>End Date *</FormLabel>
                  <Input
                    name="endDate"
                    type="date"
                    onChange={handleDateChange("endDate")}
                    value={formik.values.endDate}
                  />
                  {formik.errors.endDate && formik.touched.endDate && (
                    <Typography level="body-sm" color="danger">
                      {formik.errors.endDate}
                    </Typography>
                  )}
                </FormControl>
              </Stack>

              {/* Settings */}
              <Card variant="outlined">
                <CardContent>
                  <Typography level="title-md" mb={2}>
                    Settings
                  </Typography>
                  <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack>
                        <Typography level="body-md">Active Status</Typography>
                        <Typography level="body-sm" color="neutral">
                          Is this session currently active?
                        </Typography>
                      </Stack>
                      <Switch
                        checked={formik.values.isActive}
                        onChange={(event) => formik.setFieldValue("isActive", event.target.checked)}
                      />
                    </Stack>

                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Stack>
                        <Typography level="body-md">Locked Status</Typography>
                        <Typography level="body-sm" color="neutral">
                          Prevent modifications to this session
                        </Typography>
                      </Stack>
                      <Switch
                        checked={formik.values.isLocked}
                        onChange={(event) => formik.setFieldValue("isLocked", event.target.checked)}
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>

              <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mt: 3 }}>
                <Button
                  variant="plain"
                  color="neutral"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
                  {isSubmitting ? "Adding Session..." : "Add Session"}
                </Button>
              </Stack>
            </Stack>
          </form>
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
