import { rankType } from "types/results";


export type rankDoctype = {
  class: number;
  lastUpdated: Date;
  studentRanks: rankType[];
};
