import { Delete, Edit } from "@mui/icons-material";
import { Button, Chip, Input } from "@mui/joy";
import {
  Divider,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import LSBox from "components/Card/LSBox";
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  arrayUnion,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { useFirebase } from "context/firebaseContext";

export interface ClassType {
  classId: string;
  name: string;
  status: string;
}

function AddClasses() {
  const [searchInput, setSearchInput] = useState<string>("");
  const [classes, setClasses] = useState<ClassType[]>([]);
  const [newClass, setNewClass] = useState<string>("");

   //Get Firebase DB instance
   const {db} = useFirebase();

  const handleSaveNewClass = async () => {
    if (newClass.trim() === "") {
      enqueueSnackbar("Please enter class name", { variant: "error" });
      return;
    }

    const masterDataRef = doc(db, "MASTER_DATA", "masterData");

    const newClassData: ClassType = {
      classId: Math.floor(1000 + Math.random() * 9000).toString(),
      name: newClass,
      status: "active",
    };

    try {
      const docSnap = await getDoc(masterDataRef);
      if (!docSnap.exists()) {
        await setDoc(masterDataRef, { classes: [newClassData] });
      } else {
        await updateDoc(masterDataRef, {
          classes: arrayUnion(newClassData),
        });
      }
      setNewClass("");
      setClasses([...classes, newClassData]);
      enqueueSnackbar("Class added successfully", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Error saving class", { variant: "error" });
    }
  };

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const masterDataRef = doc(db, "MASTER_DATA", "masterData");
        const docSnap = await getDoc(masterDataRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setClasses(data?.classes || []);
        }
      } catch (error) {
        enqueueSnackbar("Error fetching classes", { variant: "error" });
      }
    };

    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  return (
    <>
      <LSBox>
        <Stack width={"400px"} spacing={1}>
          <Typography variant="body1">Add New Class</Typography>
          <Divider />
          <Input
            placeholder="Enter class name.."
            value={newClass}
            onChange={(e) => setNewClass(e.target.value)}
          />
          <Button sx={{ width: "fit-content" }} color="primary" onClick={handleSaveNewClass}>
            Add
          </Button>
        </Stack>
      </LSBox>
      <br />
      <Paper>
        <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
          <Typography variant="body1">Class List</Typography>
          <Input
            placeholder="Search class.."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </Stack>
        <Divider />
        <TableContainer component={Paper} sx={{ mt: 1 }}>
          <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
            <TableHead>
              <TableRow>
                <TableCell align="left">S/N</TableCell>
                <TableCell align="center">Class Name</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classes.map((row, index) => (
                <TableRow key={index} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell component="th" scope="row">
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography>{index + 1}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">{row.name}</TableCell>
                  <TableCell align="center">
                    {row.status === "active" ? (
                      <Chip color="success">Active</Chip>
                    ) : (
                      <Chip color="danger">Inactive</Chip>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction={"row"} spacing={1} justifyContent={"end"}>
                      <Tooltip title="Edit">
                        <IconButton>
                          <Edit color="primary" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton>
                          <Delete color="error" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
}

export default AddClasses;
