import { ComponentClass, FunctionComponent } from "react";

// material-ui
import { SvgIconTypeMap } from "@mui/material";
import { OverridableComponent } from "@mui/material/OverridableComponent";

// third-party
import { Icon } from "iconsax-react";

// ==============================|| TYPES - ROOT  ||============================== //

export type KeyedObject = {
  [key: string]: string | number | KeyedObject | any;
};

export type OverrideIcon =
  | (OverridableComponent<SvgIconTypeMap<{}, "svg">> & {
    muiName: string;
  })
  | ComponentClass<any>
  | FunctionComponent<any>
  | Icon;

export interface GenericCardProps {
  title?: string;
  primary?: string | number | undefined;
  secondary?: string;
  content?: string;
  image?: string;
  dateTime?: string;
  iconPrimary?: OverrideIcon;
  color?: string;
  size?: string;
}


export type SchoolConfigType = {
  schoolName: string,
  schoolAddress: string,
  schoolEmail: string,
  schoolContact: string,
  schoolLogo: string,
  schoolWebsite: string,
  schoolLogoBase64: string

}