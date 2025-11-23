import { Box, Button, Card, Chip, Divider, Stack, Typography } from "@mui/joy"
import PageHeaderWithHelpButton from "components/Breadcrumbs/PageHeaderWithHelpButton"


import FollowUpImage from "../../assets/follow-up.png"
import { KeyboardArrowRight } from "@mui/icons-material"
import { Book, Moneys } from "iconsax-react"
import { useNavigate } from "react-router-dom"

function FollowUp() {

    const navigate = useNavigate();

    return (
        <>
            <PageHeaderWithHelpButton title="Follow Up With the Parents" />
            <br />
            <Stack direction={"row"} 
            sx={{ border: "1px solid oklch(.900 .013 255.508)", p: "14px", borderRadius: "10px", justifyContent: "space-between" }}
            >
                <Stack direction={"row"} sx={{ alignItems: "center", height: "140px" }}>
                    <img src={FollowUpImage} alt="follow-up-image" height={"110%"} />
                    <Stack>
                        <Typography level="title-lg" sx={{ fontSize: "24px", mb: "6px" }} >How to use this page ?</Typography>
                        <span>
                            1️⃣ 🔍 Search / Filter – Find the parent by name, admission number, or class.
                        </span>
                        <span>
                            2️⃣ 📄 View Details – Click to see contact info and past follow-ups.
                        </span>
                        <span>
                            3️⃣ 📝 Log Follow-Up – Add date, time, and conversation notes.
                        </span>
                        4️⃣ ✅ Update Status – Mark as Pending, Completed, or Next Follow-Up.
                    </Stack>
                </Stack>
                <Stack>
                    <Box
                        sx={{
                            display: "flex",
                            border: "1px solid var(--bs-gray-400)",
                            margin: "14px",
                            flex: 1,
                            borderRadius: "8px",
                            padding: "10px",
                            alignItems: "center",
                            justifyContent: "space-evenly",
                            gap: "2rem"
                        }}
                    >
                        <Stack direction="column" alignItems="center">
                            <Moneys size="26" color="#2ccce4" />
                            <Typography level="h4" mt={1}>
                                100
                            </Typography>
                            <Typography level="body-sm">Fee Dues Follow Up</Typography>
                        </Stack>
                        <Stack direction="column" alignItems="center">
                            <Book color="#37d67a" size="26" />
                            <Typography level="h4" mt={1}>
                                10
                            </Typography>
                            <Typography level="body-sm">Academics Follow Up</Typography>
                        </Stack>

                    </Box>
                </Stack>
            </Stack>
            <br />
            <Divider role="presentation" sx={{ '--Divider-childPosition': '2%' }}>
                <Chip variant="soft" color="neutral" size="sm">Follow Up For</Chip>
            </Divider>
            <Box
                sx={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
                    gap: 2,
                    mt: 1
                }}
            >
                <Card
                    size="sm"
                    variant="outlined"
                    sx={{ height: "100%" }}
                >
                    <Stack
                        direction={"row"}
                        justifyContent={"space-between"}
                        sx={{ height: "100%" }}
                    >
                        <Stack>
                            <Typography level="h4">Fee Due Follow Up</Typography>
                            <Typography level="body-sm">
                                Follow up with parents to get ETAs/Details of the payment.
                            </Typography>
                        </Stack>
                        <Button
                            variant="soft"
                            color="neutral"
                            endDecorator={<KeyboardArrowRight />}
                            sx={{ height: "100%" }}
                            onClick={() => navigate("fee-dues-follow-up")}
                        >
                            Check
                        </Button>
                    </Stack>
                </Card>

            </Box>
        </>
    )
}

export default FollowUp