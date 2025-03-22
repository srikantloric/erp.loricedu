import { Button, Divider, Modal, Sheet, Stack, Typography } from "@mui/joy";
import { useSearchDialog } from "context/SearchDialogContext";
import {
  AddSquare,
  Bubble,
  Cardano,
  Eye,
  FingerCricle,
  MoneyRecive,
  Notepad2,
  SearchNormal1,
} from "iconsax-react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function SearchDialog() {
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { isOpen, closeDialog } = useSearchDialog();
  useEffect(() => {
    if (isOpen && inputRef.current) {
      console.log(inputRef.current);
      inputRef.current.focus();
    }
  }, [isOpen]);

  const redirectToPage = (page: string) => {
    navigate(page);
    closeDialog();
  };

  return (
    <Modal
      aria-labelledby="modal-title"
      aria-describedby="modal-desc"
      open={isOpen}
      onClose={() => closeDialog()}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        "& .MuiSheet-root:focus": {
          outline: "none",
        },

        "& .MuiModal-backdrop": {
          backdropFilter: "blur(3px)", // Adjust the blur value here
        },
      }}
    >
      <Sheet
        variant="outlined"
        sx={{
          width: "570px",
          height: "80%",
          borderRadius: "md",

          boxShadow: "lg",
        }}
      >
        <Stack
          justifyContent={"space-between"}
          direction={"row"}
          sx={{ p: "1rem" }}
          alignItems={"center"}
        >
          <SearchNormal1 size={18} color="var(--bs-primary)" />
          <input
            style={{
              border: "none",
              flex: 1,
              marginRight: "0.5rem",
              marginLeft: "0.5rem",
              height: "30px",
              padding: "8px",
              backgroundColor: "#FBFCFE",
              outline: "none",
              fontSize: "16px",
            }}
            ref={inputRef}
            autoFocus={true}
            type="text"
            placeholder="What are you looking for ?"
          />
          <Button
            variant="soft"
            size="sm"
            color="neutral"
            onClick={() => closeDialog()}
            sx={{
              height: "0.2rem",
              "&.MuiButton-root": {
                fontSize: "0.7rem",
              },
            }}
          >
            ESC
          </Button>
        </Stack>
        <Divider />
        <Stack direction="column" padding="1rem">
          <Stack direction="row" justifyContent="space-between" gap="1rem">
            <Stack direction="column" flex={1}>
              <Typography
                level="body-sm"
                fontWeight="500"
                sx={{
                  m: "0.6rem",
                  color: "var(--bs-gray-500)",
                  fontSize: "13px",
                }}
              >
                PAYMENTS
              </Typography>
              <Button
                onClick={() => redirectToPage("/FeeManagement")}
                sx={{
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <MoneyRecive
                    color="rgb(0, 115, 230)"
                    opacity="0.6"
                    size="20"
                  />
                }
              >
                Recieve Payemts
              </Button>
              <Button
              onClick={() => redirectToPage("/Accountings")}
                sx={{
                  mt: "0.5rem",
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <Notepad2 color="rgb(0, 115, 230)" opacity="0.6" size="20" />
                }
              >
                Generate Challans
              </Button>
            </Stack>

            <Stack direction="column" flex={1}>
              <Typography
                level="title-sm"
                fontWeight="500"
                sx={{
                  m: "0.6rem",
                  color: "var(--bs-gray-500)",
                  fontSize: "13px",
                }}
              >
                ADMISSION
              </Typography>
              <Button
                sx={{
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <AddSquare color="rgb(0, 115, 230)" opacity="0.6" size="20" />
                }
              >
                Student Admission
              </Button>
              <Button
                sx={{
                  mt: "0.5rem",
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <Bubble color="rgb(0, 115, 230)" opacity="0.6" size="20" />
                }
              >
                Admission Enquiry
              </Button>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            justifyContent="space-between"
            gap="1rem"
            mt="1rem"
          >
            <Stack direction="column" flex={1}>
              <Typography
                level="body-sm"
                fontWeight="500"
                sx={{
                  m: "0.6rem",
                  color: "var(--bs-gray-500)",
                  fontSize: "13px",
                }}
              >
                REPORTS
              </Typography>
              <Button
                sx={{
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <MoneyRecive
                    color="rgb(0, 115, 230)"
                    opacity="0.6"
                    size="20"
                  />
                }
              >
                Fee Vouchers
              </Button>
              <Button
                sx={{
                  mt: "0.5rem",
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <Notepad2 color="rgb(0, 115, 230)" opacity="0.6" size="20" />
                }
              >
                Daily Report
              </Button>
            </Stack>

            <Stack direction="column" flex={1}>
              <Typography
                level="title-sm"
                fontWeight="500"
                sx={{
                  m: "0.6rem",
                  color: "var(--bs-gray-500)",
                  fontSize: "13px",
                }}
              >
                ATTENDANCE
              </Typography>
              <Button
                sx={{
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <Eye color="rgb(0, 115, 230)" opacity="0.6" size="20" />
                }
              >
                View Attendance
              </Button>
              <Button
                sx={{
                  mt: "0.5rem",
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <Cardano color="rgb(0, 115, 230)" opacity="0.6" size="20" />
                }
              >
                Manual Attendance
              </Button>
              <Button
                sx={{
                  mt: "0.5rem",
                  flex: 1,
                  backgroundColor: "rgba(246, 247, 248, 0.4)",
                  border: "1px solid rgba(232, 234, 238, 0.5)",
                  textAlign: "left",
                  "&.MuiButton-root": {
                    height: "42px",
                    justifyContent: "flex-start",
                    padding: "12px",
                    color: "rgb(0, 107, 214)",
                  },
                  "&.MuiButton-root:hover": {
                    border: "1px solid var(--bs-primary)",
                  },
                  "--Button-gap": "14px",
                }}
                color="primary"
                variant="outlined"
                size="sm"
                startDecorator={
                  <FingerCricle
                    color="rgb(0, 115, 230)"
                    opacity="0.6"
                    size="20"
                  />
                }
              >
                Smart Attendance
              </Button>
            </Stack>
          </Stack>
        </Stack>
      </Sheet>
    </Modal>
  );
}

export default SearchDialog;
