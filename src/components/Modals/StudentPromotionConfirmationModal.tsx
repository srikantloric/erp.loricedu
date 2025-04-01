import { Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, ModalDialog } from "@mui/joy"
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";


type ModalProps = {
    open: boolean,
    setModalOpen: (value: boolean) => void,
    handlePromoteStudents: () => void
}

const StudentPromotionConfirmationModal: React.FC<ModalProps> = ({ open, setModalOpen, handlePromoteStudents }) => {
    return (
        <Modal open={open} onClose={() => setModalOpen(false)}>
            <ModalDialog variant="outlined" role="alertdialog">
                <DialogTitle>
                    <WarningRoundedIcon />
                    Confirmation
                </DialogTitle>
                <Divider />
                <DialogContent>
                    Are you sure you want to promote selected students?
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="solid"
                        color="success"
                        onClick={() => {
                            handlePromoteStudents()
                            setModalOpen(false)
                        }}
                    >
                        Confirm Promotion
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
    )
}

export default StudentPromotionConfirmationModal