import React, { useState } from 'react';
import { TextField, Button } from '@mui/material';

const FeeReceiptGenerator: React.FC = () => {
  const [studentName, setStudentName] = useState<string>('');
  const [feeAmount, setFeeAmount] = useState<string>('');

  const generateReceipt = () => {
    const queryParams = new URLSearchParams({
      studentName: studentName,
      feeAmount: feeAmount
    });

    const url = `${window.location.origin}/receipt?${queryParams.toString()}`;
    window.open(url, '_blank');
  };

  return (
    <div>
      <TextField
        label="Student Name"
        value={studentName}
        onChange={(e) => setStudentName(e.target.value)}
      />
      <TextField
        label="Fee Amount"
        value={feeAmount}
        onChange={(e) => setFeeAmount(e.target.value)}
      />
      <Button onClick={generateReceipt} variant="contained" color="primary">
        Generate Receipt
      </Button>
    </div>
  );
};

export default FeeReceiptGenerator;
