import { useEffect, useState } from "react";

import Card from "../../components/Card/Card";

import { Link } from "react-router-dom";
import PersonIcon from "@mui/icons-material/Person";
import GrainIcon from "@mui/icons-material/Grain";
import { Breadcrumbs, Typography } from "@mui/material";
import { Box, Button, Input, LinearProgress } from "@mui/joy";
import { Search } from "@mui/icons-material";
import { RootState, useDispatch, useSelector } from "store";
import { fetchTeacher } from "store/reducers/facultiesSlice";
import { User } from "iconsax-react";
import { AddFacultyDialog } from "components/Modals/AddFacultyDialog";

function Faculties() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const facultiesList = useSelector((state: RootState) => state.faculties.teacherArray);
  const dipatch = useDispatch()

  useEffect(() => {
    dipatch(fetchTeacher());
  }, [dipatch]);


  return (
    <>

      <Box
        style={{
          padding: "10px",
          borderRadius: "10px",
          margin: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid oklch(.905 .013 255.508)"
        }}
      >
        <Breadcrumbs aria-label="breadcrumb">
          <Link to="/" style={{
            textDecoration: "none",
            color: "#343a40",
            display: "flex",
            alignItems: "center",
          }}>
            <PersonIcon sx={{ color: "var(--bs-gray-500)" }} />
            <Typography sx={{ ml: "4px" }}>Faculty Management</Typography>
          </Link>


          <Typography
            sx={{ display: "flex", alignItems: "center" }}
            color="text.secondary"
          >
            <GrainIcon sx={{ mr: 0.3 }} fontSize="inherit" />
            Faculties
          </Typography>
        </Breadcrumbs>
        <Button
          variant="soft"
          startDecorator={<User />}
          onClick={() => setOpenAddDialog(true)}
        >
          Add New Faculty
        </Button>
      </Box>
      <br />
      <Input placeholder="search faculty..." startDecorator={<Search />} sx={{ m: 1 }} />
      <br />
      {facultiesList ? null : (
        <LinearProgress thickness={2} sx={{ ml: 2, mr: 2 }} />
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
        }}
      >
        {facultiesList &&
          facultiesList.map((dta) => {
            console.log(dta)
            return <Card facultyData={dta} key={dta.id} />;
          })}
      </div>
      <AddFacultyDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />
    </>
  );
}

export default Faculties;
