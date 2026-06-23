import { useState } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { submitFeedback } from '../../api/feedbackApi';
import './Feedback.css';

const Feedback = () => {
  const { showToast } = useNotification();
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState('');
  const [canteenName, setCanteenName] = useState('All Canteens');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formsUrl = 'https://forms.zohopublic.com/bbruh1/form/DeliveryFeedback/formperma/xL9ewWkVWWRl6w1qC41gg_HmhdP_S3rNTn_VaeNg8mg';
  const isMockMode = false;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await submitFeedback({ canteenName, rating, comments });
      showToast('Thank you! Your feedback has been submitted successfully.', 'success');
      setComments('');
      setRating(5);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit feedback', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="student-feedback animate-fade-in">
      <div className="feedback-header">
        <h2>Customer Feedback</h2>
        <p>Help us improve our service by sharing your dining experience.</p>
      </div>

      <div className="feedback-content-card">
        {isMockMode ? (
          <form className="mock-feedback-form" onSubmit={handleSubmit}>
            <div className="form-group-feedback">
              <label>Select Canteen</label>
              <select 
                value={canteenName} 
                onChange={(e) => setCanteenName(e.target.value)}
                className="feedback-input"
              >
                <option value="All Canteens">All Canteens (General Feedback)</option>
                <option value="Canteen A">Canteen A (Main Hall)</option>
                <option value="Canteen B">Canteen B (Engineering Building)</option>
                <option value="Canteen C">Canteen C (Library Block)</option>
              </select>
            </div>

            <div className="form-group-feedback">
              <label>Your Rating</label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-button ${rating >= star ? 'active' : ''}`}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group-feedback">
              <label>Comments & Suggestions</label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="What did you like? What can we do better?"
                className="feedback-input feedback-textarea"
                required
              />
            </div>

            <button type="submit" className="feedback-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        ) : (
          <div className="zoho-iframe-container">
            <iframe
              src={formsUrl}
              width="100%"
              height="650px"
              style={{ border: 'none' }}
              title="Zoho Feedback Form"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
