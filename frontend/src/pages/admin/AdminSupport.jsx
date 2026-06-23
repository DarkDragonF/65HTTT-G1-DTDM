import { useState, useEffect, useCallback, useRef } from 'react';
import { getTicketsList, getTicketDetails, addTicketComment, escalateTicket, resolveTicket } from '../../api/supportApi';
import { useNotification } from '../../hooks/useNotification';
import './AdminSupport.css';

const AdminSupport = () => {
  const { showToast } = useNotification();
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // New Comment state
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const commentsEndRef = useRef(null);

  // 1. Fetch tickets list
  const loadTickets = useCallback(async () => {
    setTicketsLoading(true);
    try {
      const res = await getTicketsList({
        status: statusFilter || undefined,
        priority: priorityFilter || undefined
      });
      setTickets(res.data?.data || []);
    } catch (error) {
      console.error('Failed to load support tickets:', error);
    } finally {
      setTicketsLoading(false);
    }
  }, [statusFilter, priorityFilter]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // 2. Fetch specific ticket details + comments
  const loadTicketDetails = useCallback(async (ticketId) => {
    setDetailsLoading(true);
    try {
      const res = await getTicketDetails(ticketId);
      setSelectedTicket(res.data?.data?.ticket || null);
      setComments(res.data?.data?.comments || []);
    } catch (error) {
      console.error('Failed to fetch ticket details:', error);
      showToast('Could not retrieve details for this ticket.', 'error');
    } finally {
      setDetailsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (selectedTicketId) {
      loadTicketDetails(selectedTicketId);
    } else {
      setSelectedTicket(null);
      setComments([]);
    }
  }, [selectedTicketId, loadTicketDetails]);

  // Scroll to bottom on new comments
  useEffect(() => {
    if (commentsEndRef.current) {
      commentsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [comments]);

  // Actions
  const handleEscalate = async () => {
    if (!selectedTicket) return;
    try {
      await escalateTicket(selectedTicket.id);
      showToast('Ticket escalated to L2 Super Admin.', 'warning');
      await loadTicketDetails(selectedTicket.id);
      await loadTickets();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to escalate ticket.', 'error');
    }
  };

  const handleResolve = async () => {
    if (!selectedTicket) return;
    try {
      await resolveTicket(selectedTicket.id);
      showToast('Ticket marked as resolved.', 'success');
      await loadTicketDetails(selectedTicket.id);
      await loadTickets();
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to resolve ticket.', 'error');
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!selectedTicket || !newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await addTicketComment(selectedTicket.id, {
        message: newComment.trim(),
        isInternal: isInternal
      });
      setNewComment('');
      setIsInternal(false);
      showToast('Comment posted successfully.', 'success');
      // Reload comments
      await loadTicketDetails(selectedTicket.id);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to post comment.', 'error');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  return (
    <div className="admin-support-view">
      <div className="support-header-bar">
        <h3>Customer Helpdesk & Support Tickets</h3>
        <p>Manage customer issues, dispute escalations, canteen complaints, and log communications.</p>
      </div>

      <div className="support-workspace-layout">
        
        {/* Left pane: Tickets List */}
        <div className="support-tickets-pane">
          <div className="pane-filters">
            <div className="filter-group">
              <label>Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="escalated">Escalated</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Priority</label>
              <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          {ticketsLoading ? (
            <div className="pane-loading">
              <div className="admin-spinner"></div>
              <span>Searching customer dossiers...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="pane-empty">
              <span>No tickets match filters.</span>
            </div>
          ) : (
            <div className="tickets-cards-list">
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
                  <div className="card-meta">
                    <span>User: {t.user_name}</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right pane: Selected Ticket Details & Chat */}
        <div className="support-details-pane">
          {selectedTicketId ? (
            detailsLoading && !selectedTicket ? (
              <div className="details-pane-loading">
                <div className="admin-spinner"></div>
                <span>Syncing message logs...</span>
              </div>
            ) : (
              selectedTicket && (
                <div className="ticket-workspace">
                  {/* Detailed metadata */}
                  <div className="ticket-workspace-header">
                    <div className="title-row">
                      <h4>[Ticket #{selectedTicket.id}] {selectedTicket.subject}</h4>
                      <div className="header-status-badge">
                        <span className={`priority-tag ${selectedTicket.priority}`}>
                          {selectedTicket.priority?.toUpperCase()} Priority
                        </span>
                        <span className={`status-badge-custom ${selectedTicket.status}`}>
                          {selectedTicket.status?.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <div className="meta-grid">
                      <div className="meta-item">
                        <span className="meta-label">Submitted By:</span>
                        <strong>{selectedTicket.user_name}</strong>
                        <span>({selectedTicket.user_email})</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Associated Order:</span>
                        {selectedTicket.order_number ? (
                          <span>
                            <strong>#{selectedTicket.order_number}</strong> 
                            <span className="order-status-subtag">({selectedTicket.order_status})</span>
                          </span>
                        ) : (
                          <span>— No Order Linked</span>
                        )}
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Assigned Agent:</span>
                        <span>{selectedTicket.assigned_to_name || 'Unassigned'}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Created On:</span>
                        <span>{new Date(selectedTicket.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="ticket-description-box">
                      <strong>Issue Details:</strong>
                      <p>{selectedTicket.description}</p>
                    </div>

                    {/* Action buttons */}
                    {selectedTicket.status !== 'resolved' && (
                      <div className="ticket-ops-buttons">
                        {selectedTicket.status !== 'escalated' && (
                          <button className="btn-action-escalate" onClick={handleEscalate}>
                            ⚠️ Escalate to L2 Super Admin
                          </button>
                        )}
                        <button className="btn-action-resolve" onClick={handleResolve}>
                          ✔️ Mark as Resolved
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Comments feed */}
                  <div className="ticket-chat-feed">
                    <h5>Conversation Trail</h5>
                    <div className="comments-scroll-area">
                      {comments.map((comment) => (
                        <div 
                          key={comment.id} 
                          className={`comment-bubble ${comment.is_internal ? 'internal-admin' : ''}`}
                        >
                          <div className="comment-bubble-meta">
                            <strong>{comment.user_name}</strong> 
                            <span className="role-bubble-tag">({comment.user_role?.replace('_', ' ')})</span>
                            {comment.is_internal && (
                              <span className="internal-badge-indicator">🔒 Internal Record</span>
                            )}
                            <span className="comment-time">
                              {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="comment-message">{comment.message}</p>
                        </div>
                      ))}
                      <div ref={commentsEndRef} />
                    </div>

                    {/* Chat Response Form */}
                    {selectedTicket.status !== 'resolved' && (
                      <form className="comment-compose-form" onSubmit={handlePostComment}>
                        <textarea
                          placeholder="Compose a response..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                          rows="2"
                        ></textarea>
                        <div className="compose-bottom-controls">
                          <label className="checkbox-internal-wrapper">
                            <input 
                              type="checkbox" 
                              checked={isInternal}
                              onChange={(e) => setIsInternal(e.target.checked)}
                            />
                            <span>Internal comment (admins only)</span>
                          </label>
                          <button 
                            type="submit" 
                            className="btn-primary-custom"
                            disabled={isSubmittingComment}
                          >
                            {isSubmittingComment ? 'Sending...' : '💬 Send Message'}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )
            )
          ) : (
            <div className="workspace-empty-selection">
              <span className="workspace-empty-emoji">🎫</span>
              <p>Select a ticket from the left panel to display full communications feed.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminSupport;
