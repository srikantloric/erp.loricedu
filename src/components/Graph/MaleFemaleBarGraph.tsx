import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface DataItem {
    name: string;
    value: number;
}

const COLORS: string[] = ['var(--bs-green)', '#FF8042'];
const RADIAN = Math.PI / 180;

interface LabelProps {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    value: number;
}

interface MaleFemaleBarGraphProps {
    maleCount: number;
    femaleCount: number;
}

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }: LabelProps) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
        <text x={x} y={y} fill="#fff" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
            {`${value} (${(percent * 100).toFixed(0)}%)`}
        </text>
    );
};

const MaleFemaleBarGraph: React.FC<MaleFemaleBarGraphProps> = ({ maleCount, femaleCount }) => {
    const data: DataItem[] = [
        { name: 'Male', value: maleCount },
        { name: 'Female', value: femaleCount }
    ];

    return (
        <ResponsiveContainer height="100%" aspect={2}>
            <PieChart>
                <Pie
                    data={data}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

// Custom comparison function for memoization
const areEqual = (prevProps: MaleFemaleBarGraphProps, nextProps: MaleFemaleBarGraphProps) => {
    return (
        prevProps.maleCount === nextProps.maleCount &&
        prevProps.femaleCount === nextProps.femaleCount
    );
};

export default React.memo(MaleFemaleBarGraph, areEqual);
