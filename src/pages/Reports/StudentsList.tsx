import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { IconReport } from "@tabler/icons-react";
import { Avatar, Box, Button, FormControl, FormLabel, Option, Select, Stack, Typography, Chip, LinearProgress, Modal, ModalDialog, DialogTitle, DialogContent, List, ListItem, Checkbox, Input, IconButton } from "@mui/joy";
import { Paper } from "@mui/material";
import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";
import { StudentDetailsType } from "types/student";
import { StudReportPDF } from "components/StudentDetailsReport/StudentReportGeneratorPDF";
import ExportToExcel from "components/Reports/ExportToExcel";
import { SCHOOL_CLASSES, SCHOOL_SECTIONS } from "config/schoolConfig";
import MaterialTable from "@material-table/core";
import { Link } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import { Add, Close } from "@mui/icons-material";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";

// Class name lookup for the table
const classLookup: { [key: number]: string } = {
    1: "Nursery",
    2: "LKG",
    3: "UKG",
    4: "STD-1",
    5: "STD-2",
    6: "STD-3",
    7: "STD-4",
    8: "STD-5",
    9: "STD-6",
    10: "STD-7",
    11: "STD-8",
    12: "STD-9",
    13: "STD-10",
    14: "Pre-Nursery",
};

interface Column {
    field: string;
    title: string;
    selected: boolean;
    isCustom?: boolean;
}

const defaultColumns: Column[] = [
    { field: "admission_no", title: "ID", selected: true },
    { field: "profil_url", title: "Profile", selected: true },
    { field: "student_name", title: "Name", selected: true },
    { field: "class", title: "Class", selected: true },
    { field: "section", title: "Section", selected: true },
    { field: "class_roll", title: "Roll", selected: true },
    { field: "father_name", title: "Father Name", selected: true },
    { field: "mother_name", title: "Mother Name", selected: false },
    { field: "gender", title: "Gender", selected: false },
    { field: "dob", title: "Date of Birth", selected: false },
    { field: "contact_number", title: "Contact Number", selected: true },
    { field: "email", title: "Email", selected: false },
    { field: "address", title: "Address", selected: false },
    { field: "blood_group", title: "Blood Group", selected: false },
    { field: "religion", title: "Religion", selected: false },
    { field: "caste", title: "Caste", selected: false },
    { field: "monthly_fee", title: "Monthly Fee", selected: false },
    { field: "computer_fee", title: "Computer Fee", selected: false },
    { field: "transportation_fee", title: "Transport Fee", selected: false },
    { field: "aadhar_number", title: "Aadhar Number", selected: false },
    { field: "date_of_addmission", title: "Admission Date", selected: false }
];

interface CustomField {
    field: string;
    title: string;
}

