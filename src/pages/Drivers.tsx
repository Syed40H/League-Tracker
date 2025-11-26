import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { drivers } from "@/data/drivers";
import { storage } from "@/lib/storage";
import { LeaguePlayer } from "@/types/league";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const Drivers = () => {
  const [leaguePlayers, setLeaguePlayers] = useState<LeaguePlayer[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [selectedDriverId, setSelectedDriverId] = useState("");
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  // 🔁 Load league players from Supabase → then sync into localStorage
  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from("league_players")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error loading league_players from Supabase:", error);
        // Fallback to local storage if Supabase fails
        const localPlayers = storage.getLeaguePlayers();
        setLeaguePlayers(localPlayers);
        return;
      }

      if (data && Array.isArray(data)) {
        const loaded: LeaguePlayer[] = data.map((row: any) => ({
          id: row.id,
          name: row.name,
          driverId: row.driver_id,
        }));

        setLeaguePlayers(loaded);
        storage.setLeaguePlayers(loaded); // keep local in sync for standings display
      }
    } catch (err) {
      console.error("Unexpected error loading league players:", err);
      const localPlayers = storage.getLeaguePlayers();
      setLeaguePlayers(localPlayers);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const assignedDriverIds = leaguePlayers.map((p) => p.driverId);
  const availableDrivers = drivers.filter((d) => !assignedDriverIds.includes(d.id));

  const handleAddPlayer = async () => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can add league players.",
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

    // Insert into Supabase table
    const { error } = await supabase.from("league_players").insert({
      name: newPlayerName.trim(),
      driver_id: selectedDriverId,
    });

    if (error) {
      console.error("Error inserting league_player:", error);
      toast({
        title: "Add failed",
        description: "Could not save player to the server.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Player added",
      description: `${newPlayerName.trim()} assigned to ${
        drivers.find((d) => d.id === selectedDriverId)?.name || "driver"
      }`,
    });

    setNewPlayerName("");
    setSelectedDriverId("");

    // Reload from Supabase to keep ids in sync
    await fetchPlayers();
  };

  const handleRemovePlayer = async (playerId: string) => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can remove league players.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm("Remove this player from the league?");
    if (!confirmed) return;

    const { error } = await supabase.from("league_players").delete().eq("id", playerId);

    if (error) {
      console.error("Error deleting league_player:", error);
      toast({
        title: "Remove failed",
        description: "Could not remove player on the server.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Player removed",
      description: "Driver assignment has been removed.",
    });

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
                Assign a player from your league to an F1 driver ({leaguePlayers.length}/5)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isAdmin && (
                <p className="text-sm text-muted-foreground mb-3">
                  You can view league players, but only the admin can add or remove them.
                </p>
              )}
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
            <CardHeader>
              <CardTitle>Current Assignments</CardTitle>
              <CardDescription>Shared league player roster (from Supabase)</CardDescription>
            </CardHeader>
            <CardContent>
              {leaguePlayers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No players assigned yet. Add your first league player above.
                </p>
              ) : (
                <div className="space-y-3">
                  {leaguePlayers.map((player) => {
                    const driver = drivers.find((d) => d.id === player.driverId);
                    if (!driver) return null;

                    return (
                      <div
                        key={player.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-secondary border border-border hover:border-primary/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-4xl">{driver.flag}</div>
                          <div>
                            <div className="font-semibold text-lg">{player.name}</div>
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
