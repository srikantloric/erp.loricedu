// services/firestore.attendance.ts

import { SCHOOL_CLASSES } from "config/schoolConfig";
import { getFirestoreInstance } from "context/firebaseUtility";
import { collection, doc, getCountFromServer, getDoc, getDocs, query, where } from "firebase/firestore";
import { AttendanceStatus, AttendanceSummary, ClassAttendanceSummary, StudentAttendance } from "types/AttendanceType";

export async function getStudentsWithAttendance(
    classId: number,
    date: string
): Promise<StudentAttendance[]> {
    const db = await getFirestoreInstance()

    // 1. Load students
    const studentsSnap = await getDocs(
        query(collection(db, "STUDENTS"), where("class", "==", classId))
    );

    const students = studentsSnap.docs.map((doc) => ({
        studentId: doc.id,
        ...(doc.data() as any),
    }));

    // 2. Load attendance for this class/date
    const attSnap = await getDocs(
        collection(
            db,
            "ATTENDANCE_DAILY",
            date,
            "CLASSES",
            classId.toString(),
            "STUDENTS"
        )
    );

    const attendanceMap = new Map<string, any>();
    attSnap.forEach((d) => attendanceMap.set(d.id, d.data()));

    // 3. Merge
    const merged: StudentAttendance[] = students.map((stu: any) => {
        const att = attendanceMap.get(stu.studentId);


        const uiMapped = reverseMapping(att?.status);

        return {
            admissionNo: stu.admission_no,
            profilePicUrl: stu.profil_url || undefined,
            studentId: stu.id,
            name: stu.student_name,
            classId: stu.class,
            status: att?.status || undefined,
            present: att?.present || false,
            firstIn: att?.firstIn || null,
            lastOut: att?.lastOut || null,

            // ⭐ UI state
            selected_option: uiMapped || "P",

            // ⭐ NEW: Track actual original status for change detection
            originalStatus: att?.status || null,

            // ⭐ NEW: Easy check for UI to decide if event should be sent
            hasChanged: false,
            comment: "",
        };
    });

    return merged;
}

function reverseMapping(status?: AttendanceStatus): string {
    switch (status) {
        case "PRESENT":
            return "P";
        case "ABSENT":
            return "A";
        case "HOLIDAY":
            return "H";
        case "LEAVE":
            return "L";
        case "HALF_DAY":
            return "S"; // Sunday/Half Day
        default:
            return "P";
    }
}

export async function getAttendanceSummary(
    date: string
): Promise<AttendanceSummary> {
    const db = await getFirestoreInstance()
    let totalStudents = 0;
    try {
        const studentsRef = collection(db, "STUDENTS");
        const q = query(studentsRef);
        const snapshot = await getCountFromServer(q);
        totalStudents = snapshot.data().count;
    } catch (error) {
        console.error("Error fetching count:", error);
        throw error;
    }
    const summaryRef = doc(
        db,
        "ATTENDANCE_SUMMARY_DAILY",
        date,
    );

    const snapshot = await getDoc(summaryRef);

    const data = snapshot.data();
    if (data) {
        return {
            totalPresent: data.present || 0,
            totalAbsent: totalStudents - (data.present || 0),
            totalOnLeave: data.leave || 0,
        };
    } else {
        return {
            totalPresent: 0,
            totalAbsent: totalStudents,
            totalOnLeave: 0,
        };
    }
}

export async function getClassWiseAttendanceSummary(date: string): Promise<ClassAttendanceSummary[]> {
    const db = await getFirestoreInstance();

    const results: ClassAttendanceSummary[] = [];

    for (const cls of SCHOOL_CLASSES) {
        const classRef = doc(
            db,
            "ATTENDANCE_SUMMARY_DAILY",
            date,
            "CLASSES",
            cls.value.toString()
        );

        const snap = await getDoc(classRef);

        if (snap.exists()) {
            const data = snap.data() as any;

            results.push({
                classId: cls.value,
                className: cls.title,
                present: data.present || 0,
                absent: data.absent || 0,
                leave: data.leave || 0,
                half_day: data.half_day || 0,
                holiday: data.holiday || 0,
                total: data.total || 0,
            });
        } else {
            // Default data when class has not submitted attendance
            results.push({
                classId: cls.value,
                className: cls.title,
                present: 0,
                absent: 0,
                leave: 0,
                half_day: 0,
                holiday: 0,
                total: 0,
            });
        }
    }

    return results;
}