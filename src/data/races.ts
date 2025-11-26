export interface Race {
  id: number;
  name: string;
  country: string;
  flag: string;
  circuit: string;
  date: string;
}

export const races: Race[] = [
  { id: 1, name: "Bahrain Grand Prix", country: "Bahrain", flag: "🇧🇭", circuit: "Bahrain International Circuit", date: "March 2, 2025" },
  { id: 2, name: "Saudi Arabian Grand Prix", country: "Saudi Arabia", flag: "🇸🇦", circuit: "Jeddah Corniche Circuit", date: "March 9, 2025" },
  { id: 3, name: "Australian Grand Prix", country: "Australia", flag: "🇦🇺", circuit: "Albert Park Circuit", date: "March 23, 2025" },
  { id: 4, name: "Japanese Grand Prix", country: "Japan", flag: "🇯🇵", circuit: "Suzuka Circuit", date: "April 6, 2025" },
  { id: 5, name: "Chinese Grand Prix", country: "China", flag: "🇨🇳", circuit: "Shanghai International Circuit", date: "April 20, 2025" },
  { id: 6, name: "Miami Grand Prix", country: "USA", flag: "🇺🇸", circuit: "Miami International Autodrome", date: "May 4, 2025" },
  { id: 7, name: "Emilia Romagna Grand Prix", country: "Italy", flag: "🇮🇹", circuit: "Autodromo Enzo e Dino Ferrari", date: "May 18, 2025" },
  { id: 8, name: "Monaco Grand Prix", country: "Monaco", flag: "🇲🇨", circuit: "Circuit de Monaco", date: "May 25, 2025" },
  { id: 9, name: "Spanish Grand Prix", country: "Spain", flag: "🇪🇸", circuit: "Circuit de Barcelona-Catalunya", date: "June 1, 2025" },
  { id: 10, name: "Canadian Grand Prix", country: "Canada", flag: "🇨🇦", circuit: "Circuit Gilles Villeneuve", date: "June 15, 2025" },
  { id: 11, name: "Austrian Grand Prix", country: "Austria", flag: "🇦🇹", circuit: "Red Bull Ring", date: "June 29, 2025" },
  { id: 12, name: "British Grand Prix", country: "Great Britain", flag: "🇬🇧", circuit: "Silverstone Circuit", date: "July 6, 2025" },
  { id: 13, name: "Hungarian Grand Prix", country: "Hungary", flag: "🇭🇺", circuit: "Hungaroring", date: "July 20, 2025" },
  { id: 14, name: "Belgian Grand Prix", country: "Belgium", flag: "🇧🇪", circuit: "Circuit de Spa-Francorchamps", date: "July 27, 2025" },
  { id: 15, name: "Dutch Grand Prix", country: "Netherlands", flag: "🇳🇱", circuit: "Circuit Zandvoort", date: "August 31, 2025" },
  { id: 16, name: "Italian Grand Prix", country: "Italy", flag: "🇮🇹", circuit: "Autodromo Nazionale di Monza", date: "September 7, 2025" },
  { id: 17, name: "Azerbaijan Grand Prix", country: "Azerbaijan", flag: "🇦🇿", circuit: "Baku City Circuit", date: "September 21, 2025" },
  { id: 18, name: "Singapore Grand Prix", country: "Singapore", flag: "🇸🇬", circuit: "Marina Bay Street Circuit", date: "October 5, 2025" },
  { id: 19, name: "United States Grand Prix", country: "USA", flag: "🇺🇸", circuit: "Circuit of the Americas", date: "October 19, 2025" },
  { id: 20, name: "Mexico City Grand Prix", country: "Mexico", flag: "🇲🇽", circuit: "Autódromo Hermanos Rodríguez", date: "October 26, 2025" },
  { id: 21, name: "São Paulo Grand Prix", country: "Brazil", flag: "🇧🇷", circuit: "Autódromo José Carlos Pace", date: "November 9, 2025" },
  { id: 22, name: "Las Vegas Grand Prix", country: "USA", flag: "🇺🇸", circuit: "Las Vegas Street Circuit", date: "November 22, 2025" },
  { id: 23, name: "Qatar Grand Prix", country: "Qatar", flag: "🇶🇦", circuit: "Losail International Circuit", date: "November 30, 2025" },
  { id: 24, name: "Abu Dhabi Grand Prix", country: "UAE", flag: "🇦🇪", circuit: "Yas Marina Circuit", date: "December 7, 2025" },
];
