import { memo } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { ClassAttendanceSummary } from "types/AttendanceType";

interface AttendanceSummaryProps {
  data: ClassAttendanceSummary[];
}

function AttendanceBarChart({ data }: AttendanceSummaryProps) {
  return (
    <ResponsiveContainer height={350} width="100%">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="className" />
        <YAxis allowDecimals={false} />

        <Tooltip />
        <Legend />

        {/* Present */}
        <Bar
          dataKey="present"
          fill="#00C49F"
          name="Present"
          activeBar={<Rectangle fill="#00E5BF" stroke="#008E74" />}
        />

        {/* Absent */}
        <Bar
          dataKey="absent"
          fill="#FF8042"
          name="Absent"
          activeBar={<Rectangle fill="#FFA366" stroke="#CC6633" />}
        />

        {/* Leave */}
        <Bar
          dataKey="leave"
          fill="#8884d8"
          name="Leave"
          activeBar={<Rectangle fill="#AAA8FF" stroke="#5548B0" />}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default memo(AttendanceBarChart);
