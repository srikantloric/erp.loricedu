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
// import { Box,Paper } from "@mui/material";
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
//   getPaymentDueDate,
//   makeDoubleDigit,
// } from "utilities/UtilitiesFunctions";
// import firebase from "firebase";
// import { FEE_HEADERS} from "constants/index";
// import { enqueueSnackbar } from "notistack";

// type StudentFeeDataType = {
//   studentData: StudentDetailsType;
//   isGenerated: boolean;
//   errorLog: string;
// };

// function GenerateCustomFee() {
//   const [loading, setLoading] = useState(false);
//   //form State
//   const [selectedFeeHeader, setSelectedFeeHeader] = useState<string | null>(
//     null
//   );
//   const [selectedClass, setSelectedClass] = useState<number | null>(null);
//   const [selectedYear, setSelectedYear] = useState<string | null>();
//   const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
//   const [studentData, setStudentData] = useState<StudentFeeDataType[]>([]);
//   const [paymentDueDate, setPaymentDueDate] = useState<string>(
//     getPaymentDueDate()
//   );
//   const [lateFine, setLateFine] = useState<number>(0);
//   const [feeAmount, setFeeAmount] = useState<number>();



//   const handleFetch = async (e: any) => {
//     e.preventDefault();
//     //Reset old state
//     setStudentData([]);

//     const feeString =
//       "FEE" +
//       selectedYear +
//       makeDoubleDigit(selectedMonth!.toString()) +
//       selectedFeeHeader;
//     setLoading(true);
//     db.collection("STUDENTS")
//       .where("class", "==", selectedClass)
//       .get()
//       .then((documetSnap) => {
//         if (!documetSnap.empty) {
//           let tempStudentArray: StudentFeeDataType[] = [];
//           documetSnap.forEach((snap) => {
//             const docData = snap.data() as StudentDetailsType;
//             if (!docData.generated_fee.includes(feeString)) {
//               tempStudentArray.push({
//                 studentData: docData,
//                 isGenerated: false,
//                 errorLog: "_",
//               });
//             } else {
//               tempStudentArray.push({
//                 studentData: docData,
//                 isGenerated: true,
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
//     const feeString =
//       "FEE" +
//       selectedYear +
//       makeDoubleDigit(selectedMonth!.toString()) +
//       selectedFeeHeader;
//     if (studentData.length > 0) {
//       const tempArr: StudentFeeDataType[] = [];

//       studentData.forEach(async (student) => {
//         if (!student.isGenerated) {
//           // Create payment entry in subcollection 'PAYMENTS'
//           const subCollDocId = generateAlphanumericUUID(30);
//           const paymentData: StudentFeeDetailsType = {
//             credit_by: "",
//             student_id: student.studentData.student_id,
//             doc_id: subCollDocId,
//             discount_amount: 0,
//             fee_title: selectedFeeHeader!,
//             fee_total: 0,
//             transportation_fee: 0,
//             computer_fee: 0,
//             id: "" + Math.floor(100000 + Math.random() * 900000),
//             late_fee: 0,
//             paid_amount: 0,
//             payment_date: null,
//             created_at: firebase.firestore.FieldValue.serverTimestamp(),
//             payment_mode: "",
//             payment_remarks: "",
//             fee_month_year: "" + selectedMonth + "/" + selectedYear,
//             is_payment_done: false,
//             payment_due_date: paymentDueDate,
//             fee_header_type: feeString,
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
//           Path="Accountings/Generate Custom Fee"
//         />
//         <HeaderTitleCard Title="Generate Custom Fee" />
//         <br />
//         <Paper sx={{ pl: 2, pr: 2, pt: 2, pb: 3 }}>
//           <Box component="form" onSubmit={handleFetch}>
//             <Grid container spacing={2} sx={{ flexGrow: 1 }}>
//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>Fee Header</FormLabel>
//                   <Select
//                     defaultValue={null}
//                     required
//                     value={selectedFeeHeader}
//                     onChange={(e, val) => setSelectedFeeHeader(val)}
//                   >
//                     {FEE_HEADERS.map((item, key) => {
//                       return (
//                         <Option key={key} value={item.value}>
//                           {item.title}
//                         </Option>
//                       );
//                     })}
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>Select Class</FormLabel>
//                   <Select
//                     defaultValue={null}
//                     value={selectedClass}
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
//                   <Input type="date" required    value={paymentDueDate}
//                     onChange={(e) => setPaymentDueDate(e.currentTarget.value)}/>
//                 </FormControl>
//               </Grid>
//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>Late Fine</FormLabel>
//                   <Input type="number" required   value={lateFine}
//                     onChange={(e) =>
//                       setLateFine(parseInt(e.currentTarget.value))
//                     }/>
//                 </FormControl>
//               </Grid>
//               <Grid xs={2}>
//                 <FormControl>
//                   <FormLabel>FeeAmount</FormLabel>
//                   <Input type="number" required   value={feeAmount}
//                     onChange={(e) =>
//                       setFeeAmount(parseInt(e.currentTarget.value))
//                     }/>
//                 </FormControl>
//               </Grid>
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

// export default GenerateCustomFee;


function GenerateCustomFee() {
  return (
    <div>GenerateCustomFee</div>
  )
}

export default GenerateCustomFee
