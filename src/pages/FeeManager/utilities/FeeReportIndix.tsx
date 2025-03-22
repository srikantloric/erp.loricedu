import { Grid } from "@mui/joy";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { generateDueReciept2 } from "components/DueRecieptGenerator/DueRecieptGenerator2";
// import { DueRecieptList } from "components/DueRecieptGenerator/DueRecieptList";
import { useEffect, useState } from "react";
import { DueRecieptPropsType } from "types/student";

interface Indexdata {
    column1: string;
    column2: string;
    clickHandler: () => void;
}

const sampleObjects1: DueRecieptPropsType[] = [
    {
      reciept_id: "RCPT12345",
      current_session: "2023-2024",
      due_date: "15",
      due_month: "January",
      student_name: "John Doe",
      class: "Class 10",
      father_name: "Michael Doe",
      dob: "1998-05-15",
      phone_number: 1234567890,
      roll_number: 101,
      admission_no: "AD-9876",
      section: "A",
      address: "123 Main St, City, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 2500 },
        { title: "Activity Fee", value: 500 },
        { title: "Library Fee", value: 300 },
      ],
      note: "Please submit the due amount by the due date.",
    },
    {
      reciept_id: "RCPT12345",
      current_session: "2023-2024",
      due_date: "15",
      due_month: "January",
      student_name: "John Doe",
      class: "Class 10",
      father_name: "Michael Doe",
      dob: "1998-05-15",
      phone_number: 1234567890,
      roll_number: 101,
      admission_no: "AD-9876",
      section: "A",
      address: "123 Main St, City, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 2500 },
        { title: "Activity Fee", value: 500 },
        { title: "Library Fee", value: 300 },
      ],
      note: "Please submit the due amount by the due date.",
    },
    {
      reciept_id: "RCPT12345",
      current_session: "2023-2024",
      due_date: "15",
      due_month: "January",
      student_name: "John Doe",
      class: "Class 10",
      father_name: "Michael Doe",
      dob: "1998-05-15",
      phone_number: 1234567890,
      roll_number: 101,
      admission_no: "AD-9876",
      section: "A",
      address: "123 Main St, City, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 2500 },
        { title: "Activity Fee", value: 500 },
        { title: "Library Fee", value: 300 },
      ],
      note: "Please submit the due amount by the due date.",
    },
    {
      reciept_id: "RCPT12345",
      current_session: "2023-2024",
      due_date: "15",
      due_month: "January",
      student_name: "John Doe",
      class: "Class 10",
      father_name: "Michael Doe",
      dob: "1998-05-15",
      phone_number: 1234567890,
      roll_number: 101,
      admission_no: "AD-9876",
      section: "A",
      address: "123 Main St, City, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 2500 },
        { title: "Activity Fee", value: 500 },
        { title: "Library Fee", value: 300 },
      ],
      note: "Please submit the due amount by the due date.",
    },
    {
      reciept_id: "RCPT12345",
      current_session: "2023-2024",
      due_date: "15",
      due_month: "January",
      student_name: "John Doe",
      class: "Class 10",
      father_name: "Michael Doe",
      dob: "1998-05-15",
      phone_number: 1234567890,
      roll_number: 101,
      admission_no: "AD-9876",
      section: "A",
      address: "123 Main St, City, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 2500 },
        { title: "Activity Fee", value: 500 },
        { title: "Library Fee", value: 300 },
      ],
      note: "Please submit the due amount by the due date.",
    },
    {
      reciept_id: "RCPT12345",
      current_session: "2023-2024",
      due_date: "15",
      due_month: "January",
      student_name: "John Doe",
      class: "Class 10",
      father_name: "Michael Doe",
      dob: "1998-05-15",
      phone_number: 1234567890,
      roll_number: 101,
      admission_no: "AD-9876",
      section: "A",
      address: "123 Main St, City, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 2500 },
        { title: "Activity Fee", value: 500 },
        { title: "Library Fee", value: 300 },
      ],
      note: "Please submit the due amount by the due date.",
    },
    {
      reciept_id: "RCPT54321",
      current_session: "2023-2024",
      due_date: "20",
      due_month: "February",
      student_name: "Jane Smith",
      class: "Class 8",
      father_name: "David Smith",
      dob: "1999-03-20",
      phone_number: 9876543210,
      roll_number: 202,
      admission_no: "AD-6543",
      section: "B",
      address: "456 Elm St, Town, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 3000 },
        { title: "Activity Fee", value: 600 },
        { title: "Sports Fee", value: 400 },
      ],
      note: "Kindly make the payment before the due date.",
    },
    {
      reciept_id: "RCPT54321",
      current_session: "2023-2024",
      due_date: "20",
      due_month: "February",
      student_name: "Jane Smith",
      class: "Class 8",
      father_name: "David Smith",
      dob: "1999-03-20",
      phone_number: 9876543210,
      roll_number: 202,
      admission_no: "AD-6543",
      section: "B",
      address: "456 Elm St, Town, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 3000 },
        { title: "Activity Fee", value: 600 },
        { title: "Sports Fee", value: 400 },
      ],
      note: "Kindly make the payment before the due date.",
    },
    {
      reciept_id: "RCPT54321",
      current_session: "2023-2024",
      due_date: "20",
      due_month: "February",
      student_name: "Jane Smith",
      class: "Class 8",
      father_name: "David Smith",
      dob: "1999-03-20",
      phone_number: 9876543210,
      roll_number: 202,
      admission_no: "AD-6543",
      section: "B",
      address: "456 Elm St, Town, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 3000 },
        { title: "Activity Fee", value: 600 },
        { title: "Sports Fee", value: 400 },
      ],
      note: "Kindly make the payment before the due date.",
    },
    {
      reciept_id: "RCPT54321",
      current_session: "2023-2024",
      due_date: "20",
      due_month: "February",
      student_name: "Jane Smith",
      class: "Class 8",
      father_name: "David Smith",
      dob: "1999-03-20",
      phone_number: 9876543210,
      roll_number: 202,
      admission_no: "AD-6543",
      section: "B",
      address: "456 Elm St, Town, Country",
      fee_heads: [
        { title: "Tuition Fee", value: 3000 },
        { title: "Activity Fee", value: 600 },
        { title: "Sports Fee", value: 400 },
      ],
      note: "Kindly make the payment before the due date.",
    },
  ];


