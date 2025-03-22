// import { Check, Close } from "@mui/icons-material";
// import {
//   Avatar,
//   Button,
//   FormControl,
//   FormLabel,
//   Grid,
//   Input,
//   LinearProgress,
//   Option,
//   Select,
//   Table,
// } from "@mui/joy";
// import { Box, Checkbox, FormControlLabel, Paper } from "@mui/material";
// import { IconAdjustmentsExclamation } from "@tabler/icons-react";
// import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
// import HeaderTitleCard from "components/Card/HeaderTitleCard";
// import Navbar from "components/Navbar/Navbar";
// import LSPage from "components/Utils/LSPage";
// import PageContainer from "components/Utils/PageContainer";
// import { SCHOOL_CLASSES, SCHOOL_FEE_MONTHS } from "config/schoolConfig";
// import { db } from "../../../firebase";
// import { useState } from "react";

// import { StudentDetailsType, StudentFeeDetailsType } from "types/student";
// import {
//   generateAlphanumericUUID,
//   getMonthTitleByValue,
//   getPaymentDueDate,
//   makeDoubleDigit,
// } from "utilities/UtilitiesFunctions";
// import firebase from "firebase";
// import { FEE_TYPE_MONTHLY } from "constants/index";
// import { enqueueSnackbar } from "notistack";

// type StudentFeeDataType = {
//   studentData: StudentDetailsType;
//   isGenerated: boolean;
//   errorLog: string;
// };

// function GenerateMonthlyFee() {
//   const [loading, setLoading] = useState(false);
//   //form State
//   const [selectedClass, setSelectedClass] = useState<number | null>(null);
//   const [selectedYear, setSelectedYear] = useState<string | null>();
//   const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
//   const [studentData, setStudentData] = useState<StudentFeeDataType[]>([]);
//   const [paymentDueDate, setPaymentDueDate] = useState<string>(
//     getPaymentDueDate()
//   );
//   const [lateFine, setLateFine] = useState<number>(0);

//   const handleFetch = async (e: any) => {
//     e.preventDefault();
//     //Reset old state
//     setStudentData([]);

//     const feeString =
//       "FEE" +
//       selectedYear +
//       makeDoubleDigit(selectedMonth!.toString()) +
//       FEE_TYPE_MONTHLY;
//     setLoading(true);
//     db.collection("STUDENTS")
//       .where("class", "==", selectedClass)
//       .get()
//       .then((documetSnap) => {
//         if (!documetSnap.empty) {
//           let tempStudentArray: StudentFeeDataType[] = [];
//           documetSnap.forEach((snap) => {
//             const docData = snap.data() as StudentDetailsType;
//             if (docData.generated_fee != undefined) {
//               if (!docData.generated_fee.includes(feeString)) {
//                 tempStudentArray.push({
//                   studentData: docData,
//                   isGenerated: false,
//                   errorLog: "_",
//                 });
//               } else {
//                 tempStudentArray.push({
//                   studentData: docData,
//                   isGenerated: true,
//                   errorLog: "already generated",
//                 });
//               }
//             } else {
//               tempStudentArray.push({
//                 studentData: docData,
//                 isGenerated: false,
//                 errorLog: "_",
//               });
//             }
//           });
//           setLoading(false);
//           setStudentData(tempStudentArray);
//         } else {
//           enqueueSnackbar("No records found !", { variant: "info" });
//           setLoading(false);
//         }
//       })
//       .catch((e: any) => {
//         enqueueSnackbar("Error" + e, { variant: "error" });
//       });
//   };
//   const generateFee = () => {
//     //challan string
//     const feeString =
//       "CHALLAN" +
//       selectedYear +
//       makeDoubleDigit(selectedMonth!.toString()) +
//       FEE_TYPE_MONTHLY;

      
//     if (studentData.length > 0) {
//       const tempArr: StudentFeeDataType[] = [];
//       studentData.forEach(async (student) => {
//         if (!student.isGenerated) {
//           // Create payment entry in subcollection 'PAYMENTS'
//           const subCollDocId = generateAlphanumericUUID(30);
//           const paymentData: StudentFeeDetailsType = {
//             id: "" + Math.floor(100000 + Math.random() * 900000),
//             doc_id: subCollDocId,
//             student_id: student.studentData.student_id,
//             credit_by: "",
//             fee_title: getMonthTitleByValue(selectedMonth!)!.toString(),
//             fee_total: student.studentData.monthly_fee!,
//             computer_fee: student.studentData.computer_fee,
//             late_fee: lateFine,
//             created_at: firebase.firestore.FieldValue.serverTimestamp(),
//             fee_month_year: "" + selectedMonth + "/" + selectedYear,
//             is_payment_done: false,
//             payment_due_date: paymentDueDate,
//             fee_header_type: feeString,
//             ///Initial fields
//             payment_remarks: "",
//             payment_date: null,
//             payment_mode: "",
//             paid_amount: 0,
//             discount_amount: 0,
//             ///extra fee header
//             transportation_fee: 0,
//             admission_fee: 0,
//             exam_fee: 0,
//             other_fee: 0,
//             annual_fee: 0,
//           };

