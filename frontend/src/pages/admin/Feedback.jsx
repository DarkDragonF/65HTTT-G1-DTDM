import { useState, useEffect, useCallback } from 'react';
import { getFeedbackList } from '../../api/adminApi';
import { useNotification } from '../../hooks/useNotification';
import './Feedback.css';

const Feedback = () => {
  const { showToast } = useNotification();
  const [feedbackList, setFeedbackList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadFeedback = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await getFeedbackList();
      setFeedbackList(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load feedback logs:', error);
      showToast('Failed to load customer feedback logs.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadFeedback();
  }, [loadFeedback]);

  return (
    <div className="admin-feedback-view animate-fade-in">
      <div className="feedback-header-section">
        <h3>Customer Feedback</h3>
        <p>Monitor customer ratings, comments, and reviews submitted directly or via Zoho Forms</p>
      </div>

      <div className="feedback-list-card">
        {isLoading ? (
          <div className="admin-loading-container">
            <div className="admin-spinner"></div>
            <p>Loading customer reviews and feedback logs...</p>
          </div>
        ) : feedbackList.length === 0 ? (
          <div className="no-data-msg">
            <p>No customer feedback has been submitted yet.</p>
          </div>
        ) : (
          <div className="feedback-reports-container">
            <div className="admin-table-wrapper">
              <table className="admin-data-table">
                <thead>
                  <tr>
                    <th style={{ width: '180px' }}>Date & Time</th>
                    <th style={{ width: '150px' }}>Canteen</th>
                    <th style={{ width: '120px' }}>Rating</th>
                    <th>Comments & Suggestions</th>
                    <th style={{ width: '220px' }}>User Email</th>
                    <th style={{ width: '120px' }}>Source</th>
                  </tr>
                </thead>
                <tbody>
                  {feedbackList.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span className="feedback-date">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </td>
                      <td>
                        <strong>{item.canteen_name}</strong>
                      </td>
                      <td>
                        <div className="feedback-rating-display">
                          {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                        </div>
                      </td>
                      <td>
                        <div className="feedback-comments-text">
                          {item.comments}
                        </div>
                      </td>
                      <td>
                        <span className="feedback-email">{item.user_email || 'Anonymous'}</span>
                      </td>
                      <td>
                        <span className={`source-badge ${item.source}`}>
                          {item.source === 'zoho_forms' ? 'Zoho Forms' : 'Direct'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Feedback;
