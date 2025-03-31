import { getAppConfig } from "hooks/getAppConfig";
import { rankType } from "types/results";
import { getDesignModule } from "./Ranklists/DesignLoader";


type ExtendedRankType = rankType & {
  studentName: string;
  rollNumber: number;
  subjectMarks: { subject: string; marks: number }[];
  percentage: number;
};

export const ExamRankListGenerator = async (
  rankList: ExtendedRankType[],
  examName: string,
  session: string,
  className: string,
  fullMarks: { [subject: string]: number },
  theme?: string
): Promise<string> => {
  return new Promise(async (resolve, reject) => {

    const config = getAppConfig();
    if (!config) {
      console.error("Error: App config not found.");
      return;
    }

    try {
      // Use the default theme if none is provided
      const selectedTheme = theme || "theory-practical-design";
      console.log("Selected Theme: ", selectedTheme);
      const designModule = getDesignModule(selectedTheme);

      // Delegate the PDF generation to the design module
      const pdfUrl = await designModule.generatePDF(config,rankList,examName,session,className,fullMarks);

      resolve(pdfUrl);
    } catch (error) {
      reject(error);
    }
  });
};

