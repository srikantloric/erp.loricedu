import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";

import { IconReport } from "@tabler/icons-react";
import {
  Avatar,
  FormLabel,
  Box,
  Button,
  FormControl,
  Option,
  Select,
  Stack,
  Typography,
  Chip,
  LinearProgress,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  Checkbox,
  Input,
  IconButton,
} from "@mui/joy";
import { Paper } from "@mui/material";
import { useState } from "react";
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
  { field: "date_of_addmission", title: "Admission Date", selected: false },
  { field: "rfidCode", title: "RFID Code", selected: false },
];

interface CustomField {
  field: string;
  title: string;
}

const StudentsList = () => {
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState<number>(-1);
  const [selectedSection, setSelectedSection] = useState<number>(-1);
  const [students, setStudents] = useState<StudentDetailsType[]>([]);
  const [filterChip, setFilterChip] = useState(false);
  const [filterChipLabel, setFilterChipLabel] = useState("");
  const [sortingPreference, setSortingPreference] = useState<
    | "student_name"
    | "class_roll"
    | "admission_no"
    | "date_of_addmission"
    | "dob"
    | ""
  >("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [columnSelectionOpen, setColumnSelectionOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] =
    useState<Column[]>(defaultColumns);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const { db } = useFirebase();

  const sortData = (data: StudentDetailsType[]) => {
    if (!sortingPreference) return data;

    return [...data].sort((a, b) => {
      const aValue = (a as any)[sortingPreference];
      const bValue = (b as any)[sortingPreference];

      // Handle null/undefined values
      if (!aValue && !bValue) return 0;
      if (!aValue) return sortOrder === "asc" ? 1 : -1;
      if (!bValue) return sortOrder === "asc" ? -1 : 1;

      let comparison = 0;

      // Handle date fields
      if (
        sortingPreference === "date_of_addmission" ||
        sortingPreference === "dob"
      ) {
        const aDate = new Date(aValue).getTime();
        const bDate = new Date(bValue).getTime();
        if (isNaN(aDate) && isNaN(bDate)) return 0;
        if (isNaN(aDate)) return sortOrder === "asc" ? 1 : -1;
        if (isNaN(bDate)) return sortOrder === "asc" ? -1 : 1;
        comparison = aDate - bDate;
      }
      // Handle numeric fields (including class_roll, admission_no)
      else if (
        sortingPreference === "class_roll" ||
        sortingPreference === "admission_no" ||
        (typeof aValue === "number" && typeof bValue === "number")
      ) {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        if (isNaN(aNum) && isNaN(bNum)) return 0;
        if (isNaN(aNum)) return sortOrder === "asc" ? 1 : -1;
        if (isNaN(bNum)) return sortOrder === "asc" ? -1 : 1;
        comparison = aNum - bNum;
      }
      // Handle string fields (including student_name)
      else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      // Apply sort order (asc/desc)
      return sortOrder === "asc" ? comparison : -comparison;
    });
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let studentsQuery;

      if (selectedClass === -1) {
        studentsQuery = query(
          collection(db, "STUDENTS"),
          where("is_active", "==", true)
        );
      } else {
        studentsQuery =
          selectedSection === -1
            ? query(
              collection(db, "STUDENTS"),
              where("class", "==", selectedClass),
              where("is_active", "==", true)
            )
            : query(
              collection(db, "STUDENTS"),
              where("class", "==", selectedClass),
              where("section", "==", selectedSection),
              where("is_active", "==", true)
            );
      }

      const studentSnapshot = await getDocs(studentsQuery);
      const studentsList: StudentDetailsType[] = [];

      studentSnapshot.forEach((doc) => {
        studentsList.push({ id: doc.id, ...doc.data() } as StudentDetailsType);
      });

      // Sort the data if sorting preference is set
      const sortedList = sortData(studentsList);
      setStudents(sortedList);
    } catch (error) {
      console.error("Error fetching students:", error);
      enqueueSnackbar("Error fetching students: " + error, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // To fetch students based on selected class and section
  const handelFetchStudentDetails = () => {
    fetchStudents();
    if (selectedClass !== -1) {
      setFilterChipLabel(
        selectedSection !== -1
          ? `Filter set for class ${getClassNameByValue(
            selectedClass
          )} and section ${selectedSection}`
          : `Filter set for class ${getClassNameByValue(selectedClass)}`
      );
      setFilterChip(true);
    } else {
      setFilterChip(false);
    }
  };

  //  To get all selected columns (default + custom)
  const getAllSelectedColumns = () => {
    // Return all selected columns (both default and custom)
    return selectedColumns.filter((col) => col.selected);
  };

  // To get table columns config for MaterialTable
  const getSelectedColumnsConfig = () => {
    const allSelected = getAllSelectedColumns();
    return allSelected.map((col) => {
      switch (col.field) {
        case "class":
          return {
            field: col.field,
            title: col.title,
            lookup: classLookup,
            render: (rowData: StudentDetailsType) => {
              const className = getClassNameByValue(rowData.class!);
              return <p>{className}</p>;
            },
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
            ),
          };
        case "contact_number":
          return {
            ...col,
            render: (rowData: StudentDetailsType) =>
              rowData.contact_number ? `+91-${rowData.contact_number}` : "-",
          };
        case "monthly_fee":
        case "computer_fee":
        case "transportation_fee":
          return {
            ...col,
            render: (rowData: StudentDetailsType) =>
              (rowData as any)[col.field]
                ? `₹${(rowData as any)[col.field]}`
                : "-",
          };
        default:
          // For custom columns, just show empty or placeholder
          if (col.isCustom) {
            return {
              field: col.field,
              title: col.title,
              render: () => "",
            };
          }
          return col;
      }
    });
  };

  // To format student data based on column type
  const formatStudentData = (
    student: StudentDetailsType,
    col: Column
  ): string => {
    if (!student) return "-";

    switch (col.field) {
      case "class":
        return student.class ? getClassNameByValue(student.class) ?? "-" : "-";
      case "contact_number":
        return student.contact_number ? `+91-${student.contact_number}` : "-";
      case "monthly_fee":
      case "computer_fee":
      case "transportation_fee":
        const fee = (student as any)[col.field];
        return fee ? `₹${fee}` : "-";
      default:
        return col.isCustom ? "-" : (student as any)[col.field] ?? "-";
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      const selectedCols = getAllSelectedColumns().filter(
        (col) => col.field !== "profil_url"
      );

      if (selectedCols.length === 0) {
        enqueueSnackbar("Please select at least one column to generate PDF", {
          variant: "warning",
        });
        setLoading(false);
        return;
      }

      // Apply sorting to data before PDF generation
      const sortedData = sortData(students);

      // Debug log to verify sorting
      console.log("Sorting preference:", sortingPreference);
      if (sortingPreference) {
        console.log(
          "First few sorted records:",
          sortedData.slice(0, 3).map((s) => ({
            name: s.student_name,
            value: (s as any)[sortingPreference],
          }))
        );
      }

      // Prepare columns configuration for PDF
      const pdfColumns = selectedCols.map((col) => ({
        field: col.field,
        title: col.title,
        ...(col.field === "class" ? { lookup: classLookup } : {}),
      }));

      // Format data for PDF
      const pdfData = sortedData.map((student) => {
        const formattedStudent: Partial<StudentDetailsType> = {};
        selectedCols.forEach((col) => {
          const formattedValue = formatStudentData(student, col);
          (formattedStudent as any)[col.field] = formattedValue;
        });
        return formattedStudent as StudentDetailsType;
      });

      const pdfResult = await StudReportPDF(pdfData, pdfColumns);
      if (pdfResult) {
        window.open(pdfResult as string, "_blank");
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
      const selectedCols = getAllSelectedColumns();

      if (selectedCols.length === 0) {
        enqueueSnackbar("Please select at least one column to export", {
          variant: "warning",
        });
        return;
      }

      // Sort data before exporting to Excel
      const sortedData = sortData(students);

      // Format data for Excel
      const excelData = sortedData.map((student) => {
        const formattedRow: any = {};
        selectedCols.forEach((col) => {
          formattedRow[col.field] = formatStudentData(student, col);
        });
        return formattedRow;
      });

      // Format column configuration
      const excelColumns = selectedCols.map((col) => ({
        field: col.field,
        title: col.title,
      }));

      const currentDate = new Date().toLocaleDateString().replace(/\//g, "-");
      const filename = `students_list_${currentDate}.xlsx`;

      ExportToExcel({
        data: excelData,
        columns: excelColumns,
        filename,
      });

      enqueueSnackbar("Excel file exported successfully", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      enqueueSnackbar("Error exporting to Excel: " + error, {
        variant: "error",
      });
    }
  };

  const handleFilterReset = () => {
    setFilterChip(false);
    setSelectedClass(-1);
    setSelectedSection(-1);
    setStudents([]);
  };

  const handleColumnToggle = (field: string) => {
    setSelectedColumns((prevCols) =>
      prevCols.map((col) =>
        col.field === field ? { ...col, selected: !col.selected } : col
      )
    );
  };

  const handleAddCustomField = () => {
    if (!newFieldName.trim()) {
      enqueueSnackbar("Please enter a column name", { variant: "warning" });
      return;
    }

    const fieldId = `custom_${newFieldName.toLowerCase().replace(/\s+/g, "_")}`;

    if (selectedColumns.some((f) => f.field === fieldId)) {
      enqueueSnackbar("A column with this name already exists", {
        variant: "warning",
      });
      return;
    }

    // Create the new custom field
    const newColumn = {
      field: fieldId,
      title: newFieldName,
      selected: true,
      isCustom: true,
    };

    // Add to selectedColumns
    setSelectedColumns((prev) => [...prev, newColumn]);

    setCustomFields((prev) => [
      ...prev,
      { field: fieldId, title: newFieldName },
    ]);

    setNewFieldName("");
    enqueueSnackbar("Custom column added", { variant: "success" });
  };

  const handleRemoveCustomField = (field: string) => {
    setCustomFields((prev) => prev.filter((f) => f.field !== field));

    setSelectedColumns((prev) => prev.filter((col) => col.field !== field));
    enqueueSnackbar("Custom column removed", { variant: "success" });
  };

  // Handle sort order change and re-sort existing data
  const handleSortOrderChange = (newOrder: "asc" | "desc") => {
    setSortOrder(newOrder);
    if (students.length > 0 && sortingPreference) {
      const sortedData = sortData(students);
      setStudents(sortedData);
    }
  };

  // Handle sorting preference change and re-sort existing data
  const handleSortingPreferenceChange = (newPreference: string) => {
    setSortingPreference(newPreference as any);
    if (students.length > 0 && newPreference) {
      const sortedData = sortData(students);
      setStudents(sortedData);
    }
  };

  return (
    <>

      <BreadCrumbsV2 Icon={IconReport} Path="Reports/Students List" />
      <br />
      <Paper sx={{ p: "10px", mt: "8px" }}>
        <Box>
          <Typography level="title-md">Students List</Typography>
        </Box>
        <Stack direction="column" spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <Box>
              <FormControl>
                <FormLabel>Class</FormLabel>
                <Select
                  placeholder="choose class"
                  value={selectedClass}
                  onChange={(e, val) => val !== null && setSelectedClass(val)}
                  sx={{ minWidth: 150 }}
                >
                  <Option value={-1}>Select Class</Option>
                  {SCHOOL_CLASSES.map((item) => (
                    <Option key={item.id} value={item.value}>
                      {item.title}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Section</FormLabel>
                <Select
                  placeholder="choose section"
                  value={selectedSection}
                  onChange={(e, val) =>
                    val !== null && setSelectedSection(val)
                  }
                  disabled={selectedClass === -1}
                  sx={{ minWidth: 150 }}
                >
                  <Option value={-1}>All Sections</Option>
                  {SCHOOL_SECTIONS.map((section) => (
                    <Option
                      key={`section-${section.value}`}
                      value={section.value}
                    >
                      {section.title}
                    </Option>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Sort By</FormLabel>
                <Select
                  placeholder="Select sorting preference"
                  value={sortingPreference}
                  onChange={(e, val) =>
                    handleSortingPreferenceChange(val || "")
                  }
                  sx={{ minWidth: 200 }}
                >
                  <Option value="">None</Option>
                  <Option value="student_name">Sort by Name</Option>
                  <Option value="class_roll">Sort by Roll</Option>
                  <Option value="admission_no">
                    Sort by Admission Number
                  </Option>
                  <Option value="date_of_addmission">
                    Sort by Admission Date
                  </Option>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl>
                <FormLabel>Sort Order</FormLabel>
                <Select
                  placeholder="Select sort order"
                  value={sortOrder}
                  onChange={(e, val) => val && handleSortOrderChange(val)}
                  disabled={!sortingPreference}
                  sx={{ minWidth: 150 }}
                >
                  <Option value="asc">Ascending</Option>
                  <Option value="desc">Descending</Option>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Button onClick={handelFetchStudentDetails} sx={{ mt: 3 }}>
                Fetch Students
              </Button>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
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
      </Paper>

      <Modal
        open={columnSelectionOpen}
        onClose={() => setColumnSelectionOpen(false)}
      >
        <ModalDialog
          sx={{
            minWidth: 400,
            maxWidth: "80vw",
            maxHeight: "90vh",
          }}
        >
          <DialogTitle>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography level="h4">Configure Report Columns</Typography>
              <IconButton
                variant="plain"
                onClick={() => setColumnSelectionOpen(false)}
              >
                <Close />
              </IconButton>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ overflow: "hidden" }}>
            <Box>
              <Typography
                level="body-sm"
                sx={{ mb: 1, color: "neutral.500" }}
              >
                Select the columns you want to include in the report
              </Typography>
              <List
                sx={{
                  maxHeight: "400px",
                  overflowY: "auto",
                  border: "1px solid",
                  borderColor: "neutral.200",
                  borderRadius: "sm",
                  p: 1,
                }}
              >
                <ListItem>
                  <Checkbox
                    label="Select All"
                    checked={selectedColumns.every((col) => col.selected)}
                    onChange={() => {
                      const allSelected = selectedColumns.every(
                        (col) => col.selected
                      );
                      setSelectedColumns((cols) =>
                        cols.map((col) => ({
                          ...col,
                          selected: !allSelected,
                        }))
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

              <Typography
                level="body-sm"
                sx={{ mt: 2, mb: 1, color: "neutral.500" }}
              >
                Custom Fields
              </Typography>
              <List
                sx={{
                  border: "1px solid",
                  borderColor: "neutral.200",
                  borderRadius: "sm",
                  p: 1,
                }}
              >
                {customFields.map((field) => (
                  <ListItem key={field.field}>
                    <Checkbox
                      checked={
                        selectedColumns.find(
                          (col) => col.field === field.field
                        )?.selected ?? true
                      }
                      label={field.title}
                      onChange={() => handleColumnToggle(field.field)}
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
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ width: "100%" }}
                  >
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
            endDecorator={
              <Close onClick={handleFilterReset} sx={{ cursor: "pointer" }} />
            }
          >
            {filterChipLabel}
          </Chip>
          <Chip color="primary" variant="soft">
            Total Students: {students.length}
          </Chip>
          {sortingPreference && (
            <Chip color="success" variant="soft">
              Sorted by: {sortingPreference.replace(/_/g, " ")} (
              {sortOrder === "asc" ? "Ascending" : "Descending"})
            </Chip>
          )}
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
              boxShadow: "none",
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
    </>
  );
};

export default StudentsList;
