const auditService = require('../services/auditService');

/**
 * Middleware that automatically logs any writing action (POST, PUT, DELETE, PATCH)
 * targeting administrative endpoints.
 */
const auditLogMiddleware = async (req, res, next) => {
  const originalJson = res.json;

  // Intercept json response to capture completion status
  res.json = function (body) {
    res.json = originalJson;
    res.bodyData = body;
    return res.json(body);
  };

  res.on('finish', async () => {
    // Only log write methods (POST, PUT, PATCH, DELETE) that were successfully processed
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const userId = req.user ? req.user.id : null;
        const action = `${req.method.toLowerCase()}:${req.baseUrl || ''}${req.path}`;
        const targetType = req.originalUrl.split('/')[3] || 'admin'; // e.g. /api/admin/users -> users
        const targetId = req.params.id ? parseInt(req.params.id, 10) : null;
        
        // Filter out sensitive data from body
        const details = { ...req.body };
        if (details.password) delete details.password;
        if (details.token) delete details.token;

        await auditService.logAction({
          userId,
          action,
          targetType,
          targetId,
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
          details: JSON.stringify(details)
        });
      } catch (error) {
        console.error('Audit logging failed in middleware:', error);
      }
    }
  });

  next();
};

module.exports = { auditLogMiddleware };
