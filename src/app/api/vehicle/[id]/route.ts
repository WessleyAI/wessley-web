import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/vehicle/{id}
 *
 * Get vehicle details per api-contracts.md spec.
 * Returns vehicle information including make, model, year, and detected systems.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'invalid_input', message: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json(
        { error: 'unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check subscription status - vehicle data access is a paid feature
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_status")
      .eq("id", user.id)
      .single()

    if (profile?.subscription_status !== "active") {
      return NextResponse.json(
        {
          error: "subscription_required",
          message: "Vehicle data access requires an active subscription.",
          upgrade_url: "/pricing",
        },
        { status: 402 }
      )
    }

    // Query vehicle with workspace ownership check via RLS
    const { data: vehicle, error: vehicleError } = await supabase
      .from('vehicles')
      .select(`
        id,
        make,
        model,
        year,
        vin,
        engine_type,
        transmission_type,
        fuel_type,
        trim_level,
        electrical_voltage,
        body_style,
        drivetrain,
        created_at,
        workspace:workspaces!inner(
          id,
          user_id,
          name,
          vehicle_signature
        )
      `)
      .eq('id', id)
      .single()

    if (vehicleError || !vehicle) {
      console.error('[API /vehicle] Vehicle lookup error:', vehicleError)
      return NextResponse.json(
        { error: 'not_found', message: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Verify user owns the workspace (RLS should handle this, but double-check)
    const workspace = vehicle.workspace as { id: string; user_id: string; name: string; vehicle_signature: string }
    if (workspace.user_id !== user.id) {
      return NextResponse.json(
        { error: 'forbidden', message: 'Access denied' },
        { status: 403 }
      )
    }

    // Determine detected systems based on vehicle data
    // In a full implementation, this would come from Neo4j graph analysis
    const systems: string[] = []

    // Basic systems present in all vehicles
    systems.push('ignition', 'charging', 'starting')

    // Add systems based on vehicle characteristics
    if (vehicle.electrical_voltage === 12) {
      systems.push('lighting', 'accessories')
    }
    if (vehicle.electrical_voltage === 48) {
      systems.push('mild_hybrid', 'high_voltage')
    }
    if (vehicle.body_style && ['sedan', 'coupe', 'suv'].includes(vehicle.body_style.toLowerCase())) {
      systems.push('power_windows', 'power_locks', 'climate_control')
    }
    if (vehicle.year && vehicle.year >= 2010) {
      systems.push('infotainment', 'can_bus')
    }
    if (vehicle.year && vehicle.year >= 2015) {
      systems.push('adas', 'parking_sensors')
    }

    // Response per api-contracts.md spec
    return NextResponse.json({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      created_at: vehicle.created_at,
      systems: systems,
      // Extended fields beyond spec for completeness
      vin: vehicle.vin,
      engine_type: vehicle.engine_type,
      transmission_type: vehicle.transmission_type,
      fuel_type: vehicle.fuel_type,
      trim_level: vehicle.trim_level,
      electrical_voltage: vehicle.electrical_voltage,
      workspace_id: workspace.id,
      workspace_name: workspace.name
    })

  } catch (error) {
    console.error('[API /vehicle] Unhandled error:', error)
    return NextResponse.json(
      {
        error: 'internal_error',
        message: 'An unexpected error occurred',
        request_id: crypto.randomUUID()
      },
      { status: 500 }
    )
  }
}
