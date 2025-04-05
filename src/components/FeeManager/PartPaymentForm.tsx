import React from "react";
import { Box, Button, Chip, FormControl, FormLabel, Input } from "@mui/joy";
import { MoneyRecive } from "iconsax-react";
import { AnimatePresence, motion } from "framer-motion";
import { IChallanNL } from "types/payment";

interface PartPaymentFormProps {
  selectedChallanDetails: IChallanNL | null;
  recievedAmountPartPayment: number | undefined;
  setRecievedAmountPartPayment: (value: number) => void;
  partPaymentComment: string | undefined;
  setPartPaymentComment: (value: string) => void;
  isPaymentLoading: boolean;
  handlePartPaymentSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

const PartPaymentForm: React.FC<PartPaymentFormProps> = ({
  selectedChallanDetails,
  recievedAmountPartPayment,
  setRecievedAmountPartPayment,
  partPaymentComment,
  setPartPaymentComment,
  isPaymentLoading,
  handlePartPaymentSubmit,
}) => {
  return (
    <AnimatePresence>
      {selectedChallanDetails ? (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.2 }}
        >
          <Chip sx={{ p: "5px", ml: "5px", pl: "10px", pr: "10px" }}>
            You have selected{" "}
            <span style={{ color: "var(--bs-danger2)", margin: "5px" }}>
              Challan ID: {selectedChallanDetails?.challanId}
            </span>
            for the month of
            <span style={{ color: "var(--bs-danger2)", margin: "5px" }}>
              {selectedChallanDetails?.challanTitle}
            </span>
            , student total due is
            <span style={{ color: "var(--bs-danger2)", margin: "5px" }}>
              ₹{selectedChallanDetails?.totalDue}
            </span>
            . Please enter the desired amount below and click pay.
          </Chip>
          <Box
            component="form"
            onSubmit={handlePartPaymentSubmit}
            sx={{ m: "10px", display: "flex", gap: "8px" }}
          >
            <FormControl>
              <FormLabel
                required
                sx={{ color: "var(--bs-light-text)", m: "4px" }}
              >
                Enter received amount
              </FormLabel>
              <Input
                variant="outlined"
                color="primary"
                type="text"
                required
                placeholder="Enter amount"
                value={recievedAmountPartPayment}
                onChange={(e) =>
                  setRecievedAmountPartPayment(parseInt(e.target.value) || 0)
                }
              ></Input>
            </FormControl>
            <FormControl>
              <FormLabel
                required
                sx={{ color: "var(--bs-light-text)", m: "4px" }}
              >
                Comment for part payment
              </FormLabel>
              <Input
                required
                type="text"
                color="primary"
                sx={{ width: "350px" }}
                placeholder=""
                value={partPaymentComment}
                onChange={(e) => setPartPaymentComment(e.target.value)}
              ></Input>
            </FormControl>
            <FormControl
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "end",
              }}
            >
              <Button
                type="submit"
                startDecorator={<MoneyRecive />}
                loading={isPaymentLoading}
              >
                Receive
              </Button>
            </FormControl>
          </Box>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

export default PartPaymentForm;
