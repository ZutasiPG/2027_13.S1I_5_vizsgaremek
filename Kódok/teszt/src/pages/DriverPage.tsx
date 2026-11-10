import { useEffect, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  BusFront,
  Check,
  ChevronLeft,
  Clock3,
  Flashlight,
  History,
  Info,
  MapPin,
  Minus,
  Plus,
  QrCode,
  Radio,
  Route,
  Send,
  Speaker,
  TriangleAlert,
  UserRound,
  Users,
  Vibrate,
  Wrench,
  X,
} from "lucide-react";
import { useApp } from "../app/AppContext";
import { Brand } from "../components/Brand";
import { DriverShell } from "../components/layouts";
import { ConfirmDialog, StatusPill } from "../components/ui";

type View = "trips" | "scan" | "passengers" | "log" | "incident";
type ScanType = "ticket" | "pass" | "used" | "other" | "expired" | "cancelled" | "fake";

const assignedTrips = [
  {
    code: "M5",
    route: "Budapest → Szeged",
    time: "08:00 – 10:30",
    plate: "ABC-123",
    status: "Következő",
  },
  {
    code: "M5",
    route: "Szeged → Budapest",
    time: "13:00 – 15:30",
    plate: "ABC-123",
    status: "Tervezett",
  },
  {
    code: "M1",
    route: "Budapest → Győr",
    time: "18:15 – 19:50",
    plate: "ABC-123",
    status: "Tervezett",
  },
];

const passengers = [
  ["Kovács Anna", "Budapest", "Szeged", "3B", "Érvényesítve"],
  ["Tóth Márton", "Budapest", "Kecskemét", "5A", "Érvényesítve"],
  ["Németh Júlia", "Kecskemét", "Szeged", "8C", "Még nem"],
  ["Varga Bence", "Budapest", "Szeged", "11D", "Még nem"],
  ["Kiss Zsófia", "Kecskemét", "Szeged", "2A", "Érvényesítve"],
];

