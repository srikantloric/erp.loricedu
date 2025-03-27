import { MarksheetDesign1 } from "./Designs/MarksheetDesign1";
import { MarksheetDesign2 } from "./Designs/MarksheetDesign2";

export const getDesignModule = (theme: string) => {
  switch (theme.toLowerCase()) {
    case "total-pass-design":
      return MarksheetDesign1;
    case "theory-practical-design":
    default:
      return MarksheetDesign2;
  }
};