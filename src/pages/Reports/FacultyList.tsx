import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import { IconReport } from "@tabler/icons-react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  DialogContent,
  DialogTitle,
  IconButton,
  Input,
  LinearProgress,
  List,
  ListItem,
  Modal,
  ModalDialog,
  Checkbox,
  Stack,
  Typography,
} from "@mui/joy";
import { Paper } from "@mui/material";
import { useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import MaterialTable from "@material-table/core";
import { enqueueSnackbar } from "notistack";
import { Add, Close } from "@mui/icons-material";

import { useFirebase } from "context/firebaseContext";
import { StudReportPDF } from "components/StudentDetailsReport/StudentReportGeneratorPDF";
import ExportToExcel from "components/Reports/ExportToExcel";
import { FacultyType } from "types/facuities";

interface Column {
  field: string;
  title: string;
  selected: boolean;
  isCustom?: boolean;
}

interface CustomField {
  field: string;
  title: string;
}

const defaultColumns: Column[] = [
  { field: "facultyId", title: "Faculty ID", selected: true },
  { field: "facultyImage", title: "Profile", selected: true },
  { field: "facultyName", title: "Name", selected: true },
  { field: "facultyEmail", title: "Email", selected: true },
  { field: "facultyPhone", title: "Phone", selected: true },
  { field: "facultyAddress", title: "Address", selected: false },
  { field: "facultyGender", title: "Gender", selected: false },
  { field: "facultyDob", title: "Date of Birth", selected: false },
  { field: "facultyDoj", title: "Date of Joining", selected: false },
  { field: "facultyQualification", title: "Qualification", selected: false },
  { field: "facultySpecification", title: "Specialization", selected: true },
  { field: "facultyAadhar", title: "Aadhar Number", selected: false },
  { field: "isFromManagement", title: "From Management", selected: false },
  { field: "isSendingSms", title: "SMS Enabled", selected: false },
  { field: "rfidCode", title: "RFID Code", selected: false },
  { field: "isActive", title: "Active", selected: false },
];

const FacultyList = () => {
  const [loading, setLoading] = useState(false);
  const [faculties, setFaculties] = useState<FacultyType[]>([]);
  const [columnSelectionOpen, setColumnSelectionOpen] = useState(false);
  const [selectedColumns, setSelectedColumns] =
    useState<Column[]>(defaultColumns);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [newFieldName, setNewFieldName] = useState("");
  const { db } = useFirebase();

  const normalizeFaculty = (id: string, raw: any): FacultyType => {
    return {
      id,
      facultyId: raw.facultyId ?? raw.faculty_id ?? id,
      facultyName: raw.facultyName ?? raw.faculty_name ?? raw.student_name ?? "",
      facultyEmail: raw.facultyEmail ?? raw.faculty_email ?? raw.email ?? "",
      facultyPhone: String(
        raw.facultyPhone ?? raw.faculty_phone ?? raw.contact_number ?? ""
      ),
      facultyAddress: raw.facultyAddress ?? raw.faculty_address ?? raw.address ?? "",
      facultyGender: raw.facultyGender ?? raw.faculty_gender ?? raw.gender ?? "",
      facultyImage:
        raw.facultyImage ?? raw.faculty_image ?? raw.profil_url ?? raw.profile_url ?? "",
      facultyImageThumb:
        raw.facultyImageThumb ?? raw.faculty_image_thumb ?? raw.profil_url_thumb ?? "",
      facultyAadhar:
        raw.facultyAadhar ?? raw.faculty_aadhar ?? raw.aadhar_number ?? "",
      facultyPass: raw.facultyPass ?? raw.faculty_pass ?? "",
      facultyQualification:
        raw.facultyQualification ?? raw.faculty_qualification ?? "",
      facultySpecification:
        raw.facultySpecification ?? raw.faculty_specification ?? "",
      facultyDob: raw.facultyDob ?? raw.faculty_dob ?? raw.dob ?? "",
      facultyDoj: raw.facultyDoj ?? raw.faculty_doj ?? raw.date_of_addmission ?? "",
      isFromManagement: Boolean(
        raw.isFromManagement ?? raw.is_from_management ?? false
      ),
      isSendingSms:
        raw.isSendingSms ?? raw.is_sending_sms ?? raw.isSendSms ?? false,
      rfidCode: raw.rfidCode ?? raw.rfid_code ?? "",
      isActive: Boolean(raw.isActive ?? raw.is_active ?? true),
    };
  };

  const fetchFaculty = async () => {
    try {
      setLoading(true);

      const facultiesQuery = query(
        collection(db, "STUDENTS"),
        where("isFaculty", "==", true)
      );

      const studentSnapshot = await getDocs(facultiesQuery);
      const facultyList: FacultyType[] = [];

      studentSnapshot.forEach((doc) => {
        facultyList.push(normalizeFaculty(doc.id, doc.data()));
      });

      setFaculties(facultyList);
    } catch (error) {
      console.error("Error fetching faculty:", error);
      enqueueSnackbar("Error fetching faculty: " + error, {
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getAllSelectedColumns = () => {
    return selectedColumns.filter((col) => col.selected);
  };

  const getSelectedColumnsConfig = () => {
    const allSelected = getAllSelectedColumns();

    return allSelected.map((col) => {
      switch (col.field) {
        case "facultyImage":
          return {
            ...col,
            render: (rowData: FacultyType) => (
              <Avatar
                src={rowData.facultyImage}
                alt={`${rowData.facultyName}-profile`}
                sx={{ width: 32, height: 32 }}
              />
            ),
          };
        case "facultyPhone":
          return {
            ...col,
            render: (rowData: FacultyType) =>
              rowData.facultyPhone ? `+91-${rowData.facultyPhone}` : "-",
          };
        case "isFromManagement":
        case "isSendingSms":
        case "isActive":
          return {
            ...col,
            render: (rowData: FacultyType) =>
              (rowData as any)[col.field] ? "Yes" : "No",
          };
        default:
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

  const formatFacultyData = (faculty: FacultyType, col: Column): string => {
    if (!faculty) return "-";

    switch (col.field) {
      case "facultyPhone":
        return faculty.facultyPhone ? `+91-${faculty.facultyPhone}` : "-";
      case "isFromManagement":
      case "isSendingSms":
      case "isActive":
        return (faculty as any)[col.field] ? "Yes" : "No";
      default:
        return col.isCustom ? "-" : (faculty as any)[col.field] ?? "-";
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setLoading(true);
      const selectedCols = getAllSelectedColumns().filter(
        (col) => col.field !== "facultyImage"
      );

      if (selectedCols.length === 0) {
        enqueueSnackbar("Please select at least one column to generate PDF", {
          variant: "warning",
        });
        setLoading(false);
        return;
      }

      const pdfColumns = selectedCols.map((col) => ({
        field: col.field,
        title: col.title,
      }));

      const pdfData = faculties.map((faculty) => {
        const formattedFaculty: Partial<FacultyType> = {};
        selectedCols.forEach((col) => {
          (formattedFaculty as any)[col.field] = formatFacultyData(faculty, col);
        });
        return formattedFaculty as FacultyType;
      });

      const pdfResult = await StudReportPDF(pdfData as any, pdfColumns as any);
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

      const excelData = faculties.map((faculty) => {
        const formattedRow: any = {};
        selectedCols.forEach((col) => {
          formattedRow[col.field] = formatFacultyData(faculty, col);
        });
        return formattedRow;
      });

      const excelColumns = selectedCols.map((col) => ({
        field: col.field,
        title: col.title,
      }));

      const currentDate = new Date().toLocaleDateString().replace(/\//g, "-");
      const filename = `faculty_list_${currentDate}.xlsx`;

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

    const newColumn = {
      field: fieldId,
      title: newFieldName,
      selected: true,
      isCustom: true,
    };

    setSelectedColumns((prev) => [...prev, newColumn]);
    setCustomFields((prev) => [...prev, { field: fieldId, title: newFieldName }]);

    setNewFieldName("");
    enqueueSnackbar("Custom column added", { variant: "success" });
  };

  const handleRemoveCustomField = (field: string) => {
    setCustomFields((prev) => prev.filter((f) => f.field !== field));
    setSelectedColumns((prev) => prev.filter((col) => col.field !== field));
    enqueueSnackbar("Custom column removed", { variant: "success" });
  };

  return (
    <>
      <BreadCrumbsV2 Icon={IconReport} Path="Reports/Faculty List" />
      <br />
      <Paper sx={{ p: "10px", mt: "8px" }}>
        <Box>
          <Typography level="title-md">Faculty List</Typography>
        </Box>
        <Stack direction="column" spacing={2}>
          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "flex-end", alignItems: "center" }}
          >
            <Box>
              <Button onClick={fetchFaculty} sx={{ mt: 3 }}>
                Fetch Faculty
              </Button>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={2}
            sx={{ justifyContent: "flex-end", alignItems: "center" }}
          >
            <Button variant="outlined" onClick={() => setColumnSelectionOpen(true)}>
              Select Columns
            </Button>
            <Button disabled={faculties.length === 0} onClick={handleGeneratePDF}>
              Generate PDF
            </Button>
            <Button disabled={faculties.length === 0} onClick={handleExportExcel}>
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
              <Typography level="body-sm" sx={{ mb: 1, color: "neutral.500" }}>
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
                      const allSelected = selectedColumns.every((col) => col.selected);
                      setSelectedColumns((cols) =>
                        cols.map((col) => ({ ...col, selected: !allSelected }))
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

              <Typography level="body-sm" sx={{ mt: 2, mb: 1, color: "neutral.500" }}>
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
                        selectedColumns.find((col) => col.field === field.field)
                          ?.selected ?? true
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

      {faculties.length > 0 && (
        <Stack direction="row" spacing={1} mt={2} mb={1}>
          <Chip color="primary" variant="soft">
            Total Faculty: {faculties.length}
          </Chip>
        </Stack>
      )}

      {faculties.length > 0 && (
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
            data={faculties}
            title="Faculty Data"
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

export default FacultyList;
