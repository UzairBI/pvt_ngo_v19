-- SQLite schema. Runs automatically at every server start (all statements are idempotent).
CREATE TABLE IF NOT EXISTS document_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  reference TEXT, request_type TEXT, document_type TEXT, financial_year TEXT,
  delivery TEXT, delivery_address TEXT, name TEXT, organisation TEXT,
  email TEXT, phone TEXT, purpose TEXT, message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  admin_message TEXT, sent_at TEXT, completed_at TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS ux_document_requests_reference ON document_requests(reference);
CREATE INDEX IF NOT EXISTS ix_document_requests_status ON document_requests(status);

CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,          -- "scrypt$..." (or temporarily "plain:NewPassword", re-hashed at next login)
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  last_login TEXT
);

CREATE TABLE IF NOT EXISTS donations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seq INTEGER GENERATED ALWAYS AS (id) VIRTUAL,       -- drives receipt numbers
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  donated_at TEXT NOT NULL DEFAULT (date('now','localtime')),
  mode TEXT NOT NULL DEFAULT 'offline' CHECK (mode IN ('online','offline')),
  method TEXT,
  status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('pending','success','failed','refunded','cancelled')),
  amount REAL NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'INR',
  donor_name TEXT, donor_email TEXT, donor_phone TEXT, donor_pan TEXT, donor_address TEXT,
  purpose TEXT, reference TEXT, notes TEXT,
  gateway TEXT, gateway_payment_id TEXT UNIQUE, gateway_order_id TEXT, gateway_status TEXT, gateway_error TEXT,
  receipt_sent_at TEXT, tax_receipt_issued_at TEXT
);
CREATE INDEX IF NOT EXISTS ix_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS ix_donations_donated_at ON donations(donated_at);

CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  name TEXT NOT NULL, area TEXT, location TEXT, description TEXT,
  status TEXT NOT NULL DEFAULT 'ongoing' CHECK (status IN ('planned','ongoing','completed')),
  beneficiaries INTEGER NOT NULL DEFAULT 0,
  published BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS volunteers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  name TEXT, phone TEXT, email TEXT, area TEXT, message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','inactive'))
);
CREATE INDEX IF NOT EXISTS ix_volunteers_status ON volunteers(status);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  title TEXT NOT NULL, event_date TEXT NOT NULL, event_time TEXT, place TEXT, description TEXT,
  images JSON NOT NULL DEFAULT '[]',
  published BOOLEAN NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS request_attachments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  request_id INTEGER NOT NULL REFERENCES document_requests(id) ON DELETE CASCADE,
  filename TEXT NOT NULL, stored_name TEXT NOT NULL, mime TEXT, size INTEGER,
  uploaded_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS ix_request_attachments_request ON request_attachments(request_id);

CREATE TABLE IF NOT EXISTS broadcasts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  audience TEXT, subject TEXT, body TEXT, recipients INTEGER, failed INTEGER DEFAULT 0
);

-- Admin activity log (who did what, when). Written by the server after each successful admin change.
CREATE TABLE IF NOT EXISTS activity_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  admin_id TEXT, action TEXT NOT NULL, entity TEXT, entity_id TEXT, summary TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_activity_log_created ON activity_log(created_at);
