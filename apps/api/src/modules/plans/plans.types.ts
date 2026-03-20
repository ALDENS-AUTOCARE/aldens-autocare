export type CapabilityDto = {
  includedBookings: number;
  allowsPremiumServices: boolean;
  allowsPriorityBooking: boolean;
  allowsFleetDashboard: boolean;
};

export type PlanCapabilities = CapabilityDto;
