import { Avatar, Box, Chip, Divider, Stack, Table, Typography } from "@mui/joy";
import CallIcon from "@mui/icons-material/Call";
import EmailIcon from "@mui/icons-material/Email";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { Dash, InfoCircle } from "iconsax-react";
import { StudentDetailsType } from "types/student";
import { getClassNameByValue } from "utilities/UtilitiesFunctions";

interface StudentProfileProps {
  studentData: StudentDetailsType;
}

const ProfileTab:React.FC<StudentProfileProps>=({studentData}) =>{

  console.log(studentData)

  return (
    <Box sx={{ display: "flex", gap: "1.6rem", mt: "1rem" }}>
      <Box
        sx={{
          padding: "14px",
          border: "1px solid var(--bs-gray-300)",
          borderRadius: "12px",
          flex: 25,
        }}
      >
        <Stack alignItems="center">
          <Avatar
            src={studentData.profil_url}
            sx={{ "--Avatar-size": "5rem", mt: "10px" }}
          />
          <Chip
            size="sm"
            variant="soft"
            color="primary"
            sx={{
              mt: -1,
              mb: 1,
              border: "3px solid",
              borderColor: "background.surface",
            }}
          >
            NEW
          </Chip>
          <Typography level="title-lg">{studentData.student_name}</Typography>
          <Typography level="body-md" sx={{ textAlign: "center" }}>
            {studentData.admission_no}
          </Typography>
          <Divider
            sx={{ ml: "20px", mr: "20px", mt: "1.5rem", mb: "1.2rem" }}
          />
          <Stack direction={"row"} gap={"1rem"}>
            <Stack>
              <Typography level="title-md">{getClassNameByValue(studentData.class!)}</Typography>
              <Typography level="body-md">Class</Typography>
            </Stack>
            <Divider orientation="vertical" />
            <Stack alignItems={"center"}>
              <Typography level="title-md">{studentData.class_roll}</Typography>
              <Typography level="body-md">Roll No</Typography>
            </Stack>
            <Divider orientation="vertical" />
            <Stack alignItems={"center"}>
              <Typography level="title-md">{studentData.section}</Typography>
              <Typography level="body-md">Section</Typography>
            </Stack>
          </Stack>
          <Divider
            sx={{ ml: "20px", mr: "20px", mt: "1.5rem", mb: "1.2rem" }}
          />

          <table
            style={{
              padding: "1rem",
              width: "90%",
              background: "var(--bs-gray-200)",
              border: "1px solid var(--bs-gray-300)",
              borderRadius: "0.5rem",
            }}
          >
            <tbody>
              <tr>
                <th>
                  <CallIcon
                    sx={{ color: "var(--bs-gray-450)", fontSize: "18px" }}
                  />
                </th>
                <th style={{ textAlign: "end" }}>
                  <Typography level="body-sm" sx={{ fontWeight: "500" }}>
                    +91-{studentData.contact_number}
                  </Typography>
                </th>
              </tr>
              <tr>
                <th>
                  <EmailIcon
                    sx={{ color: "var(--bs-gray-450)", fontSize: "18px" }}
                  />
                </th>
                <th style={{ textAlign: "end" }}>
                  <Typography level="body-sm" sx={{ fontWeight: "500" }}>
                    {studentData.email}
                  </Typography>
                </th>
              </tr>
              <tr>
                <th>
                  <MyLocationIcon
                    sx={{ color: "var(--bs-gray-450)", fontSize: "18px" }}
                  />
                </th>
                <th style={{ textAlign: "end" }}>
                  <Typography level="body-sm" sx={{ fontWeight: "500" }}>
                    {studentData.address}
                  </Typography>
                </th>
              </tr>
            </tbody>
          </table>
        </Stack>
      </Box>
      <Box sx={{ flex: 75 }}>
        <Box
          sx={{
            border: "1px solid var(--bs-gray-300)",
            borderRadius: "12px",
          }}
        >
          <Typography sx={{ m: "1rem" }} level="title-md" startDecorator={<Dash size="20" />}>
            Personal Details
          </Typography>
          <Divider />
          <Box sx={{ padding: "1.2rem" }}>
            <Table>
              <thead>
                <tr>
                  <td>
                    <Typography level="body-sm">Full Name</Typography>
                    <Typography level="title-md">{studentData.student_name||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">Father Name</Typography>
                    <Typography level="title-md">{studentData.father_name||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">Mother Name</Typography>
                    <Typography level="title-md">{studentData.mother_name||"N/A"}</Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography level="body-sm">Gender</Typography>
                    <Typography level="title-md">{studentData.gender||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">Date Of Birth</Typography>
                    <Typography level="title-md">{studentData.dob||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">Blood Group</Typography>
                    <Typography level="title-md">{studentData.blood_group||"N/A"}</Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography level="body-sm">Religion</Typography>
                    <Typography level="title-md">{studentData.religion||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">Cast</Typography>
                    <Typography level="title-md">{studentData.caste||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">Aadhar Number</Typography>
                    <Typography level="title-md">{studentData.aadhar_number||"N/A"}</Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography level="body-sm">
                      Father's Qualification
                    </Typography>
                    <Typography level="title-md">{studentData.father_qualification||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">Father's Occupation</Typography>
                    <Typography level="title-md">{studentData.father_occupation||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      Mother's Qualification
                    </Typography>
                    <Typography level="title-md">{studentData.motherqualifiation||"N/A"}</Typography>
                  </td>
                </tr>
                <tr>
                  <td>
                    <Typography level="body-sm">Father's Occupation</Typography>
                    <Typography level="title-md">{studentData.mother_occupation||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      Mobile Number Alternate
                    </Typography>
                    <Typography level="title-md">{studentData.alternate_number||"N/A"}</Typography>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td colSpan={2}>
                    <Typography level="body-sm">Present Address</Typography>
                    <Typography level="title-md">
                    {studentData.address||"N/A"}
                    </Typography>
                  </td>
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <Typography level="body-sm">City</Typography>
                    <Typography level="title-md">{studentData.city||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">State</Typography>
                    <Typography level="title-md">{studentData.state||"N/A"}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">Pin Code</Typography>
                    <Typography level="title-md">{studentData.postal_code||"N/A"}</Typography>
                  </td>
                </tr>
              </thead>
            </Table>
          </Box>
        </Box>
        <Box
          sx={{
            flex: 75,
            border: "1px solid var(--bs-gray-300)",
            borderRadius: "12px",
            mt: "1rem",
          }}
        >
          <Typography
            sx={{ m: "1rem" }}
            level="title-sm"
           startDecorator={<InfoCircle size="20"/>}
          >
            Admission Details
          </Typography>
          <Divider />
          <Box>
            <Table sx={{ p: "1rem" }}>
              <thead>
                <tr>
                  <td>
                    <Typography level="body-sm">Admission Date</Typography>
                    <Typography level="title-md">{studentData.date_of_addmission}</Typography>
                  </td>
                  <td colSpan={2}>
                    <Typography level="body-sm">Registration Number/Student Id</Typography>
                    <Typography level="title-md">{studentData.admission_no}</Typography>
                  </td>
                 
                  <td></td>
                </tr>
                <tr>
                  <td>
                    <Typography level="body-sm">Current Montly Fee</Typography>
                    <Typography level="title-md">₹{studentData.monthly_fee}/month</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      Current Computer Fee
                    </Typography>
                    <Typography level="title-md">₹{studentData.computer_fee}/month</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      Current Transport Fee
                    </Typography>
                    <Typography level="title-md">₹{studentData.transportation_fee}/month</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">
                      Current Student Discount
                    </Typography>
                    <Typography level="title-md">₹{studentData.fee_discount?studentData.fee_discount:0}/month</Typography>
                  </td>
                </tr>
              </thead>
            </Table>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default ProfileTab;
