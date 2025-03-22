import { Modal } from "@mui/joy"
import { Box,Typography, Tabs, Tab, Card, Chip, Grid ,List, ListItem,Stack } from "@mui/material";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { StudentDetailsType, StudentFeeDetailsType } from "types/student";
import Styles from './StudentProfileDetailsModal.module.scss'
import CheckIcon from "@mui/icons-material/Check";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";


//tabs

function getClassName(classNumber:Number) {
  switch (classNumber) {
    case 1:
      return "Nursery";

    case 2:
      return "LKG";

    case 3:
      return "UKG";

    case 4:
      return "STD-1";

    case 5:
      return "STD-2";

    case 6:
      return "STD-3";

    case 7:
      return "STD-4";

    case 8:
      return "STD-5";

    case 9:
      return "STD-6";

    case 10:
      return "STD-7";

    case 11:
      return "STD-8";

    case 12:
      return "STD-9";

    case 13:
      return "STD-10";

    default:
      break;
  }
}
function CustomTabPanel(props:any) {
  const { children, value, index, ...other } = props;
  
 
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
        {children}
        </Box>
      )}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index:Number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface ComponentProps {
  selectedRowData:StudentDetailsType
  handleStudentProfileModalClose:()=>void
}

  //payment detail
  const paymentdetailStudent = (paymentcards:StudentFeeDetailsType, index:number) => {
    return (
      
      <Card
      key={index}
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          height: "80px",
          padding:"10px 10px",
          margin:"10px 0 0 0",
          backgroundColor: "var(--bs-success-border-subtle)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Chip
              avatar={
                <CheckIcon style={{ color: "white", fontSize: "8px" }} />
              }
              label="Paid"
              sx={{
                backgroundColor: "var(--bs-success)",
                fontSize: "15px",
                color: "#fff",
              }}
            ></Chip>
            <div style={{width:"100%"}}>
            <h5 style={{ fontSize: "19px" }}>
              &#8377;{paymentcards.paid_amount}
            </h5>
            </div>
          </div>

          <div className={Styles.paymentDate}>
            {/* <p>{paymentcards.payment_date&&paymentcards.payment_date.toDate().toLocaleDateString()}</p> */}
            <p>TXN ID {paymentcards.id}</p>
          </div>
        </div>
        <div
          className={Styles.paymentRightPart}
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <h4>Late Fine: {paymentcards.late_fee}</h4>
          <p>Payment Credited By :{paymentcards.credit_by.toUpperCase()}</p>
        </div>
      </Card>
      
    );
  };

