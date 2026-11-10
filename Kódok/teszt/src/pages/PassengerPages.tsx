import { useState } from "react";
import { useNavigate, useParams, Link } from "react-router";
import {
  ArrowLeftRight,
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Clock3,
  CreditCard,
  Download,
  Filter,
  Info,
  LocateFixed,
  Map,
  MapPin,
  Navigation,
  QrCode,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  Ticket,
  UserRound,
  WalletCards,
} from "lucide-react";
import { routes, trips, formatFt } from "../app/data";
import { useApp } from "../app/AppContext";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  LoadingButton,
  OccupancyBadge,
  PriceBlock,
  QRCard,
  SeatMap,
  Skeletons,
  StatusPill,
  Stepper,
  StopAutocomplete,
  TripCard,
} from "../components/ui";
import { LiveMap } from "../components/LiveMap";
import { Brand } from "../components/Brand";
import { DevPanel } from "../components/layouts";

export function HomePage() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("Budapest, Népliget");
  const [to, setTo] = useState("Szeged, Autóbusz-állomás");
  const [date, setDate] = useState("2026-05-14");
  return (
    <>
      <section className="hero">
        <div className="hero-glow one" />
        <div className="hero-glow two" />
        <div className="hero-content">
          <div className="eyebrow">
            <Sparkles /> Magyarország új utazási platformja
          </div>
          <h1>
            Távolsági utazás,
            <br />
            <span>egyszerűbben.</span>
          </h1>
          <p>
            Keress járatot, foglalj helyet, és kövesd élőben az autóbuszodat – mindezt egy helyen.
          </p>
          <div className="search-card">
            <div className="search-fields">
              <StopAutocomplete label="Honnan?" value={from} onChange={setFrom} />
              <button
                className="swap"
                onClick={() => {
                  setFrom(to);
                  setTo(from);
                }}
                aria-label="Megállók felcserélése"
              >
                <ArrowLeftRight />
              </button>
              <StopAutocomplete label="Hová?" value={to} onChange={setTo} />
              <label className="field">
                <span>Indulás</span>
                <div className="input-icon">
                  <CalendarDays />
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
              </label>
              <label className="field">
                <span>Utasok</span>
                <div className="input-icon">
                  <UserRound />
                  <select>
                    <option>1 utas, diák</option>
                    <option>1 utas, teljes árú</option>
                    <option>2 utas</option>
                  </select>
                </div>
              </label>
            </div>
            <Button onClick={() => navigate("/kereses")}>
              <Search /> Járatok keresése
            </Button>
          </div>
          <div className="trust-row">
            <span>
              <CircleCheck /> Azonnali jegy
            </span>
            <span>
              <ShieldCheck /> Biztonságos fizetés
            </span>
            <span>
              <LocateFixed /> Valós idejű követés
            </span>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="section-heading">
          <div>
            <span className="kicker">NÉPSZERŰ ÚTVONALAK</span>
            <h2>Indulj el még ma</h2>
          </div>
          <Link to="/kereses">
            Minden járat <ChevronRight />
          </Link>
        </div>
        <div className="route-grid">
          {routes.map((route, i) => (
            <button key={route.code} onClick={() => navigate("/kereses")} className="route-card">
              <span className="route-icon">
                <Navigation />
              </span>
              <div>
                <span>{route.code}</span>
                <h3>
                  {route.from} <ChevronRight /> {route.to}
                </h3>
                <p>
                  {route.via ? `${route.via} érintésével · ` : ""}
                  {route.duration} perc
                </p>
              </div>
              <strong>
                {formatFt(i === 0 ? 4990 : i === 1 ? 4990 : i === 2 ? 3490 : 4990)}-tól
              </strong>
            </button>
          ))}
        </div>
      </section>
      <section className="feature-band">
        <div>
          <span className="kicker">UTAZZ MAGABIZTOSAN</span>
          <h2>Minden, amire útközben szükséged van</h2>
          <p>A jegyvásárlástól az érkezésig végig melletted vagyunk.</p>
        </div>
        <div className="feature-grid">
          <article>
            <span>
              <QrCode />
            </span>
            <h3>Digitális jegy</h3>
            <p>QR-kódos jegyed internet nélkül is mindig kéznél van.</p>
          </article>
          <article>
            <span>
              <Map />
            </span>
            <h3>Élő járatkövetés</h3>
            <p>Lásd a busz helyzetét, a késést és a várható érkezést.</p>
          </article>
          <article>
            <span>
              <Bell />
            </span>
            <h3>Okos értesítések</h3>
            <p>Indulás, késés és megállóváltozás – időben szólunk.</p>
          </article>
        </div>
      </section>
    </>
  );
}

