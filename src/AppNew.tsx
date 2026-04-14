import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import { lazy, Suspense, useEffect } from "react";
import { SearchDialogProvider } from "context/SearchDialogContext";
import "./App.css";
// Layouts & Context
import AuthenticationLayout from "./layouts/AuthenticationLayout";
import AuthProvider from "./context/AuthContext";

// Utility Component for Lazy Loading
import Loadable from "./components/thirdparty/Loadable";
import ExamPlanner from "pages/ResultsManagement/ExamPlanner";
import { FirebaseProvider } from "context/firebaseContext";


import StudentMigration from "pages/Users/StudentMigration";
import PrintTopperList from "pages/ResultsManagement/PrintToperList";
import AllocatedStudents from "pages/transport/vehicleDetailsTabs/AllocatedStudents";
import AllocatedStudentsLocations from "pages/transport/vehicleDetailsTabs/AllocatedStudentsLocations";
import StudentsList from "pages/Reports/StudentsList";
import FacultyList from "pages/Reports/FacultyList";
import { NavbarProvider } from "context/NavbarContext";
import IotAttendance from "pages/Attendance/iotAttendanance/IotAttendance";
import GenerateAdmitCard from "pages/Reports/ExamAdmitCard/GenerateAdmitCard";
import FollowUp from "pages/FollowUp/FollowUp";
import FeeDueFollowUp from "pages/FollowUp/FeeDueFollowUp";
import ExamSetup from "pages/ResultsManagement/ExamSetup/ExamSetup";
import DashboardLayoutNew from "layouts/DashboardLayoutNew";
import Faculties from "pages/FacutyManagment/Faculties";
import FeeManager from "pages/FeeManager/FeeManager";
import Reports from "pages/Reports/Reports";
import Expenses from "pages/expenses/Expenses";
import { SidebarProvider } from "context/SidebarContext";
import StudentProfilePictureUpdater from "pages/ProfileUpdater/StudentProfilePictureUpdater";
import ManualAttendance from "pages/Attendance/ManualAttendance";
import FeeCollectionPage from "modules/fees/pages/FeeCollectionPage";
import { ConfirmDialogProvider } from "context/ConfirmDialogContext";
import FacultyAttendanceNew from "pages/Attendance/FacultyAttendance/FacultyAttendanceNew";


// Lazy Loaded Components

const Dashboard = Loadable(
    lazy(() => import("pages/Dashboard/Dashboard"))
);

const ViewAttendance = Loadable(
    lazy(() => import("pages/Attendance/ViewAttendance"))
);
const AdmissionEnquiry = Loadable(
    lazy(() => import("pages/Admission/AdmissionEnquiry"))
);


const ViewStudentProfile = Loadable(
    lazy(() => import("pages/Users/StudentProfile/ViewStudentProfile"))
);

const UpdateResults = Loadable(
    lazy(() => import("pages/ResultsManagement/UpdateResult"))
);
const UpdateResultsBulk = Loadable(
    lazy(() => import("pages/ResultsManagement/UpdateResult"))
);
const PrintResult = Loadable(
    lazy(() => import("pages/ResultsManagement/PrintResult"))
);
const PrintRankList = Loadable(
    lazy(() => import("pages/ResultsManagement/PrintRankList"))
);
const IdCardGeneration = Loadable(
    lazy(() => import("pages/Extras/IdCardGeneration"))
);
const BalanceSheet = Loadable(lazy(() => import("pages/Reports/BalanceSheet")));
const DueReport = Loadable(lazy(() => import("pages/Reports/DueReport")));
const DemandSlip = Loadable(lazy(() => import("pages/Reports/DemandSlip")));
const Transport = Loadable(lazy(() => import("pages/transport/Transport")));
const VehicleDetails = Loadable(
    lazy(() => import("pages/transport/VehicleDetails"))
);
const AddStudentNew = Loadable(lazy(() => import("pages/Users/AddStudentNew")));


const ViewStudents = Loadable(lazy(() => import("./pages/Users/ViewStudents")));
const UnderConstruction = Loadable(
    lazy(() => import("./pages/Extras/UnderConstruction"))
);
const FacultyDetail = Loadable(
    lazy(() => import("./pages/FacutyManagment/FacultyDetail"))
);
const StudentFeeDetails = Loadable(
    lazy(() => import("./pages/FeeManager/StudentFeeDetails"))
);
const FacultyDailyAttendanceReport = Loadable(
    lazy(() => import("pages/Reports/FacultyDailyAttendanceReport"))
);
const FacultyMonthlyAttendanceReport = Loadable(
    lazy(() => import("pages/Reports/FacultyMonthlyAttendanceReport"))
);


const SettingsPage = Loadable(
    lazy(() => import("./pages/Settings/SettingsPage"))
)
const UserManagement = Loadable(
    lazy(() => import("./pages/UserManagement/UserManagement"))
)
const MasterDataPage = Loadable(
    lazy(() => import("./pages/MasterData/MasterData"))
)
const WebsiteConfig = Loadable(
    lazy(() => import("./pages/WebsiteConfig/WebsiteConfigPage"))
)

