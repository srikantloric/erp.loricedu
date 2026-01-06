import { Chip, Typography } from "@mui/joy";
import EditableConcessionInput from "components/FormsUi/Textfield/EditableConcessionInput";
import EditableDueAmountInput from "components/FormsUi/Textfield/EditableDueAmountInput";
import { FeeHead } from "../types/FeeHeads";

type ColumnBuilderProps = {
  consessionAmount: number;
  currentDueAmount: number;
  onChangeHead: (
    uniqueKey: string,
    field: "concessionAmount" | "dueAmount",
    value: number
  ) => void;
};

export function buildFeeHeadColumns({
  onChangeHead
}: ColumnBuilderProps) {
  const columns: any[] = [
    {
      title: "Month",
      field: "month",
      render: (row: FeeHead) => {
        if (row.headType === "misc" && !row.month) {
          return <Chip size="sm" color="warning" variant="soft">General</Chip>;
        }

        const [year, month] = (row.month ?? "").split("-");

        const monthNames: any = {
          "01": "January",
          "02": "February",
          "03": "March",
          "04": "April",
          "05": "May",
          "06": "June",
          "07": "July",
          "08": "August",
          "09": "September",
          "10": "October",
          "11": "November",
          "12": "December",
        };

        return `${monthNames[month]} ${year}`;
      }
    },

    {
      title: "Type",
      field: "headType",
      render: (row: FeeHead) => {
        const type = row.headType ?? "regular";  // fallback if undefined

        const labelMap: Record<string, string> = {
          regular: "Regular",
          misc: "Misc",
          previous_due: "Prev Due",
        };

        const colorMap: Record<string, any> = {
          regular: "primary",
          misc: "warning",
          previous_due: "danger",
        };

        return (
          <Chip size="sm" color={colorMap[type]} variant="soft">
            {labelMap[type]}
          </Chip>
        );
      }
    },

    { title: "Head", field: "headName" },

    {
      title: "Amount",
      field: "amount",
      render: (row: FeeHead) => (
        <Typography sx={{ fontWeight: "bold" }}>₹{row.amount}</Typography>
      )
    },
    {
      title: "Concession",
      field: "concessionAmount",
      render: (row: FeeHead) => (
        <EditableConcessionInput
          value={row.concessionAmount}
          onChange={(val) => onChangeHead(row.id, "concessionAmount", val)}
        />
      )
    },
    {
      title: "Due",
      field: "dueAmount",
      render: (row: FeeHead) => (
        <EditableDueAmountInput
          value={row.dueAmount}
          onChange={(val) => onChangeHead(row.id, "dueAmount", val)}
        />
      )
    }
  ];

  return columns;
}
