import React, { createContext, useContext, useState } from "react";
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';

import { Button, DialogActions, DialogContent, DialogTitle, Divider, Modal, ModalDialog } from "@mui/joy";

interface ConfirmOptions {
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmDialogContext = createContext<ConfirmContextType>({
    confirm: async () => false,
});

export const useConfirm = () => useContext(ConfirmDialogContext);

export const ConfirmDialogProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [options, setOptions] = useState<ConfirmOptions>({});
    const [resolver, setResolver] = useState<(v: boolean) => void>(() => { });

    const confirm = (options: ConfirmOptions): Promise<boolean> => {
        setOptions(options);
        setOpen(true);

        return new Promise<boolean>((resolve) => {
            setResolver(() => resolve);
        });
    };

    const handleClose = (result: boolean) => {
        setOpen(false);
        resolver(result);
    };

    return (
        <ConfirmDialogContext.Provider value={{ confirm }}>
            {children}
            <Modal open={open} onClose={() => handleClose(false)}>
                <ModalDialog variant="outlined" role="alertdialog">
                    <DialogTitle>
                        <WarningRoundedIcon />
                        {options.title ?? "Confirm"}
                    </DialogTitle>
                    <Divider />
                    <DialogContent>
                        {options.message ?? "Are you sure?"}
                    </DialogContent>
                    <DialogActions>
                        <Button variant="solid" color="danger" onClick={() => handleClose(false)}>
                            {options.cancelText ?? "Cancel"}
                        </Button>
                        <Button variant="plain" color="neutral" onClick={() => handleClose(true)}>
                            {options.confirmText ?? "Confirm"}
                        </Button>
                    </DialogActions>
                </ModalDialog>
            </Modal>
        </ConfirmDialogContext.Provider>
    );
};
