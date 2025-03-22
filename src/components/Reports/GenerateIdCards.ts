import JSZip from "jszip"; // Import JSZip
import { saveAs } from "file-saver"; // For downloading the file
import jsPDF from "jspdf";
import { generateQRCodeBase64 } from "utilities/UtilitiesFunctions";

type IdCardDetailsType = {
  ID: string;
  Name: string;
};

export const GenerateIdCards = async (
  idCardData: IdCardDetailsType[]
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      const zip = new JSZip(); // Create a new JSZip instance
      const folder = zip.folder("ID_Cards"); // Create a folder for the ID cards

      for (let i = 0; i < idCardData.length; i++) {
        const doc = new jsPDF({
          orientation: "p",
          unit: "mm",
          format: [54.02, 85.68],
        });

        // Get page dimensions
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();

        // Image dimensions
        const imgWidth = 40; // Width of the image
        const imgHeight = 40; // Height of the image

        // Calculate x and y positions to center the image
        const xPos = (pageWidth - imgWidth) / 2;
        const yPos = (pageHeight - imgHeight) / 2;

        // doc.text("dsds", 10, 10);
        // doc.text("dsdsdsdds", 10, 20);
        console.log(idCardData[i].ID);
        const qrImage = await generateQRCodeBase64(idCardData[i].ID);

        doc.addImage(qrImage, xPos, yPos, imgWidth, imgHeight);

        doc.setDrawColor("#808080"); // RGB values for light gray

        // Smaller padding for the corner lines
        const padding = 0; // Adjust this for visible padding
        const cornerLength = 5; // Length of the corner lines

        // Top-left corner
        doc.line(xPos, yPos, xPos + cornerLength, yPos); // Horizontal line

        doc.line(
          xPos - padding,
          yPos - padding,
          xPos - padding,
          yPos - padding + cornerLength
        ); // Vertical line

        // Top-right corner
        doc.line(
          xPos + imgWidth + padding,
          yPos - padding,
          xPos + imgWidth + padding - cornerLength,
          yPos - padding
        ); // Horizontal line
        doc.line(
          xPos + imgWidth + padding,
          yPos - padding,
          xPos + imgWidth + padding,
          yPos - padding + cornerLength
        ); // Vertical line

        // Bottom-left corner
        doc.line(
          xPos - padding,
          yPos + imgHeight + padding,
          xPos - padding + cornerLength,
          yPos + imgHeight + padding
        ); // Horizontal line
        doc.line(
          xPos - padding,
          yPos + imgHeight + padding,
          xPos - padding,
          yPos + imgHeight + padding - cornerLength
        ); // Vertical line

        // Bottom-right corner
        doc.line(
          xPos + imgWidth + padding,
          yPos + imgHeight + padding,
          xPos + imgWidth + padding - cornerLength,
          yPos + imgHeight + padding
        ); // Horizontal line
        doc.line(
          xPos + imgWidth + padding,
          yPos + imgHeight + padding,
          xPos + imgWidth + padding,
          yPos + imgHeight + padding - cornerLength
        ); // Vertical line

        // Add title text below the image
        const title = idCardData[i].ID;
        const textXPos = pageWidth / 2; // Center the text horizontally
        const textYPos = yPos + imgHeight + 0.8; // Position the text 10 units below the image
        doc.setFontSize(8);
        doc.setTextColor("#808080");

        doc.text(title, textXPos, textYPos, { align: "center" });

        // setTimeout(() => {
        //   doc.save(`BACK_${idCardData[i].ID}`);
        // }, 500);
        // Convert PDF to Blob
        const pdfBlob = doc.output("blob");

        // Add the generated PDF to the ZIP folder with filename as student ID
        folder?.file(`BACK_${idCardData[i].ID}.pdf`, pdfBlob);

        // doc.addPage();
        // if (i === idCardData.length - 1) {
        //   const blob = doc.output("blob");
        //   const url = URL.createObjectURL(blob);
        //   resolve(url);
        // }
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "ID_Cards.zip"); // Download the ZIP file
      resolve("Id card generated ..");
    } catch (error) {
      reject(error);
    }
  });
};
