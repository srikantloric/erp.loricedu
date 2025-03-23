import React from "react";

function LSPage({ children }) {
  return (
    <div className="main-content-area" style={{ padding: "20px 25px" }}>
      <div>{children}</div>
    </div>
  );
}

export default LSPage;
