import { Modal, ModalClose, ModalDialog, Stack, Box, Typography, Checkbox, FormControl, FormLabel, Input, Button } from '@mui/joy';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useState } from 'react';

export type ColumnConfig = {
    field: string;
    title: string;
    selected: boolean;
    isCustom?: boolean;
};

type ColumnSelectorProps = {
    open: boolean;
    onClose: () => void;
    columns: ColumnConfig[];
    onColumnsChange: (columns: ColumnConfig[]) => void;
};

export default function ColumnSelector({ open, onClose, columns, onColumnsChange }: ColumnSelectorProps) {
    const [customField, setCustomField] = useState('');
    const [customTitle, setCustomTitle] = useState('');

    const handleToggle = (field: string) => {
        const newColumns = columns.map(col =>
            col.field === field ? { ...col, selected: !col.selected } : col
        );
        onColumnsChange(newColumns);
    };

    const handleAddCustomField = () => {
        if (!customField.trim() || !customTitle.trim()) return;
        // Prevent duplicate custom fields
        if (columns.some(col => col.field === customField)) return;
        onColumnsChange([
            ...columns,
            {
                field: customField,
                title: customTitle,
                selected: true,
                isCustom: true
            }
        ]);
        setCustomField('');
        setCustomTitle('');
    };

    const handleRemoveCustomField = (field: string) => {
        onColumnsChange(columns.filter(col => col.field !== field));
    };

    // Always show an empty input for adding more custom columns if at least one custom column is selected
    const showAddCustomInput = columns.filter(col => col.isCustom && col.selected).length > 0 || columns.filter(col => col.isCustom).length === 0;

    return (
        <Modal open={open} onClose={onClose}>
            <ModalDialog size="lg">
                <ModalClose />
                <Typography level="h4">Select Columns</Typography>
                <Box sx={{ mt: 2 }}>
                    {/* Default columns */}
                    <Stack spacing={1}>
                        {columns.filter(col => !col.isCustom).map(col => (
                            <Stack direction="row" alignItems="center" spacing={1} key={col.field}>
                                <Checkbox
                                    checked={col.selected}
                                    onChange={() => handleToggle(col.field)}
                                />
                                <Typography>{col.title}</Typography>
                            </Stack>
                        ))}
                    </Stack>

                    {/* Custom fields section */}
                    <Box sx={{ mt: 3 }}>
                        <Typography level="title-md">Custom Fields</Typography>
                        {columns.filter(col => col.isCustom).map(col => (
                            <Stack direction="row" alignItems="center" spacing={1} key={col.field} sx={{ mt: 1 }}>
                                <Checkbox
                                    checked={col.selected}
                                    onChange={() => handleToggle(col.field)}
                                />
                                <Typography>{col.title}</Typography>
                                <Button
                                    variant="outlined"
                                    color="danger"
                                    onClick={() => handleRemoveCustomField(col.field)}
                                    startDecorator={<DeleteIcon />}
                                >
                                    Remove
                                </Button>
                            </Stack>
                        ))}
                        {showAddCustomInput && (
                            <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                                <FormControl>
                                    <FormLabel>Field Name</FormLabel>
                                    <Input
                                        value={customField}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomField(e.target.value)}
                                        placeholder="e.g., score"
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Display Title</FormLabel>
                                    <Input
                                        value={customTitle}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomTitle(e.target.value)}
                                        placeholder="e.g., Test Score"
                                    />
                                </FormControl>
                                <Button
                                    onClick={handleAddCustomField}
                                    disabled={!customField || !customTitle}
                                    startDecorator={<AddIcon />}
                                    sx={{ mt: 3.5 }}
                                >
                                    Add Field
                                </Button>
                            </Stack>
                        )}
                    </Box>
                </Box>
            </ModalDialog>
        </Modal>
    );
}
