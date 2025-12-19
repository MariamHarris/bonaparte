const { verifyAccessToken } = require('../services/jwt');

const SECURE_MODE = process.env.SECURE_MODE === 'true';

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

  // Compatibilidad con MVP anterior (solo si SECURE_MODE está desactivado)
  if (!SECURE_MODE) {
    const role = req.header('x-role');
    if (role === 'empresa' || role === 'consultora') {
      req.user = { id: null, role, companyId: null, emulated: true };
      return next();
    }
  }

  const msg = SECURE_MODE
    ? 'No autenticado. Usa Authorization: Bearer <token>.'
    : 'No autenticado';
  return res.status(401).json({ error: msg });
}

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'No autenticado' });

    // Permite corregir tokens sin campo role usando el header x-role (solo para entornos de demo)
    const headerRole = req.header('x-role');
    if (req.user.role !== role && headerRole && headerRole.toLowerCase() === role) {
      req.user.role = role;
    }

    if (req.user.role !== role) {
      return res.status(403).json({ error: `Acceso solo para ${role}` });
    }
    next();
  };
}

const requireConsultora = [authenticate, requireRole('consultora')];
const requireEmpresa = [authenticate, requireRole('empresa')];

module.exports = { authenticate, requireRole, requireConsultora, requireEmpresa };
