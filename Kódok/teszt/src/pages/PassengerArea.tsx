import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import {
  AlertTriangle,
  Armchair,
  Bell,
  BellRing,
  CalendarPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Info,
  KeyRound,
  Map,
  MapPin,
  Navigation,
  Pencil,
  QrCode,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";
import { useApp } from "../app/AppContext";
import { formatFt, trips } from "../app/data";
import { LiveMap } from "../components/LiveMap";
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorBanner,
  OccupancyBadge,
  PriceBlock,
  QRCard,
  SeatMap,
  StatusPill,
  Stepper,
} from "../components/ui";

const tripStops = [
  { name: "Budapest, Népliget", distance: 0 },
  { name: "Kecskemét, Autóbusz-állomás", distance: 84.2 },
  { name: "Szeged, Autóbusz-állomás", distance: 172.4 },
];

export function PassengerPurchasePage() {
  const { id } = useParams();
  const trip = trips.find((item) => item.id === id) || trips[0];
  const [step, setStep] = useState(1);
  const [boarding, setBoarding] = useState(0);
  const [alighting, setAlighting] = useState(2);
  const [seat, setSeat] = useState("");
  const [seatVersion, setSeatVersion] = useState(0);
  const [sectionError, setSectionError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [card, setCard] = useState("4242 4242 4242 4242");
  const { notify } = useApp();
  const navigate = useNavigate();
  const distance = Math.max(0, tripStops[alighting].distance - tripStops[boarding].distance);
  const basePrice = distance <= 50 ? 1490 : distance <= 100 ? 2490 : distance <= 150 ? 3490 : 4990;
  const finalPrice = Math.round((basePrice * 0.5) / 5) * 5;
  const blocked =
    trip.seats === 0 ? "Elfogyott a hely" : trip.status === "Úton" ? "A járat már elindult" : "";

  const continueSection = () => {
    if (alighting <= boarding) {
      setSectionError("A leszállási megálló az útvonalon az indulás előtt van");
      return;
    }
    setSectionError("");
    setStep(2);
  };
  const selectSeat = (value: string) => {
    if (value === "5C") {
      notify("A hely közben foglalttá vált");
      setSeat("");
      setSeatVersion((current) => current + 1);
      return;
    }
    setSeat(value);
  };
  const pay = () => {
    if (card.split(" ").join("") !== "4242424242424242") {
      setPaymentError("Sikertelen fizetés");
      return;
    }
    setPaymentError("");
    setStep(4);
  };

  return (
    <div className="purchase-page">
      <div className="page-wrap narrow passenger-checkout">
        <Link className="back-link" to={`/jarat/${trip.id}`}>
          <ChevronLeft /> Vissza a járathoz
        </Link>
        <Stepper step={step} labels={["Szakasz", "Ülőhely", "Fizetés", "Siker"]} />
        {blocked && (
          <div className="purchase-blocked">
            <AlertTriangle />
            <div>
              <b>{blocked}</b>
              <span>
                {blocked === "Elfogyott a hely"
                  ? "Válassz egy későbbi, szabad járatot."
                  : "Erre a járatra már nem vásárolható jegy."}
              </span>
            </div>
            <Link to="/kereses">Másik járat keresése</Link>
          </div>
        )}
        {step === 1 && (
          <div className="checkout-grid">
            <section className="form-card">
              <span className="kicker">1. LÉPÉS</span>
              <h1>Válaszd ki az utazási szakaszt</h1>
              <p>A keresésben megadott megállókat előre kitöltöttük.</p>
              <div className="section-selectors">
                <label className="field">
                  <span>Felszállási megálló</span>
                  <select value={boarding} onChange={(e) => setBoarding(Number(e.target.value))}>
                    {tripStops.map((stop, index) => (
                      <option value={index} key={stop.name}>
                        {stop.name}
                      </option>
                    ))}
                  </select>
                </label>
                <span className="section-route-line">
                  <i />
                  <Navigation />
                  <i />
                </span>
                <label className={`field ${sectionError ? "field-error" : ""}`}>
                  <span>Leszállási megálló</span>
                  <select value={alighting} onChange={(e) => setAlighting(Number(e.target.value))}>
                    {tripStops.map((stop, index) => (
                      <option value={index} key={stop.name}>
                        {stop.name}
                      </option>
                    ))}
                  </select>
                  {sectionError && <small className="field-message">{sectionError}</small>}
                </label>
              </div>
              {sectionError && (
                <ErrorBanner>
                  <b>400 · Hibás megállósorrend:</b>&nbsp;{sectionError}
                </ErrorBanner>
              )}
              <div className="live-fare">
                <div>
                  <Route />
                  <span>
                    <small>Távolság</small>
                    <b>{distance.toFixed(1).replace(".", ",")} km</b>
                  </span>
                </div>
                <div>
                  <Sparkles />
                  <span>
                    <small>Élő jegyár</small>
                    <b>{formatFt(finalPrice)}</b>
                  </span>
                </div>
              </div>
              <Button onClick={continueSection} disabled={Boolean(blocked)}>
                Tovább az ülőhelyhez <ChevronRight />
              </Button>
            </section>
            <CheckoutAside trip={trip} distance={distance} price={finalPrice} />
          </div>
        )}
        {step === 2 && (
          <div className="checkout-grid">
            <section className="form-card">
              <span className="kicker">2. LÉPÉS · OPCIONÁLIS</span>
              <h1>Válassz ülőhelyet</h1>
              <p>A 5C hely kiválasztásával kipróbálhatod a közbeni foglalás állapotát.</p>
              <SeatMap key={seatVersion} selected={seat} onSelect={selectSeat} />
              {seat && (
                <div className="seat-summary">
                  <div>
                    <Check />
                    <span>
                      <b>{seat} – ablak mellett</b>
                      <small>Kiválasztott ülőhely</small>
                    </span>
                  </div>
                  <Button onClick={() => setStep(3)}>Tovább</Button>
                </div>
              )}
              <button
                className="skip-seat"
                onClick={() => {
                  setSeat("");
                  setStep(3);
                }}
              >
                Ülőhely nélkül folytatom
              </button>
            </section>
            <CheckoutAside trip={trip} distance={distance} price={finalPrice} seat={seat} />
          </div>
        )}
        {step === 3 && (
          <div className="checkout-grid">
            <section className="form-card">
              <span className="kicker">3. LÉPÉS</span>
              <h1>Összegzés és fizetés</h1>
              <div className="payment-summary">
                <div>
                  <span>Alapár</span>
                  <b>{formatFt(basePrice)}</b>
                </div>
                <div>
                  <span>Diák kedvezmény</span>
                  <b>−50%</b>
                </div>
                <div>
                  <span>Ülőhelyfoglalás</span>
                  <b>0 Ft</b>
                </div>
                <hr />
                <div>
                  <strong>Végösszeg</strong>
                  <strong>{formatFt(finalPrice)}</strong>
                </div>
              </div>
              <div className="checkout-occupancy">
                <span>Várható telítettség</span>
                <OccupancyBadge value={trip.occupancy} />
              </div>
              <div className="checkout-pass-tip">
                <WalletCards />
                <div>
                  <b>Gyakran utazol?</b>
                  <p>Havi bérlettel ezen az útvonalon kb. 6 200 Ft-ot spórolhatsz.</p>
                </div>
                <Link to="/berletek">Bérletek</Link>
              </div>
              {paymentError && (
                <div className="payment-error">
                  <AlertTriangle />
                  {paymentError}
                </div>
              )}
              <PaymentFields card={card} setCard={setCard} />
              <p className="secure-note">
                <ShieldCheck /> Bankkártyaadatot nem tárolunk
              </p>
              <Button onClick={pay}>
                <CreditCard /> {formatFt(finalPrice)} fizetése
              </Button>
            </section>
            <CheckoutAside trip={trip} distance={distance} price={finalPrice} seat={seat} />
          </div>
        )}
        {step === 4 && (
          <div className="purchase-success">
            <span className="animated-check">
              <Check />
            </span>
            <h1>Sikeres vásárlás!</h1>
            <p>A jegyed már elérhető offline is. Felszálláskor mutasd fel a QR-kódot.</p>
            <QRCard />
            <div>
              <Button onClick={() => navigate("/jegyeim")}>
                <Ticket /> Jegyeim
              </Button>
              <Button
                variant="secondary"
                onClick={() => notify("Az utazást hozzáadtuk a naptáradhoz.")}
              >
                <CalendarPlus /> Hozzáadás a naptárhoz
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CheckoutAside({
  trip,
  distance,
  price,
  seat,
}: {
  trip: (typeof trips)[number];
  distance: number;
  price: number;
  seat?: string;
}) {
  return (
    <aside className="order-aside">
      <span>{trip.code}</span>
      <h3>
        {tripStops[0].name.split(",")[0]} → {tripStops[2].name.split(",")[0]}
      </h3>
      <p>
        Ma, {trip.departure} · {distance.toFixed(1).replace(".", ",")} km
      </p>
      <div>
        <span>Diákjegy</span>
        <b>{formatFt(price)}</b>
      </div>
      <div>
        <span>Ülőhely</span>
        <b>{seat || "Nincs kiválasztva"}</b>
      </div>
      <hr />
      <div className="total">
        <span>Összesen</span>
        <strong>{formatFt(price)}</strong>
      </div>
    </aside>
  );
}

function PaymentFields({ card, setCard }: { card: string; setCard: (value: string) => void }) {
  return (
    <div className="form-grid payment-fields">
      <label className="field full">
        <span>Kártyaszám</span>
        <input
          value={card}
          onChange={(e) => setCard(e.target.value)}
          placeholder="1234 5678 9012 3456"
        />
      </label>
      <label className="field full">
        <span>Kártyán szereplő név</span>
        <input defaultValue="KOVÁCS ANNA" />
      </label>
      <label className="field">
        <span>Lejárat</span>
        <input defaultValue="08/29" />
      </label>
      <label className="field">
        <span>CVC</span>
        <input defaultValue="123" />
      </label>
    </div>
  );
}

const passOptions = [
  { name: "Napi bérlet", duration: "1 nap", days: 1, price: 6990, target: "" },
  { name: "Heti bérlet", duration: "7 nap", days: 7, price: 24990, target: "Diák" },
  {
    name: "Havi bérlet",
    duration: "30 nap",
    days: 30,
    price: 69990,
    target: "Diák",
    popular: true,
  },
  { name: "Éves bérlet", duration: "365 nap", days: 365, price: 599900, target: "Nyugdíjas" },
];

export function PassengerPassesPage() {
  const [selected, setSelected] = useState<(typeof passOptions)[number] | null>(null);
  const [date, setDate] = useState("2026-11-10");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const validUntil = selected ? addDays(date, selected.days) : "";
  const buy = () => {
    if (!selected) return;
    if (date < new Date().toISOString().slice(0, 10)) {
      setError("A kezdőnap nem lehet múltbeli");
      return;
    }
    if (selected.target === "Nyugdíjas") {
      setError("Nem jogosult a kedvezményes típusra");
      return;
    }
    if (selected.name === "Havi bérlet") {
      setError("Már van átfedő aktív bérleted ebből a típusból");
      return;
    }
    setError("");
    setSuccess(true);
  };
  const close = () => {
    setSelected(null);
    setSuccess(false);
    setError("");
  };
  return (
    <div className="page-wrap">
      <div className="center-heading">
        <span className="kicker">TRANSIX BÉRLETEK</span>
        <h1>Válaszd ki a neked megfelelő bérletet</h1>
        <p>Korlátlan belföldi utazás, egyetlen digitális QR-kóddal.</p>
      </div>
      <div className="pass-grid passenger-passes">
        {passOptions.map((pass) => (
          <article className={pass.popular ? "popular" : ""} key={pass.name}>
            {pass.popular && (
              <span className="popular-label">
                <Sparkles /> Legnépszerűbb
              </span>
            )}
            <span className="pass-icon">
              <WalletCards />
            </span>
            {pass.target && <span className="target-badge">{pass.target}</span>}
            <h2>{pass.name}</h2>
            <p>Korlátlan utazás a TRANSIX belföldi járatain.</p>
            <strong>{formatFt(pass.price)}</strong>
            <small>{pass.duration} érvényesség</small>
            <Button
              variant={pass.popular ? "primary" : "secondary"}
              onClick={() => setSelected(pass)}
            >
              Megvásárolom
            </Button>
          </article>
        ))}
      </div>
      {selected && (
        <div className="modal-backdrop">
          <div className="modal pass-modal">
            <button className="modal-close" onClick={close} aria-label="Ablak bezárása">
              <X />
            </button>
            {success ? (
              <>
                <span className="animated-check small">
                  <Check />
                </span>
                <h2>Bérlet megvásárolva!</h2>
                <p>
                  {selected.name} · Érvényes: {formatDate(date)} – {formatDate(validUntil)}
                </p>
                <QRCard pass />
                <Button onClick={close}>Kész</Button>
              </>
            ) : (
              <>
                <span className="pass-icon">
                  <WalletCards />
                </span>
                <h2>{selected.name} megvásárlása</h2>
                <div className="pass-order">
                  <span>
                    Típus <b>{selected.target || "Teljes árú"}</b>
                  </span>
                  <span>
                    Ár <b>{formatFt(selected.price)}</b>
                  </span>
                </div>
                <label className="field">
                  <span>Kezdőnap</span>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <div className="pass-validity">
                  <CalendarPlus />
                  <span>
                    <small>Érvényesség</small>
                    <b>
                      {formatDate(date)} – {formatDate(validUntil)}
                    </b>
                  </span>
                </div>
                {error && (
                  <div className="payment-error">
                    <AlertTriangle />
                    {error}
                  </div>
                )}
                <PaymentFields card="4242 4242 4242 4242" setCard={() => {}} />
                <Button onClick={buy}>Bérlet megvásárlása</Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type TicketTab = "Közelgő" | "Felhasznált" | "Lemondott" | "Bérletek" | "Értesítések";
const ticketMocks = [
  {
    code: "M5",
    route: "Budapest → Szeged",
    date: "2026. máj. 14., csütörtök",
    time: "08:00 – 10:30",
    delay: 12,
    stops: "Népliget → Autóbusz-állomás",
    seat: "3B",
    status: "Aktív",
    price: "2 495 Ft",
    ticketCode: "TX-5M2K-84Q7",
    tab: "Közelgő",
  },
  {
    code: "M3",
    route: "Budapest → Debrecen",
    date: "2026. ápr. 28., kedd",
    time: "10:15 – 13:25",
    delay: 0,
    stops: "Népliget → Nagyállomás",
    seat: "7A",
    status: "Felhasznált",
    price: "2 495 Ft",
    ticketCode: "TX-9P1M-52R8",
    tab: "Felhasznált",
  },
  {
    code: "M1",
    route: "Budapest → Győr",
    date: "2026. ápr. 8., szerda",
    time: "13:00 – 14:35",
    delay: 0,
    stops: "Népliget → Autóbusz-állomás",
    seat: "—",
    status: "Lemondva",
    price: "1 745 Ft",
    ticketCode: "TX-4A8K-11D2",
    tab: "Lemondott",
  },
];

export function TicketCollection({ compact = false }: { compact?: boolean }) {
  const [tab, setTab] = useState<TicketTab>("Közelgő");
  const [detail, setDetail] = useState<(typeof ticketMocks)[number] | null>(null);
  const [seatEdit, setSeatEdit] = useState(false);
  const [seat, setSeat] = useState("3B");
  const [cancel, setCancel] = useState(false);
  const { notify } = useApp();
  const tabs: TicketTab[] = ["Közelgő", "Felhasznált", "Lemondott", "Bérletek", "Értesítések"];
  if (compact)
    return (
      <div className="mobile-shared-tickets">
        <span className="kicker">UTAZÁSRA KÉSZ</span>
        <h1>Jegyeim</h1>
        <QRCard />
        <button className="mobile-ticket-summary" onClick={() => setDetail(ticketMocks[0])}>
          <span className="trip-route-chip">M5</span>
          <div>
            <b>Budapest → Szeged</b>
            <small>Ma, 08:00 · {seat} ülés</small>
          </div>
          <ChevronRight />
        </button>
        {detail && (
          <TicketDrawer
            ticket={detail}
            seat={seat}
            onClose={() => setDetail(null)}
            onSeat={() => setSeatEdit(true)}
            onCancel={() => setCancel(true)}
          />
        )}
        {seatEdit && <SeatEditor seat={seat} setSeat={setSeat} close={() => setSeatEdit(false)} />}
      </div>
    );
  const list = ticketMocks.filter((item) => item.tab === tab);
  return (
    <div>
      <div className="passenger-tabs">
        {tabs.map((item) => (
          <button className={tab === item ? "active" : ""} onClick={() => setTab(item)} key={item}>
            {item}
            {item === "Közelgő" && <span>1</span>}
          </button>
        ))}
      </div>
      {tab === "Bérletek" ? (
        <PassList />
      ) : tab === "Értesítések" ? (
        <NotificationCenter embedded />
      ) : list.length ? (
        <div className="passenger-ticket-list">
          {list.map((ticket) => (
            <button
              className={`passenger-ticket-card ${ticket.status === "Lemondva" ? "muted" : ""}`}
              key={ticket.ticketCode}
              onClick={() => setDetail(ticket)}
            >
              <div className="ticket-accent">
                <span>{ticket.code}</span>
                <QrCode />
              </div>
              <div>
                <div>
                  <h2>{ticket.route}</h2>
                  <StatusPill status={ticket.status} />
                </div>
                <p>
                  <Clock3 /> {ticket.date} · {ticket.time}{" "}
                  {ticket.delay > 0 && <b>+{ticket.delay} perc</b>}
                </p>
                <p>
                  <MapPin /> {ticket.stops}
                </p>
                <small>
                  {ticket.seat} ülés · {ticket.price}
                </small>
              </div>
              <ChevronRight />
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          title="Még nincs jegyed"
          text="Keress egy járatot, és az új jegyed itt jelenik meg."
          action="Járat keresése"
        />
      )}
      {detail && (
        <TicketDrawer
          ticket={detail}
          seat={seat}
          onClose={() => setDetail(null)}
          onSeat={() => setSeatEdit(true)}
          onCancel={() => setCancel(true)}
        />
      )}
      {seatEdit && <SeatEditor seat={seat} setSeat={setSeat} close={() => setSeatEdit(false)} />}
      <ConfirmDialog
        open={cancel}
        title="Jegy lemondása"
        text="Több mint 24 órával indulás előtt a jegyár 100%-a, 24 és 2 óra között 50%-a jár vissza. Később nem jár visszatérítés. Szolgáltatói lemondásnál mindig 100% jár vissza. Visszatérítés most: 2 495 Ft."
        onClose={() => setCancel(false)}
        onConfirm={() => {
          setCancel(false);
          setDetail(null);
          notify("Jegy lemondva");
        }}
      />
    </div>
  );
}

export function PassengerTicketsPage() {
  return (
    <div className="page-wrap narrow">
      <div className="page-title">
        <div>
          <span className="kicker">UTAZÁSAIM</span>
          <h1>Jegyeim és bérleteim</h1>
          <p>Minden utazási dokumentumod egy helyen.</p>
        </div>
        <Link className="btn btn-primary" to="/kereses">
          <Search />
          Új utazás
        </Link>
      </div>
      <TicketCollection />
    </div>
  );
}

function TicketDrawer({
  ticket,
  seat,
  onClose,
  onSeat,
  onCancel,
}: {
  ticket: (typeof ticketMocks)[number];
  seat: string;
  onClose: () => void;
  onSeat: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="drawer-backdrop" onMouseDown={onClose}>
      <aside className="ticket-drawer" onMouseDown={(e) => e.stopPropagation()}>
        <button className="drawer-close" onClick={onClose} aria-label="Jegyrészletek bezárása">
          <X />
        </button>
        <span className="kicker">DIGITÁLIS JEGY</span>
        <h2>{ticket.route}</h2>
        <StatusPill status={ticket.status} />
        <QRCard />
        <div className="drawer-code">
          <span>Jegykód</span>
          <b>{ticket.ticketCode}</b>
        </div>
        <div className="drawer-details">
          <span>
            <small>Indulás</small>
            <b>
              {ticket.date}
              <br />
              {ticket.time}
            </b>
          </span>
          <span>
            <small>Ülőhely</small>
            <b>{seat}</b>
          </span>
        </div>
        {ticket.status === "Aktív" && (
          <div className="drawer-actions">
            <Button variant="secondary" onClick={onSeat}>
              <Pencil />
              Ülőhely módosítása
            </Button>
            <Button variant="ghost" onClick={onSeat}>
              <Armchair />
              Ülőhely lemondása
            </Button>
            <Button variant="danger" onClick={onCancel}>
              <Trash2 />
              Jegy lemondása
            </Button>
            <small>Az ülőhely indulás előtt 15 percig módosítható.</small>
          </div>
        )}
      </aside>
    </div>
  );
}
function SeatEditor({
  seat,
  setSeat,
  close,
}: {
  seat: string;
  setSeat: (s: string) => void;
  close: () => void;
}) {
  const [next, setNext] = useState(seat);
  return (
    <div className="modal-backdrop">
      <div className="seat-edit-modal">
        <button className="modal-close" onClick={close} aria-label="Ablak bezárása">
          <X />
        </button>
        <h2>Ülőhely módosítása</h2>
        <SeatMap selected={next} onSelect={setNext} />
        <Button
          onClick={() => {
            setSeat(next);
            close();
          }}
        >
          Módosítás mentése
        </Button>
      </div>
    </div>
  );
}
function PassList() {
  return (
    <div className="user-pass-list">
      <article>
        <WalletCards />
        <div>
          <StatusPill status="Aktív" />
          <h2>Diák havi bérlet</h2>
          <p>19 nap van hátra</p>
          <span>
            <i style={{ width: "62%" }} />
          </span>
        </div>
        <strong>62%</strong>
      </article>
      <article className="expired">
        <WalletCards />
        <div>
          <StatusPill status="Lejárt" />
          <h2>Heti bérlet</h2>
          <p>2026. ápr. 30., csütörtök óta lejárt</p>
          <span>
            <i style={{ width: "100%" }} />
          </span>
        </div>
        <strong>Lejárt</strong>
      </article>
    </div>
  );
}

type NoticeType = "mind" | "reminder" | "delay" | "routeChange" | "expiry" | "info";
const noticeMocks = [
  {
    type: "delay" as NoticeType,
    title: "A 08:00-s M5-ös járat 12 percet késik",
    message: "A várható érkezés Szegedre 10:42.",
    time: "2 perce",
    unread: true,
    to: "/jaratkovetes/m5-0800",
  },
  {
    type: "expiry" as NoticeType,
    title: "A havi bérleted 3 nap múlva lejár",
    message: "Újítsd meg időben, hogy megszakítás nélkül utazhass.",
    time: "1 órája",
    unread: true,
    to: "/berletek",
  },
  {
    type: "info" as NoticeType,
    title: "Jegyed visszaigazolva",
    message: "A Budapest–Szeged jegyed elkészült.",
    time: "Tegnap",
    unread: false,
    to: "/jegyeim",
  },
  {
    type: "routeChange" as NoticeType,
    title: "Megállóváltozás az M3 útvonalon",
    message: "A szolnoki megálló ideiglenesen áthelyezésre került.",
    time: "2 napja",
    unread: false,
    to: "/jarat/m3-1015",
  },
  {
    type: "reminder" as NoticeType,
    title: "45 perc múlva indul a járatod",
    message: "Indulás a Népliget 6-os kocsiállásáról.",
    time: "3 napja",
    unread: false,
    to: "/jegyeim",
  },
];
export function NotificationCenter({
  compact = false,
  embedded = false,
}: {
  compact?: boolean;
  embedded?: boolean;
}) {
  const navigate = useNavigate();
  const [type, setType] = useState<NoticeType>("mind");
  const [items, setItems] = useState(noticeMocks);
  const shown = items.filter((x) => type === "mind" || x.type === type);
  const icons: Record<NoticeType, typeof Bell> = {
    mind: Bell,
    reminder: Clock3,
    delay: AlertTriangle,
    routeChange: Route,
    expiry: WalletCards,
    info: Info,
  };
  return (
    <div
      className={`${compact ? "mobile-notifications" : embedded ? "embedded-notifications" : "notification-center"}`}
    >
      {!compact && !embedded && (
        <div className="page-title">
          <div>
            <span className="kicker">KÖZPONT</span>
            <h1>Értesítések</h1>
            <p>Fontos hírek az utazásaidról.</p>
          </div>
        </div>
      )}
      <div className="notification-toolbar">
        <div>
          {(["mind", "reminder", "delay", "routeChange", "expiry", "info"] as NoticeType[]).map(
            (value) => (
              <button
                className={type === value ? "active" : ""}
                onClick={() => setType(value)}
                key={value}
              >
                {value === "mind"
                  ? "Mind"
                  : value === "reminder"
                    ? "Emlékeztető"
                    : value === "delay"
                      ? "Késés"
                      : value === "routeChange"
                        ? "Útvonal"
                        : value === "expiry"
                          ? "Lejárat"
                          : "Információ"}
              </button>
            ),
          )}
        </div>
        <button onClick={() => setItems(items.map((item) => ({ ...item, unread: false })))}>
          <Check />
          Mind olvasottnak jelölöm
        </button>
      </div>
      <div className="passenger-notices">
        {shown.map((item) => {
          const Icon = icons[item.type];
          return (
            <button
              key={item.title}
              className={item.unread ? "unread" : ""}
              onClick={() => {
                setItems(items.map((x) => (x.title === item.title ? { ...x, unread: false } : x)));
                navigate(item.to);
              }}
            >
              <span className={`notice-icon ${item.type}`}>
                <Icon />
              </span>
              <div>
                <span>
                  <h3>{item.title}</h3>
                  {item.unread && <i />}
                </span>
                <p>{item.message}</p>
                <small>{item.time}</small>
              </div>
              <ChevronRight />
            </button>
          );
        })}
      </div>
    </div>
  );
}
export function PassengerNotificationsPage() {
  return (
    <div className="page-wrap narrow">
      <NotificationCenter />
    </div>
  );
}

export function TrackingExperience({ compact = false }: { compact?: boolean }) {
  const [subscribed, setSubscribed] = useState(false);
  return (
    <div className={`tracking-experience ${compact ? "compact" : ""}`}>
      <div className="stale-banner">
        <AlertTriangle />
        <span>
          <b>Az adat nem friss</b> – a jármű pozíciója 2 perce frissült utoljára
        </span>
      </div>
      <div className="tracking-map-wrap">
        <LiveMap />
        <div className="tracking-bottom-sheet">
          <div className="sheet-handle" />
          <div className="tracking-next">
            <span>
              <small>Következő megálló</small>
              <h2>Kecskemét, Autóbusz-állomás</h2>
              <p>
                <Clock3 />
                Érkezés: 09:14 · 6,2 km
              </p>
            </span>
            <strong>12 perc késés</strong>
          </div>
          <div className="mobile-stop-progress">
            <span className="done">
              <i>
                <Check />
              </i>
              <b>Budapest</b>
              <small>08:04</small>
            </span>
            <span className="current">
              <i>
                <Navigation />
              </i>
              <b>Kecskemét</b>
              <small>09:14</small>
            </span>
            <span>
              <i />
              <b>Szeged</b>
              <small>10:42</small>
            </span>
          </div>
          <Button
            variant={subscribed ? "secondary" : "primary"}
            onClick={() => setSubscribed(!subscribed)}
          >
            <BellRing />
            {subscribed ? "Értesítés bekapcsolva" : "Értesítést kérek"}
          </Button>
        </div>
      </div>
    </div>
  );
}
export function PassengerTrackingPage() {
  return (
    <div className="passenger-tracking-page">
      <div className="tracking-title">
        <Link to="/jegyeim">
          <ChevronLeft />
        </Link>
        <div>
          <span className="kicker">M5 · ÉLŐ JÁRAT</span>
          <h1>Budapest → Szeged</h1>
        </div>
        <StatusPill status="Úton" />
      </div>
      <TrackingExperience />
    </div>
  );
}

export function PassengerSettingsPage() {
  const { dark, setDark, notify } = useApp();
  const [toggles, setToggles] = useState([true, true, true, false]);
  const labels = ["Indulás előtti emlékeztető", "Késés", "Útvonalváltozás", "Bérlet lejárata"];
  return (
    <div className="page-wrap narrow">
      <div className="page-title">
        <div>
          <span className="kicker">FIÓK</span>
          <h1>Beállítások</h1>
          <p>Profil, biztonság és értesítési beállítások.</p>
        </div>
      </div>
      <div className="passenger-settings">
        <section>
          <h2>
            <UserRound />
            Profil
          </h2>
          <div className="form-grid">
            <label className="field">
              <span>Teljes név</span>
              <input defaultValue="Kovács Anna" />
            </label>
            <label className="field">
              <span>Email</span>
              <input defaultValue="anna@transix.hu" />
            </label>
            <label className="field full">
              <span>Telefonszám</span>
              <input defaultValue="+36 30 555 0142" />
            </label>
          </div>
          <div className="readonly-discount">
            <Sparkles />
            <span>
              <small>Kedvezmény kategória</small>
              <b>Diák · 50%</b>
              <p>A kategóriát igazolás alapján kizárólag adminisztrátor módosíthatja.</p>
            </span>
          </div>
          <Button onClick={() => notify("A profiladatokat elmentettük.")}>Profil mentése</Button>
        </section>
        <section>
          <h2>
            <KeyRound />
            Jelszó módosítása
          </h2>
          <div className="form-grid">
            <label className="field full">
              <span>Jelenlegi jelszó</span>
              <input type="password" />
            </label>
            <label className="field">
              <span>Új jelszó</span>
              <input type="password" />
            </label>
            <label className="field">
              <span>Új jelszó újra</span>
              <input type="password" />
            </label>
          </div>
          <Button variant="secondary" onClick={() => notify("A jelszót módosítottuk.")}>
            Jelszó módosítása
          </Button>
        </section>
        <section>
          <h2>
            <Bell />
            Értesítések
          </h2>
          {labels.map((label, index) => (
            <div className="setting-row" key={label}>
              <div>
                <div>
                  <b>{label}</b>
                  <p>
                    {index === 0
                      ? "Értesítés 45 perccel indulás előtt."
                      : "Azonnali alkalmazásértesítés."}
                  </p>
                </div>
              </div>
              <button
                className={`toggle ${toggles[index] ? "on" : ""}`}
                onClick={() =>
                  setToggles(toggles.map((value, i) => (i === index ? !value : value)))
                }
              >
                <i />
              </button>
            </div>
          ))}
          <hr />
          <div className="setting-row">
            <div>
              <div>
                <b>Sötét mód</b>
                <p>Kímélő megjelenés gyenge fényben.</p>
              </div>
            </div>
            <button className={`toggle ${dark ? "on" : ""}`} onClick={() => setDark(!dark)}>
              <i />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function addDays(value: string, days: number) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
    weekday: "long",
  }).format(new Date(`${value}T12:00:00`));
}
