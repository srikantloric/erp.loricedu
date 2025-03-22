import React from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import LSPage from "../../components/Utils/LSPage";
import PageContainer from "../../components/Utils/PageContainer";
function Students() {
  return (
    <>
   
   <PageContainer>
        <Navbar />
        <LSPage>
          Students Details
        </LSPage>
      </PageContainer>
      
    </>
  );
}

export default Students;
