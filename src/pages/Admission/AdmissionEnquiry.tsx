import {
  Box,
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import ReadMoreIcon from "@mui/icons-material/ReadMore";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AddIcon from "@mui/icons-material/Add";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, Divider, Stack, Table, Tooltip } from "@mui/joy";
import { useNavigate } from "react-router-dom";
import DeleteForever from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { enqueueSnackbar } from "notistack";
import { Print } from "@mui/icons-material";
import { Timestamp } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

const schema = z.object({
  student_name: z.string().min(3),
  class: z.number(),

  contact_number: z
    .string()
    .regex(/^\d{10}$/, { message: "Invalid phone number" }),
  address: z.string().min(8),
  gender: z.string(),
  father_name: z.string().min(3),
  enquiry_notes: z.string(),
  doc_id: z.string().optional(),
  created_at: z
  .union([z.instanceof(Timestamp), z.undefined()])
  .optional(),
});

type EnquiryFormFields = z.infer<typeof schema>;

const AdmissionEnquiry = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EnquiryFormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      gender: "male",
      class: 1,
    },
  });
  const [enquiryData, setEnquiryData] = useState<EnquiryFormFields[]>([]);
  const [isNewEnquiryFromVisible, setIsNewEnquiryFormVisible] = useState(false);
  const { db } = useFirebase();
  
  const navigate = useNavigate();

  const onSubmit = async (data:any) => {
    data.created_at = serverTimestamp();
    try {
      await addDoc(collection(db, "ADMISSION_ENQUIRY"), data);
      handleFormReset();
      setIsNewEnquiryFormVisible(false);
      enqueueSnackbar("Student Admission Enquiry Added :)", { variant: "success" });
    } catch (e) {
      console.log("Error:", e);
    }
  };

  const handleFormReset = () => {
    reset({
      student_name: "",
      father_name: "",
      address: "",
      contact_number: "",
      enquiry_notes: "",
      class: -1,
      gender: "",
    });
  };

  ///Load Enquiries
  useEffect(() => {
    const q = query(collection(db, "ADMISSION_ENQUIRY"), orderBy("created_at", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tempEnquiryArray = snapshot.docs.map((document) => ({
        doc_id: document.id,
        ...document.data()
      }));
      setEnquiryData(tempEnquiryArray as EnquiryFormFields[]);
    });
  
    return () => unsubscribe();
  }, []);


  const processAdmision = (items: EnquiryFormFields) => {
    navigate(`add-students/${items.doc_id}`);
  };

  const deleteAdmision  = async (docid:string) => {
    try {
      await deleteDoc(doc(db, "ADMISSION_ENQUIRY", docid));
      enqueueSnackbar("Enquiry deleted from database", { variant: "success" });
    } catch (e) {
      console.log(e);
    }
  };
  

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV2 Path="Students/Admission Enquiry" Icon={PersonAddIcon} />
        <br />
        {isNewEnquiryFromVisible ? (
          <Paper
            sx={{ padding: "10px 30px", margin: "0px 10px " }}
            elevation={3}
          >
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <h3>Admission Enquiry</h3>

              <Button
                variant="plain"
                startDecorator={<CloseIcon />}
                size="sm"
                onClick={() => setIsNewEnquiryFormVisible(false)}
              />
            </Box>

            <form onSubmit={handleSubmit(onSubmit)}>
              {/* <span className={Styles.inputSeperator}>Personal Details</span> */}
              <Grid container spacing={2} marginTop={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    sx={{ width: "100%" }}
                    label="Name"
                    variant="outlined"
                    fullWidth
                    type="text"
                    error={errors.student_name ? true : false}
                    helperText={
                      errors.student_name && errors.student_name.message
                    }
                    {...register("student_name")}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-error" required>
                      Class
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-error-label"
                      id="demo-simple-select-error"
                      label="Class"
                      defaultValue={null}
                      {...register("class")}
                    >
                      {SCHOOL_CLASSES.map((item, index) => {
                        return (
                          <MenuItem value={item.value}>{item.title}</MenuItem>
                        );
                      })}
                    </Select>
                    <FormHelperText sx={{ color: "red" }}>
                      {errors.class && errors.class.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label" required>
                      Gender
                    </InputLabel>
                    <Select
                      labelId="demo-simple-select-label"
                      id="demo-simple-select"
                      label="Gender"
                      {...register("gender")}
                      error={errors.gender ? true : false}
                      defaultValue={null}
                    >
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="others">Others</MenuItem>
                    </Select>
                    <FormHelperText sx={{ color: "red" }}>
                      {errors.gender && errors.gender.message}
                    </FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    sx={{ width: "100%" }}
                    label="Fathers Name"
                    variant="outlined"
                    type="text"
                    {...register("father_name")}
                    error={errors.father_name ? true : false}
                    helperText={
                      errors.father_name && errors.father_name.message
                    }
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} marginTop={1}>
                <Grid item xs={12} md={4}>
                  <TextField
                    sx={{ width: "100%" }}
                    label="Mobile Number"
                    variant="outlined"
                    type="tel"
                    {...register("contact_number")}
                    error={errors.contact_number ? true : false}
                    helperText={
                      errors.contact_number && errors.contact_number.message
                    }
                  />
                </Grid>
                <Grid item xs={12} md={8}>
                  <TextField
                    sx={{ width: "100%" }}
                    label="Address"
                    variant="outlined"
                    type="text"
                    {...register("address", {
                      required: "Please enter address!",
                    })}
                    error={errors.address ? true : false}
                    helperText={errors.address && errors.address.message}
                  />
                </Grid>
                <Grid md={12} xs={12} marginBottom={2} item>
                  <TextField
                    type="text"
                    label="Notes"
                    sx={{ width: "100%" }}
                    variant="outlined"
                    multiline
                    rows={2}
                    {...register("enquiry_notes")}
                    error={errors.enquiry_notes ? true : false}
                    helperText={
                      errors.enquiry_notes && errors.enquiry_notes.message
                    }
                  ></TextField>
                </Grid>
              </Grid>
              <Grid sx={{ display: "flex", justifyContent: "end" }} item>
                <Button variant="soft" onClick={handleFormReset}>
                  Reset
                </Button>
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: "flex",
                    justifyContent: "start",
                    marginLeft: "1rem",
                  }}
                >
                  {/* {loading ? <CircularProgress /> : null} */}
                  <Button variant="solid" color="primary" type="submit">
                    Submit
                  </Button>
                </Grid>
              </Grid>
              <br></br>
            </form>
          </Paper>
        ) : null}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5" m={1}>
            Admission Enquires ({enquiryData && enquiryData.length})
          </Typography>
          <Box>
            <Button
              startDecorator={<AddIcon />}
              size="sm"
              sx={{ m: 2 }}
              onClick={() => setIsNewEnquiryFormVisible(true)}
            >
              Create New Enquiry
            </Button>
            <Button
              startDecorator={<Print />}
              target="_blank"
              color="success"
              component="a"
              href="https://firebasestorage.googleapis.com/v0/b/apx-international-dev.firebasestorage.app/o/documents%2Fadmission-form.pdf?alt=media&token=5fc17ec9-21f5-4dc1-a6ed-6bfe0a6df470"
            >
              Admission Form
            </Button>
          </Box>
        </Stack>
        <Divider />
        <Table sx={{ mb: 3 }} stripe="even">
          <thead>
            <tr>
              <th style={{ width: "10%" }}>Date</th>
              <th style={{ width: "15%" }}>Student Name</th>
              <th style={{ width: "8%" }}>Gender</th>
              <th style={{ width: "8%" }}>Class</th>
              <th>Contact</th>
              <th>Father</th>
              <th>Address</th>
              <th>Notes</th>
              <th style={{ textAlign: "end" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {enquiryData &&
              enquiryData.map((item: any, index) => {
                return (
                  <tr>
                    <td>{item && item.created_at?.toDate().toDateString()}</td>
                    <td>{item.student_name}</td>
                    <td>{item.gender}</td>
                    <td>{getClassNameByValue(item.class!)}</td>
                    <td>+91-{item.contact_number}</td>
                    <td>{item.father_name}</td>
                    <td>{item.address}</td>
                    <td>{item.enquiry_notes}</td>
                    <td style={{ textAlign: "end" }}>
                      <Tooltip title="Delete Enquiry" variant="soft">
                        <Button
                          startDecorator={<DeleteForever />}
                          size="sm"
                          variant="plain"
                          color="danger"
                          sx={{ mr: 1 }}
                          onClick={() => deleteAdmision(item.doc_id)}
                        />
                      </Tooltip>
                      <Tooltip title="Admit Student" variant="soft">
                        <Button
                          startDecorator={<ReadMoreIcon />}
                          onClick={() => processAdmision(item)}
                          size="sm"
                          color="success"
                        />
                      </Tooltip>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </LSPage>
    </PageContainer>
  );
};
export default AdmissionEnquiry;
