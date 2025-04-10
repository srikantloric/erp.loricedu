import React from "react";
import { Box, Button, FormControl, FormLabel, Input, Option, Select, Tooltip, IconButton } from "@mui/joy";
import { CurrencyRupee } from "@mui/icons-material";
import { MoneyRecive } from "iconsax-react";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import { IChallanNL } from "types/payment";

interface PaymentFormProps {
  feeCollectionDate: string | null;
  setFeeCollectionDate: (value: string) => void;
  feeChallans: IChallanNL[];
  selectedChallan: string | null;
  setSelectedChallan: (value: string | null) => void;
  selectedPaymentMethod: string | null;
  setSelectedPaymentMethod: (value: string | null) => void;
  recievedAmount: number;
  isPaymentLoading: boolean;
  showPartPaymentOption: boolean;
  setShowPartPaymentOption: (value: boolean) => void;
  handlePaymentRecieveButton: (e: React.FormEvent<HTMLFormElement>, partialPayment: boolean) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  feeCollectionDate,
  setFeeCollectionDate,
  feeChallans,
  selectedChallan,
  setSelectedChallan,
  selectedPaymentMethod,
  setSelectedPaymentMethod,
  recievedAmount,
  isPaymentLoading,
  showPartPaymentOption,
  setShowPartPaymentOption,
  handlePaymentRecieveButton,
}) => {

  
  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        alignItems: "bottom",
        gap: "10px",
        alignContent: "baseline",
      }}
      m="10px"
      onSubmit={(e) => handlePaymentRecieveButton(e, false)}
    >
      <FormControl required>
        <FormLabel sx={{ color: "var(--bs-light-text)", m: "4px" }}>
          Fee Collection Date
        </FormLabel>
        <Input
          type="date"
          slotProps={{
            input: {
              min: "2020-01-01",
              max: "2050-01-01",
            },
          }}
          value={feeCollectionDate!}
          disabled={false}
          onChange={(e) => setFeeCollectionDate(e.target.value)}
        />
      </FormControl>
      <FormControl required>
        <FormLabel sx={{ color: "var(--bs-light-text)", m: "4px" }}>
          Select Fee Challan
        </FormLabel>
        <Select
          placeholder="Select fee challans.."
          required
          sx={{ width: "280px" }}
          value={selectedChallan}
          onChange={(e, val) => setSelectedChallan(val)}
        >
          {feeChallans.length > 0 ? (
            feeChallans.map((item) => (
              <Option value={item.challanId}>
                Fee Challan ({item.challanTitle})
              </Option>
            ))
          ) : (
            <Option value="none" disabled>
              None
            </Option>
          )}
        </Select>
      </FormControl>
      <FormControl required>
        <FormLabel sx={{ color: "var(--bs-light-text)", m: "4px" }}>
          Payment Method
        </FormLabel>
        <Select
          placeholder="Select payment method.."
          required
          value={selectedPaymentMethod}
          onChange={(e, val) => setSelectedPaymentMethod(val)}
          defaultValue="CASH"
        >
          <Option value="CASH">Cash</Option>
          <Option value="ONLINE">Online</Option>
        </Select>
      </FormControl>

      {!showPartPaymentOption ? (
        <>
          <FormControl required>
            <FormLabel sx={{ color: "var(--bs-light-text)", m: "4px" }}>
              Received Amount
            </FormLabel>
            <Input
              type="number"
              sx={{ width: "150px" }}
              disabled={true}
              placeholder="Enter received amount"
              value={recievedAmount!}
              startDecorator={<CurrencyRupee fontSize="small" />}
            ></Input>
          </FormControl>
          <FormControl sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              type="submit"
              startDecorator={<MoneyRecive />}
              loading={isPaymentLoading}
            >
              Receive
            </Button>
          </FormControl>
        </>
      ) : null}
      <FormControl sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Tooltip title="Show part payment option">
          <IconButton
            variant="solid"
            color="primary"
            onClick={() => setShowPartPaymentOption(!showPartPaymentOption)}
          >
            {showPartPaymentOption ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
          </IconButton>
        </Tooltip>
      </FormControl>
    </Box>
  );
};

export default PaymentForm;
