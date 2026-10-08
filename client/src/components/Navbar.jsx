import React from 'react';
import { Package, RotateCcw, Database } from 'lucide-react';

export default function Navbar({ dbInfo, onResetSampleData, isSeeding }) {
  const getBadgeStyle = () => {
    if (!dbInfo) return {};
    if (dbInfo.type === 'mongodb') {
      return { borderColor: '#10b981', color: '#34d399' };
    }
    if (dbInfo.type === 'mysql') {
      return { borderColor: '#3b82f6', color: '#60a5fa' };
    }
    return { borderColor: '#f59e0b', color: '#fbbf24' };
  };

  const getDbLabel = () => {
    if (!dbInfo) return 'Checking DB...';
    if (dbInfo.type === 'mongodb') return 'MongoDB (Mongoose)';
    if (dbInfo.type === 'mysql') return 'MySQL Database';
    return 'Embedded JSON Storage';
  };

  return (
    <header className="navbar">
      <div className="brand-wrapper">
        <div className="brand-icon">
          <Package size={24} />
        </div>
        <div>
          <h1 className="brand-title">ProductHub</h1>
          <span className="brand-subtitle">
            Full-Stack MVC Web Application (Node.js &bull; Express.js &bull; React.js &bull; MongoDB/MySQL)
          </span>
        </div>
      </div>

      <div className="nav-actions">
        {/* Active Database Engine Badge */}
        <div className="db-badge" style={getBadgeStyle()} title={dbInfo?.message || 'Database status'}>
          <span className="db-indicator" style={{ backgroundColor: getBadgeStyle().color }}></span>
          <Database size={13} style={{ marginLeft: 2 }} />
          <span>{getDbLabel()}</span>
        </div>

        {/* Reload Demo Data button */}
        <button
          className="btn btn-secondary btn-sm"
          onClick={onResetSampleData}
          disabled={isSeeding}
          title="Reload fresh sample products into database"
        >
          <RotateCcw size={14} className={isSeeding ? 'spin' : ''} />
          <span>{isSeeding ? 'Reloading...' : 'Reset Demo Data'}</span>
        </button>
      </div>
    </header>
  );
}
