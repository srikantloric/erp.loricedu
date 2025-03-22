import Dashboard from "../../pages/Dashboard/Dashboard";
import Faculties from "../../pages/FacutyManagment/Faculties";
import Attendance from "../../pages/Attendance/ViewAttendance";
import {
  IconCoinRupee,
  IconDashboard,
  IconFingerprint,
  IconFriends,
  IconMail,
  IconNotes,
  IconReceipt2,
  IconUsers,
  IconMoneybag,
  IconSettings,
  IconReportAnalytics,
  IconReport,
  IconServer,
  IconBus,
  IconDatabaseCog,
} from "@tabler/icons-react";
import UnderConstruction from "../../pages/Extras/UnderConstruction";
import FeeManager from "../../pages/FeeManager/FeeManager";
import FeaturesConfig from "../../FeaturesConfig";
import ViewStudents from "../../pages/Users/ViewStudents";
import FeeReceipt from "pages/FeeManager/FeeReceipt";
import Transaction from "pages/Transaction/Transaction";
import GenerateMonthlyChallan from "pages/FeeManager/GenerateChallan/GenerateMontlyChallan";
import ViewStudentProfile from "pages/Users/StudentProfile/ViewStudentProfile";
import SettingsPage from "pages/Settings/SettingsPage";
import UpdateResults from "pages/ResultsManagement/UpdateResults";
import PrintResult from "pages/ResultsManagement/PrintResult";
import FeeReports from "pages/Reports/Reports";
import MasterData from "pages/MasterData/MasterData";
import Reports from "pages/Reports/Reports";
import Transport from "pages/transport/Transport";
import WebsiteConfig from "pages/WebsiteConfig/WebsiteConfigPage";
import AddStudentNew from "pages/Users/AddStudentNew";
import ExamPlanner from "pages/ResultsManagement/ExamPlanner";

