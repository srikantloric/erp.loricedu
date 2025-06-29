import MaterialTable, { Column } from "@material-table/core"
import { ExportCsv, ExportPdf } from "@material-table/exporters";


export type DueReportRow = {
  sl: number;
  name: string;
  fname: string;
  contact: string;
  paid: number;
  due: number;
  dueMonths: { month: string; value: number }[];
};

type Props = {
  data: DueReportRow[];
  selectedClass: string; // class name (e.g. '10th Grade')
  selectedSession: string; // session name (e.g. '2023-2024')
  selectedMonths?: string[]; // month names (e.g. ['January', 'February'])
};

function DueReportTable({ data = [], selectedMonths = [], selectedClass, selectedSession }: Props) {
  const baseColumns: Column<DueReportRow>[] = [
    {
      title: 'Sl.', field: 'sl',
      cellStyle: {
        maxWidth: "10px",
        border: '1px solid #ccc'
      },
      headerStyle: {
        backgroundColor: '#5D87FF',
        color: "#FFF",
        maxWidth: "10px",
        border: '1px solid #ccc'
      }
    },
    {
      title: 'Name', field: 'name',
      cellStyle: {
        maxWidth: "200px",
        border: '1px solid #ccc'
      },
      headerStyle: {
        backgroundColor: '#5D87FF',
        color: "#FFF",
        maxWidth: "200px",
        border: '1px solid #ccc'
      },
    },
    {
      title: 'Father Name', field: 'fname',
      cellStyle: {
        maxWidth: "200px",
        border: '1px solid #ccc'
      },
      headerStyle: {
        backgroundColor: '#5D87FF',
        color: "#FFF",
        maxWidth: "200px",
        border: '1px solid #ccc'
      }
    },
    {
      title: 'Contact', field: 'contact',
      cellStyle: {
        maxWidth: "200px",
        border: '1px solid #ccc'
      },
      headerStyle: {
        backgroundColor: '#5D87FF',
        color: "#FFF",
        maxWidth: "200px",
        border: '1px solid #ccc'
      }
    },
  ];

  // Dynamically add columns for each selected month
  const monthColumns: Column<DueReportRow>[] = (selectedMonths || []).map(monthName => ({
    title: monthName,
    field: monthName.toLowerCase(),
    render: (rowData: DueReportRow) => {
      const found = rowData.dueMonths?.find(dm => dm.month.toLowerCase() === monthName.toLowerCase());
      if (!found) return '-';
      if (found.value === 0) return '₹0';
      return `₹${found.value}`;
    },
    // Add customExport for export functionality
    customExport: (rowData: DueReportRow) => {
      const found = rowData.dueMonths?.find(dm => dm.month.toLowerCase() === monthName.toLowerCase());
      if (!found) return '-';
      return found.value === 0 ? '0' : `${found.value}`;
    },
    cellStyle: {
      maxWidth: "90px",
      border: '1px solid #ccc',
      textAlign: 'center',
    },
    headerStyle: {
      backgroundColor: '#FFD55D',
      color: "#000",
      maxWidth: "90px",
      border: '1px solid #ccc',
      textAlign: 'center',
    }
  }));

  const summationColumns: Column<DueReportRow>[] = [
    {
      title: "Paid Total", field: "paid", render: (rowData: DueReportRow) => {
        if (rowData.paid === 0) return '₹0';
        return `₹${rowData.paid}`;
      },
      cellStyle: {
        maxWidth: "90px",
        position: 'sticky' as any,
        right: "90px",
        backgroundColor: "#fff",
        border: '1px solid #ccc'
      },
      headerStyle: {
        backgroundColor: '#0DAA58',
        color: "#000",
        maxWidth: "90px",
        position: 'sticky' as any,
        right: "90px",
        zIndex: 2,
        border: '1px solid #ccc'
      }
    },
    {
      title: "Due Total", field: "due", render: (rowData: DueReportRow) => {
        if (rowData.due === 0) return '₹0';
        return `₹${rowData.due}`;
      },
      cellStyle: {
        maxWidth: "90px",
        position: 'sticky' as any,
        right: 0,
        backgroundColor: "#fff",
        border: '1px solid #ccc'
      },
      headerStyle: {
        backgroundColor: '#FF8377',
        color: "#000",
        maxWidth: "90px",
        position: 'sticky' as any,
        right: 0,
        zIndex: 2,
        border: '1px solid #ccc'
      }
    },
  ];

  const columns = [...baseColumns, ...monthColumns, ...summationColumns];

  return (
    <MaterialTable
      style={{ display: "grid", overflow: "hidden", border: "1px solid oklch(.905 .013 255.508)", borderRadius: "10px", boxShadow: "none" }}
      data={data}
      columns={columns}
      renderSummaryRow={({ columns, column, index, data, currentData }) => {
        if (column.field === 'contact') {
          return { value: 'Total', style: { fontWeight: 'bold' } };
        }
        // Handle dynamic month columns
        if (selectedMonths && selectedMonths.length > 0 && column.field && selectedMonths.map(m => m.toLowerCase()).includes(String(column.field).toLowerCase())) {
          const monthName = String(column.field);
          const total = data.reduce((sum, row) => {
            const found = row.dueMonths?.find(dm => dm.month.toLowerCase() === monthName.toLowerCase());
            return sum + (found ? found.value : 0);
          }, 0);
          return { value: `₹${total}`, style: { fontWeight: 'bold', textAlign: 'center' } };
        }
        // Paid total
        if (column.field === 'paid') {
          const totalPaid = data.reduce((sum, row) => sum + (row.paid || 0), 0);
          return { value: `₹${totalPaid}`, style: { fontWeight: 'bold', textAlign: 'center' } };
        }
        // Due total
        if (column.field === 'due') {
          const totalDue = data.reduce((sum, row) => sum + (row.due || 0), 0);
          return { value: `₹${totalDue}`, style: { fontWeight: 'bold', textAlign: 'center' } };
        }

        return null;
      }}
      options={{
        pageSizeOptions: [5, 10, 20, 50, 100],
        pageSize: 10,
        padding: 'dense',
        headerStyle: {
          whiteSpace: 'nowrap',
          border: "1px solid #ccc"
        },
        editCellStyle: {
          border: "1px solid #ccc"
        },
        exportAllData: true,
        exportMenu: [
          {
            label: 'Export PDF',
            exportFunc: (cols, data) => {
              ExportPdf(cols, data, `Due Report [${selectedMonths.join(', ')}] (${selectedClass} , ${selectedSession})`);
            }
          },
          {
            label: 'Export CSV',
            exportFunc: (cols, data) => {
              ExportCsv(cols, data, `Due Report [${selectedMonths.join(', ')}] (${selectedClass} , ${selectedSession})`);
            }
          }
        ]
      }}
    />
  )
}

export default DueReportTable