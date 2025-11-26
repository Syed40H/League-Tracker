import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, Award, Zap, TrendingUp } from "lucide-react";
import { calculateDriverStandings, calculateConstructorStandings } from "@/lib/standings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Standings = () => {
  const driverStandings = calculateDriverStandings();
  const constructorStandings = calculateConstructorStandings();

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
            <div className="flex items-center gap-3">
              <Trophy className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-foreground">Championship Standings</h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Tabs defaultValue="drivers" className="space-y-6">
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
                          <TableRow key={standing.driverId} className={index < 3 ? "bg-primary/5" : ""}>
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
                                  <div className="text-sm text-muted-foreground">({standing.driverName})</div>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" />
                        <span>Driver of the Day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-accent" />
                        <span>Fastest Lap</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" />
                        <span>Most Overtakes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-primary" />
                        <span>Cleanest Driver</span>
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
        </div>
      </div>
    </div>
  );
};

export default Standings;
