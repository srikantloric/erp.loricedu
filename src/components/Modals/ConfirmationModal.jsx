import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Modal,
  ModalDialog,
} from "@mui/joy";
import { Divider } from "@mui/material";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import React from "react";

function ConfirmationModal({ open, setModalOpen, handleStudentDelete ,deleteLoading}) {
  return (
    <Modal open={open} onClose={() => setModalOpen(false)}>
      <ModalDialog variant="outlined" role="alertdialog">
        <DialogTitle>
          <WarningRoundedIcon />
          Confirmation
        </DialogTitle>
        <Divider />
        <DialogContent>
          Are you sure you want to delete this student?
        </DialogContent>
        <DialogActions>
          <Button
            variant="solid"
            color="danger"
            loading={deleteLoading}
            onClick={handleStudentDelete}
          >
            Delete Student
          </Button>
          <Button
            variant="plain"
            color="neutral"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}

export default ConfirmationModal;
