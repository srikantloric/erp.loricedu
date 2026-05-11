import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  FormControl,
  FormLabel,
  Option,
  Select,
  Stack,
  Table,
  Typography,
  Alert,
  CircularProgress,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Divider,
} from "@mui/joy";
import { enqueueSnackbar } from "notistack";
import {
  arrayUnion,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { StudentDetailsType, StudentSessionDetailsType } from "types/student";
import { useFirebase } from "context/firebaseContext";
import { useNavbar } from "context/NavbarContext";
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from "config/schoolConfig";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
import StudentRollUpdaterModal from "pages/StudentManagement/StudentRollUpdatorModal";
import { Edit } from "iconsax-react";
import { useAuth } from "context/AuthContext";

interface StudentProfileProps {
  studentData: StudentDetailsType;
}

interface PreviousRecord {
  class?: number;
  section?: string;
  rollNumber?: number;
  updatedAt?: any;
  updatedBy?: string;
}

function AcademicTab({ studentData }: StudentProfileProps) {
  const [currentSessionData, setCurrentSessionData] = useState<
    (StudentSessionDetailsType & { docId?: string; previousRecords?: PreviousRecord[] }) | null
  >(null);
  const [previousSessions, setPreviousSessions] = useState<
    (StudentSessionDetailsType & { docId?: string; previousRecords?: PreviousRecord[] })[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state
  const [editClass, setEditClass] = useState<number | null>(null);
  const [editSection, setEditSection] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [rollUpdaterModalOpen, setRollUpdaterModalOpen] = useState(false);

  // Change details modal state
  const [changeDetailsOpen, setChangeDetailsOpen] = useState(false);
  const [selectedChanges, setSelectedChanges] = useState<PreviousRecord[] | null>(null);

  const { db } = useFirebase();
  const auth = useAuth();
  const { session: currentSessionId } = useNavbar();

  // Fetch current and previous session data
  useEffect(() => {
    const fetchSessionData = async () => {
      if (!studentData.id || !currentSessionId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch current session data
        const currentQuery = query(
          collection(db, "STUDENTS_SESSIONS"),
          where("studentId", "==", studentData.id),
          where("sessionId", "==", currentSessionId),
        );
        const currentSnap = await getDocs(currentQuery);

        if (!currentSnap.empty) {
          const doc = currentSnap.docs[0];
          const sessionData = doc.data() as StudentSessionDetailsType;
          setCurrentSessionData({
            ...sessionData,
            docId: doc.id,
          });
          setEditClass(sessionData.class || null);
          setEditSection(sessionData.section || "");
        } else {
          setCurrentSessionData(null);
        }

        // Fetch previous sessions (all sessions except current)
        const allSessionsQuery = query(
          collection(db, "STUDENTS_SESSIONS"),
          where("studentId", "==", studentData.id),
        );
        const allSessionsSnap = await getDocs(allSessionsQuery);
        const sessions = allSessionsSnap.docs
          .map(
            (d) =>
              ({
                ...d.data(),
                docId: d.id,
              } as StudentSessionDetailsType & { docId?: string }),
          )
          .filter((s) => s.sessionId !== currentSessionId)
          .sort((a, b) => {
            // Sort by session descending (most recent first)
            const aSession = a.sessionId || "";
            const bSession = b.sessionId || "";
            return bSession.localeCompare(aSession);
          });

        setPreviousSessions(sessions);
      } catch (err) {
        console.error("Error fetching session data:", err);
        enqueueSnackbar("Failed to fetch academic details", {
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [studentData.id, currentSessionId, db]);

  const handleSaveChanges = async () => {
    if (!currentSessionData?.docId || !studentData.id) {
      enqueueSnackbar("Missing required data", { variant: "error" });
      return;
    }

    try {
      setSaving(true);

      // Validate inputs
      if (!editClass || !editSection) {
        enqueueSnackbar("Please fill all required fields", {
          variant: "warning",
        });
        setSaving(false);
        return;
      }

      const sessionUpdateData = {
        class: editClass,
        classId: getClassNameByValue(editClass)?.toString() || "N/A",
        section: editSection,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid,

        //store historical data in array of objects in firestore
        previousRecords: arrayUnion({
          class: studentData.class,
          section: studentData.section,
          rollNumber: studentData.rollNumber,
          updatedAt: studentData.updated_at,
          updatedBy: auth.currentUser?.uid,
        }),
      };

      // Update STUDENTS_SESSIONS collection
      await setDoc(
        doc(db, "STUDENTS_SESSIONS", currentSessionData.docId),
        sessionUpdateData,
        { merge: true },
      );

      // Update STUDENTS collection
      await setDoc(
        doc(db, "STUDENTS", studentData.id),
        {
          class: editClass,
          classId: getClassNameByValue(editClass),
          section: editSection,
        },
        { merge: true },
      );

      // Update local state
      setCurrentSessionData((prev) =>
        prev
          ? {
              ...prev,
              class: editClass,
              classId: getClassNameByValue(editClass),
              section: editSection,
            }
          : null,
      );

      setIsEditing(false);
      enqueueSnackbar("Class and section updated successfully", {
        variant: "success",
      });
    } catch (err) {
      console.error("Error saving changes:", err);
      enqueueSnackbar("Failed to save changes", { variant: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (currentSessionData) {
      setEditClass(currentSessionData.class || null);
      setEditSection(currentSessionData.section || "");
    }
    setIsEditing(false);
  };

  const handleUpdateRollNumber = (updatedRoll: number) => {
    setCurrentSessionData((prev) =>
      prev
        ? {
            ...prev,
            rollNumber: updatedRoll,
          }
        : null,
    );
  };

  const handleViewChangeDetails = (changes: PreviousRecord[]) => {
    setSelectedChanges(changes);
    setChangeDetailsOpen(true);
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const getClassName = (classNum: number | null | undefined): string => {
    if (!classNum) return "N/A";
    const classItem = SCHOOL_CLASSES.find((item) => item.value === classNum);
    return classItem ? classItem.title : `Class ${classNum}`;
  };

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      {/* Current Session */}
      <Card variant="outlined">
        <Stack spacing={2}>
          <Typography level="title-lg" sx={{ fontWeight: "bold" }}>
            Current Session ({currentSessionId})
          </Typography>

          {currentSessionData ? (
            <>
              {isEditing ? (
                <Stack spacing={2}>
                  <FormControl>
                    <FormLabel>Class *</FormLabel>
                    <Select
                      value={editClass}
                      onChange={(_, value) => setEditClass(value)}
                    >
                      {SCHOOL_CLASSES.map((cls) => (
                        <Option key={cls.value} value={cls.value}>
                          {cls.title}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Section *</FormLabel>
                    <Select
                      value={editSection}
                      onChange={(_, value) => setEditSection(value || "")}
                    >
                      {SCHOOL_SECTIONS.map((sec) => (
                        <Option key={sec.value} value={sec.value}>
                          {sec.title}
                        </Option>
                      ))}
                    </Select>
                  </FormControl>

                  <Stack direction="row" spacing={1}>
                    <Button
                      onClick={handleSaveChanges}
                      loading={saving}
                      variant="solid"
                      color="success"
                    >
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outlined"
                      color="neutral"
                    >
                      Cancel
                    </Button>
                  </Stack>
                </Stack>
              ) : (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography level="body-sm" sx={{ color: "gray" }}>
                        Class
                      </Typography>
                      <Typography level="body-md">
                        {getClassName(currentSessionData.class)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography level="body-sm" sx={{ color: "gray" }}>
                        Section
                      </Typography>
                      <Typography level="body-md">
                        {currentSessionData.section || "N/A"}
                      </Typography>
                    </Box>
                    {currentSessionData.monthlyFee && (
                      <Box>
                        <Typography level="body-sm" sx={{ color: "gray" }}>
                          Monthly Fee
                        </Typography>
                        <Typography level="body-md">
                          {currentSessionData.monthlyFee}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #eee" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Typography level="body-sm" sx={{ color: "gray" }}>
                          Roll Number
                        </Typography>
                        <Typography level="body-md">
                          {currentSessionData.rollNumber || "N/A"}
                        </Typography>
                      </Box>
                      <Button
                        size="sm"
                        startDecorator={<Edit size={18} />}
                        variant="outlined"
                        onClick={() => setRollUpdaterModalOpen(true)}
                      >
                        Update Roll
                      </Button>
                    </Stack>
                  </Box>

                  {currentSessionData.migratedFromSession && (
                    <Alert variant="outlined" color="primary" sx={{ mt: 2 }}>
                      <Typography level="body-sm">
                        Migrated from {currentSessionData.migratedFromSession} -
                        Class{" "}
                        {getClassName(
                          currentSessionData.migratedFromClass as number,
                        )}{" "}
                        on{" "}
                        {new Date(
                          currentSessionData.migratedAt || "",
                        ).toLocaleDateString()}
                      </Typography>
                    </Alert>
                  )}

                  {currentSessionData.previousRecords &&
                    currentSessionData.previousRecords.length > 0 && (
                      <Card
                        variant="soft"
                        sx={{ mt: 2, backgroundColor: "#f5f5f5" }}
                      >
                        <Stack spacing={2}>
                          <Typography level="title-sm" sx={{ fontWeight: "bold" }}>
                            Change History (Current Session)
                          </Typography>
                          <Box sx={{ overflowX: "auto" }}>
                            <Table
                              aria-label="change history"
                              sx={{
                                "--TableCell-paddingX": "0.75rem",
                                "--TableCell-paddingY": "0.5rem",
                                fontSize: "0.875rem",
                              }}
                            >
                              <thead>
                                <tr>
                                  <th>Previous Class</th>
                                  <th>Previous Section</th>
                                  <th>Previous Roll</th>
                                  <th>Updated At</th>
                                </tr>
                              </thead>
                              <tbody>
                                {currentSessionData.previousRecords.map(
                                  (record, idx) => (
                                    <tr key={idx}>
                                      <td>
                                        {getClassName(record.class)}
                                      </td>
                                      <td>{record.section || "N/A"}</td>
                                      <td>{record.rollNumber || "N/A"}</td>
                                      <td>
                                        {record.updatedAt
                                          ? new Date(
                                              record.updatedAt.toDate?.()
                                                || record.updatedAt,
                                            ).toLocaleDateString()
                                          : "N/A"}
                                      </td>
                                    </tr>
                                  ),
                                )}
                              </tbody>
                            </Table>
                          </Box>
                        </Stack>
                      </Card>
                    )}

                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="solid"
                    color="primary"
                  >
                    Edit Class & Section
                  </Button>
                </>
              )}
            </>
          ) : (
            <Alert variant="outlined" color="warning">
              No session data found for current session
            </Alert>
          )}
        </Stack>
      </Card>

      {/* Previous Sessions */}
      {previousSessions.length > 0 && (
        <Card variant="outlined">
          <Stack spacing={2}>
            <Typography level="title-lg" sx={{ fontWeight: "bold" }}>
              Academic History (Read-Only)
            </Typography>

            <Box sx={{ overflowX: "auto" }}>
              <Table
                aria-label="academic history"
                sx={{
                  "--TableCell-paddingX": "1rem",
                  "--TableCell-paddingY": "0.75rem",
                }}
              >
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Class</th>
                    <th>Section</th>
                    <th>Roll Number</th>
                    <th>Monthly Fee</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {previousSessions.map((session, index) => (
                    <tr key={index}>
                      <td>{session.sessionId || "N/A"}</td>
                      <td>{getClassName(session.class)}</td>
                      <td>{session.section || "N/A"}</td>
                      <td>{session.rollNumber || "N/A"}</td>
                      <td>{session.monthlyFee || "N/A"}</td>
                      <td>
                        {session.migrationStatus === "Migrated"
                          ? `Migrated to ${session.migratedToSession}`
                          : session.status || "Active"}
                      </td>
                      <td>
                        {session.previousRecords &&
                        session.previousRecords.length > 0 ? (
                          <Button
                            size="sm"
                            variant="outlined"
                            onClick={() =>
                              handleViewChangeDetails(session.previousRecords || [])
                            }
                          >
                            View Changes
                          </Button>
                        ) : (
                          <Typography level="body-sm" sx={{ color: "gray" }}>
                            No changes
                          </Typography>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Box>
          </Stack>
        </Card>
      )}

      {/* Roll Number Updater Modal */}
      {rollUpdaterModalOpen && (
        <StudentRollUpdaterModal
          open={rollUpdaterModalOpen}
          onClose={() => setRollUpdaterModalOpen(false)}
          selectedStudent={studentData}
          setUpdatedRollNumber={handleUpdateRollNumber}
        />
      )}

      {/* Change Details Modal */}
      <Modal open={changeDetailsOpen} onClose={() => setChangeDetailsOpen(false)}>
        <ModalDialog maxWidth="md">
          <DialogTitle>Class Change History</DialogTitle>
          <Divider />
          <DialogContent>
            {selectedChanges && selectedChanges.length > 0 ? (
              <Box sx={{ overflowX: "auto" }}>
                <Table
                  aria-label="change details"
                  sx={{
                    "--TableCell-paddingX": "0.75rem",
                    "--TableCell-paddingY": "0.75rem",
                  }}
                >
                  <thead>
                    <tr>
                      <th>Previous Class</th>
                      <th>Previous Section</th>
                      <th>Previous Roll Number</th>
                      <th>Updated At</th>
                      <th>Updated By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedChanges.map((record, idx) => (
                      <tr key={idx}>
                        <td>{getClassName(record.class)}</td>
                        <td>{record.section || "N/A"}</td>
                        <td>{record.rollNumber || "N/A"}</td>
                        <td>
                          {record.updatedAt
                            ? new Date(
                                record.updatedAt.toDate?.()
                                  || record.updatedAt,
                              ).toLocaleString()
                            : "N/A"}
                        </td>
                        <td>{record.updatedBy || "Unknown"}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Box>
            ) : (
              <Alert variant="outlined" color="primary">
                No change history available
              </Alert>
            )}
          </DialogContent>
        </ModalDialog>
      </Modal>
    </Stack>
  );
}

export default AcademicTab;
