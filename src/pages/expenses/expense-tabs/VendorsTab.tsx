import MaterialTable from "@material-table/core";
import { Add, More, Search } from "@mui/icons-material"
import { Box, Button, Input, Stack } from "@mui/joy"
import { useState } from "react";


function VendorsTab() {

  const [expenses, _setExpenses] = useState([]);


  const columnMat = [
    { title: "Expense Date", field: "serialNo" },
    { title: "Expense Id", field: "pickupPointName" },
    { title: "Category", field: "distance" },
    { title: "SubCategory", field: "distance" },
    { title: "Total Amount", field: "distance" },
    { title: "Payment Status", field: "distance" },
    { title: "Reciever", field: "distance" },
  ]
  return (
    <>
      <Stack
        justifyContent={"space-between"}
        direction={"row"}
        mt={2}
      >
        <Input
          startDecorator={<Search />}
          sx={{ flex: 0.6, p: 1.1 }}
          placeholder="Search expense id,reciever or subcategory..."
        ></Input>

        <Stack
          direction={"row"}
        >
          <Button startDecorator={<Add />}>Add Vendors</Button>
        </Stack>
      </Stack>
      <br />
      <Box
        sx={{
          borderRadius: "8px",
          boxShadow: "0px 2px 2px rgba(0, 0, 0, 0.2)",
          border: "1px solid #F4F4F4",
          overflow: "hidden"
        }}
      >
        <MaterialTable
          style={{ display: "grid", boxShadow: "none" }}
          columns={columnMat}
          data={expenses}
          options={{
            search: false,
            showTitle: false,
            toolbar: false,
            // grouping: true,
            headerStyle: {
              backgroundColor: "#F4F4F4",
              // color: "#FFF",
              paddingLeft: "1rem",
              paddingRight: "1rem",
              paddingTop: "0.5rem",
              paddingBottom: "0.5rem",
              margin: 1
            },
            actionsColumnIndex: -1,
          }}
          actions={[
            {
              icon: () => <More sx={{ color: "var(--bs-primary)" }} />,
              tooltip: "More option",
              onClick: (event, rowData) => {
                //To Do
              },
            },
          ]}
        />
      </Box>
    </>
  )
}

export default VendorsTab