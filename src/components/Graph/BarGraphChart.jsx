
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function BarGraphChart() {
    
const data = [
    {
      name: 'Jan',
      unpaid: 4000,
      paid: 2400,
      amt: 2400,
    },
    {
      name: '',
      unpaid: 3000,
      paid: 1398,
      amt: 2210,
    },
    {
      name: 'March',
      unpaid: 2000,
      paid: 9800,
      amt: 2290,
    },
    {
      name: '',
      unpaid: 2780,
      paid: 3908,
      amt: 2000,
    },
    {
      name: 'May',
      unpaid: 1890,
      paid: 4800,
      amt: 2181,
    },
    {
      name: '',
      unpaid: 2390,
      paid: 3800,
      amt: 2500,
    },
    {
      name: 'July',
      unpaid: 3490,
      paid: 4300,
      amt: 2100,
    },
    {
      name: '',
      unpaid: 3490,
      paid: 4300,
      amt: 2100,
    },
    {
      name: 'Spt',
      unpaid: 3490,
      paid: 4300,
      amt: 2100,
    },
    {
      name: '',
      unpaid: 3490,
      paid: 4300,
      amt: 2100,
    },
    {
      name: 'Nov',
      unpaid: 3490,
      paid: 4300,
      amt: 2100,
    },
    {
      name: '',
      unpaid: 3490,
      paid: 4300,
      amt: 2100,
    },
  ];
  
  
  return (
    <ResponsiveContainer height="100%" aspect={2}>
        <BarChart
          width="600px"
        height="600px"
        
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="paid" fill="#82ca9d" activeBar={<Rectangle fill="pink" stroke="blue" />} />
          <Bar dataKey="unpaid" fill="#8884d8" activeBar={<Rectangle fill="gold" stroke="purple" />} />
        </BarChart>
      </ResponsiveContainer>
  )
}

export default BarGraphChart