import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertTriangle,
  Armchair,
  ArrowLeftRight,
  Bell,
  BusFront,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  EyeOff,
  Filter,
  KeyRound,
  Map,
  MapPin,
  QrCode,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserPlus,
  X,
} from "lucide-react";
import { useApp } from "../app/AppContext";
import { formatDistance, formatFt, routes, trips, type Role, type Trip } from "../app/data";
import { Brand } from "../components/Brand";
import { DevPanel } from "../components/layouts";
import {
  Button,
  EmptyState,
  ErrorBanner,
  OccupancyBadge,
  PriceBlock,
  StatusPill,
  StopAutocomplete,
  Toast,
} from "../components/ui";

const today = new Date().toISOString().slice(0, 10);

export function PublicHomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(today);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const search = () => {
    const next: Record<string, string> = {};
    if (!from) next.from = "A felszállási megálló megadása kötelező";
    if (!to) next.to = "A leszállási megálló megadása kötelező";
    if (from && to && from === to) next.to = "A felszállási és a leszállási megálló nem egyezhet";
    if (!date) next.date = "A dátum megadása kötelező";
    else if (date < today) next.date = "A dátum nem lehet múltbeli";
    setErrors(next);
    if (!Object.keys(next).length) navigate("/kereses");
  };
  const features = [
    [QrCode, "Digitális QR-jegy", "Jegyed internet nélkül is mindig kéznél van."],
    [Armchair, "Ülőhelyfoglalás", "Válaszd ki előre a számodra kényelmes helyet."],
    [Map, "Élő járatkövetés", "Lásd a busz helyzetét és a várható érkezést."],
    [Sparkles, "Legkedvezőbb jegy- és bérletajánlat", "Mindig megmutatjuk a legjobb árat."],
    [Bell, "Értesítések", "Késésről és változásról azonnal értesítünk."],
  ] as const;
  return (
    <>
      <section className="public-hero">
        <div className="hero-route-art">
          <i />
          <span />
          <BusFront />
        </div>
        <div className="public-hero-copy">
          <span className="eyebrow">
            <Sparkles /> Utazás újragondolva
          </span>
          <h1>Utazz okosabban. Jegy, helyfoglalás, élő követés – egy helyen.</h1>
          <p>Távolsági autóbuszos utazás egyszerűen, kiszámíthatóan és biztonságosan.</p>
        </div>
      </section>
      <div className="quick-search-wrap">
        <div className="quick-search-card">
          <StopAutocomplete label="Honnan" value={from} onChange={setFrom} error={errors.from} />
          <button
            className="swap"
            aria-label="Megállók felcserélése"
            onClick={() => {
              setFrom(to);
              setTo(from);
              setErrors({});
            }}
          >
            <ArrowLeftRight />
          </button>
          <StopAutocomplete label="Hová" value={to} onChange={setTo} error={errors.to} />
          <label className={`field ${errors.date ? "field-error" : ""}`}>
            <span>Dátum</span>
            <div className="input-icon">
              <CalendarDays />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            {errors.date && <small className="field-message">{errors.date}</small>}
          </label>
          <Button onClick={search}>
            <Search /> Keresés
          </Button>
        </div>
      </div>
      <section className="section featured-section">
        <div className="section-heading">
          <div>
            <span className="kicker">MAI INDULÁSOK</span>
            <h2>Közelgő, kiemelt járatok</h2>
          </div>
          <Link to="/kereses">
            Minden járat <ChevronRight />
          </Link>
        </div>
        <div className="featured-trips">
          {trips.map((trip) => (
            <FeaturedTrip key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
      <section className="how-section">
        <div className="center-heading">
          <span className="kicker">HÁROM EGYSZERŰ LÉPÉS</span>
          <h2>Hogyan működik?</h2>
        </div>
        <div className="how-strip">
          {[
            [Search, "Keress", "Add meg az úticélod és válassz járatot."],
            [Ticket, "Foglalj", "Válassz helyet, majd fizess biztonságosan."],
            [QrCode, "Utazz QR-kóddal", "Mutasd fel a digitális jegyed felszálláskor."],
          ].map(([Icon, title, text], index) => (
            <article key={String(title)}>
              <span className="how-number">0{index + 1}</span>
              <span className="how-icon">
                <Icon />
              </span>
              <div>
                <h3>{String(title)}</h3>
                <p>{String(text)}</p>
              </div>
              {index < 2 && <ChevronRight className="how-arrow" />}
            </article>
          ))}
        </div>
      </section>
      <section className="public-features section">
        <div className="center-heading">
          <span className="kicker">MINDEN EGY HELYEN</span>
          <h2>Magabiztos utazás az indulástól az érkezésig</h2>
        </div>
        <div className="public-feature-grid">
          {features.map(([Icon, title, text]) => (
            <article key={title}>
              <span>
                <Icon />
              </span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

function FeaturedTrip({ trip }: { trip: Trip }) {
  return (
    <article className="featured-trip">
      <div>
        <span className="trip-route-chip">{trip.code}</span>
        <StatusPill status={trip.status} />
      </div>
      <h3>
        {trip.from.split(",")[0]} <ChevronRight /> {trip.to.split(",")[0]}
      </h3>
      <div className="featured-time">
        <strong>{trip.departure}</strong>
        <span>
          <i />
          {trip.duration}
          <i />
        </span>
        <strong>{trip.arrival}</strong>
      </div>
      <div className="featured-meta">
        <span>{formatDistance(trip.distance)}</span>
        <OccupancyBadge value={trip.occupancy} />
      </div>
      <div className="featured-price">
        <PriceBlock price={trip.price} discount />
        <Link className="btn btn-secondary" to={`/jarat/${trip.id}`}>
          Részletek
        </Link>
      </div>
    </article>
  );
}

type Period = "mind" | "reggel" | "délelőtt" | "délután" | "este";
const levelFor = (value: number) =>
  value === 100 ? "tele" : value >= 80 ? "magas" : value >= 50 ? "közepes" : "alacsony";

export function PublicSearchPage() {
  const [period, setPeriod] = useState<Period>("mind");
  const [levels, setLevels] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [sort, setSort] = useState("departure");
  const [visible, setVisible] = useState(4);
  const [sheet, setSheet] = useState(false);
  const filtered = useMemo(() => {
    const ranges: Record<Period, [number, number]> = {
      mind: [0, 24],
      reggel: [5, 9],
      délelőtt: [9, 12],
      délután: [12, 18],
      este: [18, 24],
    };
    const [start, end] = ranges[period];
    return [...trips]
      .filter((trip) => {
        const hour = Number(trip.departure.split(":")[0]);
        return (
          hour >= start &&
          hour < end &&
          trip.price / 2 <= maxPrice &&
          (!levels.length || levels.includes(levelFor(trip.occupancy)))
        );
      })
      .sort((a, b) =>
        sort === "price"
          ? a.price - b.price
          : sort === "duration"
            ? a.distance - b.distance
            : a.departure.localeCompare(b.departure),
      );
  }, [period, levels, maxPrice, sort]);
  const toggle = (value: string) =>
    setLevels((items) =>
      items.includes(value) ? items.filter((x) => x !== value) : [...items, value],
    );
  const panel = (
    <div className="public-filter-panel">
      <div className="filter-heading">
        <div>
          <Filter />
          <h2>Szűrés</h2>
        </div>
        <button
          onClick={() => {
            setPeriod("mind");
            setLevels([]);
            setMaxPrice(5000);
          }}
        >
          Alaphelyzet
        </button>
      </div>
      <fieldset>
        <legend>Időszak</legend>
        {(["reggel", "délelőtt", "délután", "este"] as Period[]).map((item) => (
          <label key={item}>
            <input
              type="radio"
              name="period"
              checked={period === item}
              onChange={() => setPeriod(item)}
            />
            <span>{item[0].toUpperCase() + item.slice(1)}</span>
            <small>
              {item === "reggel"
                ? "05–09"
                : item === "délelőtt"
                  ? "09–12"
                  : item === "délután"
                    ? "12–18"
                    : "18–24"}
            </small>
          </label>
        ))}
      </fieldset>
      <fieldset>
        <legend>Telítettség</legend>
        {[
          ["alacsony", "Kevés utas"],
          ["közepes", "Közepes"],
          ["magas", "Zsúfolt"],
          ["tele", "Betelt"],
        ].map(([value, label]) => (
          <label key={value}>
            <input
              type="checkbox"
              checked={levels.includes(value)}
              onChange={() => toggle(value)}
            />
            <i className={`filter-dot ${value}`} />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
      <label className="price-filter">
        <span>
          Max. ár <b>{formatFt(maxPrice)}</b>
        </span>
        <input
          type="range"
          min="500"
          max="5000"
          step="5"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
        />
      </label>
      <label className="sort-filter">
        <span>Rendezés</span>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="departure">Indulás szerint</option>
          <option value="price">Ár szerint</option>
          <option value="duration">Utazási idő szerint</option>
        </select>
      </label>
    </div>
  );
  return (
    <div className="public-results-page">
      <div className="sticky-public-search">
        <div className="sticky-route">
          <MapPin />
          <span>
            <small>Honnan</small>
            <b>Budapest, Népliget</b>
          </span>
          <ArrowLeftRight />
          <span>
            <small>Hová</small>
            <b>Szeged, Autóbusz-állomás</b>
          </span>
          <span className="sticky-date">
            <CalendarDays />
            <b>Ma</b>
          </span>
          <Button variant="secondary">Módosítás</Button>
        </div>
      </div>
      <div className="page-wrap">
        <div className="results-head public-results-head">
          <div>
            <span className="kicker">{filtered.length} JÁRAT</span>
            <h1>Budapest → Szeged</h1>
            <p>Ma · 1 utas · diák kedvezmény</p>
          </div>
          <Button
            variant="secondary"
            className="public-mobile-filter"
            onClick={() => setSheet(true)}
          >
            <Filter /> Szűrés
          </Button>
        </div>
        <div className="public-results-layout">
          <aside>{panel}</aside>
          <section className="public-results-list">
            <div className="student-price-note">
              <ShieldCheck />
              <span>
                <b>Diák kedvezmény alkalmazva</b>Az árak már az 50%-os kedvezményt tartalmazzák.
              </span>
            </div>
            {!filtered.length ? (
              <div className="search-empty">
                <EmptyState
                  title="Nincs a keresésnek megfelelő járat"
                  text="Próbáld módosítani a szűrőket, vagy keress egy közeli napon."
                  action="Szűrők törlése"
                />
                <div>
                  <button>‹ Tegnap · május 13.</button>
                  <button>Holnap · május 15. ›</button>
                </div>
              </div>
            ) : (
              <>
                {filtered.slice(0, visible).map((trip) => (
                  <div key={trip.id}>
                    <ResultTrip trip={trip} />
                    {trip.seats === 0 && (
                      <div className="alternative-trip">
                        <div>
                          <Sparkles />
                          <span>
                            <b>Következő szabad járat</b>M6 · 16:45 · 25 szabad hely
                          </span>
                        </div>
                        <Link to="/jarat/m6-1645">
                          Megnézem <ChevronRight />
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
                {visible < filtered.length && (
                  <Button
                    variant="secondary"
                    className="load-more"
                    onClick={() => setVisible(visible + 3)}
                  >
                    Továbbiak betöltése <ChevronDown />
                  </Button>
                )}
              </>
            )}
          </section>
        </div>
      </div>
      {sheet && (
        <div className="filter-sheet-backdrop" onMouseDown={() => setSheet(false)}>
          <div className="filter-sheet" onMouseDown={(e) => e.stopPropagation()}>
            <div>
              <h2>Szűrés és rendezés</h2>
              <button onClick={() => setSheet(false)}>
                <X />
              </button>
            </div>
            {panel}
            <Button onClick={() => setSheet(false)}>{filtered.length} járat megjelenítése</Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultTrip({ trip }: { trip: Trip }) {
  return (
    <article className="result-trip-card">
      <div className="result-trip-route">
        <span className="trip-route-chip">{trip.code}</span>
        <div>
          <h3>
            {trip.from.split(",")[0]} → {trip.to.split(",")[0]}
          </h3>
          <p>Közvetlen járat · {trip.vehicle}</p>
        </div>
        <OccupancyBadge value={trip.occupancy} />
      </div>
      <div className="result-trip-body">
        <div className="result-time">
          <strong>{trip.departure}</strong>
          <span>
            <i />
            <small>{trip.duration}</small>
            <i />
          </span>
          <strong>{trip.arrival}</strong>
          {trip.delay > 0 && <em>+{trip.delay} perc</em>}
        </div>
        <div className="result-facts">
          <span>
            <Clock3 /> {trip.duration}
          </span>
          <span>
            <Route /> {formatDistance(trip.distance)}
          </span>
          <span>
            <Armchair /> {trip.seats ? `${trip.seats} szabad hely` : "Nincs szabad hely"}
          </span>
        </div>
        <div className="result-purchase">
          <PriceBlock price={trip.price} discount />
          <div>
            <Link className="btn btn-secondary" to={`/jarat/${trip.id}`}>
              Részletek
            </Link>
            {trip.seats ? (
              <Link className="btn btn-primary" to={`/jegyvasarlas/${trip.id}`}>
                Jegyvásárlás
              </Link>
            ) : (
              <span className="disabled-purchase" title="Ezen a járaton nincs több szabad ülőhely">
                <button className="btn btn-primary" disabled>
                  Jegyvásárlás
                </button>
                <small>Ezen a járaton nincs több szabad ülőhely</small>
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export function PublicTripDetailsPage() {
  const { id } = useParams();
  const trip = trips.find((item) => item.id === id) || trips[1];
  const route = routes.find((item) => item.code === trip.code) || routes[0];
  const [showPass, setShowPass] = useState(true);
  const stopData: [string, string, number][] =
    trip.code === "M5"
      ? [
          ["Budapest, Népliget", trip.departure, 0],
          ["Kecskemét, Autóbusz-állomás", addMinutes(trip.departure, 72 + trip.delay), 84],
          ["Szeged, Autóbusz-állomás", addMinutes(trip.departure, 150 + trip.delay), 172],
        ]
      : [
          [trip.from, trip.departure, 0],
          [
            route.via || "Köztes megálló",
            addMinutes(trip.departure, 85 + trip.delay),
            Math.round(route.distance / 2),
          ],
          [trip.to, addMinutes(trip.departure, route.duration + trip.delay), route.distance],
        ];
  return (
    <div className="page-wrap trip-details-public">
      <Link className="back-link" to="/kereses">
        <ChevronLeft /> Vissza a találatokhoz
      </Link>
      <header className="public-trip-header">
        <div>
          <span className="trip-route-chip large">{trip.code}</span>
          <div>
            <p>
              {route.from}–{route.to} távolsági járat
            </p>
            <h1>
              {trip.from.split(",")[0]} → {trip.to.split(",")[0]}
            </h1>
            <span>
              Ma · {trip.vehicle} · {formatDistance(trip.distance)}
            </span>
          </div>
        </div>
        <StatusPill status={trip.status} />
      </header>
      {trip.delay > 0 && (
        <div className="delay-banner">
          <AlertTriangle />
          <div>
            <b>A járat {trip.delay} perc késéssel közlekedik</b>
            <span>A megjelenített érkezési idők már tartalmazzák a késést.</span>
          </div>
          <strong>+{trip.delay} perc</strong>
        </div>
      )}
      <div className="public-trip-layout">
        <section className="public-timeline-card">
          <div className="card-head">
            <div>
              <h2>Útvonal és megállók</h2>
              <p>Az idők az aktuális forgalmi helyzetet tükrözik.</p>
            </div>
          </div>
          <div className="stop-timeline">
            {stopData.map(([name, time, distance], index) => (
              <div
                className={index === 0 || index === stopData.length - 1 ? "selected-stop" : ""}
                key={name}
              >
                <time>{time}</time>
                <span className="stop-marker">
                  {index === 0 ? <MapPin /> : index === stopData.length - 1 ? <Check /> : <i />}
                </span>
                <div>
                  <span className="stop-label">
                    {index === 0
                      ? "FELSZÁLLÁS"
                      : index === stopData.length - 1
                        ? "LESZÁLLÁS"
                        : "KÖZTES MEGÁLLÓ"}
                  </span>
                  <h3>{name}</h3>
                  <p>
                    {formatDistance(distance)} az indulástól {index === 1 && "· 2 perc megállás"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <aside className="public-booking-card">
          <span className="kicker">JEGYÁR 1 UTASNAK</span>
          <PriceBlock price={trip.price} discount />
          <p>A diák kedvezményt már tartalmazza.</p>
          <hr />
          <div className="segment-title">
            <b>Telítettség szakaszonként</b>
            <OccupancyBadge value={trip.occupancy} />
          </div>
          <div className="segment-bar">
            <i className="low" />
            <i className={trip.occupancy >= 80 ? "high" : "medium"} />
          </div>
          <div className="segment-labels">
            <span>Budapest</span>
            <span>Kecskemét</span>
            <span>Szeged</span>
          </div>
          <small>
            <Armchair /> {trip.seats} szabad ülőhely a teljes útvonalon
          </small>
          <Link
            className={`btn btn-primary ${trip.seats ? "" : "disabled"}`}
            to={`/jegyvasarlas/${trip.id}`}
          >
            Jegyvásárlás
          </Link>
          {trip.status === "Úton" && (
            <Link className="btn btn-secondary" to={`/jaratkovetes/${trip.id}`}>
              <Map /> Követés
            </Link>
          )}
        </aside>
      </div>
      {showPass && (
        <div className="pass-saving-banner">
          <span>
            <Ticket />
          </span>
          <div>
            <span className="kicker">RENDSZERESEN UTAZOL?</span>
            <h2>Havi bérlettel kb. 6 200 Ft-ot spórolhat</h2>
            <p>Már havi három oda-vissza út esetén is kedvezőbb választás.</p>
          </div>
          <Link className="btn btn-primary" to="/berletek">
            Bérlet megtekintése
          </Link>
          <button onClick={() => setShowPass(false)}>Nem, köszönöm</button>
        </div>
      )}
    </div>
  );
}

function addMinutes(time: string, minutes: number) {
  const [h, m] = time.split(":").map(Number);
  const v = h * 60 + m + minutes;
  return `${String(Math.floor(v / 60) % 24).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
}

const demoUsers: { email: string; label: string; role: Role; initials: string }[] = [
  { email: "anna@transix.hu", label: "Utas", role: "utas", initials: "KA" },
  { email: "peter@transix.hu", label: "Járművezető", role: "járművezető", initials: "SZP" },
  { email: "eszter@transix.hu", label: "Diszpécser", role: "diszpécser", initials: "NE" },
  { email: "admin@transix.hu", label: "Admin", role: "admin", initials: "AZ" },
];

export function PublicLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const { setRole } = useApp();
  const login = () => {
    if (!email || !password) {
      setError("Az email és a jelszó megadása kötelező");
      return;
    }
    const user = demoUsers.find((x) => x.email === email);
    if (!user || password !== "demo123") {
      const next = attempts + 1;
      setAttempts(next);
      setError(
        next >= 5
          ? "Túl sok sikertelen próbálkozás, próbáld újra később"
          : "Érvénytelen email vagy jelszó",
      );
      return;
    }
    setRole(user.role);
  };
  return (
    <div className="auth-split">
      <AuthBrandPanel />
      <main className="auth-form-side">
        <div className="auth-form-wrap">
          <Brand />
          <div className="auth-heading">
            <span className="auth-icon">
              <KeyRound />
            </span>
            <h1>Üdv újra!</h1>
            <p>Jelentkezz be a jegyeid és utazásaid eléréséhez.</p>
          </div>
          {error && (
            <ErrorBanner>
              <b>401 · </b>
              {error}
            </ErrorBanner>
          )}
          <label className={`field ${error ? "field-error" : ""}`}>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pelda@email.hu"
            />
          </label>
          <label className={`field ${error ? "field-error" : ""}`}>
            <span>Jelszó</span>
            <div className="password-input">
              <input
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Add meg a jelszavad"
              />
              <button
                onClick={() => setShow(!show)}
                aria-label={show ? "Jelszó elrejtése" : "Jelszó megjelenítése"}
              >
                {show ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </label>
          <div className="login-options">
            <label>
              <input type="checkbox" /> Emlékezz rám
            </label>
            <button>Elfelejtetted a jelszavad?</button>
          </div>
          <Button className="full-btn" onClick={login} disabled={attempts >= 5}>
            Bejelentkezés
          </Button>
          <p className="auth-switch">
            Még nincs fiókod? <Link to="/regisztracio">Regisztráció</Link>
          </p>
          <div className="demo-hint">
            <div>
              <Sparkles />
              <span>
                <b>Bemutató fiókok</b>
                <small>Jelszó minden fiókhoz: demo123</small>
              </span>
            </div>
            <ul>
              {demoUsers.map((user) => (
                <li key={user.email}>
                  <span>{user.initials}</span>
                  <div>
                    <b>{user.label}</b>
                    <small>{user.email}</small>
                  </div>
                  <button
                    onClick={() => {
                      setEmail(user.email);
                      setPassword("demo123");
                      setError("");
                    }}
                  >
                    Kitöltés
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </main>
      <DevPanel />
      <Toast />
    </div>
  );
}

export function PublicRegistrationPage() {
  const navigate = useNavigate();
  const { notify } = useApp();
  const [show, setShow] = useState(false);
  const [v, setV] = useState({
    last: "",
    first: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const update = (key: keyof typeof v, value: string) => setV({ ...v, [key]: value });
  const score = [
    v.password.length >= 8,
    /[A-ZÁÉÍÓÖŐÚÜŰ]/.test(v.password),
    /\d/.test(v.password),
    /[^A-Za-z0-9]/.test(v.password),
  ].filter(Boolean).length;
  const register = () => {
    const next: Record<string, string> = {};
    if (!v.last) next.last = "A vezetéknév megadása kötelező";
    if (!v.first) next.first = "A keresztnév megadása kötelező";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email)) next.email = "Érvénytelen email formátum";
    else if (v.email.toLowerCase() === "anna@transix.hu") next.email = "Ez az email már foglalt";
    if (v.phone && !/^[+()\d\s-]{7,30}$/.test(v.phone))
      next.phone = "Érvénytelen telefonszám formátum";
    if (v.password.length < 8) next.password = "Túl rövid jelszó";
    if (v.password !== v.confirm) next.confirm = "A két jelszó nem egyezik";
    setErrors(next);
    if (!Object.keys(next).length) {
      notify("Regisztráció sikeres!");
      window.setTimeout(() => navigate("/belepes"), 900);
    }
  };
  return (
    <div className="auth-split registration">
      <AuthBrandPanel registration />
      <main className="auth-form-side">
        <div className="auth-form-wrap registration-form">
          <Brand />
          <div className="auth-heading">
            <span className="auth-icon">
              <UserPlus />
            </span>
            <h1>Hozd létre a fiókodat</h1>
            <p>Pár perc, és készen állsz az első utazásodra.</p>
          </div>
          <div className="registration-grid">
            <AuthField
              label="Vezetéknév"
              value={v.last}
              maxLength={100}
              error={errors.last}
              onChange={(x) => update("last", x)}
            />
            <AuthField
              label="Keresztnév"
              value={v.first}
              maxLength={100}
              error={errors.first}
              onChange={(x) => update("first", x)}
            />
            <AuthField
              className="full"
              label="Email"
              type="email"
              value={v.email}
              maxLength={191}
              error={errors.email}
              onChange={(x) => update("email", x)}
            />
            <AuthField
              className="full"
              label="Telefonszám (nem kötelező)"
              type="tel"
              value={v.phone}
              maxLength={30}
              error={errors.phone}
              onChange={(x) => update("phone", x)}
              placeholder="+36 30 123 4567"
            />
            <label className={`field full ${errors.password ? "field-error" : ""}`}>
              <span>Jelszó</span>
              <div className="password-input">
                <input
                  type={show ? "text" : "password"}
                  value={v.password}
                  onChange={(e) => update("password", e.target.value)}
                />
                <button onClick={() => setShow(!show)}>{show ? <EyeOff /> : <Eye />}</button>
              </div>
              <span className="password-meter">
                {[0, 1, 2, 3].map((item) => (
                  <i className={item < score ? `active level-${score}` : ""} key={item} />
                ))}
              </span>
              <small className={errors.password ? "field-message" : "password-help"}>
                {errors.password || "Legalább 8 karakter, nagybetű és szám ajánlott."}
              </small>
            </label>
            <AuthField
              className="full"
              label="Jelszó megerősítése"
              type="password"
              value={v.confirm}
              error={errors.confirm}
              onChange={(x) => update("confirm", x)}
            />
          </div>
          <Button className="full-btn" onClick={register}>
            Regisztráció
          </Button>
          <p className="discount-note">
            <ShieldCheck /> A kedvezmény kategóriát (pl. diák) igazolás alapján az adminisztrátor
            állítja be.
          </p>
          <p className="auth-switch">
            Már van fiókod? <Link to="/belepes">Bejelentkezés</Link>
          </p>
        </div>
      </main>
      <DevPanel />
      <Toast />
    </div>
  );
}

function AuthField({
  label,
  value,
  error,
  onChange,
  type = "text",
  maxLength,
  placeholder,
  className = "",
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  type?: string;
  maxLength?: number;
  placeholder?: string;
  className?: string;
}) {
  return (
    <label className={`field ${className} ${error ? "field-error" : ""}`}>
      <span>{label}</span>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <small className="field-message">{error}</small>}
    </label>
  );
}
function AuthBrandPanel({ registration = false }: { registration?: boolean }) {
  return (
    <aside className="auth-brand-panel">
      <div className="auth-panel-copy">
        <Brand />
        <span className="kicker">TRANSIX FIÓK</span>
        <h2>
          {registration
            ? "Az utazásod már a regisztrációnál egyszerűbb."
            : "Minden utazásod egy biztonságos helyen."}
        </h2>
        <p>Jegyek, bérletek, helyfoglalások és valós idejű információk egyetlen fiókban.</p>
      </div>
      <div className="auth-bus-illustration">
        <div className="illustration-pin">
          <MapPin />
        </div>
        <div className="illustration-road">
          <i />
          <i />
          <i />
        </div>
        <div className="illustration-bus">
          <span>
            TRANSI<b>X</b>
          </span>
          <BusFront />
        </div>
      </div>
      <div className="auth-trust">
        <ShieldCheck /> Adataidat biztonságosan kezeljük.
      </div>
    </aside>
  );
}