export const routesConfig = [
  {
    title: "Masters",
    isHeader: true,
  },
  {
    title: "Dashboard",
    to: "/",
    icon: IconDashboard,
    isCollapsable: false,
    isHeader: false,
    Component: Dashboard,
  },
  {
    title: "Students",
    to: "/students",
    icon: IconFriends,
    isCollapsable: false,
    isHeader: false,
    Component: ViewStudents,
    childrens: [
      {
        title: "Add Student",
        to: "students/add-students",

        isCollapsable: false,
        isHeader: false,
        Component: <AddStudentNew />,
      },
      {
        title: "View Student",
        to: "students/view-students",
        isCollapsable: false,
        isHeader: false,
        Component: <AddStudentNew />,
      },
      {
        title: "Admission Enquire",
        to: "students/Admission-students",
        isCollapsable: false,
        isHeader: false,
        Component: <AddStudentNew />,
      },
    ],
  },
  {
    title: "Faculties",
    to: "/Faculties",
    icon: IconUsers,
    isCollapsable: false,
    isHeader: false,
    Component: FeaturesConfig.FACULTY_FEATURE ? Faculties : UnderConstruction,
  },
  {
    title: "Management",
    isHeader: true,
  },
  {
    title: "Fee Payments",
    to: "/FeeManagement",
    icon: IconCoinRupee,
    isCollapsable: false,
    isHeader: false,
    Component: FeaturesConfig.PAYMENT_FEATURE ? FeeManager : UnderConstruction,
  },
  // {
  //   title: "Accountings",
  //   to: "/Accountings",
  //   icon: IconMoneybag,
  //   isCollapsable: false,
  //   isHeader: false,
  //   Component: GenerateMonthlyChallan,
  //   childrens: [
  //     {
  //       title: "Generate Montly Fee",
  //       to: "accountings/generate-monthly-fee",
  //       isCollapsable: false,
  //       isHeader: false,
  //       Component: <GenerateMonthlyChallan />,
  //     },
  //     {
  //       title: "Generate Custom Fee",
  //       to: "accountings/generate-custom-fee",
  //       isCollapsable: false,
  //       isHeader: false,
  //       Component: <GenerateMonthlyChallan />,
  //     },
  //   ],
  // },
  // {
  //   title: "Attendance ",
  //   to: "/Attendance",
  //   icon: IconFingerprint,
  //   isCollapsable: false,
  //   isHeader: false,
  //   Component: FeaturesConfig.ATTENDANCE_FEATURE
  //     ? Attendance
  //     : UnderConstruction,
  //   childrens: [
  //     {
  //       title: "Show Attendance",
  //       to: "attendance/show-student-attendance",
  //       isCollapsable: false,
  //       isHeader: false,
  //       Component: <Attendance />,
  //     },
  //     {
  //       title: "Manual Attendance",
  //       to: "attendance/mark-manual-attendance",
  //       isCollapsable: false,
  //       isHeader: false,
  //       Component: <Attendance />,
  //     },
  //     {
  //       title: "Generate QR Sticker",
  //       to: "attendance/generate-attendance-qr",
  //       isCollapsable: false,
  //       isHeader: false,
  //       Component: <Attendance />,
  //     },
  //     {
  //       title: "Facuities Attendance",
  //       to: "attendance/Facuities",
  //       isCollapsable: false,
  //       isHeader: false,
  //       Component: <Attendance />,
  //     },
  //   ],
  // },

  {
    title: "Transport",
    to: "/transport",
    icon: IconBus,
    isCollapsable: false,
    isHeader: false,
    Component: Transport,
    childrens: [
      {
        title: "Transport Location",
        to: "transport/transport-location",
        isCollapsable: false,
        isHeader: false,
        Component: <Transport />,
      },
      {
        title: "Vehicle Details",
        to: "transport/vehicle-details",
        isCollapsable: false,
        isHeader: false,
        Component: <PrintResult />,
      },
    ],
  },
  // {
  //   title: "Fee Receipts",
  //   to: "/FeeReceipt",
  //   icon: IconNotes,
  //   isCollapsable: false,
  //   isHeader: false,
  //   Component: FeeReceipt,
  // },
  {
    title: "Exams & Results",
    to: "/SchoolResults",
    icon: IconReportAnalytics,
    isCollapsable: true,
    isHeader: false,
    Component: UpdateResults,
    childrens: [
      {
        title: "Update Results",
        to: "schoolResults/update-results",
        isCollapsable: false,
        isHeader: false,
        Component: <UpdateResults />,
      },
      {
        title: "Exam Planner",
        to: "schoolResults/exam-planner",
        isCollapsable: false,
        isHeader: false,
        Component: <ExamPlanner />,
      },
      {
        title: "Print Results",
        to: "schoolResults/print-results",
        isCollapsable: false,
        isHeader: false,
        Component: <PrintResult />,
      },
    ],
  },
  {
    title: "Reports",
    isHeader: true,
  },
  {
    title: "Reports",
    to: "/reports",
    icon: IconReport,
    isCollapsable: false,
    isHeader: false,
    Component: Reports,
  },
  // {
  //   title: "Transaction",
  //   to: "/Transaction",
  //   icon: IconReceipt2,
  //   isCollapsable: false,
  //   isHeader: false,
  //   Component: Transaction,
  // },
  // {
  //   title: "Message",
  //   to: "/Message",
  //   icon: IconMail,
  //   isCollapsable: false,
  //   isHeader: false,
  //   Component: UnderConstruction,
  // },
  {
    title: "Controls",
    isHeader: true,
  },
  {
    title: "Master Data",
    to: "/masterdata",
    icon: IconServer,
    isCollapsable: false,
    isHeader: false,
    Component: MasterData,
  },
  {
    title: "Website Config",
    to: "/websiteconfig",
    icon: IconDatabaseCog,
    isCollapsable: false,
    isHeader: false,
    Component: WebsiteConfig,
  },
  {
    title: "Settings",
    to: "/Settings",
    icon: IconSettings,
    isCollapsable: false,
    isHeader: false,
    Component: SettingsPage,
  },
];
