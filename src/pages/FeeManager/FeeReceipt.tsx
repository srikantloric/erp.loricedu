// import { Button } from "@mui/joy";
// import { generateDueReciept2 } from "components/DueRecieptGenerator/DueRecieptGenerator2";
// import Navbar from "components/Navbar/Navbar";
// import LSPage from "components/Utils/LSPage";
// import PageContainer from "components/Utils/PageContainer";
// import { useEffect, useState } from "react";
// import { DueRecieptPropsType } from "types/student";
// // import { DueRecieptList } from "components/DueRecieptGenerator/DueRecieptList";
// import FeeRecieptIndex from "./utilities/FeeReportIndix";
// import { AdmitCardGenerator } from "components/Reports/AdmitCard";

// function FeeReceipt() {
//   const [pdfUrl, setPdfUrl] = useState<string>("");
//   // const [pdfUrl1, setPdfUrl1] = useState<string>("");
//   const [pdfUrl2, setPdfUrl2] = useState<string>("");
//   const sampleObjects: DueRecieptPropsType[] = [
//     {
//       reciept_id: "RCPT12345",
//       current_session: "2023-2024",
//       due_date: "15",
//       due_month: "January",
//       student_name: "John Doe",
//       class: "Class 10",
//       father_name: "Michael Doe",
//       dob: "1998-05-15",
//       phone_number: 1234567890,
//       roll_number: 101,
//       admission_no: "AD-9876",
//       section: "A",
//       address: "123 Main St, City, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 2500 },
//         { title: "Activity Fee", value: 500 },
//         { title: "Library Fee", value: 300 },
//       ],
//       note: "Please submit the due amount by the due date.",
//     },
//     {
//       reciept_id: "RCPT12345",
//       current_session: "2023-2024",
//       due_date: "15",
//       due_month: "January",
//       student_name: "John Doe",
//       class: "Class 10",
//       father_name: "Michael Doe",
//       dob: "1998-05-15",
//       phone_number: 1234567890,
//       roll_number: 101,
//       admission_no: "AD-9876",
//       section: "A",
//       address: "123 Main St, City, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 2500 },
//         { title: "Activity Fee", value: 500 },
//         { title: "Library Fee", value: 300 },
//       ],
//       note: "Please submit the due amount by the due date.",
//     },
//     {
//       reciept_id: "RCPT12345",
//       current_session: "2023-2024",
//       due_date: "15",
//       due_month: "January",
//       student_name: "John Doe",
//       class: "Class 10",
//       father_name: "Michael Doe",
//       dob: "1998-05-15",
//       phone_number: 1234567890,
//       roll_number: 101,
//       admission_no: "AD-9876",
//       section: "A",
//       address: "123 Main St, City, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 2500 },
//         { title: "Activity Fee", value: 500 },
//         { title: "Library Fee", value: 300 },
//       ],
//       note: "Please submit the due amount by the due date.",
//     },
//     {
//       reciept_id: "RCPT12345",
//       current_session: "2023-2024",
//       due_date: "15",
//       due_month: "January",
//       student_name: "John Doe",
//       class: "Class 10",
//       father_name: "Michael Doe",
//       dob: "1998-05-15",
//       phone_number: 1234567890,
//       roll_number: 101,
//       admission_no: "AD-9876",
//       section: "A",
//       address: "123 Main St, City, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 2500 },
//         { title: "Activity Fee", value: 500 },
//         { title: "Library Fee", value: 300 },
//       ],
//       note: "Please submit the due amount by the due date.",
//     },
//     {
//       reciept_id: "RCPT12345",
//       current_session: "2023-2024",
//       due_date: "15",
//       due_month: "January",
//       student_name: "John Doe",
//       class: "Class 10",
//       father_name: "Michael Doe",
//       dob: "1998-05-15",
//       phone_number: 1234567890,
//       roll_number: 101,
//       admission_no: "AD-9876",
//       section: "A",
//       address: "123 Main St, City, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 2500 },
//         { title: "Activity Fee", value: 500 },
//         { title: "Library Fee", value: 300 },
//       ],
//       note: "Please submit the due amount by the due date.",
//     },
//     {
//       reciept_id: "RCPT12345",
//       current_session: "2023-2024",
//       due_date: "15",
//       due_month: "January",
//       student_name: "John Doe",
//       class: "Class 10",
//       father_name: "Michael Doe",
//       dob: "1998-05-15",
//       phone_number: 1234567890,
//       roll_number: 101,
//       admission_no: "AD-9876",
//       section: "A",
//       address: "123 Main St, City, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 2500 },
//         { title: "Activity Fee", value: 500 },
//         { title: "Library Fee", value: 300 },
//       ],
//       note: "Please submit the due amount by the due date.",
//     },
//     {
//       reciept_id: "RCPT54321",
//       current_session: "2023-2024",
//       due_date: "20",
//       due_month: "February",
//       student_name: "Jane Smith",
//       class: "Class 8",
//       father_name: "David Smith",
//       dob: "1999-03-20",
//       phone_number: 9876543210,
//       roll_number: 202,
//       admission_no: "AD-6543",
//       section: "B",
//       address: "456 Elm St, Town, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 3000 },
//         { title: "Activity Fee", value: 600 },
//         { title: "Sports Fee", value: 400 },
//       ],
//       note: "Kindly make the payment before the due date.",
//     },
//     {
//       reciept_id: "RCPT54321",
//       current_session: "2023-2024",
//       due_date: "20",
//       due_month: "February",
//       student_name: "Jane Smith",
//       class: "Class 8",
//       father_name: "David Smith",
//       dob: "1999-03-20",
//       phone_number: 9876543210,
//       roll_number: 202,
//       admission_no: "AD-6543",
//       section: "B",
//       address: "456 Elm St, Town, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 3000 },
//         { title: "Activity Fee", value: 600 },
//         { title: "Sports Fee", value: 400 },
//       ],
//       note: "Kindly make the payment before the due date.",
//     },
//     {
//       reciept_id: "RCPT54321",
//       current_session: "2023-2024",
//       due_date: "20",
//       due_month: "February",
//       student_name: "Jane Smith",
//       class: "Class 8",
//       father_name: "David Smith",
//       dob: "1999-03-20",
//       phone_number: 9876543210,
//       roll_number: 202,
//       admission_no: "AD-6543",
//       section: "B",
//       address: "456 Elm St, Town, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 3000 },
//         { title: "Activity Fee", value: 600 },
//         { title: "Sports Fee", value: 400 },
//       ],
//       note: "Kindly make the payment before the due date.",
//     },
//     {
//       reciept_id: "RCPT54321",
//       current_session: "2023-2024",
//       due_date: "20",
//       due_month: "February",
//       student_name: "Jane Smith",
//       class: "Class 8",
//       father_name: "David Smith",
//       dob: "1999-03-20",
//       phone_number: 9876543210,
//       roll_number: 202,
//       admission_no: "AD-6543",
//       section: "B",
//       address: "456 Elm St, Town, Country",
//       fee_heads: [
//         { title: "Tuition Fee", value: 3000 },
//         { title: "Activity Fee", value: 600 },
//         { title: "Sports Fee", value: 400 },
//       ],
//       note: "Kindly make the payment before the due date.",
//     },
//   ];

