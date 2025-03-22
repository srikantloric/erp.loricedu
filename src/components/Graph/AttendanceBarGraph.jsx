import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PieChart, Pie, Cell } from 'recharts';

function AttendanceBarGraph() {
    
    const data = [
        { name: 'Present', value: 70 },
        { name: 'Absent', value: 30 }
      ];

    const COLORS = ['var(--bs-green)', '#FF8042'];
    const RADIAN = Math.PI / 180;

    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="#fff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <ResponsiveContainer height="100%" aspect={2}>
            <PieChart width={400} height={400}>
                <Pie
                    data={data}
                    cx={200}
                    cy={300}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {
                    data.map((entry, index) => (
                        <Cell key={`cell - ${index}`} fill={COLORS[index % COLORS.length]} />
                    ))
                    }
                </Pie>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}

export default AttendanceBarGraph;