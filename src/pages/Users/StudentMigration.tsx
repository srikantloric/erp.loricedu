import { Search } from "@mui/icons-material";
import { Box, Button, Card, Divider, FormControl, FormHelperText, FormLabel, Input, Option, Select, Stack, Typography } from "@mui/joy";
import { Paper } from "@mui/material";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import ArrowMigration from "../../assets/arrow-migration.png"
import WarningIcon from '@mui/icons-material/Warning';
function StudentMigration() {
    const [studentIdInput, setStudentIdInput] = useState<string>("")
    const [selectedClass, setSelectedClass] = useState<any>(null)
    const [afterMigrationClass, setAfterMigrationClass] = useState<any>(null)



    const handleStudentSearch = () => {
        //fetch students based on selected class
        if (!selectedClass) {
            enqueueSnackbar("Please select the class for which you want the migration!", { variant: "info" });
            return
        }
    }

    const handleInputResetBtn = () => {
        //reset inputs
    }

    useEffect(() => {
        //change after migration
        if (selectedClass) {
            console.log(selectedClass)
            if (selectedClass === 14) {
                setAfterMigrationClass(1)
            } else {
                setAfterMigrationClass(selectedClass + 1)
            }
        }
    }, [selectedClass])



    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <PageHeaderWithHelpButton title="Migrate Student Class" />
                <Paper sx={{ p: "10px", mt: "8px" }}>
                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography level="title-md">Search Student</Typography>
                        </Box>
                        <Stack direction="row" alignItems="center" gap={1.5}>
                            <Input
                                placeholder="Search by student id.."
                                value={studentIdInput!}
                                onChange={(e) => setStudentIdInput(e.target.value)}
                            ></Input>
                            <Typography>Or</Typography>
                            <Select
                                placeholder="choose class"
                                onChange={(e, val) => setSelectedClass(val)}
                            >
                                {SCHOOL_CLASSES.map((item) => {
                                    return <Option value={item.value} key={item.id}>{item.title}</Option>;
                                })}
                            </Select>

                            <Button
                                sx={{ ml: "8px" }}
                                startDecorator={<Search />}
                                onClick={handleStudentSearch}
                            ></Button>
                            <Button
                                variant="soft"
                                sx={{ ml: "8px" }}
                                onClick={handleInputResetBtn}
                            >
                                Reset
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
                <br />
                <Box>
                    <Card
                        size="sm"
                        variant="outlined"
                        color="warning"
                        sx={{ height: "100%" }}
                    >
                        <Stack
                            direction={"row"}
                            justifyContent={"center"}
                            sx={{ height: "100%" }}
                            alignItems={"center"}
                        >
                            {/* <Typography level="title-lg" >Student Class Migration</Typography> */}
                            <Stack direction={"row"} spacing={4} justifyContent={"center"} alignItems={"center"}>

                                <FormControl>
                                    <FormLabel>Current Class</FormLabel>
                                    <Select
                                        value={selectedClass}
                                    >
                                        {SCHOOL_CLASSES.map((item) => {
                                            return <Option value={item.value} key={item.id}>{item.title}</Option>;
                                        })}
                                    </Select>
                                    <FormHelperText>This is a helper text.</FormHelperText>
                                </FormControl>
                                <img src={ArrowMigration} height={40} />
                                <FormControl>
                                    <FormLabel>After Promotion Class</FormLabel>
                                    <Select
                                        placeholder="choose migration class"
                                        value={afterMigrationClass}
                                        onChange={(e, val) => setAfterMigrationClass(val)}
                                    >
                                        {SCHOOL_CLASSES.map((item) => {
                                            return <Option value={item.value} key={item.id}>{item.title}</Option>;
                                        })}
                                    </Select>
                                    <FormHelperText>This is a helper text.</FormHelperText>
                                </FormControl>

                            </Stack>

                        </Stack>
                        <Divider />
                        <Typography color="warning" startDecorator={<WarningIcon />}>Note: Please execute this transaction with utmost care, as incorrect execution may lead to system misalignment. You also have the option to select or deselect students who should not be promoted.</Typography>
                    </Card>
                    <br />
                </Box>
            </LSPage>
        </PageContainer>
    )
}

export default StudentMigration