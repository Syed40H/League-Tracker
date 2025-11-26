import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2, RotateCcw } from "lucide-react";
import { drivers } from "@/data/drivers";
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

const Drivers = () => {
  const [leaguePlayers, setLeaguePlayers] = useState<LeaguePlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
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
          description: error.message || "Could not load league players from the server.",
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

  // Load players on mount
  useEffect(() => {
    fetchPlayers();
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

    // Update local state from returned row
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

    // 🔁 Re-fetch from DB to stay in sync (just in case)
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
    const { error } = await supabase
      .from("league_players")
      .delete()
      .eq("id", playerId);

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

    // 🔁 Re-fetch to be 100% sure we match the DB
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

    const { error } = await supabase.from("league_players").delete().neq("id", "");

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

    // 🔁 Ensure we’re in sync
    await fetchPlayers();
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
              Assign up to 5 league players to F1 drivers
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Add Player Form */}
          <Card className="mb-8">
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

          {/* Current Assignments */}
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
                    const driver = drivers.find(
                      (d) => d.id === player.driverId
                    );
                    if (!driver) return null;

                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{driver.flag}</div>
                          <div>
                            <div className="font-semibold text-lg">
                              {player.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {driver.name} #{driver.number} - {driver.team}
                            </div>
                          </div>
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
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Drivers;