function AppNew() {

    useEffect(() => {
        document.title = "Loric Edu";
    }, []);

    console.log("📝Version: 1.2.0");

    return (

        <FirebaseProvider>
            <SidebarProvider>

                <AuthProvider>
                    <ConfirmDialogProvider>
                        <SearchDialogProvider>
                            <NavbarProvider>
                                <Suspense>
                                    <Routes>
                                        <Route path="/" element={<DashboardLayoutNew />}>

                                            <Route
                                                index
                                                element={<Dashboard />}
                                            />
                                            <Route
                                                path="students/view"
                                                element={<ViewStudents />}
                                            />
                                            <Route
                                                path="students/add"
                                                element={<AddStudentNew />}
                                            />

                                            <Route
                                                path="students/Admission-students"
                                                element={<AdmissionEnquiry />}
                                            />

                                            <Route
                                                path="faculties"
                                                element={<Faculties />}
                                            />

                                            <Route path="faculties/:id" element={<FacultyDetail />} />
                                            <Route path="faculties/add" element={<UnderConstruction />} />
                                            <Route
                                                path="faculties/attendance"
                                                element={<FacultyAttendanceNew />}
                                            />

                                            <Route path="inquiries" element={<AdmissionEnquiry />} />


                                            <Route
                                                path="fee-management"
                                                element={<FeeManager />}
                                            />
                                            <Route
                                                path="fee-management/FeeDetails/:id"
                                                element={<StudentFeeDetails />}
                                            />
                                            <Route
                                                path="fee-management/NewFeeDetails/:studentId"
                                                element={<FeeCollectionPage />}
                                            />


                                            <Route
                                                path="expense-manager"
                                                element={<Expenses />}
                                            />


                                            <Route
                                                path="attendance/view"
                                                element={<ViewAttendance />}
                                            />
                                            <Route
                                                path="attendance/manual"
                                                element={<ManualAttendance />}
                                            />

                                            {/* <Route
                                                path="attendance/generate-attendance-qr"
                                                element={<GenerateQrSticker />}
                                            /> */}

                                            <Route
                                                path="attendance/iot"
                                                element={<IotAttendance />}
                                            />
                                            <Route
                                                path="students/profile/:id"
                                                element={<ViewStudentProfile />}
                                            />

                                            {/* Exam Management routes */}

                                            <Route
                                                path="exams/update-results/bulk-update"
                                                element={<UpdateResultsBulk />}
                                            />
                                            <Route
                                                path="schoolResults/print-rank-list"
                                                element={<PrintRankList />}
                                            />

                                            <Route
                                                path="exams/print-toppers-list"
                                                element={<PrintTopperList />}
                                            />

                                            <Route
                                                path="exams"
                                                element={<ExamPlanner />}
                                            />
                                            <Route
                                                path="exams/publish-result"
                                                element={<UpdateResults />}
                                            />

                                            <Route
                                                path="exams/add-exam/:examId?"
                                                element={<ExamSetup />}
                                            />
                                            <Route
                                                path="exams/print-result"
                                                element={<PrintResult />}
                                            />
                                            <Route
                                                path="exams/print-ranklist"
                                                element={<PrintRankList />}
                                            />
                                            <Route
                                                path="schoolResults/class-migration"
                                                element={<StudentMigration />}
                                            />
                                            {/* Exam Management routes */}
                                            <Route
                                                path="print-id-cards"
                                                element={<IdCardGeneration />}
                                            />

                                            {/* Reports Routes */}

                                            <Route
                                                path="reports"
                                                element={<Reports />}
                                            />
                                            <Route
                                                path="reports/balance-sheet"
                                                element={<BalanceSheet />}
                                            />
                                            <Route
                                                path="follow-up"
                                                element={<FollowUp />}
                                            />
                                            <Route
                                                path="follow-up/fee-dues-follow-up"
                                                element={<FeeDueFollowUp />}
                                            />

                                            <Route path="reports/due-report" element={<DueReport />} />
                                            <Route path="reports/demand-slip" element={<DemandSlip />} />
                                            <Route path="reports/admit-card" element={<GenerateAdmitCard />} />
                                            <Route path="reports/students-list" element={<StudentsList />} />
                                            <Route path="reports/faculty-list" element={<FacultyList />} />
                                            <Route path="reports/faculty-daily-attendance" element={<FacultyDailyAttendanceReport />} />
                                            <Route path="reports/faculty-monthly-attendance" element={<FacultyMonthlyAttendanceReport />} />

                                            {"Transport"}
                                            <Route
                                                path="transport/pickup-locations"
                                                element={<Transport />}
                                            />
                                            <Route
                                                path="transport/pickup-locations/allocated-students/:locationId"
                                                element={<AllocatedStudentsLocations />}
                                            />
                                            <Route
                                                path="transport/allocated-students/:locationId"
                                                element={<AllocatedStudentsLocations />}
                                            />
                                            <Route
                                                path="transport/vehicles"
                                                element={<VehicleDetails />}
                                            />
                                            <Route
                                                path="user-management"
                                                element={<UserManagement />}
                                            />
                                            <Route
                                                path="master-data"
                                                element={<MasterDataPage />}
                                            />
                                            <Route
                                                path="settings"
                                                element={<SettingsPage />}
                                            />
                                            <Route
                                                path="website-config"
                                                element={<WebsiteConfig />}
                                            />

                                            <Route
                                                path="transport/vehicles/allocated-students/:vehicleId"
                                                element={<AllocatedStudents />}
                                            />
                                        </Route>

                                        <Route path="/login" element={<AuthenticationLayout />}>
                                            <Route index element={<Login />} />
                                        </Route>
                                        <Route
                                            path="profile-update"
                                            element={<StudentProfilePictureUpdater />}
                                        />
                                    </Routes>
                                </Suspense>
                            </NavbarProvider>
                        </SearchDialogProvider>
                    </ConfirmDialogProvider>
                </AuthProvider>
            </SidebarProvider>
        </FirebaseProvider>

    );
}

export default AppNew;
