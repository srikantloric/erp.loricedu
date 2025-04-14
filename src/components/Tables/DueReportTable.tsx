import MaterialTable, { Column } from "@material-table/core"
import { SCHOOL_FEE_MONTHS } from "config/schoolConfig";




const data = [
  {
    sl: 1,
    name: "Amit Sharma",
    fname: "Rajesh Sharma",
    contact: "9876543210",
    january: 100,
    february: 90,
    march: 95,
    april: 10000,
    may: 200,
    june: 95,
    july: 100,
    august: 90,
    september: 85,
    october: 88,
    november: 92,
    december: 99,
    paid: 1000,
    due: 200,
  },
  {
    sl: 2,
    name: "Priya Verma",
    fname: "Mahesh Verma",
    contact: "9876501234",
    january: 98,
    february: 95,
    march: 99,
    april: 100,
    may: 100,
    june: 98,
    july: 99,
    august: 100,
    september: 100,
    october: 95,
    november: 100,
    december: 100,
    paid: 1200,
    due: 0,
  },
  {
    sl: 3,
    name: "Ravi Kumar",
    fname: "Suresh Kumar",
    contact: "9898989898",
    january: 80,
    february: 85,
    march: 82,
    april: 78,
    may: 85,
    june: 79,
    july: 80,
    august: 76,
    september: 70,
    october: 72,
    november: 75,
    december: 80,
    paid: 800,
    due: 400,
  },
  {
    sl: 4,
    name: "Sunita Yadav",
    fname: "Hariom Yadav",
    contact: "9823456789",
    january: 90,
    february: 92,
    march: 91,
    april: 93,
    may: 89,
    june: 94,
    july: 92,
    august: 95,
    september: 97,
    october: 90,
    november: 93,
    december: 95,
    paid: 1100,
    due: 100,
  },
  {
    sl: 5,
    name: "Rahul Singh",
    fname: "Vikram Singh",
    contact: "9812345670",
    january: 88,
    february: 85,
    march: 87,
    april: 90,
    may: 84,
    june: 86,
    july: 85,
    august: 88,
    september: 84,
    october: 86,
    november: 87,
    december: 89,
    paid: 950,
    due: 150,
  },
  {
    sl: 6,
    name: "Neha Gupta",
    fname: "Dinesh Gupta",
    contact: "9832123456",
    january: 100,
    february: 100,
    march: 100,
    april: 100,
    may: 100,
    june: 100,
    july: 100,
    august: 100,
    september: 100,
    october: 100,
    november: 100,
    december: 100,
    paid: 1200,
    due: 0,
  },
  {
    sl: 7,
    name: "Sanjay Rathi",
    fname: "Prem Rathi",
    contact: "9845098765",
    january: 60,
    february: 65,
    march: 63,
    april: 70,
    may: 68,
    june: 65,
    july: 66,
    august: 60,
    september: 58,
    october: 62,
    november: 61,
    december: 64,
    paid: 700,
    due: 500,
  },
  {
    sl: 8,
    name: "Divya Joshi",
    fname: "Satish Joshi",
    contact: "9870001122",
    january: 95,
    february: 96,
    march: 97,
    april: 95,
    may: 94,
    june: 93,
    july: 95,
    august: 92,
    september: 93,
    october: 94,
    november: 95,
    december: 96,
    paid: 1150,
    due: 50,
  },
  {
    sl: 9,
    name: "Manish Bansal",
    fname: "Narayan Bansal",
    contact: "9850012345",
    january: 85,
    february: 80,
    march: 83,
    april: 88,
    may: 87,
    june: 89,
    july: 90,
    august: 85,
    september: 86,
    october: 88,
    november: 87,
    december: 85,
    paid: 1000,
    due: 100,
  },
  {
    sl: 10,
    name: "Anjali Mehra",
    fname: "Ramesh Mehra",
    contact: "9867891234",
    january: 75,
    february: 70,
    march: 73,
    april: 72,
    may: 74,
    june: 71,
    july: 70,
    august: 72,
    september: 74,
    october: 73,
    november: 70,
    december: 75,
    paid: 900,
    due: 300,
  }
];

type DueReportRow = {
  sl: number;
  name: string;
  fname: string;
  contact: string;
  january: number;
  february: number;
  march: number;
  april: number;
  may: number;
  june: number;
  july: number;
  august: number;
  september: number;
  october: number;
  november: number;
  december: number;
  paid: number;
  due: number;
};

function DueReportTable() {

  const baseColumns:Column<DueReportRow>[] = [
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

  const summationColumns = [
    {
      title: "Paid", field: "paid",
      cellStyle: {
        maxWidth: "90px",
        position: 'sticky',
        right:"90px",
        backgroundColor:"#fff",
         border: '1px solid #ccc'
      },
      headerStyle: {
        backgroundColor: '#0DAA58',
        color: "#000",
        maxWidth: "90px",
        position: 'sticky',
        right: "90px",
        zIndex: 2,
         border: '1px solid #ccc'
      }
    },
    {
      title: "Due", field: "due",
      cellStyle: {
        maxWidth: "90px",
        position: 'sticky',
        right:0,
        backgroundColor:"#fff",
        border: '1px solid #ccc'

      },
      headerStyle: {
        backgroundColor: '#FF8377',
        color: "#000",
        maxWidth: "90px",
        position: 'sticky',
        right: 0,
        zIndex: 2,
         border: '1px solid #ccc'
      }
    },
  ]

  const dynamicMonthColumns = SCHOOL_FEE_MONTHS.map(month => ({
    title: month.title.slice(0, 3),
    field: month.title.toLowerCase(),
    cellStyle: {
      maxWidth: "20px",
      border: '1px solid #ccc'

    },
    headerStyle: {
      backgroundColor: '#FFD55D',
      color: "#000",
      maxWidth: "20px",
      
    }
  }));


  const columns = [...baseColumns, ...dynamicMonthColumns, ...summationColumns];




  return (
    <MaterialTable
      style={{ display: "grid", overflow: "hidden", border: "1px solid oklch(.905 .013 255.508)", borderRadius: "10px", boxShadow: "none" }}
      data={data}
      columns={columns}
      options={{
        padding: 'dense',
        headerStyle: {
          whiteSpace: 'nowrap',
          border:"1px solid #ccc"
        },
        editCellStyle:{
          border:"1px solid #ccc"
        }
        // tableLayout: "fixed",
      }}
    />
  )
}

export default DueReportTable