const StudentsList = () => {
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedClass, setSelectedClass] = useState<number>(-1);
    const [selectedSection, setSelectedSection] = useState<number>(-1);
    const [students, setStudents] = useState<StudentDetailsType[]>([]);
    const [filterChip, setFilterChip] = useState(false);
    const [filterChipLabel, setFilterChipLabel] = useState("");
    const [columnSelectionOpen, setColumnSelectionOpen] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState<Column[]>(defaultColumns);
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [newFieldName, setNewFieldName] = useState("");
    const { db } = useFirebase();

    const fetchStudents = async () => {
        try {
            setLoading(true);
            setPdfUrl(null);
            let studentsQuery;

            if (selectedClass === -1) {
                studentsQuery = collection(db, "STUDENTS");
            } else {
                studentsQuery = selectedSection === -1
                    ? query(collection(db, "STUDENTS"), where("class", "==", selectedClass))
                    : query(
                        collection(db, "STUDENTS"),
                        where("class", "==", selectedClass),
                        where("section", "==", selectedSection)
                    );
            }

            const studentSnapshot = await getDocs(studentsQuery);
            const studentsList: StudentDetailsType[] = [];

            studentSnapshot.forEach((doc) => {
                studentsList.push({ id: doc.id, ...doc.data() } as StudentDetailsType);
            });

            setStudents(studentsList);
        } catch (error) {
            console.error("Error fetching students:", error);
            enqueueSnackbar("Error fetching students: " + error, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedClass !== -1) {
            fetchStudents();
            setFilterChipLabel(
                selectedSection !== -1
                    ? `Filter set for class ${getClassNameByValue(selectedClass)} and section ${selectedSection}`
                    : `Filter set for class ${getClassNameByValue(selectedClass)}`
            );
            setFilterChip(true);
        }
    }, [selectedClass, selectedSection]);

    // Helper to get all selected columns (default + custom)
    const getAllSelectedColumns = () => {
        // Merge selected default columns and selected custom fields (from ColumnSelector)
        const selectedDefault = selectedColumns.filter(col => col.selected);
        // Custom fields are managed in selectedColumns with isCustom: true
        const selectedCustom = selectedColumns.filter(col => col.isCustom && col.selected);
        return [...selectedDefault, ...selectedCustom];
    };

    // Helper to get table columns config for MaterialTable
    const getSelectedColumnsConfig = () => {
        const allSelected = getAllSelectedColumns();
        return allSelected.map(col => {
            switch (col.field) {
                case "class":
                    return {
                        field: col.field,
                        title: col.title,
                        lookup: classLookup,
                        render: (rowData: StudentDetailsType) => {
                            const className = getClassNameByValue(rowData.class!);
                            return <p>{className}</p>;
                        }
                    };
                case "admission_no":
                    return {
                        field: col.field,
                        title: col.title,
                        render: (rowData: StudentDetailsType) => (
                            <Link
                                to={`/students/profile/${rowData.id}`}
                                style={{
                                    fontSize: "14px",
                                    textDecoration: "none",
                                    fontWeight: "500",
                                    color: "var(--bs-primary-text)",
                                }}
                            >
                                {rowData.admission_no}
                            </Link>
                        ),
                    };
                case "profil_url":
                    return {
                        ...col,
                        render: (rowData: StudentDetailsType) => (
                            <Avatar
                                src={rowData.profil_url}
                                alt={`${rowData.student_name}-profile`}
                                sx={{ width: 32, height: 32 }}
                            />
                        )
                    };
                case "contact_number":
                    return {
                        ...col,
                        render: (rowData: StudentDetailsType) => (
                            rowData.contact_number ? `+91-${rowData.contact_number}` : '-'
                        )
                    };
                case "monthly_fee":
                case "computer_fee":
                case "transportation_fee":
                    return {
                        ...col,
                        render: (rowData: StudentDetailsType) => (
                            (rowData as any)[col.field] ? `₹${(rowData as any)[col.field]}` : '-'
                        )
                    };
                default:
                    // For custom columns, just show empty or placeholder
                    if (col.isCustom) {
                        return {
                            field: col.field,
                            title: col.title,
                            render: () => ""
                        };
                    }
                    return col;
            }
        });
    };

    // Only export selected columns (including custom) in PDF/Excel
    const handleGeneratePDF = async () => {
        try {
            setLoading(true);
            const allSelected = getAllSelectedColumns();
            const selectedData = students.map(student => {
                const filteredStudent: any = {};
                allSelected.forEach(col => {
                    if (col.field === "class") {
                        filteredStudent[col.field] = getClassNameByValue(student.class!);
                    } else if (col.field === "contact_number") {
                        filteredStudent[col.field] = student.contact_number ? `+91-${student.contact_number}` : '-';
                    } else if (["monthly_fee", "computer_fee", "transportation_fee"].includes(col.field)) {
                        filteredStudent[col.field] = (student as any)[col.field] ? `₹${(student as any)[col.field]}` : '-';
                    } else if (col.field === "profil_url") {
                        // Skip profile in PDF export (or show as blank)
                        filteredStudent[col.field] = '';
                    } else if (col.isCustom) {
                        filteredStudent[col.field] = '';
                    } else {
                        filteredStudent[col.field] = (student as any)[col.field] ?? '-';
                    }
                });
                return filteredStudent;
            });
            const pdfResult = await StudReportPDF(selectedData);
            if (pdfResult) {
                setPdfUrl(pdfResult as string);
                enqueueSnackbar("PDF generated successfully", { variant: "success" });
            }
        } catch (error) {
            console.error("Error generating PDF:", error);
            enqueueSnackbar("Error generating PDF: " + error, { variant: "error" });
        } finally {
            setLoading(false);
        }
    };

    const handleExportExcel = () => {
        try {
            const allSelected = getAllSelectedColumns();
            const selectedData = students.map(student => {
                const filteredStudent: any = {};
                allSelected.forEach(col => {
                    if (col.field === "class") {
                        filteredStudent[col.field] = getClassNameByValue(student.class!);
                    } else if (col.field === "contact_number") {
                        filteredStudent[col.field] = student.contact_number ? `+91-${student.contact_number}` : '-';
                    } else if (["monthly_fee", "computer_fee", "transportation_fee"].includes(col.field)) {
                        filteredStudent[col.field] = (student as any)[col.field] ? `₹${(student as any)[col.field]}` : '-';
                    } else if (col.field === "profil_url") {
                        // Skip profile URL in Excel export
                        filteredStudent[col.field] = '';
                    } else if (col.isCustom) {
                        filteredStudent[col.field] = '';
                    } else {
                        filteredStudent[col.field] = (student as any)[col.field] ?? '-';
                    }
                });
                return filteredStudent;
            });
            ExportToExcel(selectedData);
            enqueueSnackbar("Excel file exported successfully", { variant: "success" });
        } catch (error) {
            console.error("Error exporting to Excel:", error);
            enqueueSnackbar("Error exporting to Excel: " + error, { variant: "error" });
        }
    };

    const handleFilterReset = () => {
        setFilterChip(false);
        setSelectedClass(-1);
        setSelectedSection(-1);
        setStudents([]);
        setPdfUrl(null);
    };

    const handleColumnToggle = (field: string) => {
        setSelectedColumns(prevCols =>
            prevCols.map(col =>
                col.field === field ? { ...col, selected: !col.selected } : col
            )
        );
    };

    const handleAddCustomField = () => {
        if (!newFieldName.trim()) {
            enqueueSnackbar("Please enter a column name", { variant: "warning" });
            return;
        }

        const fieldId = `custom_${newFieldName.toLowerCase().replace(/\s+/g, '_')}`;

        if (customFields.some(f => f.field === fieldId)) {
            enqueueSnackbar("A column with this name already exists", { variant: "warning" });
            return;
        }

        setCustomFields(prev => [...prev, {
            field: fieldId,
            title: newFieldName
        }]);
        setNewFieldName("");
        enqueueSnackbar("Custom column added", { variant: "success" });
    };

    const handleRemoveCustomField = (field: string) => {
        setCustomFields(prev => prev.filter(f => f.field !== field));
        enqueueSnackbar("Custom column removed", { variant: "success" });
    };

    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <BreadCrumbsV2 Icon={IconReport} Path="Reports/Students List" />
                <br />
                <Paper sx={{ p: "10px", mt: "8px" }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography level="title-md">Students List</Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <FormControl>
                                <FormLabel>Class</FormLabel>
                                <Select
                                    placeholder="choose class"
                                    value={selectedClass}
                                    onChange={(e, val) => val !== null && setSelectedClass(val)}
                                    sx={{ minWidth: 150 }}
                                >
                                    <Option value={-1}>All Classes</Option>
                                    {SCHOOL_CLASSES.map((item) => (
                                        <Option key={item.id} value={item.value}>
                                            {item.title}
                                        </Option>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl>
                                <FormLabel>Section</FormLabel>
                                <Select
                                    placeholder="choose section"
                                    value={selectedSection}
                                    onChange={(e, val) => val !== null && setSelectedSection(val)}
                                    disabled={selectedClass === -1}
                                    sx={{ minWidth: 150 }}
                                >
                                    <Option value={-1}>All Sections</Option>
                                    {SCHOOL_SECTIONS.map((section) => (
                                        <Option key={`section-${section.value}`} value={section.value}>
                                            {section.title}
                                        </Option>
                                    ))}
                                </Select>
                            </FormControl>

                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    onClick={() => setColumnSelectionOpen(true)}
                                >
                                    Select Columns
                                </Button>
                                <Button
                                    disabled={students.length === 0}
                                    onClick={handleGeneratePDF}
                                >
                                    Generate PDF
                                </Button>
                                <Button
                                    disabled={students.length === 0}
                                    onClick={handleExportExcel}
                                >
                                    Export Excel
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </Paper>

                <Modal open={columnSelectionOpen} onClose={() => setColumnSelectionOpen(false)}>
                    <ModalDialog
                        sx={{
                            minWidth: 400,
                            maxWidth: '80vw',
                            maxHeight: '90vh',
                        }}
                    >
                        <DialogTitle>
                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Typography level="h4">Configure Report Columns</Typography>
                                <IconButton
                                    variant="plain"
                                    onClick={() => setColumnSelectionOpen(false)}
                                >
                                    <Close />
                                </IconButton>
                            </Stack>
                        </DialogTitle>
                        <DialogContent sx={{ overflow: 'hidden' }}>
                            <Box>
                                <Typography level="body-sm" sx={{ mb: 1, color: 'neutral.500' }}>
                                    Select the columns you want to include in the report
                                </Typography>
                                <List
                                    sx={{
                                        maxHeight: '400px',
                                        overflowY: 'auto',
                                        border: '1px solid',
                                        borderColor: 'neutral.200',
                                        borderRadius: 'sm',
                                        p: 1,
                                    }}
                                >
                                    <ListItem>
                                        <Checkbox
                                            label="Select All"
                                            checked={selectedColumns.every(col => col.selected)}
                                            onChange={() => {
                                                const allSelected = selectedColumns.every(col => col.selected);
                                                setSelectedColumns(cols =>
                                                    cols.map(col => ({ ...col, selected: !allSelected }))
                                                );
                                            }}
                                        />
                                    </ListItem>
                                    {selectedColumns.map((col) => (
                                        <ListItem key={col.field}>
                                            <Checkbox
                                                checked={col.selected}
                                                onChange={() => handleColumnToggle(col.field)}
                                                label={col.title}
                                            />
                                        </ListItem>
                                    ))}
                                </List>

                                <Typography level="body-sm" sx={{ mt: 2, mb: 1, color: 'neutral.500' }}>
                                    Custom Fields
                                </Typography>
                                <List
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'neutral.200',
                                        borderRadius: 'sm',
                                        p: 1,
                                    }}
                                >
                                    {customFields.map((field) => (
                                        <ListItem key={field.field}>
                                            <Checkbox
                                                checked={true}
                                                label={field.title}
                                                disabled
                                            />
                                            <IconButton
                                                size="sm"
                                                variant="plain"
                                                color="danger"
                                                onClick={() => handleRemoveCustomField(field.field)}
                                            >
                                                <Close />
                                            </IconButton>
                                        </ListItem>
                                    ))}
                                    <ListItem>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: '100%' }}>
                                            <Input
                                                size="sm"
                                                placeholder="Enter custom column name"
                                                value={newFieldName}
                                                onChange={(e) => setNewFieldName(e.target.value)}
                                                sx={{ flex: 1 }}
                                            />
                                            <IconButton
                                                size="sm"
                                                variant="solid"
                                                color="primary"
                                                onClick={handleAddCustomField}
                                            >
                                                <Add />
                                            </IconButton>
                                        </Stack>
                                    </ListItem>
                                </List>
                            </Box>
                        </DialogContent>
                    </ModalDialog>
                </Modal>

                {loading && <LinearProgress sx={{ mt: 2 }} />}

                {filterChip && (
                    <Stack direction="row" spacing={1} mt={2} mb={1}>
                        <Chip
                            color="primary"
                            variant="soft"
                            endDecorator={<Close onClick={handleFilterReset} sx={{ cursor: "pointer" }} />}
                        >
                            {filterChipLabel}
                        </Chip>
                        <Chip color="primary" variant="soft">
                            Total Students: {students.length}
                        </Chip>
                    </Stack>
                )}

                {students.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                        <MaterialTable
                            style={{
                                display: "grid",
                                overflow: "hidden",
                                border: "1px solid oklch(.905 .013 255.508)",
                                borderRadius: "10px",
                                boxShadow: "none"
                            }}
                            columns={getSelectedColumnsConfig()}
                            data={students}
                            title="Students Data"
                            options={{
                                grouping: true,
                                pageSizeOptions: [5, 10, 20, 50, 100],
                                pageSize: 10,
                                headerStyle: {
                                    backgroundColor: "#5d87ff",
                                    color: "#FFF",
                                },
                                exportMenu: [
                                    {
                                        label: "Export PDF",
                                        exportFunc: handleGeneratePDF,
                                    },
                                    {
                                        label: "Export Excel",
                                        exportFunc: handleExportExcel,
                                    },
                                ],
                            }}
                        />
                    </Box>
                )}

                {pdfUrl && (
                    <Paper sx={{ height: "100vh", mt: 2 }}>
                        <iframe
                            src={pdfUrl}
                            title="PDF Viewer"
                            width="100%"
                            height="100%"
                            frameBorder={0}
                        />
                    </Paper>
                )}
            </LSPage>
        </PageContainer>
    );
};

export default StudentsList;