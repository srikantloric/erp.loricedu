import { Save } from "@mui/icons-material";
import {
  Button,
  Divider,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  Input,
  Sheet,
  Switch,
  Typography,
} from "@mui/joy";
import { useEffect, useState, useCallback, ChangeEvent, FormEvent } from "react";
import { enqueueSnackbar } from "notistack";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

interface MonthlyFee {
  class_1: number;
  class_2: number;
  class_3: number;
  class_4: number;
  class_5: number;
  class_6: number;
  class_7: number;
  class_8: number;
  class_9: number;
  class_10: number;
  class_11: number;
  class_12: number;
  class_13: number;
  class_14: number;
}

interface Config {
  defaultMonthlyFee: MonthlyFee;
  applyLateFine: boolean;
}

const initialMonthlyFee: MonthlyFee = {
  class_1: 0,
  class_2: 0,
  class_3: 0,
  class_4: 0,
  class_5: 0,
  class_6: 0,
  class_7: 0,
  class_8: 0,
  class_9: 0,
  class_10: 0,
  class_11: 0,
  class_12: 0,
  class_13: 0,
  class_14: 0,
};

function PaymentConfigurations() {
  const [config, setConfig] = useState<Config>({
    defaultMonthlyFee: initialMonthlyFee,
    applyLateFine: false,
  });

  //Get Firebase DB instance
  const {db} = useFirebase();

  useEffect(() => {
    const fetchPaymentConfig = async () => {
      try {
        const paymentConfigRef = doc(db, "CONFIG", "PAYMENT_CONFIG");
        const paymentConfigSnap = await getDoc(paymentConfigRef);
  
        if (paymentConfigSnap.exists()) {
          const data = paymentConfigSnap.data() as Config;
          setConfig((prev) => ({
            ...prev,
            defaultMonthlyFee: { ...prev.defaultMonthlyFee, ...data.defaultMonthlyFee },
            applyLateFine: data.applyLateFine,
          }));
        }
      } catch (error) {
        console.error("Error fetching payment config:", error);
      }
    };
  
    fetchPaymentConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>, key: keyof MonthlyFee) => {
    const value = parseInt(e.target.value) || 0;
    setConfig((prev) => ({
      ...prev,
      defaultMonthlyFee: {
        ...prev.defaultMonthlyFee,
        [key]: value,
      },
    }));
  };
  const handleOnDefaultFeeChange = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    try {
      const paymentConfigRef = doc(db, "CONFIG", "PAYMENT_CONFIG");
  
      await setDoc(paymentConfigRef, 
        { defaultMonthlyFee: config.defaultMonthlyFee }, 
        { merge: true }
      );
  
      enqueueSnackbar("Configuration has been successfully updated!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating config:", error);
      enqueueSnackbar("Error while updating config!", { variant: "error" });
    }
  };

  const onLateFineSwitchChange = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    
    setConfig((prev) => ({
      ...prev,
      applyLateFine: checked,
    }));
  
    try {
      const paymentConfigRef = doc(db, "CONFIG", "PAYMENT_CONFIG");
  
      await updateDoc(paymentConfigRef, {
        applyLateFine: checked,
      });
  
      enqueueSnackbar("Configuration has been successfully updated!", {
        variant: "success",
      });
    } catch (error) {
      console.error("Error updating config:", error);
      enqueueSnackbar("Error while updating config!", { variant: "error" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const renderInputFields = () => {
    const classLabels = [
      { label: "Pre-Nursery", key: "class_14" as keyof MonthlyFee },
      { label: "Nursery", key: "class_1" as keyof MonthlyFee },
      { label: "LKG", key: "class_2" as keyof MonthlyFee },
      { label: "UKG", key: "class_3" as keyof MonthlyFee },
      { label: "STD-1", key: "class_4" as keyof MonthlyFee },
      { label: "STD-2", key: "class_5" as keyof MonthlyFee },
      { label: "STD-3", key: "class_6" as keyof MonthlyFee },
      { label: "STD-4", key: "class_7" as keyof MonthlyFee },
      { label: "STD-5", key: "class_8" as keyof MonthlyFee },
      { label: "STD-6", key: "class_9" as keyof MonthlyFee },
      { label: "STD-7", key: "class_10" as keyof MonthlyFee },
      { label: "STD-8", key: "class_11" as keyof MonthlyFee },
      { label: "STD-9", key: "class_12" as keyof MonthlyFee },
      { label: "STD-10", key: "class_13" as keyof MonthlyFee },
    ];

    return (
      <Grid container spacing={2}>
        {classLabels.map(({ label, key }) => (
          <Grid xs={12} md={6} key={key}>
            <FormControl sx={{ display: "flex" }}>
              <FormLabel>{label}</FormLabel>
              <Input
                type="text"
                startDecorator={"₹"}
                value={config.defaultMonthlyFee[key]}
                onChange={(e) => handleInputChange(e, key)}
              />
            </FormControl>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Grid container gap="1rem" >
      <Grid xs={12} md={4}>
        <Sheet
          variant="outlined"
          sx={{
            p: "1rem",
            display: "flex",
            gap: "1rem",
            flexDirection: "column",
            borderRadius: "0.5rem",
            background: "#fff",
          }}
          component={"form"}
          onSubmit={handleOnDefaultFeeChange}
        >
          <Typography>Adjust Default Monthly Fee</Typography>
          <Divider />
          {renderInputFields()}
          <Button startDecorator={<Save />} type="submit">
            Save Changes
          </Button>
        </Sheet>
      </Grid>
      <Grid xs={12} md={6}>
        <Sheet variant="outlined" sx={{ p: "1rem", borderRadius: "0.5rem" }}>
          <Typography>Other Controls</Typography>
          <Divider />
          <FormControl
            orientation="horizontal"
            sx={{ width: 300, justifyContent: "space-between", mt: "1rem" }}
          >
            <div>
              <FormLabel>Enable Late Fine</FormLabel>
              <FormHelperText sx={{ mt: 0 }}>
                Use this toggle switch to turn on/off late fine for due date.
              </FormHelperText>
            </div>
            <Switch
              checked={config.applyLateFine}
              onChange={onLateFineSwitchChange}
              color={config.applyLateFine ? "success" : "neutral"}
              variant={config.applyLateFine ? "solid" : "outlined"}
              endDecorator={config.applyLateFine ? "On" : "Off"}
              slotProps={{
                endDecorator: {
                  sx: {
                    minWidth: 24,
                  },
                },
              }}
            />
          </FormControl>
        </Sheet>
      </Grid>
    </Grid>
  );
}

export default PaymentConfigurations;
