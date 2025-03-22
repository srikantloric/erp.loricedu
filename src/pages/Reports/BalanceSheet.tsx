import BreadCrumbsV2 from "components/Breadcrumbs/BreadCrumbsV2"
import Navbar from "components/Navbar/Navbar"
import LSPage from "components/Utils/LSPage"
import PageContainer from "components/Utils/PageContainer"
import { IconReport } from "@tabler/icons-react";

function BalanceSheet() {

    return (
        <PageContainer>
            <Navbar />
            <LSPage>
                <BreadCrumbsV2
                    Icon={IconReport}
                    Path="Fee Reports/Balance Sheet"
                />
            </LSPage>
        </PageContainer>
    )
}
export default BalanceSheet