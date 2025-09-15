
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
  IconPhoneOutgoing
} from "@tabler/icons-react";

import { MenuItem } from 'types/menu';
import { User } from "iconsax-react";

export const menuItems: MenuItem[] = [
  {
    label: "Masters",
    isHeader: true,
    group: "masters"
  },

  {
    label: 'Dashboard',
    path: '/',
    icon: <IconDashboard />,
    group: "masters"
  },
  {
    label: 'Students',
    icon: <IconFriends />,
    subMenu: [
      { label: 'View Students', path: '/students/view' },
      { label: 'Add Student', path: '/students/add' },
    ],
    group: "masters"
  },
  {
    label: 'Faculties',
    icon: <IconUsers />,
    path: "/faculties",
    group: "masters"
  },
  {
    label: 'Inquiries',
    icon: <IconPhoneIncoming />,
    path: "/inquiries",
    group: "masters"
  },
  {
    isHeader: true,
    label: "Manager",
    group: "manager"
  },
  {
    label: 'Fee Manager',
    icon: <IconCoinRupee />,
    path: "/fee-management",
    group: "manager"
  },
  {
    label: 'Expense Manager',
    icon: <IconMoneybag />,
    path: "/expense-manager",
    group: "manager"
  },
  {
    label: 'Attendance ',
    icon: <IconFingerprint />,
    subMenu: [
      { label: 'Show Attendance', path: '/attendance/view', permission: 'view_attendance' },
      { label: 'IOT Attendance', path: '/attendance/iot', permission: 'iot_attendance' },
    ],
    group: "manager"
  },
  {
    label: 'Transport ',
    icon: <IconBus />,
    subMenu: [
      { label: 'Pickup Locations', path: '/transport/pickup-locations' },
      { label: 'Vehicles', path: '/transport/vehicles' },
    ],
    group: "manager"
  },
  {
    label: 'Exams & Results ',
    icon: <IconReportAnalytics />,
    subMenu: [
      { label: 'Setup Exam', path: '/exams' },
      { label: 'Update Result', path: '/exams/publish-result' },
      { label: 'Print Result', path: '/exams/print-result' },
    ],
    group: "manager"
  },
  {
    isHeader: true,
    label: "Reports",
    group: "reports"
  },
  {
    label: 'Reports',
    icon: <IconReport />,
    path: "/reports",
    group: "reports"
  },
  {
    label: 'Follow Up',
    icon: <IconPhoneOutgoing />,
    path: "/follow-up",
    group: "reports"
  },
  {
    isHeader: true,
    label: "Controls",
    group: "controls"
  },
  {
    label: 'Master Data',
    icon: <IconServer />,
    path: "/master-data",
    permission: "manageUsers",
    group: "controls"
  },
  {
    label: 'Website Config',
    icon: <IconDatabaseCog />,
    path: "/website-config",
    permission: "manageUsers",
    group: "controls"
  },
  {
    label: 'User Management',
    icon: <User />,
    path: "/user-management",
    permission: "manageUsers",
    group: "controls"
  },
  {
    label: 'Settings',
    icon: <IconSettings />,
    path: "/settings",
    permission: "manageUsers",
    group: "controls"
  }
];
