export type Role = "utas" | "járművezető" | "diszpécser" | "admin";

export const stops = [
  { city: "Budapest", name: "Népliget" },
  { city: "Kecskemét", name: "Autóbusz-állomás" },
  { city: "Szeged", name: "Autóbusz-állomás" },
  { city: "Győr", name: "Autóbusz-állomás" },
  { city: "Debrecen", name: "Nagyállomás" },
  { city: "Pécs", name: "Autóbusz-állomás" },
  { city: "Szolnok", name: "Autóbusz-állomás" },
  { city: "Miskolc", name: "Búza tér" },
];

export const routes = [
  { code: "M5", from: "Budapest", via: "Kecskemét", to: "Szeged", distance: 172.4, duration: 150 },
  { code: "M3", from: "Budapest", via: "Szolnok", to: "Debrecen", distance: 226, duration: 190 },
  { code: "M1", from: "Budapest", via: "", to: "Győr", distance: 120, duration: 95 },
  { code: "M6", from: "Budapest", via: "", to: "Pécs", distance: 200, duration: 175 },
];

export type Trip = {
  id: string;
  code: string;
  from: string;
  to: string;
  departure: string;
  arrival: string;
  duration: string;
  distance: number;
  price: number;
  occupancy: number;
  seats: number;
  delay: number;
  status: string;
  vehicle: string;
};

export const trips: Trip[] = [
  {
    id: "m5-0630",
    code: "M5",
    from: "Budapest, Népliget",
    to: "Szeged, Autóbusz-állomás",
    departure: "06:30",
    arrival: "09:00",
    duration: "2 ó 30 p",
    distance: 172.4,
    price: 4990,
    occupancy: 34,
    seats: 31,
    delay: 0,
    status: "Tervezett",
    vehicle: "ABC-123",
  },
  {
    id: "m5-0800",
    code: "M5",
    from: "Budapest, Népliget",
    to: "Szeged, Autóbusz-állomás",
    departure: "08:00",
    arrival: "10:30",
    duration: "2 ó 30 p",
    distance: 172.4,
    price: 4990,
    occupancy: 66,
    seats: 16,
    delay: 12,
    status: "Úton",
    vehicle: "DEF-456",
  },
  {
    id: "m3-1015",
    code: "M3",
    from: "Budapest, Népliget",
    to: "Debrecen, Nagyállomás",
    departure: "10:15",
    arrival: "13:25",
    duration: "3 ó 10 p",
    distance: 226,
    price: 4990,
    occupancy: 87,
    seats: 6,
    delay: 12,
    status: "Tervezett",
    vehicle: "GHI-789",
  },
  {
    id: "m1-1300",
    code: "M1",
    from: "Budapest, Népliget",
    to: "Győr, Autóbusz-állomás",
    departure: "13:00",
    arrival: "14:35",
    duration: "1 ó 35 p",
    distance: 120,
    price: 3490,
    occupancy: 100,
    seats: 0,
    delay: 0,
    status: "Tervezett",
    vehicle: "ABC-123",
  },
  {
    id: "m6-1645",
    code: "M6",
    from: "Budapest, Népliget",
    to: "Pécs, Autóbusz-állomás",
    departure: "16:45",
    arrival: "19:40",
    duration: "2 ó 55 p",
    distance: 200,
    price: 4990,
    occupancy: 48,
    seats: 25,
    delay: 25,
    status: "Tervezett",
    vehicle: "DEF-456",
  },
  {
    id: "m5-1930",
    code: "M5",
    from: "Budapest, Népliget",
    to: "Szeged, Autóbusz-állomás",
    departure: "19:30",
    arrival: "22:00",
    duration: "2 ó 30 p",
    distance: 172.4,
    price: 4990,
    occupancy: 72,
    seats: 14,
    delay: 0,
    status: "Tervezett",
    vehicle: "GHI-789",
  },
];

export const vehicles = [
  { plate: "ABC-123", model: "Mercedes Tourismo", seats: 48, state: "Úton" },
  { plate: "DEF-456", model: "Setra S 515", seats: 52, state: "Telephelyen" },
  { plate: "GHI-789", model: "Irizar i6", seats: 44, state: "Karbantartás" },
];

export const users = [
  { name: "Kovács Anna", role: "Utas", detail: "Diák kedvezmény", status: "Aktív" },
  { name: "Szabó Péter", role: "Járművezető", detail: "ABC-123", status: "Aktív" },
  { name: "Nagy Eszter", role: "Diszpécser", detail: "Központ", status: "Aktív" },
  { name: "Admin Zoltán", role: "Admin", detail: "Teljes hozzáférés", status: "Aktív" },
];

export const adminStats = [
  { name: "H", utas: 1120, bevetel: 4.8 },
  { name: "K", utas: 1380, bevetel: 5.6 },
  { name: "Sze", utas: 1290, bevetel: 5.2 },
  { name: "Cs", utas: 1530, bevetel: 6.1 },
  { name: "P", utas: 1840, bevetel: 7.4 },
  { name: "Szo", utas: 2110, bevetel: 8.2 },
  { name: "V", utas: 1760, bevetel: 6.9 },
];

export const formatFt = (value: number) =>
  `${Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ft`;
export const formatDistance = (value: number) =>
  `${value.toLocaleString("hu-HU", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

export const formatDateHu = (value: string | Date) =>
  new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "long",
  }).format(typeof value === "string" ? new Date(`${value}T12:00:00`) : value);
