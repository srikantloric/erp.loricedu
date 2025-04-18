export type TransportLocationType = {
    locationId: string,
    distance: string,
    monthlyCharge: number,
    pickupPointName: string
}

export type TransportVehicleType = {
    vehicleId?: string;
    vehicleName: string;
    driverName: string;
    vehicleContact: string;
    conductorName: string;
    registrationNumber: string;
    totalSeat: number;
    licenseDate: string;
    rcDate: string;
    insuranceDate: string;
    pollutionDate: string;
    studentsAllocated?: number,
    seatsAvailable?: number
}