function FeeRecieptIndex() {

    const [pdfUrl, setPdfUrl] = useState<string>("");
  // const [pdfUrl1, setPdfUrl1] = useState<string>("");

    const getPdfUrl = async () => {
        // const pdfRes = await generateDueReciept(sampleObjects);
        const pdfRes = await generateDueReciept2(sampleObjects1);
        setPdfUrl(pdfRes);
      };
    
      useEffect(() => {
        getPdfUrl();
      }, []);
    
      const handleNewWindowOpen = () => {
        const features =
          "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
    
        window.open(pdfUrl, "_blank", features);
      };
    
    
      const getPdfUrl1 = async () => {
        // const pdfRes1 = await DueRecieptList(sampleObjects1);
        // setPdfUrl1(pdfRes1);
      };
    
      useEffect(() => {
        getPdfUrl1();
      }, []);
    
      const handleDueRecieptList=()=>{
        // const features1 =
        //   "width=600,height=400,toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes";
    
        // window.open(pdfUrl1, "_blank", features1);
      };

      const rowData: Indexdata[] = [
        { column1: '1', column2: 'Generate Due Reciept', clickHandler: () => handleNewWindowOpen() },
        { column1: '2', column2: 'DueReciept List', clickHandler: () => handleDueRecieptList() },
    ];

    return (
        <>
            <Grid container spacing={2} marginTop={2}>
                <Paper
                    sx={{
                        padding: "8px",
                        height: "100%",
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                    }}
                >
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>S No.</TableCell>
                                    <TableCell>Receipt Title</TableCell>
                                    <TableCell>Reciept Links</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rowData.map((row, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{row.column1}</TableCell>
                                        <TableCell>{row.column2}</TableCell>
                                        <TableCell>
                                            <a onClick={row.clickHandler} style={{textDecoration:"underline",color:"var(--bs-primary)",cursor:"pointer"}}>Get Reciept</a>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>
            </Grid>
        </>
    )
}

export default FeeRecieptIndex;