export function SearchPage() {
  const [loading, setLoading] = useState(false);
  return (
    <div className="page-wrap">
      <div className="compact-search">
        <div>
          <b>Budapest, Népliget</b>
          <ArrowLeftRight />
          <b>Szeged, Autóbusz-állomás</b>
        </div>
        <span>Ma, május 14. · 1 utas, diák</span>
        <Button variant="secondary">
          <Search /> Módosítás
        </Button>
      </div>
      <div className="results-head">
        <div>
          <span className="kicker">6 JÁRAT</span>
          <h1>Budapest → Szeged</h1>
          <p>2026. május 14., csütörtök</p>
        </div>
        <div className="date-nav">
          <button>
            <ChevronLeft />
          </button>
          <button>
            <small>Sze</small>
            <b>13</b>
          </button>
          <button className="active">
            <small>Cs</small>
            <b>14</b>
          </button>
          <button>
            <small>P</small>
            <b>15</b>
          </button>
          <button>
            <small>Szo</small>
            <b>16</b>
          </button>
          <button>
            <ChevronRight />
          </button>
        </div>
      </div>
      <div className="results-layout">
        <aside className="filters">
          <div>
            <h3>Szűrés</h3>
            <button>Alaphelyzet</button>
          </div>
          <label>
            Indulási idő <span>00:00 – 24:00</span>
            <input type="range" />
          </label>
          <fieldset>
            <legend>Átszállás</legend>
            <label>
              <input type="checkbox" defaultChecked /> Közvetlen járat <span>6</span>
            </label>
            <label>
              <input type="checkbox" /> 1 átszállás <span>0</span>
            </label>
          </fieldset>
          <fieldset>
            <legend>Szolgáltatások</legend>
            <label>
              <input type="checkbox" /> Wi-Fi
            </label>
            <label>
              <input type="checkbox" /> Légkondicionálás
            </label>
            <label>
              <input type="checkbox" /> Akadálymentes
            </label>
          </fieldset>
        </aside>
        <section className="results">
          <div className="result-tools">
            <span>
              <Info /> Az ár tartalmazza a diák kedvezményt.
            </span>
            <select
              onChange={() => {
                setLoading(true);
                setTimeout(() => setLoading(false), 700);
              }}
            >
              <option>Indulás szerint</option>
              <option>Ár szerint</option>
              <option>Menetidő szerint</option>
            </select>
            <Button variant="secondary" className="mobile-filter">
              <Filter /> Szűrés
            </Button>
          </div>
          {loading ? <Skeletons /> : trips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
        </section>
      </div>
    </div>
  );
}

export function TripDetailsPage() {
  const { id } = useParams();
  const trip = trips.find((t) => t.id === id) || trips[1];
  return (
    <div className="page-wrap narrow">
      <Link className="back-link" to="/kereses">
        <ChevronLeft /> Vissza a találatokhoz
      </Link>
      <div className="details-grid">
        <section>
          <div className="detail-card">
            <div className="detail-title">
              <span>{trip.code}</span>
              <div>
                <h1>
                  {trip.from.split(",")[0]} → {trip.to.split(",")[0]}
                </h1>
                <p>Ma, 2026. május 14. · {trip.vehicle}</p>
              </div>
              <StatusPill status={trip.status} />
            </div>
            <div className="large-timeline">
              <div>
                <strong>{trip.departure}</strong>
                <b>{trip.from}</b>
                <small>Ma, május 14.</small>
              </div>
              <div className="vertical-line">
                <i />
                <span>
                  {trip.duration}
                  <br />
                  {trip.distance} km
                </span>
                <i />
                <i />
              </div>
              <div className="middle-stop">
                <strong>07:42</strong>
                <b>Kecskemét, Autóbusz-állomás</b>
                <small>2 perc megállás</small>
              </div>
              <div>
                <strong>{trip.arrival}</strong>
                <b>{trip.to}</b>
                <small>Ma, május 14.</small>
              </div>
            </div>
          </div>
          <div className="amenity-card">
            <h2>Szolgáltatások a járaton</h2>
            <div>
              <span>Wi-Fi</span>
              <span>USB töltő</span>
              <span>Légkondicionálás</span>
              <span>Mosdó</span>
            </div>
          </div>
          <div className="mini-live">
            <div>
              <span className="kicker">ÉLŐ INFORMÁCIÓ</span>
              <h2>Kövesd a járatot</h2>
              <p>A járat helyzete indulás után válik elérhetővé.</p>
              <Link to={`/jaratkovetes/${trip.id}`}>
                Térkép megnyitása <ChevronRight />
              </Link>
            </div>
            <LiveMap compact />
          </div>
        </section>
        <aside className="booking-summary">
          <h2>Jegy összesítő</h2>
          <div>
            <span>1 utas</span>
            <b>Diák (50%)</b>
          </div>
          <PriceBlock price={trip.price} discount />
          <hr />
          <div>
            <span>Szabad helyek</span>
            <OccupancyBadge value={trip.occupancy} />
          </div>
          <Link to={`/jegyvasarlas/${trip.id}`} className="btn btn-primary">
            Jegyvásárlás
          </Link>
          <small>
            <ShieldCheck /> Biztonságos fizetés · Díjmentes módosítás
          </small>
        </aside>
      </div>
    </div>
  );
}

export function PurchasePage() {
  const { id } = useParams();
  const trip = trips.find((t) => t.id === id) || trips[0];
  const [step, setStep] = useState(1);
  const [seat, setSeat] = useState("");
  const navigate = useNavigate();
  const { notify } = useApp();
  return (
    <div className="purchase-page">
      <div className="page-wrap narrow">
        <Link className="back-link" to={`/jarat/${trip.id}`}>
          <ChevronLeft /> Vissza a járathoz
        </Link>
        <Stepper step={step} labels={["Utasok", "Ülőhely", "Fizetés", "Kész"]} />
        {step === 1 && (
          <div className="checkout-grid">
            <section className="form-card">
              <span className="kicker">1. LÉPÉS</span>
              <h1>Utas adatai</h1>
              <div className="form-grid">
                <label className="field">
                  <span>Teljes név</span>
                  <input defaultValue="Kovács Anna" />
                </label>
                <label className="field">
                  <span>E-mail-cím</span>
                  <input defaultValue="anna.kovacs@example.hu" />
                </label>
                <label className="field">
                  <span>Kedvezmény</span>
                  <select defaultValue="student">
                    <option value="none">Teljes árú</option>
                    <option value="student">Diák – 50%</option>
                    <option value="senior">Nyugdíjas – 90%</option>
                  </select>
                </label>
                <label className="field">
                  <span>Diákigazolvány száma</span>
                  <input defaultValue="12345678901" />
                </label>
              </div>
              <div className="form-note">
                <Info /> A kedvezményre jogosító igazolványt az utazás során be kell mutatni.
              </div>
              <Button onClick={() => setStep(2)}>
                Tovább az ülőhelyhez <ChevronRight />
              </Button>
            </section>
            <OrderAside trip={trip} />
          </div>
        )}
        {step === 2 && (
          <div className="checkout-grid">
            <section className="form-card">
              <span className="kicker">2. LÉPÉS</span>
              <h1>Válassz ülőhelyet</h1>
              <p>Az ülésválasztás díjmentes ezen a járaton.</p>
              <SeatMap selected={seat} onSelect={setSeat} />
              {seat && (
                <div className="seat-summary">
                  <div>
                    <CircleCheck />
                    <span>
                      <b>{seat} – ablak mellett</b>
                      <small>Kiválasztott ülőhely</small>
                    </span>
                  </div>
                  <Button onClick={() => setStep(3)}>Tovább a fizetéshez</Button>
                </div>
              )}
            </section>
            <OrderAside trip={trip} />
          </div>
        )}
        {step === 3 && (
          <div className="checkout-grid">
            <section className="form-card">
              <span className="kicker">3. LÉPÉS</span>
              <h1>Biztonságos fizetés</h1>
              <div className="pay-tabs">
                <button className="active">
                  <CreditCard /> Bankkártya
                </button>
                <button>
                  <Smartphone /> Mobilfizetés
                </button>
              </div>
              <div className="form-grid">
                <label className="field full">
                  <span>Kártyaszám</span>
                  <input placeholder="1234 5678 9012 3456" defaultValue="4242 4242 4242 4242" />
                </label>
                <label className="field">
                  <span>Lejárat</span>
                  <input defaultValue="08/29" />
                </label>
                <label className="field">
                  <span>CVC</span>
                  <input defaultValue="123" />
                </label>
                <label className="field full">
                  <span>Kártyabirtokos neve</span>
                  <input defaultValue="KOVÁCS ANNA" />
                </label>
              </div>
              <label className="check-line">
                <input type="checkbox" defaultChecked /> Elfogadom az utazási és vásárlási
                feltételeket.
              </label>
              <LoadingButton
                onDone={() => {
                  setStep(4);
                  notify("Sikeres jegyvásárlás!");
                }}
              />
            </section>
            <OrderAside trip={trip} />
          </div>
        )}
        {step === 4 && (
          <div className="success-page">
            <span>
              <Check />
            </span>
            <h1>Sikeres jegyvásárlás!</h1>
            <p>A jegyet elküldtük az e-mail-címedre, és már elérhető a Jegyeim között is.</p>
            <QRCard />
            <div>
              <Button onClick={() => navigate("/jegyeim")}>Jegyeim megnyitása</Button>
              <Button variant="secondary" onClick={() => notify("A jegy letöltése elindult.")}>
                <Download /> Letöltés
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderAside({ trip }: { trip: (typeof trips)[number] }) {
  return (
    <aside className="order-aside">
      <span>{trip.code}</span>
      <h3>
        {trip.from.split(",")[0]} → {trip.to.split(",")[0]}
      </h3>
      <p>
        Ma, {trip.departure} – {trip.arrival}
      </p>
      <div>
        <span>Diákjegy</span>
        <b>{formatFt(Math.round(trip.price / 10) * 5)}</b>
      </div>
      <div>
        <span>Ülésfoglalás</span>
        <b>0 Ft</b>
      </div>
      <hr />
      <div className="total">
        <span>Összesen</span>
        <strong>{formatFt(Math.round(trip.price / 10) * 5)}</strong>
      </div>
    </aside>
  );
}

export function PassesPage() {
  const { notify } = useApp();
  const passes = [
    {
      name: "Napi bérlet",
      days: "1 nap",
      price: 6990,
      detail: "Korlátlan utazás egy teljes napon át",
    },
    { name: "Heti bérlet", days: "7 nap", price: 24990, detail: "Rugalmas megoldás egy hétre" },
    {
      name: "Havi bérlet",
      days: "30 nap",
      price: 69990,
      detail: "A rendszeresen utazók kedvence",
      popular: true,
    },
    { name: "Éves bérlet", days: "365 nap", price: 599900, detail: "A legjobb ár egész évre" },
  ];
  return (
    <div className="page-wrap">
      <div className="center-heading">
        <span className="kicker">TRANSIX BÉRLETEK</span>
        <h1>Utazz többet, fizess kevesebbet</h1>
        <p>Korlátlan utazás a TRANSIX minden belföldi járatán.</p>
        <div className="segment">
          <button className="active">Teljes árú</button>
          <button>Diák</button>
        </div>
      </div>
      <div className="pass-grid">
        {passes.map((p) => (
          <article className={p.popular ? "popular" : ""} key={p.name}>
            {p.popular && (
              <span className="popular-label">
                <Star /> Legnépszerűbb
              </span>
            )}
            <span className="pass-icon">
              <WalletCards />
            </span>
            <h2>{p.name}</h2>
            <p>{p.detail}</p>
            <strong>{formatFt(p.price)}</strong>
            <small>{p.days} érvényesség</small>
            <ul>
              <li>
                <Check /> Korlátlan belföldi utazás
              </li>
              <li>
                <Check /> Offline QR-kód
              </li>
              <li>
                <Check /> Ingyenes járatkövetés
              </li>
            </ul>
            <Button
              variant={p.popular ? "primary" : "secondary"}
              onClick={() => notify(`${p.name} a kosárba került.`)}
            >
              Bérlet kiválasztása
            </Button>
          </article>
        ))}
      </div>
      <div className="student-banner">
        <div>
          <span>
            <Sparkles />
          </span>
          <div>
            <h2>Diák havi bérlet</h2>
            <p>Érvényes diákigazolvánnyal 50% kedvezmény.</p>
          </div>
        </div>
        <strong>
          34 995 Ft <small>/ 30 nap</small>
        </strong>
        <Button onClick={() => notify("A diák bérlet a kosárba került.")}>Kiválasztom</Button>
      </div>
    </div>
  );
}

export function TicketsPage() {
  const [tab, setTab] = useState("active");
  return (
    <div className="page-wrap narrow">
      <div className="page-title">
        <div>
          <span className="kicker">UTAZÁSAIM</span>
          <h1>Jegyeim és bérleteim</h1>
          <p>Minden utazási dokumentumod egy helyen.</p>
        </div>
        <Link className="btn btn-primary" to="/kereses">
          <Search /> Új utazás
        </Link>
      </div>
      <div className="tabs">
        <button onClick={() => setTab("active")} className={tab === "active" ? "active" : ""}>
          Aktív <span>2</span>
        </button>
        <button onClick={() => setTab("passes")} className={tab === "passes" ? "active" : ""}>
          Bérletek <span>1</span>
        </button>
        <button onClick={() => setTab("past")} className={tab === "past" ? "active" : ""}>
          Korábbi
        </button>
      </div>
      {tab === "active" && (
        <div className="ticket-list">
          <article className="ticket-item">
            <div className="ticket-date">
              <span>MÁJ</span>
              <strong>14</strong>
              <small>Csütörtök</small>
            </div>
            <div className="ticket-route">
              <div>
                <span className="code">M5</span>
                <StatusPill status="Aktív" />
              </div>
              <h2>Budapest → Szeged</h2>
              <p>
                <Clock3 /> 08:00 – 10:30 · 3B ülés
              </p>
              <small>TX-5M2K-84Q7</small>
            </div>
            <div className="ticket-actions">
              <Link to="/jaratkovetes/m5-0800" className="btn btn-secondary">
                <Map /> Járatkövetés
              </Link>
              <Link to="/jegyvasarlas/m5-0800" className="btn btn-primary">
                <QrCode /> QR-kód
              </Link>
            </div>
          </article>
          <article className="ticket-item">
            <div className="ticket-date blue">
              <span>MÁJ</span>
              <strong>18</strong>
              <small>Hétfő</small>
            </div>
            <div className="ticket-route">
              <div>
                <span className="code">M3</span>
                <StatusPill status="Aktív" />
              </div>
              <h2>Budapest → Debrecen</h2>
              <p>
                <Clock3 /> 10:15 – 13:25 · 7A ülés
              </p>
              <small>TX-9P1M-52R8</small>
            </div>
            <div className="ticket-actions">
              <Button variant="secondary">
                <Download /> Letöltés
              </Button>
              <Button>
                <QrCode /> QR-kód
              </Button>
            </div>
          </article>
        </div>
      )}
      {tab === "passes" && (
        <div className="pass-detail">
          <QRCard pass />
          <div>
            <StatusPill status="Aktív" />
            <h2>Diák havi bérlet</h2>
            <p>Országos érvényesség · korlátlan utazás</p>
            <div className="validity">
              <span>
                <i style={{ width: "62%" }} />
              </span>
              <small>19 nap van hátra</small>
            </div>
            <Button variant="secondary">
              <Download /> Mentés a telefonra
            </Button>
          </div>
        </div>
      )}
      {tab === "past" && (
        <EmptyState
          title="Nincsenek korábbi jegyeid"
          text="Az első utazásod után itt találod majd az előzményeket."
          action="Járat keresése"
        />
      )}
    </div>
  );
}

export function NotificationsPage() {
  const [items, setItems] = useState([
    {
      type: "danger",
      title: "12 perc késés",
      text: "Az M5 08:00 járat várhatóan 10:42-kor érkezik Szegedre.",
      time: "2 perce",
      unread: true,
    },
    {
      type: "info",
      title: "Hamarosan indul a járatod",
      text: "Az M5 járat 45 perc múlva indul a Népligetből.",
      time: "Ma, 07:15",
      unread: true,
    },
    {
      type: "success",
      title: "Sikeres jegyvásárlás",
      text: "A Budapest–Szeged jegyed elkészült.",
      time: "Tegnap, 18:42",
      unread: true,
    },
    {
      type: "neutral",
      title: "Új megállóhely",
      text: "A M3 útvonalon júniustól új megálló nyílik.",
      time: "Május 11.",
      unread: false,
    },
  ]);
  return (
    <div className="page-wrap narrow">
      <div className="page-title">
        <div>
          <span className="kicker">KÖZPONT</span>
          <h1>Értesítések</h1>
          <p>Fontos hírek az utazásaidról.</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setItems(items.map((i) => ({ ...i, unread: false })))}
        >
          <Check /> Mind olvasottnak jelölése
        </Button>
      </div>
      <div className="notification-list">
        {items.map((item, i) => (
          <button
            key={i}
            onClick={() => setItems(items.map((x, j) => (j === i ? { ...x, unread: false } : x)))}
            className={item.unread ? "unread" : ""}
          >
            <span className={`notification-icon ${item.type}`}>
              <Bell />
            </span>
            <div>
              <div>
                <h3>{item.title}</h3>
                {item.unread && <i />}
              </div>
              <p>{item.text}</p>
              <small>{item.time}</small>
            </div>
            <ChevronRight />
          </button>
        ))}
      </div>
    </div>
  );
}

export function TrackingPage() {
  return (
    <div className="tracking-page">
      <div className="tracking-head">
        <div>
          <Link to="/jegyeim">
            <ChevronLeft />
          </Link>
          <div>
            <span className="kicker">M5 · ÉLŐ JÁRAT</span>
            <h1>Budapest → Szeged</h1>
          </div>
        </div>
        <div>
          <StatusPill status="Úton" />
          <span className="delay-pill">12 perc késés</span>
        </div>
      </div>
      <LiveMap />
      <div className="tracking-info">
        <article>
          <span className="map-icon">
            <Navigation />
          </span>
          <div>
            <small>Következő megálló</small>
            <h2>Kecskemét, Autóbusz-állomás</h2>
            <p>
              Érkezés: <b>09:14</b> · Tervezett: 09:02
            </p>
          </div>
          <strong>
            12 <small>perc</small>
          </strong>
        </article>
        <article className="stop-progress">
          <div className="done">
            <i>
              <Check />
            </i>
            <span>
              <b>Budapest, Népliget</b>
              <small>Indult 08:04</small>
            </span>
          </div>
          <div className="current">
            <i>
              <BusIcon />
            </i>
            <span>
              <b>Kecskemét</b>
              <small>Várható 09:14</small>
            </span>
          </div>
          <div>
            <i />
            <span>
              <b>Szeged</b>
              <small>Várható 10:42</small>
            </span>
          </div>
        </article>
      </div>
    </div>
  );
}
function BusIcon() {
  return <Navigation size={16} />;
}

export function SettingsPage() {
  const { dark, setDark, notify } = useApp();
  return (
    <div className="page-wrap narrow">
      <div className="page-title">
        <div>
          <span className="kicker">FIÓK</span>
          <h1>Beállítások</h1>
          <p>Személyes adatok és értesítési preferenciák.</p>
        </div>
      </div>
      <div className="settings-layout">
        <aside>
          <button className="active">
            <UserRound /> Profil
          </button>
          <button>
            <Bell /> Értesítések
          </button>
          <button>
            <CreditCard /> Fizetési módok
          </button>
          <button>
            <ShieldCheck /> Adatvédelem
          </button>
        </aside>
        <section className="settings-card">
          <h2>Megjelenés</h2>
          <div className="setting-row">
            <div>
              <span className="theme-icon">{dark ? "Éj" : "Nap"}</span>
              <div>
                <b>Sötét mód</b>
                <p>Kíméld a szemed gyenge fényben.</p>
              </div>
            </div>
            <button className={`toggle ${dark ? "on" : ""}`} onClick={() => setDark(!dark)}>
              <i />
            </button>
          </div>
          <hr />
          <h2>Személyes adatok</h2>
          <div className="form-grid">
            <label className="field">
              <span>Teljes név</span>
              <input defaultValue="Kovács Anna" />
            </label>
            <label className="field">
              <span>E-mail-cím</span>
              <input defaultValue="anna.kovacs@example.hu" />
            </label>
            <label className="field">
              <span>Telefonszám</span>
              <input defaultValue="+36 30 555 0142" />
            </label>
            <label className="field">
              <span>Kedvezmény</span>
              <select>
                <option>Diák – 50%</option>
              </select>
            </label>
          </div>
          <Button onClick={() => notify("A beállításokat elmentettük.")}>
            Változtatások mentése
          </Button>
        </section>
      </div>
    </div>
  );
}

export function AuthPage({ register = false }: { register?: boolean }) {
  const navigate = useNavigate();
  const [error, setError] = useState(false);
  return (
    <div className="auth-page">
      <div className="auth-brand">
        <Brand />
      </div>
      <div className="auth-card">
        <span className="auth-icon">
          <Ticket />
        </span>
        <h1>{register ? "Hozd létre a fiókodat" : "Üdv újra!"}</h1>
        <p>
          {register
            ? "Regisztrálj, és legyen minden jegyed egy helyen."
            : "Jelentkezz be a jegyeid és bérleteid eléréséhez."}
        </p>
        {error && <ErrorBanner>A megadott e-mail-cím vagy jelszó nem megfelelő.</ErrorBanner>}
        {register && (
          <label className="field">
            <span>Teljes név</span>
            <input placeholder="Kovács Anna" />
          </label>
        )}
        <label className={`field ${error ? "field-error" : ""}`}>
          <span>E-mail-cím</span>
          <input type="email" defaultValue={error ? "hibas@pelda" : "anna.kovacs@example.hu"} />
        </label>
        <label className={`field ${error ? "field-error" : ""}`}>
          <span>Jelszó</span>
          <input type="password" defaultValue="transix2026" />
          {error && <small>Legalább 8 karakter szükséges.</small>}
        </label>
        <Button
          className="full-btn"
          onClick={() => (error ? navigate("/jegyeim") : setError(true))}
        >
          {register ? "Regisztráció" : "Bejelentkezés"}
        </Button>
        <div className="or">
          <span /> vagy <span />
        </div>
        <Button variant="secondary" className="full-btn">
          Folytatás Google-fiókkal
        </Button>
        <p>
          {register ? "Már van fiókod?" : "Még nincs fiókod?"}{" "}
          <Link to={register ? "/belepes" : "/regisztracio"}>
            {register ? "Bejelentkezés" : "Regisztráció"}
          </Link>
        </p>
      </div>
      <DevPanel />
    </div>
  );
}
