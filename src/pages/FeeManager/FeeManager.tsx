import React, { useEffect, useRef, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import LSPage from "../../components/Utils/LSPage";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import {
  Button,
  Tabs,
  Tab,
  Box,
  createFilterOptions,
} from "@mui/material";
import PageContainer from "../../components/Utils/PageContainer";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import {
  Autocomplete,
  AutocompleteOption,
  LinearProgress,
  ListItemContent,
  ListItemDecorator,
  Typography,
} from "@mui/joy";
import { useDispatch, useSelector } from "react-redux";
import { enqueueSnackbar } from "notistack";
import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2";
import { fetchstudent } from "store/reducers/studentSlice";
import { RootState, AppDispatch } from "store";

// -----------------------------
// Interfaces / Types
// -----------------------------
interface CustomTabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface StudentOption {
  id: string;
  name: string;
  admission: string;
  fatherName: string;
  profile: string;
  sId: string;
  dob: string;
}

// -----------------------------
// CustomTabPanel Component
// -----------------------------
function CustomTabPanel({ children, value, index, ...other }: CustomTabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

// -----------------------------
// FeeManager Component
// -----------------------------
const FeeManager: React.FC = () => {
  const [value, setValue] = useState(0);
  const historyRef = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const data = useSelector((state: RootState) => state.students.studentarray);

  const [searchList, setSearchList] = useState<StudentOption[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const searchBoxRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const setFilteredData = (data: any[]) => {
    const filtered = data.map((item) => ({
      id: item.id,
      name: item.student_name,
      admission: item.admission_no,
      fatherName: item.father_name,
      profile: item.profil_url,
      sId: item.student_id,
      dob: item.dob,
    }));
    setSearchList(filtered);
  };

  useEffect(() => {
    if (data.length !== 0) {
      setFilteredData(data);
    }
  }, [data]);

  useEffect(() => {
    if (!data || data.length === 0) {
      setLoading(true);
      dispatch(fetchstudent()).then(() => setLoading(false));
    }
  }, [data, dispatch]);

  const filterOptions = createFilterOptions<StudentOption>({
    stringify: (option) =>
      option.name + option.sId + option.admission + option.fatherName,
  });

  const handleNextPageBtn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoc) {
      const selectedData = data.filter((student) => student.id === selectedDoc);
      historyRef(`FeeDetails/${selectedDoc}`, { state: selectedData });
    } else {
      enqueueSnackbar("Error : Please enter student id or admission number !", {
        variant: "error",
      });
    }
  };

  useEffect(() => {
    searchBoxRef.current?.focus();
  }, []);

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <BreadCrumbsV2
          Icon={AccountBalanceWalletIcon}
          Path="Fee Management/Search Student"
        />
        <Box sx={{ width: "100%", mt: "16px" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={value} onChange={handleChange} aria-label="tabs">
              <Tab label="Search Student" {...a11yProps(0)} sx={{ textTransform: "capitalize" }} />
              <Tab label="Cross-Campus Payment or Payment By CNIC" {...a11yProps(1)} sx={{ textTransform: "capitalize" }} />
            </Tabs>
          </Box>

          {loading && <LinearProgress />}

          <CustomTabPanel value={value} index={0}>
            <Box
              component="form"
              onSubmit={handleNextPageBtn}
              sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "30vh" }}
            >
              <Autocomplete
                id="student-search"
                color="primary"
                placeholder="Search with Student ID/Admission No"
                options={searchList}
                autoHighlight
                filterOptions={filterOptions}
                sx={{ width: 450, m: 1 }}
                getOptionLabel={(option) => `${option.name} - ${option.id}`}
                onChange={(_e, val) => setSelectedDoc(val?.id ?? null)}
                renderOption={(props, option) => (
                  <AutocompleteOption {...props}>
                    <ListItemDecorator>
                      <img loading="lazy" width="20" src={option.profile} alt="" />
                    </ListItemDecorator>
                    <ListItemContent sx={{ fontSize: "sm" }}>
                      <b>{option.name}</b>
                      <Typography level="body-xs" fontSize={"14px"}>
                        {option.admission} | {option.fatherName} | {option.dob}
                      </Typography>
                    </ListItemContent>
                  </AutocompleteOption>
                )}
              />
              <Button type="submit" variant="contained" sx={{ height: 36 }} disableElevation>
                Search
              </Button>
            </Box>
          </CustomTabPanel>

          <CustomTabPanel value={value} index={1}>
            In-Progress
          </CustomTabPanel>
        </Box>
      </LSPage>
      <Footer />
    </PageContainer>
  );
};

export default FeeManager;
