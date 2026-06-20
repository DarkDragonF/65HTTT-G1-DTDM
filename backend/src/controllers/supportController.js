const supportService = require('../services/supportService');

const supportController = {
  createTicket: async (req, res, next) => {
    try {
      const ticket = await supportService.createTicket(req.user.id, req.body);
      res.status(201).json({ status: 'success', message: 'Support ticket submitted successfully', data: ticket });
    } catch (error) {
      next(error);
    }
  },

  getTicket: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await supportService.getTicketDetails(id, req.user.id, req.user.role);
      res.status(200).json({ status: 'success', data: result });
    } catch (error) {
      next(error);
    }
  },

  getTickets: async (req, res, next) => {
    try {
      const { status, priority } = req.query;
      const tickets = await supportService.listTickets({ status, priority }, req.user.id, req.user.role);
      res.status(200).json({ status: 'success', data: tickets });
    } catch (error) {
      next(error);
    }
  },

  addComment: async (req, res, next) => {
    try {
      const { id } = req.params;
      const comments = await supportService.addComment(id, req.user.id, req.user.role, req.body);
      res.status(200).json({ status: 'success', message: 'Comment added successfully', data: comments });
    } catch (error) {
      next(error);
    }
  },

  escalate: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await supportService.escalateTicket(id, req.user.id);
      res.status(200).json({ status: 'success', message: 'Ticket escalated successfully', data: result });
    } catch (error) {
      next(error);
    }
  },

  resolve: async (req, res, next) => {
    try {
      const { id } = req.params;
      const result = await supportService.resolveTicket(id, req.user.id);
      res.status(200).json({ status: 'success', message: 'Ticket resolved successfully', data: result });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = supportController;
