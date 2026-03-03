import React, { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import '../../styles/RatingModal.css';

const RatingModal = ({ isOpen, onClose, order, onSubmitRating }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [categories, setCategories] = useState({
    punctuality: 0,
    professionalism: 0,
    carCondition: 0,
    communication: 0,
  });
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleCategoryRating = (category, value) => {
    setCategories((prev) => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRating({
        orderId: order._id,
        rating,
        comment: comment.trim(),
        categories,
        isAnonymous,
      });
      
      // Reset form
      setRating(0);
      setComment('');
      setCategories({
        punctuality: 0,
        professionalism: 0,
        carCondition: 0,
        communication: 0,
      });
      setIsAnonymous(false);
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert(error.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (value, onClickHandler, hoverHandler = null) => {
    return (
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={`star ${star <= (hoverHandler ? hoveredRating : value) ? 'filled' : ''}`}
            onClick={() => onClickHandler(star)}
            onMouseEnter={() => hoverHandler && hoverHandler(star)}
            onMouseLeave={() => hoverHandler && hoverHandler(0)}
          />
        ))}
      </div>
    );
  };

  const categoryLabels = {
    punctuality: 'Punctuality',
    professionalism: 'Professionalism',
    carCondition: 'Vehicle Condition',
    communication: 'Communication',
  };

  return (
    <div className="rating-modal-overlay" onClick={onClose}>
      <div className="rating-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rating-modal-header">
          <h2>Rate Your Driver</h2>
          <button className="rating-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="rating-modal-body">
          <div className="rating-driver-info">
            <p className="rating-label">Order: {order.pickupAddress} → {order.dropoffAddress}</p>
            {order.driver?.user && (
              <p className="rating-driver-name">Driver: {order.driver.user.fullName}</p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {/* Overall Rating */}
            <div className="rating-section">
              <label className="rating-label">Overall Rating *</label>
              {renderStars(rating, handleStarClick, setHoveredRating)}
              <p className="rating-value">{rating > 0 ? `${rating} / 5` : 'Select rating'}</p>
            </div>

            {/* Category Ratings */}
            <div className="rating-section">
              <label className="rating-label">Rate by Category (Optional)</label>
              {Object.keys(categories).map((category) => (
                <div key={category} className="rating-category">
                  <span className="category-name">{categoryLabels[category]}</span>
                  {renderStars(categories[category], (value) =>
                    handleCategoryRating(category, value)
                  )}
                </div>
              ))}
            </div>

            {/* Comment */}
            <div className="rating-section">
              <label className="rating-label" htmlFor="comment">
                Comment (Optional)
              </label>
              <textarea
                id="comment"
                className="rating-textarea"
                placeholder="Share your experience..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                maxLength={500}
                rows={4}
              />
              <p className="rating-char-count">{comment.length} / 500</p>
            </div>

            {/* Anonymous Option */}
            <div className="rating-section">
              <label className="rating-checkbox">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                />
                <span>Submit anonymously</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="rating-modal-footer">
              <button
                type="button"
                className="rating-btn rating-btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rating-btn rating-btn-submit"
                disabled={isSubmitting || rating === 0}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
