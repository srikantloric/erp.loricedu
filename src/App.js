import { Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import "./App.css";
import Login from "./pages/Login/Login";
import { routesConfig } from "./components/Utils/RoutesConfig";
import { useState, lazy, useEffect } from "react";
import SideBarContext from "./context/SidebarContext";
import {
  SearchDialogProvider,

} from "context/SearchDialogContext";

// Layouts & Context
import AuthenticationLayout from "./layouts/AuthenticationLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthProvider from "./context/AuthContext";

// Utility Component for Lazy Loading
import Loadable from "./components/thirdparty/Loadable";
import AdmitCard from "pages/Reports/AdmitCard";
import ExamPlanner from "pages/ResultsManagement/ExamPlanner";
import { FirebaseProvider } from "context/firebaseContext";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";




// Lazy Loaded Components
const FeeReceipt = Loadable(lazy(() => import("pages/FeeManager/FeeReceipt")));

const GenerateQrSticker = Loadable(
  lazy(() => import("pages/Attendance/GenerateQrSticker"))
);
const ManualAttendance = Loadable(
  lazy(() => import("pages/Attendance/ManualAttendance"))
);
const ViewAttendance = Loadable(
  lazy(() => import("pages/Attendance/ViewAttendance"))
);
const AdmissionEnquiry = Loadable(
  lazy(() => import("pages/Admission/AdmissionEnquiry"))
);

const FacultyAttendance = Loadable(
  lazy(() => import("pages/Attendance/FacultyAttendance/FacultyAttendance"))
);
const GenerateMonthlyChallan = Loadable(
  lazy(() => import("pages/FeeManager/GenerateChallan/GenerateMontlyChallan"))
);
const ViewStudentProfile = Loadable(
  lazy(() => import("pages/Users/StudentProfile/ViewStudentProfile"))
);

const UpdateResults = Loadable(
  lazy(() => import("pages/ResultsManagement/UpdateResults"))
);
const PrintResult = Loadable(
  lazy(() => import("pages/ResultsManagement/PrintResult"))
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

const StudentProfilePictureUpdater = Loadable(
  lazy(() => import("pages/ProfileUpdater/StudentProfilePictureUpdater"))
);

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

function App() {
  const routeItems = routesConfig.map(
    ({ to, Component, isHeader, childrens }) => {
      if (!isHeader) {
        return <Route key={to} path={to} element={<Component />} />;
      }
      return "";
    }
  );

  const [isActive, setIsActive] = useState(true);
  const toggle = () => {
    setIsActive(!isActive);
  };

  const setSidebarOpen = (status) => {
    setIsActive(status);
  };

  useEffect(() => {
    document.title = "Loric Edu";
  }, []);

  const [authKey, setAuthKey] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, () => {
      setAuthKey((prevKey) => prevKey + 1); // Change key on login/logout
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthProvider>
      <FirebaseProvider key={authKey}>
          <SideBarContext.Provider value={{ isActive, toggle, setSidebarOpen }}>
            <SearchDialogProvider>
              <Suspense>
                <Routes>
                  <Route path="/" element={<DashboardLayout />}>
                    {routeItems}
                    <Route
                      path="students/add-students"
                      element={<AddStudentNew />}
                    />
                    <Route
                      path="students/Admission-students"
                      element={<AdmissionEnquiry />}
                    />

                    <Route
                      path="students/view-students"
                      element={<ViewStudents />}
                    />

                    <Route path="/view-faculties" element={<UnderConstruction />} />
                    <Route path="/Faculties/:id" element={<FacultyDetail />} />
                    <Route path="/add-faculty" element={<UnderConstruction />} />
                    <Route
                      path="/FeeManagement/FeeDetails/:id"
                      element={<StudentFeeDetails />}
                    />
                    <Route
                      path="accountings/generate-monthly-fee"
                      element={<GenerateMonthlyChallan />}
                    />
                    <Route
                      path="accountings/generate-custom-fee"
                      element={<GenerateMonthlyChallan />}
                    />
                    <Route
                      path="attendance/show-student-attendance"
                      element={<ViewAttendance />}
                    />
                    <Route
                      path="attendance/mark-manual-attendance"
                      element={<ManualAttendance />}
                    />
                    <Route
                      path="attendance/generate-attendance-qr"
                      element={<GenerateQrSticker />}
                    />
                    <Route
                      path="attendance/Facuities"
                      element={<FacultyAttendance />}
                    />
                    <Route
                      path="/students/profile/:id"
                      element={<ViewStudentProfile />}
                    />
                    <Route path="feeReciept" element={<FeeReceipt />} />

                    {/* Exam Management routes */}
                    <Route
                      path="/schoolResults/update-results"
                      element={<UpdateResults />}
                    />
                    <Route
                      path="/schoolResults/exam-planner"
                      element={<ExamPlanner />}
                    />
                    <Route
                      path="/schoolResults/print-results"
                      element={<PrintResult />}
                    />
                    {/* Exam Management routes */}
                    <Route path="/print-id-cards" element={<IdCardGeneration />} />


                    {/* Reports Routes */}
                    <Route
                      path="/reports/balance-sheet"
                      element={<BalanceSheet />}
                    />

                    <Route path="/reports/due-report" element={<DueReport />} />
                    <Route path="/reports/demand-slip" element={<DemandSlip />} />
                    <Route path="/reports/admit-card" element={<AdmitCard />} />

                    {"Transport"}
                    <Route
                      path="/transport/transport-location"
                      element={<Transport />}
                    />
                    <Route
                      path="/transport/vehicle-details"
                      element={<VehicleDetails />}
                    />
                  </Route>
                  <Route
                    path="update-student-profile-picture"
                    element={<StudentProfilePictureUpdater />}
                  />
                  <Route path="/login" element={<AuthenticationLayout />}>
                    <Route index element={<Login />} />
                  </Route>
                </Routes>
              </Suspense>
            </SearchDialogProvider>
          </SideBarContext.Provider>
      </FirebaseProvider>
    </AuthProvider>
  );
}

export default App;
