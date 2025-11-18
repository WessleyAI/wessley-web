// Demo workspace data - hardcoded for public demo access
// No database calls, no authentication required

import { Tables } from "@/supabase/types"

export const DEMO_WORKSPACE_ID = "cde0ea8e-07aa-4c59-a72b-ba0d56020484"

export const DEMO_WORKSPACE: Tables<"workspaces"> = {
  id: DEMO_WORKSPACE_ID,
  user_id: "00000000-0000-0000-0000-000000000000", // Dummy UUID
  name: "Scarlet",
  vehicle_signature: "scarlet-galloper-demo",
  status: "active",
  visibility: "public",
  description: "Demo workspace for Scarlet, a 2000 Hyundai Galloper restoration project",
  is_home: false,
  settings: {
    vehicle: {
      make: "Hyundai",
      model: "Galloper",
      year: 2000,
      nickname: "Scarlet",
      engine: "3.0L V6"
    }
  },
  created_at: "2025-01-15T00:00:00.000Z",
  updated_at: "2025-01-15T00:00:00.000Z",
  last_activity_at: "2025-01-15T00:00:00.000Z"
}

export const DEMO_VEHICLE: Tables<"vehicles"> = {
  id: "00000000-0000-0000-0000-000000000001",
  workspace_id: DEMO_WORKSPACE_ID,
  make: "Hyundai",
  model: "Galloper",
  year: 2000,
  engine_type: "3.0L V6",
  vin: "KMHJN81WPYU034521",
  nickname: "Scarlet",
  license_plate: null,
  mileage: "145,200",
  color: "Red",
  transmission: "Manual",
  fuel_type: "Gasoline",
  drive_type: "4WD",
  notes: "Classic 2000 Hyundai Galloper in restoration. Known for its rugged off-road capability.",
  is_active: true,
  created_at: "2025-01-15T00:00:00.000Z",
  updated_at: "2025-01-15T00:00:00.000Z"
}

// Check if a workspace ID is the demo workspace
export function isDemoWorkspace(workspaceId: string): boolean {
  return workspaceId === DEMO_WORKSPACE_ID
}

// Get demo workspace (always available, no auth required)
export function getDemoWorkspace(): Tables<"workspaces"> {
  return DEMO_WORKSPACE
}

// Get demo vehicle (always available, no auth required)
export function getDemoVehicle(): Tables<"vehicles"> {
  return DEMO_VEHICLE
}
