import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import { Chip, Stack } from "@mui/joy";
import { FeeHeadType } from "types/payments/payments";
import { z } from "zod";
import { Typography } from "@mui/material";
import EditableConcessionInput from "../FormsUi/Textfield/EditableConcessionInput";
import EditableDueAmountInput from "components/FormsUi/Textfield/EditableDueAmountInput";
type FeeHeadProps = {
    heads: FeeHeadType[];
    consessionAmount: number;
    dueAmount: number;
    onChangeHeads?: (updated: FeeHeadType[]) => void;
};

type EditableHead = FeeHeadType & {
    manuallyEdited?: boolean;
};

const FeeHeadersTable: React.FC<FeeHeadProps> = ({
    heads,
    consessionAmount,
    dueAmount,
    onChangeHeads,
}) => {
    const [editedHeads, setEditedHeads] = useState<EditableHead[]>([]);
    const [concessionValid, setConcessionValid] = useState(true);
    const [dueValid, setDueValid] = useState(true);

    // Zod schema to validate totals
    const validateTotals = (data: EditableHead[]) => {
        const concessionTotal = data.reduce((sum, h) => sum + (Number(h.concessionAmount) || 0), 0);
        const dueTotal = data.reduce((sum, h) => sum + (Number(h.dueAmount) || 0), 0);


        const schema = z.object({
            concessionTotal: z
                .number()
                .refine((val) => val === consessionAmount, {
                    message: `Concession total must be exactly ${consessionAmount}`,
                }),
            dueTotal: z.number().refine((val) => val === dueAmount, {
                message: `Due total must be exactly ${dueAmount}`,
            }),
        });

        const result = schema.safeParse({ concessionTotal, dueTotal });


        setConcessionValid(result.success || concessionTotal === consessionAmount);
        setDueValid(result.success || dueTotal === dueAmount);

        return result.success;
    };

    useEffect(() => {
        const distributed = distributeAmounts(heads, consessionAmount, dueAmount);
        setEditedHeads(distributed);
        if (onChangeHeads) onChangeHeads(distributed);
        validateTotals(distributed);
    }, [heads, consessionAmount, dueAmount]);

    const distributeAmounts = (
        heads: FeeHeadType[],
        concessionTotal: number,
        dueTotal: number
    ): EditableHead[] => {
        const sortedOldest = [...heads].sort(
            (a, b) => new Date(a.updatedAt ?? "").getTime() - new Date(b.updatedAt ?? "").getTime()
        );
        const sortedNewest = [...heads].sort(
            (a, b) => new Date(b.updatedAt ?? "").getTime() - new Date(a.updatedAt ?? "").getTime()
        );

        let remainingConcession = concessionTotal;
        const concessionMap = new Map<string, number>();
        for (let head of sortedOldest) {
            const assignable = Math.min(remainingConcession, head.amount);
            concessionMap.set(head.headerId, assignable);
            remainingConcession -= assignable;
        }

        let remainingDue = dueTotal;
        const dueMap = new Map<string, number>();
        for (let head of sortedNewest) {
            const assignable = Math.min(remainingDue, head.amount);
            dueMap.set(head.headerId, assignable);
            remainingDue -= assignable;
        }

        return heads.map((head) => ({
            ...head,
            concessionAmount: concessionMap.get(head.headerId) || 0,
            dueAmount: dueMap.get(head.headerId) || 0,
            manuallyEdited: false,
        }));
    };

    const handleInputChange = (
        headerId: string,
        field: "concessionAmount" | "dueAmount",
        value: number
    ) => {
        if (value < 0) return; // Prevent negative values
        const updated = editedHeads.map((item) =>
            item.headerId === headerId
                ? { ...item, [field]: value, manuallyEdited: true }
                : item
        );
        setEditedHeads(updated);
        if (onChangeHeads) onChangeHeads(updated);
        validateTotals(updated);
    };

    const getTotal = (field: "concessionAmount" | "dueAmount") =>
        editedHeads.reduce((sum, h) => sum + (Number(h[field]) || 0), 0);

    const feeHeadColumns = [
        {
            title: "Sl.",
            field: "sl",
            render: (_rowData: any) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <span>{_rowData.tableData.id + 1}.</span>
                </Stack>
            ),
            cellStyle: { width: "50px" },
            headerStyle: { width: "50px" },
        },
        { title: "Installment", field: "installment" },
        { title: "Head Name", field: "headName" },
        {
            title: "Amount", field: "amount", render: (rowData: EditableHead) => (
                <Typography
                    variant="body2"
                    sx={{ color: "#000", fontWeight: "bold" }}
                >
                    ₹{rowData.amount}
                </Typography>
            )
        },
        {
            title: "Concession",
            field: "concessionAmount",
            render: (rowData: EditableHead) => (

                <>
                    <EditableConcessionInput
                        value={rowData.concessionAmount}
                        onChange={(val) =>
                            handleInputChange(rowData.headerId, "concessionAmount", val)
                        }
                        error={!concessionValid || rowData.concessionAmount < 0}
                        helperText={
                            rowData.concessionAmount < 0
                                ? "Cannot be negative"
                                : !concessionValid
                                    ? "Invalid"
                                    : ""
                        }
                    />

                </>
            )
        },
    ];

    if (dueAmount > 0) {
        feeHeadColumns.push({
            title: "Due",
            field: "dueAmount",
            render: (rowData: EditableHead) => (
                <>
                    <EditableDueAmountInput
                        value={rowData.dueAmount}
                        onChange={(val) =>
                            handleInputChange(rowData.headerId, "dueAmount", val)
                        }
                        error={!dueValid || rowData.dueAmount < 0}
                        helperText={
                            rowData.dueAmount < 0
                                ? "Cannot be negative"
                                : !dueValid
                                    ? "Invalid"
                                    : ""
                        }
                    />

                </>
            ),
        });
    }

    return (
        <>
            <MaterialTable
                style={{
                    display: "grid",
                    overflow: "hidden",
                    borderLeft: "1px solid oklch(.905 .013 255.508)",
                    borderRight: "1px solid oklch(.905 .013 255.508)",
                    borderTop: "1px solid oklch(.905 .013 255.508)",
                    borderRadius: "10px 10px 0 0",
                    boxShadow: "none",
                }}
                columns={feeHeadColumns}
                data={editedHeads}
                title="Fee Head List"
                options={{
                    grouping: false,
                    padding: "dense",
                    search: false,
                    paging: false,
                    headerStyle: {
                        backgroundColor: "#5d87ff",
                        color: "#FFF",
                    },
                }}
            />
            {/* Custom Footer for Summation */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 32,
                padding: '8px 24px',
                background: '#f5f5f5',
                border: "1px solid oklch(.905 .013 255.508)",
                borderTop: 'none',
                borderBottomLeftRadius: 10,
                borderBottomRightRadius: 10,
                fontWeight: '400',
                fontSize: 15,
            }}>
                <span >Total: ₹{editedHeads.reduce((sum, h) => sum + (Number(h.amount) || 0), 0)}</span>
                <span style={{ color: `${!concessionValid ? "red" : "black"}` }}>₹{getTotal("concessionAmount")}</span>
                {dueAmount > 0 && (
                    <span style={{ color: `${!dueValid ? "red" : "black"}` }}>₹{getTotal("dueAmount")}</span>
                )}
            </div>
            {(!concessionValid || !dueValid) && (
                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ padding: "10px" }}>
                    {!concessionValid && (
                        <Chip color="danger" variant="soft" size="md">
                            Total Concession does not match the required value (₹{consessionAmount}).
                        </Chip>
                    )}
                    {!dueValid && (
                        <Chip color="danger" variant="soft" size="md">
                            Total Due does not match the required value (₹{dueAmount}).
                        </Chip>
                    )}
                </Stack>
            )}
        </>
    );
};

export default React.memo(FeeHeadersTable);
