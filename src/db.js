// ---------------------------------------------------------------------------
// Data layer. Every screen in the app talks to invoices ONLY through the
// functions exported here (getInvoices, saveInvoice, deleteInvoice).
//
// Today these functions read/write IndexedDB on-device. If you ever add a
// backend, you swap the *insides* of these functions for fetch() calls -
// nothing in your UI components has to change, because they only know about
// this file's function signatures, not about IndexedDB itself.
// ---------------------------------------------------------------------------

import { openDB } from "idb";

const DB_NAME = "invoice-ledger";
const STORE_NAME = "invoices";
const DB_VERSION = 1;

function dbPromise() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
      store.createIndex("by-date", "date");
      store.createIndex("by-dealer", "dealerName");
    }
  });
}

// Generate our own IDs (rather than relying on IndexedDB auto-increment) so
// that records remain uniquely identifiable if this data ever syncs across
// devices or up to a server. This is separate from your own human-readable
// "Invoice ID" field, which you control yourself.
function makeRecordId() {
  return crypto.randomUUID();
}

// Invoice shape (kept as plain, JSON-serializable data on purpose):
// {
//   id: string,            // internal record id, auto-generated
//   invoiceId: string,      // YOUR invoice number, e.g. "INV-0007"
//   date: string,           // ISO date, e.g. "2026-09-12"
//   dealerName: string,     // Dealer / Company name
//   productName: string,    // optional
//   productType: string,    // e.g. "SSD", "Motherboard", "RAM"
//   cost: number,
//   sellingPrice: number,
//   profit: number          // derived: sellingPrice - cost, stored for easy sorting/summing
// }

export async function getInvoices() {
  const db = await dbPromise();
  const all = await db.getAll(STORE_NAME);
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
  await db.put(STORE_NAME, record);
  return record;
}

export async function deleteInvoice(id) {
  const db = await dbPromise();
  await db.delete(STORE_NAME, id);
}
