import { useId, useMemo, useState, type KeyboardEvent, type ReactNode } from "react";
import {
  AlertCircle,
  Armchair,
  Check,
  ChevronDown,
  CircleCheck,
  Download,
  FileText,
  Info,
  LoaderCircle,
  LockKeyhole,
  Search,
  ServerCrash,
  ShieldX,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";
import { Link } from "react-router";
import { stops, type Trip, formatDistance, formatFt } from "../app/data";
import { useApp } from "../app/AppContext";

export function Button({
  children,
  variant = "primary",
  className = "",
  onClick,
  type = "button",
  disabled = false,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

export function StatusPill({ status }: { status: string }) {
  const positive = ["Aktív", "Befejezett", "Érvényes", "Úton"].includes(status);
  const negative = ["Lemondva", "Lejárt", "Sikertelen"].includes(status);
  return (
    <span
      className={`status ${positive ? "success" : negative ? "danger" : status === "Tervezett" ? "info" : "neutral"}`}
    >
      {positive ? (
        <CircleCheck size={13} />
      ) : negative ? (
        <AlertCircle size={13} />
      ) : (
        <Info size={13} />
      )}
      {status}
    </span>
  );
}

export function OccupancyBadge({ value }: { value: number }) {
  const config =
    value === 100
      ? ["Betelt", "full"]
      : value >= 80
        ? ["Zsúfolt", "high"]
        : value >= 50
          ? ["Közepes", "medium"]
          : ["Kevés utas", "low"];
  return (
    <div className={`occupancy ${config[1]}`}>
      <div>
        <Users size={14} />
        <span>{config[0]}</span>
        <b>{value}%</b>
      </div>
      <span className="progress">
        <i style={{ width: `${value}%` }} />
      </span>
    </div>
  );
}

export function PriceBlock({ price, discount = false }: { price: number; discount?: boolean }) {
  return (
    <div className="price-block">
      {discount && (
        <>
          <s>{formatFt(price)}</s>
          <span className="discount">−50% diák</span>
        </>
      )}
      <strong>{formatFt(discount ? Math.round(price / 10) * 5 : price)}</strong>
    </div>
  );
}

export function StopAutocomplete({
  label,
  value,
  onChange,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const filtered = stops.filter((s) =>
    `${s.city} ${s.name}`.toLowerCase().includes(value.toLowerCase()),
  );
  return (
    <label className={`field ${error ? "field-error" : ""}`} htmlFor={inputId}>
      <span>{label}</span>
      <div className="input-icon">
        <MapPinIcon />
        <input
          id={inputId}
          value={value}
          placeholder="Város vagy megálló"
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
        />
      </div>
      {open && value && (
        <div className="autocomplete">
          {filtered.slice(0, 5).map((s) => (
            <button
              key={s.city}
              onClick={() => {
                onChange(`${s.city}, ${s.name}`);
                setOpen(false);
              }}
            >
              <b>{s.name}</b>
              <span>{s.city}</span>
            </button>
          ))}
        </div>
      )}
      {error && <small className="field-message">{error}</small>}
    </label>
  );
}

function MapPinIcon() {
  return <span className="pin-dot" />;
}

export function TripCard({ trip, mobile = false }: { trip: Trip; mobile?: boolean }) {
  return (
    <article className={`trip-card ${mobile ? "trip-mobile" : ""}`}>
      <div className="trip-main">
        <div className="trip-code">
          <span>{trip.code}</span>
          <small>Közvetlen</small>
        </div>
        <div className="timeline">
          <div>
            <strong>{trip.departure}</strong>
            <span>{trip.from}</span>
          </div>
          <div className="line">
            <i />
            <small>{trip.duration}</small>
            <i />
          </div>
          <div>
            <strong>{trip.arrival}</strong>
            <span>{trip.to}</span>
          </div>
        </div>
        <div className="trip-meta">
          <span>{formatDistance(trip.distance)}</span>
          {trip.delay > 0 && <span className="delay">+{trip.delay} perc késés</span>}
          <OccupancyBadge value={trip.occupancy} />
        </div>
      </div>
      <div className="trip-action">
        <PriceBlock price={trip.price} />
        <span>{trip.seats ? `${trip.seats} szabad hely` : "Nincs szabad hely"}</span>
        <Link
          className={`btn btn-primary ${trip.seats === 0 ? "disabled" : ""}`}
          to={`/jarat/${trip.id}`}
        >
          {trip.seats ? "Részletek" : "Betelt"}
        </Link>
      </div>
    </article>
  );
}

export function Stepper({ step, labels }: { step: number; labels: string[] }) {
  return (
    <div className="stepper">
      {labels.map((label, i) => (
        <div className={i + 1 <= step ? "active" : ""} key={label}>
          <span>{i + 1 < step ? <Check size={14} /> : i + 1}</span>
          <b>{label}</b>
        </div>
      ))}
    </div>
  );
}

export function SeatMap({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (seat: string) => void;
}) {
  const rows = useMemo(() => Array.from({ length: 8 }, (_, i) => i + 1), []);
  const occupied = ["1A", "2B", "3C", "4D", "6A", "7B", "8C"];
  const moveFocus = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const delta: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -4,
      ArrowDown: 4,
    };
    if (!(event.key in delta)) return;
    event.preventDefault();
    const buttons = Array.from(
      event.currentTarget.closest(".seat-grid")?.querySelectorAll<HTMLButtonElement>("button") ||
        [],
    );
    let next = index + delta[event.key];
    while (next >= 0 && next < buttons.length && buttons[next].disabled) next += delta[event.key];
    buttons[next]?.focus();
  };
  return (
    <div className="seat-wrap">
      <div className="bus-front">
        <span>Kijárat</span>
        <div>Ajtó</div>
        <div className="driver">Kormány</div>
      </div>
      <div className="seat-grid" role="grid" aria-label="Választható ülőhelyek">
        {rows.flatMap((row) =>
          ["A", "B", "C", "D"].map((letter, col) => {
            const id = `${row}${letter}`;
            const locked = occupied.includes(id);
            const accessible = id === "1D";
            return (
              <button
                aria-label={`${id} ülés`}
                aria-pressed={selected === id}
                disabled={locked}
                onClick={() => onSelect(id)}
                onKeyDown={(event) => moveFocus(event, (row - 1) * 4 + col)}
                tabIndex={selected === id || (!selected && id === "1B") ? 0 : -1}
                role="gridcell"
                className={`seat ${col === 2 ? "aisle" : ""} ${locked ? "locked" : ""} ${selected === id ? "selected" : ""} ${accessible ? "accessible" : ""}`}
                key={id}
              >
                {locked ? (
                  <LockKeyhole size={13} />
                ) : selected === id ? (
                  <Check size={15} />
                ) : accessible ? (
                  "♿"
                ) : (
                  <Armchair size={15} />
                )}
                <span>{id}</span>
                {(col === 0 || col === 3) && <i />}
              </button>
            );
          }),
        )}
      </div>
      <div className="seat-legend">
        <span>
          <i className="free" />
          Szabad
        </span>
        <span>
          <i className="busy" />
          Foglalt
        </span>
        <span>
          <i className="mine" />
          Saját hely
        </span>
        <span>
          <i className="access" />
          Akadálymentes
        </span>
      </div>
    </div>
  );
}

export function QRCard({ pass = false }: { pass?: boolean }) {
  const squares = useMemo(
    () => Array.from({ length: 121 }, (_, i) => (i * 17 + i * i * 3) % 7 < 3),
    [],
  );
  return (
    <article className="qr-card">
      <span className="type-chip">{pass ? "BÉRLET" : "JEGY"}</span>
      <div className="qr">
        {squares.map((on, i) => (
          <i
            key={i}
            className={
              on || [0, 1, 2, 11, 13, 22, 23, 24, 96, 97, 98, 107, 109, 118, 119, 120].includes(i)
                ? "on"
                : ""
            }
          />
        ))}
      </div>
      <strong>{pass ? "TX-PASS-24-8031" : "TX-5M2K-84Q7"}</strong>
      <p>{pass ? "Érvényes: 2026. máj. 31., vasárnap" : "Budapest → Szeged · Ma, 08:00"}</p>
      <small>
        <CircleCheck size={14} /> Offline is elérhető
      </small>
    </article>
  );
}

export function ConfirmDialog({
  open,
  title,
  text,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  text: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Párbeszédablak bezárása">
          <X />
        </button>
        <div className="modal-icon">
          <AlertCircle />
        </div>
        <h2 id="confirm-title">{title}</h2>
        <p>{text}</p>
        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose}>
            Mégse
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Megerősítés
          </Button>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title = "Itt még nincs semmi",
  text = "Az új elemek ezen a helyen jelennek majd meg.",
  action = "Felfedezés",
}: {
  title?: string;
  text?: string;
  action?: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-illustration">
        <Search />
        <span />
        <i />
      </div>
      <h3>{title}</h3>
      <p>{text}</p>
      <Link to="/kereses" className="btn btn-primary">
        {action}
      </Link>
    </div>
  );
}

export function Skeletons() {
  return (
    <div className="skeleton-list" aria-busy="true" aria-label="Tartalom betöltése">
      {[1, 2, 3].map((n) => (
        <div className="skeleton" key={n}>
          <i />
          <span />
          <span />
          <b />
        </div>
      ))}
    </div>
  );
}

export function ErrorBanner({ children }: { children: ReactNode }) {
  return (
    <div className="error-banner" role="alert">
      <AlertCircle />
      {children}
    </div>
  );
}

const errorContent = {
  400: ["Hibás adatok", "Ellenőrizd a megadott mezőket, majd próbáld újra."],
  401: ["Bejelentkezés szükséges", "A folytatáshoz jelentkezz be a TRANSIX-fiókodba."],
  403: ["Nincs jogosultságod", "Ehhez az oldalhoz nincs megfelelő jogosultságod."],
  404: ["Az oldal nem található", "Lehet, hogy a hivatkozás elavult vagy hibás."],
  409: ["Ütköző módosítás", "Az adat közben megváltozott. Frissítsd az oldalt, majd próbáld újra."],
  422: ["Hiányzó díjszabás", "Ehhez a távolsághoz még nincs beállított viteldíj."],
  500: ["Hiba történt, próbáld újra", "A rendszer átmenetileg nem érhető el."],
} as const;

export function ErrorState({ code }: { code: keyof typeof errorContent }) {
  const [title, text] = errorContent[code];
  return (
    <main className="http-error-state">
      <span>{code >= 500 ? <ServerCrash /> : <ShieldX />}</span>
      <small>{code} HIBA</small>
      <h1>{title}</h1>
      <ErrorBanner>{text}</ErrorBanner>
      <div>
        <Link className="btn btn-primary" to="/">
          Vissza a főoldalra
        </Link>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Újrapróbálom
        </Button>
      </div>
    </main>
  );
}

type TableRow = Record<string, string | number>;
export function DataTable({
  columns,
  rows,
  onRow,
}: {
  columns: { key: string; label: string }[];
  rows: TableRow[];
  onRow?: (row: TableRow) => void;
}) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(columns[0].key);
  const filtered = rows
    .filter((r) => Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => String(a[sort]).localeCompare(String(b[sort]), "hu"));
  const { notify } = useApp();
  return (
    <div className="data-table">
      <div className="table-tools">
        <div className="search-box">
          <Search />
          <input
            aria-label="Keresés a táblázatban"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Keresés a táblázatban"
          />
        </div>
        <Button variant="secondary">
          <SlidersHorizontal /> Szűrők
        </Button>
        <div className="spacer" />
        <Button variant="ghost" onClick={() => notify("A CSV export elkészült.")}>
          <Download /> CSV
        </Button>
        <Button variant="ghost" onClick={() => notify("A PDF export elkészült.")}>
          <FileText /> PDF
        </Button>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key}>
                  <button onClick={() => setSort(c.key)}>
                    {c.label}
                    <ChevronDown size={14} />
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => (
              <tr key={i} onClick={() => onRow?.(row)}>
                {columns.map((c) => (
                  <td data-label={c.label} key={c.key}>
                    {c.key === "status" ? <StatusPill status={String(row[c.key])} /> : row[c.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="pagination">
        <span>
          1–{filtered.length} / {rows.length} elem
        </span>
        <button>Előző</button>
        <button className="active">1</button>
        <button>Következő</button>
      </div>
    </div>
  );
}

export function Toast() {
  const { toast } = useApp();
  return (
    <div className={`toast ${toast ? "show" : ""}`} role="status" aria-live="polite">
      <CircleCheck />
      {toast}
    </div>
  );
}

export function LoadingButton({ onDone }: { onDone: () => void }) {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      onClick={() => {
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          onDone();
        }, 900);
      }}
      disabled={loading}
    >
      {loading ? (
        <>
          <LoaderCircle className="spin" /> Feldolgozás…
        </>
      ) : (
        "Fizetés és jegyvásárlás"
      )}
    </Button>
  );
}