//           try {
//             await db
//               .collection("STUDENTS")
//               .doc(student.studentData.id)
//               .collection("PAYMENTS")
//               .doc(subCollDocId)
//               .set(paymentData);
//             // Update generatedFees array in STUDENTS document
//             await db
//               .collection("STUDENTS")
//               .doc(student.studentData.id)
//               .update({
//                 generated_fee: [
//                   ...student.studentData.generated_fee,
//                   feeString,
//                 ],
//               });
//             const successData: StudentFeeDataType = {
//               isGenerated: true,
//               studentData: student.studentData,
//               errorLog: "_",
//             };
//             tempArr.push(successData);
//           } catch (e) {
//             console.log("ERROR While Generating Fee", e);
//             const failureData: StudentFeeDataType = {
//               isGenerated: false,
//               studentData: student.studentData,
//               errorLog: "Error while generating",
//             };
//             tempArr.push(failureData);
//           }
//         } else {
//           const successData: StudentFeeDataType = {
//             isGenerated: true,
//             studentData: student.studentData,
//             errorLog: "_",
//           };
//           tempArr.push(successData);
//         }
//       });

//       setStudentData(tempArr);
//     }
//   };

//   return (
//     <PageContainer>
//       <Navbar />
//       <LSPage>
//         <BreadCrumbsV2
//           Icon={IconAdjustmentsExclamation}
//           Path="Accountings/Generate Monthly Fee"
//         />
//         <HeaderTitleCard Title="Generate Monthly Fee" />
//         <br />
//         <Paper sx={{ pl: 2, pr: 2, pt: 2, pb: 3 }}>
//           <Box component="form" onSubmit={handleFetch}>
//             <Grid container spacing={2} sx={{ flexGrow: 1 }}>
//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>Select Class</FormLabel>
//                   <Select
//                     defaultValue={null}
//                     value={selectedClass}
//                     placeholder="select class.."
//                     onChange={(e, val) => setSelectedClass(val)}
//                     required
//                   >
//                     {SCHOOL_CLASSES.map((item, index) => {
//                       return (
//                         <Option key={index} value={item.value}>
//                           {item.title}
//                         </Option>
//                       );
//                     })}
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>Select Month</FormLabel>
//                   <Select
//                     defaultValue={null}
//                     value={selectedMonth}
//                     placeholder="select month.."
//                     onChange={(e, val) => setSelectedMonth(val)}
//                     required
//                   >
//                     {SCHOOL_FEE_MONTHS.map((item, index) => {
//                       return (
//                         <Option key={index} value={item.value}>
//                           {item.title}
//                         </Option>
//                       );
//                     })}
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>Select Year</FormLabel>
//                   <Select
//                     defaultValue={null}
//                     value={selectedYear}
//                     placeholder="select year.."
//                     onChange={(e, val) => setSelectedYear(val)}
//                     required
//                   >
//                     <Option value="2024">2024</Option>
//                   </Select>
//                 </FormControl>
//               </Grid>

//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>Due Date</FormLabel>
//                   <Input
//                     type="date"
//                     required
//                     value={paymentDueDate}
//                     placeholder="select due date.."
//                     onChange={(e) => setPaymentDueDate(e.currentTarget.value)}
//                   />
//                 </FormControl>
//               </Grid>
//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>Late Fine</FormLabel>
//                   <Input
//                     type="number"
//                     required
//                     value={lateFine}
//                     onChange={(e) =>
//                       setLateFine(parseInt(e.currentTarget.value))
//                     }
//                   />
//                 </FormControl>
//               </Grid>
//               <FormControlLabel
//                 sx={{ ml: 1 }}
//                 control={<Checkbox defaultChecked />}
//                 label="Include Transportation Fee"
//               />
//               <br />
//               <Button
//                 type="submit"
//                 variant="soft"
//                 sx={{ ml: 1, mt: 1 }}
//                 loading={loading}
//               >
//                 Fetch
//               </Button>
//               {studentData.length > 0 ? (
//                 <Button onClick={generateFee} sx={{ ml: 1, mt: 1 }}>
//                   Generate Fee
//                 </Button>
//               ) : null}
//             </Grid>
//           </Box>
//         </Paper>
//         <br />

//         {loading ? (
//           <LinearProgress
//             sx={{
//               "--LinearProgress-thickness": "4px",
//             }}
//           />
//         ) : null}

//         {studentData.length > 0 ? (
//           <Table
//             aria-label="basic table"
//             stripe="even"
//             sx={{
//               "& tr > *:not(:first-child)": { textAlign: "center" },
//               maxHeight: "60vh",
//             }}
//           >
//             <thead>
//               <tr>
//                 <th style={{ width: "100px" }}>Profile</th>
//                 <th>ID</th>
//                 <th>Name</th>
//                 <th>DOB</th>
//                 <th>Father</th>
//                 <th>Status</th>
//                 <th>error</th>
//               </tr>
//             </thead>
//             <tbody>
//               {studentData.map((student: StudentFeeDataType) => {
//                 return (
//                   <tr>
//                     <td>
//                       <Avatar size="sm" src={student.studentData.profil_url} />
//                     </td>
//                     <td>{student.studentData.admission_no}</td>
//                     <td>{student.studentData.student_name}</td>
//                     <td>{student.studentData.dob}</td>
//                     <td>{student.studentData.father_name}</td>
//                     <td>
//                       {student.isGenerated ? (
//                         <Check color="success" />
//                       ) : (
//                         <Close color="error" />
//                       )}
//                     </td>
//                     <td>{student.errorLog}</td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </Table>
//         ) : null}
//       </LSPage>
//     </PageContainer>
//   );
// }

// export default GenerateMonthlyFee;


function GenerateMonthlyFee() {
  return (
    <div>GenerateMonthlyFee</div>
  )
}

export default GenerateMonthlyFee