import React, { useState } from "react";
import {
    TextField,
    Button,
    Grid,
    Typography,
    MenuItem,
    Card,
    CardContent,
    IconButton,
    Select,
    FormControl,
    InputLabel,
    Box
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

import { addDoc, collection } from "firebase/firestore";
import { SCHOOL_CLASSES, SchoolClass } from "config/schoolConfig";
import { useFirebase } from "context/firebaseContext";

const availableSubjects = [
    "ENGLISH", "MATHS", "HINDI", "SCIENCE", "SST", "COMPUTER",
    "G.K + CONV.", "DRAWING", "ORAL", "ORAL-ENGLISH", "ORAL-MATHS", "ORAL-HINDI"
];

const sessionOptions = ["1st", "2nd"];

const CreateExamPlan: React.FC = () => {
    const [date, setDate] = useState("");
    const [sessions, setSessions] = useState<any[]>([
        { session: "1st", subjects: {} }
    ]);

    const { db } = useFirebase()

    const handleSubjectChange = (
        sessionIndex: number,
        classTitle: string,
        subject: string
    ) => {
        const updatedSessions = [...sessions];
        updatedSessions[sessionIndex].subjects[classTitle] = subject;
        setSessions(updatedSessions);
    };

    const handleSessionChange = (index: number, sessionName: string) => {
        const updated = [...sessions];
        updated[index].session = sessionName;
        setSessions(updated);
    };

    const addSession = () => {
        setSessions([...sessions, { session: "1st", subjects: {} }]);
    };

    const removeSession = (index: number) => {
        const updated = sessions.filter((_, i) => i !== index);
        setSessions(updated);
    };

    const handleSubmit = async () => {
        if (!date) return alert("Please select a date.");
        if (sessions.length === 0) return alert("Add at least one session.");

        const newPlan: any = { date, sessions };
        await addDoc(collection(db, "examPlanner"), newPlan);
        alert("Exam plan saved to Firestore.");
        setDate("");
        setSessions([{ session: "1st", subjects: {} }]);
    };

    return (
        <Box sx={{ maxWidth: 1200, margin: "auto", p: 2 }}>
            <Typography variant="h5" gutterBottom>
                Create New Exam Plan
            </Typography>

            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                    <TextField
                        label="Date"
                        type="date"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </Grid>
            </Grid>

            {sessions.map((session, sessionIndex) => (
                <Card key={sessionIndex} sx={{ my: 2 }}>
                    <CardContent>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={10} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Session</InputLabel>
                                    <Select
                                        value={session.session}
                                        label="Session"
                                        onChange={(e) =>
                                            handleSessionChange(sessionIndex, e.target.value)
                                        }
                                    >
                                        {sessionOptions.map((s) => (
                                            <MenuItem key={s} value={s}>
                                                {s}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={2}>
                                {sessions.length > 1 && (
                                    <IconButton
                                        onClick={() => removeSession(sessionIndex)}
                                        aria-label="Remove session"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                )}
                            </Grid>

                            {SCHOOL_CLASSES.map((schoolClass: SchoolClass) => (
                                <Grid item xs={12} sm={6} md={4} key={schoolClass.id}>
                                    <FormControl fullWidth>
                                        <InputLabel>{schoolClass.title}</InputLabel>
                                        <Select
                                            value={
                                                session.subjects[schoolClass.title] || ""
                                            }
                                            label={schoolClass.title}
                                            onChange={(e) =>
                                                handleSubjectChange(
                                                    sessionIndex,
                                                    schoolClass.title,
                                                    e.target.value
                                                )
                                            }
                                        >
                                            {availableSubjects.map((subject) => (
                                                <MenuItem key={subject} value={subject}>
                                                    {subject}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </Card>
            ))}

            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={addSession}
                sx={{ mb: 2 }}
            >
                Add Session
            </Button>

            <div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 1 }}
                >
                    Save Exam Plan
                </Button>
            </div>
        </Box>
    );
};

export default CreateExamPlan;
