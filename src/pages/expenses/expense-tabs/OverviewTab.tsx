import { Box, Divider, Option, Select, Skeleton, Stack, Typography } from "@mui/joy";
import { Grid } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

type Expense = {
  expenseId?: string;
  expenseTitle: string;
  description?: string;
  invoiceNumber?: string;
  expenseDate: string;
  expenseHead: string;
  expenseAmount: number;
  receiverName: string;
  payerName: string;
  headerId?: string;
  createdAt?: any;
  createdBy?: string;
};

type ExpenseHead = {
  expenseHead: string;
  description: string;
  id?: string;
};

function OverviewTab() {
  const { db } = useFirebase();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [expenseHeads, setExpenseHeads] = useState<ExpenseHead[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Fetch expenses and heads
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      // Fetch expense heads
      const headsDoc = await getDoc(doc(db, "MASTER_DATA", "expenseHeads"));
      let heads: ExpenseHead[] = [];
      if (headsDoc.exists()) {
        const data = headsDoc.data();
        heads = data.expenseHeads || [];
        setExpenseHeads(heads);
      }

      // Fetch expenses
      const expensesSnap = await getDocs(collection(db, "EXPENSES"));
      const expensesList: Expense[] = expensesSnap.docs.map(doc => ({
        expenseId: doc.id,
        ...doc.data()
      })) as Expense[];
      setExpenses(expensesList);
      setLoading(false);
    };
    fetchData();
  }, [db]);

  // Group expenses by headerId
  const expensesByCategory = useMemo(() => {
    const map: { [headerId: string]: { head: ExpenseHead; total: number } } = {};
    expenseHeads.forEach(head => {
      map[head.id || ""] = { head, total: 0 };
    });
    expenses.forEach(exp => {
      if (exp.headerId && map[exp.headerId]) {
        map[exp.headerId].total += Number(exp.expenseAmount) || 0;
      }
    });
    return Object.values(map).filter(item => item.head.id);
  }, [expenses, expenseHeads]);

  // Filtered expenses for selected category
  const filteredExpenses = useMemo(() => {
    if (!selectedCategory) return expenses;
    return expenses.filter(exp => exp.headerId === selectedCategory);
  }, [expenses, selectedCategory]);

  // Total expenses
  const totalExpenses = useMemo(
    () => expenses.reduce((sum, exp) => sum + (Number(exp.expenseAmount) || 0), 0),
    [expenses]
  );

  return (
    <Grid container spacing={2} sx={{ flexGrow: 1 }}>
      <Grid item xs={12} lg={6}>
        <Box sx={{
          backgroundColor: "#F4F4F4",
          p: 2,
          borderRadius: "8px"
        }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"flex-start"}>
            <Stack>
              <Typography>Total expenses</Typography>
              {loading ? (
                <Skeleton variant="text" width={120} height={32} />
              ) : (
                <Typography level="title-lg" >₹{totalExpenses.toLocaleString()}</Typography>
              )}
            </Stack>
            <Stack direction={"row"} spacing={2}>
              <Select
                placeholder="Categories"
                value={selectedCategory}
                onChange={(_, v) => setSelectedCategory(v ?? "")}
                sx={{ minWidth: 120 }}
                disabled={loading}
              >
                <Option value="">All</Option>
                {expenseHeads.map(head => (
                  <Option key={head.id} value={head.id}>{head.expenseHead}</Option>
                ))}
              </Select>
            </Stack>
          </Stack>
          <Stack
            direction={"column"}
            sx={{
              backgroundColor: "#D5E5D5",
              overflowX: "hidden",
              overflowY: "auto"
            }}
            p={2}
            mt={2}
            mb={2}
            height={"150px"}
            borderRadius={"8px"}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" mb={1}>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={60} height={24} />
                </Stack>
              ))
            ) : expensesByCategory.length === 0 ? (
              <Typography>No data</Typography>
            ) : (
              expensesByCategory.map(item => (
                <Stack key={item.head.id} justifyContent={"space-between"} direction={"row"}>
                  <Typography>{item.head.expenseHead}</Typography>
                  <Typography>₹{item.total.toLocaleString()}</Typography>
                </Stack>
              ))
            )}
          </Stack>
          <Divider />
          <Stack justifyContent={"center"} direction={"row"} width={"100%"}>
            <Typography variant="plain" color="primary">
              View Details
            </Typography>
          </Stack>
        </Box>
      </Grid>
      <Grid item xs={12} lg={6}>
        <Box sx={{
          backgroundColor: "#F4F4F4",
          p: 2,
          borderRadius: "8px"
        }}>
          <Stack direction={"row"} justifyContent={"space-between"} alignItems={"flex-start"}>
            <Stack>
              <Typography>Category Expenses</Typography>
              {loading ? (
                <Skeleton variant="text" width={120} height={32} />
              ) : (
                <Typography level="title-lg" >
                  ₹{filteredExpenses.reduce((sum, exp) => sum + (Number(exp.expenseAmount) || 0), 0).toLocaleString()}
                </Typography>
              )}
            </Stack>
            <Stack direction={"row"} spacing={2}>
              <Select
                placeholder="Categories"
                value={selectedCategory}
                onChange={(_, v) => setSelectedCategory(v ?? "")}
                sx={{ minWidth: 120 }}
                disabled={loading}
              >
                <Option value="">All</Option>
                {expenseHeads.map(head => (
                  <Option key={head.id} value={head.id}>{head.expenseHead}</Option>
                ))}
              </Select>
            </Stack>
          </Stack>
          <Stack
            direction={"column"}
            sx={{
              backgroundColor: "#F7E6E3",
              overflowX: "hidden",
              overflowY: "auto"
            }}
            p={2}
            mt={2}
            mb={2}
            height={"150px"}
            borderRadius={"8px"}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Stack key={i} direction="row" justifyContent="space-between" mb={1}>
                  <Skeleton variant="text" width={120} height={24} />
                  <Skeleton variant="text" width={60} height={24} />
                </Stack>
              ))
            ) : filteredExpenses.length === 0 ? (
              <Typography>No expenses in this category</Typography>
            ) : (
              filteredExpenses.map(exp => (
                <Stack key={exp.expenseId} justifyContent={"space-between"} direction={"row"}>
                  <Typography>{exp.expenseTitle}</Typography>
                  <Typography>₹{Number(exp.expenseAmount).toLocaleString()}</Typography>
                </Stack>
              ))
            )}
          </Stack>
          <Divider />
          <Stack justifyContent={"center"} direction={"row"} width={"100%"}>
            <Typography variant="plain" color="primary">
              View Details
            </Typography>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
}

export default OverviewTab;
