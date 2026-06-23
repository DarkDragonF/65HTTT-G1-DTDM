import { useState, useEffect, useCallback, useRef } from 'react';
import { createTicket, getTicketsList, getTicketDetails, addTicketComment } from '../../api/supportApi';
import { getMyOrders } from '../../api/orderApi';
import { useNotification } from '../../hooks/useNotification';
import './CustomerSupport.css';

const CustomerSupport = () => {
  const { showToast } = useNotification();
  const [tickets, setTickets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);

  // Selected Ticket Workspace
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Reply state
  const [replyMessage, setReplyMessage] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // New Ticket Form State
  const [showNewTicketForm, setShowNewTicketForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [orderId, setOrderId] = useState('');
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  const commentsEndRef = useRef(null);

  // 1. Fetch user's tickets
  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await getTicketsList();
      setTickets(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load user support tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  // 2. Fetch user's past orders for linking
  const loadOrders = useCallback(async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data?.data?.orders || []);
    } catch (error) {
      console.error('Failed to load orders for support linking:', error);
    }
  }, []);

  useEffect(() => {
    loadTickets();
    loadOrders();
  }, [loadTickets, loadOrders]);

  // 3. Load specific ticket details and comments
  const loadTicketDetails = useCallback(async (ticketId) => {
    setDetailsLoading(true);
    try {
      const res = await getTicketDetails(ticketId);
      setSelectedTicket(res.data?.data?.ticket || null);
      setComments(res.data?.data?.comments || []);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
    } finally {
      setDetailsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedTicketId) {
      loadTicketDetails(selectedTicketId);
    } else {
      setSelectedTicket(null);
      setComments([]);
    }
  }, [selectedTicketId, loadTicketDetails]);

  // Scroll comments
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Post reply
  const handlePostReply = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setIsSubmittingReply(true);
    try {
      await addTicketComment(selectedTicket.id, {
        message: replyMessage.trim(),
        isInternal: false
      });
      setReplyMessage('');
      showToast('Comment added successfully.', 'success');
      await loadTicketDetails(selectedTicket.id);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to add comment.', 'error');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Submit new ticket
  const handleCreateTicketSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setIsSubmittingTicket(true);
    try {
      const res = await createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority,
        orderId: orderId || undefined
      });
      showToast('Support ticket submitted successfully to Zoho Desk!', 'success');
      setSubject('');
      setDescription('');
      setPriority('medium');
      setOrderId('');
      setShowNewTicketForm(false);
      await loadTickets();
      // Auto-select the newly created ticket
      if (res.data?.data?.id) {
        setSelectedTicketId(res.data.data.id);
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit ticket.', 'error');
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  return (
    <div className="customer-support-view">
      <div className="support-header-section">
        <div className="header-meta">
          <h3>Helpdesk Support & Dispute Resolution</h3>
          <p>Submit inquiries, track tickets synced with Zoho Desk, and message dispute agents.</p>
        </div>
        <button 
          className="btn-primary-custom new-ticket-btn"
          onClick={() => setShowNewTicketForm(!showNewTicketForm)}
        >
          {showNewTicketForm ? '📋 View Open Tickets' : '➕ Open Support Ticket'}
        </button>
      </div>

      {showNewTicketForm ? (
        /* New Ticket submission form */
        <div className="new-ticket-form-card">
          <h4>Open a New Helpdesk Ticket</h4>
          <form onSubmit={handleCreateTicketSubmit}>
            <div className="form-group-custom">
              <label>Subject / Summary of Issue *</label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                placeholder="e.g. Cold food delivery or incorrect charges..."
                required
              />
            </div>

            <div className="form-group-row">
              <div className="form-group-custom">
                <label>Related Order (Optional)</label>
                <select value={orderId} onChange={(e) => setOrderId(e.target.value)}>
                  <option value="">-- No Related Order --</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      Order #{o.order_number} ({o.canteen_name} - {Number(o.total_price || o.total_amount).toLocaleString()} ₫)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-custom">
                <label>Priority Level</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="low">Low (Standard Question)</option>
                  <option value="medium">Medium (Order Issues)</option>
                  <option value="high">High (Payments/Accidents)</option>
                </select>
              </div>
            </div>

            <div className="form-group-custom">
              <label>Description of Complaint / Details *</label>
              <textarea 
                rows="5"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Please describe what happened, including any item specifications..."
                required
              ></textarea>
            </div>

            <div className="form-actions-row">
              <button 
                type="button" 
                className="btn-secondary-custom"
                onClick={() => setShowNewTicketForm(false)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary-custom"
                disabled={isSubmittingTicket}
              >
                {isSubmittingTicket ? 'Submitting...' : '🚀 Submit Ticket to Zoho Desk'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Workspace split layout */
        <div className="support-split-workspace">
          
          {/* Left panel: List tickets */}
          <div className="customer-tickets-pane">
            <h5>My Support Tickets</h5>
            {ticketsLoading ? (
              <div className="pane-loader">
                <div className="admin-spinner"></div>
                <span>Syncing Zoho tickets...</span>
              </div>
            ) : tickets.length === 0 ? (
              <div className="pane-empty">
                <p>You have not created any support tickets yet.</p>
              </div>
            ) : (
              <div className="tickets-cards-container">
                {tickets.map((t) => (
                  <div 
                    key={t.id}
                    className={`ticket-summary-card ${selectedTicketId === t.id ? 'active' : ''}`}
                    onClick={() => setSelectedTicketId(t.id)}
                  >
                    <div className="card-top-row">
                      <span className={`priority-tag ${t.priority}`}>
                        {t.priority?.toUpperCase()}
                      </span>
                      <span className={`status-badge-custom ${t.status}`}>
                        {t.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <strong className="card-subject">{t.subject}</strong>
                    <span className="card-date">
                      Opened: {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right panel: Details & Comments */}
          <div className="customer-details-pane">
            {selectedTicketId ? (
              detailsLoading && !selectedTicket ? (
                <div className="details-loader">
                  <div className="admin-spinner"></div>
                  <span>Loading communications...</span>
                </div>
              ) : (
                selectedTicket && (
                  <div className="ticket-details-workspace">
                    <div className="details-header">
                      <div className="title-row">
                        <h4>[Ticket #{selectedTicket.id}] {selectedTicket.subject}</h4>
                        <div className="header-status-badge">
                          <span className={`priority-tag ${selectedTicket.priority}`}>
                            {selectedTicket.priority?.toUpperCase()}
                          </span>
                          <span className={`status-badge-custom ${selectedTicket.status}`}>
                            {selectedTicket.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="details-meta-bar">
                        {selectedTicket.order_number ? (
                          <span>Associated Order: <strong>#{selectedTicket.order_number}</strong> ({selectedTicket.order_status})</span>
                        ) : (
                          <span>General Query</span>
                        )}
                        <span>Assigned Agent: <strong>{selectedTicket.assigned_to_name || 'Unassigned'}</strong></span>
                      </div>

                      <div className="original-complaint-box">
                        <strong>Issue description:</strong>
                        <p>{selectedTicket.description}</p>
                      </div>
                    </div>

                    {/* Chat timeline */}
                    <div className="chat-feed-box">
                      <h5>Conversation Trail</h5>
                      <div className="comments-scroll-area">
                        {comments.length === 0 ? (
                          <span className="no-comments-msg">No messages posted yet.</span>
                        ) : (
                          comments.map((comment) => (
                            <div 
                              key={comment.id}
                              className={`comment-bubble ${comment.user_role === 'student' || comment.user_role === 'lecturer' ? 'customer' : 'agent'}`}
                            >
                              <div className="comment-bubble-meta">
                                <strong>{comment.user_name}</strong>
                                <span className="role-label">({comment.user_role === 'student' || comment.user_role === 'lecturer' ? 'You' : 'Dispute Agent'})</span>
                                <span className="comment-time">
                                  {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="comment-message">{comment.message}</p>
                            </div>
                          ))
                        )}
                        <div ref={commentsEndRef} />
                      </div>

                      {/* Reply Input */}
                      {selectedTicket.status !== 'resolved' ? (
                        <form className="comment-reply-form" onSubmit={handlePostReply}>
                          <textarea
                            placeholder="Type your message here..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            required
                            rows="2"
                          ></textarea>
                          <button 
                            type="submit" 
                            className="btn-primary-custom send-reply-btn"
                            disabled={isSubmittingReply}
                          >
                            {isSubmittingReply ? 'Posting...' : '✉️ Send Message'}
                          </button>
                        </form>
                      ) : (
                        <div className="resolved-ticket-notification">
                          ✔️ This ticket has been marked as resolved. Conversation is closed.
                        </div>
                      )}
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="empty-details-view">
                <span className="empty-emoji">🎫</span>
                <p>Select a ticket from the left panel or click "Open Support Ticket" above to seek help.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};

export default CustomerSupport;
