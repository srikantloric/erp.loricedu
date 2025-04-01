import { getAppConfig } from "hooks/getAppConfig";
import jsPDF from "jspdf";
import { rankType } from "types/results";
import {
  POPPINS_BOLD,
  POPPINS_REGULAR,
  POPPINS_SEMIBOLD,
  TOPPER_HEADING,
  STAR_WATERMARK,
} from "utilities/Base64Url";

type rankTypeExtended = rankType & {
  studentName: string;
  totalFullMarks: number;
  percentageObtained: number;
  imageUrl: string;
};

export const TopperListGenerator = async (
  topperList: rankTypeExtended[],
  examName: string,
  session: string,
  className: string
): Promise<string> => {
  return new Promise(async (resolve) => {
    const config = getAppConfig();
    if (!config) {
      console.error("Error: App config not found.");
      return;
    }
    const {
      schoolName: SCHOOL_NAME,
      schoolAddress: SCHOOL_ADDRESS,
      schoolLogoBase64: SCHOOL_LOGO_BASE64,
    } = config;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageMargin = 10;
    const effectiveWidth =
      doc.internal.pageSize.getWidth() - (2 * pageMargin + 1);
    const effectiveHeight =
      doc.internal.pageSize.getHeight() - (2 * pageMargin + 1);

    // Load fonts
    doc.addFileToVFS("Poppins-Bold", POPPINS_BOLD);
    doc.addFont("Poppins-Bold", "Poppins", "bold");

    doc.addFileToVFS("Poppins-Regular", POPPINS_REGULAR);
    doc.addFont("Poppins-Regular", "Poppins", "normal");

    doc.addFileToVFS("Poppins-Semibold", POPPINS_SEMIBOLD);
    doc.addFont("Poppins-Semibold", "Poppins", "semibold");

    const addStarWatermarks = () => {
      // Adding star watermark
      const bigStarSize = 35; // Size for the big star
      const smallStarSize = 20; // Size for the small star

      // Big star
      doc.addImage(
        STAR_WATERMARK,
        "JPEG",
        effectiveWidth - 20,
        10,
        bigStarSize,
        bigStarSize
      );
      doc.addImage(
        STAR_WATERMARK,
        "JPEG",
        effectiveWidth - 10,
        effectiveHeight - 25,
        bigStarSize,
        bigStarSize
      );
      doc.addImage(STAR_WATERMARK, "JPEG", 25, 60, bigStarSize, bigStarSize);
      doc.addImage(STAR_WATERMARK, "JPEG", -15, 140, bigStarSize, bigStarSize);

      // Small star
      doc.addImage(
        STAR_WATERMARK,
        "JPEG",
        10,
        10,
        smallStarSize,
        smallStarSize
      );
      doc.addImage(
        STAR_WATERMARK,
        "JPEG",
        effectiveWidth - 15,
        effectiveHeight / 2 + 10,
        smallStarSize,
        smallStarSize
      );
      doc.addImage(
        STAR_WATERMARK,
        "JPEG",
        170,
        60,
        smallStarSize,
        smallStarSize
      );
    };

    addStarWatermarks();

    const addHeaderAndBorder = () => {
      const footerY = doc.internal.pageSize.getHeight() - pageMargin - 20;

      // School logos on both sides
      doc.addImage(SCHOOL_LOGO_BASE64, pageMargin + 5, footerY, 25, 20); // Left logo
      doc.addImage(
        SCHOOL_LOGO_BASE64,
        doc.internal.pageSize.getWidth() - pageMargin - 30,
        footerY,
        25,
        20
      ); // Right logo

      // School header
      doc.setFont("Poppins", "bold");
      doc.setFontSize(28);
      doc.setTextColor("#15497c");
      doc.text(
        SCHOOL_NAME.toUpperCase(),
        pageMargin + effectiveWidth / 2,
        footerY + 5,
        {
          align: "center",
        }
      );

      doc.setFont("Poppins", "semibold");
      doc.setFontSize(10);
      doc.text(
        "An English Medium School Based on CBSE Syllabus",
        pageMargin + effectiveWidth / 2,
        footerY + 10,
        {
          align: "center",
        }
      );

      doc.setFont("Poppins", "normal");
      doc.setFontSize(9);
      doc.text(SCHOOL_ADDRESS, pageMargin + effectiveWidth / 2, footerY + 15, {
        align: "center",
      });

      doc.setFont("Poppins", "semibold");
      doc.setFontSize(18);
    };

    addHeaderAndBorder();

    // Topper heading Image
    const headingHeight = 150;
    doc.addImage(
      TOPPER_HEADING,
      "JPEG",
      pageMargin,
      pageMargin,
      effectiveWidth,
      headingHeight
    );

    //Adding Exam name, Clas name and Session
    doc.setFont("Poppins", "bold");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.text(
      examName.toUpperCase() + " - " + "(" + session.toUpperCase() + ")",
      pageMargin + effectiveWidth / 2 - 50,
      pageMargin + 38
    );

    //Toper List
    const membersPerRow = topperList.length <= 3 ? topperList.length : 3;
    const cardWidth = effectiveWidth / membersPerRow;
    const cardHeight = 70;
    const xStart = pageMargin;
    const yStart = Math.min(
      effectiveHeight - pageMargin - 90,
      Math.max(
        pageMargin + 120,
        (effectiveHeight -
          Math.ceil(topperList.length / membersPerRow) * (cardHeight + 10)) /
          2 +
          pageMargin
      )
    );

    for (const [index, topper] of topperList.entries()) {
      const xOffset = xStart + (index % membersPerRow) * cardWidth;
      const yOffset =
        yStart + Math.floor(index / membersPerRow) * (cardHeight + 10);

      const topperImage = topper.imageUrl;

      const circleRadius = 25;
      const circleCenterX = xOffset + cardWidth / 2;
      const circleCenterY = yOffset + circleRadius;

      doc.setFillColor("#f0f0f0"); // Light gray background
      doc.circle(circleCenterX, circleCenterY, circleRadius, "F");

      // Add topper image on top of the circular background
      if (topperImage) {
        const imageWidth = 40;
        const imageHeight = 40;
        const imageYOffset = yOffset + 5;
        doc.addImage(
          topperImage,
          "JPEG",
          circleCenterX - imageWidth / 2,
          imageYOffset,
          imageWidth,
          imageHeight
        );
      }

      // Draw blue rectangle for topper details
      const rectX = xOffset + 20;
      const rectY = yOffset + 55;
      const rectWidth = cardWidth - 50;
      const rectHeight = 15;

      doc.setFillColor("#093d91"); // Blue color
      doc.rect(rectX + 5, rectY, rectWidth, rectHeight, "F");

      // Topper details inside the rectangle
      doc.setFontSize(10);
      doc.setFont("Poppins", "bold");
      doc.setTextColor(255, 255, 255); // White text color
      doc.text(
        `Rank: ${topper.rankObtained}`,
        rectX + rectWidth / 2 + 5,
        rectY + 4,
        {
          align: "center",
        }
      );
      doc.text(`${topper.studentName}`, rectX + rectWidth / 2 + 5, rectY + 8, {
        align: "center",
      });
      doc.text(
        `${topper.marksObtained}/${topper.totalFullMarks} | ${
          topper.percentageObtained.toFixed(2) + "%"
        }`,
        rectX + rectWidth / 2 + 5,
        rectY + 13,
        { align: "center" }
      );
    }

    const blob = doc.output("blob");
    const pdfUrl = URL.createObjectURL(blob);
    resolve(pdfUrl);
  });
};
