import React from 'react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="logout-modal" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,.5)',
        zIndex: 999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 'var(--r-lg)',
        padding: '40px',
        maxWidth: '380px',
        width: '90%',
        textAlign: 'center',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>⎋</div>
        <div style={{
          fontFamily: 'var(--font-d)',
          fontSize: '1.2rem',
          fontWeight: 800,
          marginBottom: '10px'
        }}>
          Log Out?
        </div>
        <p style={{
          fontSize: '.88rem',
          color: 'var(--muted)',
          lineHeight: 1.6,
          marginBottom: '28px'
        }}>
          You'll need to sign in again to access your portal. Your data is always saved.
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="btn btn-outline" 
            style={{ flex: 1, justifyContent: 'center' }}
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            style={{ flex: 1, justifyContent: 'center', background: '#dd3333' }}
            onClick={onConfirm}
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;