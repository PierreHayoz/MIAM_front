'use client';

import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet'; // 👈 ajoute Circle + useMap
import { useMemo } from 'react';
import L from 'leaflet';


function makeLogoDivIcon({
  src = '/logo.svg',
  size = 48,
  variant = 'badge',       // 'badge' | 'pin' | 'naked'
  bg = 'transparent',
  borderColor = '#111111',
  borderWidth = 0,         // 👈 number (0 = pas de bord)
}) {
  const tail = variant === 'pin' ? Math.round(size * 0.26) : 0;
  // (aucune ombre par défaut)
  const borderCss = borderWidth > 0 ? `border:${borderWidth}px solid ${borderColor};` : '';

  const html = variant === 'pin'
    ? `
<div style="position:relative;width:${size}px;height:${size + tail}px;">
  <div style="
    width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;
    ${borderCss}
    background:${bg};
    transform:translate(-50%,-50%);position:absolute;left:50%;top:50%;
  ">
    <img src="${src}" alt="logo" style="width:100%;height:100%;object-fit:contain;display:block">
  </div>
  <div style="
    position:absolute;left:50%;bottom:0;transform:translate(-50%,0);
    width:0;height:0;
    border-left:${Math.round(tail * 0.7)}px solid transparent;
    border-right:${Math.round(tail * 0.7)}px solid transparent;
    border-top:${tail}px solid ${borderWidth > 0 ? borderColor : bg};
  "></div>
</div>`
    : variant === 'naked'
    ? `
<div style="width:${size}px;height:${size}px;transform:translate(-50%,-50%);">
  <img src="${src}" alt="logo" style="width:100%;height:100%;object-fit:contain;display:block">
</div>`
    : `
<div style="
  width:${size}px;height:${size}px;border-radius:9999px;overflow:hidden;
  ${borderCss}
  background:${bg};
  transform:translate(-50%,-50%);
">
  <img src="${src}" alt="logo" style="width:100%;height:100%;object-fit:contain;display:block">
</div>`;

  return L.divIcon({
    html,
    className: 'miam-logo-pin',
    iconSize: [size, size + tail],
    iconAnchor: [size / 2, size / 2 + tail],
    popupAnchor: [0, -(size / 2 + tail - 6)],
  });
}

export default function LeafletMap({
  lat,
  lng,
  label = '',
  zoom = 15,
  height = 600,
  theme = 'light',
  minZoom,
  maxZoom,
  lockZoom = false,
  zoomStep = 1,
  canZoom = true,
  scrollWheelZoom = true,

  markerSrc = '/logo/MIAM.svg',
  markerSize = 75,
  markerVariant = 'badge',
  markerBg = 'transparent',
  markerBorder = '#111',
  markerBorderWidth = 0,
  showRadius = 0,
}) {
  const center = useMemo(() => [lat, lng], [lat, lng]);

  const tiles = {
    osm:   { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', att: '&copy; OpenStreetMap contributors' },
    light: { url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', att: '&copy; OpenStreetMap, &copy; CARTO' },
    dark:  { url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',  att: '&copy; OpenStreetMap, &copy; CARTO' },
  };
  const { url, att } = tiles[theme] ?? tiles.osm;

  const icon = useMemo(() => makeLogoDivIcon({
    src: markerSrc,
    size: markerSize,
    variant: markerVariant,
    bg: markerBg,
    borderColor: markerBorder,
    borderWidth: Number(markerBorderWidth) || 0,
  }), [markerSrc, markerSize, markerVariant, markerBg, markerBorder, markerBorderWidth]);

  // ✅ bornes souples (si tu ne veux pas lock, n’écrase pas la plage)
  const _minZoom = lockZoom ? zoom : (minZoom ?? 3);
  const _maxZoom = lockZoom ? zoom : (maxZoom ?? 19);

  return (
    <div className="relative py-8 overflow-hidden z-0" style={{ height }}>
      <MapContainer
        key={`${lat},${lng},${zoom},${_minZoom},${_maxZoom},${canZoom},${scrollWheelZoom}`}
        center={center}
        zoom={zoom}
        minZoom={_minZoom}
        maxZoom={_maxZoom}
        zoomSnap={zoomStep}
        zoomDelta={zoomStep}
        scrollWheelZoom={canZoom && scrollWheelZoom}
        doubleClickZoom={canZoom}
        touchZoom={canZoom}
        // (optionnel) autoriser le zoom clavier
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer attribution={att} url={url} />
        <Marker position={center} icon={icon} />
        {showRadius > 0 && <Circle center={center} radius={showRadius} />}
        {/* ✅ boutons +/− visibles */}
      </MapContainer>
    </div>
  );
}