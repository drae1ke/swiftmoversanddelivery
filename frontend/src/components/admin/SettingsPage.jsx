import React from 'react';

export default function SettingsPage({ active, settings, setSettings, toast }) {
  if (!active) return null;

  const toggleSetting = (key, label) => {
    setSettings(s => ({ ...s, [key]: !s[key] }));
    toast(`${label} ${!settings[key] ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="ap-page active">
      <div className="ap-page-header">
        <div className="ap-tag">System</div>
        <h1 className="ap-page-title">Platform <span>Settings</span></h1>
        <p className="ap-page-desc">Configure system behaviour, access controls, and notifications.</p>
      </div>
      <div className="ap-settings-grid">
        <div className="ap-setting-card">
          <div className="ap-setting-title">Platform Mode</div>
          <div className="ap-setting-desc">Control overall system availability and maintenance mode.</div>
          <div className="ap-toggle-row">
            <span className="ap-toggle-lbl">Maintenance Mode</span>
            <label className="ap-toggle">
              <input 
                type="checkbox" 
                checked={settings.maintenance} 
                onChange={() => toggleSetting('maintenance', 'Maintenance Mode')} 
              />
              <span className="ap-toggle-slider" />
            </label>
          </div>
          <div className="ap-toggle-row">
            <span className="ap-toggle-lbl">Open Registrations</span>
            <label className="ap-toggle">
              <input 
                type="checkbox" 
                checked={settings.registrations} 
                onChange={() => toggleSetting('registrations', 'Open Registrations')} 
              />
              <span className="ap-toggle-slider" />
            </label>
          </div>
        </div>

        <div className="ap-setting-card">
          <div className="ap-setting-title">Notifications</div>
          <div className="ap-setting-desc">Manage system and user notification delivery settings.</div>
          <div className="ap-toggle-row">
            <span className="ap-toggle-lbl">System Notifications</span>
            <label className="ap-toggle">
              <input 
                type="checkbox" 
                checked={settings.notifications} 
                onChange={() => toggleSetting('notifications', 'System Notifications')} 
              />
              <span className="ap-toggle-slider" />
            </label>
          </div>
          <div className="ap-toggle-row">
            <span className="ap-toggle-lbl">Audit Logging</span>
            <label className="ap-toggle">
              <input 
                type="checkbox" 
                checked={settings.auditLog} 
                onChange={() => toggleSetting('auditLog', 'Audit Logging')} 
              />
              <span className="ap-toggle-slider" />
            </label>
          </div>
        </div>

        <div className="ap-setting-card">
          <div className="ap-setting-title">Security</div>
          <div className="ap-setting-desc">Authentication and access security configurations.</div>
          <div className="ap-toggle-row">
            <span className="ap-toggle-lbl">Two-Factor Auth (Admin)</span>
            <label className="ap-toggle">
              <input 
                type="checkbox" 
                checked={settings.twoFactor} 
                onChange={() => toggleSetting('twoFactor', 'Two-Factor Auth')} 
              />
              <span className="ap-toggle-slider" />
            </label>
          </div>
          <div className="ap-toggle-row">
            <span className="ap-toggle-lbl">Auto Backup (Nightly)</span>
            <label className="ap-toggle">
              <input 
                type="checkbox" 
                checked={settings.autoBackup} 
                onChange={() => toggleSetting('autoBackup', 'Auto Backup')} 
              />
              <span className="ap-toggle-slider" />
            </label>
          </div>
        </div>

        <div className="ap-dz" style={{ gridColumn: '1/-1' }}>
          <div className="ap-dz-title">Danger Zone</div>
          <div className="ap-dz-row">
            <div className="ap-dz-desc">
              Reset all platform data to factory defaults. This will permanently delete all users, properties, and trip records.
            </div>
            <button 
              className="ap-btn ap-btn-danger ap-btn-sm" 
              onClick={() => toast('Factory reset requires secondary admin approval.', 'error')}
            >
              Factory Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}