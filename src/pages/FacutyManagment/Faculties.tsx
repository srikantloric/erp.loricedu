import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { Breadcrumbs, Typography, Grid, useMediaQuery } from "@mui/material";
import { Box, Button, Input, LinearProgress, Stack } from "@mui/joy";
import { Search } from "@mui/icons-material";
import PersonIcon from "@mui/icons-material/Person";
import GrainIcon from "@mui/icons-material/Grain";
import { User } from "iconsax-react";

import Card from "../../components/Card/Card";
import { RootState, useDispatch, useSelector } from "store";
import { fetchTeacher } from "store/reducers/facultiesSlice";
import { AddFacultyDialog } from "components/Modals/AddFacultyDialog";

function Faculties() {
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const facultiesList = useSelector(
    (state: RootState) => state.faculties.teacherArray
  );
  const dispatch = useDispatch();

  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    dispatch(fetchTeacher());
  }, [dispatch]);

  return (
    <>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          m: 1,
          border: "1px solid oklch(.905 .013 255.508)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ xs: "flex-start", sm: "center" }}
          justifyContent="space-between"
        >
          <Breadcrumbs aria-label="breadcrumb">
            <Link
              to="/"
              style={{
                textDecoration: "none",
                color: "#343a40",
                display: "flex",
                alignItems: "center",
              }}
            >
              <PersonIcon sx={{ color: "var(--bs-gray-500)", mr: 0.5 }} />
              <Typography>Faculty Management</Typography>
            </Link>

            <Typography
              sx={{ display: "flex", alignItems: "center" }}
              color="text.secondary"
            >
              <GrainIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Faculties
            </Typography>
          </Breadcrumbs>

          <Button
            variant="soft"
            startDecorator={<User />}
            fullWidth={isMobile}
            onClick={() => setOpenAddDialog(true)}
          >
            Add New Faculty
          </Button>
        </Stack>
      </Box>

      {/* Search */}
      <Box sx={{ px: 1 }}>
        <Input
          placeholder="Search faculty..."
          startDecorator={<Search />}
          fullWidth
          sx={{
            maxWidth: { sm: 360 },
            my: 2,
          }}
        />
      </Box>

      {/* Loader */}
      {!facultiesList && (
        <LinearProgress thickness={2} sx={{ mx: 2 }} />
      )}

      {/* Cards Grid */}
      <Box sx={{ px: 1 }}>
        <Grid container spacing={2}>
          {facultiesList?.map((dta) => (
            <Grid item key={dta.id} xs={6} sm={6} md={4} lg={3}>
              <Card facultyData={dta} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Dialog */}
      <AddFacultyDialog
        open={openAddDialog}
        onClose={() => setOpenAddDialog(false)}
      />
    </>
  );
}

export default Faculties;
