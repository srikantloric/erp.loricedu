import Dashboard from "../../pages/Dashboard/Dashboard";
import Faculties from "../../pages/FacutyManagment/Faculties";
import {
  IconCoinRupee,
  IconDashboard,
  IconFriends,
  IconUsers,
  IconSettings,
  IconReportAnalytics,
  IconReport,
  IconServer,
  IconBus,
  IconDatabaseCog,
  IconMoneybag,
  IconPhoneIncoming,
  IconFingerprint
} from "@tabler/icons-react";
import UnderConstruction from "../../pages/Extras/UnderConstruction";
import FeeManager from "../../pages/FeeManager/FeeManager";
import FeaturesConfig from "../../FeaturesConfig";
import ViewStudents from "../../pages/Users/ViewStudents";
import SettingsPage from "pages/Settings/SettingsPage";
import UpdateResults from "pages/ResultsManagement/UpdateResults";
import PrintResult from "pages/ResultsManagement/PrintResult";
import MasterData from "pages/MasterData/MasterData";
import Reports from "pages/Reports/Reports";
import WebsiteConfig from "pages/WebsiteConfig/WebsiteConfigPage";
import AddStudentNew from "pages/Users/AddStudentNew";
import ExamPlanner from "pages/ResultsManagement/ExamPlanner";
import Transport from "pages/transport/Transport";
import PrintRankList from "pages/ResultsManagement/PrintRankList";
import PrintTopperList from "pages/ResultsManagement/PrintToperList";
import Expenses from "pages/expenses/Expenses";
import StudentMigration from "pages/Users/StudentMigration";
import RollNoUpdator from "pages/StudentManagement/RollNoUpdator";
import AdmissionEnquiry from "pages/Admission/AdmissionEnquiry";
import Attendance from "pages/Attendance/Attendance";
import AttendanceConfiguration from "pages/Attendance/AttendanceConfiguration";

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
      , {
        title: "Update Student Roll",
        to: "students/update-students-roll",
        isCollapsable: false,
        isHeader: false,
        Component: <RollNoUpdator />,
      }
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
    title: "Inquiry",
    to: "/Inquiry",
    icon: IconPhoneIncoming,
    isCollapsable: false,
    isHeader: false,
    Component: AdmissionEnquiry,
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
  {
    title: "Expense Tracker",
    to: "/expense-tracker",
    icon: IconMoneybag,
    isCollapsable: false,
    isHeader: false,
    Component: Expenses,
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
  {
    title: "Attendance ",
    to: "/Attendance",
    icon: IconFingerprint,
    isCollapsable: false,
    isHeader: false,
    Component: FeaturesConfig.ATTENDANCE_FEATURE
      ? Attendance
      : UnderConstruction,
    childrens: [
      {
        title: "Show Attendance",
        to: "attendance/show-student-attendance",
        isCollapsable: false,
        isHeader: false,
        Component: <Attendance />,
      },
      {
        title: "Manual Attendance",
        to: "attendance/mark-manual-attendance",
        isCollapsable: false,
        isHeader: false,
        Component: <Attendance />,
      },
      // {
      //   title: "Generate QR Sticker",
      //   to: "attendance/generate-attendance-qr",
      //   isCollapsable: false,
      //   isHeader: false,
      //   Component: <Attendance />,
      // },
      {
        title: "Facuities Attendance",
        to: "attendance/Facuities",
        isCollapsable: false,
        isHeader: false,
        Component: <Attendance />,
      },
      {
        title: "Configurations",
        to: "attendance/config",
        isCollapsable: false,
        isHeader: false,
        Component: <AttendanceConfiguration />,
      },

    ],
  },

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
      {
        title: "Print Rank List",
        to: "schoolResults/print-rank-list",
        isCollapsable: false,
        isHeader: false,
        Component: <PrintRankList />,
      },
      {
        title: "Class Migration",
        to: "schoolResults/class-migration",
        isCollapsable: false,
        isHeader: false,
        Component: <StudentMigration />,
      },
      {

        title: "Print Toppers List",
        to: "schoolResults/print-toppers-list",
        isCollapsable: false,
        isHeader: false,
        Component: <PrintTopperList />,
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