//main componenet
const StudentProfileDetailsModal = ({selectedRowData,handleStudentProfileModalClose}:ComponentProps)=> {

  const [feeDetails,setFeeDetails] = useState<StudentFeeDetailsType[]>();
  const [value, setValue] = useState(0);

    //Get Firebase DB instance
    const {db} = useFirebase();


  const handleChange = (event:any, newValue:number) => {
    setValue(newValue);
  };


  useEffect(() => {
    const userDocId = selectedRowData?.id;
    if (!userDocId) {
      return;
    }
  
    console.log("Fetching Student Fee Details");
  
    
    const paymentsRef = collection(doc(db, "STUDENTS", userDocId), "PAYMENTS");
  
    const unsubscribe = onSnapshot(paymentsRef, (snapshot) => {
      if (!snapshot.empty) {
        const feeArr: StudentFeeDetailsType[] = snapshot.docs.map((doc) => doc.data() as StudentFeeDetailsType);
        setFeeDetails(feeArr);
      } else {
        // enqueueSnackbar("Fee details not found for this student!", { variant: "error" });
        setFeeDetails([]);
      }
    });
  
    return () => unsubscribe(); // Cleanup listener
  
  }, [selectedRowData?.id]); // Dependency array includes userDocId



  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "60%",
    minHeight: "550px",
    bgcolor: "background.paper",
    boxShadow: 15,
    borderRadius: 1,
    p: 3,
  };
 




  return (
    <Modal
    keepMounted
    open={true}
    onClose={handleStudentProfileModalClose}
    aria-labelledby="keep-mounted-modal-title"
    aria-describedby="keep-mounted-modal-description"
    sx={{ minHeight: "400px" }}
  >
    <Box sx={style}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
        }}
      
      >
        <img
          src={selectedRowData.profil_url}
          width={90}
          height="100%"
          style={{ objectFit: "cover" }}
          alt="orient-icon"
        />

        <div
          style={{
            padding: "0px 10px",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            flexDirection: "column",
          }}
        >
          <Typography
            variant="h6"
            fontSize={20}
            fontWeight={700}
            sx={{ margin: 0, p: 0 }}
          >
            {selectedRowData.student_name.toUpperCase()}
          </Typography>

          <div
            style={{
              backgroundColor: "var(--bs-secondary)",
              color: "#fff",
              display: "flex",
              width: "100%",
              padding: "6px",
              fontSize: "15px",
            }}
          >
            <div>
              <p style={{ padding: 3, margin: 0 }}>Date Of Birth</p>
              <p style={{ padding: 3, margin: 0 }}>Date Of Admission</p>
              <p style={{ padding: 3, margin: 0 }}>Contact</p>
            </div>
            <div>
              <p style={{ padding: 3, margin: 0 }}>
                : {selectedRowData.dob}
              </p>
              <p style={{ padding: 3, margin: 0 }}>
                : {selectedRowData.date_of_addmission}
              </p>
              <p style={{ padding: 3, margin: 0 }}>
                : {selectedRowData.contact_number}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Box sx={{ width: "100%" }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Basic Info" {...a11yProps(0)} />
            <Tab label="Parent Info" {...a11yProps(1)} />
            <Tab label="Exam Marks" {...a11yProps(2)} />
            <Tab label="Payments This Year" {...a11yProps(3)} />
          </Tabs>
        </Box>
      </Box>
      <CustomTabPanel value={value} index={0}>
      <Grid item xs={12}>
            
              <List sx={{ py: 0 }}>
                <ListItem >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack >
                        <Typography color="secondary" fontSize={12}>Full Name</Typography>
                        <Typography>{selectedRowData.student_name} </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={1}>
                        <Typography color="secondary" fontSize={12}>Class</Typography>
                        <Typography>{getClassName(selectedRowData.class!)} {selectedRowData.section}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary" fontSize={12}>Student Id</Typography>
                        <Typography>
                        {selectedRowData.student_id}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary" fontSize={12}>Birth date</Typography>
                        <Typography>{selectedRowData.dob}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem >
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary" fontSize={12}>Email</Typography>
                        <Typography>{selectedRowData.email}</Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Stack spacing={0.5}>
                        <Typography color="secondary" fontSize={12}>Blood Group</Typography>
                        <Typography>{selectedRowData.blood_group}</Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </ListItem>
                <ListItem>
                  <Stack spacing={0.5}>
                    <Typography color="secondary" fontSize={12}>Address</Typography>
                    <Typography>{selectedRowData.address}</Typography>
                  </Stack>
                </ListItem>
              </List>
            
      </Grid>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
      <Grid item xs={12}>
            
            <List sx={{ py: 0 }}>
              <ListItem >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary" fontSize={12}>Father Name</Typography>
                      <Typography>{selectedRowData.father_name}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Typography color="secondary" fontSize={12}>Father Occupation</Typography>
                      <Typography>{selectedRowData.father_occupation}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary" fontSize={12}>Mother Name</Typography>
                      <Typography>
                      {selectedRowData.mother_name}
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary" fontSize={12}>Mother Occupation</Typography>
                      <Typography>{selectedRowData.mother_occupation}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem >
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary" fontSize={12}>Email</Typography>
                      <Typography>{selectedRowData.email}</Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Stack spacing={0.5}>
                      <Typography color="secondary" fontSize={12}>Contact Number</Typography>
                      <Typography>{selectedRowData.contact_number}</Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </ListItem>
              <ListItem>
                <Stack spacing={0.5}>
                  <Typography color="secondary" fontSize={12}>Address</Typography>
                  <Typography>{selectedRowData.address}</Typography>
                </Stack>
              </ListItem>
            </List>
          
    </Grid>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        No details found
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}
      
      >
        <Grid sx={{overflowY:"scroll"}}>

        <div>{feeDetails?feeDetails.map(paymentdetailStudent):"No fee details found"}</div>
        </Grid>
      </CustomTabPanel>
    </Box>
  </Modal>
  )
}

export default StudentProfileDetailsModal