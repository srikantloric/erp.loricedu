import { DialogContent, DialogTitle, Modal, ModalDialog } from "@mui/joy"

interface FollowUpModalProps {
    open: boolean;
    onClose: () => void;
    
}

export function FollowUpModal({ open, onClose }: FollowUpModalProps) {

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog sx={{ width: 800, maxWidth: '95vw', p: 3, maxHeight: '90vh', overflow: 'auto' }}>
                <DialogTitle>Add New Faculty</DialogTitle>
                <DialogContent>
                </DialogContent>
            </ModalDialog>
        </Modal>
    )
}
