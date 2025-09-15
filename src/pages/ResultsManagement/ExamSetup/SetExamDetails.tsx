import {  useEffect } from "react";
import {
  Button, Box
} from "@mui/material";
import {
  Stack, FormControl, FormLabel, Input, FormHelperText,
  Divider, Typography, Chip, ChipDelete
} from "@mui/joy";
import { useFirebase } from "context/firebaseContext";
import { collection, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { PaperType } from "pages/MasterData/AddSubjects";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import { z } from "zod";
import { enqueueSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const paperSchema = z
  .object({
    paperId: z.string(),
    paperTitle: z.string(),
    scoreType: z.enum(["grade", "marks"]),
    maxTheory: z
      .number()
      .min(0, "Max theory marks required")
      .max(100, "Max theory marks cannot exceed 100"),
    maxPractical: z
      .number()
      .min(0, "Max practical marks required")
      .max(100, "Max practical marks cannot exceed 100"),
    grade: z.array(z.string().min(1, "Grade cannot be empty"))
  })
  .refine(
    (data) => {
      if (data.scoreType === "grade") {
        return data.grade.length > 0;
      }
      return true;
    },
    { message: "At least one grade is required", path: ["grade"] }
  )
  .refine(
    (data) => {
      if (data.scoreType === "marks") {
        return data.maxTheory > 0 && data.maxPractical >= 0;
      }
      return true;
    },
    { message: "Theory marks must be > 0 when using marks", path: ["maxTheory"] }
  );

export const examSchema = z.object({
  examTitle: z.string().min(1, "Exam title is required"),
  examDescription: z.string().min(1, "Exam description is required"),
  examTimings: z.string().min(1, "Exam timings are required"),
  papers: z.array(paperSchema)
});

export type ExamFormValues = z.infer<typeof examSchema>;


function SetExamDetails({ setActiveStep }: any) {
  const { db } = useFirebase();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isValid }
  } = useForm<ExamFormValues>({
    resolver: zodResolver(examSchema),
    mode: "onChange", // validate on change so Save button enables only when valid
    defaultValues: {
      examTitle: "",
      examDescription: "",
      examTimings: "",
      papers: []
    }
  });

  const { fields, update } = useFieldArray({
    control,
    name: "papers"
  });

  

  useEffect(() => {
    const fetchPapers = async () => {
      const docRef = doc(collection(db, "MASTER_DATA"), "masterData");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const papers: PaperType[] = docSnap.data().papers as PaperType[];
        setValue(
          "papers",
          papers.map((item) => ({
            paperId: item.paperId,
            paperTitle: item.paperTitle,
            scoreType: item.scoreType as "grade" | "marks",
            maxTheory: 0,
            maxPractical: 0,
            grade: []
          }))
        );
      } else {
        console.log("Papers not found!");
      }
    };
    fetchPapers();
  }, [db, setValue]);

  const onSubmit = async (data: ExamFormValues) => {

    setActiveStep((prev: any) => prev + 1);

    // Generate custom scheduleId
    const examId = `EXAM_${Math.floor(1000 + Math.random() * 9000).toString()}`;

    // Point doc to EXAMS_SCHEDULES/{scheduleId}
    const newDocRef = doc(collection(db, "EXAMS"), examId);

    const examData = {
      ...data,
      examId: `EXAM_${Math.floor(1000 + Math.random() * 9000).toString()}`,
      marksheetDesign: "theory-practical-design",
      createdAt: serverTimestamp(),
      examSession: "2025-26"
    };


    // Save the data with custom ID
    await setDoc(newDocRef, examData);
    navigate({
      pathname: "/schoolResults/add-exam",
      search: `?examId=${examData.examId}`
    });

    enqueueSnackbar("Exam Details Saved Successfully!", { variant: "success" })
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box sx={{ p: "14px", mt: "8px", border: "1px solid #ccc", borderRadius: "10px" }}>
        <Stack
          sx={{ p: "14px", mt: "4px", border: "1px solid #ccc", borderRadius: "10px" }}
          spacing={2}
        >
          {/* Exam details */}
          <Stack direction={"row"} spacing={2}>
            <FormControl error={!!errors.examTitle}>
              <FormLabel>Exam Title</FormLabel>
              <Input placeholder="Exam Title" {...register("examTitle")} />
              <FormHelperText>{errors.examTitle?.message}</FormHelperText>
            </FormControl>

            <FormControl error={!!errors.examDescription}>
              <FormLabel>Exam Description</FormLabel>
              <Input placeholder="Description" {...register("examDescription")} />
              <FormHelperText>{errors.examDescription?.message}</FormHelperText>
            </FormControl>

            <FormControl error={!!errors.examTimings} sx={{ minWidth: "350px" }}>
              <FormLabel>Exam Timing</FormLabel>
              <Input
                placeholder="09:00AM - 12:00PM, 01:00PM - 03:00PM"
                {...register("examTimings")}
              />
              <FormHelperText>{errors.examTimings?.message}</FormHelperText>
            </FormControl>
          </Stack>

          <Divider />

          {/* Papers */}
          <Stack>
            {fields.map((item, paperIndex) => (
              <Box key={item.id} mt={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography fontWeight={600} color="primary">
                    {item.paperTitle}
                  </Typography>

                  {item.scoreType === "grade" ? (
                    <Box sx={{ display: "flex", alignItems: "end", gap: 2 }}>
                      <FormControl error={!!errors.papers?.[paperIndex]?.grade}>
                        <FormLabel>Grades</FormLabel>
                        <Input
                          placeholder="Enter grade and press Enter"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const newGrade = (e.target as HTMLInputElement).value.trim();
                              if (!newGrade) return;
                              const updatedGrades = [...item.grade, newGrade];
                              update(paperIndex, { ...item, grade: updatedGrades });
                              (e.target as HTMLInputElement).value = "";
                            }
                          }}
                        />
                        <FormHelperText>
                          {errors.papers?.[paperIndex]?.grade?.message as string}
                        </FormHelperText>
                      </FormControl>

                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                        {item.grade.map((g, gIdx) => (
                          <Chip
                            key={gIdx}
                            variant="soft"
                            color="primary"
                            endDecorator={
                              <ChipDelete
                                onDelete={() => {
                                  const updatedGrades = item.grade.filter((_, idx) => idx !== gIdx);
                                  update(paperIndex, { ...item, grade: updatedGrades });
                                }}
                              />
                            }
                          >
                            {g}
                          </Chip>
                        ))}
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <FormControl error={!!errors.papers?.[paperIndex]?.maxTheory}>
                        <FormLabel>Max Theory Marks</FormLabel>
                        <Input
                          type="number"
                          {...register(`papers.${paperIndex}.maxTheory`, { valueAsNumber: true })}
                          placeholder="theory max"
                        />
                        <FormHelperText>
                          {errors.papers?.[paperIndex]?.maxTheory?.message}
                        </FormHelperText>
                      </FormControl>

                      <FormControl error={!!errors.papers?.[paperIndex]?.maxPractical}>
                        <FormLabel>Max Practical Marks</FormLabel>
                        <Input
                          type="number"
                          {...register(`papers.${paperIndex}.maxPractical`, { valueAsNumber: true })}
                          placeholder="practical max"
                        />
                        <FormHelperText>
                          {errors.papers?.[paperIndex]?.maxPractical?.message}
                        </FormHelperText>
                      </FormControl>
                    </>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        </Stack>

        <br />
        <Stack direction={"row"} justifyContent={"end"}>
          <Button type="submit" disabled={!isValid}>
            Save & Next
          </Button>
        </Stack>
      </Box>
    </form>
  );
}

export default SetExamDetails;