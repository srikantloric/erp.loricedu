import { MarksheetDesign1 } from "./Designs/MarksheetDesign1";
import { MarksheetDesign2 } from "./Designs/MarksheetDesign2";
import { MarksheetDesign3 } from "./Designs/MarksheetDesign3";

export const getDesignModule = (theme: string) => {
  switch (theme.toLowerCase()) {
    case "total-pass-design":
      return MarksheetDesign1;
    case "theory-practical-design":
      return MarksheetDesign2;
    case "new-design":
      return MarksheetDesign3
    default:
      return MarksheetDesign2;
  }
};