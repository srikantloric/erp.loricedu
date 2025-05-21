import MaterialTable from "@material-table/core";
import { Checkbox, Input, Stack } from "@mui/joy";

function FeeHeadersTable() {
    const feeHeadColumns = [
        {
            title: "Sl.",
            field: "sl",
            cellStyle: {
                width: '50px', // Fixed width
                maxWidth: '50px',
                minWidth: '50px',

            },
            headerStyle: {
                width: '50px',
                maxWidth: '50px',
                minWidth: '50px',

            }
            , render: (rowData: any) => (
                <Stack direction="row" spacing={1} alignItems="center">
                    <Checkbox checked/>
                    <span>{rowData.tableData.id + 1}.</span>
                </Stack>
            )
        },
        { title: "Installment", field: "installment" },
        { title: "Head Name", field: "headName" },
        { title: "Amount", field: "amount" },
        {
            title: "Consession",
            field: "consession",
            render: (rowData: any) => (
                <Input
                    size="sm"
                    sx={{ width: 100 }}
                    value={0}
                    onChange={e => {
                        rowData.dueAmount = e.target.value;
                    }}
                    placeholder="Enter Due"
                    type="number"
                />
            ),
            cellStyle: {
                backgroundColor: '#4CAF50',
                color: '#FFF'
            },

        },
        {
            title: "Due",
            field: "dueAmount",
            render: (rowData: any) => (
                <Input
                    size="sm"
                    sx={{ width: 100 }}
                    value={0}
                    onChange={e => {
                        rowData.dueAmount = e.target.value;
                    }}
                    placeholder="Enter Due"
                    type="number"
                />
            ),
            cellStyle: {
                backgroundColor: '#F44336',
                color: '#FFF'
            },

        },

    ];

    const feeHeadData = [
        { sl: 1, installment: "2023-24", headName: "Tuition Fee", amount: 2000, consession: 0 },
        { sl: 2, installment: "2023-24", headName: "Transport Fee", amount: 400, consession: 0 },
        { sl: 3, installment: "2023-24", headName: "Misc. Fee", amount: 100, consession: 0 },
        { sl: 4, installment: "2023-24", headName: "Exam Fee", amount: 500, consession: 0 },
    ];

    return (
        <MaterialTable
            style={{
                display: "grid",
                overflow: "hidden",
                border: "1px solid oklch(.905 .013 255.508)",
                borderRadius: "10px",
                boxShadow: "none",
            }}
            columns={feeHeadColumns}
            data={feeHeadData}
            title="Fee Head List"
            options={{
                grouping: false,
                padding: 'dense',
                search: false,
                paging: false,
                headerStyle: {
                    backgroundColor: "#5d87ff",
                    color: "#FFF",
                },
            }}


        />
    );
}

export default FeeHeadersTable;
