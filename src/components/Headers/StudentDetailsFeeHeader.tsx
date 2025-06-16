import { Box, Typography } from "@mui/joy";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";



interface Props {
    studentMasterData: StudentDetailsType;
}

const StudentDetailsFeeHeader: React.FC<Props> = ({
    studentMasterData,
}) => {
    return (
        <Box sx={{ display: "flex", flex: 1 }}>
            <div style={{ margin: "10px" }}>
                <img
                    src={studentMasterData.profil_url}
                    width={120}
                    height={150}
                    style={{ objectFit: "cover" }}
                ></img>
            </div>
            <div
                style={{
                    margin: "8px 10px 8px 0px",

                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                }}
            >
                <div>
                    <Typography
                        level="h4"
                        sx={{ fontWeight: "500" }}
                        textTransform="uppercase"
                    >
                        {studentMasterData.student_name}
                    </Typography>
                    <Typography level="body-sm">
                        Father's Name : {studentMasterData.father_name}
                    </Typography>
                    <Typography level="body-sm">
                        Student's ID: {studentMasterData.admission_no}
                    </Typography>
                </div>
                <div
                    style={{
                        backgroundColor: "#F0F4F8",
                        display: "flex",

                        borderRadius: "8px",
                        gap: "20px",
                        marginTop: "10px",
                        padding: "10px 16px",

                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography level="body-sm">Class</Typography>
                        <Typography level="title-sm">
                            {getClassNameByValue(studentMasterData.class!)}
                            {/* {location.state[0].class} */}
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography level="body-sm">Roll</Typography>
                        <Typography level="title-sm">
                            {studentMasterData.class_roll}
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography level="body-sm">Admission Date</Typography>
                        <Typography level="title-sm">
                            {studentMasterData.date_of_addmission}
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography level="body-sm">Fee</Typography>
                        <Typography level="title-sm">
                            ₹{studentMasterData.monthly_fee ? studentMasterData.monthly_fee : 0}
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography level="body-sm">Discount</Typography>
                        <Typography level="title-sm">
                            ₹{studentMasterData.fee_discount ? studentMasterData.fee_discount : 0}
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography level="body-sm">Transport</Typography>
                        <Typography level="title-sm">
                            ₹{studentMasterData.transportation_fee ? studentMasterData.transportation_fee : 0}
                        </Typography>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                        }}
                    >
                        <Typography level="body-sm">Computer</Typography>
                        <Typography level="title-sm">
                            ₹{studentMasterData.computer_fee ? studentMasterData.computer_fee : 0}
                        </Typography>
                    </div>
                </div>
            </div>

        </Box>
    );
};

export default StudentDetailsFeeHeader;
