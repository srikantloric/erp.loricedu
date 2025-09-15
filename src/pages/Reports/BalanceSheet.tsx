
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton";
import { Box, Button, Stack, Typography } from "@mui/joy";

//material ui 
import TouchAppIcon from '@mui/icons-material/TouchApp';
import { BalanceSheetType } from "types/student";
import { useState } from "react";
import { GenerateBalanceSheet } from "components/Reports/GenrateBalanceSheet";


function BalanceSheet() {

    const [pdfUrl, setPdfUrl] = useState<any>()
    const [loading, setLoading] = useState<boolean>(false)

    const sampleObjects: BalanceSheetType[] = [
        {
            tran_id: "HISJDO689JJ",
            tran_type: "credit",
            tran_name: "Monthly Fee",
            tran_desc: "This is monthly fee submited by student",
            tran_amount: "6000",
        },
        {
            tran_id: "HISJDO689JK",
            tran_type: "credit",
            tran_name: "Monthly Fee",
            tran_desc: "This is monthly fee submited by student",
            tran_amount: "3400",
        },
        {
            tran_id: "HISJDO689JL",
            tran_type: "debit",
            tran_name: "Bill payment",
            tran_desc: "This is Bill payment of software maintenance",
            tran_amount: "10000",
        },
    ];

    const generateBalanceSheet = async () => {
        setLoading(true)
        const pdfRes = await GenerateBalanceSheet(sampleObjects);
        setPdfUrl(pdfRes)
        setLoading(false)
    };

    return (
        <>

            <PageHeaderWithHelpButton
                title="Balance Sheet"
            />
            <Box sx={{ p: "10px", mt: "8px", border: "1px solid oklch(.929 .013 255.508)", borderRadius: "10px" }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    gap={1}
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <Box>
                        <Typography level="title-md">Due List</Typography>
                    </Box>
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems="center" gap={1.5}>
                        <Button
                            sx={{ ml: "8px" }}
                            startDecorator={<TouchAppIcon />}
                            onClick={generateBalanceSheet}
                            loading={loading}
                        >
                            Generate Report
                        </Button>
                    </Stack>
                </Stack>
            </Box>
            <br />
            <Stack sx={{ height: "100vh" }}>
                {pdfUrl &&
                    <iframe src={pdfUrl} height={"100%"} />
                }
                {!pdfUrl &&
                    <Stack sx={{ width: "100%", height: "60%", justifyContent: "center", alignItems: "center" }}>
                        <Typography>Click to <a style={{ color: "blue", cursor: "pointer" }} onClick={generateBalanceSheet}>Generate Report</a> button to generate balance sheet.</Typography>
                    </Stack>
                }
            </Stack>
        </>
    )
}
export default BalanceSheet