import {
  Box,
  RadioGroup,
  Radio
} from "@mui/joy";
import { useState } from "react";
import DailyAttendance from "./attendancePeriod/DailyAttendance";
import MonthlyAttendance from "./attendancePeriod/MonthlyAttendance";


function AttendanceByClass() {

  const [frequency, setFrequency] = useState('Daily');


  return (
    <Box
      sx={{
        border: "1px solid oklch(.900 .013 255.508)",
        borderRadius: "10px",
        padding: 4,
      }}
    >
      <Box
        component="form"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <RadioGroup
            orientation="horizontal"
            aria-labelledby="segmented-controls-example"
            name="duration"
            value={frequency}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setFrequency(event.target.value)
            }
            sx={{
              minHeight: 48,
              padding: '4px',
              borderRadius: '12px',
              bgcolor: 'neutral.softBg',
              '--RadioGroup-gap': '4px',
              '--Radio-actionRadius': '8px',
            }}
          >
            {['Daily',  'Monthly'].map((item) => (
              <Radio
                key={item}
                color="neutral"
                value={item}
                disableIcon
                label={item}
                variant="plain"
                sx={{ px: 2, alignItems: 'center' }}
                slotProps={{
                  action: ({ checked }) => ({
                    sx: {
                      ...(checked && {
                        bgcolor: 'background.surface',
                        boxShadow: 'sm',
                        '&:hover': {
                          bgcolor: 'background.surface',
                        },
                      }),
                    },
                  }),
                }}
              />
            ))}
          </RadioGroup>
        </Box>
      </Box>

      {frequency === 'Daily' && <DailyAttendance />}
      {frequency ==='Monthly' && <MonthlyAttendance/>}


    </Box>
  );
}

export default AttendanceByClass;
