import React, { useState, useEffect, useRef } from "react";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormLabel,
  Stack,
  Tab,
  Tabs,
  Typography,
  Alert,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StudentDetailsType } from "types/student";
import { rankType } from "types/results";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  writeBatch,
  getDoc,
} from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { useNavbar } from "context/NavbarContext";
import { enqueueSnackbar } from "notistack";
import { SCHOOL_CLASSES } from "config/schoolConfig";

/* ============ SORTABLE ITEM COMPONENT ============ */
interface SortableRollItemProps {
  student: StudentDetailsType;
  newRoll: number;
  originalRoll: number;
  isSelected?: boolean;
}

const SortableRollItem: React.FC<SortableRollItemProps> = ({
  student,
  newRoll,
  originalRoll,
  isSelected,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: student.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "0.75rem",
    marginBottom: "0.5rem",
    border: "1px solid #ccc",
    borderRadius: "8px",
    background: isSelected ? "#e0f7fa" : "#fff",

    cursor: "grab",
  };

  const hasChanged = originalRoll !== newRoll;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "80px 150px 150px 100px 120px 80px 100px",
          gap: 1.5,
          alignItems: "center",
          fontSize: "0.9rem",
        }}
      >
        <Box sx={{ fontWeight: 600 }}>{newRoll}</Box>
        <Box sx={{ fontWeight: 600, color: "#1976d2" }}>
          {student.admission_no}
        </Box>
        <Box>{student.student_name}</Box>
        <Box sx={{ fontSize: "0.85rem", color: "#666" }}>
          {student.father_name}
        </Box>
        <Box sx={{ textAlign: "center" }}>{originalRoll}</Box>
        <Box
          sx={{
            textAlign: "center",
            fontWeight: 600,
            color: hasChanged ? "green" : "inherit",
          }}
        >
          {newRoll}
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          {hasChanged && (
            <Chip
              variant="outlined"
              size="small"
              color="warning"
              label="Changed"
            />
          )}
        </Box>
      </Box>
    </div>
  );
};

/* ============ ALLOCATION METHOD COMPONENTS ============ */

// 1. ALPHABETICAL ALLOCATION
interface AlphabeticalAllocationProps {
  students: StudentDetailsType[];
  loading: boolean;
  onApply: (allocatedStudents: StudentDetailsType[]) => void;
}

const AlphabeticalAllocation: React.FC<AlphabeticalAllocationProps> = ({
  students,
  loading,
  onApply,
}) => {
  const [preview, setPreview] = useState<StudentDetailsType[]>([]);

  useEffect(() => {
    const sorted = [...students].sort((a, b) =>
      a.student_name.localeCompare(b.student_name),
    );
    const allocated = sorted.map((student, idx) => ({
      ...student,
      rollNumber: idx + 1,
    }));
    setPreview(allocated);
  }, [students]);

  const handleApply = () => {
    const changedCount = preview.filter(
      (s, idx) => s.rollNumber !== students[idx].rollNumber,
    ).length;
    if (changedCount > 0) {
      enqueueSnackbar(
        `Allocating roll numbers to ${changedCount} students...`,
        { variant: "info" },
      );
      onApply(preview);
    } else {
      enqueueSnackbar("No changes to apply", { variant: "warning" });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        Roll numbers will be assigned based on alphabetical order of student
        names.
      </Alert>
      {/* Header Row */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "80px 150px 150px 100px 120px 80px 100px",
          gap: 1.5,
          alignItems: "center",
          fontSize: "0.85rem",
          fontWeight: 700,
          mb: 1,
          p: "0.75rem",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          border: "1px solid #e0e0e0",
        }}
      >
        <Box>New Roll</Box>
        <Box>Admission No</Box>
        <Box>Student Name</Box>
        <Box>Father Name</Box>
        <Box sx={{ textAlign: "center" }}>Previous</Box>
        <Box sx={{ textAlign: "center" }}>New</Box>
        <Box sx={{ textAlign: "center" }}>Status</Box>
      </Box>
      <Box sx={{ maxHeight: "60vh", overflow: "auto", mb: 2 }}>
        {preview.map((student, idx) => (
          <SortableRollItem
            key={student.id}
            student={student}
            newRoll={idx + 1}
            originalRoll={student.rollNumber || 0}
          />
        ))}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" color="inherit">
          Preview
        </Button>
        <Button variant="contained" color="success" onClick={handleApply}>
          Apply Alphabetical Order
        </Button>
      </Stack>
    </Box>
  );
};

// 2. RANK-BASED ALLOCATION
interface RankBasedAllocationProps {
  students: StudentDetailsType[];
  loading: boolean;
  classId: string | null;
  onApply: (allocatedStudents: StudentDetailsType[]) => void;
}

