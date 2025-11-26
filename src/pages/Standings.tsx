import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Award, Zap, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  calculateDriverStandings,
  calculateConstructorStandings,
} from "@/lib/standings";
import { supabase } from "@/lib/supabaseClient";
import type { RaceResult, LeaguePlayer } from "@/types/league";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Standings = () => {
  const [raceResults, setRaceResults] = useState<RaceResult[]>([]);
  const [leaguePlayers, setLeaguePlayers] = useState<LeaguePlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // 🔹 Load race results
  useEffect(() => {
    const loadResults = async () => {
      const { data, error } = await supabase.from("race_results").select("*");

      if (error) {
        console.error("Error loading race_results:", error);
        toast({
          title: "Error",
          description: "Could not load race results from the server.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const mapped: RaceResult[] =
        (data || []).map((row: any) => ({
          raceId: row.race_id,
          topTen: row.top_ten || [],
          driverOfTheDay: row.driver_of_the_day || "",
          fastestLap: row.fastest_lap || "",
          mostOvertakes: row.most_overtakes || "",
          cleanestDriver: row.cleanest_driver || "",
        })) ?? [];

      setRaceResults(mapped);
      setLoading(false);
    };

    loadResults();
  }, [toast]);

  // 🔹 Load league players (for names)
  useEffect(() => {
    const loadLeaguePlayers = async () => {
      const { data, error } = await supabase.from("league_players").select("*");

      if (error) {
        console.error("Error loading league_players:", error);
        return;
      }

      const mapped: LeaguePlayer[] =
        (data || []).map((row: any) => ({
          id: row.id,
          name: row.name,
          driverId: row.driver_id,
        })) ?? [];

      setLeaguePlayers(mapped);
    };

    loadLeaguePlayers();
  }, []);

  const driverStandings = calculateDriverStandings(raceResults, leaguePlayers);
  const constructorStandings = calculateConstructorStandings(
    raceResults,
    leaguePlayers
  );

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

  const getDisplayName = (standing: any) => {
    if (!standing) return "";
    return standing.leaguePlayerName
      ? `${standing.leaguePlayerName} (${standing.driverName})`
      : standing.driverName;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading standings…</p>
      </div>
    );
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
              Championship Standings
            </h1>
            <p className="text-muted-foreground mt-2">
              Full breakdown of driver & constructor standings
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Drivers */}
          <Card>
            <CardHeader>
              <CardTitle>Drivers&apos; Championship</CardTitle>
              <CardDescription>
                Aggregated points from all completed races
              </CardDescription>
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
                              <div className="text-primary">
                                {standing.leaguePlayerName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ({standing.driverName})
                              </div>
                            </div>
                          ) : (
                            standing.driverName
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {standing.team}
                        </TableCell>
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
                  No race results yet.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Award summary */}
          {driverStandings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Award Leaders</CardTitle>
                <CardDescription>
                  Drivers leading in each special award category
                </CardDescription>
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
                        ? `${getDisplayName(topFastestLap.standing)} (${
                            topFastestLap.count
                          })`
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
                        ? `${getDisplayName(topMostOvertakes.standing)} (${
                            topMostOvertakes.count
                          })`
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
                        ? `${getDisplayName(topCleanestDriver.standing)} (${
                            topCleanestDriver.count
                          })`
                        : "No awards yet"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Constructors */}
          <Card>
            <CardHeader>
              <CardTitle>Constructors&apos; Championship</CardTitle>
              <CardDescription>
                Team standings based on combined driver points
              </CardDescription>
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
                    <TableRow
                      key={standing.team}
                      className={index < 3 ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-bold">
                        {index === 0 && <span className="text-2xl">🥇</span>}
                        {index === 1 && <span className="text-2xl">🥈</span>}
                        {index === 2 && <span className="text-2xl">🥉</span>}
                        {index > 2 && index + 1}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {standing.team}
                      </TableCell>
                      <TableCell className="text-right font-bold text-lg text-primary">
                        {standing.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Standings;
