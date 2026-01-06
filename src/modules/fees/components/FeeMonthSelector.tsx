import { Box, Button, Stack, Typography } from "@mui/joy"
import { useFeeCollection } from "../context/FeeCollectionContext"
import { InfoOutlined, Restore } from "@mui/icons-material"
import MonthCard from "./MonthCard"


function FeeMonthSelector() {

  const { feeChallanMonths, setFeeChallanMonths } = useFeeCollection()

  const handleFeeMonthSelection = (installment: any) => {
    const index = feeChallanMonths.findIndex(i => i.id === installment.id);
    const updated = [...feeChallanMonths];

    if (installment.status === "Pending") {
      for (let i = 0; i <= index; i++) {
        if (updated[i].status === "Pending") updated[i].status = "Added";
      }
    } else if (installment.status === "Added") {
      for (let i = index; i < updated.length; i++) {
        if (updated[i].status === "Added") updated[i].status = "Pending";
      }
    }

    setFeeChallanMonths(updated);
  };

  const resetAll = () => {
    setFeeChallanMonths((prev) =>
      prev.map(inst => ({
        ...inst,
        status: inst.status === "Paid" ? "Paid" : "Pending",
      }))
    );
  };

  return (
    <Box>
      <Stack direction={"row"} justifyContent={"space-between"} mt={2} mb={1}>
        <Typography
          level="title-lg"
          startDecorator={<InfoOutlined />}
          color="primary"
        >
          Installment / Fee Month Selection
        </Typography>

        <Button
          variant="soft"
          color="danger"
          startDecorator={<Restore />}
          onClick={resetAll}
        >
          Reset Selection
        </Button>
      </Stack>


      <Box
        sx={{
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "8px",
          display: "flex",
          flexWrap: "wrap",
          gap: 1,
          justifyContent:"space-evenly"
        }}
      >
        {feeChallanMonths.map(inst => (
          <MonthCard
            key={inst.id}
            label={inst.month}
            status={inst.status}
            onClick={() => handleFeeMonthSelection(inst)}
          />
        ))}
      </Box>
    </Box>
  )
}

export default FeeMonthSelector