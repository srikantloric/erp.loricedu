// types.ts
export interface SubMenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  permission?: string; // required permission to see this submenu
}

export interface MenuItem {
  label: string;
  path?: string; // optional if it has submenus
  icon?: React.ReactNode;
  subMenu?: SubMenuItem[];
  permission?: string; // required permission to see this menu
  isHeader?: boolean,
  group?: string;
}