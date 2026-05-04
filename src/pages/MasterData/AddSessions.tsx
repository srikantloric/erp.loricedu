import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  IconButton,
  Divider,
  Menu,
  MenuItem,
  Dropdown,
} from "@mui/joy";
import { Add, Edit, Calendar } from "iconsax-react";
import { AddSessionDialog } from "components/Modals/AddSessionDialog";
import { SessionType } from "types/session";
import { enqueueSnackbar } from "notistack";
import { useSchoolId } from "hooks/useSchoolId";
import {
  collection,
  setDoc,
  getDocs,
  query,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

const FIRESTORE_COLLECTION = "ACADEMIC_SESSIONS";

function AddSessions() {
  const [sessions, setSessions] = useState<SessionType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { schoolId } = useSchoolId();

  const { db } = useFirebase();

  // Fetch sessions from Firestore on component mount or when schoolId changes
  const fetchSessions = async () => {
    if (!schoolId) {
      console.warn("School ID not available");
      return;
    }

    setIsLoading(true);
    try {
      const q = query(collection(db, FIRESTORE_COLLECTION));
      const querySnapshot = await getDocs(q);
      const fetchedSessions: SessionType[] = [];

      querySnapshot.forEach((document) => {
        const data = document.data();
        fetchedSessions.push({
          sessionId: document.id,
          name: data.name,
          value: data.value,
          startDate: data.startDate,
          endDate: data.endDate,
          isActive: data.isActive,
          isLocked: data.isLocked,
          createdAt: data.createdAt?.toMillis?.() || data.createdAt,
        });
      });


      setSessions(
        fetchedSessions.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)),
      );
    } catch (error) {
      console.error("Error fetching sessions:", error);
      enqueueSnackbar("Failed to load sessions", { variant: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [schoolId]);

  const handleAddSession = async (session: SessionType) => {
    try {
      const sessionData = {
        name: session.name,
        value: session.value,
        startDate: session.startDate,
        endDate: session.endDate,
        isActive: session.isActive,
        isLocked: session.isLocked,
        createdAt: Timestamp.now(),
      };

      // Add document with session.value as the document ID
      const docRef = doc(collection(db, FIRESTORE_COLLECTION), session.value);
      await setDoc(docRef, sessionData);

      enqueueSnackbar("Session created successfully", { variant: "success" });
      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error("Error adding session:", error);
      enqueueSnackbar("Failed to create session", { variant: "error" });
    }
  };

  const handleToggleSessionStatus = async (
    sessionId: string,
    field: "isActive" | "isLocked",
  ) => {
    if (!schoolId) {
      enqueueSnackbar("School ID not available", { variant: "error" });
      return;
    }

    try {
      const sessionIndex = sessions.findIndex((s) => s.sessionId === sessionId);
      if (sessionIndex === -1) return;

      const updatedSession = sessions[sessionIndex];
      const newValue = !updatedSession[field];

      // Update in Firestore
      const sessionDocRef = doc(db, FIRESTORE_COLLECTION, sessionId);
      await updateDoc(sessionDocRef, {
        [field]: newValue,
      });

      // Update local state
      const updatedSessions = [...sessions];
      updatedSessions[sessionIndex] = {
        ...updatedSession,
        [field]: newValue,
      };
      setSessions(updatedSessions);

      const fieldLabel = field === "isActive" ? "Active" : "Locked";
      const status = newValue ? "enabled" : "disabled";
      enqueueSnackbar(`Session ${fieldLabel} status ${status}`, {
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating session:", error);
      enqueueSnackbar("Failed to update session", { variant: "error" });
    }
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Stack>
          <Typography level="h3">Session Management</Typography>
          <Typography level="body-sm" color="neutral">
            Create and manage academic sessions
          </Typography>
        </Stack>

        {/* Sessions Grid */}
        <Stack spacing={2}>
          {/* Add New Session Card */}
          <Card
            variant="outlined"
            sx={{
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "2px dashed",
              borderColor: "primary.300",
              "&:hover": {
                borderColor: "primary.500",
                backgroundColor: "primary.50",
                boxShadow: "md",
              },
            }}
            onClick={() => setIsModalOpen(true)}
          >
            <CardContent>
              <Stack
                spacing={2}
                alignItems="center"
                justifyContent="center"
                sx={{ py: 3 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    backgroundColor: "primary.100",
                  }}
                >
                  <Add size={32} color="var(--joy-palette-primary-main)" />
                </Box>
                <Stack spacing={0.5} alignItems="center">
                  <Typography level="title-md">Create New Session</Typography>
                  <Typography level="body-sm" color="neutral">
                    Click to add a new academic session
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>

          {/* Sessions Cards */}
          {isLoading ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography level="body-md" color="neutral">
                Loading sessions...
              </Typography>
            </Box>
          ) : sessions.length === 0 ? (
            <Box sx={{ py: 4, textAlign: "center" }}>
              <Typography level="body-md" color="neutral">
                No sessions created yet. Click above to create your first
                session.
              </Typography>
            </Box>
          ) : (
            sessions.map((session) => (
              <Card
                key={session.sessionId}
                variant="outlined"
                sx={{
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "md",
                    borderColor: "primary.300",
                  },
                }}
              >
                <CardContent>
                  <Stack spacing={2}>
                    {/* Session Header */}
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                    >
                      <Stack spacing={0.5} sx={{ flex: 1 }}>
                        <Typography level="title-lg">{session.name}</Typography>
                        <Typography level="body-sm" color="neutral">
                          {session.value}
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <Chip
                          variant="solid"
                          color={session.isActive ? "success" : "neutral"}
                          size="sm"
                        >
                          {session.isActive ? "Active" : "Inactive"}
                        </Chip>
                        <Chip
                          variant="solid"
                          color={session.isLocked ? "danger" : "success"}
                          size="sm"
                        >
                          {session.isLocked ? "Locked" : "Unlocked"}
                        </Chip>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Session Details */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={3}>
                      <Stack spacing={0.5}>
                        <Typography level="body-xs" color="neutral">
                          Start Date
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Calendar size={16} />
                          <Typography level="body-sm">
                            {new Date(session.startDate).toLocaleDateString(
                              "en-IN",
                            )}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack spacing={0.5}>
                        <Typography level="body-xs" color="neutral">
                          End Date
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Calendar size={16} />
                          <Typography level="body-sm">
                            {new Date(session.endDate).toLocaleDateString(
                              "en-IN",
                            )}
                          </Typography>
                        </Stack>
                      </Stack>

                      <Stack spacing={0.5}>
                        <Typography level="body-xs" color="neutral">
                          Created
                        </Typography>
                        <Typography level="body-sm">
                          {session.createdAt
                            ? new Date(session.createdAt).toLocaleDateString(
                                "en-IN",
                              )
                            : "-"}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Divider sx={{ my: 1 }} />

                    {/* Actions */}
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Dropdown>
                        <IconButton
                          slot="trigger"
                          variant="outlined"
                          color="primary"
                          size="sm"
                          //   loading={editingSessionId === session.sessionId}
                        >
                          <Edit size={18} />
                        </IconButton>
                        <Menu>
                          <MenuItem
                            onClick={() =>
                              handleToggleSessionStatus(
                                session.sessionId!,
                                "isActive",
                              )
                            }
                          >
                            {session.isActive ? "Deactivate" : "Activate"}{" "}
                            Session
                          </MenuItem>
                          <MenuItem
                            onClick={() =>
                              handleToggleSessionStatus(
                                session.sessionId!,
                                "isLocked",
                              )
                            }
                          >
                            {session.isLocked ? "Unlock" : "Lock"} Session
                          </MenuItem>
                        </Menu>
                      </Dropdown>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))
          )}
        </Stack>
      </Stack>

      {/* Add Session Modal */}
      <AddSessionDialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={(session) => {
          handleAddSession(session);
          setIsModalOpen(false);
        }}
      />
    </Box>
  );
}

export default AddSessions;
