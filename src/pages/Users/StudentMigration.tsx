import {
  Box,
  Button,
  Card,
  Checkbox,
  FormControl,
  FormLabel,
  LinearProgress,
  Modal,
  ModalClose,
  Option,
  Select,
  Stack,
  Typography,
} from "@mui/joy";
import { Avatar, Paper } from "@mui/material";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";

import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from "config/schoolConfig";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import { StudentDetailsType } from "types/student";
import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  setDoc,
  where,
} from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

import { useNavbar } from "context/NavbarContext";
import { useAuth } from "context/AuthContext";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";

function StudentMigration() {
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [previousSessionStudents, setPreviousSessionStudents] = useState<
    StudentDetailsType[]
  >([]);
  const [selectedPrevious, setSelectedPrevious] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationDialogOpen, setMigrationDialogOpen] = useState(false);
  const [targetClass, setTargetClass] = useState<any>(null);
  const [targetSection, setTargetSection] = useState<any>(null);

  //Get Firebase DB instance
  const { db } = useFirebase();
  const auth = useAuth();

  const { session: currentSessionId } = useNavbar();
  const previousSessionId = getPreviousSession(currentSessionId);

  function getPreviousSession(sessionId: string) {
    const [start, end] = sessionId.split("-");

    if (!start || !end) return null;

    const prevStart = Number(start) - 1;
    const prevEnd = Number(end) - 1;

    return `${prevStart}-${prevEnd}`;
  }

  const getClassName = (classId: number) => {
    const classItem = SCHOOL_CLASSES.find((item) => item.value === classId);
    return classItem ? classItem.title : `Class ${classId}`;
  };

  // Fetch student details from STUDENTS collection and merge with session data
  const mergeStudentDetails = async (sessionStudents: any[]) => {
    try {
      const studentsWithDetails = await Promise.all(
        sessionStudents.map(async (sessionStudent) => {
          try {
            const studentDocRef = doc(db, "STUDENTS", sessionStudent.studentId);
            const studentSnap = await getDoc(studentDocRef);

            if (studentSnap.exists()) {
              const studentData = studentSnap.data();
              if (studentData.is_active === false) {
                return null;
              }

              return {
                ...sessionStudent,
                is_active: studentData.is_active,
                admission_no: studentData.admission_no || "",
                student_name: studentData.student_name || "",
                father_name: studentData.father_name || "",
                profil_url: studentData.profil_url || "",
                rollNumber:
                  sessionStudent.rollNumber || studentData.rollNumber || "",
                sessionId: sessionStudent.sessionId || "",
                class: sessionStudent.class || "",
              };
            }
            return {
              ...sessionStudent,
              sessionId: sessionStudent.sessionId || "",
              class: sessionStudent.class || "",
            };
          } catch (err) {
            console.error(
              `Failed to fetch details for student ${sessionStudent.studentId}:`,
              err,
            );
            return sessionStudent;
          }
        }),
      );
      return studentsWithDetails.filter((student) => student !== null);
    } catch (err) {
      console.error("Failed to merge student details:", err);
      return sessionStudents;
    }
  };

  const handleStudentSearch = async () => {
    if (!selectedClass) {
      enqueueSnackbar("Select class first", { variant: "info" });
      return;
    }

    setLoading(true);
    setPreviousSessionStudents([]);

    try {
      console.log("Current Session ID:", currentSessionId);
      console.log("Previous Session ID:", previousSessionId);
      console.log("Selected Class:", selectedClass);

      // Fetch previous session students in selected class (BEFORE migration)
      let prevStudents: any[] = [];
      if (previousSessionId) {
        const prevQuery = query(
          collection(db, "STUDENTS_SESSIONS"),
          where("sessionId", "==", previousSessionId),
          where("class", "==", selectedClass),
        );
        const prevSnap = await getDocs(prevQuery);
        prevStudents = prevSnap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as any[];

        // Merge student details from STUDENTS collection
        prevStudents = await mergeStudentDetails(prevStudents);

        // Hide students already migrated to current session.
        const currentSessionQuery = query(
          collection(db, "STUDENTS_SESSIONS"),
          where("sessionId", "==", currentSessionId),
        );
        const currentSessionSnap = await getDocs(currentSessionQuery);
        const migratedStudentIds = new Set(
          currentSessionSnap.docs.map((d) => (d.data() as any).studentId),
        );

        prevStudents = prevStudents.filter(
          (student: any) => !migratedStudentIds.has(student.studentId),
        );
      }
      setPreviousSessionStudents(prevStudents);
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to fetch students", { variant: "error" });
    }

    setLoading(false);
  };

  const handleSelectPrevious = (studentId: string, checked: boolean) => {
    const newSelected = new Set(selectedPrevious);
    if (checked) {
      newSelected.add(studentId);
    } else {
      newSelected.delete(studentId);
    }
    setSelectedPrevious(newSelected);
  };

  const handleSelectAllPrevious = (checked: boolean) => {
    if (checked) {
      setSelectedPrevious(
        new Set(previousSessionStudents.map((s: any) => s.studentId)),
      );
    } else {
      setSelectedPrevious(new Set());
    }
  };

  const handleStartMigration = () => {
    if (selectedPrevious.size === 0) {
      enqueueSnackbar("No students selected for migration", {
        variant: "warning",
      });
      return;
    }
    setMigrationDialogOpen(true);
  };

  const migrateStudents = async () => {
    if (!targetClass) {
      enqueueSnackbar("Please select a target class", { variant: "warning" });
      return;
    }

    if (!targetSection) {
      enqueueSnackbar("Please select a target section", {
        variant: "warning",
      });
      return;
    }

    const studentIds = Array.from(selectedPrevious);
    if (!studentIds || studentIds.length === 0) {
      enqueueSnackbar("No students selected for migration", {
        variant: "warning",
      });
      return;
    }

    setMigrating(true);
    try {
      const selectedStudents = previousSessionStudents.filter((student: any) =>
        selectedPrevious.has(student.studentId),
      );

      if (selectedStudents.length === 0) {
        enqueueSnackbar("No valid students found for migration", {
          variant: "warning",
        });
        return;
      }

      // Resolve default monthly fee for target class from payment config.
      const paymentConfigRef = doc(db, "CONFIG", "PAYMENT_CONFIG");
      const paymentConfigSnap = await getDoc(paymentConfigRef);
      const feeKey = `class_${targetClass}`;
      const configuredTargetFee = paymentConfigSnap.exists()
        ? Number((paymentConfigSnap.data() as any)?.defaultMonthlyFee?.[feeKey])
        : NaN;

      // Fetch all students already present in the target/current session once.
      // This prevents duplicate migration records per student in the same session.
      const existingSessionQuery = query(
        collection(db, "STUDENTS_SESSIONS"),
        where("sessionId", "==", currentSessionId),
      );
      const existingSessionSnap = await getDocs(existingSessionQuery);
      const existingStudentIds = new Set(
        existingSessionSnap.docs.map((d) => (d.data() as any).studentId),
      );

      let migratedCount = 0;
      let skippedCount = 0;

      for (const student of selectedStudents as any[]) {
        if (existingStudentIds.has(student.studentId)) {
          skippedCount += 1;
          continue;
        }

        const {
          id,
          admission_no,
          student_name,
          father_name,
          profil_url,
          ...sessionData
        } = student;

        const isPromoted = Number(targetClass) !== Number(selectedClass);
        const existingMonthlyFee = Number(sessionData.monthly_fee || 0);
        const effectiveMonthlyFee =
          isPromoted && !Number.isNaN(configuredTargetFee)
            ? configuredTargetFee
            : existingMonthlyFee;

        const newSessionDocRef = doc(collection(db, "STUDENTS_SESSIONS"));

        await setDoc(newSessionDocRef, {
          ...sessionData,
          studentId: student.studentId,
          sessionId: currentSessionId,
          class: targetClass,
          section: targetSection,
          classId: getClassNameByValue(targetClass),
          monthlyFee: effectiveMonthlyFee,

          migratedFromSession: previousSessionId || "",
          migratedFromClass: selectedClass,
          migratedAt: new Date().toISOString(),
          migratedBy: auth.currentUser ? auth.currentUser.uid : "unknown",
        });

        await setDoc(
          doc(db, "STUDENTS", student.studentId),
          {
            class: targetClass,
            section: targetSection,
            monthly_fee: effectiveMonthlyFee,
          },
          { merge: true },
        );

        // Update previous session record with migration status and destination details.
        if (id) {
          await setDoc(
            doc(db, "STUDENTS_SESSIONS", id),
            {
              status: isPromoted ? "Promoted" : "Retained",
              migrationStatus: "Migrated",
              migratedToSession: currentSessionId,
              migratedToClass: targetClass,
              migratedToSection: targetSection,
              migratedToClassId: getClassNameByValue(targetClass),
              migratedAt: new Date().toISOString(),
              migratedBy: auth.currentUser ? auth.currentUser.uid : "unknown",
            },
            { merge: true },
          );
        }

        existingStudentIds.add(student.studentId);
        migratedCount += 1;
      }

      if (migratedCount > 0) {
        enqueueSnackbar(
          `${migratedCount} student(s) migrated to ${getClassName(
            targetClass,
          )}-${targetSection} in session ${currentSessionId}${
            skippedCount > 0
              ? ` (${skippedCount} skipped: already in target session)`
              : ""
          }`,
          {
            variant: "success",
          },
        );
      } else {
        enqueueSnackbar(
          "All selected students are already migrated in the target session",
          {
            variant: "info",
          },
        );
      }

      // Clear selections after migration
      setSelectedPrevious(new Set());
      setMigrationDialogOpen(false);
      setTargetClass(null);
      setTargetSection(null);

      // Refresh data
      await handleStudentSearch();
    } catch (err) {
      console.error("Migration failed:", err);
      enqueueSnackbar("Failed to migrate students", { variant: "error" });
    } finally {
      setMigrating(false);
    }
  };

  useEffect(() => {
    // Auto-search when class is selected
    if (selectedClass) {
      handleStudentSearch();
    }
  }, [selectedClass]);

  return (
    <>
      <PageHeaderWithHelpButton title="Student Migration" />

      {selectedClass && (
        <Box>
          <Card variant="outlined" sx={{ width: "100%", mt: 2 }}>
            <Box
              sx={{
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography level="title-md">
                Students in {getClassName(selectedClass)} for Session{" "}
                {previousSessionId}
              </Typography>
              <FormControl sx={{ width: 200 }}>
                <Select
                  slotProps={{
                    listbox: {
                      sx: { width: 200 },
                    },
                  }}
                  value={selectedClass}
                  onChange={(e, val) => setSelectedClass(val)}
                >
                  {SCHOOL_CLASSES.map((item) => {
                    return (
                      <Option value={item.value} key={item.id}>
                        {item.title}
                      </Option>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
            {selectedPrevious.size > 0 && (
              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  backgroundColor: "#E3F2FD",
                  borderRadius: 1,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography level="body-sm">
                    {selectedPrevious.size} student(s) selected
                  </Typography>
                  <Button
                    size="sm"
                    onClick={handleStartMigration}
                    loading={migrating}
                  >
                    Start Migration
                  </Button>
                </Stack>
              </Box>
            )}
            {loading && <LinearProgress />}
            <MaterialTable
              style={{ display: "grid", boxShadow: "none" }}
              columns={[
                {
                  title: (
                    <Checkbox
                      checked={
                        selectedPrevious.size ===
                          previousSessionStudents.length &&
                        previousSessionStudents.length > 0
                      }
                      indeterminate={
                        selectedPrevious.size > 0 &&
                        selectedPrevious.size < previousSessionStudents.length
                      }
                      onChange={(e) =>
                        handleSelectAllPrevious(
                          (e.target as HTMLInputElement).checked,
                        )
                      }
                    />
                  ),
                  field: "select",
                  render: (rowData: any) => (
                    <Checkbox
                      checked={selectedPrevious.has(rowData.studentId)}
                      onChange={(e) =>
                        handleSelectPrevious(
                          rowData.studentId,
                          (e.target as HTMLInputElement).checked,
                        )
                      }
                    />
                  ),
                  cellStyle: { fontSize: "14px", width: "50px" },
                },
                {
                  title: "Session",
                  field: "sessionId",
                  cellStyle: { fontSize: "14px" },
                },
                {
                  title: "Current Class",
                  field: "class",
                  render: (rowData: any) => getClassName(rowData.class),
                  cellStyle: { fontSize: "14px" },
                },
                {
                  title: "Student Id",
                  field: "admission_no",
                  cellStyle: { fontSize: "14px" },
                },
                {
                  title: "Photo",
                  field: "profil_url",
                  render: (rowData: any) => (
                    <Avatar
                      src={rowData.profil_url || undefined}
                      alt={rowData.student_name || "Student"}
                      sx={{ width: 36, height: 36, fontSize: 12 }}
                    >
                      {(rowData.student_name || "S").charAt(0).toUpperCase()}
                    </Avatar>
                  ),
                  cellStyle: { fontSize: "14px", width: "70px" },
                },
                {
                  title: "Student Name",
                  field: "student_name",
                  cellStyle: { fontSize: "14px" },
                },
                {
                  title: "Father Name",
                  field: "father_name",
                  cellStyle: { fontSize: "14px" },
                },
                {
                  title: "Roll No",
                  field: "rollNumber",
                  cellStyle: { fontSize: "14px" },
                },
                {
                  title: "Action",
                  field: "action",
                  render: (rowData: any) => (
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedPrevious(new Set([rowData.studentId]));
                        setMigrationDialogOpen(true);
                      }}
                      disabled={migrating}
                    >
                      Migrate
                    </Button>
                  ),
                  cellStyle: { fontSize: "14px", width: "100px" },
                },
              ]}
              data={previousSessionStudents}
              title={`Total: ${previousSessionStudents.length}`}
              options={{
                grouping: false,
                headerStyle: {
                  backgroundColor: "#E3F2FD",
                },
                paging: true,
                pageSize: 10,
                pageSizeOptions: [5, 10, 20],
              }}
            />
          </Card>
        </Box>
      )}

      {/* Migration Dialog */}
      <Modal
        open={migrationDialogOpen}
        onClose={() => setMigrationDialogOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          variant="outlined"
          sx={{
            maxWidth: 600,
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
            borderRadius: "md",
            p: 3,
            boxShadow: "lg",
          }}
        >
          <ModalClose variant="plain" sx={{ m: 1 }} />
          <Typography
            component="h2"
            level="h4"
            textColor="inherit"
            sx={{ fontWeight: "lg", mb: 1 }}
          >
            Select Target Class for Migration
          </Typography>
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              backgroundColor: "#E3F2FD",
              borderRadius: "md",
            }}
          >
            <Typography level="body-sm">
              <strong>Current Class:</strong> {getClassName(selectedClass)}
            </Typography>
            <Typography level="body-sm" sx={{ mt: 0.5 }}>
              <strong>Students to migrate:</strong> {selectedPrevious.size}
            </Typography>
          </Box>

          {/* Selected Students Preview */}
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              backgroundColor: "#F5F5F5",
              borderRadius: "md",
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #E0E0E0",
            }}
          >
            <Typography level="body-xs" sx={{ fontWeight: "600", mb: 1 }}>
              Selected Students:
            </Typography>
            <Stack spacing={0.5}>
              {previousSessionStudents
                .filter((student: any) =>
                  selectedPrevious.has(student.studentId),
                )
                .map((student: any) => (
                  <Box
                    key={student.studentId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 0.75,
                      backgroundColor: "white",
                      borderRadius: "sm",
                      border: "1px solid #E0E0E0",
                    }}
                  >
                    <Typography level="body-sm" sx={{ flex: 1 }}>
                      <strong>{student.admission_no}</strong> -{" "}
                      {student.student_name}
                    </Typography>
                  </Box>
                ))}
            </Stack>
          </Box>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1, fontWeight: "600" }}>
              Target Class
            </FormLabel>
            <Select
              placeholder="Choose target class"
              value={targetClass}
              onChange={(e, val) => setTargetClass(val)}
            >
              {SCHOOL_CLASSES.map((item) => {
                return (
                  <Option value={item.value} key={item.id}>
                    {item.title}
                  </Option>
                );
              })}
            </Select>
          </FormControl>

          <FormControl sx={{ mb: 2 }}>
            <FormLabel sx={{ mb: 1, fontWeight: "600" }}>
              Target Section
            </FormLabel>
            <Select
              placeholder="Choose target section"
              value={targetSection}
              onChange={(e, val) => setTargetSection(val)}
            >
              {SCHOOL_SECTIONS.map((item) => {
                return (
                  <Option value={item.value} key={item.id}>
                    {item.title}
                  </Option>
                );
              })}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              onClick={migrateStudents}
              loading={migrating}
              disabled={!targetClass || !targetSection}
              fullWidth
            >
              Migrate
            </Button>
            <Button
              variant="plain"
              onClick={() => {
                setMigrationDialogOpen(false);
                setTargetClass(null);
                setTargetSection(null);
              }}
              fullWidth
            >
              Cancel
            </Button>
          </Stack>
        </Card>
      </Modal>
      {!selectedClass && (
        <Paper sx={{ p: 3, mt: 2, textAlign: "center" }}>
          <Typography level="title-md">
            Select a class to view students
          </Typography>
          <FormControl sx={{ width: 200, mt: 2 }}>
            <Select
              placeholder="Choose class"
              value={selectedClass}
              onChange={(e, val) => setSelectedClass(val)}
            >
              {SCHOOL_CLASSES.map((item) => {
                return (
                  <Option value={item.value} key={item.id}>
                    {item.title}
                  </Option>
                );
              })}
            </Select>
          </FormControl>
        </Paper>
      )}
    </>
  );
}

export default StudentMigration;
