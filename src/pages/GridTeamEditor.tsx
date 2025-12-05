// src/pages/GridTeamEditor.tsx
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { drivers, teams, teamColorByTeam } from "@/data/drivers";
import {
  useDriverOverrides,
  buildTeamOverrideMap,
  upsertDriverTeamOverride,
  deleteDriverTeamOverride,
} from "@/lib/driverOverrides";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

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

const GridTeamEditor = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: overrides = [],
    isLoading,
    error,
  } = useDriverOverrides();

  const overrideMap = useMemo(
    () => buildTeamOverrideMap(overrides || []),
    [overrides]
  );

  const handleChangeTeam = async (driverId: string, newTeam: string) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can edit the F1 grid teams.",
        variant: "destructive",
      });
      return;
    }

    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    const newColor = teamColorByTeam[newTeam] ?? driver.teamColor;

    try {
      await upsertDriverTeamOverride(driverId, newTeam, newColor);

      // 🔁 refresh overrides everywhere (Index, etc.)
      await queryClient.invalidateQueries({
        queryKey: ["driverTeamOverrides"],
      });

      toast({
        title: "Team updated",
        description: `${driver.name} is now in ${newTeam}`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Update failed",
        description: e?.message || "Could not save team change to the server.",
        variant: "destructive",
      });
    }
  };

  const handleResetDriver = async (driverId: string) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset teams.",
        variant: "destructive",
      });
      return;
    }

    const driver = drivers.find((d) => d.id === driverId);
    if (!driver) return;

    try {
      await deleteDriverTeamOverride(driverId);

      await queryClient.invalidateQueries({
        queryKey: ["driverTeamOverrides"],
      });

      toast({
        title: "Team reset",
        description: `${driver.name} has been reset to ${driver.team}`,
      });
    } catch (e: any) {
      console.error(e);
      toast({
        title: "Reset failed",
        description: e?.message || "Could not reset this driver.",
        variant: "destructive",
      });
    }
  };

  if (error) {
    console.error(error);
  }

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
              updates driver & constructor standings for everyone using this
              Supabase database.
            </p>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-6">
          <Card>
            <CardHeader className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-1 text-primary" />
              <div>
                <CardTitle className="text-base">How saving works</CardTitle>
                <CardDescription>
                  Changes are{" "}
                  <span className="font-semibold">saved instantly</span> to
                  Supabase when you pick a new team. Your friends will see the
                  updated grid next time they load the site.
                </CardDescription>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Teams</CardTitle>
              <CardDescription>
                Select a new team for any driver, or reset them back to the
                default 2025 grid.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading current team overrides…
                </p>
              ) : (
                <div className="space-y-3">
                  {drivers.map((driver) => {
                    const override = overrideMap[driver.id];
                    const currentTeam = override?.team ?? driver.team;
                    const currentColor =
                      override?.teamColor ?? driver.teamColor;

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
                              {override && (
                                <span className="text-xs text-primary">
                                  (overridden)
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
                              disabled={!isAdmin}
                              value={currentTeam}
                              onValueChange={(value) =>
                                handleChangeTeam(driver.id, value)
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
                            disabled={!isAdmin || !override}
                            onClick={() => handleResetDriver(driver.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Reset
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

export default GridTeamEditor;