const RankBasedAllocation: React.FC<RankBasedAllocationProps> = ({
  students,
  loading,
  classId,
  onApply,
}) => {
  const [preview, setPreview] = useState<StudentDetailsType[]>([]);
  const [_ranks, setRanks] = useState<rankType[]>([]);
  const [loadingRanks, setLoadingRanks] = useState(false);
  const { db } = useFirebase();

  console.log(students);

  // Fetch latest ranks for selected class
  useEffect(() => {
    if (!classId) return;

    const fetchRanks = async () => {
      setLoadingRanks(true);
      try {
        // Fetch from RESULTS collection using classId as document ID
        const resultsRef = doc(db, "RESULTS", (Number(classId) - 1).toString());
        const resultsSnap = await getDoc(resultsRef);
        const data = resultsSnap.data();
        if (data) {
          let ranksList: rankType[] = [];

          if (data.studentRanks && Array.isArray(data.studentRanks)) {
            ranksList = data.studentRanks.map((rank: any) => ({
              studentId: rank.studentId,
              rankObtained: rank.rankObtained,
              marksObtained: rank.marksObtained,
              studentName: "",
            }));
          }

          ranksList.sort((a, b) => a.rankObtained - b.rankObtained);
          setRanks(ranksList);
          console.log("Sorted ranks list:", ranksList);

          // Allocate rolls based on ranks
          const allocated = ranksList
            .map((rank) => {
              const student = students.find((s) => s.id === rank.studentId);
              return student
                ? {
                    ...student,
                    rollNumber: ranksList.indexOf(rank) + 1,
                  }
                : null;
            })
            .filter(Boolean) as StudentDetailsType[];

          console.log("Allocated students based on ranks:", allocated);

          setPreview(allocated);
        } else {
          enqueueSnackbar(
            "No ranks found for this class for previous session last exam.",
            {
              variant: "warning",
            },
          );
        }
      } catch (error) {
        console.error("Error fetching ranks:", error);
        enqueueSnackbar("Failed to load ranks", { variant: "error" });
      } finally {
        setLoadingRanks(false);
      }
    };

    fetchRanks();
  }, [classId, db, students]);

  const handleApply = () => {
    if (preview.length > 0) {
      onApply(preview);
    } else {
      enqueueSnackbar("No rank data available", { variant: "warning" });
    }
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        🏆 Roll numbers will be assigned based on latest exam ranks (highest
        rank = Roll 1).
      </Alert>

      {loadingRanks ? (
        <CircularProgress />
      ) : preview.length > 0 ? (
        <>
          {/* Header Row */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "80px 150px 150px 100px 120px 80px 100px",
              gap: 1.5,
              alignItems: "center",
              fontSize: "0.85rem",
              fontWeight: 700,
              mb: 1,
              p: "0.75rem",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              border: "1px solid #e0e0e0",
            }}
          >
            <Box>New Roll</Box>
            <Box>Admission No</Box>
            <Box>Student Name</Box>
            <Box>Father Name</Box>
            <Box sx={{ textAlign: "center" }}>Previous</Box>
            <Box sx={{ textAlign: "center" }}>New</Box>
            <Box sx={{ textAlign: "center" }}>Status</Box>
          </Box>

          <Box sx={{ maxHeight: "60vh", overflow: "auto", mb: 2 }}>
            {preview.map((student, idx) => (
              <SortableRollItem
                key={student.id}
                student={student}
                newRoll={idx + 1}
                originalRoll={student.rollNumber || 0}
              />
            ))}
          </Box>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button variant="outlined" color="inherit">
              Preview
            </Button>
            <Button variant="contained" color="success" onClick={handleApply}>
              Apply Rank-Based Order
            </Button>
          </Stack>
        </>
      ) : (
        <Alert severity="warning">No rank data available for this class</Alert>
      )}
    </Box>
  );
};

// 3. MANUAL DRAG & DROP ALLOCATION
interface ManualAllocationProps {
  students: StudentDetailsType[];
  loading: boolean;
  onApply: (allocatedStudents: StudentDetailsType[]) => void;
}

