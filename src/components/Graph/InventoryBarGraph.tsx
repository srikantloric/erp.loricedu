import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
    { name: 'Jan', previousSession: 3000, currentSession: 4000 },
    { name: 'Feb', previousSession: 2800, currentSession: 3200 },
    { name: 'Mar', previousSession: 3500, currentSession: 4500 },
    { name: 'Apr', previousSession: 2700, currentSession: 3900 },
    { name: 'May', previousSession: 2900, currentSession: 3700 },
    { name: 'Jun', previousSession: 3100, currentSession: 4200 },
    { name: 'Jul', previousSession: 3300, currentSession: 4600 },
    { name: 'Aug', previousSession: 3400, currentSession: 4700 },
    { name: 'Sep', previousSession: 3200, currentSession: 4300 },
    { name: 'Oct', previousSession: 3100, currentSession: 4100 },
    { name: 'Nov', previousSession: 3000, currentSession: 4000 },
    { name: 'Dec', previousSession: 2800, currentSession: 3900 },
];

function InventoryBarGraph() {
    return (
        <ResponsiveContainer height="100%" aspect={2}>
            <BarChart
                data={data}
                margin={{ top: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip />
                <Legend />
                <Bar dataKey="previousSession" fill="#8884d8" activeBar={<Rectangle fill="gold" stroke="purple" />} name='FY 2024-25' />
                <Bar dataKey="currentSession" fill="#82ca9d" activeBar={<Rectangle fill="pink" stroke="blue" />} name='FY 2025-26' />
            </BarChart>
        </ResponsiveContainer>
    );
}

export default InventoryBarGraph;
