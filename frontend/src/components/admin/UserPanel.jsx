import React from 'react';
import { FaTimes, FaCheck, FaBan, FaEdit, FaTrash } from 'react-icons/fa';
import { mkInitials } from '../../utils/utils';

export default function UserPanel({ 
  panel, setPanel, users, updateUserStatus, setUserModal, setConfirm, deleteUser 
}) {
  if (!panel.open || panel.type !== 'user' || !panel.data) return null;

  const u = users.find(x => x.id === panel.data.id) || panel.data;

  return (
    <>
      <div className={`ap-overlay ${panel.open ? 'open' : ''}`} onClick={() => setPanel(p => ({ ...p, open: false }))} />
      <div className={`ap-panel ${panel.open ? 'open' : ''}`}>
        <div className="ap-panel-head">
          <div className="ap-panel-title">{u.name}</div>
          <button className="ap-panel-close" onClick={() => setPanel(p => ({ ...p, open: false }))}>
            <FaTimes />
          </button>
        </div>
        <div className="ap-panel-body">
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 13, 
            padding: '14px', 
            background: 'var(--off)', 
            border: '1px solid var(--border-l)', 
            borderRadius: 'var(--r)' 
          }}>
            <div className="ap-user-av" style={{ width: 44, height: 44, fontSize: '1rem' }}>
              {mkInitials(u.name)}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--black)', fontSize: '.9rem' }}>{u.name}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{u.email}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className={`ap-pill ap-pill-${u.role}`}>{u.role}</span>
            </div>
          </div>

          <div>
            <span className="ap-psec">Account Details</span>
            {[
              ['Status', u.status],
              ['Phone', u.phone],
              ['Joined', u.joined],
              ...(u.role === 'owner' 
                ? [['Properties', u.properties], ['Units', u.units]] 
                : [['Trips', u.trips], ['Vehicle', u.vehicle]]
              )
            ].map(([l, v]) => (
              <div key={l} className="ap-ir">
                <span className="ap-ir-l">{l}</span>
                <span className="ap-ir-v">
                  {l === 'Status' ? <span className={`ap-pill ap-pill-${v}`}>{v}</span> : v}
                </span>
              </div>
            ))}
          </div>

          <div>
            <span className="ap-psec">Actions</span>
            <div className="ap-prow">
              {u.status !== 'active' && (
                <button className="ap-btn ap-btn-success ap-btn-sm" onClick={() => updateUserStatus(u.id, 'active')}>
                  <FaCheck /> Activate
                </button>
              )}
              {u.status !== 'suspended' && (
                <button className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => updateUserStatus(u.id, 'suspended')}>
                  <FaBan /> Suspend
                </button>
              )}
              <button 
                className="ap-btn ap-btn-outline ap-btn-sm" 
                onClick={() => {
                  setPanel(p => ({ ...p, open: false }));
                  setUserModal({ open: true, mode: 'edit', data: { ...u } });
                }}
              >
                <FaEdit /> Edit
              </button>
              <button 
                className="ap-btn ap-btn-danger ap-btn-sm" 
                onClick={() => setConfirm({
                  open: true,
                  icon: '🗑️',
                  title: 'Delete User?',
                  desc: `${u.name} will be permanently removed.`,
                  onOk: () => deleteUser(u.id)
                })}
              >
                <FaTrash /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}