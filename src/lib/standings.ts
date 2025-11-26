import { drivers } from "@/data/drivers";
import { storage } from "@/lib/storage";
import { DriverStanding, ConstructorStanding } from "@/types/league";

const POINTS_SYSTEM = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];

export function calculateDriverStandings(): DriverStanding[] {
  const raceResults = storage.getRaceResults();
  const leaguePlayers = storage.getLeaguePlayers();
  
  const standingsMap = new Map<string, DriverStanding>();
  
  // Initialize all drivers
  drivers.forEach(driver => {
    const leaguePlayer = leaguePlayers.find(p => p.driverId === driver.id);
    standingsMap.set(driver.id, {
      driverId: driver.id,
      driverName: driver.name,
      team: driver.team,
      leaguePlayerName: leaguePlayer?.name,
      points: 0,
      awards: {
        driverOfTheDay: 0,
        fastestLap: 0,
        mostOvertakes: 0,
        cleanestDriver: 0,
      },
    });
  });
  
  // Calculate points from all races
  raceResults.forEach(result => {
    // Top 10 finishing positions
    result.topTen.forEach((driverId, index) => {
      if (index < 10) {
        const standing = standingsMap.get(driverId);
        if (standing) {
          standing.points += POINTS_SYSTEM[index];
        }
      }
    });
    
    // Awards
    const awards = [
      { driverId: result.driverOfTheDay, award: 'driverOfTheDay' as const },
      { driverId: result.fastestLap, award: 'fastestLap' as const },
      { driverId: result.mostOvertakes, award: 'mostOvertakes' as const },
      { driverId: result.cleanestDriver, award: 'cleanestDriver' as const },
    ];
    
    awards.forEach(({ driverId, award }) => {
      const standing = standingsMap.get(driverId);
      if (standing) {
        standing.awards[award]++;
      }
    });
  });
  
  // Convert to array and sort by points
  return Array.from(standingsMap.values())
    .sort((a, b) => b.points - a.points);
}

export function calculateConstructorStandings(): ConstructorStanding[] {
  const driverStandings = calculateDriverStandings();
  const constructorMap = new Map<string, number>();
  
  driverStandings.forEach(standing => {
    const currentPoints = constructorMap.get(standing.team) || 0;
    constructorMap.set(standing.team, currentPoints + standing.points);
  });
  
  return Array.from(constructorMap.entries())
    .map(([team, points]) => ({ team, points }))
    .sort((a, b) => b.points - a.points);
}
