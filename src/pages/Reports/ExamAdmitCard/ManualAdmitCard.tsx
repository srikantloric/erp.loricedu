import { zodResolver } from "@hookform/resolvers/zod";
import { Delete } from "@mui/icons-material";
import { Button, CircularProgress, Divider, IconButton, Table } from "@mui/joy";
import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Paper, Select, TextField } from "@mui/material";
import { examData } from "components/Exams/ExamScheduleTable";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { admitCardType } from "types/admitCard";
import { GenerateAdmitCard } from "utilities/GenerateAdmitCard";
import { generateAlphanumericUUID, getClassNameByValue } from "utilities/UtilitiesFunctions";
import { z } from "zod"

const schema = z.object({
    student_name: z.string().min(3),
    class: z.number().min(1),
    father_name: z.string().min(3),
    mother_name: z.string(),
});

type EnquiryFormFields = z.infer<typeof schema>;


function ManualAdmitCard() {
    const [pdfUrl, setPdfUrl] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [students, setStudents] = useState<any[]>([])


    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<EnquiryFormFields>({
        resolver: zodResolver(schema),
        defaultValues: {
            class: 1,
        },
    });


    const handleOnSubmit = async (data: any) => {
        console.log(data)
        if (!data.class || !data.student_name || !data.father_name) {
            enqueueSnackbar("Please check all fields!", { variant: "warning" })
            return
        }

        setStudents((prev) => [...prev, { ...data, id: generateAlphanumericUUID(5) }])
    }



    const handleGenerateAdmitCard = async () => {

        if (students.length == 0) {
            enqueueSnackbar("No student selected to generate admit card.", { variant: "error" })
            return
        }

        setLoading(true);

        // Map student data
        const studentData: admitCardType[] = students.map((student) => {
            return {
                examTitle: "Term-1 Examination",
                session: "2025-26",
                startTime: "08:00AM - 10:30AM",
                endTime: "11:00AM - 01:00PM",
                studentName: student.student_name || "N/A",
                fatherName: student.father_name || "N/A",
                rollNumber: student.class_roll || "N/A",
                motherName: student.mother_name || "N/A",
                studentId: student.admission_no || "N/A",
                studentDOB: student.dob || "N/A",
                studentMob: student.contact_number,
                className: student.class ? getClassNameByValue(student.class) || "N/A" : "N/A",
                profile_url: student.profil_url || "",
                timeTabel: examData,

            };
        });

        // Generate PDF
        const pdfUrl = await GenerateAdmitCard(studentData);
        setPdfUrl(pdfUrl);


        setLoading(false);
    };

    const handleFormReset = () => {
        reset({
            student_name: "",
            father_name: "",
            class: -1,
        });
    };

    const handleDeleteStudent = (student: any) => {
        console.log(student)
        const newStudent = students.filter((item) => item.id !== student.id)
        setStudents(newStudent)
    }
    return (
        <>
            <form onSubmit={handleSubmit(handleOnSubmit)}>
                {/* <span className={Styles.inputSeperator}>Personal Details</span> */}
                <Grid container spacing={2} marginTop={2}>
                    <Grid item xs={12} md={4}>
                        <TextField
                            sx={{ width: "100%" }}
                            label="Name"
                            variant="outlined"
                            fullWidth
                            type="text"
                            error={errors.student_name ? true : false}
                            helperText={
                                errors.student_name && errors.student_name.message
                            }
                            {...register("student_name")}
                        />
                    </Grid>
                    <Grid item xs={12} md={2}>
                        <FormControl fullWidth>
                            <InputLabel id="demo-simple-select-error" required>
                                Class
                            </InputLabel>
                            <Select
                                labelId="demo-simple-select-error-label"
                                id="demo-simple-select-error"
                                label="Class"
                                defaultValue={null}
                                {...register("class")}
                            >
                                {SCHOOL_CLASSES.map((item, index) => {
                                    return (
                                        <MenuItem value={item.value}>{item.title}</MenuItem>
                                    );
                                })}
                            </Select>
                            <FormHelperText sx={{ color: "red" }}>
                                {errors.class && errors.class.message}
                            </FormHelperText>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={3}>
                        <TextField
                            sx={{ width: "100%" }}
                            label="Fathers Name"
                            variant="outlined"
                            type="text"
                            {...register("father_name")}
                            error={errors.father_name ? true : false}
                            helperText={
                                errors.father_name && errors.father_name.message
                            }
                        />
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <TextField
                            sx={{ width: "100%" }}
                            label="Mother Name"
                            variant="outlined"
                            type="text"
                            {...register("mother_name")}
                            error={errors.mother_name ? true : false}
                            helperText={
                                errors.mother_name && errors.mother_name.message
                            }
                        />
                    </Grid>
                </Grid>
                <Grid sx={{ display: "flex", justifyContent: "end", mt: 2 }} item>
                    <Button variant="soft" onClick={handleFormReset}>
                        Reset
                    </Button>
                    <Grid
                        item
                        xs={12}
                        sx={{
                            display: "flex",
                            justifyContent: "start",
                            marginLeft: "1rem",
                        }}
                    >
                        {loading ? <CircularProgress /> : null}
                        <Button variant="solid" color="primary" type="submit">
                            Add Student To List
                        </Button>
                        <Button disabled={students.length == 0} sx={{ ml: 2 }} color="success" onClick={handleGenerateAdmitCard}>Click To Generate Admit Card For Below Students</Button>
                    </Grid>
                </Grid>
                <br></br>
            </form>
            <Divider />
            <Table variant="outlined" borderAxis="both">
                <thead>
                    <tr>
                        <th>Sl.</th>
                        <th>Student Name</th>
                        <th>Class</th>
                        <th>Father's Name</th>
                        <th>Mother's Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {students.map((student, index) => {
                        return (
                            <tr>
                                <td>{index + 1}</td>
                                <td>{student.student_name}</td>
                                <td>{getClassNameByValue(student.class)}</td>
                                <td>{student.father_name}</td>
                                <td>{student.mother_name}</td>
                                <td><IconButton onClick={() => handleDeleteStudent(student)}><Delete /></IconButton></td>
                            </tr>
                        )
                    })}

                </tbody>
            </Table>
            <br />

            {pdfUrl && (
                <>
                    <Paper sx={{ height: "100vh" }}>
                        <iframe
                            src={pdfUrl}
                            title="PDF Viewer"
                            width="100%"
                            height="100%"
                            frameBorder={0}
                        />
                    </Paper>
                </>
            )}
        </>
    )
}

export default ManualAdmitCard