const ManualAllocation: React.FC<ManualAllocationProps> = ({
  students,
  loading,
  onApply,
}) => {
  const [preview, setPreview] = useState<StudentDetailsType[]>([]);
  const originalOrderRef = useRef<StudentDetailsType[]>([]);
  const sensors = useSensors(useSensor(PointerSensor));

  useEffect(() => {
    const sorted = [...students].sort((a, b) => a.rollNumber - b.rollNumber);
    setPreview(sorted);
    originalOrderRef.current = [...sorted];
  }, [students]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = preview.findIndex((s) => s.id === active.id);
      const newIndex = preview.findIndex((s) => s.id === over?.id);

      const updated = arrayMove(preview, oldIndex, newIndex).map(
        (student, idx) => ({
          ...student,
          rollNumber: idx + 1,
        }),
      );

      setPreview(updated);
    }
  };

  const handleApply = () => {
    const changedCount = preview.filter(
      (s) =>
        s.rollNumber !==
        originalOrderRef.current.find((os) => os.id === s.id)?.rollNumber,
    ).length;

    if (changedCount > 0) {
      enqueueSnackbar(`Updating ${changedCount} roll numbers...`, {
        variant: "info",
      });
      onApply(preview);
    } else {
      enqueueSnackbar("No changes to apply", { variant: "warning" });
    }
  };

  const handleReset = () => {
    setPreview([...originalOrderRef.current]);
  };

  if (loading) return <CircularProgress />;

  return (
    <Box>
      <Alert severity="info" sx={{ mb: 2 }}>
        ✋ Drag and drop students to manually assign roll numbers. Changes are
        highlighted.
      </Alert>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {/* Header Row */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "80px 150px 150px 100px 120px 80px 100px",
            gap: 1.5,
            alignItems: "center",
            fontSize: "0.85rem",
            fontWeight: 700,
            mb: 1,
            p: "0.75rem",
            backgroundColor: "#f5f5f5",
            borderRadius: "8px",
            border: "1px solid #e0e0e0",
          }}
        >
          <Box>New Roll</Box>
          <Box>Admission No</Box>
          <Box>Student Name</Box>
          <Box>Father Name</Box>
          <Box sx={{ textAlign: "center" }}>Previous</Box>
          <Box sx={{ textAlign: "center" }}>New</Box>
          <Box sx={{ textAlign: "center" }}>Status</Box>
        </Box>

        <Box sx={{ maxHeight: "60vh", overflow: "auto", mb: 2 }}>
          <SortableContext
            items={preview.map((s) => s.id)}
            strategy={verticalListSortingStrategy}
          >
            {preview.map((student) => {
              const originalRoll = student.rollNumber || 0;
              return (
                <SortableRollItem
                  key={student.id}
                  student={student}
                  newRoll={student.rollNumber}
                  originalRoll={originalRoll}
                />
              );
            })}
          </SortableContext>
        </Box>
      </DndContext>

      <Stack direction="row" spacing={2} justifyContent="flex-end">
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
        <Button variant="contained" color="success" onClick={handleApply}>
          Apply Manual Changes
        </Button>
      </Stack>
    </Box>
  );
};

/* ============ MAIN COMPONENT ============ */
interface StudentRollNumberAllocationProps {
  defaultClass?: string | null;
}

const StudentRollNumberAllocation: React.FC<
  StudentRollNumberAllocationProps