//   const getPdfUrl = async () => {
//     // const pdfRes = await generateDueReciept(sampleObjects);
//     const pdfRes = await generateDueReciept2(sampleObjects);
//     setPdfUrl(pdfRes);
//   };

//   useEffect(() => {
//     getPdfUrl();
//   }, []);

//   const handleNewWindowOpen = () => {
//     // Specify window features
//     const features =
//       "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
//     window.open(pdfUrl, "_blank", features);
//   };

//   const getPdfUrl1 = async () => {
//     // const pdfRes1 = await DueRecieptList(sampleObjects);
//     // setPdfUrl1(pdfRes1);
//   };

//   useEffect(() => {
//     getPdfUrl1();
//   }, []);

//   const handleDueRecieptList = () => {
//     // const features1 =
//     //   "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";

//     // window.open(pdfUrl1, "_blank", features1);
//   };

//   const getPdfUrl2 = async () => {
//     const pdfRes2 = await AdmitCardGenerator(sampleObjects);
//     setPdfUrl2(pdfRes2);
//   };

//   useEffect(() => {
//     getPdfUrl2();
//   }, []);

//   const handleViewAdmitcard = () => {
//     const features2 =
//       "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";

//     window.open(pdfUrl2, "_blank", features2);
//   };

//   return (
//     <PageContainer>
//       <Navbar />
//       <LSPage>
//         <Button onClick={handleNewWindowOpen}>Generate Due Reciept</Button>
//         <br />
//         <br />
//         <Button onClick={handleDueRecieptList}>Due Reciept List</Button>
//         <br />
//         <br />
//         <Button onClick={handleViewAdmitcard}>View Admit Card</Button>
//         <br />
//         <br />

//         <FeeRecieptIndex />
//       </LSPage>
//     </PageContainer>
//   );
// }

// export default FeeReceipt;



function FeeReceipt() {
  return (
    <div>FeeReceipt</div>
  )
}

export default FeeReceipt