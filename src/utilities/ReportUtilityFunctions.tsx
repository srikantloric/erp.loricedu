import { getFirestoreInstance } from "context/firebaseUtility";
import { collection, query, where, getDocs } from "firebase/firestore";
import { IChallanNL } from "types/payment";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue, makeDoubleDigit } from "./UtilitiesFunctions";
import { DemandSlipType } from "types/reports";
import { enqueueSnackbar } from "notistack";
import { SCHOOL_FEE_MONTHS, SCHOOL_SESSIONS } from "config/schoolConfig";
import { DueReportRow } from "components/Tables/DueReportTable";


export const getDemandSlips = async (selectedClass: number): Promise<DemandSlipType[]> => {
    const db = await getFirestoreInstance();
    // Get all students of selected class
    const studentCollection = collection(db, "STUDENTS");
    const studentQuery = query(studentCollection, where("class", "==", selectedClass));
    const studentSnap = await getDocs(studentQuery);


    if (studentSnap.empty) {
        enqueueSnackbar("No student found in the selected class", { variant: "error" })
        return [];
    }

    const demandSlipArray: DemandSlipType[] = [];

    for (const student of studentSnap.docs) {
        const studentData = student.data() as StudentDetailsType;
        if (!studentData.generatedChallans) continue;

        if (studentData.generatedChallans.length > 0) {
            // Get all challans for the student
            const challanCollRef = collection(db, `STUDENTS/${studentData.id}/CHALLANS`);
            const challans = await getDocs(challanCollRef);

            // Consolidate fee headers with dues
            const consolidatedFeeHeaders: { [key: string]: number } = {};
            const consolidatedDueMonths: string[] = [];

            challans.forEach((challan) => {
                const challanData = challan.data() as IChallanNL;
                // Check if challan status is PARTIAL or UNPAID
                if (challanData.status.toUpperCase() === "PAID") {
                    return
                }
                // Sum up fee headers with dues
                challanData.feeHeaders.forEach(header => {
                    consolidatedFeeHeaders[header.headerTitle] =
                        (consolidatedFeeHeaders[header.headerTitle] || 0) + header.amount - header.amountPaidTotal;
                });
                consolidatedDueMonths.push(challanData.challanTitle)
            });
            if (Object.keys(consolidatedFeeHeaders).length > 0) {
                // Add consolidated demand slip to the array
                demandSlipArray.push({
                    recieptId: `CONSOLIDATED-${studentData.id}`,
                    studentDetails: {
                        studentName: studentData.student_name,
                        class: getClassNameByValue(studentData.class!) || "N/A",
                        fatherName: studentData.father_name,
                        dob: studentData.dob,
                        phoneNumber: studentData.contact_number,
                        rollNumber: studentData.class_roll,
                        admissionNo: studentData.admission_no,
                        section: studentData.section,
                        address: studentData.address,
                    },
                    currentSession: "2025-26",
                    dueMonths: consolidatedDueMonths,
                    feeHeaders: Object.entries(consolidatedFeeHeaders).map(([header, amount]) => ({
                        header,
                        amount,
                    })),
                });
            }
        } else {
            continue;
        }
    }

    return demandSlipArray;
};


//Get Dues List By Class and Months

export async function GetDueListByClassAndMonths(className: number, selectedMonths: number[], selectedSession: string) {
    const db = await getFirestoreInstance();
    const dueList: any[] = [];
    try {
        // Query students based on class
        const studentsRef = collection(db, "STUDENTS");
        const studentQuery = query(studentsRef, where("class", "==", className), where("is_active", "==", true));
        const studentSnapshot = await getDocs(studentQuery);

        if (studentSnapshot.empty) {
            enqueueSnackbar("No students found for this class.", { variant: "warning" });
            return dueList;
        }

        // Only show columns for selected months
        const selectedMonthObjs = SCHOOL_FEE_MONTHS.filter(m => selectedMonths.includes(m.value));

        // For each student, fetch challan data for selected months
        const studentRows = await Promise.all(studentSnapshot.docs.map(async (studentDoc, idx) => {
            const studentData = studentDoc.data() as StudentDetailsType;

            const studentId = studentDoc.id;
            let paid = 0;
            let dues = 0;
            let duesTotal: number = 0;

            const dueMonths: { month: string, value: number }[] = [];

            const studentChallanRef = collection(db, `STUDENTS/${studentId}/CHALLANS`)

            //Fetch all challans for the student
            const studentAllChallans = await getDocs(studentChallanRef);

            //No challan found for student
            if (studentAllChallans.size === 0) return;


            //all challans for student
            const challansArray: any[] = []
            studentAllChallans.forEach((challan) => {
                const challanData = challan.data();
                challansArray.push(challanData);
                const challanDue = (challanData.totalAmount || 0) - (challanData.amountPaid || 0) - (challanData.feeDiscount || 0) - (challanData.feeConsession || 0);
                if (challanDue > 0) {
                    duesTotal += challanDue
                }
            })


            for (const monthObj of selectedMonthObjs) {
                // Determine the correct year for the challan based on the month and session
                let challanYear = "";
                if (monthObj.value >= 4 && monthObj.value <= 12) {
                    challanYear = selectedSession?.split("-")[0] || "";
                } else {
                    challanYear = selectedSession?.split("-")[1] || "";
                }
                const constructedChallanId = `CHALLAN${makeDoubleDigit("" + monthObj.value)}${challanYear}`;
                let monthPaid = 0;
                let monthDue = 0;

                if (studentData?.generatedChallans?.includes(constructedChallanId)) {
                    // const challanRef = doc(db, `STUDENTS/${studentId}/CHALLANS`, constructedChallanId);
                    // const challanSnap = await getDoc(challanRef);
                    // const challanData = challanSnap.data();
                    const challanData = challansArray.find((item) => item.challanId === constructedChallanId)


                    if (challanData) {
                        monthPaid = challanData.amountPaid || 0;
                        monthDue = (challanData.totalAmount || 0) - (challanData.amountPaid || 0) - (challanData.feeDiscount || 0) - (challanData.feeConsession || 0);
                    }
                }
                if (monthDue > 0) {
                    dueMonths.push({ month: monthObj.title, value: monthDue });
                }
                paid += monthPaid;
                dues += monthDue > 0 ? monthDue : 0;
            }

            // Build row for DueReportTable, only include dueMonths array
            const row: DueReportRow = {
                sl: idx + 1,
                name: studentData.student_name,
                fname: studentData.father_name,
                contact: studentData.contact_number,
                duesTotal,
                paid,
                dues,
                dueMonths,
            };
            return row;
        }));

        dueList.push(...studentRows);
        enqueueSnackbar("Report generated successfully!", { variant: "success" });
        return dueList;

    } catch (error) {
        enqueueSnackbar("Failed to generate report.", { variant: "error" });
        console.error("Error fetching due list:", error);
        return [];
    }
}


