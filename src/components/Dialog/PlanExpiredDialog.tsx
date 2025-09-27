import { Modal, ModalClose, Sheet, Typography } from "@mui/joy";
import { useEffect, useState } from "react";

import ReminderIcon from "assets/reminder-notes.png"
import ExpiredIcon from "assets/expired.png"
import { doc, getDoc } from "firebase/firestore";
import { useFirebase } from "context/firebaseContext";

function PlanExpiredDialog() {
    const [dueDate, setDueDate] = useState<Date>(new Date());
    const [open, setOpen] = useState<boolean>(false);
    const [status, setStatus] = useState<"reminder" | "expired" | null>(null);

    const { db } = useFirebase();

    useEffect(() => {
        const fetchConfig = async () => {
            const softwareConfigRef = doc(db, "CONFIG", "SOFTWARE_CONFIG");
            const softwareConfig = await getDoc(softwareConfigRef);

            if (softwareConfig.exists()) {
                const data = softwareConfig.data();
                if (data && data.dueDate) {
                    const dueDateFromDb = data.dueDate.toDate();
                    setDueDate(dueDateFromDb);

                    const now = new Date();
                    const diffTime = dueDateFromDb.getTime() - now.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    if (diffDays <= 15 && diffDays > 0) {
                        setStatus("reminder");
                        setOpen(true);
                    } else if (diffDays <= 0) {
                        setStatus("expired");
                        setOpen(true);
                    } else {
                        setStatus(null);
                        setOpen(false);
                    }
                }
            }
        };
        fetchConfig();
    }, [db]);

    return (
        <>
            <Modal
                aria-labelledby="modal-title"
                aria-describedby="modal-desc"
                open={open}
                sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            >
                <Sheet
                    variant="outlined"
                    sx={{ maxWidth: 500, borderRadius: 'md', p: 3, boxShadow: 'lg' }}
                >
                    {status === "reminder" && (
                        <>
                            <ModalClose variant="plain" sx={{ m: 1 }} onClick={() => setOpen(false)} />
                            <img src={ReminderIcon} alt="Reminder" style={{ width: '100px', height: '100px', display: 'block', margin: '0 auto' }} />
                            <Typography id="modal-title" component="h2" level="h4" textAlign="center" fontWeight="bold" mb={2}>
                                Your Plan is About to Expire
                            </Typography>
                            <Typography id="modal-desc" textAlign="center" mb={2}>
                                Your current software validity will expire on {dueDate.toLocaleDateString()}. Please contact Loric Edu at <b>+91- 7979080633 </b>to renew your plan and continue enjoying our services.
                            </Typography>
                            <br />
                            <Typography id="modal-desc" textAlign="center" mb={2}>
                                आपकी वर्तमान सॉफ़्टवेयर वैधता {dueDate.toLocaleDateString()} को समाप्त हो जाएगी। कृपया अपनी योजना को नवीनीकृत करने और हमारी सेवाओं का लाभ उठाने के लिए Loric Edu से <b>+91- 7979080633 </b> पर संपर्क करें।
                            </Typography>
                        </>
                    )}
                    {status === "expired" && (
                        <>
                            <img src={ExpiredIcon} alt="Expired" style={{ width: '100px', height: '100px', display: 'block', margin: '0 auto' }} />
                            <Typography id="modal-title" component="h2" level="h4" textAlign="center" fontWeight="bold" mb={2} mt={2} color="danger" >
                                Your Plan Has Expired
                            </Typography>
                            <Typography id="modal-desc" textAlign="center" mb={2}>
                                Your current software validity has expired on {dueDate.toLocaleDateString()}. Please contact Loric Edu at <b style={{ color: "red" }}>+91- 7979080633 </b>to renew your plan and continue enjoying our services.
                            </Typography>
                            <br />
                            <Typography id="modal-desc" textAlign="center" mb={2}>
                                आपकी वर्तमान सॉफ़्टवेयर वैधता {dueDate.toLocaleDateString()} को समाप्त हो गई है। कृपया अपनी योजना को नवीनीकृत करने और हमारी सेवाओं का लाभ उठाने के लिए Loric Edu से <b style={{ color: "red" }}>+91- 7979080633 </b> पर संपर्क करें。
                            </Typography>
                        </>
                    )}
                </Sheet>
            </Modal>
        </>
    );
}

export default PlanExpiredDialog;
