import React from 'react';
import { Box, Checkbox, Typography } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';

interface MonthCardProps {
    label: string;
    status: string;
    onClick?: () => void;
}

const MonthCard: React.FC<MonthCardProps> = ({ label, status, onClick }) => {
    return (
        <Box
            sx={{
                position: 'relative',
                width: 120,
                height: 60,
                border: '2px solid #e0e0e0',
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'start',
                justifyContent: 'center',
                backgroundColor: '#fff',
                overflow: 'hidden',
                p: 2
            }}
        >
            {/* Ribbon */}
            {status && (
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        right: 0,
                        width: "100px",
                        height: "50px",
                        backgroundColor: status === 'Paid' ? '#4caf50' : status === 'Added' ? '#2196f3' : '#f44336',
                        color: '#fff',
                        fontSize: 14,
                        fontWeight: 'bold',
                        transform: 'translate(37%, 70%) rotate(45deg)',
                        transformOrigin: 'top right',
                        display: 'flex',
                        alignItems: "end",
                        justifyContent: 'center',
                        zIndex: 2,

                    }}
                >
                    {status}
                </Box>
            )}

            {/* Checkbox */}
            <Checkbox
                checked={status === 'Paid' || status === 'Added'}
                disabled={status === 'Paid'} // Disable if status is "Paid"
                onClick={onClick} // Handle checkbox click
                icon={
                    <CheckBoxOutlineBlankIcon
                        sx={{
                            fontSize: 25,
                            stroke: '#9e9e9e',
                            strokeWidth: 0.1,
                        }}
                    />
                }
                checkedIcon={
                    <CheckBoxIcon
                        sx={{
                            fontSize: 25,
                        }}
                    />
                }
                sx={{
                    padding: 0,
                }}

            />

            {/* Label Below Checkbox */}
            <Typography variant="subtitle1" sx={{ fontSize: 16, ml: .2 }}>
                {label}
            </Typography>
        </Box>
    );
};

export default MonthCard;
