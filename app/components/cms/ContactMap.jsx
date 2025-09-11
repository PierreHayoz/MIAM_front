'use client'
// app/components/cms/ContactMap.jsx
import dynamic from 'next/dynamic';
const LeafletMap = dynamic(() => import('./Leaflet'), { ssr: false });

const toNumber = (v) => {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    // gère "46,5197" -> 46.5197
    const n = Number(v.replace(',', '.'));
    return Number.isFinite(n) ? n : NaN;
  }
  return NaN;
};

export default function ContactMap(props) {
  const lat = toNumber(props.lat);
  const lng = toNumber(props.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  return (
    <LeafletMap
      {...props}
      lat={lat}
      lng={lng}
      zoom={15}
      minZoom={10}   // ← plus permissif (ou supprime carrément min/max)
      maxZoom={18}
      canZoom={true}
      scrollWheelZoom={true}
    />
  );
}
