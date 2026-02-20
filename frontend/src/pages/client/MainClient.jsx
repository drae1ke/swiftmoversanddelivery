import React, { useState, useEffect } from 'react';
import '../../styles/ClientDashboard.css';
import Sidebar from '../../components/client/Sidebar';
import Topbar from '../../components/client/Topbar';
import Services from './Services';
import Delivery from './Delivery';
import Relocation from './Relocation';
import Cargo from './Cargo';
import Storage from './Storage';
import StorageBook from './StorageBook';
import Tracking from './Tracking ';
import Profile from './Profile';
import LogoutModal from '../../components/client/LogoutModal';

function  MainClient () {
  const [currentPage, setCurrentPage] = useState('services');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const d = new Date();
    setCurrentDate(d.toLocaleDateString('en-KE', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }));
  }, []);

  const handleShowPage = (pageId) => {
    setCurrentPage(pageId);
    setSidebarOpen(false);
    window.scrollTo(0, 0);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    // In a real app: clear session, redirect to login
    alert('Logged out successfully');
  };

  const closeLogout = () => {
    setShowLogoutModal(false);
  };

  const pages = {
    services: 'My Services',
    delivery: 'Delivery Request',
    relocation: 'Relocation',
    cargo: 'Cargo Transport',
    storage: 'Storage Spaces',
    'storage-book': 'Book Storage',
    tracking: 'Track Shipment',
    profile: 'My Profile',
  };

  return (
    <div className="shell">
      <Sidebar 
        currentPage={currentPage}
        onShowPage={handleShowPage}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
      />
      
      <div 
        className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} 
        onClick={closeSidebar}
      ></div>

      <div className="main">
        <Topbar 
          title={pages[currentPage]}
          date={currentDate}
          onToggleSidebar={toggleSidebar}
        />

        <Services 
          isActive={currentPage === 'services'} 
          onShowPage={handleShowPage}
        />
        
        <Delivery 
          isActive={currentPage === 'delivery'} 
          onShowPage={handleShowPage}
        />
        
        <Relocation 
          isActive={currentPage === 'relocation'} 
          onShowPage={handleShowPage}
        />
        
        <Cargo 
          isActive={currentPage === 'cargo'} 
          onShowPage={handleShowPage}
        />
        
        <Storage 
          isActive={currentPage === 'storage'} 
          onShowPage={handleShowPage}
        />
        
        <StorageBook 
          isActive={currentPage === 'storage-book'} 
          onShowPage={handleShowPage}
        />
        
        <Tracking 
          isActive={currentPage === 'tracking'} 
          onShowPage={handleShowPage}
        />
        
        <Profile 
          isActive={currentPage === 'profile'} 
          onShowPage={handleShowPage}
        />
      </div>

      <LogoutModal 
        isOpen={showLogoutModal}
        onClose={closeLogout}
        onConfirm={confirmLogout}
      />
    </div>
  );
}

export default MainClient;