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

    collections.forEach((c) => {
      const d = new Date(c.timestamp);
      if (d.getMonth() in monthTotals) {
        monthTotals[d.getMonth()] += c.weight / 1000;
      }
    });

    const sortedMonths = Object.keys(monthTotals).map(Number).sort((a, b) => a - b);
    const months = sortedMonths.map((m) => monthNames[m]);
    const vals = sortedMonths.map((m) => Math.round(monthTotals[m] * 10) / 10);

    const materialWeights: Record<string, number> = {};
    collections.forEach((c) => {
      c.materials.forEach((matId) => {
        materialWeights[matId] = (materialWeights[matId] || 0) + c.weight;
      });
    });

    const totalMatWeight = Object.values(materialWeights).reduce((a, b) => a + b, 0) || 1;
    const materialDist = materials
      .map((m) => ({
        m: m.name,
        p: Math.round(((materialWeights[m.id] || 0) / totalMatWeight) * 100),
        c: m.color,
      }))
      .filter((x) => x.p > 0);

    return { months, vals, materialDist };
  }, [collections, materials]);

  const maxV = Math.max(...vals, 1);

  return (
    <>
      <div className="card">
        <div className="card-header">
          <span className="card-title">إجمالي المواد المفروزة (طن)</span>
          <span className="text-sm">آخر ٦ أشهر</span>
        </div>
        {vals.length > 0 ? (
          <>
            <div className="bar-chart">
              {vals.map((v, i) => (
                <div
                  key={i}
                  className="bar"
                  style={{
                    height: `${Math.round((v / maxV) * 100)}%`,
                    background: i === vals.length - 1 ? 'var(--green-mid)' : 'var(--green-50)',
                    border: `1.5px solid ${i === vals.length - 1 ? 'var(--green-600)' : 'var(--border)'}`,
                  }}
                />
              ))}
            </div>
            <div className="bar-labels">
              {months.map((m, i) => (
                <div className="bar-label" key={i}>{m}</div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-sm" style={{ textAlign: 'center', padding: '24px' }}>لا توجد بيانات بعد</div>
        )}
        <div className="flex-between" style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border)' }}>
          <span className="text-sm">إجمالي الفترة</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--green-mid)' }}>
            {vals.reduce((a, b) => a + b, 0)} طن
          </span>
        </div>
      </div>
      {materialDist.length > 0 && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">توزيع المواد</span>
          </div>
          {materialDist.map((x, i) => (
            <div style={{ marginBottom: '10px' }} key={i}>
              <div className="flex-between" style={{ marginBottom: '4px' }}>
                <span style={{ fontSize: '13px' }}>{x.m}</span>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{x.p}%</span>
              </div>
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: `${x.p}%`, background: x.c }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
