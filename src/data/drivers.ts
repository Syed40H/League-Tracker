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
  // Red Bull Racing
  {
    id: "VER",
    name: "Max Verstappen",
    number: 1,
    team: "Red Bull Racing",
    teamColor: "#3671C6",
    country: "Netherlands",
    flag: "🇳🇱",
  },
  {
    id: "TSU",
    name: "Yuki Tsunoda",
    number: 22,
    team: "Red Bull Racing",
    teamColor: "#3671C6",
    country: "Japan",
    flag: "🇯🇵",
  },

  // Ferrari
  {
    id: "LEC",
    name: "Charles Leclerc",
    number: 16,
    team: "Ferrari",
    teamColor: "#E8002D",
    country: "Monaco",
    flag: "🇲🇨",
  },
  {
    id: "HAM",
    name: "Lewis Hamilton",
    number: 44,
    team: "Ferrari",
    teamColor: "#E8002D",
    country: "Great Britain",
    flag: "🇬🇧",
  },

  // Mercedes
  {
    id: "RUS",
    name: "George Russell",
    number: 63,
    team: "Mercedes",
    teamColor: "#27F4D2",
    country: "Great Britain",
    flag: "🇬🇧",
  },
  {
    id: "ANT",
    name: "Kimi Antonelli",
    number: 7, // you can change this if you want a different number
    team: "Mercedes",
    teamColor: "#27F4D2",
    country: "Italy",
    flag: "🇮🇹",
  },

  // McLaren
  {
    id: "NOR",
    name: "Lando Norris",
    number: 4,
    team: "McLaren",
    teamColor: "#FF8000",
    country: "Great Britain",
    flag: "🇬🇧",
  },
  {
    id: "PIA",
    name: "Oscar Piastri",
    number: 81,
    team: "McLaren",
    teamColor: "#FF8000",
    country: "Australia",
    flag: "🇦🇺",
  },

  // Aston Martin
  {
    id: "STR",
    name: "Lance Stroll",
    number: 18,
    team: "Aston Martin",
    teamColor: "#229971",
    country: "Canada",
    flag: "🇨🇦",
  },
  {
    id: "ALO",
    name: "Fernando Alonso",
    number: 14,
    team: "Aston Martin",
    teamColor: "#229971",
    country: "Spain",
    flag: "🇪🇸",
  },

  // Williams
  {
    id: "ALB",
    name: "Alexander Albon",
    number: 23,
    team: "Williams",
    teamColor: "#64C4FF",
    country: "Thailand",
    flag: "🇹🇭",
  },
  {
    id: "SAI",
    name: "Carlos Sainz",
    number: 55,
    team: "Williams",
    teamColor: "#64C4FF",
    country: "Spain",
    flag: "🇪🇸",
  },

  // Racing Bulls
  {
    id: "LAW",
    name: "Liam Lawson",
    number: 30,
    team: "Racing Bulls",
    teamColor: "#6692FF",
    country: "New Zealand",
    flag: "🇳🇿",
  },
  {
    id: "HAD",
    name: "Isack Hadjar",
    number: 20,
    team: "Racing Bulls",
    teamColor: "#6692FF",
    country: "France",
    flag: "🇫🇷",
  },

  // Haas F1 Team
  {
    id: "OCO",
    name: "Esteban Ocon",
    number: 31,
    team: "Haas F1 Team",
    teamColor: "#B6BABD",
    country: "France",
    flag: "🇫🇷",
  },
  {
    id: "BEA",
    name: "Oliver Bearman",
    number: 87,
    team: "Haas F1 Team",
    teamColor: "#B6BABD",
    country: "Great Britain",
    flag: "🇬🇧",
  },

  // Kick Sauber
  {
    id: "HUL",
    name: "Nico Hulkenberg",
    number: 27,
    team: "Kick Sauber",
    teamColor: "#52A228",
    country: "Germany",
    flag: "🇩🇪",
  },
  {
    id: "BOR",
    name: "Gabriel Bortoleto",
    number: 5,
    team: "Kick Sauber",
    teamColor: "#52A228",
    country: "Brazil",
    flag: "🇧🇷",
  },

  // Alpine
  {
    id: "GAS",
    name: "Pierre Gasly",
    number: 10,
    team: "Alpine",
    teamColor: "#FF87BC",
    country: "France",
    flag: "🇫🇷",
  },
  {
    id: "COL",
    name: "Franco Colapinto",
    number: 12,
    team: "Alpine",
    teamColor: "#FF87BC",
    country: "Argentina",
    flag: "🇦🇷",
  },
];

export const teams = [
  "Red Bull Racing",
  "Ferrari",
  "Mercedes",
  "McLaren",
  "Aston Martin",
  "Williams",
  "Racing Bulls",
  "Haas F1 Team",
  "Kick Sauber",
  "Alpine",
];
