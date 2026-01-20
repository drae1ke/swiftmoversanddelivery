import React, { useEffect, useState } from 'react';
import '../styles/OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulated API call - replace with your actual API
    const fetchOrders = async () => {
      try {
        // const response = await fetch('/api/orders');
        // const data = await response.json();
        
        // Demo data
        const demoOrders = [
          {
            _id: '1',
            date: new Date('2026-01-10'),
            service: 'Delivery',
            status: 'Delivered',
            from: 'Nairobi',
            to: 'Mombasa'
          },
          {
            _id: '2',
            date: new Date('2026-01-12'),
            service: 'Moving',
            status: 'In Transit',
            from: 'Kisumu',
            to: 'Nakuru'
          },
          {
            _id: '3',
            date: new Date('2026-01-14'),
            service: 'Delivery',
            status: 'Pending',
            from: 'Eldoret',
            to: 'Nairobi'
          }
        ];
        
        setOrders(demoOrders);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'status-delivered';
      case 'in transit':
        return 'status-in-transit';
      case 'pending':
        return 'status-pending';
      default:
        return '';
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'fa-check-circle';
      case 'in transit':
        return 'fa-truck';
      case 'pending':
        return 'fa-clock';
      default:
        return 'fa-box';
    }
  };

  if (loading) {
    return (
      <div className="order-history-loading">
        <i className="fas fa-spinner fa-spin"></i>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-header">
        <h2 className="order-history-title">Order History</h2>
        <p className="order-history-subtitle">Track all your deliveries</p>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <i className="fas fa-box-open"></i>
          <p>No orders yet</p>
        </div>
      ) : (
        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Route</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} className="order-row">
                  <td className="order-date">
                    {new Date(order.date).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <span className="service-badge">{order.service}</span>
                  </td>
                  <td className="order-route">
                    <i className="fas fa-map-marker-alt route-icon"></i>
                    {order.from} → {order.to}
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      <i className={`fas ${getStatusIcon(order.status)}`}></i>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="view-button">
                      <i className="fas fa-eye"></i> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;