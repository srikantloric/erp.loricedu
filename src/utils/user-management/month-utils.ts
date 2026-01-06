export const ACADEMIC_MONTHS = [
  "2025-04",
  "2025-05",
  "2025-06",
  "2025-07",
  "2025-08",
  "2025-09",
  "2025-10",
  "2025-11",
  "2025-12",
  "2026-01",
  "2026-02",
  "2026-03"
];

export const monthName = (m: string) => {
  const [y, mm] = m.split("-");
  const d = new Date(+y, +mm - 1, 1);
  return d.toLocaleString("en", { month: "short" });
};