> = ({ defaultClass }) => {
  const [students, setStudents] = useState<StudentDetailsType[]>([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [selectedClass, setSelectedClass] = useState<string>(
    defaultClass || "",
  );
  const [activeTab, setActiveTab] = useState<number>(0);
  const [confirmModal, setConfirmModal] = useState(false);
  const [pendingAllocation, setPendingAllocation] = useState<
    StudentDetailsType[] | null
  >(null);

  const { db } = useFirebase();
  const { session: currentSessionId } = useNavbar();

  // Helper function to merge student details from STUDENTS collection
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
                id: sessionStudent.id,
                studentId: sessionStudent.studentId,
              };
            }
            return {
              ...sessionStudent,
              id: sessionStudent.id,
              studentId: sessionStudent.studentId,
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

  // Fetch students for selected class from STUDENTS_SESSIONS collection
  useEffect(() => {
    const fetchStudents = async () => {
      console.log(
        "Fetching students for class:",
        selectedClass,
        "Session ID:",
        currentSessionId,
      );
      if (!selectedClass || !currentSessionId) {
        setStudents([]);
        return;
      }

      setLoading(true);
      try {
        // Fetch from STUDENTS_SESSIONS collection
        const q = query(
          collection(db, "STUDENTS_SESSIONS"),
          where("sessionId", "==", currentSessionId),
          where("class", "==", selectedClass),
        );
        const snap = await getDocs(q);
        let sessionStudents = snap.docs.map((doc) => ({
          sessionDocId: doc.id,
          ...doc.data(),
        })) as any[];

        // Merge student details from STUDENTS collection
        sessionStudents = await mergeStudentDetails(sessionStudents);

        // Preserve original rollNumber before sorting
        sessionStudents = sessionStudents.map((s) => ({
          ...s,
          originalClassRoll: s.rollNumber,
        }));

        // Sort by class roll
        sessionStudents.sort((a, b) => a.rollNumber - b.rollNumber);
        setStudents(sessionStudents);
      } catch (error) {
        console.error("Error fetching students:", error);
        enqueueSnackbar("Failed to load students", { variant: "error" });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [selectedClass, currentSessionId, db]);

  const handleApplyAllocation = (allocatedStudents: StudentDetailsType[]) => {
    setPendingAllocation(allocatedStudents);
    setConfirmModal(true);
  };

  const confirmAndUpdate = async () => {
    if (!pendingAllocation) return;

    setUpdating(true);
    try {
      const batch = writeBatch(db);

      console.log(
        `Updating ${pendingAllocation.length} students for session: ${currentSessionId}`,
      );

      console.log("Pending allocation details:", pendingAllocation);

      pendingAllocation.forEach((student) => {
        // Update STUDENTS_SESSIONS collection (use session document ID and filter by current session)

        console.log(
          `Preparing batch update for student: ${student.student_name}, new roll: ${student.rollNumber}, sessionDocId: ${student.sessionDocId}`,
        );

        const sessionRef = doc(db, "STUDENTS_SESSIONS", student.sessionDocId!);
        batch.update(sessionRef, {
          rollNumber: Number(student.rollNumber),
        });

        // Also update STUDENTS collection (use studentId)
        const studentRef = doc(db, "STUDENTS", student.id);
        batch.update(studentRef, { rollNumber: Number(student.rollNumber) });

        console.debug(
          `Batch update for student: sessionDocId=${student.sessionDocId}, studentId=${student.id}, newRoll=${student.rollNumber}`,
        );
      });

      await batch.commit();

      enqueueSnackbar("Roll numbers updated successfully!", {
        variant: "success",
      });

      setConfirmModal(false);
      setPendingAllocation(null);

      // Refresh students list with updated roll numbers
      setStudents(
        students.map((s) => {
          const updated = pendingAllocation.find((p) => p.id === s.id);
          return updated ? { ...s, rollNumber: updated.rollNumber } : s;
        }),
      );
    } catch (error) {
      console.error("Error updating roll numbers:", error);
      enqueueSnackbar("Failed to update roll numbers", { variant: "error" });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Box>
      <PageHeaderWithHelpButton title="Student Roll Number Allocator" />

      {/* CLASS SELECTOR */}
      <Card sx={{ mb: 3, p: 2 }}>
        <FormControl sx={{ minWidth: 250 }}>
          <FormLabel>Select Class</FormLabel>
          <Select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value || "")}
          >
            <MenuItem value="">-- Choose a class --</MenuItem>
            {SCHOOL_CLASSES.map((className) => (
              <MenuItem key={className.value} value={className.value}>
                {className.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Card>

      {/* ALLOCATION METHODS */}
      {selectedClass && students.length > 0 ? (
        <Card>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ p: 2 }}
          >
            <Tab label="📝 Alphabetical" />
            <Tab label="🏆 By Exam Rank" />
            <Tab label="✋ Manual (Drag)" />
          </Tabs>
          <Divider />
          <Box sx={{ p: 2 }}>
            {activeTab === 0 && (
              <AlphabeticalAllocation
                students={students}
                loading={loading}
                onApply={handleApplyAllocation}
              />
            )}
            {activeTab === 1 && (
              <RankBasedAllocation
                students={students}
                loading={loading}
                classId={selectedClass}
                onApply={handleApplyAllocation}
              />
            )}
            {activeTab === 2 && (
              <ManualAllocation
                students={students}
                loading={loading}
                onApply={handleApplyAllocation}
              />
            )}
          </Box>
          <br />
          <br />
          <br />
        </Card>
      ) : selectedClass && students.length === 0 && !loading ? (
        <Alert severity="warning">
          📚 No active students found in selected class
        </Alert>
      ) : null}

      {/* CONFIRMATION MODAL */}
      <Dialog open={confirmModal} onClose={() => setConfirmModal(false)}>
        <DialogTitle>Confirm Roll Number Update</DialogTitle>
        <Divider />
        <DialogContent>
          {pendingAllocation && (
            <Box>
              <Typography sx={{ mb: 2 }}>
                You are about to update{" "}
                <strong>{pendingAllocation.length}</strong> roll numbers. This
                action cannot be undone.
              </Typography>
              <Box sx={{ maxHeight: "300px", overflow: "auto" }}>
                {pendingAllocation.slice(0, 10).map((student) => (
                  <Box key={student.id} sx={{ py: 0.5 }}>
                    {student.student_name} → Roll #{student.rollNumber}
                  </Box>
                ))}
                {pendingAllocation.length > 10 && (
                  <Typography sx={{ mt: 1, color: "gray" }}>
                    +{pendingAllocation.length - 10} more...
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            color="inherit"
            onClick={() => setConfirmModal(false)}
            disabled={updating}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={confirmAndUpdate}
            disabled={updating}
          >
            Update Roll Numbers
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentRollNumberAllocation;
