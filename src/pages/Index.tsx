import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Users,
  Award,
  Zap,
  TrendingUp,
  Smartphone,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { races } from "@/data/races";
import { drivers } from "@/data/drivers";
import {
  calculateDriverStandings,
  calculateConstructorStandings,
} from "@/lib/standings";

import type { RaceResult, LeaguePlayer } from "@/types/league";

import { Button } from "@/components/ui/button";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// Recharts (for graphs)
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

// ---- Supabase fetch helpers ----
async function fetchRaceResults(): Promise<RaceResult[]> {
  const { data, error } = await supabase
    .from("race_results")
    .select("*")
    .order("race_id", { ascending: true });

  if (error) throw error;
  if (!data) return [];

  return data.map((row: any) => ({
    raceId: row.race_id,
    topTen: row.top_ten ?? [],
    driverOfTheDay: row.driver_of_the_day ?? "",
    fastestLap: row.fastest_lap ?? "",
    mostOvertakes: row.most_overtakes ?? "",
    cleanestDriver: row.cleanest_driver ?? "",
  }));
}

async function fetchLeaguePlayers(): Promise<LeaguePlayer[]> {
  const { data, error } = await supabase.from("league_players").select("*");

  if (error) throw error;
  if (!data) return [];

  return data.map((row: any) => ({
    id: row.id,
    name: row.name,
    driverId: row.driver_id,
  }));
}

