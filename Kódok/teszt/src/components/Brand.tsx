import { BusFront, MapPin } from "lucide-react";
import { Link } from "react-router";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="TRANSIX főoldal">
      <span className="brand-mark">
        <BusFront size={compact ? 18 : 22} />
        <MapPin size={compact ? 10 : 12} />
      </span>
      <span className={compact ? "text-lg" : "text-xl"}>
        TRANSI<b>X</b>
      </span>
    </Link>
  );
}
