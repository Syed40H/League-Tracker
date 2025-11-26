import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Trophy, Zap, TrendingUp, Award, RotateCcw } from "lucide-react";
import { races } from "@/data/races";
import { drivers } from "@/data/drivers";
import { storage } from "@/lib/storage";
import { RaceResult } from "@/types/league";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabaseClient";

const RaceEntry = () => {
  const { raceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAuth();

  const race = races.find((r) => r.id === Number(raceId));
  const [topTen, setTopTen] = useState<string[]>(Array(10).fill(""));
  const [driverOfTheDay, setDriverOfTheDay] = useState("");
  const [fastestLap, setFastestLap] = useState("");
  const [mostOvertakes, setMostOvertakes] = useState("");
  const [cleanestDriver, setCleanestDriver] = useState("");
  const [loading, setLoading] = useState(true);

  // Load race result from Supabase (shared) → then fallback to localStorage
  useEffect(() => {
    const loadResult = async () => {
      if (!race) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("race_results")
          .select("*")
          .eq("race_id", race.id)
          .maybeSingle();

        if (error) {
          console.error("Supabase load error:", error);
        }

        if (data) {
          // Convert Supabase row → state
          setTopTen(data.top_ten || Array(10).fill(""));
          setDriverOfTheDay(data.driver_of_the_day || "");
          setFastestLap(data.fastest_lap || "");
          setMostOvertakes(data.most_overtakes || "");
          setCleanestDriver(data.cleanest_driver || "");

          // Also sync into localStorage so standings use it
          const syncedResult: RaceResult = {
            raceId: race.id,
            topTen: data.top_ten || Array(10).fill(""),
            driverOfTheDay: data.driver_of_the_day || "",
            fastestLap: data.fastest_lap || "",
            mostOvertakes: data.most_overtakes || "",
            cleanestDriver: data.cleanest_driver || "",
          };
          storage.saveRaceResult(syncedResult);
        } else {
          // No Supabase data yet → fallback to local
          const existingResult = storage.getRaceResult(race.id);
          if (existingResult) {
            setTopTen(existingResult.topTen);
            setDriverOfTheDay(existingResult.driverOfTheDay);
            setFastestLap(existingResult.fastestLap);
            setMostOvertakes(existingResult.mostOvertakes);
            setCleanestDriver(existingResult.cleanestDriver);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadResult();
  }, [race]);

  const handleSave = async () => {
    if (!race) return;

    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can save race results.",
        variant: "destructive",
      });
      return;
    }

    // Validation
    const filledPositions = topTen.filter((d) => d !== "");
    if (filledPositions.length < 10) {
      toast({
        title: "Incomplete Results",
        description: "Please fill all top 10 positions",
        variant: "destructive",
      });
      return;
    }

    const uniqueDrivers = new Set(topTen);
    if (uniqueDrivers.size !== 10) {
      toast({
        title: "Duplicate Drivers",
        description: "Each driver can only appear once in the top 10",
        variant: "destructive",
      });
      return;
    }

    if (!driverOfTheDay || !fastestLap || !mostOvertakes || !cleanestDriver) {
      toast({
        title: "Missing Awards",
        description: "Please select all award winners",
        variant: "destructive",
      });
      return;
    }

    const result: RaceResult = {
      raceId: race.id,
      topTen,
      driverOfTheDay,
      fastestLap,
      mostOvertakes,
      cleanestDriver,
    };

    // Save to Supabase (shared)
    const { error } = await supabase.from("race_results").upsert(
      {
        race_id: race.id,
        top_ten: topTen,
        driver_of_the_day: driverOfTheDay,
        fastest_lap: fastestLap,
        most_overtakes: mostOvertakes,
        cleanest_driver: cleanestDriver,
      },
      {
        onConflict: "race_id",
      }
    );

    if (error) {
      console.error("Supabase save error:", error);
      toast({
        title: "Save failed",
        description: "Could not save to the server. Try again.",
        variant: "destructive",
      });
      return;
    }

    // Still also save to localStorage for this device
    storage.saveRaceResult(result);

    toast({
      title: "Race Saved",
      description: `Results for ${race.name} have been saved and synced.`,
    });

    navigate("/standings");
  };

  // Reset JUST this race
  const handleResetRace = async () => {
    if (!race) return;

    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset race results.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      `This will clear all saved results for ${race.name} and reset it back to empty. Are you sure?`
    );
    if (!confirmed) return;

    const emptyTopTen = Array(10).fill("");

    // Reset local state
    setTopTen(emptyTopTen);
    setDriverOfTheDay("");
    setFastestLap("");
    setMostOvertakes("");
    setCleanestDriver("");

    // Save blank to Supabase
    const { error } = await supabase.from("race_results").upsert(
      {
        race_id: race.id,
        top_ten: emptyTopTen,
        driver_of_the_day: "",
        fastest_lap: "",
        most_overtakes: "",
        cleanest_driver: "",
      },
      {
        onConflict: "race_id",
      }
    );

    if (error) {
      console.error("Supabase reset error:", error);
      toast({
        title: "Reset failed",
        description: "Could not reset on the server.",
        variant: "destructive",
      });
      return;
    }

    // Also clear in localStorage
    const blankResult: RaceResult = {
      raceId: race.id,
      topTen: emptyTopTen,
      driverOfTheDay: "",
      fastestLap: "",
      mostOvertakes: "",
      cleanestDriver: "",
    };
    storage.saveRaceResult(blankResult);

    toast({
      title: "Race reset",
      description: `Results for ${race.name} have been cleared.`,
    });
  };

  if (!race) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Race not found</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading race data...</p>
      </div>
    );
  }

  const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  const selectedDriverIds = new Set(topTen.filter((d) => d !== ""));

  return (
    <div className="min-h-screen bg-background">
      <div className="racing-gradient min-h-screen">
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <Link to="/races">
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Calendar
              </Button>
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl">{race.flag}</div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">{race.name}</h1>
                <p className="text-muted-foreground">
                  {race.circuit} - Round {race.id}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Top 10 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Race Results - Top 10</CardTitle>
              <CardDescription>Select finishing positions to automatically award points</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {Array.from({ length: 10 }, (_, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={`position-${i + 1}`}>Position {i + 1}</Label>
                      <span className="text-sm font-semibold text-primary">
                        {POINTS_SYSTEM[i]} pts
                      </span>
                    </div>
                    <Select
                      value={topTen[i]}
                      onValueChange={(value) => {
                        const newTopTen = [...topTen];
                        newTopTen[i] = value;
                        setTopTen(newTopTen);
                      }}
                    >
                      <SelectTrigger id={`position-${i + 1}`}>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover">
                        {drivers.map((driver) => (
                          <SelectItem
                            key={driver.id}
                            value={driver.id}
                            disabled={selectedDriverIds.has(driver.id) && topTen[i] !== driver.id}
                          >
                            {driver.flag} {driver.name} - {driver.team}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Awards */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <CardTitle>Driver of the Day</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={driverOfTheDay} onValueChange={setDriverOfTheDay}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.flag} {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  <CardTitle>Fastest Lap</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={fastestLap} onValueChange={setFastestLap}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.flag} {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <CardTitle>Most Overtakes</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={mostOvertakes} onValueChange={setMostOvertakes}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.flag} {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  <CardTitle>Cleanest Driver</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Select value={cleanestDriver} onValueChange={setCleanestDriver}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.flag} {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          </div>

          {/* Save / Reset buttons */}
          <div className="space-y-3">
            {!isAdmin && (
              <p className="text-sm text-center text-muted-foreground">
                You can view results, but only the league admin can save or reset this race.
              </p>
            )}

            <Button onClick={handleSave} size="lg" className="w-full" disabled={!isAdmin}>
              <Save className="mr-2 h-5 w-5" />
              Save Race Results
            </Button>

            <Button
              onClick={handleResetRace}
              variant="outline"
              size="sm"
              className="w-full"
              disabled={!isAdmin}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset This Race
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RaceEntry;
