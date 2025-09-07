import { Check } from "@mui/icons-material"
import { Box, Button, Stack, Step, StepButton, StepIndicator, Stepper } from "@mui/joy"
import { useEffect, useState } from "react";
import SetExamDetails from "./SetExamDetails";
import Navbar from "components/Navbar/Navbar";
import LSPage from "components/Utils/LSPage";
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import PageContainer from "components/Utils/PageContainer";
import CreateExamSchedule from "./CreateExamSchedule";
import { ArrowLeft } from "iconsax-react";
import { useNavigate, useSearchParams } from "react-router-dom";

const steps = ['Set Exam Details', 'Set Exam Schedule'];

function ExamSetup() {
    const [activeStep, setActiveStep] = useState(1);

    const [searchParams] = useSearchParams();
    const examId = searchParams.get("examId");

    const navigate = useNavigate()

    useEffect(() => {
        if (examId) {
            setActiveStep(2)
        }
    }, [])

    return (
        <>
            {
                activeStep === 1 ? (
                    <PageContainer>
                        <Navbar />
                        <LSPage>
                            <PageHeaderWithHelpButton title="Add Exam" />
                            <br />
                            <Box sx={{ p: "14px", mt: "4px", border: "1px solid #ccc", borderRadius: "10px" }}>
                                <Stepper sx={{ width: '100%' }} >
                                    {steps.map((step, index) => (
                                        <Step
                                            key={step}
                                            indicator={
                                                <StepIndicator
                                                    variant={activeStep <= index ? 'soft' : 'solid'}
                                                    color={activeStep < index ? 'neutral' : 'primary'}
                                                >
                                                    {activeStep <= index ? index + 1 : <Check />}
                                                </StepIndicator>
                                            }
                                            sx={[
                                                activeStep > index &&
                                                index !== 2 && { '&::after': { bgcolor: 'primary.solidBg' } },
                                            ]}
                                        >
                                            <StepButton onClick={() => setActiveStep(index)}>{step}</StepButton>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                            <SetExamDetails setActiveStep={setActiveStep} />

                        </LSPage>
                    </PageContainer>
                ) : (
                    <Box sx={{ maxWidth: "95vw", marginLeft: "80px", backgroundColor: "#fff" }}>
                        <Navbar />
                        <Box sx={{ p: 4 }}>
                            <PageHeaderWithHelpButton title="Add Exam" />
                            <br />
                            <Box sx={{ p: "14px", mt: "4px", border: "1px solid #ccc", borderRadius: "10px" }}>

                                <Stepper sx={{ width: '100%' }}>
                                    {steps.map((step, index) => (
                                        <Step
                                            key={step}
                                            indicator={
                                                <StepIndicator
                                                    variant={activeStep <= index ? 'soft' : 'solid'}
                                                    color={activeStep < index ? 'neutral' : 'primary'}
                                                >
                                                    {activeStep <= index ? index + 1 : <Check />}
                                                </StepIndicator>
                                            }
                                            sx={[
                                                activeStep > index &&
                                                index !== 2 && { '&::after': { bgcolor: 'primary.solidBg' } },
                                            ]}
                                        >
                                            <StepButton onClick={() => setActiveStep(index)}>{step}</StepButton>
                                        </Step>
                                    ))}
                                </Stepper>
                            </Box>
                            <br />
                            <Stack direction={"row"} justifyContent={"start"}>
                                <Button variant="plain" startDecorator={<ArrowLeft />} onClick={() => {
                                    setActiveStep(prev => prev - 1)
                                    navigate(
                                        "/schoolResults/add-exam"
                                    );
                                }}>Prevous</Button>
                            </Stack>

                            <Box sx={{ p: "14px", mt: "6px", border: "1px solid #ccc", borderRadius: "10px" }}>
                                <CreateExamSchedule />
                            </Box>
                        </Box>
                    </Box>
                )
            }
        </>
    )
}

export default ExamSetup