'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import type { CollectionPoint } from '../lib/types';
import L from 'leaflet';

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

interface MapViewProps {
  points: CollectionPoint[];
  center?: [number, number];
  zoom?: number;
}

function getMarkerIcon(status: string, order: number) {
  const completed = status === 'completed';
  const bg = completed ? '#2d6318' : '#e07b2a';
  const border = completed ? '#1e4510' : '#b85a10';
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:${bg};color:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:13px;font-weight:700;
      border:3px solid ${border};
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
    ">${order}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
}

function MapBounds({ points }: { points: MapViewProps['points'] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length === 0) return;
    const bounds = L.latLngBounds(
      points.map((p) => [p.lat, p.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [points, map]);
  return null;
}

export default function MapView({ points, zoom = 13 }: MapViewProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div style={{
        height: '320px', borderRadius: 'var(--radius)',
        background: 'linear-gradient(160deg,#dcecd4,#e8f0e0)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--text-3)', fontSize: '13px',
      }}>
        جاري تحميل الخريطة…
      </div>
    );
  }

  const routeCoords = points
    .sort((a, b) => a.order - b.order)
    .map((p) => [p.lat, p.lng] as [number, number]);

  return (
    <MapContainer
      center={points[0] ? [points[0].lat, points[0].lng] : [36.3650, 6.6147]}
      zoom={zoom}
      style={{ height: '320px', borderRadius: 'var(--radius)', zIndex: 0 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline
        positions={routeCoords}
        color="#2d6318"
        weight={3}
        opacity={0.6}
        dashArray="8 6"
      />
      {points.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={getMarkerIcon(p.status, p.order)}
        >
          <Popup>
            <div style={{ fontSize: '13px', fontWeight: 500, textAlign: 'center' }}>
              {p.name}
            </div>
            <div style={{ fontSize: '11px', color: '#666', textAlign: 'center', marginTop: '2px' }}>
              {p.status === 'completed' ? '✅ منجز' : '⏳ قادم'}
            </div>
          </Popup>
        </Marker>
      ))}
      <MapBounds points={points} />
    </MapContainer>
  );
}
