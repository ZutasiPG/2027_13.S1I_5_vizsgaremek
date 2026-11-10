import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BusFront,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Download,
  MapPin,
  Plus,
  Route,
  TicketCheck,
  Users,
} from "lucide-react";
import { adminStats, routes, stops, trips, users, vehicles, formatFt } from "../app/data";
import { Button, ConfirmDialog, DataTable, OccupancyBadge, StatusPill } from "../components/ui";
import { useApp } from "../app/AppContext";

export function AdminDashboard() {
  const { notify } = useApp();
  const [range, setRange] = useState("7 nap");
  return (
    <>
      <AdminTitle
        title="Áttekintés"
        subtitle="2026. május 14., csütörtök"
        action={
          <Button onClick={() => notify("Az új járat űrlap megnyílt.")}>
            <Plus /> Új járat
          </Button>
        }
      />
      <div className="stat-grid">
        <Stat icon={<TicketCheck />} label="Mai utasok" value="1 842" trend="+12,4%" up />
        <Stat icon={<CircleDollarSign />} label="Mai bevétel" value="7,48 M Ft" trend="+8,1%" up />
        <Stat icon={<BusFront />} label="Aktív járatok" value="28" trend="4 késik" />
        <Stat icon={<Users />} label="Átlagos kihasználtság" value="72%" trend="−2,3%" />
      </div>
      <div className="dashboard-grid">
        <section className="chart-card wide">
          <div className="card-head">
            <div>
              <h2>Utasforgalom és bevétel</h2>
              <p>Napi összesítés az elmúlt időszakban</p>
            </div>
            <select value={range} onChange={(e) => setRange(e.target.value)}>
              <option>7 nap</option>
              <option>30 nap</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={290}>
            <AreaChart data={adminStats}>
              <defs>
                <linearGradient id="passengerFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1E88E5" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#1E88E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E7EDF5" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="utas"
                name="Utas"
                stroke="#1E88E5"
                fill="url(#passengerFill)"
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </section>
        <section className="chart-card">
          <div className="card-head">
            <div>
              <h2>Kihasználtság</h2>
              <p>Mai járatok</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={[
                  { name: "Alacsony", value: 8 },
                  { name: "Közepes", value: 12 },
                  { name: "Magas", value: 6 },
                  { name: "Betelt", value: 2 },
                ]}
                dataKey="value"
                innerRadius={62}
                outerRadius={86}
                paddingAngle={3}
              >
                {["#16A34A", "#F59E0B", "#EF4444", "#8B1E2D"].map((c) => (
                  <Cell key={c} fill={c} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="pie-legend">
            <span>
              <i className="green" />
              Alacsony <b>8</b>
            </span>
            <span>
              <i className="amber" />
              Közepes <b>12</b>
            </span>
            <span>
              <i className="red" />
              Magas/tele <b>8</b>
            </span>
          </div>
        </section>
      </div>
      <section className="admin-card">
        <div className="card-head">
          <div>
            <h2>Mai járatok</h2>
            <p>Valós idejű állapot és kihasználtság</p>
          </div>
          <button>Összes megtekintése →</button>
        </div>
        <div className="live-trip-table">
          <div className="table-row table-header">
            <span>Járat</span>
            <span>Útvonal</span>
            <span>Indulás</span>
            <span>Jármű</span>
            <span>Állapot</span>
            <span>Kihasználtság</span>
          </div>
          {trips.slice(0, 5).map((t) => (
            <div className="table-row" key={t.id}>
              <b>{t.code}</b>
              <span>
                {t.from.split(",")[0]} → {t.to.split(",")[0]}
              </span>
              <span>{t.departure}</span>
              <span>{t.vehicle}</span>
              <StatusPill status={t.status} />
              <OccupancyBadge value={t.occupancy} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Stat({
  icon,
  label,
  value,
  trend,
  up,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend: string;
  up?: boolean;
}) {
  return (
    <article className="stat-card">
      <span>{icon}</span>
      <div>
        <p>{label}</p>
        <h2>{value}</h2>
        <small className={up ? "up" : ""}>
          {up ? <ArrowUpRight /> : <ArrowDownRight />}
          {trend}
        </small>
      </div>
    </article>
  );
}
function AdminTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="admin-title">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

const configs: Record<
  string,
  {
    title: string;
    subtitle: string;
    columns: { key: string; label: string }[];
    rows: Record<string, string | number>[];
    action: string;
  }
> = {
  megallok: {
    title: "Megállók",
    subtitle: "Az országos megállóhálózat kezelése",
    action: "Új megálló",
    columns: [
      { key: "city", label: "Város" },
      { key: "name", label: "Megálló neve" },
      { key: "routes", label: "Érintő útvonalak" },
      { key: "status", label: "Állapot" },
    ],
    rows: stops.map((s, i) => ({
      ...s,
      routes: i < 3 ? "M5, M3, M1, M6" : i < 5 ? "M3" : "M6",
      status: "Aktív",
    })),
  },
  utvonalak: {
    title: "Útvonalak",
    subtitle: "Viszonylatok és megállósorrendek",
    action: "Új útvonal",
    columns: [
      { key: "code", label: "Kód" },
      { key: "route", label: "Viszonylat" },
      { key: "distance", label: "Távolság" },
      { key: "duration", label: "Menetidő" },
      { key: "status", label: "Állapot" },
    ],
    rows: routes.map((r) => ({
      code: r.code,
      route: `${r.from} – ${r.to}`,
      distance: `${r.distance} km`,
      duration: `${r.duration} perc`,
      status: "Aktív",
    })),
  },
  jarmuvek: {
    title: "Járművek",
    subtitle: "Flotta, kapacitás és műszaki állapot",
    action: "Új jármű",
    columns: [
      { key: "plate", label: "Rendszám" },
      { key: "model", label: "Típus" },
      { key: "seats", label: "Ülések" },
      { key: "status", label: "Állapot" },
    ],
    rows: vehicles.map((v) => ({ ...v, status: v.state })),
  },
  menetrend: {
    title: "Menetrend",
    subtitle: "Járatok tervezése és napi indítások",
    action: "Új járat",
    columns: [
      { key: "code", label: "Járat" },
      { key: "route", label: "Útvonal" },
      { key: "departure", label: "Indulás" },
      { key: "vehicle", label: "Jármű" },
      { key: "status", label: "Állapot" },
    ],
    rows: trips.map((t) => ({
      code: t.code,
      route: `${t.from.split(",")[0]} – ${t.to.split(",")[0]}`,
      departure: t.departure,
      vehicle: t.vehicle,
      status: t.status,
    })),
  },
  dijszabas: {
    title: "Díjszabás",
    subtitle: "Távolsági sávok és kedvezmények",
    action: "Új díjsáv",
    columns: [
      { key: "range", label: "Távolság" },
      { key: "price", label: "Alapár" },
      { key: "student", label: "Diák ár" },
      { key: "status", label: "Állapot" },
    ],
    rows: [
      ["0–50 km", 1490],
      ["50–100 km", 2490],
      ["100–150 km", 3490],
      ["150–250 km", 4990],
    ].map((x) => ({
      range: x[0],
      price: formatFt(Number(x[1])),
      student: formatFt(Number(x[1]) / 2),
      status: "Aktív",
    })),
  },
  felhasznalok: {
    title: "Felhasználók",
    subtitle: "Fiókok, jogosultságok és szerepkörök",
    action: "Új felhasználó",
    columns: [
      { key: "name", label: "Név" },
      { key: "role", label: "Szerepkör" },
      { key: "detail", label: "Részletek" },
      { key: "status", label: "Állapot" },
    ],
    rows: users.map((u) => ({ ...u, status: u.status })),
  },
  naplo: {
    title: "Audit napló",
    subtitle: "Rendszer- és felhasználói műveletek nyomon követése",
    action: "Napló exportálása",
    columns: [
      { key: "time", label: "Időpont" },
      { key: "user", label: "Felhasználó" },
      { key: "event", label: "Esemény" },
      { key: "target", label: "Érintett elem" },
    ],
    rows: [
      {
        time: "Ma, 09:42",
        user: "Nagy Eszter",
        event: "Járat késés frissítve",
        target: "M5 · 08:00",
      },
      {
        time: "Ma, 09:18",
        user: "Admin Zoltán",
        event: "Felhasználói szerepkör módosítva",
        target: "Kiss Márton",
      },
      { time: "Ma, 08:55", user: "Szabó Péter", event: "Esemény rögzítve", target: "ABC-123" },
      {
        time: "Tegnap, 18:22",
        user: "Admin Zoltán",
        event: "Díjsáv módosítva",
        target: "150–250 km",
      },
    ],
  },
};

export function AdminListPage({ kind }: { kind: keyof typeof configs }) {
  const config = configs[kind];
  const [open, setOpen] = useState(false);
  const { notify } = useApp();
  return (
    <>
      <AdminTitle
        title={config.title}
        subtitle={config.subtitle}
        action={
          <Button onClick={() => setOpen(true)}>
            {kind === "naplo" ? <Download /> : <Plus />}
            {config.action}
          </Button>
        }
      />
      <div className="admin-card">
        <DataTable
          columns={config.columns}
          rows={config.rows}
          onRow={() => notify("A részletes adatlap megnyílt.")}
        />
      </div>
      <ConfirmDialog
        open={open}
        title={kind === "naplo" ? "Napló exportálása?" : `${config.action}?`}
        text={
          kind === "naplo"
            ? "A teljes audit naplót PDF-formátumban készítjük elő."
            : "A bemutató módban egy minta rekord jön létre."
        }
        onClose={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          notify(kind === "naplo" ? "Az export elkészült." : "Az új rekord létrejött.");
        }}
      />
    </>
  );
}

export function StatisticsPage() {
  const monthly = useMemo(
    () => adminStats.map((x, i) => ({ ...x, jegy: 3200 + i * 480, berlet: 810 + i * 90 })),
    [],
  );
  return (
    <>
      <AdminTitle
        title="Statisztika"
        subtitle="Forgalmi és értékesítési teljesítmény"
        action={
          <Button variant="secondary">
            <Download /> Jelentés letöltése
          </Button>
        }
      />
      <div className="stat-grid">
        <Stat icon={<Users />} label="Havi utasok" value="48 290" trend="+14,2%" up />
        <Stat
          icon={<CircleDollarSign />}
          label="Havi bevétel"
          value="196,8 M Ft"
          trend="+9,8%"
          up
        />
        <Stat icon={<Route />} label="Megtett kilométer" value="182 450 km" trend="+4,1%" up />
        <Stat icon={<Clock3 />} label="Pontosság" value="91,4%" trend="−1,2%" />
      </div>
      <div className="dashboard-grid">
        <section className="chart-card wide">
          <div className="card-head">
            <div>
              <h2>Értékesítés típusa</h2>
              <p>Jegy- és bérlettranzakciók ezen a héten</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="jegy" name="Jegy" fill="#1E88E5" radius={[5, 5, 0, 0]} />
              <Bar dataKey="berlet" name="Bérlet" fill="#38B6FF" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>
        <section className="chart-card">
          <h2>Legnépszerűbb útvonalak</h2>
          {routes.map((r, i) => (
            <div className="route-rank" key={r.code}>
              <span>{i + 1}</span>
              <div>
                <b>
                  {r.code} · {r.from}–{r.to}
                </b>
                <i>
                  <em style={{ width: `${92 - i * 14}%` }} />
                </i>
              </div>
              <strong>{92 - i * 13}%</strong>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}
