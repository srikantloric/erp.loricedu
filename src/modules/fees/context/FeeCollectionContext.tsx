import { createContext, useContext, useEffect, useState } from "react";
import { StudentDetailsType } from "types/student";
import { TransportLocationType, TransportVehicleType } from "types/transport";
import { FeeHead } from "../types/FeeHeads";
import { MiscDue } from "../types/MiscDue";
import { fetchStudentDetails, fetchTransportDetails } from "../services/student.service";
import { generateFeeMonths } from "../services/feeMonths.service";
import { FeeMonth } from "../types/FeeMonth";
import { dummyFeeProfile } from "../utils/DummyFeeProfile";
import { convertMiscToFeeHeads, fetchMiscDues, fetchPreviousDues } from "../services/feeCollection.service";
import { getMonthString } from "../utils/month-utils";
import { Timestamp } from "firebase/firestore";


interface FeeCollectionContextType {
    loading: boolean;

    student: StudentDetailsType | null;
    transport: (TransportLocationType & TransportVehicleType) | null;

    feeChallanMonths: FeeMonth[];
    setFeeChallanMonths: React.Dispatch<React.SetStateAction<FeeMonth[]>>
    feeHeads: FeeHead[];
    setFeeHeads: React.Dispatch<React.SetStateAction<FeeHead[]>>;
    miscDues: MiscDue[];

    finalHeads: FeeHead[]
    setFinalHeads: (x: FeeHead[]) => void;

    preDuesTotal: number
    feeTotal: number

    concessionTotal: number
    setConcessionTotal: (x: number) => void
    currentDueAmount: number
    setCurrentDueAmount: (x: number) => void

}

const FeeCollectionContext = createContext<FeeCollectionContextType>({} as FeeCollectionContextType);

interface Props {
    studentId: string;
    session: string;
    children: React.ReactNode;
}

export function FeeCollectionProvider({ studentId, session, children }: Props) {
    const [loading, setLoading] = useState(true);

    const [student, setStudent] = useState<StudentDetailsType | null>(null);
    const [transport, setTransport] = useState<(TransportLocationType & TransportVehicleType) | null>(null);

    const [feeHeads, setFeeHeads] = useState<FeeHead[]>([])
    const [finalHeads, setFinalHeads] = useState<FeeHead[]>([]);

    const [feeChallanMonths, setFeeChallanMonths] = useState<FeeMonth[]>([])

    const [feeTotal, setFeeTotal] = useState<number>(0)
    const [preDuesTotal, setPreDuesTotal] = useState<number>(0)

    const [concessionTotal, setConcessionTotal] = useState(0);
    const [currentDueAmount, setCurrentDueAmount] = useState(0);

    useEffect(() => {
        async function init() {
            setLoading(true);

            // 1️⃣ Fetch student
            const studentData = await fetchStudentDetails(studentId);
            setStudent(studentData);
            // 2️⃣ Fetch transport after student is known
            if (studentData?.transport_location && studentData?.transport_vehicle) {
                const transportData = await fetchTransportDetails(
                    studentData.transport_location,
                    studentData.transport_vehicle
                );
                setTransport(transportData);
            }

            const updatedFeeMonths = generateFeeMonths(session, ['2025-04', '2025-05'])
            console.log("Generated Challan", updatedFeeMonths)

            setFeeChallanMonths(updatedFeeMonths)

            // 1️⃣ Fetch previous dues
            const previousDues = await fetchPreviousDues(studentId);
            setPreDuesTotal(0)


            // 2️⃣ Fetch misc dues
            const misc = await fetchMiscDues(studentId);

            // Convert misc dues → fee head format
            const miscFeeHeads = convertMiscToFeeHeads(misc);

            // 3️⃣ Set initial finalHeads (before selecting months)
            const initialHeads = [
                ...previousDues,
                ...miscFeeHeads,
            ];

            setFeeHeads(initialHeads);

            setLoading(false);
        }
        init();
    }, [studentId, session]);

    useEffect(() => {
        const selectedMonths = feeChallanMonths
            .filter((m) => m.status === "Added")
            .map((m) => getMonthString(m.month, m.year));

        const heads: FeeHead[] = [];
        dummyFeeProfile.monthlyHeads.forEach((m) => {
            if (selectedMonths.includes(m.month)) {
                m.heads.forEach((h) => {
                    heads.push({
                        ...h,
                        month: m.month,
                        dueAmount: 0,
                        concessionAmount: 0,
                        headType: "regular",
                        paidAmount: 0,
                        // 🔥 Add a unique identifier per month-head row
                        id: `${m.month}_${h.headId}`,
                        updatedAt: Timestamp.now()
                    });
                });
            }
        });

        setFeeHeads(heads);

    }, [feeChallanMonths]);

    useEffect(() => {
        const total = finalHeads.reduce((sum, h) => sum + h.amount, 0);
        const dues = finalHeads.reduce((sum, h) => sum + h.dueAmount, 0);
        setFeeTotal(total);
        setCurrentDueAmount(dues);
    }, [finalHeads]);


    return (
        <FeeCollectionContext.Provider value={{
            loading,
            student,
            transport,
            feeChallanMonths,
            setFeeChallanMonths: setFeeChallanMonths,
            feeHeads,
            finalHeads,
            miscDues: [],
            setFinalHeads,
            setFeeHeads,
            feeTotal,
            preDuesTotal,
            concessionTotal,
            setConcessionTotal,
            currentDueAmount,
            setCurrentDueAmount,
        }}>
            {children}
        </FeeCollectionContext.Provider>
    )
}


export function useFeeCollection() {
    const context = useContext(FeeCollectionContext);

    if (!context) {
        throw new Error("useFeeCollection must be used within a FeeCollectionProvider");
    }

    return context;
}

