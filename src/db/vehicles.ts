import { createClient } from "@/lib/supabase/client"
import { TablesInsert, TablesUpdate } from "@/supabase/types"

export const createVehicle = async (
  vehicle: TablesInsert<"vehicles">
) => {
  const supabase = createClient()
  const { data: createdVehicle, error } = await supabase
    .from("vehicles")
    .insert([vehicle])
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return createdVehicle
}

export const getVehiclesByWorkspaceId = async (workspaceId: string) => {
  const supabase = createClient()
  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (!vehicles) {
    throw new Error(error.message)
  }

  return vehicles
}

export const updateVehicle = async (
  vehicleId: string,
  vehicle: TablesUpdate<"vehicles">
) => {
  const supabase = createClient()
  const { data: updatedVehicle, error } = await supabase
    .from("vehicles")
    .update(vehicle)
    .eq("id", vehicleId)
    .select("*")
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return updatedVehicle
}

export const deleteVehicle = async (vehicleId: string) => {
  const supabase = createClient()
  const { error } = await supabase
    .from("vehicles")
    .delete()
    .eq("id", vehicleId)

  if (error) {
    throw new Error(error.message)
  }

  return true
}