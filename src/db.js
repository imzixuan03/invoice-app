// ---------------------------------------------------------------------------
// Data layer. Every screen in the app talks to invoices/companies ONLY
// through the functions exported here.
//
// Today these functions read/write IndexedDB on-device. If you ever add a
// backend, you swap the *insides* of these functions for fetch() calls -
// nothing in your UI components has to change, because they only know about
// this file's function signatures, not about IndexedDB itself.
// ---------------------------------------------------------------------------

import { openDB } from "idb";

const DB_NAME = "invoice-ledger";
const INVOICE_STORE = "invoices";
const COMPANY_STORE = "companies";
const DB_VERSION = 2;

function dbPromise() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        const store = db.createObjectStore(INVOICE_STORE, { keyPath: "id" });
        store.createIndex("by-date", "date");
        store.createIndex("by-dealer", "dealerName");
      }
      if (oldVersion < 2) {
        db.createObjectStore(COMPANY_STORE, { keyPath: "id" });
      }
    }
  });
}

// Generate our own IDs (rather than relying on IndexedDB auto-increment) so
// that records remain uniquely identifiable if this data ever syncs across
// devices or up to a server. This is separate from your own human-readable
// "Invoice ID" field, which is generated from company/month/year + sequence.
function makeRecordId() {
  return crypto.randomUUID();
}

// Invoice shape (kept as plain, JSON-serializable data on purpose):
// {
//   id: string,            // internal record id, auto-generated
//   invoiceId: string,      // e.g. "SV0926-001" - generated, not typed
//   date: string,           // ISO date, e.g. "2026-09-12"
//   dealerName: string,     // Dealer / Company name (the customer)
//   productName: string,    // optional
//   productType: string,    // e.g. "SSD", "Motherboard", "RAM"
//   cost: number,
//   sellingPrice: number,
//   profit: number          // derived: sellingPrice - cost
// }

export async function getInvoices() {
  const db = await dbPromise();
  const all = await db.getAll(INVOICE_STORE);
  return all.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function saveInvoice(invoice) {
  const db = await dbPromise();
  const cost = Number(invoice.cost) || 0;
  const sellingPrice = Number(invoice.sellingPrice) || 0;
  const record = {
    ...invoice,
    cost,
    sellingPrice,
    profit: sellingPrice - cost,
    id: invoice.id || makeRecordId()
  };
  await db.put(INVOICE_STORE, record);
  return record;
}

export async function deleteInvoice(id) {
  const db = await dbPromise();
  await db.delete(INVOICE_STORE, id);
}

// Company shape: { id, code, name }
// "code" is the short prefix used in Invoice IDs (e.g. "SV").
// "name" is just for your own reference in the dropdown.

export async function getCompanies() {
  const db = await dbPromise();
  const all = await db.getAll(COMPANY_STORE);
  return all.sort((a, b) => a.code.localeCompare(b.code));
}

export async function saveCompany(company) {
  const db = await dbPromise();
  const record = {
    ...company,
    code: company.code.toUpperCase().trim(),
    id: company.id || makeRecordId()
  };
  await db.put(COMPANY_STORE, record);
  return record;
}
