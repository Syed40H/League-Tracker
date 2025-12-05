import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, RotateCcw } from "lucide-react";
import { drivers, teams, teamColorByTeam } from "@/data/drivers";
import { LeaguePlayer } from "@/types/league";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { storage } from "@/lib/storage";

// Local type for overrides (matches storage)
type DriverTeamOverride = {
  team: string;
  teamColor: string;
};

const Drivers = () => {
  const [leaguePlayers, setLeaguePlayers] = useState<LeaguePlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const [teamOverrides, setTeamOverrides] = useState<
    Record<string, DriverTeamOverride>
  >({});
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // 🔹 Helper: load league players from Supabase
  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("league_players")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        console.error("Error loading league_players:", error);
        toast({
          title: "Error",
          description:
            error.message || "Could not load league players from the server.",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const mapped: LeaguePlayer[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          driverId: row.driver_id,
        }));
        setLeaguePlayers(mapped);
      }
    } catch (e) {
      console.error("Unexpected error loading league_players:", e);
      toast({
        title: "Error",
        description: "Unexpected error loading league players.",
        variant: "destructive",
      });
    }
  };

  // Load players + overrides on mount
  useEffect(() => {
    fetchPlayers();
    try {
      const overrides = storage.getDriverTeamOverrides();
      setTeamOverrides(overrides);
    } catch (e) {
      console.error("Error loading driver team overrides:", e);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assignedDriverIds = leaguePlayers.map((p) => p.driverId);
  const availableDrivers = drivers.filter(
    (d) => !assignedDriverIds.includes(d.id)
  );

  const handleAddPlayer = async () => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can add players.",
        variant: "destructive",
      });
      return;
    }

    if (!newPlayerName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a player name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDriverId) {
      toast({
        title: "Driver required",
        description: "Please select a driver",
        variant: "destructive",
      });
      return;
    }

    if (leaguePlayers.length >= 5) {
      toast({
        title: "Maximum reached",
        description: "You can only have 5 league players",
        variant: "destructive",
      });
      return;
    }

    // 🔹 Insert into Supabase
    const { data, error } = await supabase
      .from("league_players")
      .insert({
        name: newPlayerName.trim(),
        driver_id: selectedDriverId,
      })
      .select()
      .single();

    if (error) {
      console.error("Error inserting league_player:", error);
      toast({
        title: "Add failed",
        description: error.message || "Could not save player to the server.",
        variant: "destructive",
      });
      return;
    }

    const newPlayer: LeaguePlayer = {
      id: data.id,
      name: data.name,
      driverId: data.driver_id,
    };

    setLeaguePlayers((prev) => [...prev, newPlayer]);
    setNewPlayerName("");
    setSelectedDriverId("");

    toast({
      title: "Player added",
      description: `${newPlayer.name} assigned to ${
        drivers.find((d) => d.id === selectedDriverId)?.name
      }`,
    });

    // 🔁 keep in sync with DB
    await fetchPlayers();
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can remove players.",
        variant: "destructive",
      });
      return;
    }

    // 🔹 Delete from Supabase
    const { data, error } = await supabase
      .from("league_players")
      .delete()
      .eq("id", playerId)
      .select();

    console.log("Delete response", { data, error });

    if (error) {
      console.error("Error deleting league_player:", error);
      toast({
        title: "Remove failed",
        description:
          error.message || "Could not remove player from the server.",
        variant: "destructive",
      });
      return;
    }

    // Update local state
    setLeaguePlayers((prev) => prev.filter((p) => p.id !== playerId));

    toast({
      title: "Player removed",
      description: "Driver assignment has been removed",
    });

    // 🔁 Re-fetch to be 100% aligned with DB
    await fetchPlayers();
  };

  const handleResetAllPlayers = async () => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset league players.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      "This will remove ALL league players (but not the real F1 drivers). Are you sure?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("league_players")
      .delete()
      .neq("id", "");

    if (error) {
      console.error("Error resetting league_players:", error);
      toast({
        title: "Reset failed",
        description:
          error.message || "Could not reset league players on the server.",
        variant: "destructive",
      });
      return;
    }

    setLeaguePlayers([]);

    toast({
      title: "League players reset",
      description: "All league player assignments have been cleared.",
    });

    await fetchPlayers();
  };

  // 🔹 Change a player's assigned driver (and thus their F1 driver)
  const handleChangePlayerDriver = async (
    player: LeaguePlayer,
    newDriverId: string
  ) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can change driver assignments.",
        variant: "destructive",
      });
      return;
    }

    if (player.driverId === newDriverId) return;

    const { data, error } = await supabase
      .from("league_players")
      .update({ driver_id: newDriverId })
      .eq("id", player.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating league_player:", error);
      toast({
        title: "Update failed",
        description:
          error.message || "Could not update driver assignment on the server.",
        variant: "destructive",
      });
      return;
    }

    setLeaguePlayers((prev) =>
      prev.map((p) =>
        p.id === player.id ? { ...p, driverId: data.driver_id } : p
      )
    );

    const newDriver = drivers.find((d) => d.id === newDriverId);

    toast({
      title: "Driver updated",
      description: `${player.name} is now driving for ${
        newDriver ? `${newDriver.name} - ${newDriver.team}` : "new driver"
      }`,
    });

    await fetchPlayers();
  };

  // 🔹 Change an actual F1 driver's team (affects standings/constructors)
  const handleChangeDriverTeam = (driverId: string, newTeam: string) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can change F1 driver teams.",
        variant: "destructive",
      });
      return;
    }

    const baseColor = teamColorByTeam[newTeam] || "#6B7280"; // fallback gray
    storage.saveDriverTeamOverride(driverId, newTeam, baseColor);

    setTeamOverrides((prev) => ({
      ...prev,
      [driverId]: { team: newTeam, teamColor: baseColor },
    }));

    const driver = drivers.find((d) => d.id === driverId);

    toast({
      title: "Team updated",
      description: driver
        ? `${driver.name} is now set to ${newTeam}`
        : `Driver updated to ${newTeam}`,
    });
  };

  const handleResetDriverTeam = (driverId: string) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset F1 driver teams.",
        variant: "destructive",
      });
      return;
    }

    storage.clearDriverTeamOverride(driverId);

    setTeamOverrides((prev) => {
      const copy = { ...prev };
      delete copy[driverId];
      return copy;
    });

    const driver = drivers.find((d) => d.id === driverId);

    toast({
      title: "Team reset",
      description: driver
        ? `${driver.name} reverted to their original team`
        : "Driver team reset to default",
    });
  };

  const handleResetAllDriverTeams = () => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset F1 driver teams.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      "This will reset ALL custom F1 driver teams back to default. Continue?"
    );
    if (!confirmed) return;

    storage.resetDriverTeamOverrides();
    setTeamOverrides({});

    toast({
      title: "All teams reset",
      description: "All F1 drivers are back to their original teams.",
    });
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
            <h1 className="text-3xl font-bold text-foreground">Driver Setup</h1>
            <p className="text-muted-foreground mt-2">
              Assign league players and customize the F1 grid for your season.
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Add Player Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add League Player</CardTitle>
              <CardDescription>
                Assign a player from your league to an F1 driver (
                {leaguePlayers.length}/5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="playerName">Player Name</Label>
                  <Input
                    id="playerName"
                    placeholder="Enter player name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    disabled={!isAdmin}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="driver">F1 Driver</Label>
                  <Select
                    value={selectedDriverId}
                    onValueChange={setSelectedDriverId}
                    disabled={!isAdmin}
                  >
                    <SelectTrigger id="driver">
                      <SelectValue placeholder="Select driver" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {availableDrivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          {driver.flag} {driver.name} - {driver.team}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAddPlayer}
                    className="w-full"
                    disabled={!isAdmin || leaguePlayers.length >= 5}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Add Player
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current League Assignments */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>Current Assignments</CardTitle>
                <CardDescription>Your league player roster</CardDescription>
              </div>
              {isAdmin && leaguePlayers.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetAllPlayers}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset League Players
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {leaguePlayers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No players assigned yet. Add your first league player above.
                </p>
              ) : (
                <div className="space-y-3">
                  {leaguePlayers.map((player) => {
                    const currentDriver = drivers.find(
                      (d) => d.id === player.driverId
                    );
                    if (!currentDriver) return null;

                    // Drivers available for THIS player:
                    // all drivers not used by others + their current driver
                    const otherAssignedIds = leaguePlayers
                      .filter((p) => p.id !== player.id)
                      .map((p) => p.driverId);

                    const driversForThisPlayer = drivers.filter(
                      (d) =>
                        d.id === player.driverId ||
                        !otherAssignedIds.includes(d.id)
                    );

                    return (
                      <div
                        key={player.id}
                        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{currentDriver.flag}</div>
                          <div>
                            <div className="font-semibold text-lg">
                              {player.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {currentDriver.name} #{currentDriver.number} -{" "}
                              {currentDriver.team}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                          <div className="min-w-[220px]">
                            <Label className="text-xs mb-1 block">
                              Assigned F1 Driver
                            </Label>
                            <Select
                              disabled={!isAdmin}
                              value={player.driverId}
                              onValueChange={(value) =>
                                handleChangePlayerDriver(player, value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-popover max-h-64">
                                {driversForThisPlayer.map((d) => (
                                  <SelectItem key={d.id} value={d.id}>
                                    {d.flag} {d.name} - {d.team}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemovePlayer(player.id)}
                            disabled={!isAdmin}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 🔥 F1 Grid Team Editor */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <div>
                <CardTitle>F1 Grid Team Editor</CardTitle>
                <CardDescription>
                  Change which team each F1 driver belongs to for this league.
                  This affects standings and constructors.
                </CardDescription>
              </div>
              {isAdmin && Object.keys(teamOverrides).length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetAllDriverTeams}
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset All Teams
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {drivers.map((driver) => {
                  const override = teamOverrides[driver.id];
                  const effectiveTeam = override?.team ?? driver.team;
                  const effectiveColor =
                    override?.teamColor ?? driver.teamColor;

                  return (
                    <div
                      key={driver.id}
                      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-secondary/60 border border-border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-3xl">{driver.flag}</div>
                        <div>
                          <div className="font-semibold">
                            {driver.name} #{driver.number}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Current team:</span>
                            <span className="font-medium">
                              {effectiveTeam}
                            </span>
                            <span
                              className="inline-block h-3 w-6 rounded-full border border-border"
                              style={{ backgroundColor: effectiveColor }}
                            />
                            {override && (
                              <span className="text-xs text-primary/80">
                                (custom)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
                        <div className="min-w-[220px]">
                          <Label className="text-xs mb-1 block">
                            Set team for this league
                          </Label>
                          <Select
                            disabled={!isAdmin}
                            value={effectiveTeam}
                            onValueChange={(value) =>
                              handleChangeDriverTeam(driver.id, value)
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
                          onClick={() => handleResetDriverTeam(driver.id)}
                          disabled={!isAdmin || !override}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Reset
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Drivers;
