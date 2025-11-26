import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trophy, Users, Calendar, CheckCircle2, Award, Zap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { calculateDriverStandings, calculateConstructorStandings } from "@/lib/standings";
import { races } from "@/data/races";
import { storage } from "@/lib/storage";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { RaceResult } from "@/types/league";

const Index = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);

  // 🔁 Sync race_results from Supabase → localStorage on load
  useEffect(() => {
    const syncResults = async () => {
      try {
        const { data, error } = await supabase.from("race_results").select("*");
        if (error) {
          console.error("Error loading race_results from Supabase:", error);
          return;
        }

        if (data && Array.isArray(data)) {
          data.forEach((row: any) => {
            const result: RaceResult = {
              raceId: row.race_id,
              topTen: row.top_ten || Array(10).fill(""),
              driverOfTheDay: row.driver_of_the_day || "",
              fastestLap: row.fastest_lap || "",
              mostOvertakes: row.most_overtakes || "",
              cleanestDriver: row.cleanest_driver || "",
            };

            // keep localStorage in sync so standings & calendar use it
            storage.saveRaceResult(result);
          });
        }
      } finally {
        setLoading(false);
      }
    };

    syncResults();
  }, []);

  // 🔄 Loading state while we sync from Supabase
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading league data...</p>
      </div>
    );
  }

  // After sync → normal logic using storage
  const driverStandings = calculateDriverStandings();
  const constructorStandings = calculateConstructorStandings();
  const raceResults = storage.getRaceResults();

  // Only mark a race as completed if all 10 positions are filled
  const completedRaceIds = new Set(
    raceResults
      .filter(
        (r) =>
          r.topTen &&
          Array.isArray(r.topTen) &&
          r.topTen.filter((d: string) => d !== "").length === 10
      )
      .map((r) => r.raceId)
  );

  // Helper: who leads an award + how many
  const getTopAwardHolder = (
    key: "driverOfTheDay" | "fastestLap" | "mostOvertakes" | "cleanestDriver"
  ) => {
    if (!driverStandings.length) return null;

    let top = driverStandings[0];
    for (const d of driverStandings) {
      const currentCount = (d.awards as any)[key] || 0;
      const topCount = (top.awards as any)[key] || 0;
      if (currentCount > topCount) {
        top = d;
      }
    }

    const count = (top.awards as any)[key] || 0;
    if (!count) return null;

    return { standing: top, count };
  };

  const topDotd = getTopAwardHolder("driverOfTheDay");
  const topFastestLap = getTopAwardHolder("fastestLap");
  const topMostOvertakes = getTopAwardHolder("mostOvertakes");
  const topCleanestDriver = getTopAwardHolder("cleanestDriver");

  // Helper: nice display name
  const getDisplayName = (standing: any) => {
    if (!standing) return "";
    return standing.leaguePlayerName
      ? `${standing.leaguePlayerName} (${standing.driverName})`
      : standing.driverName;
  };

  // 🧨 Reset everything: Supabase + localStorage (admin only)
  const handleResetAll = async () => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset the league.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      "This will clear ALL race results (for everyone) and your local league data. Are you sure?"
    );
    if (!confirmed) return;

    // Delete all race_results rows in Supabase
    const { error } = await supabase.from("race_results").delete().neq("race_id", 0);
    if (error) {
      console.error("Error resetting race_results in Supabase:", error);
      toast({
        title: "Reset failed",
        description: "Could not clear race results on the server.",
        variant: "destructive",
      });
      return;
    }

    // Clear localStorage on this device
    localStorage.clear();

    toast({
      title: "League reset",
      description: "All race results have been cleared for everyone.",
    });

    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="racing-gradient min-h-screen">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold text-foreground">F1 25 League Tracker</h1>
              </div>
              <div className="flex items-center gap-3">
                {/* Admin visible to everyone, login gate is on /admin */}
                <Link to="/admin">
                  <Button variant="outline" size="sm">
                    Admin
                  </Button>
                </Link>
                <Link to="/drivers">
                  <Button size="icon" variant="outline" className="h-10 w-10">
                    <Users className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Standings Section */}
          <Tabs defaultValue="drivers" className="space-y-6 mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="constructors">Constructors</TabsTrigger>
            </TabsList>

            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <CardTitle>Drivers' Championship</CardTitle>
                  <CardDescription>Current standings after all completed races</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-16">Pos</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-right">Points</TableHead>
                          <TableHead className="text-center">
                            <Trophy className="h-4 w-4 inline" />
                          </TableHead>
                          <TableHead className="text-center">
                            <Zap className="h-4 w-4 inline" />
                          </TableHead>
                          <TableHead className="text-center">
                            <TrendingUp className="h-4 w-4 inline" />
                          </TableHead>
                          <TableHead className="text-center">
                            <Award className="h-4 w-4 inline" />
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {driverStandings.map((standing, index) => (
                          <TableRow
                            key={standing.driverId}
                            className={index < 3 ? "bg-primary/5" : ""}
                          >
                            <TableCell className="font-bold">
                              {index === 0 && <span className="text-2xl">🥇</span>}
                              {index === 1 && <span className="text-2xl">🥈</span>}
                              {index === 2 && <span className="text-2xl">🥉</span>}
                              {index > 2 && index + 1}
                            </TableCell>
                            <TableCell className="font-semibold">
                              {standing.leaguePlayerName ? (
                                <div>
                                  <div className="text-primary">{standing.leaguePlayerName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    ({standing.driverName})
                                  </div>
                                </div>
                              ) : (
                                standing.driverName
                              )}
                            </TableCell>
                            <TableCell className="text-sm">{standing.team}</TableCell>
                            <TableCell className="text-right font-bold text-lg text-primary">
                              {standing.points}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {standing.awards.driverOfTheDay || "-"}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {standing.awards.fastestLap || "-"}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {standing.awards.mostOvertakes || "-"}
                            </TableCell>
                            <TableCell className="text-center text-sm">
                              {standing.awards.cleanestDriver || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  {driverStandings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No race results yet. Enter results to see standings.
                    </p>
                  )}
                </CardContent>
              </Card>

              {driverStandings.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Award Legend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4 text-primary" />
                          <span>Driver of the Day</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {topDotd
                            ? `${getDisplayName(topDotd.standing)} (${topDotd.count})`
                            : "No awards yet"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-accent" />
                          <span>Fastest Lap</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {topFastestLap
                            ? `${getDisplayName(topFastestLap.standing)} (${topFastestLap.count})`
                            : "No awards yet"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span>Most Overtakes</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {topMostOvertakes
                            ? `${getDisplayName(topMostOvertakes.standing)} (${topMostOvertakes.count})`
                            : "No awards yet"}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <span>Cleanest Driver</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {topCleanestDriver
                            ? `${getDisplayName(topCleanestDriver.standing)} (${topCleanestDriver.count})`
                            : "No awards yet"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="constructors">
              <Card>
                <CardHeader>
                  <CardTitle>Constructors' Championship</CardTitle>
                  <CardDescription>Team standings based on combined driver points</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Pos</TableHead>
                        <TableHead>Team</TableHead>
                        <TableHead className="text-right">Points</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {constructorStandings.map((standing, index) => (
                        <TableRow key={standing.team} className={index < 3 ? "bg-primary/5" : ""}>
                          <TableCell className="font-bold">
                            {index === 0 && <span className="text-2xl">🥇</span>}
                            {index === 1 && <span className="text-2xl">🥈</span>}
                            {index === 2 && <span className="text-2xl">🥉</span>}
                            {index > 2 && index + 1}
                          </TableCell>
                          <TableCell className="font-semibold">{standing.team}</TableCell>
                          <TableCell className="text-right font-bold text-lg text-primary">
                            {standing.points}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {constructorStandings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No race results yet. Enter results to see standings.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Race Calendar Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">2025 Race Calendar</h2>
                <p className="text-muted-foreground mt-1">
                  {completedRaceIds.size} of 24 races completed
                </p>
              </div>
              {isAdmin && (
                <Button variant="destructive" size="sm" onClick={handleResetAll}>
                  Reset League
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {races.map((race) => {
                const isCompleted = completedRaceIds.has(race.id);

                return (
                  <Link key={race.id} to={`/race/${race.id}`}>
                    <Card
                      className={`group hover:border-primary/50 transition-all duration-300 cursor-pointer h-full ${
                        isCompleted ? "border-primary/30 bg-primary/5" : ""
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="text-4xl">{race.flag}</div>
                            <div>
                              <div className="text-sm text-muted-foreground">Round {race.id}</div>
                              <CardTitle className="text-lg leading-tight">{race.name}</CardTitle>
                            </div>
                          </div>
                          {isCompleted && <CheckCircle2 className="h-5 w-5 text-primary" />}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {race.date}
                          </div>
                          <div className="text-sm font-medium">{race.circuit}</div>
                          <div className="text-xs text-muted-foreground">{race.country}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
