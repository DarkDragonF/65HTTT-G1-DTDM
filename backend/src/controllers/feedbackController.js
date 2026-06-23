const Feedback = require('../models/Feedback');
const cliqService = require('../services/cliqService');
const { AppError } = require('../middlewares/errorHandler');

/**
 * Parses Zoho Forms webhook payload keys and values flexibly.
 */
function parseZohoWebhook(body) {
  let canteenName = 'All Canteens';
  let rating = 5;
  let comments = '';
  let email = null;

  for (const [key, value] of Object.entries(body)) {
    const keyLower = key.toLowerCase();
    const valStr = String(value).trim();

    // 1. Identify email
    if (keyLower.includes('email') || valStr.includes('@')) {
      email = valStr;
    }
    // 2. Identify rating (numeric value between 1 and 5)
    else if (
      keyLower.includes('rating') ||
      keyLower.includes('rate') ||
      keyLower.includes('đánh giá') ||
      keyLower.includes('sao')
    ) {
      const parsedNum = parseInt(valStr, 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 5) {
        rating = parsedNum;
      }
    }
    // 3. Identify canteen name
    else if (
      keyLower.includes('canteen') ||
      keyLower.includes('nơi') ||
      keyLower.includes('quầy') ||
      keyLower.includes('location')
    ) {
      canteenName = valStr;
    }
    // 4. Identify comments
    else if (
      keyLower.includes('comment') ||
      keyLower.includes('feedback') ||
      keyLower.includes('opinion') ||
      keyLower.includes('suggestion') ||
      keyLower.includes('nội dung') ||
      keyLower.includes('ý kiến') ||
      keyLower.includes('đóng góp') ||
      keyLower.includes('góp ý')
    ) {
      comments = valStr;
    }
  }

  // Fallback rating extraction if rating is not found by key name but there is a numeric value in body
  if (rating === 5) {
    for (const val of Object.values(body)) {
      const parsedNum = parseInt(val, 10);
      if (!isNaN(parsedNum) && parsedNum >= 1 && parsedNum <= 5 && String(val).length === 1) {
        rating = parsedNum;
        break;
      }
    }
  }

  // Fallback comments extraction: find the longest text value in the body
  if (!comments) {
    let longestVal = '';
    for (const [key, val] of Object.entries(body)) {
      const valStr = String(val).trim();
      if (valStr.includes('@') || valStr.length < 5) continue;
      if (key.toLowerCase().includes('canteen') || key.toLowerCase().includes('location')) continue;
      if (valStr.length > longestVal.length) {
        longestVal = valStr;
      }
    }
    comments = longestVal || 'No comments provided';
  }

  return { canteenName, rating, comments, email };
}

const feedbackController = {
  /**
   * Submit feedback directly from TLU Food web application form.
   */
  submitDirectFeedback: async (req, res, next) => {
    try {
      const { canteenName, rating, comments } = req.body;
      const userEmail = req.user?.email || null;

      const parsedRating = parseInt(rating, 10);
      if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
        return next(new AppError('Rating must be an integer between 1 and 5', 400));
      }
      if (!comments || typeof comments !== 'string' || !comments.trim()) {
        return next(new AppError('Comments are required', 400));
      }

      const feedbackId = await Feedback.create({
        canteenName: canteenName || 'All Canteens',
        rating: parsedRating,
        comments: comments.trim(),
        userEmail,
        source: 'direct'
      });

      // Post alert to Zoho Cliq channel
      const cliqMessage = `📝 *New Feedback Received (Direct UI)*\nCanteen: *${canteenName || 'All Canteens'}*\nRating: ${'★'.repeat(parsedRating)}${'☆'.repeat(5 - parsedRating)}\nComments: "${comments.trim()}"\nFrom: _${userEmail || 'Anonymous'}_`;
      await cliqService.sendFeedbackAlert(cliqMessage).catch(console.error);

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: { id: feedbackId }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Receive external webhook POST payload from live Zoho Forms submissions.
   */
  receiveZohoWebhook: async (req, res, next) => {
    try {
      console.log('[Zoho Forms Webhook] Payload received:', JSON.stringify(req.body));
      
      const { canteenName, rating, comments, email } = parseZohoWebhook(req.body);

      const feedbackId = await Feedback.create({
        canteenName,
        rating,
        comments,
        userEmail: email,
        source: 'zoho_forms'
      });

      // Post alert to Zoho Cliq channel
      const cliqMessage = `📝 *New Feedback Received (via Zoho Forms)*\nCanteen: *${canteenName}*\nRating: ${'★'.repeat(rating)}${'☆'.repeat(5 - rating)}\nComments: "${comments}"\nFrom: _${email || 'Anonymous (Zoho Forms Webhook)'}_`;
      await cliqService.sendFeedbackAlert(cliqMessage).catch(console.error);

      res.status(200).json({
        success: true,
        message: 'Webhook parsed and logged successfully',
        data: { id: feedbackId }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Fetch all feedback submissions for admin reporting.
   */
  getAllFeedback: async (req, res, next) => {
    try {
      const list = await Feedback.findAll();
      res.status(200).json({
        success: true,
        data: list
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = feedbackController;
