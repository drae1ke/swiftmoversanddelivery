import React from 'react';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import { mkInitials } from '../../utils/utils';

export default function UsersPage({ 
  active, users, filtUsers, userSearch, setUserSearch, 
  userFilter, setUserFilter, setPanel, setUserModal, setConfirm, deleteUser 
}) {
  if (!active) return null;

  const filters = ['all', 'owner', 'driver', 'active', 'pending', 'suspended'];

  return (
    <div className="ap-page active">
      <div className="ap-page-header">
        <div className="ap-tag">Management</div>
        <h1 className="ap-page-title">All <span>Users</span></h1>
        <p className="ap-page-desc">Manage owners, drivers, and their account status.</p>
      </div>
      <div className="ap-toolbar">
        <div className="ap-search-wrap">
          <span className="ap-search-icon"><FaSearch size={12} /></span>
          <input 
            placeholder="Search users…" 
            value={userSearch} 
            onChange={e => setUserSearch(e.target.value)} 
          />
        </div>
        <div className="ap-filter-tabs">
          {filters.map(f => (
            <button 
              key={f} 
              className={`ap-tab ${userFilter === f ? 'active' : ''}`} 
              onClick={() => setUserFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <button 
          className="ap-btn ap-btn-primary" 
          onClick={() => setUserModal({
            open: true,
            mode: 'add',
            data: { name: '', email: '', phone: '', role: 'owner', status: 'active' }
          })}
        >
          ＋ Add User
        </button>
      </div>
      <div className="ap-card">
        <div className="ap-table-wrap">
          <table className="ap-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtUsers.map(u => (
                <tr key={u.id} onClick={() => setPanel({ open: true, type: 'user', data: u })}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div className="ap-user-av">{mkInitials(u.name)}</div>
                      <div>
                        <div className="ap-td-name">{u.name}</div>
                        <div className="ap-td-sub">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`ap-pill ap-pill-${u.role}`}>{u.role}</span></td>
                  <td><span className={`ap-pill ap-pill-${u.status}`}>{u.status}</span></td>
                  <td style={{ color: 'var(--muted)', fontSize: '.8rem' }}>{u.joined}</td>
                  <td>
                    <div className="ap-td-actions" onClick={e => e.stopPropagation()}>
                      <button 
                        className="ap-btn ap-btn-outline ap-btn-xs" 
                        onClick={e => {
                          e.stopPropagation();
                          setUserModal({ open: true, mode: 'edit', data: { ...u } });
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="ap-btn ap-btn-danger ap-btn-xs" 
                        onClick={e => {
                          e.stopPropagation();
                          setConfirm({
                            open: true,
                            icon: '🗑️',
                            title: 'Delete User?',
                            desc: `${u.name} will be permanently removed.`,
                            onOk: () => deleteUser(u.id)
                          });
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtUsers.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <div className="ap-empty">No users match your filter.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}