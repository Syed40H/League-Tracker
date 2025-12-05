// src/lib/driverOverrides.ts
import { supabase } from "@/lib/supabaseClient";
import { drivers } from "@/data/drivers";
import { useQuery } from "@tanstack/react-query";
import type { TeamOverrideMap } from "@/lib/standings";

// Supabase table for overrides
const TABLE = "driver_team_overrides";

/**
 * Table structure in Supabase:
 *  driver_team_overrides:
 *   - driver_id (text, primary key)
 *   - new_team (text)
 *   - new_color (text)
 */

export type DriverTeamOverride = {
  driverId: string;
  newTeam: string;
  newColor: string;
};

/**
 * Load all team overrides from Supabase
 */
export async function fetchDriverTeamOverrides(): Promise<DriverTeamOverride[]> {
  const { data, error } = await supabase.from(TABLE).select("*");

  if (error) {
    console.error("❌ Error fetching team overrides:", error);
    return [];
  }

  return (
    data?.map((row: any) => ({
      driverId: row.driver_id,
      newTeam: row.new_team,
      newColor: row.new_color,
    })) ?? []
  );
}

/**
 * React Query hook so components can use overrides
 */
export function useDriverOverrides() {
  return useQuery({
    queryKey: ["driverTeamOverrides"],
    queryFn: fetchDriverTeamOverrides,
  });
}

/**
 * Convert override rows → simple lookup map used in standings & UI
 */
export function buildTeamOverrideMap(
  overrides: DriverTeamOverride[]
): TeamOverrideMap {
  const map: TeamOverrideMap = {};

  overrides.forEach((o) => {
    map[o.driverId] = {
      team: o.newTeam,
      teamColor: o.newColor,
    };
  });

  return map;
}

/**
 * Save/update a team override for one driver
 */
export async function upsertDriverTeamOverride(
  driverId: string,
  newTeam: string,
  newColor: string
): Promise<void> {
  const { error } = await supabase.from(TABLE).upsert(
    {
      driver_id: driverId,
      new_team: newTeam,
      new_color: newColor,
    },
    {
      onConflict: "driver_id",
    }
  );

  if (error) {
    console.error("❌ Error saving team override:", error);
    throw error;
  }
}

/**
 * Remove override → revert driver back to default team
 */
export async function deleteDriverTeamOverride(
  driverId: string
): Promise<void> {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("driver_id", driverId);

  if (error) {
    console.error("❌ Error deleting team override:", error);
  }
}

/**
 * Optional helper: return drivers with overrides applied.
 */
export async function getFinalDriverList() {
  const overrides = await fetchDriverTeamOverrides();
  const overrideMap = new Map(overrides.map((o) => [o.driverId, o]));

  return drivers.map((driver) => {
    const override = overrideMap.get(driver.id);

    if (!override) return driver;

    return {
      ...driver,
      team: override.newTeam,
      teamColor: override.newColor,
    };
  });
}
