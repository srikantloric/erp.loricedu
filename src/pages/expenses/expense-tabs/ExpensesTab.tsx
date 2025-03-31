import MaterialTable from "@material-table/core";
import { Add, MoreVert, Search } from "@mui/icons-material"
import { Box, Button, Chip, IconButton, Input, Stack, Tooltip, Typography } from "@mui/joy"



function ExpensesTab() {

  // const [expenses, _setExpenses] = useState([]);

  const schoolManagementExpenses = [
    {
      expenseDate: "2024-03-01",
      expenseId: "MGMT001",
      category: "Salaries",
      subcategory: "Teacher Salaries",
      totalAmount: 5000.0,
      paymentStatus: "due",
      receiverName: "John Doe (Math Teacher)"
    },
    {
      expenseDate: "2024-03-02",
      expenseId: "MGMT002",
      category: "Maintenance",
      subcategory: "Building Repairs",
      totalAmount: 1200.5,
      paymentStatus: "due",
      receiverName: "ABC Constructions"
    },
    {
      expenseDate: "2024-03-03",
      expenseId: "MGMT003",
      category: "Utilities",
      subcategory: "Electricity Bill",
      totalAmount: 750.0,
      paymentStatus: "Paid",
      receiverName: "City Power Company"
    },
    {
      expenseDate: "2024-03-04",
      expenseId: "MGMT004",
      category: "Transportation",
      subcategory: "School Bus Fuel",
      totalAmount: 300.0,
      paymentStatus: "due",
      receiverName: "Gas Station"
    },
    {
      expenseDate: "2024-03-05",
      expenseId: "MGMT005",
      category: "Infrastructure",
      subcategory: "New Classroom Furniture",
      totalAmount: 2500.0,
      paymentStatus: "Paid",
      receiverName: "Furniture Supplier"
    },
    {
      expenseDate: "2024-03-06",
      expenseId: "MGMT006",
      category: "Technology",
      subcategory: "Computer Lab Equipment",
      totalAmount: 1800.0,
      paymentStatus: "due",
      receiverName: "Tech Supplier"
    },
    {
      expenseDate: "2024-03-07",
      expenseId: "MGMT007",
      category: "Events",
      subcategory: "Annual Sports Day",
      totalAmount: 900.0,
      paymentStatus: "Paid",
      receiverName: "Event Coordinator"
    }
  ];

  const columnMat = [
    { title: "Expense Date", field: "expenseDate" },
    { title: "Expense Id", field: "expenseId" },
    { title: "Category", field: "category" },
    { title: "SubCategory", field: "subcategory" },
    {
      title: "Total Amount", field: "totalAmount",
      render: (rowData: any) => {
        return (
          <Stack>
            <Typography level="title-lg" >₹{rowData.totalAmount}</Typography>
            <Typography level="body-sm" >Cash</Typography>
          </Stack>
        )
      }

    },
    {
      title: "Payment Status", field: "paymentStatus",
      render: (rowData: any) => {
        switch (rowData.paymentStatus.toUpperCase()) {
          case "DUE":
            return <Chip variant="soft" color="danger" >{rowData.paymentStatus}</Chip>;
          case "PAID":
            return <Chip variant="soft" color="success" >{rowData.paymentStatus}</Chip>;
          default:
            return <Chip variant="soft" color="primary" >{rowData.paymentStatus}</Chip>;
        }
      },
    },
    {
      title: "Receiver", field: "receiverName",
      render: (rowData: any) => {
        return (
          <Stack>
            <Typography level="title-md" >{rowData.receiverName}</Typography>
            <Typography level="body-sm" >Staff</Typography>
          </Stack>
        )
      }

    },
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
          spacing={2}
        >
          <Button startDecorator={<Add />}>Add Expense</Button>
          <Tooltip title="More option">
            <IconButton variant="outlined" >
              <MoreVert />
            </IconButton>
          </Tooltip>
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
          data={schoolManagementExpenses}
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
            rowStyle: (rowData, index) => ({
              backgroundColor: index % 2 === 0 ? "#FFFFFF" : "#FAFAFA",
            }),
          }}

          actions={[
            {
              icon: () => <MoreVert sx={{ color: "var(--bs-primary)" }} />,
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

export default ExpensesTab