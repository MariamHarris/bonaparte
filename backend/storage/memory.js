const { randomUUID } = require('crypto');

const companies = new Map();
const vacancies = new Map();
const interactions = [];
const invoices = new Map();

function nowIso() {
  return new Date().toISOString();
}

function createCompany(data) {
  const id = randomUUID();
  const company = {
    id,
    name: data.name,
    type: data.type || 'private', // 'public' | 'private'
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  companies.set(id, company);
  return company;
}

function createVacancy(data) {
  const id = randomUUID();
  const vacancy = {
    id,
    companyId: data.companyId,
    title: data.title,
    description: data.description || null,
    location: data.location || null,
    salary: data.salary || null,
    status: data.status || 'open',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };
  vacancies.set(id, vacancy);
  return vacancy;
}

function recordInteraction(data) {
  const interaction = {
    id: randomUUID(),
    vacancyId: data.vacancyId,
    channel: data.channel || 'web',
    event: data.event || 'view',
    createdAt: nowIso(),
  };
  interactions.push(interaction);
  return interaction;
}

function createInvoice(data) {
  const id = randomUUID();
  const invoice = {
    id,
    companyId: data.companyId,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    interactionsCount: data.interactionsCount,
    tollPerInteraction: data.tollPerInteraction,
    total: data.total,
    status: data.status || 'draft',
    createdAt: nowIso(),
  };
  invoices.set(id, invoice);
  return invoice;
}

module.exports = {
  companies,
  vacancies,
  interactions,
  invoices,
  createCompany,
  createVacancy,
  recordInteraction,
  createInvoice,
};