const Index = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [compactView, setCompactView] = useState(false); // 📱 phone-friendly toggle

  const {
    data: raceResults = [],
    isLoading: loadingResults,
    error: raceError,
  } = useQuery({
    queryKey: ["raceResults"],
    queryFn: fetchRaceResults,
  });

  const {
    data: leaguePlayers = [],
    isLoading: loadingPlayers,
    error: playersError,
  } = useQuery({
    queryKey: ["leaguePlayers"],
    queryFn: fetchLeaguePlayers,
  });

  const loading = loadingResults || loadingPlayers;

  const driverStandings = useMemo(
    () => calculateDriverStandings(raceResults, leaguePlayers),
    [raceResults, leaguePlayers]
  );

  const constructorStandings = useMemo(
    () => calculateConstructorStandings(raceResults, leaguePlayers),
    [raceResults, leaguePlayers]
  );

  // Which races have saved results (for the small summary in header if you want)
  const completedRaceIds = useMemo(
    () =>
      new Set(
        raceResults
          .filter((r) => Array.isArray(r.topTen) && r.topTen.length === 10)
          .map((r) => r.raceId)
      ),
    [raceResults]
  );

  // ---- Stats: driver placement breakdown ----
  type DriverPlacementStats = {
    driverId: string;
    driverName: string;
    team: string;
    leaguePlayerName?: string;
    positionCounts: number[]; // [P1..P10]
    totalTop10: number;
    averagePosition: number | null;
  };

  const driverPlacementStats: DriverPlacementStats[] = useMemo(() => {
    const statsMap = new Map<string, DriverPlacementStats & { sumPositions: number }>();

    // Fast lookup of league player by driverId
    const byDriver = new Map<string, LeaguePlayer>();
    leaguePlayers.forEach((p) => {
      if (p.driverId) byDriver.set(p.driverId, p);
    });

    // Seed all drivers
    drivers.forEach((d) => {
      const lp = byDriver.get(d.id);
      statsMap.set(d.id, {
        driverId: d.id,
        driverName: d.name,
        team: d.team,
        leaguePlayerName: lp?.name,
        positionCounts: Array(10).fill(0),
        totalTop10: 0,
        averagePosition: null,
        sumPositions: 0,
      });
    });

    raceResults.forEach((result) => {
      if (!result || !Array.isArray(result.topTen)) return;

      result.topTen.forEach((driverId, index) => {
        if (!driverId) return;
        const stats = statsMap.get(driverId);
        if (!stats) return;

        const pos = index + 1;
        if (pos < 1 || pos > 10) return;

        stats.positionCounts[index] += 1;
        stats.totalTop10 += 1;
        stats.sumPositions += pos;
      });
    });

    const list = Array.from(statsMap.values()).map((s) => ({
      driverId: s.driverId,
      driverName: s.driverName,
      team: s.team,
      leaguePlayerName: s.leaguePlayerName,
      positionCounts: s.positionCounts,
      totalTop10: s.totalTop10,
      averagePosition: s.totalTop10 > 0 ? s.sumPositions / s.totalTop10 : null,
    }));

    // Sort: best avg position first; then more top10s; then points as tiebreak
    const pointsByDriver = new Map(
      driverStandings.map((ds) => [ds.driverId, ds.points] as const)
    );

    list.sort((a, b) => {
      const aHas = a.totalTop10 > 0;
      const bHas = b.totalTop10 > 0;

      if (!aHas && !bHas) return 0;
      if (!aHas) return 1;
      if (!bHas) return -1;

      if (a.averagePosition! !== b.averagePosition!) {
        return a.averagePosition! - b.averagePosition!;
      }

      if (a.totalTop10 !== b.totalTop10) {
        return b.totalTop10 - a.totalTop10;
      }

      const pa = pointsByDriver.get(a.driverId) ?? 0;
      const pb = pointsByDriver.get(b.driverId) ?? 0;
      return pb - pa;
    });

    return list;
  }, [raceResults, leaguePlayers, driverStandings]);

  // ---- Stats: race order + timelines for graphs ----
  const raceOrder = useMemo(
    () =>
      [...races].sort((a, b) => a.id - b.id), // assumes your race_ids follow this order
    []
  );

  // Only plot top N drivers to keep graphs readable
  const TOP_LINES = 6;
  const topDriversForGraphs = useMemo(
    () => driverStandings.slice(0, TOP_LINES),
    [driverStandings]
  );

  const { pointsTimelineData, positionsTimelineData } = useMemo(() => {
    // Map raceId -> RaceResult
    const byRaceId = new Map<number, RaceResult>();
    raceResults.forEach((r) => {
      byRaceId.set(r.raceId, r);
    });

    // Cumulative points per driver
    const cumulative = new Map<string, number>();
    topDriversForGraphs.forEach((d) => cumulative.set(d.driverId, 0));

    const pointsData: any[] = [];
    const positionsData: any[] = [];

    raceOrder.forEach((race) => {
      const rowPoints: any = {
        race: race.name,
      };
      const rowPositions: any = {
        race: race.name,
      };

      const result = byRaceId.get(race.id);

      // Points
      if (result && Array.isArray(result.topTen)) {
        result.topTen.forEach((driverId, index) => {
          const pts = index < POINTS_SYSTEM.length ? POINTS_SYSTEM[index] : 0;
          if (!cumulative.has(driverId)) {
            // we only track topDriversForGraphs
            return;
          }
          const prev = cumulative.get(driverId)!;
          cumulative.set(driverId, prev + pts);
        });
      }

      // Fill cumulative points for each tracked driver
      topDriversForGraphs.forEach((d) => {
        rowPoints[d.driverId] = cumulative.get(d.driverId) ?? 0;

        // Positions graph (1–10, null if outside top 10 or no result)
        const pos =
          result && Array.isArray(result.topTen)
            ? result.topTen.indexOf(d.driverId)
            : -1;
        rowPositions[d.driverId] = pos === -1 ? null : pos + 1;
      });

      pointsData.push(rowPoints);
      positionsData.push(rowPositions);
    });

    return {
      pointsTimelineData: pointsData,
      positionsTimelineData: positionsData,
    };
  }, [raceResults, raceOrder, topDriversForGraphs]);

  if (raceError) {
    console.error(raceError);
  }
  if (playersError) {
    console.error(playersError);
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="racing-gradient min-h-screen">
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                <Trophy className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  F1 25 League Tracker
                </h1>
                <p className="text-sm text-muted-foreground">
                  Shareable league standings for your custom season
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-start md:justify-end">
              {/* 📱 Compact view toggle */}
              <Button
                variant={compactView ? "default" : "outline"}
                size="icon"
                className="h-10 w-10"
                onClick={() => setCompactView((prev) => !prev)}
                title="Toggle phone-friendly standings view"
              >
                <Smartphone className="h-5 w-5" />
              </Button>

              <Link to="/drivers">
                <Button variant="outline">
                  <Users className="mr-2 h-4 w-4" />
                  Add League Players
                </Button>
              </Link>

              <Link to="/races">
                <Button variant="outline">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Race Calendar
                </Button>
              </Link>

              <Link to="/admin">
                <Button variant={isAdmin ? "default" : "outline"}>
                  {isAdmin ? "Admin" : "Admin Login"}
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 space-y-6">
          {loading && (
            <p className="text-sm text-muted-foreground">
              Loading latest league data…
            </p>
          )}

          {!loading && completedRaceIds.size > 0 && (
            <p className="text-sm text-muted-foreground">
              {completedRaceIds.size} races have results saved in this league.
            </p>
          )}

          <Tabs defaultValue="drivers" className="space-y-6">
            <TabsList>
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="constructors">Constructors</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>

            {/* 🏁 Drivers' Championship */}
            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <CardTitle>Drivers&apos; Championship</CardTitle>
                  <CardDescription>
                    League standings using the real F1 points system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Pos</TableHead>
                          <TableHead>Driver</TableHead>
                          {!compactView && <TableHead>Team</TableHead>}
                          <TableHead className="text-right">Pts</TableHead>
                          {!compactView && (
                            <>
                              <TableHead className="text-center">
                                DOTD
                              </TableHead>
                              <TableHead className="text-center">
                                FL
                              </TableHead>
                              <TableHead className="text-center">
                                Overtakes
                              </TableHead>
                              <TableHead className="text-center">
                                Clean
                              </TableHead>
                            </>
                          )}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {driverStandings.map((standing, index) => (
                          <TableRow key={standing.driverId}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {standing.driverName}
                                </span>
                                {standing.leaguePlayerName && (
                                  <span className="text-xs text-muted-foreground">
                                    League: {standing.leaguePlayerName}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            {!compactView && (
                              <TableCell className="text-sm">
                                {standing.team}
                              </TableCell>
                            )}
                            <TableCell className="text-right font-semibold">
                              {standing.points}
                            </TableCell>

                            {!compactView && (
                              <>
                                <TableCell className="text-center text-xs">
                                  {standing.awards.driverOfTheDay || "–"}
                                </TableCell>
                                <TableCell className="text-center text-xs">
                                  {standing.awards.fastestLap || "–"}
                                </TableCell>
                                <TableCell className="text-center text-xs">
                                  {standing.awards.mostOvertakes || "–"}
                                </TableCell>
                                <TableCell className="text-center text-xs">
                                  {standing.awards.cleanestDriver || "–"}
                                </TableCell>
                              </>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 🏎 Constructors' Championship */}
            <TabsContent value="constructors">
              <Card>
                <CardHeader>
                  <CardTitle>Constructors&apos; Championship</CardTitle>
                  <CardDescription>
                    Team points are the sum of all their drivers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Pos</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-right">Points</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {constructorStandings.map((team, index) => (
                          <TableRow key={team.team}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{team.team}</TableCell>
                            <TableCell className="text-right font-semibold">
                              {team.points}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 📊 Stats tab (graphs + breakdown) */}
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>League Stats</CardTitle>
                  <CardDescription>
                    Visualize how the season evolves over your custom calendar
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="points" className="space-y-4">
                    <TabsList>
                      <TabsTrigger value="points">
                        Points Trend
                      </TabsTrigger>
                      <TabsTrigger value="positions">
                        Finish Positions
                      </TabsTrigger>
                    </TabsList>

                    {/* Points Trend */}
                    <TabsContent value="points">
                      <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={pointsTimelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="race" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {topDriversForGraphs.map((d) => (
                              <Line
                                key={d.driverId}
                                type="monotone"
                                dataKey={d.driverId}
                                name={d.leaguePlayerName || d.driverName}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                                        {/* Finish Positions */}
                    <TabsContent value="positions">
                      <div className="h-[320px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={positionsTimelineData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="race" />
                            <YAxis
                              domain={[1, 10]}
                              reversed
                              tickCount={10}
                              allowDecimals={false}
                            />
                            <Tooltip />
                            <Legend />
                            {topDriversForGraphs.map((d) => (
                              <Line
                                key={d.driverId}
                                type="monotone"
                                dataKey={d.driverId}
                                name={d.leaguePlayerName || d.driverName}
                                strokeWidth={2}
                                dot={false}
                                isAnimationActive={false}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Top 10 placement breakdown table */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Top 10 Placement Breakdown</CardTitle>
                  <CardDescription>
                    How often each driver finishes P1–P10, plus average finish
                    in the top 10.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12">Rank</TableHead>
                          <TableHead>Driver</TableHead>
                          <TableHead>Team</TableHead>
                          <TableHead className="text-center">Top 10</TableHead>
                          {Array.from({ length: 10 }, (_, i) => (
                            <TableHead
                              key={i}
                              className="text-center whitespace-nowrap"
                            >
                              P{i + 1}
                            </TableHead>
                          ))}
                          <TableHead className="text-center">
                            Avg Pos
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {driverPlacementStats.map((s, idx) => (
                          <TableRow key={s.driverId}>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {s.driverName}
                                </span>
                                {s.leaguePlayerName && (
                                  <span className="text-xs text-muted-foreground">
                                    League: {s.leaguePlayerName}
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{s.team}</TableCell>
                            <TableCell className="text-center">
                              {s.totalTop10}
                            </TableCell>
                            {s.positionCounts.map((count, i) => (
                              <TableCell
                                key={i}
                                className="text-center text-xs"
                              >
                                {count || "–"}
                              </TableCell>
                            ))}
                            <TableCell className="text-center">
                              {s.averagePosition
                                ? s.averagePosition.toFixed(2)
                                : "–"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default Index;
