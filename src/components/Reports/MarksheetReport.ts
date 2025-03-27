
import { marksheetType } from "types/results";
import { getAppConfig } from "hooks/getAppConfig";
import { getDesignModule } from "./Marksheets/DesignLoader";

export const MarksheetReportGenerator = async (
  resultData: marksheetType[],
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
      const pdfUrl = await designModule.generatePDF(resultData, config);

      resolve(pdfUrl);
    } catch (error) {
      reject(error);
    }


  });
};
