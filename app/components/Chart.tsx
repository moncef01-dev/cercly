'use client';

import { useMemo } from 'react';
import { useStore } from '../lib/store';

const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

export default function Chart() {
  const collections = useStore((s) => s.collections);
  const materials = useStore((s) => s.materials);

  const { months, vals, materialDist } = useMemo(() => {
    const now = new Date();
    const monthTotals: Record<number, number> = {};

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      monthTotals[d.getMonth()] = 0;
    }

    // Standardized to KG directly (no division by 1000)
    collections.forEach((c) => {
      const d = new Date(c.timestamp);
      if (d.getMonth() in monthTotals) {
        monthTotals[d.getMonth()] += c.weight;
      }
    });

    const sortedMonths = Object.keys(monthTotals).map(Number).sort((a, b) => a - b);
    const months = sortedMonths.map((m) => monthNames[m]);
    const vals = sortedMonths.map((m) => Math.round(monthTotals[m]));

    const materialWeights: Record<string, number> = {};
    collections.forEach((c) => {
      c.materials.forEach((matId) => {
        materialWeights[matId] = (materialWeights[matId] || 0) + c.weight;
      });
    });

    const totalMatWeight = Object.values(materialWeights).reduce((a, b) => a + b, 0) || 1;

    // Map material colors strictly to brand system: Primary Green, Light Green, Gold
    const brandMaterialColors: Record<string, string> = {
      plastic: 'var(--primary-green)',
      carton: 'var(--light-green)',
      battery: 'var(--gold)',
      printer_cartridge: 'var(--gold)',
      ink_cartridge: 'var(--light-green)',
    };

    const materialDist = materials
      .map((m) => ({
        m: m.name,
        p: Math.round(((materialWeights[m.id] || 0) / totalMatWeight) * 100),
        c: brandMaterialColors[m.id] || 'var(--primary-green)',
      }))
      .filter((x) => x.p > 0);

    return { months, vals, materialDist };
  }, [collections, materials]);

  const maxV = Math.max(...vals, 1);

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">إجمالي المواد المفروزة (كجم)</span>
          <span className="text-sm">آخر ٦ أشهر</span>
        </div>
        {vals.length > 0 ? (
          <>
            <div className="bar-chart" style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '110px' }}>
              {vals.map((v, i) => (
                <div
                  key={i}
                  className="bar shimmer"
                  style={{
                    height: `${Math.round((v / maxV) * 100)}%`,
                    background: i === vals.length - 1 ? 'var(--primary-green)' : 'var(--light-green)',
                    border: `1.5px solid var(--primary-green)`,
                    flex: 1,
                    borderRadius: '6px 6px 0 0',
                    transition: 'all 0.4s ease',
                    cursor: 'pointer',
                  }}
                  title={`${v} كجم`}
                />
              ))}
            </div>
            <div className="bar-labels" style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              {months.map((m, i) => (
                <div className="bar-label" key={i} style={{ flex: 1, textAlign: 'center', fontSize: '10px', color: 'var(--text-dark)', opacity: 0.8, fontWeight: 700 }}>{m}</div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state" style={{ padding: '20px' }}>
            <span style={{ fontSize: '24px' }}>📊</span>
            <div className="text-sm">لا توجد بيانات حالياً</div>
          </div>
        )}
        <div className="flex-between" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--surface)' }}>
          <span className="text-sm">إجمالي الفترة</span>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--primary-green)' }}>
            {vals.reduce((a, b) => a + b, 0).toLocaleString()} كجم
          </span>
        </div>
      </div>
      {materialDist.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">توزيع المواد</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {materialDist.map((x, i) => (
              <div key={i}>
                <div className="flex-between" style={{ marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-dark)' }}>{x.m}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-green)' }}>{x.p}%</span>
                </div>
                <div className="prog-bar">
                  <div className="prog-fill" style={{ width: `${x.p}%`, background: x.c }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
