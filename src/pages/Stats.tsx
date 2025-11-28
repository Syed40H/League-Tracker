import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { storage } from "@/lib/storage";
import { calculateDriverStandings } from "@/lib/standings";  // Assuming this function handles driver standings
import { DriverStanding } from "@/types/league";  // Assuming you are calculating DriverStandings

const Stats = () => {
  const [raceResults, setRaceResults] = useState([]);

  useEffect(() => {
    // Get race results from storage
    const results = storage.getRaceResults();
    setRaceResults(results);
  }, []);

  const driverStandings = useMemo(() => {
    // Use the driver standings calculation logic
    return calculateDriverStandings(raceResults); // Assuming this function calculates standings correctly
  }, [raceResults]);

  return (
    <div className="min-h-screen bg-background">
      <div className="racing-gradient min-h-screen">
        <header className="border-b border-border/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-foreground">Stats</h1>
            <p className="text-muted-foreground mt-2">Here you can view the stats of drivers and constructors.</p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Driver Standings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pos</TableHead>
                      <TableHead>Driver</TableHead>
                      <TableHead className="text-right">Points</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {driverStandings.map((standing, index) => (
                      <TableRow key={standing.driverId}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{standing.driverName}</TableCell>
                        <TableCell className="text-right">{standing.points}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Add similar sections for other stats like Constructors' Standings if required */}
        </div>
      </div>
    </div>
  );
};

export default Stats;
