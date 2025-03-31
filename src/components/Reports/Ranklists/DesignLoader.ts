import { RankListDesign1 } from "./Designs/RanklistDesign1";
import { RankListDesign2 } from "./Designs/RanklistDesign2";

export const getDesignModule = (theme: string) => {
  switch (theme.toLowerCase()) {
    case "total-pass-design":
      return RankListDesign1;
    case "theory-practical-design":
    default:
      return RankListDesign2;
  }
};