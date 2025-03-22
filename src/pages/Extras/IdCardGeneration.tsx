import { Button, Input, Sheet, Stack } from "@mui/joy";
import Navbar from "components/Navbar/Navbar";
import { GenerateIdCards } from "components/Reports/GenerateIdCards";
import LSPage from "components/Utils/LSPage";
import PageContainer from "components/Utils/PageContainer";
import { useState } from "react";
import * as XLSX from "xlsx";

type IdCardDetailsType = {
  ID: string;
  Name: string;
};
function IdCardGeneration() {
  const [idCards, setIdCards] = useState<IdCardDetailsType[]>([]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  // Function to handle Excel file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json<IdCardDetailsType>(worksheet);

        // Set the users data from Excel file
        setIdCards(json);
        console.log(json);
      };
      reader.readAsBinaryString(file);
    }
  };
  const handleGenerateBtn = async () => {
    console.log("button clicked.");
    const pdf = await GenerateIdCards(idCards);
    console.log("url",pdf);
    setPdfUrl(pdf);
  };

  return (
    <PageContainer>
      <Navbar />
      <LSPage>
        <Stack direction="row">
          <Input type="file" onChange={handleFileUpload}></Input>
          <Button onClick={handleGenerateBtn}>Generate</Button>
        </Stack>
        <Sheet>
          {/* {pdfUrl && ( */}
          <iframe
            src={pdfUrl!}
            title="Generated ID Cards"
            width="600"
            height="800"
            style={{ border: "1px solid black", marginTop: "20px" }}
          />
          {/* )} */}
        </Sheet>
      </LSPage>
    </PageContainer>
  );
}

export default IdCardGeneration;
