import { Delete, Edit, } from "@mui/icons-material"
import { Box, Button, Checkbox, Chip, Input, Option, Select } from "@mui/joy";
import { Divider, IconButton, Paper, Stack, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material"
import LSBox from "components/Card/LSBox";
import { doc, getDoc, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { tableCellClasses } from '@mui/material/TableCell';
import { useFirebase } from "context/firebaseContext";
import { ClassType } from "./AddClasses";

export interface PaperType {
    paperId: string;
    paperTitle: string;
    scoreType?: 'grade' | 'marks';
    classes: string[];
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

function AddSubjects() {
    const [searchInput, setSearchInput] = useState<string>("");
    const [papers, setPapers] = useState<PaperType[]>([]);
    const [classes, setClasses] = useState<ClassType[]>([])
    const [newPaper, setNewPaper] = useState<PaperType>({
        paperId:"",
        paperTitle: "",
        classes: [],
        status: "active"
    });
    const [isGrading, setIsGrading] = useState<boolean>(false);

    //Get Firebase DB instance
    const { db } = useFirebase();

    const handleSaveNewClass = async () => {
        if (newPaper?.paperTitle.trim() === "") {
            enqueueSnackbar("Please enter subject name", { variant: "error" });
            return;
        }

        if (papers.some((item) => newPaper?.paperTitle.trim() === item.paperTitle)) {
            enqueueSnackbar("This paper is already added!", { variant: "error" });
            return;
        }

        const masterDataRef = doc(db, "MASTER_DATA", "masterData");

        const newSectionData: PaperType = {
            paperId: `PAPER_${Math.floor(1000 + Math.random() * 9000).toString()}`,
            paperTitle: newPaper?.paperTitle!,
            scoreType: isGrading ? "grade" : "marks",
            classes: newPaper?.classes || [],
            status: "active"
        };

        const docSnap = await getDoc(masterDataRef);
        if (!docSnap.exists()) {
            await setDoc(masterDataRef, { papers: [newSectionData] });
        } else {
            await updateDoc(masterDataRef, {
                papers: arrayUnion(newSectionData),
            });
        }

        setNewPaper({
            paperId:"",
            paperTitle: "",
            classes: [],
            status: "active"
        });
        setPapers([...papers, newSectionData]);
        enqueueSnackbar("Class added successfully", { variant: "success" });
    };

    useEffect(() => {
        const fetchPapers = async () => {
            const docSnap = await getDoc(doc(db, "MASTER_DATA", "masterData"));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPapers(data?.papers ?? []);
                setClasses(data?.classes ?? []);
            }
        };
        fetchPapers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <LSBox>
                <Stack width={"400px"} spacing={1}>
                    <Typography variant="body1">Add New Subject</Typography>
                    <Divider />
                    <Input placeholder="Enter paper title.." value={newPaper?.paperTitle} onChange={(e) =>
                        setNewPaper((prev) => ({
                            ...prev,
                            paperTitle: e.target.value,
                        }))
                    } />
                    <Select
                        multiple
                        placeholder="Select classes"
                        value={newPaper?.classes ?? []}
                        onChange={(_, value) =>
                            setNewPaper((prev) => ({
                                ...(prev ?? { paperId: "", paperTitle: "", scoreType: "marks", classes: [], status: "active" }),
                                classes: value as string[],
                            }))
                        }
                    >
                        {
                            classes.map((classs) => {
                                return <Option value={classs.name}>{classs.name}</Option>
                            })
                        }
                    </Select>
                    <br />
                    {
                        newPaper.classes?.length! > 0 ?
                            <Chip sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", p: 1 }}>

                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, ml: 1 }}>
                                    {newPaper.classes?.map((item) => (
                                        <Chip key={item} color="primary">
                                            {item}
                                        </Chip>
                                    ))}
                                </Box>
                            </Chip>
                            : null}

                    <Checkbox label="Does this paper is of grade type?" checked={isGrading} onChange={(e) => setIsGrading(e.target.checked)} />
                    <Button sx={{ width: "fit-content" }} color="primary" onClick={handleSaveNewClass}>Add </Button>
                </Stack>
            </LSBox>
            <br />
            <Paper>
                <Stack direction="row" justifyContent="space-between" alignItems="center" p={2}>
                    <Typography variant="body1">Paper List</Typography>
                    <Input placeholder="search section.." value={searchInput} onChange={(e) => setSearchInput(e.target.value)}></Input>
                </Stack>
                <Divider />

                <TableContainer component={Paper} sx={{ mt: 1 }} >
                    <Table sx={{ minWidth: 650 }} aria-label="simple table" size="small">
                        <TableHead>
                            <StyledTableRow>
                                <StyledTableCell align="left">S/N</StyledTableCell>
                                <StyledTableCell align="center" >Paper Id</StyledTableCell>
                                <StyledTableCell align="center" >Paper Title</StyledTableCell>
                                <StyledTableCell align="center" >Paper Type</StyledTableCell>
                                <StyledTableCell align="center" >Classes</StyledTableCell>
                                <StyledTableCell align="center" >Status</StyledTableCell>
                                <StyledTableCell align="right">Action</StyledTableCell>
                            </StyledTableRow>
                        </TableHead>
                        <TableBody >
                            {papers.map((row, index) => (
                                <StyledTableRow
                                    key={index}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <StyledTableCell component="th" scope="row">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Typography>{index + 1}</Typography>
                                        </Stack>
                                    </StyledTableCell>
                                    <StyledTableCell align="center" >{row.paperId}</StyledTableCell>
                                    <StyledTableCell align="center" >{row.paperTitle}</StyledTableCell>
                                    <StyledTableCell align="center" >{row.scoreType}</StyledTableCell>
                                    <StyledTableCell align="center" >{row.classes?.map((item) => {
                                        return <Chip>{item}</Chip>
                                    })}</StyledTableCell>

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

export default AddSubjects