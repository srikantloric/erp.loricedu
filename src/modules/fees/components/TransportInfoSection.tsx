import { InfoOutlined, Pageview } from "@mui/icons-material"
import { Box, CircularProgress, Stack, Typography } from "@mui/joy"
import { useFeeCollection } from "../context/FeeCollectionContext"
import TransportIcon from "assets/bus-stop-icon.png"
function TransportInfoSection() {

    const { transport } = useFeeCollection()
    if (!transport) {
        return <CircularProgress />
    }

    return (
        <Box>
            <Typography level="title-lg" startDecorator={<InfoOutlined />} color="primary">Transport Details</Typography>
            <Box sx={{ border: "1px solid oklch(.900 .013 255.508)", borderRadius: "10px", padding: "8px", display: "flex", mt: 1, gap: 1, }}>
                <img src={TransportIcon} alt="Transport" width={50} height={50} />
                <Stack direction={"row"} spacing={2} justifyContent={"space-between"} sx={{ flex: 1 }}>
                    <Stack direction={"column"}>
                        <Typography level="body-sm">Transport Pickup Point</Typography>
                        <Typography
                            level="title-lg"
                            onClick={() => alert('Van 1 clicked')}
                            sx={{ cursor: 'pointer' }}

                            endDecorator={<Pageview sx={{ mt: 0.5 }} color="primary" />}
                        >
                            {transport?.pickupPointName || "N/A"}
                        </Typography>
                    </Stack>
                    <Stack direction={"column"}>
                        <Typography level="body-sm">Distance From School</Typography>
                        <Typography level="title-lg" >{transport?.distance}KM</Typography>
                    </Stack>
                    <Stack direction={"column"}>
                        <Typography level="body-sm">Vehicle</Typography>
                        <Typography
                            level="title-lg"
                            onClick={() => alert('Van 1 clicked')}
                            sx={{ cursor: 'pointer' }}
                            // color="primary"
                            endDecorator={<Pageview sx={{ mt: 0.5 }} color="primary" />}
                        >
                            {transport?.vehicleName || "N/A"}
                        </Typography>
                    </Stack>
                    <Stack direction={"column"}>
                        <Typography level="body-sm">Driver</Typography>
                        <Typography level="title-lg" >{transport?.driverName || "N/A"} </Typography>
                    </Stack>
                    <Stack direction={"column"}>
                        <Typography level="body-sm">Transport Fee</Typography>
                        <Typography level="title-lg" >₹{transport?.monthlyCharge || "N/A"}</Typography>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    )
}

export default TransportInfoSection