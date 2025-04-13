import { InfoOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Sheet,
  Switch,
  Textarea,
  Typography,
} from "@mui/joy";
import { useEffect, useRef, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

function RecieptConfigurations() {
  const [accountantName, setAccountantName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(new Image());
  const [updatingAccoutantName, setUpdatingAccountantName] =
    useState<boolean>(false);
  const [messageText, setMessageText] = useState("");
  const [showMessageOnReciept, setShowMessageOnReciept] =
    useState<boolean>(false);


    //Get Firebase DB instance
   const {db} = useFirebase();

  useEffect(() => {
    imageRef.current.src = "./recieptPreviewImg.jpg"; // Update with your image path
    imageRef.current.onload = () => {
      drawCanvas();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountantName, messageText]);

  const drawCanvas = () => {
    const canva = canvasRef.current;
    const canvas = canva!;
    const ctx = canvas.getContext("2d")!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(imageRef.current, 0, 0, canvas.width, canvas.height);

    ctx.font = "17px Poppins"; // Update font size and style as needed
    ctx.fillStyle = "#f33d2a";
    ctx.textAlign = "center"; // Update text color as needed
    ctx.fillText(accountantName, 488, 165);
    ctx.textAlign = "left"; // Update coordinates as needed
    ctx.fillText(messageText, 20, 250); // Update coordinates as needed
  };

  useEffect(() => {
    const fetchReceiptConfig = async () => {
      try {
        const receiptConfigRef = doc(db, "CONFIG", "RECIEPT_CONFIG");
        const receiptConfigSnap = await getDoc(receiptConfigRef);
  
        if (receiptConfigSnap.exists()) {
          setAccountantName(receiptConfigSnap.data()?.accountantName || "");
          drawCanvas();
        } else {
          enqueueSnackbar(
            "Error occurred while fetching initial configuration for receipt!",
            { variant: "error" }
          );
        }
      } catch (error) {
        console.error("Error fetching receipt config:", error);
        enqueueSnackbar("Error fetching receipt configuration!", { variant: "error" });
      }
    };
  
    fetchReceiptConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const handleChangeAccountantName = async () => {
    if (!accountantName.trim()) {
      enqueueSnackbar("Please enter accountant name!", { variant: "error" });
      return;
    }
  
    try {
      setUpdatingAccountantName(true);
      const receiptConfigRef = doc(db, "CONFIG", "RECIEPT_CONFIG");
  
      await setDoc(receiptConfigRef, {
        accountantName,
      },{merge:true});
  
      enqueueSnackbar("Updated Successfully!", { variant: "success" });
    } catch (error) {
      console.error("Error updating accountant name:", error);
      enqueueSnackbar("Error while updating database!", { variant: "error" });
    } finally {
      setUpdatingAccountantName(false);
    }
  };

  return (
    <Box>
      <Sheet
        sx={{
          display: "flex",
          justifyContent: "space-between",
          p: "1rem",
          borderRadius: "0.5rem",
        }}
        variant="outlined"
      >
        <Grid container gap="1rem">
          <Grid xs={12} md={5}>
            <Card
              variant="plain"
              sx={{
                maxHeight: "max-content",
              }}
            >
              <Typography level="title-sm" startDecorator={<InfoOutlined />}>
                Change Reciept Accountant Name
              </Typography>
              <Divider inset="none" />
              <CardContent
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(80px, 1fr))",
                  gap: 1.5,
                }}
              >
                <FormControl sx={{ gridColumn: "1/-1" }}>
                  <FormLabel>Accountant Name</FormLabel>
                  <Input
                    value={accountantName}
                    required
                    onChange={(e) => setAccountantName(e.target.value)}
                  />
                </FormControl>

                <FormControl
                  orientation="horizontal"
                  sx={{ width: 400, justifyContent: "space-between" }}
                >
                  <div>
                    <FormLabel>Show Meesage</FormLabel>
                    <FormHelperText sx={{ mt: 0 }}>
                      It enables and disables the visibility of message.
                    </FormHelperText>
                  </div>
                  <Switch
                    checked={showMessageOnReciept}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setShowMessageOnReciept(event.target.checked)
                    }
                    color={showMessageOnReciept ? "success" : "neutral"}
                    variant={showMessageOnReciept ? "solid" : "outlined"}
                    endDecorator={showMessageOnReciept ? "On" : "Off"}
                    slotProps={{
                      endDecorator: {
                        sx: {
                          minWidth: 24,
                        },
                      },
                    }}
                  />
                </FormControl>

                <FormControl sx={{ gridColumn: "1/-1" }}>
                  <FormLabel>Message Text</FormLabel>

                  <Textarea
                    minRows={2}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </FormControl>

                <CardActions sx={{ gridColumn: "1/-1" }}>
                  <Button
                    variant="solid"
                    color="primary"
                    loading={updatingAccoutantName}
                    onClick={handleChangeAccountantName}
                  >
                    Apply
                  </Button>
                </CardActions>
              </CardContent>
            </Card>
          </Grid>
          <Grid xs={12} md={6}>
            <Box>
              <Typography level="title-md" mb={"0.5rem"}>
                Reciept Preview
              </Typography>
              <canvas
                ref={canvasRef}
                width={600}
                style={{
                  border:"1px solid var(--bs-gray-400)",
                  // boxShadow: "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 2px 6px 2px"
                }}
                height={300}
              />
            </Box>
          </Grid>
        </Grid>
      </Sheet>
    </Box>
  );
}

export default RecieptConfigurations;
