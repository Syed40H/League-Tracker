export interface Driver {
  id: string;
  name: string;
  number: number;
  team: string;
  teamColor: string;
  country: string;
  flag: string;
}

export const drivers: Driver[] = [
  { id: "VER", name: "Max Verstappen", number: 1, team: "Red Bull Racing", teamColor: "#3671C6", country: "Netherlands", flag: "🇳🇱" },
  { id: "PER", name: "Sergio Perez", number: 11, team: "Red Bull Racing", teamColor: "#3671C6", country: "Mexico", flag: "🇲🇽" },
  { id: "HAM", name: "Lewis Hamilton", number: 44, team: "Mercedes", teamColor: "#27F4D2", country: "Great Britain", flag: "🇬🇧" },
  { id: "RUS", name: "George Russell", number: 63, team: "Mercedes", teamColor: "#27F4D2", country: "Great Britain", flag: "🇬🇧" },
  { id: "LEC", name: "Charles Leclerc", number: 16, team: "Ferrari", teamColor: "#E8002D", country: "Monaco", flag: "🇲🇨" },
  { id: "SAI", name: "Carlos Sainz", number: 55, team: "Ferrari", teamColor: "#E8002D", country: "Spain", flag: "🇪🇸" },
  { id: "NOR", name: "Lando Norris", number: 4, team: "McLaren", teamColor: "#FF8000", country: "Great Britain", flag: "🇬🇧" },
  { id: "PIA", name: "Oscar Piastri", number: 81, team: "McLaren", teamColor: "#FF8000", country: "Australia", flag: "🇦🇺" },
  { id: "ALO", name: "Fernando Alonso", number: 14, team: "Aston Martin", teamColor: "#229971", country: "Spain", flag: "🇪🇸" },
  { id: "STR", name: "Lance Stroll", number: 18, team: "Aston Martin", teamColor: "#229971", country: "Canada", flag: "🇨🇦" },
  { id: "GAS", name: "Pierre Gasly", number: 10, team: "Alpine", teamColor: "#FF87BC", country: "France", flag: "🇫🇷" },
  { id: "OCO", name: "Esteban Ocon", number: 31, team: "Alpine", teamColor: "#FF87BC", country: "France", flag: "🇫🇷" },
  { id: "ALB", name: "Alexander Albon", number: 23, team: "Williams", teamColor: "#64C4FF", country: "Thailand", flag: "🇹🇭" },
  { id: "SAR", name: "Logan Sargeant", number: 2, team: "Williams", teamColor: "#64C4FF", country: "USA", flag: "🇺🇸" },
  { id: "BOT", name: "Valtteri Bottas", number: 77, team: "Alfa Romeo", teamColor: "#C92D4B", country: "Finland", flag: "🇫🇮" },
  { id: "ZHO", name: "Zhou Guanyu", number: 24, team: "Alfa Romeo", teamColor: "#C92D4B", country: "China", flag: "🇨🇳" },
  { id: "TSU", name: "Yuki Tsunoda", number: 22, team: "AlphaTauri", teamColor: "#5E8FAA", country: "Japan", flag: "🇯🇵" },
  { id: "RIC", name: "Daniel Ricciardo", number: 3, team: "AlphaTauri", teamColor: "#5E8FAA", country: "Australia", flag: "🇦🇺" },
  { id: "MAG", name: "Kevin Magnussen", number: 20, team: "Haas", teamColor: "#B6BABD", country: "Denmark", flag: "🇩🇰" },
  { id: "HUL", name: "Nico Hulkenberg", number: 27, team: "Haas", teamColor: "#B6BABD", country: "Germany", flag: "🇩🇪" },
];

export const teams = [
  "Red Bull Racing",
  "Mercedes",
  "Ferrari",
  "McLaren",
  "Aston Martin",
  "Alpine",
  "Williams",
  "Alfa Romeo",
  "AlphaTauri",
  "Haas",
];
