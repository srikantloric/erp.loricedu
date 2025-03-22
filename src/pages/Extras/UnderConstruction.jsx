import React from "react";
import UnderConstructionImage from "../../assets/under_construction.png";
import PageContainer from "../../components/Utils/PageContainer";
import Navbar from "../../components/Navbar/Navbar";
import LSPage from "../../components/Utils/LSPage";
import { Typography } from "@mui/material";

function UnderConstruction() {
  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <center>
          <img
            src={UnderConstructionImage}
            style={{ marginTop: "50px", width: "30%",padding:"40px" }}
          ></img>
          <Typography>You are not authorised to use this access. Please contact your administrator.</Typography>
        </center>
      </LSPage>
    </PageContainer>
  );
}

export default UnderConstruction;
