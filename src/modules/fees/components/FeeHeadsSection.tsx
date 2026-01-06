import { useFeeCollection } from "../context/FeeCollectionContext";
import FeeHeadsTable from "./FeeHeadsTable";

function FeeHeadsSection() {
    const { feeHeads, setFinalHeads, currentDueAmount, concessionTotal } = useFeeCollection()

    return (
        <>
            <FeeHeadsTable
                heads={feeHeads}
                currentDueAmount={currentDueAmount}
                consessionAmount={concessionTotal}
                onChangeHeads={updated => setFinalHeads(updated)}
            />
        </>
    )
}

export default FeeHeadsSection