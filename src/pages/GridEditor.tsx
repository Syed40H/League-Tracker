import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, RotateCcw } from "lucide-react";

import { drivers, teams, teamColorByTeam } from "@/data/drivers";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

import {
  fetchDriverTeamOverrides,
  upsertDriverTeamOverride,
  deleteDriverTeamOverride,
  type DriverTeamOverride,
} from "@/lib/driverOverrides";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type OverrideMap = Record<string, DriverTeamOverride>;

const GridEditor = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [overrides, setOverrides] = useState<OverrideMap>({});
  const [loading, setLoading] = useState(true);
  const [savingDriverId, setSavingDriverId] = useState<string | null>(null);

  // Load overrides from Supabase on mount
  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchDriverTeamOverrides();
        const map: OverrideMap = {};
        data.forEach((o) => {
          map[o.driverId] = o;
        });
        setOverrides(map);
      } catch (err) {
        console.error("Error loading driver overrides:", err);
        toast({
          title: "Error",
          description: "Could not load team overrides from the server.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getCurrentTeam = (driverId: string, defaultTeam: string) =>
    overrides[driverId]?.newTeam || defaultTeam;

  const getCurrentColor = (driverId: string, defaultColor: string) =>
    overrides[driverId]?.newColor || defaultColor;

  const handleChangeTeam = async (driverId: string, newTeam: string) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can change the F1 grid.",
        variant: "destructive",
      });
      return;
    }

    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const newColor =
      teamColorByTeam[newTeam] || // standard team colors
      driver.teamColor; // fallback to original color

    setSavingDriverId(driverId);
    try {
      await upsertDriverTeamOverride(driverId, newTeam, newColor);

      setOverrides((prev) => ({
        ...prev,
        [driverId]: { driverId, newTeam, newColor },
      }));

      toast({
        title: "Team updated",
        description: `${driver.name} now races for ${newTeam}`,
      });
    } catch (err: any) {
      console.error("Error saving override:", err);
      toast({
        title: "Save failed",
        description:
          err?.message || "Could not save the new team to the server.",
        variant: "destructive",
      });
    } finally {
      setSavingDriverId(null);
    }
  };

  const handleResetDriver = async (driverId: string) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset the F1 grid.",
        variant: "destructive",
      });
      return;
    }

    setSavingDriverId(driverId);
    try {
      await deleteDriverTeamOverride(driverId);

      setOverrides((prev) => {
        const copy = { ...prev };
        delete copy[driverId];
        return copy;
      });

      const driver = drivers.find((d) => d.id === driverId);

      toast({
        title: "Reset successful",
        description: driver
          ? `${driver.name} reverted to their default team (${driver.team}).`
          : "Driver reverted to default team.",
      });
    } catch (err: any) {
      console.error("Error deleting override:", err);
      toast({
        title: "Reset failed",
        description:
          err?.message || "Could not reset this driver on the server.",
        variant: "destructive",
      });
    } finally {
      setSavingDriverId(null);
    }
  };

  const handleResetAll = async () => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset the F1 grid.",
        variant: "destructive",
      });
      return;
    }

    const confirm = window.confirm(
      "This will clear ALL custom team assignments for the F1 grid. Continue?"
    );
    if (!confirm) return;

    try {
      // Hard reset: delete all rows from overrides table
      const { error } = await (await import("@/lib/supabaseClient")).supabase
        .from("driver_team_overrides")
        .delete()
        .neq("driver_id", "");

      if (error) throw error;

      setOverrides({});
      toast({
        title: "Grid reset",
        description: "All F1 drivers are back to their default teams.",
      });
    } catch (err: any) {
      console.error("Error resetting all overrides:", err);
      toast({
        title: "Reset failed",
        description:
          err?.message || "Could not reset the F1 grid on the server.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="racing-gradient min-h-screen">
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <Link to="/">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>

            <h1 className="text-3xl font-bold text-foreground">
              F1 Grid Team Editor
            </h1>
            <p className="text-muted-foreground mt-2">
              Change which team each F1 driver belongs to for this league. This
              affects standings and constructors.
            </p>

            {!isAdmin && (
              <p className="mt-2 text-sm text-yellow-500">
                You&apos;re not logged in as admin, so changes are disabled.
              </p>
            )}
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <CardTitle>Edit F1 Driver Teams</CardTitle>
                <CardDescription>
                  Overrides are saved in Supabase, so your whole league sees the
                  same grid.
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetAll}
                disabled={!isAdmin}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset Entire Grid
              </Button>
            </CardHeader>

            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">
                  Loading current team overrides…
                </p>
              ) : (
                <div className="space-y-3">
                  {drivers.map((driver) => {
                    const currentTeam = getCurrentTeam(driver.id, driver.team);
                    const currentColor = getCurrentColor(
                      driver.id,
                      driver.teamColor
                    );

                    return (
                      <div
                        key={driver.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{driver.flag}</div>
                          <div>
                            <div className="font-semibold text-lg">
                              {driver.name} #{driver.number}
                            </div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <span
                                className="inline-block h-3 w-3 rounded-full"
                                style={{ backgroundColor: currentColor }}
                              />
                              <span>{currentTeam}</span>
                              {currentTeam !== driver.team && (
                                <span className="text-xs text-primary ml-1">
                                  (was {driver.team})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                          <div className="min-w-[220px]">
                            <Label className="text-xs mb-1 block">
                              Team for this league
                            </Label>
                            <Select
                              value={currentTeam}
                              disabled={!isAdmin || savingDriverId === driver.id}
                              onValueChange={(team) =>
                                handleChangeTeam(driver.id, team)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover max-h-64">
                                {teams.map((team) => (
                                  <SelectItem key={team} value={team}>
                                    {team}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            disabled={
                              !isAdmin ||
                              savingDriverId === driver.id ||
                              !overrides[driver.id]
                            }
                            onClick={() => handleResetDriver(driver.id)}
                          >
                            <Save className="mr-2 h-4 w-4 rotate-180" />
                            Reset to default
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default GridEditor;
