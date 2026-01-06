import { FeeMonth } from "../types/FeeMonth";


export function generateFeeMonths(
  session: string,
  paidMonths: string[] = []
): FeeMonth[] {

  const months = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March"
  ];

  let [startStr, endStr] = session.split("-");
  const start = Number(startStr);

  let end = Number(endStr.length === 2 ? startStr.slice(0, 2) + endStr : endStr);

  return months.map((month, idx) => {
    const year = idx < 9 ? start : end;

    const monthNum = (idx + 4) > 12 ? (idx - 8) : (idx + 4);
    const monthNumStr = String(monthNum).padStart(2, "0");

    const id = `FEE_${start}${end}_${monthNumStr}`;
    const monthYear = `${year}-${monthNumStr}`
    console.log(monthYear)

    return {
      id,
      month,
      year: year.toString(),
      session,
      status: paidMonths.includes(monthYear) ? "Paid" : "Pending",
    };
  });
}
