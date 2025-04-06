import { getFirestoreInstance } from "context/firebaseUtility";
import { collection, query, where, getDocs } from "firebase/firestore";
import { IChallanNL } from "types/payment";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue } from "./UtilitiesFunctions";
import { DemandSlipType } from "types/reports";


export const getDemandSlips = async (selectedClass: number): Promise<DemandSlipType[]> => {
    const db = await getFirestoreInstance();
    // Get all students of selected class
    const studentCollection = collection(db, "STUDENTS");
    const studentQuery = query(studentCollection, where("class", "==", selectedClass));
    const studentSnap = await getDocs(studentQuery);

    if (studentSnap.empty) {
        console.log("No students found for the selected class.");
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
                    consolidatedDueMonths.push(challanData.challanTitle)
                });


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

