function requireConsultora(req, res, next) {
  // MVP: auth emulada por header
  // En producción: JWT/sesiones + roles
  const role = req.header('x-role');
  if (role !== 'consultora') {
    return res.status(401).json({ error: 'Acceso solo para Empresa Consultora' });
  }
  next();
}

function requireEmpresa(req, res, next) {
  const role = req.header('x-role');
  if (role !== 'empresa') {
    return res.status(401).json({ error: 'Acceso solo para Empresa' });
  }
  next();
}

module.exports = { requireConsultora, requireEmpresa };
