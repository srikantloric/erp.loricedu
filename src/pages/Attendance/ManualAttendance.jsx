import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import FingerprintIcon from "@mui/icons-material/Fingerprint";
import LSPage from "../../components/Utils/LSPage";
import { Breadcrumbs, Divider, Paper } from "@mui/material";
import { Link } from "react-router-dom";
import PageContainer from "../../components/Utils/PageContainer";

import SaveIcon from "@mui/icons-material/Save";


import {
  Avatar,
  Button,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Option,
  Radio,
  RadioGroup,
  Select,
  Sheet,
  Table,
  Typography,
  radioClasses,
} from "@mui/joy";
import { Search } from "@mui/icons-material";
import BreadCrumbsV2 from "../../components/Breadcrumbs/BreadCrumbsV2";
import HeaderTitleCard from "components/Card/HeaderTitleCard";

function createData(name, calories, fat, carbs, protein) {
  return { name, calories };
}

const rows = [
  createData("Frozen yoghurt", 159, 6.0, 24, 4.0),
  createData("Ice cream sandwich", 237, 9.0, 37, 4.3),
  createData("Eclair", 262, 16.0, 24, 6.0),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Cupcake", 305, 3.7, 67, 4.3),
  createData("Gingerbread", 356, 16.0, 49, 3.9),
];

function ManualAttendance() {
  const date = new Date().toUTCString();

  return (
    <>
      <PageContainer>
        <Navbar />
        <LSPage>
          <BreadCrumbsV2 
          Icon={FingerprintIcon} 
          Path="Attendance Management/Test/Mark Attendance"
          />

      <HeaderTitleCard Title="Mark Attendance Manually"/>         
          <Paper sx={{ p: 2, border: "1px solid var(--bs-gray-300)" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <FormControl>
                  <FormLabel>Select Date</FormLabel>
                  <Input placeholder="Placeholder" type="date" value={date} />
                  {/* <FormHelperText>This is a helper text.</FormHelperText> */}
                </FormControl>
                <FormControl>
                  <FormLabel>Class</FormLabel>
                  <Select defaultValue="none" sx={{ minWidth: 200 }}>
                    <Option value="none">None</Option>
                    <Option value="cat">Cat</Option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Section</FormLabel>
                  <Select defaultValue="none" sx={{ minWidth: 200 }}>
                    <Option value="none">None</Option>
                    <Option value="b">B</Option>
                    <Option value="c">C</Option>
                    <Option value="d">D</Option>
                  </Select>
                </FormControl>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button startDecorator={<SaveIcon />} sx={{ height: 20 }}>
                  Save
                </Button>
              </div>
            </div>
            <br />
            {rows.length !== 0 ? (
              <>
                <Divider />
                <br />
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <Input startDecorator={<Search />} sx={{ flex: 0.6 }} />
                  <Select
                    // defaultValue="dog"
                    placeholder="Mark all as"
                    sx={{ minWidth: "200px" }}
                  >
                    <Option value="none">None </Option>
                    <Option value="A">Absent </Option>
                    <Option value="P">Present</Option>
                  </Select>
                </div>
                <br />
                <div>
                  <Table
                    aria-label="table variants"
                    variant="plain"
                    color="neutral"
                  >
                    <thead>
                      <tr>
                        <th style={{ width: "150px" }}>ID</th>
                        <th>Students</th>
                        <th>Date</th>
                        <th style={{ textAlign: "center" }}>Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.name}>
                          <td>{row.name}</td>
                          <td>
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                              }}
                            >
                              <Avatar />
                              {row.name}
                            </div>
                          </td>
                          <td>
                            <RadioGroup
                              aria-labelledby="storage-label"
                              // defaultValue="512GB"
                              size="sm"
                              sx={{
                                display: "flex",
                                flexDirection: "row",
                                gap: 3,
                              }}
                            >
                              {["A", "P", "H", "L", "S"].map((value) => (
                                <Sheet
                                  key={value}
                                  sx={{
                                    p: 1.5,
                                    borderRadius: "md",
                                    boxShadow: "sm",
                                  }}
                                >
                                  <Radio
                                    label={value}
                                    overlay
                                    disableIcon
                                    value={value}
                                    slotProps={{
                                      label: ({ checked }) => ({
                                        sx: {
                                          fontWeight: "lg",
                                          fontSize: "sm",

                                          color: checked
                                            ? "text.primary"
                                            : "text.secondary",
                                        },
                                      }),
                                      action: ({ checked }) => ({
                                        sx: (theme) => ({
                                          ...(checked && {
                                            "--variant-borderWidth": "2px",
                                            "&&": {
                                              // && to increase the specificity to win the base :hover styles
                                              borderColor:
                                                theme.vars.palette.primary[500],
                                            },
                                          }),
                                        }),
                                      }),
                                    }}
                                  />
                                </Sheet>
                              ))}
                            </RadioGroup>
                          </td>
                          <td>{row.carbs}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </>
            ) : null}
          </Paper>
        </LSPage>
      </PageContainer>
    </>
  );
}

export default ManualAttendance;
