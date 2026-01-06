export interface FeeMonth {
    id: string;
    month: string; //2025-04
    year: string;
    session: string;
    status: "Paid" | "Added" | "Pending";
}