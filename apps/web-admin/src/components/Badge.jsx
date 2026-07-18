const statusMap = {
  // User/general
  active:      { cls: 'badge-success', label: 'Aktif' },
  inactive:    { cls: 'badge-danger',  label: 'Nonaktif' },
  // Penarikan
  pending:     { cls: 'badge-warning', label: 'Pending' },
  approved:    { cls: 'badge-info',    label: 'Disetujui' },
  success:     { cls: 'badge-success', label: 'Sukses' },
  rejected:    { cls: 'badge-danger',  label: 'Ditolak' },
  // Penjemputan (DB schema)
  accepted:    { cls: 'badge-info',    label: 'Diterima' },
  on_the_way:  { cls: 'badge-purple',  label: 'Dalam Perjalanan' },
  completed:   { cls: 'badge-success', label: 'Selesai' },
  cancelled:   { cls: 'badge-danger',  label: 'Dibatalkan' },
  // Verified
  verified:    { cls: 'badge-success', label: 'Terverifikasi' },
  unverified:  { cls: 'badge-warning', label: 'Belum Verifikasi' },
};

export default function Badge({ status, label, className = '' }) {
  const map = statusMap[status];
  const cls = map ? map.cls : 'badge-neutral';
  const text = label || (map ? map.label : status);

  return (
    <span className={`badge ${cls} ${className}`}>
      <span className="badge-dot" />
      {text}
    </span>
  );
}
