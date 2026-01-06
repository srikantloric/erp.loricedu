import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import { FeeHead } from "../types/FeeHeads";
import { buildFeeHeadColumns } from "./FeeHeadersColumns";

type FeeHeadProps = {
    heads: FeeHead[];
    consessionAmount: number;
    currentDueAmount: number;
    onChangeHeads?: (updated: FeeHead[]) => void;
};

type EditableHead = FeeHead & {
    locked?: boolean;
};
const FeeHeadersTable: React.FC<FeeHeadProps> = ({
    heads,
    consessionAmount,
    currentDueAmount,
    onChangeHeads,
}) => {

    const [editedHeads, setEditedHeads] = useState<EditableHead[]>([]);



    const autoDistribute = (inputHeads: EditableHead[]) => {
        // Deep clone
        let headsCopy = inputHeads.map(h => ({ ...h }));

        const locked = headsCopy.filter((h) => h.locked);
        const unlocked = headsCopy.filter((h) => !h.locked);

        let assignedConcession = locked.reduce((s, h) => s + (h.concessionAmount || 0), 0);
        let assignedDue = locked.reduce((s, h) => s + (h.dueAmount || 0), 0);

        let remainingConcession = consessionAmount - assignedConcession;
        let remainingDue = currentDueAmount - assignedDue;

        // --------------------------
        // Distribute Concession Oldest → Newest
        // --------------------------
        const concessionTargets = unlocked
            .map((h) => ({ ...h }));


        for (let head of concessionTargets) {
            const assign = Math.min(remainingConcession, head.amount);
            head.concessionAmount = assign;
            remainingConcession -= assign;
        }

        // --------------------------
        // Distribute Due Newest → Oldest
        // --------------------------
        const dueTargets = unlocked
            .map((h) => ({ ...h }))
            .reverse();



        for (let head of dueTargets) {
            const assign = Math.min(remainingDue, head.amount);
            head.dueAmount = assign;
            remainingDue -= assign;
        }

        const merged = headsCopy.map((h) => {
            const c = concessionTargets.find((x) => x.id === h.id);
            const d = dueTargets.find((x) => x.id === h.id);

            let concession = c?.concessionAmount ?? h.concessionAmount ?? 0;
            let due = d?.dueAmount ?? h.dueAmount ?? 0;

            const maxAllowed = h.amount;

            // ----------------------------------
            // RULE: concession + due ≤ amount
            // ----------------------------------
            if (concession + due > maxAllowed) {
                if (c) {
                    // Concession was updated → adjust due
                    due = maxAllowed - concession;
                } else if (d) {
                    // Due was updated → adjust concession
                    concession = maxAllowed - due;
                } else {
                    // Fallback safeguard
                    due = 0;
                }
            }

            //Paid Amount
            const pAmount = h.amount - (concession + due)

            return {
                ...h,
                concessionAmount: concession,
                dueAmount: due,
                paidAmount: pAmount
            };
        });

        setEditedHeads(merged);
        onChangeHeads?.(merged);
    };


    // ---------------------------------------------
    // On initial load or when amounts change → recalc
    // ---------------------------------------------
    useEffect(() => {
        const fresh = heads.map((h) => ({
            ...h,
            locked: false,
            concessionAmount: h.concessionAmount || 0,
            dueAmount: h.dueAmount || 0,

        }));

        autoDistribute(fresh);
    }, [heads, consessionAmount, currentDueAmount]);

    // ---------------------------------------------
    // When user manually edits one cell → lock that row
    // ---------------------------------------------
    const handleInputChange = (id: string, field: "concessionAmount" | "dueAmount", value: number) => {
        const updated = editedHeads.map((h) =>
            h.id === id
                ? { ...h, [field]: value, locked: true }
                : h
        );

        autoDistribute(updated);
    };


    const columns = buildFeeHeadColumns({
        consessionAmount,
        currentDueAmount,
        onChangeHead: handleInputChange
    });

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
                columns={columns}
                data={editedHeads}
                title="Fee Head List"
                options={{
                    search: false,
                    paging: false,
                    toolbar: false,
                    headerStyle: {
                        backgroundColor: "#5d87ff",
                        color: "#fff",
                    },

                    padding: "dense",
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
            </div>

        </>
    );
};

export default React.memo(FeeHeadersTable);
