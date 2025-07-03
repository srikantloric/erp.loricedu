import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import { useEffect, useState } from 'react';

type NewAttendanceCalanderProps = {
  attendanceData: any[]
}
const NewAttendanceCalendar = ({ attendanceData }: NewAttendanceCalanderProps) => {

  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {

    const formattedEvents = attendanceData.map((record) => {
      const dateObj = record.timestamp.toDate();
      const date = dateObj.getFullYear() + '-' +
        String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
        String(dateObj.getDate()).padStart(2, '0'); // Convert timestamp to local date string
     
      let title = '❓ Unknown';
      let color = 'gray';

      if (record.status === 'present') {
        title = '✅ Present';
        color = 'green';
      } else if (record.status === 'absent') {
        title = '❌ Absent';
        color = 'red';
      } else if (record.status === 'leave') {
        title = '🟡 Leave';
        color = 'orange';
      }

      return { title, date, color };
    });

    setEvents(formattedEvents);

  }, [attendanceData])

  return (
    <FullCalendar
      plugins={[dayGridPlugin]}
      initialView="dayGridMonth"
      events={events}
      height="auto"
    />
  );
};

export default NewAttendanceCalendar;