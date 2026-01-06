export const getMonthString = (monthName: string, year: string) => {
    const monthMap: any = {
        April: "04", May: "05", June: "06", July: "07", August: "08",
        September: "09", October: "10", November: "11", December: "12",
        January: "01", February: "02", March: "03",
    };
    return `${year}-${monthMap[monthName]}`;
};