export async function GetDueListByClassAndSessions(className: number, selectedSession: string, selectedSessions: string[]) {
    const db = await getFirestoreInstance();
    const dueList: any[] = [];
    try {
        // Query students based on class
        const studentsRef = collection(db, "STUDENTS");
        const studentQuery = query(studentsRef, where("class", "==", className), where("is_active", "==", true));
        const studentSnapshot = await getDocs(studentQuery);

        if (studentSnapshot.empty) {
            enqueueSnackbar("No students found for this class.", { variant: "warning" });
            return dueList;
        }


        // Only show columns for selected months
        const selectedSeesionsObj = SCHOOL_SESSIONS.filter(m => selectedSessions.includes(m.value));

        const studentRows = await Promise.all(studentSnapshot.docs.map(async (studentDoc, idx) => {
            const studentData = studentDoc.data() as StudentDetailsType;

            const studentId = studentDoc.id;
            let paid = 0;
            let dues = 0;
            let duesTotal: number = 0;

            const studentChallanRef = collection(db, `STUDENTS/${studentId}/CHALLANS`)

            //Fetch all challans for the student
            const studentAllChallans = await getDocs(studentChallanRef);

            //No challan found for student
            if (studentAllChallans.size === 0) return;


            //all challans for student
            const challansArray: any[] = []
            studentAllChallans.forEach((challan) => {
                const challanData = challan.data();
                challansArray.push(challanData);
                const challanDue = (challanData.totalAmount || 0) - (challanData.amountPaid || 0) - (challanData.feeDiscount || 0) - (challanData.feeConsession || 0);
                if (challanDue > 0) {
                    duesTotal += challanDue
                }
            })


            const dueSessions: { session: string, value: number }[] = [];
            for (const sessionObj of selectedSeesionsObj) {
                // For each session, get all months for that session
                const monthsForSession = SCHOOL_FEE_MONTHS; // or filter if you want specific months per session

                let sessionDue = 0;

                for (const monthObj of monthsForSession) {
                    // Determine the correct year for the challan based on the month and session
                    let challanYear = "";
                    if (monthObj.value >= 4 && monthObj.value <= 12) {
                        challanYear = sessionObj.value.split("-")[0] || "";
                    } else {
                        challanYear = sessionObj.value.split("-")[1] || "";
                    }
                    const constructedChallanId = `CHALLAN${makeDoubleDigit("" + monthObj.value)}${challanYear}`;
                    let monthPaid = 0;
                    let monthDue = 0;

                    if (studentData?.generatedChallans?.includes(constructedChallanId)) {
                        const challanData = challansArray.find((item) => item.challanId === constructedChallanId);

                        if (challanData) {
                            monthPaid = challanData.amountPaid || 0;
                            monthDue = (challanData.totalAmount || 0) - (challanData.amountPaid || 0) - (challanData.feeDiscount || 0) - (challanData.feeConsession || 0);
                        }
                    }
                    sessionDue += monthDue > 0 ? monthDue : 0;
                    paid += monthPaid;
                    dues += monthDue > 0 ? monthDue : 0;
                }
                if (sessionDue > 0) {
                    dueSessions.push({ session: sessionObj.title, value: sessionDue });
                }
            }

            // Build row for DueReportTable, only include dueMonths array
            const row: DueReportRow = {
                sl: idx + 1,
                name: studentData.student_name,
                fname: studentData.father_name,
                contact: studentData.contact_number,
                duesTotal,
                paid,
                dues,
                dueSessions,
            };
            return row;

        }));
        return studentRows

    } catch (error) {
        enqueueSnackbar("Failed to generate report.", { variant: "error" });
        console.error("Error fetching due list:", error);
        return [];
    }
}