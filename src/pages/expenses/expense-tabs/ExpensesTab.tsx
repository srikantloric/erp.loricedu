import MaterialTable from "@material-table/core";
import { Add, MoreVert, Search } from "@mui/icons-material"
import { Box, IconButton, Stack, Tooltip, Typography, LinearProgress } from "@mui/joy"
import { Button, FormControl, InputAdornment, InputLabel, MenuItem, Select, SwipeableDrawer, TextField } from "@mui/material";
import { useFirebase } from "context/firebaseContext";
import { collection, doc, FieldValue, getDoc, getDocs, orderBy, query, setDoc, Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { enqueueSnackbar } from "notistack";

interface Expense {
  expenseId?: string;
  expenseTitle: string;
  description?: string;
  invoiceNumber?: string;
  expenseDate: string;
  expenseHead: string;
  expenseAmount: number;
  receiverName: string;
  payerName: string;
  createdAt?: Timestamp | FieldValue
  createdBy?: string;
}

const expenseSchema = z.object({
  expenseTitle: z.string().min(1, "Title required"),
  description: z.string().optional(),
  invoiceNumber: z.string().optional(),
  expenseDate: z.string().min(1, "Date required"),
  expenseHead: z.string().min(1, "Expense head required"),
  expenseAmount: z.coerce.number().min(1, "Amount required"),
  receiverName: z.string().min(1, "Receiver required"),
  payerName: z.string().min(1, "Payer required"),
});

type ExpenseFormType = z.infer<typeof expenseSchema>;

type ExpenseHead = {
  expenseHead: string;
  description: string;
  id?: string;
}

function ExpensesTab() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expenseHeads, setExpenseHeads] = useState<ExpenseHead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { db } = useFirebase();

  // Fetch expenses
  useEffect(() => {
    const fetchExpenses = async () => {
      const expenseCollRef = collection(db, "EXPENSES");
      const q = query(expenseCollRef, orderBy("createdAt", "desc"));
      const expenseSnapshot = await getDocs(q);
      const expenseList = expenseSnapshot.docs.map(doc => ({ expenseId: doc.id, ...doc.data() })) as Expense[];
      setExpenses(expenseList);
    };

    const fetchExpenseHeads = async () => {
      setLoading(true);
      const masterDataRef = doc(db, "MASTER_DATA", "expenseHeads");
      const masterDataSnap = await getDoc(masterDataRef);
      if (masterDataSnap.exists()) {
        const data = masterDataSnap.data();
        setExpenseHeads(data.expenseHeads || []);
      }
      setLoading(false);
    };
    fetchExpenseHeads();
    fetchExpenses();
  }, []);



  const columnMat = [
    { title: "Expense Title", field: "expenseTitle" },
    { title: "Description", field: "description" },
    { title: "Invoice Number", field: "invoiceNumber" },
    {
      title: "Date", field: "expenseDate",
      render: (rowData: any) => (
        <Typography level="body-md" >{new Date(rowData.expenseDate).toDateString()}</Typography>
      )
    },
    { title: "Expense Head", field: "expenseHead" },
    {
      title: "Total Amount", field: "expenseAmount",
      render: (rowData: any) => (
        <Stack>
          <Typography level="title-lg" color="primary">₹{rowData.expenseAmount}</Typography>
          <Typography level="body-sm" >Cash</Typography>
        </Stack>
      )
    },
    {
      title: "Receiver", field: "receiverName",
      render: (rowData: any) => (
        <Stack>
          <Typography level="title-md" >{rowData.receiverName}</Typography>
          <Typography level="body-sm" >Staff</Typography>
        </Stack>
      )
    },
    {
      title: "Payer", field: "payerName",
      render: (rowData: any) => (
        <Stack>
          <Typography level="title-md" >{rowData.payerName}</Typography>
          <Typography level="body-sm" >Staff</Typography>
        </Stack>
      )
    },
    {
      title: "Document", field: "documentUrl",
      render: (rowData: any) =>
        rowData.documentUrl ? (
          <a href={rowData.documentUrl} target="_blank" rel="noopener noreferrer">View</a>
        ) : (
          <Typography level="body-xs" color="neutral">-</Typography>
        )
    },
    {
      title: "CreatedBy", field: "createdBy",
      render: (rowData: any) =>
        rowData.createdBy ? (
          <Typography level="body-xs" color="neutral">{rowData.createdBy}</Typography>
        ) : (
          <Typography level="body-xs" color="neutral">-</Typography>
        )
    },
    {
      title: "CreatedAt", field: "createdAt",
      render: (rowData: any) =>
        rowData.createdAt ? (
          <Typography level="body-md" color="neutral">{rowData.createdAt.toDate().toLocaleString()}</Typography>
        ) : (
          <Typography level="body-xs" color="neutral">-</Typography>
        )
    }
  ];

  // React Hook Form with Zod
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<ExpenseFormType>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      expenseTitle: "",
      description: "",
      invoiceNumber: "",
      expenseDate: new Date().toISOString().split("T")[0],
      expenseHead: "",
      expenseAmount: 0,
      receiverName: "",
      payerName: "",
    }
  });

  const onSubmit = async (data: ExpenseFormType) => {
    // Find the selected head object to get its id
    const selectedHead = expenseHeads.find(h => h.expenseHead === data.expenseHead);

    const newExpense: Expense & { headerId?: string } = {
      ...data,
      expenseAmount: Number(data.expenseAmount),
      createdAt: Timestamp.now(),
      headerId: selectedHead?.id || "",
    };

    // Save to Firestore
    const expenseCollRef = collection(db, "EXPENSES");
    const expenseDocRef = doc(expenseCollRef);
    await setDoc(expenseDocRef, newExpense);
    newExpense.expenseId = expenseDocRef.id;
    setExpenses(prev => [...prev, newExpense]);
    enqueueSnackbar("Expense added!", { variant: "success" });
    reset();
    setDrawerOpen(false);
  };

  return (
    <>
      <Stack justifyContent={"space-between"} direction={"row"} mt={2}>
        <TextField
          variant="outlined"
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1 }} />,
          }}
          sx={{ flex: 0.6 }}
          placeholder="Search expense id, receiver or subcategory..."
        />
        <Stack direction={"row"} spacing={2}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDrawerOpen(true)}>Add Expense</Button>
          <Tooltip title="More option">
            <IconButton variant="outlined" >
              <MoreVert />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <br />
      <Box
        sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "2px", }}
      >
        {loading && <LinearProgress />}
        <MaterialTable
          style={{ display: "grid", boxShadow: "none", fontSize: "0.92rem" }}
          columns={columnMat}
          data={expenses}
          options={{
            search: false,
            showTitle: false,
            toolbar: false,
            headerStyle: {
              backgroundColor: "#F4F4F4",
              paddingLeft: "0.5rem",
              paddingRight: "0.5rem",
              paddingTop: "0.3rem",
              paddingBottom: "0.3rem",
              margin: 1,
              fontSize: "0.95rem",
              height: 36,
            },
            rowStyle: {
              fontSize: "0.92rem",
              height: 34,
              paddingTop: 2,
              paddingBottom: 2,
            },
            actionsColumnIndex: -1,
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
          renderSummaryRow={({ column, data }) => {
            // Total for expenseAmount
            if (column.field === "expenseAmount") {
              const total = data.reduce((sum, row) => sum + (Number(row.expenseAmount) || 0), 0);
              return {
                value: `Total: ₹${total.toLocaleString()}`,
                style: { fontWeight: "bold", textAlign: "center" },
              };
            }
            // Optional: you can add other columns if needed
            if (column.field === "expenseTitle") {
              return { value: "Summary", style: { fontWeight: "bold" } };
            }
            return null;
          }}
        />
      </Box>

      <SwipeableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <Box sx={{ width: 350, p: 2, height: "100%" }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography mb={2}>Add Expense</Typography>
            <IconButton onClick={() => setDrawerOpen(false)}><MoreVert /></IconButton>
          </Stack>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2}>
              <TextField
                label="Expense Title"
                variant="outlined"
                size="small"
                {...register("expenseTitle")}
                error={!!errors.expenseTitle}
                helperText={errors.expenseTitle?.message}
                fullWidth
              />

              <TextField
                label="Description"
                variant="outlined"
                size="small"
                multiline
                minRows={2}
                {...register("description")}
                fullWidth
              />

              <TextField
                label="Invoice Number"
                variant="outlined"
                size="small"
                {...register("invoiceNumber")}
                fullWidth
              />

              <TextField
                label="Date"
                type="date"
                variant="outlined"
                size="small"
                {...register("expenseDate")}
                error={!!errors.expenseDate}
                helperText={errors.expenseDate?.message}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <FormControl fullWidth size="small" error={!!errors.expenseHead}>
                <InputLabel id="expense-head-label">Head</InputLabel>
                <Select
                  labelId="expense-head-label"
                  label="Head"
                  value={watch("expenseHead")}
                  onChange={e => {
                    setValue("expenseHead", e.target.value as string);
                  }}
                >
                  {expenseHeads.map((head, index) => (
                    <MenuItem key={head.id || index} value={head.expenseHead}>
                      {head.expenseHead}
                    </MenuItem>
                  ))}
                </Select>
                {errors.expenseHead && <Typography color="danger" fontSize={12}>{errors.expenseHead.message}</Typography>}
              </FormControl>

              <TextField
                label="Amount"
                variant="outlined"
                size="small"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">Rs.</InputAdornment>,
                }}
                {...register("expenseAmount")}
                error={!!errors.expenseAmount}
                helperText={errors.expenseAmount?.message}
                fullWidth
              />

              <TextField
                label="Receiver Name"
                variant="outlined"
                size="small"
                {...register("receiverName")}
                error={!!errors.receiverName}
                helperText={errors.receiverName?.message}
                fullWidth
              />

              <TextField
                label="Payer Name"
                variant="outlined"
                size="small"
                {...register("payerName")}
                error={!!errors.payerName}
                helperText={errors.payerName?.message}
                fullWidth
              />

              <Button type="submit" variant="contained" sx={{ borderRadius: "12px" }} size="small" startIcon={<Add />}>
                Add Expense
              </Button>
            </Stack>
          </form>
        </Box>
      </SwipeableDrawer>
    </>
  )
}

export default ExpensesTab;