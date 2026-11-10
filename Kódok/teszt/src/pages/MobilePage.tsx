import { useState } from "react";
import { Bell, ChevronRight, Map, QrCode, Search, UserRound } from "lucide-react";
import { Brand } from "../components/Brand";
import { DevPanel } from "../components/layouts";
import { StopAutocomplete, TripCard } from "../components/ui";
import { trips } from "../app/data";
import { NotificationCenter, TicketCollection, TrackingExperience } from "./PassengerArea";

type MobileTab = "search" | "tickets" | "tracking" | "notices" | "profile";

export function MobilePage() {
  const [tab, setTab] = useState<MobileTab>("search");
  return (
    <div className="mobile-stage">
      <div className="phone-frame">
        <div className="phone-top">
          <span>9:41</span>
          <i />
          <span>5G · 92%</span>
        </div>
        <div className="mobile-app passenger-mobile">
          <header>
            <Brand compact />
            <button onClick={() => setTab("notices")} aria-label="Értesítések megnyitása">
              <Bell />
              <span>2</span>
            </button>
          </header>
          <main>
            {tab === "search" && <MobileSearch onTracking={() => setTab("tracking")} />}
            {tab === "tickets" && (
              <div className="mobile-screen shared-mobile-screen">
                <TicketCollection compact />
              </div>
            )}
            {tab === "tracking" && <TrackingExperience compact />}
            {tab === "notices" && (
              <div className="mobile-screen shared-mobile-screen">
                <span className="kicker">KÖZPONT</span>
                <h1>Értesítések</h1>
                <NotificationCenter compact />
              </div>
            )}
            {tab === "profile" && <MobileProfile />}
          </main>
          <nav className="mobile-tabs five-tabs">
            <button className={tab === "search" ? "active" : ""} onClick={() => setTab("search")}>
              <Search />
              Kereső
            </button>
            <button className={tab === "tickets" ? "active" : ""} onClick={() => setTab("tickets")}>
              <QrCode />
              Jegyeim
            </button>
            <button
              className={`tracking-tab ${tab === "tracking" ? "active" : ""}`}
              onClick={() => setTab("tracking")}
            >
              <span>
                <Map />
              </span>
              Követés
            </button>
            <button className={tab === "notices" ? "active" : ""} onClick={() => setTab("notices")}>
              <i className="tab-badge">2</i>
              <Bell />
              Értesítések
            </button>
            <button className={tab === "profile" ? "active" : ""} onClick={() => setTab("profile")}>
              <UserRound />
              Profil
            </button>
          </nav>
        </div>
        <div className="phone-home" />
      </div>
      <div className="mobile-description">
        <span className="kicker">MOBILALKALMAZÁS</span>
        <h1>A térkép és a QR-jegy mindig egy érintésre.</h1>
        <p>
          Az utaswebbel közös komponensek, mobilra optimalizált sorrendben és nagy érintési
          felületekkel.
        </p>
        <ul>
          <li>
            <QrCode />
            Offline digitális jegyek
          </li>
          <li>
            <Map />
            Valós idejű járatkövetés
          </li>
          <li>
            <Bell />
            Azonnali utazási értesítések
          </li>
        </ul>
      </div>
      <DevPanel />
    </div>
  );
}

function MobileSearch({ onTracking }: { onTracking: () => void }) {
  const [from, setFrom] = useState("Budapest, Népliget");
  const [to, setTo] = useState("Szeged, Autóbusz-állomás");
  return (
    <div className="mobile-screen mobile-search-view">
      <div className="mobile-greeting">
        <div>
          <small>Jó reggelt,</small>
          <h1>Hová utazol?</h1>
        </div>
        <span>KA</span>
      </div>
      <div className="mobile-search-form">
        <StopAutocomplete label="Honnan" value={from} onChange={setFrom} />
        <StopAutocomplete label="Hová" value={to} onChange={setTo} />
        <button>
          <Search />
          Járatok keresése
        </button>
      </div>
      <section className="next-trip-card">
        <div>
          <span className="live-dot">ÉLŐ JÁRAT</span>
          <span>M5</span>
        </div>
        <h2>Budapest → Szeged</h2>
        <p>08:00 – 10:30 · 3B ülés</p>
        <div className="mobile-route-line">
          <i />
          <Map />
          <i />
        </div>
        <div className="mobile-times">
          <span>Népliget</span>
          <b>12 perc késés</b>
          <span>Szeged</span>
        </div>
        <button onClick={onTracking}>
          <Map />
          Járat követése
          <ChevronRight />
        </button>
      </section>
      <div className="mobile-section-title">
        <h2>Következő járat</h2>
        <button>Mind</button>
      </div>
      <TripCard trip={trips[4]} mobile />
    </div>
  );
}

function MobileProfile() {
  return (
    <div className="mobile-screen">
      <span className="profile-avatar">KA</span>
      <h1>Kovács Anna</h1>
      <p>Diák utas · anna@transix.hu</p>
      {[
        "Személyes adatok",
        "Jelszó és biztonság",
        "Kedvezmény: Diák · 50%",
        "Sötét mód",
        "Súgó és kapcsolat",
      ].map((item) => (
        <button className="mobile-list-row" key={item}>
          <UserRound />
          <span>
            <b>{item}</b>
          </span>
          <ChevronRight />
        </button>
      ))}
    </div>
  );
}
