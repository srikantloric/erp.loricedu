import MaterialTable from "@material-table/core";
import { Add, Delete, Edit, Search } from "@mui/icons-material"
import { Box, Button, Divider, Input, ModalClose, Skeleton, Stack, Textarea, Typography } from "@mui/joy"
import { SwipeableDrawer } from "@mui/material";
import { useFirebase } from "context/firebaseContext";
import { arrayUnion, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { enqueueSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { generateRandomSixDigitNumber } from "utilities/PaymentUtilityFunctions";

type ExpenseHead = {
  expenseHead: string;
  description: string;
  id?: string;
}


function CategoriesTab() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expenseHead, setExpenseHead] = useState("");
  const [description, setDescription] = useState("");
  const [expenseHeads, setExpenseHeads] = useState<ExpenseHead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const { db } = useFirebase()

  const columnMat = [
    { title: "Expense Head", field: "expenseHead" },
    { title: "Description", field: "description" },
  ]


  const handleCreateExpenseHead = async () => {
    const newExpense = {
      expenseHead,
      description,
      id: generateRandomSixDigitNumber().toString(),
    };

    const masterDataRef = doc(db, "MASTER_DATA", "expenseHeads");
    await setDoc(masterDataRef, {
      expenseHeads: arrayUnion(newExpense),
      updatedAt: serverTimestamp(),

    }, { merge: true });
    enqueueSnackbar("Expense head added successfully", { variant: "success" });
    setExpenseHeads(prevExpenseHeads => [...prevExpenseHeads, newExpense]);
    setExpenseHead("");
    setDescription("");
    setDrawerOpen(false);
  }

  useEffect(() => {
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
  }, [db]);

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
          placeholder="Search expense head, description..."
        ></Input>

        <Stack
          direction={"row"}
        >
          <Button size="sm" startDecorator={<Add />} onClick={() => setDrawerOpen(true)}>Add Heads</Button>
        </Stack>
      </Stack>
      <br />
      <Box
        sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "2px", }}
      >
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Stack direction="row" spacing={2} key={i} sx={{ mb: 1 }}>
                <Skeleton variant="rectangular" width={120} height={28} />
                <Skeleton variant="rectangular" width="60%" height={28} />
              </Stack>
            ))}
          </Box>
        ) : (
          <MaterialTable
            style={{ display: "grid", boxShadow: "none" }}
            columns={columnMat}
            data={expenseHeads}
            options={{
              search: false,
              showTitle: false,
              toolbar: false,
              headerStyle: {
                backgroundColor: "#F4F4F4",
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
                icon: () => <Edit sx={{ color: "var(--bs-primary)" }} />,
                tooltip: "Edit",
                onClick: (event, rowData) => {
                  //To Do
                },
              },
              {
                icon: () => <Delete sx={{ color: "var(--bs-primary)" }} />,
                tooltip: "Delete",
                onClick: (event, rowData) => {
                  //To Do
                },
              },
            ]}
          />
        )}
      </Box>
      <SwipeableDrawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpen={() => setDrawerOpen(true)}
      >
        <Box sx={{ width: 300, p: 2, height: "100%" }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"}>
            <Typography mb={2}>Add Expense Head</Typography>
            <ModalClose onClick={() => setDrawerOpen(false)} />
          </Stack>
          <Divider />
          <Stack spacing={2} mt={2}>
            <div>
              <Typography fontSize={14} mb={1}>Expense Head</Typography>
              <Input placeholder="Enter expense head" fullWidth size="md" value={expenseHead} onChange={(e) => setExpenseHead(e.target.value)} />
            </div>
            <div>
              <Typography fontSize={14} mb={1}>Description</Typography>
              <Textarea minRows={3} size="md" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <Button variant="solid" sx={{ borderRadius: "12px" }} size="sm" startDecorator={<Add />}
              onClick={handleCreateExpenseHead}
            >Add Expense Head</Button>
          </Stack>
        </Box>
      </SwipeableDrawer>
    </>
  )
}

export default CategoriesTab