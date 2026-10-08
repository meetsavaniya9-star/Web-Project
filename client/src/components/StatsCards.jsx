import React from 'react';
import { Layers, DollarSign, AlertTriangle, AlertOctagon } from 'lucide-react';

export default function StatsCards({ stats }) {
  const {
    totalProducts = 0,
    totalInventoryValue = 0,
    lowStockCount = 0,
    outOfStockCount = 0
  } = stats || {};

  return (
    <section className="stats-grid" aria-label="Inventory Overview Statistics">
      {/* Total Products */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
          <Layers size={24} />
        </div>
        <div>
          <div className="stat-value">{totalProducts}</div>
          <div className="stat-label">Total Products</div>
        </div>
      </div>

      {/* Inventory Value */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          <DollarSign size={24} />
        </div>
        <div>
          <div className="stat-value">
            ${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="stat-label">Total Inventory Value</div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
          <AlertTriangle size={24} />
        </div>
        <div>
          <div className="stat-value">{lowStockCount}</div>
          <div className="stat-label">Low Stock Alerts (≤5)</div>
        </div>
      </div>

      {/* Out of Stock Alerts */}
      <div className="stat-card">
        <div className="stat-icon-wrapper" style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
          <AlertOctagon size={24} />
        </div>
        <div>
          <div className="stat-value">{outOfStockCount}</div>
          <div className="stat-label">Out of Stock Items</div>
        </div>
      </div>
    </section>
  );
}
