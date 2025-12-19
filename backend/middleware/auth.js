const { verifyAccessToken } = require('../services/jwt');

function authenticate(req, res, next) {
  const authHeader = req.header('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice('Bearer '.length).trim();
    try {
      const payload = verifyAccessToken(token);
      req.user = {
        id: payload.sub,
        role: payload.role,
        companyId: payload.companyId || null,
      };
      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  }

  // Compatibilidad con MVP anterior (header-based). Útil para pruebas rápidas.
  const role = req.header('x-role');
  if (role === 'empresa' || role === 'consultora') {
    req.user = { id: null, role, companyId: null, emulated: true };
    return next();
  }

  return res.status(401).json({ error: 'No autenticado' });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });
    if (req.user.role !== role) {
      return res.status(403).json({ error: `Acceso solo para ${role}` });
    }
    next();
  };
}

const requireConsultora = [authenticate, requireRole('consultora')];
const requireEmpresa = [authenticate, requireRole('empresa')];

module.exports = { authenticate, requireRole, requireConsultora, requireEmpresa };
