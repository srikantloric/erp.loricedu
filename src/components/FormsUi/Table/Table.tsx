import * as React from "react";

const tableWrapperStyle: React.CSSProperties = {
  width: "100%",
  overflowX: "auto",
  border: "1px solid #e5e7eb",
  borderRadius: "8px",
  background: "#fff",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "0.95rem",
};

const headerStyle: React.CSSProperties = {
  background: "#f9fafb",
  fontWeight: 600,
};

const bodyStyle: React.CSSProperties = {};

const footerStyle: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  background: "#f3f4f6",
  fontWeight: 500,
};

const rowStyle: React.CSSProperties = {
  borderBottom: "1px solid #e5e7eb",
  transition: "background 0.2s",
};

const headCellStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  textAlign: "left",
  verticalAlign: "middle",
  fontWeight: 500,
  color: "#6b7280",
  background: "#f9fafb",
};

const cellStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  verticalAlign: "middle",
};

const captionStyle: React.CSSProperties = {
  marginTop: "1rem",
  fontSize: "0.95rem",
  color: "#6b7280",
};

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ style, ...props }, ref) => (
  <div style={tableWrapperStyle}>
    <table ref={ref} style={{ ...tableStyle, ...style }} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ style, ...props }, ref) => (
  <thead ref={ref} style={{ ...headerStyle, ...style }} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ style, ...props }, ref) => (
  <tbody ref={ref} style={{ ...bodyStyle, ...style }} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ style, ...props }, ref) => (
  <tfoot ref={ref} style={{ ...footerStyle, ...style }} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ style, ...props }, ref) => (
  <tr ref={ref} style={{ ...rowStyle, ...style }} {...props} />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ style, ...props }, ref) => (
  <th ref={ref} style={{ ...headCellStyle, ...style }} {...props} />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ style, ...props }, ref) => (
  <td ref={ref} style={{ ...cellStyle, ...style }} {...props} />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ style, ...props }, ref) => (
  <caption ref={ref} style={{ ...captionStyle, ...style }} {...props} />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};