export function DriverPage() {
  const [view, setView] = useState<View>("trips");
  const [started, setStarted] = useState(false);
  const [validated, setValidated] = useState(23);
  const [queued, setQueued] = useState(3);
  const [flash, setFlash] = useState(false);
  const [gpsLost, setGpsLost] = useState(false);
  const [result, setResult] = useState<ScanType | null>(null);
  const [delay, setDelay] = useState(0);
  const [eventType, setEventType] = useState("Késés");
  const [description, setDescription] = useState("");
  const [logs, setLogs] = useState<{ title: string; detail: string; time: string }[]>([
    { title: "Menet elindítva", detail: "Budapest, Népliget", time: "08:04" },
    { title: "GPS kapcsolat létrejött", detail: "Pozíció küldése 5 mp-enként", time: "08:04" },
  ]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const { notify } = useApp();

  useEffect(() => {
    if (!result) return;
    const timer = window.setTimeout(() => setResult(null), 2000);
    return () => window.clearTimeout(timer);
  }, [result]);

  const simulate = (type: ScanType) => {
    setResult(type);
    setQueued((value) => value + 1);
    if (type === "ticket" || type === "pass") setValidated((value) => value + 1);
  };

  const submitIncident = () => {
    setLogs((current) => [
      {
        title: eventType,
        detail: delay
          ? `+${delay} perc · ${description || "Nincs megjegyzés"}`
          : description || "Nincs megjegyzés",
        time: "09:18",
      },
      ...current,
    ]);
    notify("Esemény rögzítve");
    setView("log");
  };

  return (
    <DriverShell>
      <div className="driver-app-stage">
        <div className="driver-phone">
          <header className="driver-app-header">
            <Brand compact />
            <button
              className={`gps-chip ${gpsLost ? "lost" : ""}`}
              onClick={() => setGpsLost(!gpsLost)}
            >
              <Radio />
              <span>
                {gpsLost ? "GPS jelvesztés" : "GPS aktív"}
                <small>{!gpsLost && "Pozíció küldése 5 mp-enként"}</small>
              </span>
            </button>
          </header>

          <main className="driver-app-main">
            {view === "trips" && (
              <TripSelect
                started={started}
                onStart={() => {
                  setStarted(true);
                  setView("scan");
                }}
                onOpen={() => setView("scan")}
              />
            )}
            {view === "scan" && (
              <ValidationScreen
                validated={validated}
                flash={flash}
                setFlash={setFlash}
                onSimulate={simulate}
                queued={queued}
              />
            )}
            {view === "passengers" && <PassengerList />}
            {view === "log" && (
              <TripLog
                logs={logs}
                delay={delay}
                onIncident={() => setView("incident")}
                onCancel={() => setCancelOpen(true)}
              />
            )}
            {view === "incident" && (
              <IncidentForm
                eventType={eventType}
                setEventType={setEventType}
                delay={delay}
                setDelay={setDelay}
                description={description}
                setDescription={setDescription}
                onBack={() => setView("log")}
                onSubmit={submitIncident}
                onCancel={() => setCancelOpen(true)}
              />
            )}
          </main>

          {view !== "incident" && (
            <nav className="driver-bottom-bar">
              <button
                className={view === "scan" ? "active" : ""}
                onClick={() => setView(started ? "scan" : "trips")}
              >
                <QrCode />
                Ellenőrzés
              </button>
              <button
                className={view === "passengers" ? "active" : ""}
                onClick={() => setView("passengers")}
              >
                <Users />
                Utaslista
              </button>
              <button className={view === "log" ? "active" : ""} onClick={() => setView("log")}>
                <History />
                Menetnapló
              </button>
              <button className="incident-action" onClick={() => setView("incident")}>
                <TriangleAlert />
                Esemény
              </button>
            </nav>
          )}

          {result && <ScanResult type={result} />}
        </div>
      </div>
      <ConfirmDialog
        open={cancelOpen}
        title="Menet lemondása?"
        text="A menet lemondása után minden megvásárolt jegy automatikusan visszatérítésre kerül. Csak a diszpécserrel történt egyeztetés után folytasd."
        onClose={() => setCancelOpen(false)}
        onConfirm={() => {
          setCancelOpen(false);
          setStarted(false);
          setLogs((items) => [
            {
              title: "Menet lemondva",
              detail: "Minden jegy automatikusan visszatérítve",
              time: "09:20",
            },
            ...items,
          ]);
          notify("A menetet lemondtad.");
          setView("trips");
        }}
      />
    </DriverShell>
  );
}

function TripSelect({
  started,
  onStart,
  onOpen,
}: {
  started: boolean;
  onStart: () => void;
  onOpen: () => void;
}) {
  return (
    <section className="driver-view trip-select-view">
      <div className="driver-view-title">
        <span>2026. máj. 14., csütörtök</span>
        <h1>Mai menetek</h1>
        <p>Szabó Péter · ABC-123</p>
      </div>
      <div className="assigned-trip-list">
        {assignedTrips.map((trip, index) => (
          <article className={index === 0 ? "next" : ""} key={`${trip.code}-${trip.time}`}>
            <div className="assigned-code">{trip.code}</div>
            <div>
              <span>{index === 0 && started ? <StatusPill status="Úton" /> : trip.status}</span>
              <h2>{trip.route}</h2>
              <p>
                <Clock3 />
                {trip.time}
              </p>
              <p>
                <BusFront />
                {trip.plate}
              </p>
            </div>
            {index === 0 && (
              <button onClick={started ? onOpen : onStart}>
                {started ? "Megnyitás" : "Indulás"}
                <ChevronLeft />
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function ValidationScreen({
  validated,
  flash,
  setFlash,
  onSimulate,
  queued,
}: {
  validated: number;
  flash: boolean;
  setFlash: (value: boolean) => void;
  onSimulate: (type: ScanType) => void;
  queued: number;
}) {
  return (
    <section className="driver-view validation-view">
      <div className="validation-top">
        <div>
          <span>M5 · Budapest → Szeged</span>
          <h1>08:00 – 10:30</h1>
        </div>
        <strong>
          Érvényesítve <b>{validated} / 41</b>
        </strong>
      </div>
      <div className="driver-offline">
        <AlertTriangle />
        <span>
          <b>Offline mód</b> – az érvényesítések szinkronizálása később történik
        </span>
        <strong>{queued} várakozik</strong>
      </div>
      <div className={`driver-camera ${flash ? "flash-on" : ""}`}>
        <div className="driver-scan-frame">
          <i />
          <i />
          <i />
          <i />
          <span />
          <QrCode />
        </div>
        <p>Tartsd a QR-kódot a keretbe</p>
      </div>
      <div className="scanner-main-actions">
        <button className={flash ? "active" : ""} onClick={() => setFlash(!flash)}>
          <Flashlight />
          {flash ? "Lámpa be" : "Lámpa"}
        </button>
        <button>
          <QrCode />
          Kézi kód
        </button>
      </div>
      <div className="scan-simulator">
        <span>Bemutató szkennelés</span>
        <div>
          <button onClick={() => onSimulate("ticket")}>Érvényes jegy</button>
          <button onClick={() => onSimulate("pass")}>Érvényes bérlet</button>
          <button onClick={() => onSimulate("used")}>Már felhasznált</button>
          <button onClick={() => onSimulate("other")}>Más járat</button>
          <button onClick={() => onSimulate("expired")}>Lejárt</button>
          <button onClick={() => onSimulate("cancelled")}>Lemondott</button>
          <button onClick={() => onSimulate("fake")}>Hamis kód</button>
        </div>
      </div>
    </section>
  );
}

function ScanResult({ type }: { type: ScanType }) {
  const valid = type === "ticket" || type === "pass";
  const reason: Record<Exclude<ScanType, "ticket" | "pass">, string> = {
    used: "Már felhasznált jegy",
    other: "Másik járatra szól",
    expired: "Lejárt bérlet",
    cancelled: "Lemondott jegy",
    fake: "Hamis vagy sérült kód",
  };
  return (
    <div className={`scan-result-overlay ${valid ? "valid" : "invalid"}`}>
      <div className="result-feedback">
        <Speaker />
        <Vibrate />
      </div>
      <span className="scan-result-icon">{valid ? <Check /> : <X />}</span>
      <h1>{valid ? "ÉRVÉNYES" : "ÉRVÉNYTELEN"}</h1>
      {valid ? (
        <div className="scan-person">
          <UserRound />
          <h2>Kovács Anna</h2>
          <p>Budapest → Szeged</p>
          {type === "ticket" ? (
            <strong>Ülőhely: 3B</strong>
          ) : (
            <strong>Érvényes: 2026. máj. 1., péntek – 2026. máj. 31., vasárnap</strong>
          )}
        </div>
      ) : (
        <div className="invalid-reason">
          <AlertTriangle />
          <strong>{reason[type as keyof typeof reason]}</strong>
        </div>
      )}
      <small>Az eredmény 2 másodperc múlva bezáródik</small>
    </div>
  );
}

function PassengerList() {
  const [filter, setFilter] = useState("Felszállók");
  return (
    <section className="driver-view passenger-list-view">
      <div className="driver-view-title">
        <span>M5 · 08:00</span>
        <h1>Utaslista</h1>
      </div>
      <div className="driver-summary">
        <div>
          <b>41</b>
          <span>Eladott jegyek</span>
        </div>
        <div>
          <b>23</b>
          <span>Érvényesítettek</span>
        </div>
        <div>
          <b>18</b>
          <span>Hátralévők</span>
        </div>
      </div>
      <div className="driver-segmented">
        <button
          className={filter === "Felszállók" ? "active" : ""}
          onClick={() => setFilter("Felszállók")}
        >
          Felszállók
        </button>
        <button
          className={filter === "Leszállók" ? "active" : ""}
          onClick={() => setFilter("Leszállók")}
        >
          Leszállók
        </button>
      </div>
      <div className="driver-passenger-table">
        <div className="driver-table-head">
          <span>Utas</span>
          <span>Szakasz</span>
          <span>Hely</span>
          <span>Állapot</span>
        </div>
        {passengers.map((row) => (
          <div className="driver-table-row" key={row[0]}>
            <b>{row[0]}</b>
            <span>
              {filter === "Felszállók" ? row[1] : row[2]}
              <small>{filter === "Felszállók" ? "felszáll" : "leszáll"}</small>
            </span>
            <strong>{row[3]}</strong>
            <i className={row[4] === "Érvényesítve" ? "done" : ""}>{row[4]}</i>
          </div>
        ))}
      </div>
      <p className="driver-list-note">
        <Info />
        Bérletes utasok csak az érvényesítés után jelennek meg.
      </p>
    </section>
  );
}

function TripLog({
  logs,
  delay,
  onIncident,
  onCancel,
}: {
  logs: { title: string; detail: string; time: string }[];
  delay: number;
  onIncident: () => void;
  onCancel: () => void;
}) {
  return (
    <section className="driver-view trip-log-view">
      <div className="driver-view-title">
        <span>M5 · BUDAPEST → SZEGED</span>
        <h1>Menetnapló</h1>
      </div>
      {delay >= 10 && (
        <div className="passenger-alert-line">
          <BellRing />
          Az utasok értesítést kapnak
        </div>
      )}
      <button className="driver-incident-big" onClick={onIncident}>
        <TriangleAlert />
        <span>
          <b>Esemény rögzítése</b>
          <small>Késés, műszaki hiba vagy útvonalváltozás</small>
        </span>
        <ChevronLeft />
      </button>
      <div className="driver-log-list">
        {logs.map((item, index) => (
          <article key={`${item.title}-${index}`}>
            <span>
              <i />
            </span>
            <div>
              <h2>{item.title}</h2>
              <p>{item.detail}</p>
            </div>
            <time>{item.time}</time>
          </article>
        ))}
      </div>
      <button className="cancel-trip" onClick={onCancel}>
        <X />
        Menet lemondása <small>(diszpécserrel egyeztetve)</small>
      </button>
    </section>
  );
}

function IncidentForm({
  eventType,
  setEventType,
  delay,
  setDelay,
  description,
  setDescription,
  onBack,
  onSubmit,
  onCancel,
}: {
  eventType: string;
  setEventType: (value: string) => void;
  delay: number;
  setDelay: (value: number) => void;
  description: string;
  setDescription: (value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const types = [
    ["Késés", Clock3],
    ["Műszaki hiba", Wrench],
    ["Útvonalváltozás", Route],
    ["Egyéb", AlertTriangle],
  ] as const;
  return (
    <section className="driver-view incident-fullscreen">
      <header>
        <button onClick={onBack}>
          <ChevronLeft />
        </button>
        <h1>Esemény rögzítése</h1>
      </header>
      <span className="driver-field-label">Esemény típusa</span>
      <div className="incident-tiles">
        {types.map(([label, Icon]) => (
          <button
            className={eventType === label ? "active" : ""}
            onClick={() => setEventType(label)}
            key={label}
          >
            <Icon />
            {label}
          </button>
        ))}
      </div>
      <span className="driver-field-label">Többletkésés (perc)</span>
      <div className="delay-stepper">
        <button onClick={() => setDelay(Math.max(0, delay - 5))}>
          <Minus />5
        </button>
        <strong>
          {delay}
          <small>perc</small>
        </strong>
        <button onClick={() => setDelay(delay + 5)}>
          <Plus />5
        </button>
      </div>
      {delay >= 10 && (
        <div className="passenger-alert-line">
          <BellRing />
          Az utasok értesítést kapnak
        </div>
      )}
      <label className="driver-description">
        <span>Leírás</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Rövid leírás az eseményről…"
        />
      </label>
      <div className="incident-submit-bar">
        <button onClick={onSubmit}>
          <Send />
          Küldés
        </button>
        <button onClick={onCancel}>
          <X />
          Menet lemondása <small>(diszpécserrel egyeztetve)</small>
        </button>
      </div>
    </section>
  );
}
