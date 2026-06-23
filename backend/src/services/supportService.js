const SupportTicket = require('../models/SupportTicket');
const SupportTicketComment = require('../models/SupportTicketComment');
const User = require('../models/User');
const { AppError } = require('../middlewares/errorHandler');
const zohoDeskService = require('./zohoDeskService');

const supportService = {
  createTicket: async (userId, { orderId, subject, description, priority }) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const ticketId = await SupportTicket.create({
      userId,
      orderId,
      subject,
      description,
      priority: priority || 'medium',
      status: 'open'
    });

    const ticket = await SupportTicket.findById(ticketId);

    // Sync ticket to Zoho Desk
    await zohoDeskService.syncTicketToZohoDesk(ticketId, subject, description, user.email);

    return ticket;
  },

  getTicketDetails: async (ticketId, userId, userRole) => {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Authorization check: User can only see their own tickets, unless admin/super_admin
    if (userRole !== 'admin' && userRole !== 'super_admin' && ticket.user_id !== userId) {
      throw new AppError('Forbidden. You cannot view this ticket.', 403);
    }

    const includeInternal = (userRole === 'admin' || userRole === 'super_admin');
    const comments = await SupportTicketComment.findByTicketId(ticketId, includeInternal);

    return { ticket, comments };
  },

  listTickets: async (filters, userId, userRole) => {
    // If standard user, restrict tickets list to their own creations
    if (userRole !== 'admin' && userRole !== 'super_admin') {
      filters.userId = userId;
    }
    return await SupportTicket.findAll(filters);
  },

  addComment: async (ticketId, userId, userRole, { message, isInternal }) => {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    // Authorization check
    if (userRole !== 'admin' && userRole !== 'super_admin' && ticket.user_id !== userId) {
      throw new AppError('Forbidden. You cannot comment on this ticket.', 403);
    }

    const internalComment = (isInternal && (userRole === 'admin' || userRole === 'super_admin')) ? true : false;

    await SupportTicketComment.create({
      ticketId,
      userId,
      message,
      isInternal: internalComment
    });

    // If an admin comments, set the ticket to "in_progress" and assign to them if unassigned
    if ((userRole === 'admin' || userRole === 'super_admin') && ticket.status === 'open') {
      await SupportTicket.assignTicket(ticketId, userId);
    }

    return await SupportTicketComment.findByTicketId(ticketId, (userRole === 'admin' || userRole === 'super_admin'));
  },

  escalateTicket: async (ticketId, adminId) => {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    await SupportTicket.updateStatus(ticketId, 'escalated');
    console.log(`[Zoho Desk] Ticket ${ticketId} escalated internally by admin ${adminId}`);

    return { ticketId, status: 'escalated' };
  },

  resolveTicket: async (ticketId, adminId) => {
    const ticket = await SupportTicket.findById(ticketId);
    if (!ticket) {
      throw new AppError('Ticket not found', 404);
    }

    await SupportTicket.updateStatus(ticketId, 'resolved');
    return { ticketId, status: 'resolved' };
  }
};

module.exports = supportService;
