import { Delete, Edit, } from "@mui/icons-material"
import { Button, Chip, Input } from "@mui/joy";
import { Divider, IconButton, Paper, Stack, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material"
import LSBox from "components/Card/LSBox";
import {  doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { tableCellClasses } from '@mui/material/TableCell';
import { useFirebase } from "context/firebaseContext";
export interface ReligionType {
    regionId: string;
    name: string;
    status: string;
}
const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.body}`]: {
        fontSize: 14,
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(even)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));
function AddReligions() {
    const [searchInput, setSearchInput] = useState<string>("");
    const [religions, setReligions] = useState<ReligionType[]>([]);
    const [newReligion, setNewReligion] = useState<string>("");

     //Get Firebase DB instance
     const {db} = useFirebase();

    const handleSaveNewClass = async () => {
        if (newReligion.trim() === "") {
            enqueueSnackbar("Please enter religion name", { variant: "error" });
            return;
        }

        const masterDataRef = doc(db, "MASTER_DATA", "masterData");

        const newReligionData: ReligionType = {
            regionId: Math.floor(1000 + Math.random() * 9000).toString(),
            name: newReligion,
            status: "active",
        };

        const docSnap = await getDoc(masterDataRef);
        if (!docSnap.exists()) {
            await setDoc(masterDataRef, { religions: [newReligionData] });
        } else {
            await updateDoc(masterDataRef, {
                religions: arrayUnion(newReligionData),
            });
        }

        setNewReligion("");
        setReligions([...religions, newReligionData]);
        enqueueSnackbar("Religion added successfully", { variant: "success" });
    };

    useEffect(() => {
        const fetchReligions = async () => {
            const masterDataRef = doc(db, "MASTER_DATA", "masterData");
            const docSnap = await getDoc(masterDataRef);
            if (docSnap.exists()) {
                setReligions(docSnap.data()?.religions ?? []);
            }
        };
        fetchReligions();
    }, []);

    return (
        <>
            <LSBox>
                <Stack width={"400px"} spacing={1}>
                    <Typography variant="body1">Add New Religion</Typography>
                    <Divider />
                    <Input placeholder="Enter religion name.." value={newReligion} onChange={(e) => setNewReligion(e.target.value)} />
                    <Button sx={{ width: "fit-content" }} color="primary" onClick={handleSaveNewClass}>Add </Button>
                </Stack>
            </LSBox>
            <br />
            <Paper>
                <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
                    <Typography variant="body1">Religion List</Typography>
                    <Input placeholder="search section.." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}></Input>
                </Stack>
                <Divider />
                <TableContainer component={Paper} sx={{ mt: 1 }} >
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell align="left">S/N</StyledTableCell>
                                <StyledTableCell align="center" >Religion Name</StyledTableCell>
                                <StyledTableCell align="center" >Status</StyledTableCell>
                                <StyledTableCell align="right">Action</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody >
                            {religions.map((row, index) => (
                                <StyledTableRow
                                    key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <StyledTableCell component="th" scope="row">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Typography>{index + 1}</Typography>
                                        </Stack>
                                    </StyledTableCell>
                                    <StyledTableCell align="center" >{row.name}</StyledTableCell>
                                    <StyledTableCell align="center" >{row.status === "active" ? <Chip color="success">Active</Chip> : <Chip color="danger">In-Active</Chip>}</StyledTableCell>
                                    <StyledTableCell align="right">
                                        <Stack direction={"row"} spacing={1} justifyContent={"end"}>
                                            <Tooltip title="Edit">
                                                <IconButton>
                                                    <Edit color="primary" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton >
                                                    <Delete color="error" />
                                                </IconButton>
                                            </Tooltip>
                                        </Stack>
                                    </StyledTableCell>
                                </StyledTableRow>
                            ))
                            }

                        </TableBody>
                    </Table>
                </TableContainer >
            </Paper>
        </>
    )
}

export default AddReligions