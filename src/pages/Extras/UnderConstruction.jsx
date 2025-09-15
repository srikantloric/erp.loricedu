import React from "react";
import UnderConstructionImage from "../../assets/under_construction.png";
import { Typography } from "@mui/material";

function UnderConstruction() {
  return (

    <center>
      <img
        src={UnderConstructionImage}
        style={{ marginTop: "50px", width: "30%", padding: "40px" }}
        alt="Under Construction"
      ></img>
      <Typography>You are not authorised to use this access. Please contact your administrator.</Typography>
    </center>

  );
}

export default UnderConstruction;
