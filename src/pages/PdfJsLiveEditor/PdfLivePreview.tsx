import jsPDF from "jspdf";
import { useEffect, useState } from "react";

function PdfLivePreview() {
    const [pdfUrl, setPdfUrl] = useState<string>("");


    // Function to clip a rectangular image into a circular shape
    const getCircularImage = (src: string, size: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.crossOrigin = "Anonymous"; // Avoid CORS issues
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext("2d");

                if (!ctx) {
                    reject("Failed to get canvas context");
                    return;
                }

                // Create a circular clipping path
                ctx.beginPath();
                ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
                ctx.clip();

                // Draw a semi-circle at the bottom to clip the image
                ctx.beginPath();
                ctx.arc(size / 2, size, size / 2, 0, Math.PI, true);
                ctx.fillStyle = "white"; // Fill with white to mask the bottom half
                ctx.fill();

                // Adjust the image size to fit within the circle
                const aspectRatio = img.width / img.height;
                const newWidth = aspectRatio > 1 ? size : size * aspectRatio;
                const newHeight = aspectRatio > 1 ? size / aspectRatio : size;

                // Draw the image inside the circular clipped area
                ctx.drawImage(
                    img,
                    (canvas.width - newWidth) / 2,
                    (canvas.height - newHeight) / 2,
                    newWidth,
                    newHeight
                );

                // Get the circular image as a Data URL
                resolve(canvas.toDataURL("image/png"));
            };
            img.onerror = (err) => reject(`Error loading image: ${err}`);
        });
    };

    const generatePdf = async () => {
        const doc = new jsPDF();
        const imgSrc = "student-png-image.png"; // Replace with actual image URL
        const circleX = 50; // X center of the circle
        const circleY = 50; // Y center of the circle
        const radius = 25; // Radius of the circular frame

        try {
            // Convert rectangular image to circular clipped image
            const circularImage = await getCircularImage(imgSrc, radius * 4);

            // Draw the circle outline and fill it with gray color
            doc.setDrawColor(0);
            doc.setFillColor(200, 200, 200); // Gray color
            doc.circle(circleX, circleY, radius, "FD"); // "FD" for fill and stroke

            // Add the circular image slightly offset so it "pops out"
            doc.addImage(circularImage, "PNG", circleX - radius, circleY - radius - 5, radius * 2, radius * 2);
            // The `-5` offset makes the image pop out slightly from the circle

            // Generate PDF Blob and create URL
            const pdfBlob = doc.output("blob");
            const pdfBlobUrl = URL.createObjectURL(pdfBlob);
            setPdfUrl(pdfBlobUrl);
        } catch (error) {
            console.error("Error generating PDF:", error);
        }
    };

    // Auto-generate PDF on component mount
    useEffect(() => {
        generatePdf();
    }, []);

    return (
        <div
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "black",
            }}
        >
            {pdfUrl && (
                <iframe
                    src={pdfUrl}
                    style={{
                        width: "100%",
                        height: "100%",
                        border: "none",
                    }}
                ></iframe>
            )}
        </div>
    );
}

export default PdfLivePreview;
