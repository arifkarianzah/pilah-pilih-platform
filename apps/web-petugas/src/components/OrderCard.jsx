import { MapPin, Calendar, Weight, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const STATUS_MAP = {
  pending: { label: "Menunggu", className: "badge-pending" },
  accepted: { label: "Diterima", className: "badge-accepted" },
  on_the_way: { label: "Di Perjalanan", className: "badge-on_the_way" },
  completed: { label: "Selesai", className: "badge-completed" },
  cancelled: { label: "Dibatalkan", className: "badge-cancelled" },
};

const WASTE_ICONS = {
  kertas: "📄",
  plastik: "♻️",
  logam: "🔩",
  kaca: "🔵",
  elektronik: "💻",
  organik: "🌿",
};

function OrderCard({ order, showAction }) {
  const navigate = useNavigate();
  const status = STATUS_MAP[order.status] || { label: order.status, className: "badge-pending" };
  const wasteIcon = WASTE_ICONS[order.waste_type?.toLowerCase()] || "🗑️";

  const dateStr = order.pickup_date
    ? new Date(order.pickup_date).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "-";

  return (
    <div className="order-card" onClick={() => navigate(`/orders/${order.id}`)}>
      <div className="order-card-header">
        <div>
          <div className="order-id">#{order.id}</div>
          <div className="order-user">
            {wasteIcon} {order.waste_type || "Sampah Umum"}
          </div>
        </div>
        <span className={`badge ${status.className}`}>{status.label}</span>
      </div>

      <div className="order-meta">
        <div className="order-meta-item">
          <MapPin size={13} />
          <span style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {order.address || "Alamat tidak tersedia"}
          </span>
        </div>
        <div className="order-meta-item">
          <Calendar size={13} />
          <span>{dateStr}</span>
        </div>
        {order.estimated_weight && (
          <div className="order-meta-item">
            <Weight size={13} />
            <span>~{order.estimated_weight} kg</span>
          </div>
        )}
      </div>

      <div className="order-footer">
        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
          User ID #{order.user_id}
        </div>
        <div className="flex items-center gap-1" style={{ fontSize: "0.82rem", color: "var(--primary)", fontWeight: 700 }}>
          Detail <ArrowRight size={13} />
        </div>
      </div>
    </div>
  );
}

export default OrderCard;
