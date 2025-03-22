import React from "react";
import Styles from "./CardDashboard.module.scss";
import { Grid } from "@mui/material";
import { Box, Stack, Typography } from "@mui/joy";
import { Money, MoneyRecive } from "iconsax-react";

function CardDashboard({ headerTitle, subHeaderTitle, color, Icon }) {
  return (
    <>
      <Box
        sx={{
          padding: "1.5rem",
          overflow: "hidden",
          position: "relative",
          borderRadius: "0.5rem",
          backgroundColor: color,
          transition:"transform 0.5 ease-in",
          "&:before, &:after": {
            content: '""',
            width: 1,
            height: 1,
            position: "absolute",
            background:
              "linear-gradient(90deg, rgba(255, 255, 255, 0.0001) 22.07%, rgba(255, 255, 255, 0.15) 83.21%)",
            transform: "matrix(0.9, 0.44, -0.44, 0.9, 0, 0)",
          },
          "&:after": {
            top: "50%",
            right: "-20px",
          },
          "&:before": {
            right: "-70px",
            bottom: "80%",
          },
          "&:hover":{
            transform: "scale(1.02)",
            zIndex:"99999"
          }
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Icon size="32" color="#FFF" opacity="0.7"/>
          <Stack gap={1} alignItems={"end"}>
            <Typography
              sx={{ color: "#fff", fontSize: "24px", fontWeight: "600" }}
              level="h4"
            >
              {headerTitle}
            </Typography>
            <Typography sx={{ color: "#fff" }} level="body-sm">
              {subHeaderTitle}
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </>
  );
}

export default CardDashboard;
