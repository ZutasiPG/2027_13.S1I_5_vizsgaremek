import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BusFront,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  Edit3,
  FileText,
  GripVertical,
  Info,
  LockKeyhole,
  MapPin,
  MoreHorizontal,
  Plus,
  Route,
  Search,
  ShieldAlert,
  TicketCheck,
  TrendingDown,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useApp } from "../app/AppContext";
import {
  adminStats,
  formatDistance,
  formatFt,
  routes,
  stops,
  trips,
  users,
  vehicles,
} from "../app/data";
import {
  Button,
  ConfirmDialog,
  DataTable,
  ErrorBanner,
  ErrorState,
  OccupancyBadge,
  Skeletons,
  StatusPill,
} from "../components/ui";

function AdminHeading({
  title,
  text,
  action,
}: {
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-title">
      <div>
        <h1>{title}</h1>
        <p>{text}</p>
      </div>
      {action}
    </div>
  );
}

function FilterBar({ statistics = false }: { statistics?: boolean }) {
  return (
    <div className="admin-filter-bar">
      <label>
        <span>{statistics ? "Dátumtartomány" : "Időszak"}</span>
        <select>
          <option>Ma</option>
          <option>Elmúlt 7 nap</option>
          <option>Ez a hónap</option>
        </select>
      </label>
      <label>
        <span>Útvonal</span>
        <select>
          <option>Minden útvonal</option>
          {routes.map((r) => (
            <option key={r.code}>
              {r.code} · {r.from}–{r.to}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>Menet</span>
        <select>
          <option>Minden menet</option>
          <option>M5 · 08:00</option>
        </select>
      </label>
      <label>
        <span>Jegy állapota</span>
        <select>
          <option>Minden állapot</option>
          <option>Aktív</option>
          <option>Felhasznált</option>
          <option>Lemondott</option>
        </select>
      </label>
      {!statistics && (
        <label>
          <span>Kedvezmény</span>
          <select>
            <option>Minden kategória</option>
            <option>Diák</option>
            <option>Nyugdíjas</option>
          </select>
        </label>
      )}
      {statistics && (
        <label>
          <span>Csoportosítás</span>
          <select>
            <option>Nap</option>
            <option>Hét</option>
            <option>Hónap</option>
          </select>
        </label>
      )}
    </div>
  );
}

const spark = [10, 18, 15, 24, 20, 31, 35];
function Kpi({
  label,
  value,
  trend,
  icon: Icon,
  negative = false,
}: {
  label: string;
  value: string;
  trend: string;
  icon: typeof Users;
  negative?: boolean;
}) {
  return (
    <article className="admin-kpi">
      <div>
        <span>
          <Icon />
        </span>
        <small>{label}</small>
      </div>
      <h2>{value}</h2>
      <div className={negative ? "negative" : "positive"}>
        {negative ? <TrendingDown /> : <TrendingUp />}
        {trend}
        <svg viewBox="0 0 100 30">
          <polyline points={spark.map((v, i) => `${i * 16},${30 - v / 1.5}`).join(" ")} />
        </svg>
      </div>
    </article>
  );
}

const eventSeed = [
  { time: "09:18", type: "Késés", trip: "M5 · 08:00", text: "+12 perc · torlódás az M5-ösön" },
  {
    time: "08:55",
    type: "Műszaki hiba",
    trip: "M3 · 06:30",
    text: "Klímaberendezés ellenőrzése szükséges",
  },
  {
    time: "08:24",
    type: "Útvonalváltozás",
    trip: "M1 · 08:00",
    text: "Ideiglenes terelés Győr belvárosában",
  },
];

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<(typeof trips)[number] | null>(null);
  const [events, setEvents] = useState(eventSeed);
  useEffect(() => {
    const ready = window.setTimeout(() => setLoading(false), 650);
    const timer = window.setTimeout(
      () =>
        setEvents((items) => [
          { time: "09:24", type: "Késés", trip: "M6 · 10:15", text: "+5 perc · erős forgalom" },
          ...items,
        ]),
      5500,
    );
    return () => {
      window.clearTimeout(ready);
      window.clearTimeout(timer);
    };
  }, []);
  if (loading)
    return (
      <>
        <AdminHeading title="Dashboard" text="Az operációs adatok betöltése…" />
        <Skeletons />
      </>
    );
  return (
    <>
      <AdminHeading
        title="Dashboard"
        text="Valós idejű operációs áttekintés · 2026. máj. 14., csütörtök"
        action={
          <Button>
            <Plus />
            Új menet
          </Button>
        }
      />
      <FilterBar />
      <div className="admin-kpi-grid">
        <Kpi label="Napi bevétel" value="7,48 M Ft" trend="+8,1%" icon={CircleDollarSign} />
        <Kpi label="Eladott jegyek" value="1 842" trend="+12,4%" icon={TicketCheck} />
        <Kpi label="Aktív járatok" value="28" trend="+3 járat" icon={BusFront} />
        <Kpi
          label="Késések átlaga / max."
          value="6 / 25 perc"
          trend="+1,2 perc"
          icon={Clock3}
          negative
        />
        <Kpi label="Átlagos telítettség" value="72%" trend="+4,8%" icon={Users} />
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-live-map">
          <div className="panel-head">
            <div>
              <h2>Aktív járatok élő térképe</h2>
              <p>A jelölő színe a késés mértékét mutatja.</p>
            </div>
            <span className="live-label">ÉLŐ</span>
          </div>
          <div className="fleet-map">
            <div className="fleet-map-grid" />
            {trips.slice(0, 5).map((trip, index) => (
              <button
                className={`fleet-bus ${trip.delay >= 15 ? "late" : trip.delay > 0 ? "delayed" : ""}`}
                style={{ left: `${15 + index * 17}%`, top: `${65 - (index % 3) * 22}%` }}
                key={trip.id}
                onClick={() => setSelected(trip)}
              >
                <BusFront />
                <span>
                  {trip.code}
                  <small>{trip.delay ? `+${trip.delay} p` : "Pontos"}</small>
                </span>
              </button>
            ))}
          </div>
          <div className="map-legend">
            <span>
              <i />
              Pontos
            </span>
            <span>
              <i className="amber" />
              1–14 perc
            </span>
            <span>
              <i className="red" />
              15+ perc
            </span>
          </div>
        </section>
        <section className="admin-panel incident-feed">
          <div className="panel-head">
            <div>
              <h2>Legutóbbi események</h2>
              <p>A menetnaplóból, élőben</p>
            </div>
          </div>
          {events.map((event, index) => (
            <article
              className={index === 0 && events.length > 3 ? "new" : ""}
              key={`${event.time}-${event.trip}`}
            >
              <span className={event.type === "Késés" ? "warning" : "danger"}>
                <AlertTriangle />
              </span>
              <div>
                <b>
                  {event.type} · {event.trip}
                </b>
                <p>{event.text}</p>
              </div>
              <time>{event.time}</time>
            </article>
          ))}
        </section>
      </div>
      <section className="admin-panel active-trips">
        <div className="panel-head">
          <div>
            <h2>Aktív és közelgő járatok</h2>
            <p>Mai indulások és valós idejű állapotok</p>
          </div>
          <button>Összes megtekintése</button>
        </div>
        <div className="admin-wide-table">
          <div className="awt-row head">
            <span>Járat</span>
            <span>Indulás</span>
            <span>Jármű</span>
            <span>Járművezető</span>
            <span>Állapot</span>
            <span>Késés</span>
            <span>Telítettség</span>
            <span />
          </div>
          {trips.map((trip, index) => (
            <div className="awt-row" key={trip.id}>
              <b>
                {trip.code}
                <small>
                  {trip.from.split(",")[0]}–{trip.to.split(",")[0]}
                </small>
              </b>
              <span>{trip.departure}</span>
              <span>{trip.vehicle}</span>
              <span>{["Szabó Péter", "Kiss Márton", "Farkas Gábor"][index % 3]}</span>
              <StatusPill status={trip.status} />
              <span className={trip.delay ? "admin-delay" : ""}>
                {trip.delay ? `+${trip.delay} perc` : "Pontos"}
              </span>
              <OccupancyBadge value={trip.occupancy} />
              <button onClick={() => setSelected(trip)}>
                <MoreHorizontal />
              </button>
            </div>
          ))}
        </div>
      </section>
      {selected && <TripSidePanel trip={selected} close={() => setSelected(null)} />}
    </>
  );
}

function TripSidePanel({ trip, close }: { trip: (typeof trips)[number]; close: () => void }) {
  return (
    <div className="drawer-backdrop" onMouseDown={close}>
      <aside className="admin-trip-drawer" onMouseDown={(e) => e.stopPropagation()}>
        <button onClick={close}>
          <X />
        </button>
        <span className="kicker">MENET RÉSZLETEI</span>
        <h2>
          {trip.code} · {trip.from.split(",")[0]} → {trip.to.split(",")[0]}
        </h2>
        <StatusPill status={trip.status} />
        <div className="trip-drawer-info">
          <span>
            <small>Indulás</small>
            <b>{trip.departure}</b>
          </span>
          <span>
            <small>Jármű</small>
            <b>{trip.vehicle}</b>
          </span>
          <span>
            <small>Járművezető</small>
            <b>Szabó Péter</b>
          </span>
          <span>
            <small>Késés</small>
            <b>{trip.delay} perc</b>
          </span>
        </div>
        <h3>Telítettség szakaszonként</h3>
        <div className="admin-segments">
          <i />
          <i className="medium" />
          <span>Budapest</span>
          <span>Kecskemét</span>
          <span>Szeged</span>
        </div>
        <OccupancyBadge value={trip.occupancy} />
        <h3>Eseménynapló</h3>
        {eventSeed.slice(0, 2).map((event) => (
          <article className="drawer-event" key={event.time}>
            <AlertTriangle />
            <div>
              <b>{event.type}</b>
              <p>{event.text}</p>
            </div>
            <time>{event.time}</time>
          </article>
        ))}
      </aside>
    </div>
  );
}

export function StopsAdminPage() {
  const [open, setOpen] = useState(false);
  const [lat, setLat] = useState("47.475");
  const [lng, setLng] = useState("19.099");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { notify } = useApp();
  const save = () => {
    if (Number(lat) < -90 || Number(lat) > 90) {
      setError("A szélességi fok -90 és 90 között lehet");
      return;
    }
    if (Number(lng) < -180 || Number(lng) > 180) {
      setError("A hosszúsági fok -180 és 180 között lehet");
      return;
    }
    notify("Az új megállót létrehoztuk.");
    setOpen(false);
  };
  const rows = stops.map((s, index) => ({
    name: s.name,
    city: s.city,
    latitude: (47.49 - index * 0.17).toFixed(5),
    longitude: (19.04 + index * 0.21).toFixed(5),
  }));
  return (
    <>
      <AdminHeading
        title="Megállók"
        text="Megállóhelyek, koordináták és térképi pozíciók"
        action={
          <Button onClick={() => setOpen(true)}>
            <Plus />
            Új megálló
          </Button>
        }
      />
      <div className="admin-panel">
        <DataTable
          columns={[
            { key: "name", label: "Név" },
            { key: "city", label: "Város" },
            { key: "latitude", label: "Szélesség" },
            { key: "longitude", label: "Hosszúság" },
          ]}
          rows={rows}
        />
      </div>
      {open && (
        <div className="modal-backdrop">
          <div className="admin-form-modal">
            <button
              className="modal-close"
              onClick={() => setOpen(false)}
              aria-label="Ablak bezárása"
            >
              <X />
            </button>
            <h2>Új megálló</h2>
            <div className="form-grid">
              <label className="field">
                <span>Név</span>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="field">
                <span>Város</span>
                <input defaultValue="Budapest" />
              </label>
              <label className={`field ${error.includes("szélességi") ? "field-error" : ""}`}>
                <span>Szélesség</span>
                <input value={lat} onChange={(e) => setLat(e.target.value)} />
              </label>
              <label className={`field ${error.includes("hosszúsági") ? "field-error" : ""}`}>
                <span>Hosszúság</span>
                <input value={lng} onChange={(e) => setLng(e.target.value)} />
              </label>
            </div>
            {name.toLowerCase().includes("népliget") && (
              <div className="admin-warning">
                <AlertTriangle />
                Hasonló megálló már létezik
              </div>
            )}
            {error && (
              <div className="admin-error">
                <AlertTriangle />
                {error}
              </div>
            )}
            <div className="coordinate-picker">
              <MapPin />
              <span>Jelöld ki a pozíciót a térképen</span>
              <i />
            </div>
            <Button onClick={save}>Megálló mentése</Button>
          </div>
        </div>
      )}
    </>
  );
}

type RouteStop = { name: string; km: number; minutes: number };
export function RoutesAdminPage() {
  const [active, setActive] = useState([true, true, true, true]);
  const [selected, setSelected] = useState(0);
  const [routeNumber, setRouteNumber] = useState("M5");
  const [routeStops, setRouteStops] = useState<RouteStop[]>([
    { name: "Budapest, Népliget", km: 0, minutes: 0 },
    { name: "Kecskemét, Autóbusz-állomás", km: 84.2, minutes: 72 },
    { name: "Szeged, Autóbusz-állomás", km: 172.4, minutes: 150 },
  ]);
  const [drag, setDrag] = useState<number | null>(null);
  const { notify } = useApp();
  const invalid =
    routeStops.length < 2
      ? "Legalább 2 megálló szükséges"
      : routeStops[0].km !== 0 || routeStops[0].minutes !== 0
        ? "Az első megálló 0 km és 0 perc értékű kell legyen"
        : routeStops.some(
              (s, i) =>
                i > 0 && (s.km <= routeStops[i - 1].km || s.minutes <= routeStops[i - 1].minutes),
            )
          ? "A távolság- és időértékeknek szigorúan növekedniük kell"
          : "";
  const drop = (to: number) => {
    if (drag === null) return;
    const copy = [...routeStops];
    const [item] = copy.splice(drag, 1);
    copy.splice(to, 0, item);
    setRouteStops(copy);
    setDrag(null);
  };
  return (
    <>
      <AdminHeading
        title="Útvonalak"
        text="Viszonylatok és rendezett megállósorok"
        action={
          <Button>
            <Plus />
            Új útvonal
          </Button>
        }
      />
      <div className="route-admin-layout">
        <section className="admin-panel route-list">
          {routes.map((route, index) => (
            <button
              className={selected === index ? "active" : ""}
              onClick={() => {
                setSelected(index);
                setRouteNumber(route.code);
              }}
              key={route.code}
            >
              <span>{route.code}</span>
              <div>
                <b>
                  {route.from}–{route.to}
                </b>
                <small>
                  {formatDistance(route.distance)} · {route.duration} perc
                </small>
              </div>
              <label
                className={`toggle ${active[index] ? "on" : ""}`}
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={active[index]}
                  onChange={() => setActive(active.map((v, i) => (i === index ? !v : v)))}
                />
                <i />
              </label>
            </button>
          ))}
        </section>
        <section className="admin-panel route-editor">
          <div className="panel-head">
            <div>
              <h2>Útvonal szerkesztése</h2>
              <p>A megállók húzással átrendezhetők.</p>
            </div>
            <Button
              variant="danger"
              onClick={() => setActive(active.map((v, i) => (i === selected ? false : v)))}
            >
              Inaktiválás
            </Button>
          </div>
          <div className="form-grid">
            <label className="field">
              <span>Útvonalszám</span>
              <input value={routeNumber} onChange={(e) => setRouteNumber(e.target.value)} />
              <small>
                {routes.some((r, i) => r.code === routeNumber && i !== selected)
                  ? "Az útvonalszám már foglalt"
                  : ""}
              </small>
            </label>
            <label className="field">
              <span>Név</span>
              <input defaultValue="Budapest–Kecskemét–Szeged" />
            </label>
          </div>
          <div className="admin-warning">
            <AlertTriangle />A sorrend módosítása már eladott jegyeket érinthet
          </div>
          <div className="route-stop-editor">
            {routeStops.map((stop, index) => (
              <div
                draggable
                onDragStart={() => setDrag(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => drop(index)}
                key={stop.name}
              >
                <GripVertical />
                <b>{index + 1}</b>
                <span>{stop.name}</span>
                <label>
                  <small>km</small>
                  <input
                    type="number"
                    value={stop.km}
                    onChange={(e) =>
                      setRouteStops(
                        routeStops.map((s, i) =>
                          i === index ? { ...s, km: Number(e.target.value) } : s,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <small>perc</small>
                  <input
                    type="number"
                    value={stop.minutes}
                    onChange={(e) =>
                      setRouteStops(
                        routeStops.map((s, i) =>
                          i === index ? { ...s, minutes: Number(e.target.value) } : s,
                        ),
                      )
                    }
                  />
                </label>
              </div>
            ))}
          </div>
          {invalid && (
            <div className="admin-error">
              <AlertTriangle />
              {invalid}
            </div>
          )}
          <div className="editor-actions">
            <Button
              variant="secondary"
              onClick={() =>
                setRouteStops(routeStops.map((s, i) => ({ ...s, km: [0, 84.2, 172.4][i] ?? s.km })))
              }
            >
              <MapPin />
              Távolság számítása GPS alapján
            </Button>
            <Button onClick={() => notify("Az útvonalat elmentettük.")}>Mentés</Button>
          </div>
        </section>
      </div>
    </>
  );
}

type SeatCell = "normal" | "removed" | "accessible";
export function VehiclesAdminPage() {
  const [selected, setSelected] = useState(0);
  const [capacity, setCapacity] = useState(48);
  const [plan, setPlan] = useState<SeatCell[]>(Array(48).fill("normal"));
  const [blocked, setBlocked] = useState(false);
  const count = plan.filter((x) => x !== "removed").length;
  const cycle = (index: number) => {
    setPlan(
      plan.map((cell, i) =>
        i === index
          ? cell === "normal"
            ? "removed"
            : cell === "removed"
              ? "accessible"
              : "normal"
          : cell,
      ),
    );
    setBlocked(true);
  };
  return (
    <>
      <AdminHeading
        title="Járművek"
        text="Flotta és szerkeszthető ülésrajzok"
        action={
          <Button>
            <Plus />
            Új jármű
          </Button>
        }
      />
      <div className="vehicle-admin-layout">
        <section className="admin-panel vehicle-list">
          {vehicles.map((vehicle, index) => (
            <button
              className={selected === index ? "active" : ""}
              onClick={() => setSelected(index)}
              key={vehicle.plate}
            >
              <BusFront />
              <div>
                <b>{vehicle.plate}</b>
                <small>
                  {vehicle.model} · {vehicle.seats} ülés
                </small>
              </div>
              <span className="toggle on">
                <i />
              </span>
            </button>
          ))}
        </section>
        <section className="admin-panel vehicle-editor">
          <div className="panel-head">
            <div>
              <h2>{vehicles[selected].plate} szerkesztése</h2>
              <p>Az első és utolsó oszlop automatikusan ablak melletti.</p>
            </div>
            <strong className={count !== capacity ? "capacity-error" : ""}>
              Kapacitás: {count} ülés
            </strong>
          </div>
          {blocked && (
            <ErrorBanner>
              <b>409 · Az ülésrajz módosítása blokkolva:</b>&nbsp; ehhez a járműhöz eladott
              foglalások tartoznak.
            </ErrorBanner>
          )}
          <div className="form-grid">
            <label className="field">
              <span>Rendszám</span>
              <input defaultValue={vehicles[selected].plate} />
            </label>
            <label className="field">
              <span>Modell</span>
              <input defaultValue={vehicles[selected].model} />
            </label>
            <label className="field">
              <span>Sorok</span>
              <input value="12" readOnly />
            </label>
            <label className="field">
              <span>Oszlopok</span>
              <input value="4" readOnly />
            </label>
            <label className={`field full ${count !== capacity ? "field-error" : ""}`}>
              <span>Kapacitás</span>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
              />
              {count !== capacity && (
                <small>A kapacitás mezőnek egyeznie kell az ülésrajzzal.</small>
              )}
            </label>
          </div>
          <div className="admin-seat-grid">
            {plan.map((cell, index) => {
              const row = Math.floor(index / 4) + 1;
              const letter = ["A", "B", "C", "D"][index % 4];
              return (
                <button
                  className={`${cell} ${index % 4 === 0 || index % 4 === 3 ? "window" : ""}`}
                  onClick={() => cycle(index)}
                  key={index}
                >
                  <span>
                    {cell === "removed" ? "—" : cell === "accessible" ? "♿" : `${row}${letter}`}
                  </span>
                  {(index % 4 === 0 || index % 4 === 3) && <small>ablak</small>}
                </button>
              );
            })}
          </div>
          <div className="seat-plan-legend">
            <span>
              <i />
              Normál
            </span>
            <span>
              <i className="removed" />
              Kihagyott
            </span>
            <span>
              <i className="accessible" />
              Akadálymentes
            </span>
          </div>
        </section>
      </div>
    </>
  );
}

export function ScheduleAdminPage() {
  const [calendar, setCalendar] = useState(true);
  const [open, setOpen] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [skip, setSkip] = useState(false);
  const week = [
    "Hétfő 11.",
    "Kedd 12.",
    "Szerda 13.",
    "Csütörtök 14.",
    "Péntek 15.",
    "Szombat 16.",
    "Vasárnap 17.",
  ];
  return (
    <>
      <AdminHeading
        title="Menetrend"
        text="Heti naptár és menetindítások"
        action={
          <div className="heading-actions">
            <div className="view-toggle">
              <button className={calendar ? "active" : ""} onClick={() => setCalendar(true)}>
                Naptár
              </button>
              <button className={!calendar ? "active" : ""} onClick={() => setCalendar(false)}>
                Lista
              </button>
            </div>
            <Button onClick={() => setOpen(true)}>
              <Plus />
              Új menet
            </Button>
          </div>
        }
      />
      {calendar ? (
        <div className="week-calendar">
          {week.map((day, index) => (
            <section key={day}>
              <header>{day}</header>
              {trips.slice(index % 3, (index % 3) + 2).map((trip) => (
                <article key={trip.id}>
                  <b>
                    {trip.departure} · {trip.code}
                  </b>
                  <span>{trip.vehicle}</span>
                  <small>{trip.status}</small>
                </article>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <div className="admin-panel">
          <DataTable
            columns={[
              { key: "code", label: "Járat" },
              { key: "departure", label: "Indulás" },
              { key: "vehicle", label: "Jármű" },
              { key: "driver", label: "Sofőr" },
              { key: "status", label: "Állapot" },
              { key: "action", label: "Művelet" },
            ]}
            rows={trips.map((t) => ({
              code: t.code,
              departure: t.departure,
              vehicle: t.vehicle,
              driver: "Szabó Péter",
              status: t.status,
              action: "Lemondás",
            }))}
          />
        </div>
      )}
      {open && (
        <div className="modal-backdrop">
          <div className="admin-form-modal schedule-modal">
            <button
              className="modal-close"
              onClick={() => setOpen(false)}
              aria-label="Ablak bezárása"
            >
              <X />
            </button>
            <h2>Új menet</h2>
            <div className="form-grid">
              <label className="field">
                <span>Útvonal</span>
                <select>
                  <option>M5 · Budapest–Szeged</option>
                </select>
              </label>
              <label className="field">
                <span>Jármű</span>
                <select onChange={() => setConflict(true)}>
                  <option>ABC-123</option>
                  <option>DEF-456</option>
                </select>
              </label>
              <label className="field">
                <span>Járművezető</span>
                <select onChange={() => setConflict(true)}>
                  <option>Szabó Péter · járművezető</option>
                  <option>Kiss Márton · járművezető</option>
                </select>
              </label>
              <label className="field">
                <span>Indulás dátuma</span>
                <input type="date" defaultValue="2026-05-18" />
              </label>
              <label className="field">
                <span>Indulás</span>
                <input type="time" defaultValue="08:00" />
              </label>
              <label className="field">
                <span>Számított érkezés</span>
                <input value="10:30" readOnly />
              </label>
            </div>
            <div className="repeat-rule">
              <b>Ismétlődés</b>
              <div>
                {["H", "K", "Sze", "Cs", "P", "Szo", "V"].map((d) => (
                  <button className={["H", "Sze", "P"].includes(d) ? "active" : ""} key={d}>
                    {d}
                  </button>
                ))}
              </div>
              <span>
                <input type="date" defaultValue="2026-05-18" /> –{" "}
                <input type="date" defaultValue="2026-06-30" />
              </span>
            </div>
            {conflict && (
              <div className="admin-error conflict-list">
                <AlertTriangle />
                <span>
                  <b>Ütköző foglalások</b>ABC-123: május 20., 27. · Szabó Péter: május 22.
                </span>
                <label>
                  <input type="checkbox" checked={skip} onChange={() => setSkip(!skip)} />
                  Ütköző napok kihagyása
                </label>
              </div>
            )}
            <Button>Menetek létrehozása</Button>
          </div>
        </div>
      )}
    </>
  );
}

export function FaresAdminPage() {
  const [fareError, setFareError] = useState("");
  const fareRows = [
    { minKm: 0, maxKm: 50, basePrice: "1 490 Ft", status: "Aktív" },
    { minKm: 45, maxKm: 100, basePrice: "2 490 Ft", status: "Aktív" },
    { minKm: 110, maxKm: 150, basePrice: "3 490 Ft", status: "Aktív" },
    { minKm: 150, maxKm: 250, basePrice: "4 990 Ft", status: "Aktív" },
  ];
  const passRows = [
    {
      name: "Napi bérlet",
      durationDays: 1,
      price: "6 990 Ft",
      targetDiscount: "Nincs",
      status: "Aktív",
    },
    {
      name: "Havi diák",
      durationDays: 30,
      price: "34 995 Ft",
      targetDiscount: "Diák",
      status: "Aktív",
    },
    {
      name: "Éves",
      durationDays: 365,
      price: "599 900 Ft",
      targetDiscount: "Nincs",
      status: "Aktív",
    },
  ];
  return (
    <>
      <AdminHeading title="Díjszabás" text="Viteldíjsávok, bérletek és kedvezmények" />
      <ErrorBanner>
        <b>422 · Hiányzó díjszabás:</b>&nbsp; a 100–110 km közötti tartományhoz még nincs alapár.
      </ErrorBanner>
      <div className="discount-config">
        <div>
          <b>Kedvezmény százalékok</b>
          <p>A jegyár számításakor automatikusan alkalmazva.</p>
        </div>
        <span>
          Nincs <b>0%</b>
        </span>
        <span>
          Diák <b>50%</b>
        </span>
        <span>
          Nyugdíjas <b>90%</b>
        </span>
        <Button variant="secondary">Szerkesztés</Button>
      </div>
      <section className="admin-panel fare-section">
        <div className="panel-head">
          <div>
            <h2>Viteldíjsávok</h2>
            <p>Inaktiválás törlés helyett</p>
          </div>
          <Button
            onClick={() =>
              setFareError("A minimum távolság nem lehet nagyobb vagy egyenlő a maximumnál.")
            }
          >
            <Plus />
            Új díjsáv
          </Button>
        </div>
        <div className="fare-band">
          <span style={{ width: "20%" }}>0–50</span>
          <span className="overlap" style={{ width: "22%" }}>
            45–100
          </span>
          <i className="gap" />
          <span style={{ width: "18%" }}>110–150</span>
          <span style={{ width: "40%" }}>150–250 km</span>
        </div>
        <div className="band-messages">
          <b>Átfedés: 45–50 km</b>
          <span>Rés: 100–110 km</span>
        </div>
        {fareError && (
          <div className="admin-error">
            <AlertTriangle />
            {fareError} A negatív ár nem megengedett.
          </div>
        )}
        <DataTable
          columns={[
            { key: "minKm", label: "Min. km" },
            { key: "maxKm", label: "Max. km" },
            { key: "basePrice", label: "Alapár" },
            { key: "status", label: "Állapot" },
          ]}
          rows={fareRows}
        />
      </section>
      <section className="admin-panel fare-section">
        <div className="panel-head">
          <div>
            <h2>Bérlettípusok</h2>
            <p>Érvényesség és célzott kedvezmények</p>
          </div>
          <Button>
            <Plus />
            Új bérlettípus
          </Button>
        </div>
        <DataTable
          columns={[
            { key: "name", label: "Név" },
            { key: "durationDays", label: "Időtartam (nap)" },
            { key: "price", label: "Ár" },
            { key: "targetDiscount", label: "Célkedvezmény" },
            { key: "status", label: "Állapot" },
          ]}
          rows={passRows}
        />
        <div className="inline-rule">
          <Info />
          Az időtartam csak pozitív egész szám lehet. Érvénytelen időtartam esetén a mentés
          blokkolva van.
        </div>
      </section>
    </>
  );
}

export function AdminOnly({ children }: { children: React.ReactNode }) {
  const { role } = useApp();
  if (role !== "admin") return <ErrorState code={403} />;
  return <>{children}</>;
}

export function UsersAdminPage() {
  const [selected, setSelected] = useState<(typeof users)[number] | null>(null);
  const [error, setError] = useState("");
  const rows = users.map((u, index) => ({
    ...u,
    email: ["anna@transix.hu", "peter@transix.hu", "eszter@transix.hu", "admin@transix.hu"][index],
    discount: index === 0 ? "Diák" : "Nincs",
    registeredAt: `2025. 0${index + 1}. 14.`,
  }));
  const guard = (value: string) => {
    if (selected?.role === "Admin" && value !== "admin")
      setError("Az utolsó adminisztrátor nem fokozható le");
    else if (selected?.name === "Admin Zoltán") setError("Saját jogosultságod nem veheted el");
    else if (selected?.role === "Járművezető" && value !== "driver")
      setError("A sofőrnek jövőbeli menetei vannak, előbb rendelj új sofőrt");
    else setError("");
  };
  return (
    <AdminOnly>
      <AdminHeading title="Felhasználók" text="Szerepkörök és kedvezménykategóriák" />
      <div className="admin-panel">
        <DataTable
          columns={[
            { key: "name", label: "Név" },
            { key: "email", label: "Email" },
            { key: "role", label: "Szerepkör" },
            { key: "discount", label: "Kedvezmény" },
            { key: "registeredAt", label: "Regisztráció" },
          ]}
          rows={rows}
          onRow={(row) => setSelected(rows.find((u) => u.name === row.name) || null)}
        />
      </div>
      {selected && (
        <div className="drawer-backdrop" onMouseDown={() => setSelected(null)}>
          <aside className="admin-edit-drawer" onMouseDown={(e) => e.stopPropagation()}>
            <button onClick={() => setSelected(null)}>
              <X />
            </button>
            <span className="kicker">FELHASZNÁLÓ</span>
            <h2>{selected.name}</h2>
            <p>{rows.find((u) => u.name === selected.name)?.email}</p>
            <label className="field">
              <span>Szerepkör</span>
              <select
                onChange={(e) => guard(e.target.value)}
                defaultValue={selected.role.toLowerCase()}
              >
                <option value="utas">Utas</option>
                <option value="driver">Járművezető</option>
                <option value="diszpécser">Diszpécser</option>
                <option value="admin">Admin</option>
              </select>
            </label>
            <label className="field">
              <span>Kedvezménykategória</span>
              <select>
                <option>Nincs</option>
                <option>Diák</option>
                <option>Nyugdíjas</option>
              </select>
            </label>
            {error && (
              <div className="admin-error">
                <ShieldAlert />
                {error}
              </div>
            )}
            <Button disabled={Boolean(error)}>Változtatások mentése</Button>
          </aside>
        </div>
      )}
    </AdminOnly>
  );
}

const statsData = adminStats.map((item, index) => ({
  ...item,
  validated: 880 + index * 140,
  tickets: 1100 + index * 170,
  avgDelay: 3 + index,
  maxDelay: 12 + index * 2,
  morning: 45 + index * 3,
}));
export function AdminStatisticsPage() {
  return (
    <>
      <AdminHeading
        title="Statisztika"
        text="Értékesítési és operációs elemzések"
        action={
          <div className="export-actions">
            <Button variant="secondary">
              <Download />
              Exportálás CSV
            </Button>
            <Button variant="secondary">
              <FileText />
              Exportálás PDF
            </Button>
          </div>
        }
      />
      <FilterBar statistics />
      <div className="stat-highlight-grid">
        <article>
          <Route />
          <span>
            <small>Legnépszerűbb útvonal</small>
            <b>M5 · Budapest–Szeged</b>
          </span>
        </article>
        <article>
          <MapPin />
          <span>
            <small>Legforgalmasabb megálló</small>
            <b>Budapest, Népliget</b>
          </span>
        </article>
        <article>
          <Clock3 />
          <span>
            <small>Csúcsidő</small>
            <b>16:00–18:00</b>
          </span>
        </article>
      </div>
      <div className="statistics-grid">
        <Chart title="Bevétel">
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line dataKey="bevetel" name="Bevétel (M Ft)" stroke="#1E88E5" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Eladott és érvényesített jegyek">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={statsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="tickets" name="Eladott" fill="#1E88E5" />
              <Bar dataKey="validated" name="Érvényesített" fill="#38B6FF" />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Útvonalak népszerűsége">
          <ResponsiveContainer width="100%" height={230}>
            <PieChart>
              <Pie
                data={routes.map((r, i) => ({ name: r.code, value: 40 - i * 6 }))}
                dataKey="value"
                innerRadius={45}
                outerRadius={85}
              >
                {["#1E88E5", "#38B6FF", "#16A34A", "#F59E0B"].map((c) => (
                  <Cell fill={c} key={c} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Átlagos telítettség napszak szerint">
          <ResponsiveContainer width="100%" height={230}>
            <AreaChart
              data={[
                { name: "Reggel", value: 62 },
                { name: "Délelőtt", value: 48 },
                { name: "Délután", value: 71 },
                { name: "Este", value: 84 },
              ]}
            >
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Area dataKey="value" fill="#E3F4FF" stroke="#1E88E5" />
            </AreaChart>
          </ResponsiveContainer>
        </Chart>
        <Chart title="Késések átlaga és maximuma">
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={statsData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="avgDelay" name="Átlag" fill="#F59E0B" />
              <Bar dataKey="maxDelay" name="Maximum" fill="#DC2626" />
            </BarChart>
          </ResponsiveContainer>
        </Chart>
      </div>
      <section className="admin-panel">
        <DataTable
          columns={[
            { key: "name", label: "Nap" },
            { key: "tickets", label: "Eladott jegy" },
            { key: "validated", label: "Érvényesített" },
            { key: "avgDelay", label: "Átlagos késés" },
            { key: "maxDelay", label: "Max. késés" },
          ]}
          rows={statsData}
        />
      </section>
    </>
  );
}
function Chart({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="admin-panel statistic-chart">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

const audits = [
  {
    time: "2026-05-14 09:42:18.153",
    table: "trips",
    key: "m5-0800",
    operation: "UPDATE",
    user: "Nagy Eszter",
    old: { delayMinutes: 4, status: "Úton", passwordHash: "secret" },
    new: { delayMinutes: 12, status: "Úton", passwordHash: "changed" },
  },
  {
    time: "2026-05-14 09:18:02.481",
    table: "users",
    key: "usr_1482",
    operation: "UPDATE",
    user: "Admin Zoltán",
    old: { role: "utas", discount: "none" },
    new: { role: "utas", discount: "student" },
  },
  {
    time: "2026-05-14 08:55:44.019",
    table: "tripEvents",
    key: "evt_901",
    operation: "INSERT",
    user: "Szabó Péter",
    old: {},
    new: { type: "delay", minutes: 12 },
  },
  {
    time: "2026-05-13 18:22:07.930",
    table: "fareBands",
    key: "fare_04",
    operation: "DELETE",
    user: "Admin Zoltán",
    old: { minKm: 150, maxKm: 250 },
    new: {},
  },
];
export function AuditLogPage() {
  const [selected, setSelected] = useState<(typeof audits)[number] | null>(null);
  return (
    <AdminOnly>
      <AdminHeading title="Audit napló" text="Adatváltozások és rendszerműveletek" />
      <div className="readonly-banner">
        <LockKeyhole />
        <div>
          <b>A napló csak olvasható.</b>
          <span>A bejegyzések nem módosíthatók és nem törölhetők.</span>
        </div>
      </div>
      <div className="admin-filter-bar audit-filters">
        <label>
          <span>Tábla</span>
          <select>
            <option>Minden tábla</option>
            <option>trips</option>
            <option>users</option>
          </select>
        </label>
        <label>
          <span>Művelet</span>
          <select>
            <option>Minden művelet</option>
            <option>INSERT</option>
            <option>UPDATE</option>
            <option>DELETE</option>
          </select>
        </label>
        <label>
          <span>Felhasználó</span>
          <input placeholder="Név keresése" />
        </label>
      </div>
      <section className="admin-panel audit-table">
        <div className="audit-row head">
          <span>Időpont</span>
          <span>Tábla</span>
          <span>Rekordkulcs</span>
          <span>Művelet</span>
          <span>Felhasználó</span>
        </div>
        {audits.map((audit) => (
          <button className="audit-row" onClick={() => setSelected(audit)} key={audit.time}>
            <code>{audit.time}</code>
            <b>{audit.table}</b>
            <code>{audit.key}</code>
            <span className={`operation ${audit.operation.toLowerCase()}`}>{audit.operation}</span>
            <span>{audit.user}</span>
          </button>
        ))}
      </section>
      {selected && (
        <div className="modal-backdrop" onMouseDown={() => setSelected(null)}>
          <div className="json-diff" onMouseDown={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setSelected(null)}
              aria-label="Ablak bezárása"
            >
              <X />
            </button>
            <h2>Változás részletei</h2>
            <p>
              {selected.table} · {selected.key} · {selected.time}
            </p>
            <div>
              <JsonColumn title="Régi érték" data={selected.old} />
              <JsonColumn title="Új érték" data={selected.new} changed />
            </div>
          </div>
        </div>
      )}
    </AdminOnly>
  );
}
function JsonColumn({
  title,
  data,
  changed = false,
}: {
  title: string;
  data: Record<string, unknown>;
  changed?: boolean;
}) {
  return (
    <section>
      <h3>{title}</h3>
      <pre>
        {"{\n"}
        {Object.entries(data).map(([key, value]) => (
          <span className={changed ? "changed" : ""} key={key}>
            {" "}
            "{key}": {key === "passwordHash" ? '"••••••"' : JSON.stringify(value)}
            {",\n"}
          </span>
        ))}
        {"}"}
      </pre>
    </section>
  );
}
