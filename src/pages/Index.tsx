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

const Index = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const driverStandings = calculateDriverStandings();
  const constructorStandings = calculateConstructorStandings();
  const raceResults = storage.getRaceResults();

  // Mark completed races only when all 10 positions are filled
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

  // Award leader helper
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

  // How to show names
  const getDisplayName = (standing: any) => {
    if (!standing) return "";
    return standing.leaguePlayerName
      ? `${standing.leaguePlayerName} (${standing.driverName})`
      : standing.driverName;
  };

  // RESET everything (admin only)
  const handleResetAll = () => {
    if (!isAdmin) {
      toast({
        title: "Not allowed",
        description: "Only the league admin can reset the league.",
        variant: "destructive",
      });
      return;
    }

    const confirmed = window.confirm(
      "This will clear EVERYTHING: race results + league players. Are you sure?"
    );

    if (!confirmed) return;

    localStorage.clear();

    toast({
      title: "League reset",
      description: "All saved data has been cleared.",
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
                <h1 className="text-3xl font-bold text-foreground">
                  F1 25 League Tracker
                </h1>
              </div>

              {/* ALWAYS SHOW ADMIN BUTTON */}
              <div className="flex items-center gap-3">
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
          {/* Standings */}
          <Tabs defaultValue="drivers" className="space-y-6 mb-12">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="drivers">Drivers</TabsTrigger>
              <TabsTrigger value="constructors">Constructors</TabsTrigger>
            </TabsList>

            {/* Drivers */}
            <TabsContent value="drivers">
              <Card>
                <CardHeader>
                  <CardTitle>Drivers' Championship</CardTitle>
                  <CardDescription>Updated standings</CardDescription>
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
                              {index === 0 && "🥇"}
                              {index === 1 && "🥈"}
                              {index === 2 && "🥉"}
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

                            <TableCell>{standing.team}</TableCell>

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
                </CardContent>
              </Card>

              {/* Award Legend */}
              {driverStandings.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-sm">Award Leaders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">

                      {/* DOTD */}
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

                      {/* Fastest Lap */}
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

                      {/* Most Overtakes */}
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

                      {/* Cleanest Driver */}
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

            {/* Constructors */}
            <TabsContent value="constructors">
              <Card>
                <CardHeader>
                  <CardTitle>Constructors' Championship</CardTitle>
                  <CardDescription>Team standings</CardDescription>
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
                            {index === 0 && "🥇"}
                            {index === 1 && "🥈"}
                            {index === 2 && "🥉"}
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
            </TabsContent>
          </Tabs>

          {/* Race Calendar */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  2025 Race Calendar
                </h2>
                <p className="text-muted-foreground mt-1">
                  {completedRaceIds.size} of 24 races completed
                </p>
              </div>

              {/* Reset button only visible to admin */}
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
                              <div className="text-sm text-muted-foreground">
                                Round {race.id}
                              </div>
                              <CardTitle className="text-lg leading-tight">
                                {race.name}
                              </CardTitle>
                            </div>
                          </div>

                          {isCompleted && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </CardHeader>

                      <CardContent>
                        <div className="space-y-2">
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {race.date}
                          </div>

                          <div className="text-sm font-medium">
                            {race.circuit}
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {race.country}
                          </div>
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
