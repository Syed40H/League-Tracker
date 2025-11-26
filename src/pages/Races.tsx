import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, CheckCircle2 } from "lucide-react";
import { races } from "@/data/races";
import { storage } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Races = () => {
  const raceResults = storage.getRaceResults();
  const completedRaceIds = new Set(raceResults.map(r => r.raceId));

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
            <h1 className="text-3xl font-bold text-foreground">2025 Race Calendar</h1>
            <p className="text-muted-foreground mt-2">
              {completedRaceIds.size} of 24 races completed
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {races.map((race) => {
              const isCompleted = completedRaceIds.has(race.id);
              
              return (
                <Link key={race.id} to={`/race/${race.id}`}>
                  <Card className={`group hover:border-primary/50 transition-all duration-300 cursor-pointer h-full ${
                    isCompleted ? 'border-primary/30 bg-primary/5' : ''
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{race.flag}</div>
                          <div>
                            <div className="text-sm text-muted-foreground">Round {race.id}</div>
                            <CardTitle className="text-lg leading-tight">{race.name}</CardTitle>
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
  );
};

export default Races;
