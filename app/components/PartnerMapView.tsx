'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { RecyclingCompany, TruckLocation } from '../lib/types';

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

function createIcon(label: string, background: string) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      min-width:34px;height:34px;padding:0 8px;border-radius:999px;
      background:${background};color:#fff;display:flex;align-items:center;justify-content:center;
      font-size:11px;font-weight:700;border:2px solid rgba(255,255,255,0.9);box-shadow:0 2px 10px rgba(0,0,0,0.18);
    ">${label}</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17],
  });
}

function FitBounds({
  companies,
  trucks,
  center,
}: {
  companies: RecyclingCompany[];
  trucks: TruckLocation[];
  center: { lat: number; lng: number };
}) {
  const map = useMap();

  useEffect(() => {
    const coords = [
      [center.lat, center.lng] as [number, number],
      ...companies.map((company) => [company.lat, company.lng] as [number, number]),
      ...trucks.map((truck) => [truck.lat, truck.lng] as [number, number]),
    ];
    map.fitBounds(L.latLngBounds(coords), { padding: [40, 40], maxZoom: 13 });
  }, [center, companies, trucks, map]);

  return null;
}

interface PartnerMapViewProps {
  companies: RecyclingCompany[];
  trucks: TruckLocation[];
  center: { name: string; address: string; lat: number; lng: number };
}

export default function PartnerMapView({ companies, trucks, center }: PartnerMapViewProps) {
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div style={{
        height: '320px',
        borderRadius: 'var(--radius)',
        background: 'linear-gradient(160deg,#dcecd4,#eef6e8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text-3)',
        fontSize: '13px',
      }}>
        جاري تحميل خريطة الشركاء...
      </div>
    );
  }

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: '320px', borderRadius: 'var(--radius)', zIndex: 0 }}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[center.lat, center.lng]} icon={createIcon('فرز', '#2f7b2f')}>
        <Popup>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{center.name}</div>
          <div style={{ fontSize: '11px', color: '#666' }}>{center.address}</div>
        </Popup>
      </Marker>

      {companies.map((company, index) => (
        <Marker
          key={company.id}
          position={[company.lat, company.lng]}
          icon={createIcon(`ش${index + 1}`, '#e07b2a')}
        >
          <Popup>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{company.name}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>{company.address}</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>التخصص: {company.specialty}</div>
          </Popup>
        </Marker>
      ))}

      {trucks.map((truck, index) => (
        <Marker
          key={truck.id}
          position={[truck.lat, truck.lng]}
          icon={createIcon(`شاحنة ${index + 1}`, '#1f9d8b')}
        >
          <Popup>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{truck.name}</div>
            <div style={{ fontSize: '11px', color: '#666' }}>
              {truck.status === 'loading'
                ? 'جارٍ التحميل'
                : truck.status === 'en_route'
                  ? 'في الطريق'
                  : 'تم التسليم'}
            </div>
          </Popup>
        </Marker>
      ))}

      <FitBounds companies={companies} trucks={trucks} center={center} />
    </MapContainer>
  );
}
