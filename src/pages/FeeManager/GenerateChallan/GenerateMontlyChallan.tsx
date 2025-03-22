import { Check, Close } from "@mui/icons-material";
import {
  Avatar,
  Button,
  FormControl,
  FormLabel,
  Grid,
  Input,
  LinearProgress,
  Option,
  Select,
  Table,
} from "@mui/joy";
import { Box, Checkbox, FormControlLabel, Paper } from "@mui/material";
import { IconAdjustmentsExclamation } from "@tabler/icons-react";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import HeaderTitleCard from "components/Card/HeaderTitleCard";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { SCHOOL_CLASSES, SCHOOL_FEE_MONTHS } from "config/schoolConfig";
import { db } from "../../../firebase";
import { useState } from "react";

import { StudentDetailsType } from "types/student";
import {
  generateChallanDocId,
  getChallanTitle,
  getPaymentDueDate,
} from "utilities/UtilitiesFunctions";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { IChallanNL } from "types/payment";
import { generateFeeHeadersForChallan } from "utilities/PaymentUtilityFunctions";

type StudentFeeDataType = {
  studentData: StudentDetailsType;
  isGenerated: boolean;
  errorLog: string;
};

function GenerateMonthlyChallan() {
  const [loading, setLoading] = useState(false);
  //form State
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [studentData, setStudentData] = useState<StudentFeeDataType[]>([]);
  const [paymentDueDate, setPaymentDueDate] = useState<string>(
    getPaymentDueDate()
  );
  const [lateFine, setLateFine] = useState<number>(0);

  const handleFetch = async (e: any) => {
    e.preventDefault();
    setStudentData([]);
    setLoading(true);

    try {
      const challanDocId = generateChallanDocId(selectedMonth!, selectedYear!);
      const studentsRef = collection(db, "STUDENTS");
      const q = query(studentsRef, where("class", "==", selectedClass));
      const documentSnap = await getDocs(q);

      if (!documentSnap.empty) {
        const tempStudentArray: StudentFeeDataType[] = [];

        documentSnap.forEach((snap) => {
          const docData = snap.data() as StudentDetailsType;
          const isAlreadyGenerated =
            docData.generatedChallans?.includes(challanDocId);

          tempStudentArray.push({
            studentData: docData,
            isGenerated: !!isAlreadyGenerated,
            errorLog: isAlreadyGenerated ? "already generated" : "_",
          });
        });

        setStudentData(tempStudentArray);
      } else {
        enqueueSnackbar("No records found!", { variant: "info" });
      }
    } catch (error) {
      enqueueSnackbar(`Error: ${error}`, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const generateFee = async () => {
    if (studentData.length === 0) return;

    const challanDocId = generateChallanDocId(selectedMonth!, selectedYear!);
    const tempArr: StudentFeeDataType[] = [];
    const batch = writeBatch(db);

    try {
      for (const student of studentData) {
        if (!student.isGenerated) {
          const { totalFeeAmount, feeHeaderList } = generateFeeHeadersForChallan(
            student.studentData,
            lateFine
          );

          const challan: IChallanNL = {
            challanTitle: getChallanTitle(selectedMonth!, selectedYear!),
            studentId: student.studentData.id,
            challanId: challanDocId,
            feeHeaders: feeHeaderList,
            totalAmount: totalFeeAmount,
            amountPaid: 0,
            status: "UNPAID",
            createdBy: "Admin",
            createdOn: Timestamp.now(),
            dueDate: Timestamp.fromDate(new Date(paymentDueDate)),
            feeDiscount: student.studentData.fee_discount || 0,
            feeConsession: 0,
          };

          const studentPaymentRef = doc(
            db,
            "STUDENTS",
            student.studentData.id,
            "CHALLANS",
            challanDocId
          );

          batch.set(studentPaymentRef, challan);

          // Update generatedChallans array in STUDENTS document
          const studentDocRef = doc(db, "STUDENTS", student.studentData.id);
          const updatedChallans = student.studentData.generatedChallans
            ? [...student.studentData.generatedChallans, challanDocId]
            : [challanDocId];

          batch.update(studentDocRef, { generatedChallans: updatedChallans });

          tempArr.push({
            isGenerated: true,
            studentData: student.studentData,
            errorLog: "Generated successfully",
          });
        } else {
          tempArr.push({
            isGenerated: false,
            studentData: student.studentData,
            errorLog: "Monthly/Computer/Trans. not found",
          });
        }
      }

      await batch.commit();
      setStudentData(tempArr);
      enqueueSnackbar("Challans generated successfully!", { variant: "success" });
    } catch (error) {
      console.error("Error during batch commit:", error);
      enqueueSnackbar(`Error: ${error}`, { variant: "error" });
    }
  };

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV2
          Icon={IconAdjustmentsExclamation}
          Path="Accountings/Generate Monthly Fee"
        />
        <HeaderTitleCard Title="Generate Monthly Fee" />
        <br />
        <Paper sx={{ pl: 2, pr: 2, pt: 2, pb: 3 }}>
          <Box component="form" onSubmit={handleFetch}>
            <Grid container spacing={2} sx={{ flexGrow: 1 }}>
              <Grid xs={2}>
                <FormControl>
                  <FormLabel>Select Class</FormLabel>
                  <Select
                    defaultValue={null}
                    value={selectedClass}
                    placeholder="select class.."
                    onChange={(e, val) => setSelectedClass(val)}
                    required
                  >
                    {SCHOOL_CLASSES.map((item, index) => {
                      return (
                        <Option key={index} value={item.value}>
                          {item.title}
                        </Option>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={2}>
                <FormControl>
                  <FormLabel>Select Month</FormLabel>
                  <Select
                    defaultValue={null}
                    value={selectedMonth}
                    placeholder="select month.."
                    onChange={(e, val) => setSelectedMonth(val)}
                    required
                  >
                    {SCHOOL_FEE_MONTHS.map((item, index) => {
                      return (
                        <Option key={index} value={item.value}>
                          {item.title}
                        </Option>
                      );
                    })}
                  </Select>
                </FormControl>
              </Grid>
              <Grid xs={2}>
                <FormControl>
                  <FormLabel>Select Year</FormLabel>
                  <Select
                    defaultValue={null}
                    value={selectedYear}
                    placeholder="select year.."
                    onChange={(e, val) => setSelectedYear(val)}
                    required
                  >
                    <Option value="2024">2024</Option>
                    <Option value="2023">2023</Option>
                    <Option value="2022">2022</Option>
                    <Option value="2021">2021</Option>
                    <Option value="2020">2020</Option>
                    <Option value="2019">2019</Option>
                  </Select>
                </FormControl>
              </Grid>

              <Grid xs={2}>
                <FormControl>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    type="date"
                    required
                    value={paymentDueDate}
                    placeholder="select due date.."
                    onChange={(e) => setPaymentDueDate(e.currentTarget.value)}
                  />
                </FormControl>
              </Grid>
              <Grid xs={2}>
                <FormControl>
                  <FormLabel>Late Fine</FormLabel>
                  <Input
                    type="number"
                    required
                    value={lateFine}
                    onChange={(e) =>
                      setLateFine(parseInt(e.currentTarget.value))
                    }
                  />
                </FormControl>
              </Grid>
              <FormControlLabel
                sx={{ ml: 1 }}
                control={<Checkbox defaultChecked />}
                label="Include Transportation Fee"
              />
              <br />
              <Button
                type="submit"
                variant="soft"
                sx={{ ml: 1, mt: 1 }}
                loading={loading}
              >
                Fetch
              </Button>
              {studentData.length > 0 ? (
                <Button onClick={generateFee} sx={{ ml: 1, mt: 1 }}>
                  Generate Fee
                </Button>
              ) : null}
            </Grid>
          </Box>
        </Paper>
        <br />

        {loading ? (
          <LinearProgress
            sx={{
              "--LinearProgress-thickness": "4px",
            }}
          />
        ) : null}

        {studentData.length > 0 ? (
          <Table
            aria-label="basic table"
            stripe="even"
            sx={{
              "& tr > *:not(:first-child)": { textAlign: "center" },
              maxHeight: "60vh",
            }}
          >
            <thead>
              <tr>
                <th style={{ width: "50px" }}>Profile</th>
                <th>ID</th>
                <th>Name</th>
                <th>DOB</th>
                <th>Father</th>
                <th>Status</th>
                <th style={{ width: "200px" }}>message</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((student: StudentFeeDataType) => {
                return (
                  <tr>
                    <td>
                      <Avatar size="sm" src={student.studentData.profil_url} />
                    </td>
                    <td>{student.studentData.admission_no}</td>
                    <td>{student.studentData.student_name}</td>
                    <td>{student.studentData.dob}</td>
                    <td>{student.studentData.father_name}</td>
                    <td>
                      {student.isGenerated ? (
                        <Check color="success" />
                      ) : (
                        <Close color="error" />
                      )}
                    </td>
                    <td>{student.errorLog}</td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : null}
      </LSPage>
    </PageContainer>
  );
}

export default GenerateMonthlyChallan;
