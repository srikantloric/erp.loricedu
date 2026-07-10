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
  IconFingerprint,
  IconPhoneOutgoing,
  IconListDetails,
  IconSchool,
} from "@tabler/icons-react";

import { MenuItem } from "types/menu";
import { User } from "iconsax-react";

export const menuItems: MenuItem[] = [
  {
    label: "Masters",
    isHeader: true,
    group: "masters",
  },
  {
    label: "Dashboard",
    path: "/",
    icon: <IconDashboard />,
    permission: "viewDashboard",
    group: "masters",
  },
  {
    label: "Students",
    icon: <IconFriends />,
    permission: "manageStudents",
    subMenu: [
      {
        label: "View Students",
        path: "/students/view",
        permission: "viewStudents",
      },
      { label: "Add Student", path: "/students/add",  },
    ],
    group: "masters",
  },
  {
    label: "Faculties",
    icon: <IconUsers />,
    permission: "manageFaculties",
    subMenu: [
      { label: "View Faculties", path: "/faculties" },
      { label: "Attendance", path: "/faculties/attendance" },
    ],
  },
  {
    label: "Inquiries",
    icon: <IconPhoneIncoming />,
    path: "/inquiries",
    permission: "viewInquiries",
    group: "masters",
  },

  {
    isHeader: true,
    label: "Manager",
    group: "manager",
  },
  {
    label: "Fee Manager",
    icon: <IconCoinRupee />,
    path: "/fee-management",
    permission: "manageFees",
    group: "manager",
  },
  {
    label: "Expense Manager",
    icon: <IconMoneybag />,
    path: "/expense-manager",
    permission: "manageExpenses",
    group: "manager",
  },
  {
    label: "Attendance",
    icon: <IconFingerprint />,
    permission: "manageAttendance",
    subMenu: [
      {
        label: "Show Attendance",
        path: "/attendance/view",
        permission: "viewAttendance",
      },
      {
        label: "Manual Attendance",
        path: "/attendance/manual",
        permission: "manualAttendance",
      },
      {
        label: "IOT Attendance",
        path: "/attendance/iot",
        permission: "iotAttendance",
      },
    ],
    group: "manager",
  },
  {
    label: "Transport",
    icon: <IconBus />,
    permission: "manageTransport",
    subMenu: [
      {
        label: "Pickup Locations",
        path: "/transport/pickup-locations",
        permission: "managePickupLocations",
      },
      {
        label: "Vehicles",
        path: "/transport/vehicles",
        permission: "manageVehicles",
      },
    ],
    group: "manager",
  },
  {
    label: "Exams & Results",
    icon: <IconReportAnalytics />,
    permission: "manageExams",
    subMenu: [
      { label: "Setup Exam", path: "/exams", permission: "setupExam" },
      {
        label: "Update Result",
        path: "/exams/publish-result",
        permission: "updateResult",
      },
      {
        label: "Print Result",
        path: "/exams/print-result",
        permission: "printResult",
      },
      {
        label: "Print RankList",
        path: "/exams/print-ranklist",
        permission: "printRankList",
      },
      {
        label: "Print Topper List",
        path: "/exams/print-toppers-list",
        permission: "printTopperList",
      },
      { label: "Student Migration", path: "/exams/class-migration" },
    ],
    group: "manager",
  },

  {
    isHeader: true,
    label: "Report Center",
    group: "reports",
  },
  {
    label: "Reports",
    icon: <IconReport />,
    path: "/reports",
    permission: "viewReports",
    group: "reports",
  },
  {
    label: "Follow Up",
    icon: <IconPhoneOutgoing />,
    path: "/follow-up",
    permission: "manageFollowUp",
    group: "reports",
  },
  /// Academic Session Controls
  {
    isHeader: true,
    label: "Academic Session",
    group: "academic-session-controls",
  },
  {
    label: "Class Migration",
    icon: <IconSchool />,
    path: "/academic/class-migration",
    group: "academic-session-controls",
  },
  {
    label: "Student Roll Allocation",
    icon: <IconListDetails />,
    path: "/academic/student-roll-allocation",
    group: "academic-session-controls",
  },

  {
    isHeader: true,
    label: "Controls",
    group: "controls",
  },
  {
    label: "Master Data",
    icon: <IconServer />,
    path: "/master-data",
    permission: "manageUsers",
    group: "controls",
  },
  {
    label: "Website Config",
    icon: <IconDatabaseCog />,
    path: "/website-config",
    permission: "manageUsers",
    group: "controls",
  },
  {
    label: "User Management",
    icon: <User />,
    path: "/user-management",
    permission: "manageUsers",
    group: "controls",
  },
  {
    label: "Settings",
    icon: <IconSettings />,
    path: "/settings",
    permission: "manageUsers",
    group: "controls",
  },
];
