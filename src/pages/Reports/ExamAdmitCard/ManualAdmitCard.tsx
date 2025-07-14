import { zodResolver } from "@hookform/resolvers/zod";
import { Button, CircularProgress } from "@mui/joy";
import { FormControl, FormHelperText, Grid, InputLabel, MenuItem, Paper, Select, TextField } from "@mui/material";
import { examData } from "components/Exams/ExamPlannerTable";
import { SCHOOL_CLASSES } from "config/schoolConfig";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { GenerateAdmitCard } from "utilities/GenerateAdmitCard";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";
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

    const handleGenerateAdmitCard = async (data: any) => {
        console.log(data)
        if (!data.class || !data.student_name || !data.father_name) {
            enqueueSnackbar("Please check all fields!", { variant: "warning" })
            return
        }

        setLoading(true);
        const admitCardData = {
            examTitle: "Term-1 Examination",
            session: "2025-26",
            startTime: "08:00AM - 10:30AM",
            endTime: "11:00AM - 01:00PM",
            studentName: data.student_name,
            fatherName: data.father_name,
            rollNumber: "N/A",
            motherName: data.mother_name||"N/A",
            studentId: "N/A",
            studentDOB: "N/A",
            studentMob: "N/A",
            className: true ? getClassNameByValue(data.class) || "N/A" : "N/A",
            profile_url: "",
            timeTabel: examData
        }

        // Generate PDF
        const pdfUrl = await GenerateAdmitCard([admitCardData]);
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
    return (
        <>
            <form onSubmit={handleSubmit(handleGenerateAdmitCard)}>
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
                            Generate Admit Card
                        </Button>
                    </Grid>
                </Grid>
                <br></br>
            </form>
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