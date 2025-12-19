const express = require('express');
const cors = require('cors');

const healthRouter = require('./routes/health');
const authRouter = require('./routes/auth');
const companiesRouter = require('./routes/companies');
const vacanciesRouter = require('./routes/vacancies');
const interactionsRouter = require('./routes/interactions');
const invoicesRouter = require('./routes/invoices');
const chatbotRouter = require('./routes/chatbot');
const statsRouter = require('./routes/stats');
const analyticsRouter = require('./routes/analytics');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API Bonaparte - Gestión de Vacantes');
});

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/vacancies', vacanciesRouter);
app.use('/api/interactions', interactionsRouter);
app.use('/api/invoices', invoicesRouter);
app.use('/api/chatbot', chatbotRouter);
app.use('/api/stats', statsRouter);
app.use('/api/analytics', analyticsRouter);

// Not found
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
});

module.exports = app;
