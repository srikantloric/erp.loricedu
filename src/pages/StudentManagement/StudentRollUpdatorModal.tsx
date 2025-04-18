import React, { useState, useRef, useEffect } from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from "@dnd-kit/core";
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
    arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { StudentDetailsType } from "types/student";
import {
    CircularProgress,
    DialogTitle,
    Divider,
    Modal,
    ModalDialog,
    Button,
    Stack
} from "@mui/joy";
import { collection, query, where, getDocs, doc, writeBatch } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { enqueueSnackbar } from "notistack";

// Sortable Item
interface SortableStudentItemProps {
    student: StudentDetailsType;
    originalIndex: number;
    isSelected: boolean;
    forwardedRef?: React.MutableRefObject<HTMLDivElement | null>;
}

const SortableStudentItem: React.FC<SortableStudentItemProps> = ({
    student,
    originalIndex,
    isSelected,
    forwardedRef
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition
    } = useSortable({ id: student.id });

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        padding: "1rem",
        marginBottom: "0.5rem",
        border: "1px solid #ccc",
        borderRadius: "8px",
        background: isSelected ? "#e0f7fa" : "#fff",
        boxShadow:
            originalIndex + 1 !== Number(student.class_roll)
                ? "0 0 10px rgba(255, 204, 0, 0.6)"
                : "",
        cursor: "grab"
    };

    return (
        <div
            ref={(node) => {
                setNodeRef(node);
                if (forwardedRef) forwardedRef.current = node;
            }}
            style={style}
            {...attributes}
            {...listeners}
        >
            <strong>{student.student_name}</strong>
            <div style={{ fontSize: "0.9rem", marginTop: "0.25rem" }}>
                Previous Roll: <b>{originalIndex + 1}</b> | Current Roll:{" "}
                <b
                    style={{
                        color:
                            originalIndex + 1 !== Number(student.class_roll)
                                ? "red"
                                : "green"
                    }}
                >
                    {Number(student.class_roll)}
                </b>
            </div>
        </div>
    );
};

// Modal
type StudentRollUpdaterModalProps = {
    open: boolean;
    onClose: () => void;
    selectedStudent: StudentDetailsType;
    setUpdatedRollNumber: (updatedRoll: string) => void
};

const StudentRollUpdaterModal: React.FC<StudentRollUpdaterModalProps> = ({
    open,
    onClose,
    selectedStudent,
    setUpdatedRollNumber
}) => {
    const [students, setStudents] = useState<StudentDetailsType[]>([]);
    const originalOrderRef = useRef<StudentDetailsType[]>([]);
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const { db } = useFirebase();

    // Fetch
    useEffect(() => {
        if (!selectedStudent) {
            enqueueSnackbar("Failed to load student data!", { variant: "error" });
            return;
        }

        const fetchStudents = async () => {
            if (selectedStudent.class) {
                setLoading(true);
                const q = query(
                    collection(db, "STUDENTS"),
                    where("class", "==", selectedStudent.class)
                );
                const querySnapshot = await getDocs(q);
                const fetched: StudentDetailsType[] = [];
                querySnapshot.forEach((doc) =>
                    fetched.push({ ...doc.data(), id: doc.id } as StudentDetailsType)
                );
                fetched.sort((a, b) => Number(a.class_roll) - Number(b.class_roll));
                setStudents(fetched);
                originalOrderRef.current = [...fetched]; // full object snapshot
                setLoading(false);
            }
        };

        fetchStudents();
    }, [selectedStudent, db]);

    // Scroll to selected
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [students]);

    const sensors = useSensors(useSensor(PointerSensor));

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (active.id !== over?.id) {
            const oldIndex = students.findIndex((s) => s.id === active.id);
            const newIndex = students.findIndex((s) => s.id === over?.id);
            const updated = arrayMove(students, oldIndex, newIndex).map((student, idx) => ({
                ...student,
                class_roll: (idx + 1).toString()
            }));
            setStudents(updated);
        }
    };

    const handleUpdate = async () => {
        const changedStudents = students.filter((student, index) => {
            const original = originalOrderRef.current.find((s) => s.id === student.id);
            return original?.class_roll !== student.class_roll;
        });

        if (changedStudents.length === 0) {
            enqueueSnackbar("No changes to update", { variant: "info" });
            return;
        }

        try {
            const batch = writeBatch(db);
            changedStudents.forEach((student) => {
                const studentRef = doc(db, "STUDENTS", student.id);
                batch.update(studentRef, { class_roll: student.class_roll });
            });
            await batch.commit();

            // 🔁 Set the updated roll number of selected student
            const updatedStudent = students.find(s => s.id === selectedStudent.id);
            if (updatedStudent) {
                setUpdatedRollNumber(updatedStudent.class_roll || "");
            }

            enqueueSnackbar("Roll numbers updated successfully!", { variant: "success" });
            onClose();
        } catch (error) {
            console.error("Update failed:", error);
            enqueueSnackbar("Failed to update roll numbers", { variant: "error" });
        }
    };

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog minWidth="sm" sx={{ overflow: "scroll", maxHeight: "90vh" }}>
                <DialogTitle>🎓 Student Roll Number Updater</DialogTitle>
                <Divider />
                {loading ? (
                    <CircularProgress />
                ) : (
                    <>
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={students.map((s) => s.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                {students.map((student) => {
                                    const originalIndex = originalOrderRef.current.findIndex(
                                        (s) => s.id === student.id
                                    );
                                    const isSelected = student.id === selectedStudent?.id;

                                    return (
                                        <SortableStudentItem
                                            key={student.id}
                                            student={student}
                                            originalIndex={originalIndex}
                                            isSelected={isSelected}
                                            forwardedRef={isSelected ? scrollRef : undefined}
                                        />
                                    );
                                })}
                            </SortableContext>
                        </DndContext>

                        <Stack direction="row" justifyContent="flex-end" spacing={2} mt={2}>
                            <Button variant="plain" onClick={onClose}>
                                Cancel
                            </Button>
                            <Button variant="solid" onClick={handleUpdate}>
                                Update
                            </Button>
                        </Stack>
                    </>
                )}
            </ModalDialog>
        </Modal>
    );
};

export default StudentRollUpdaterModal;
