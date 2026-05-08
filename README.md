# CoreSales

A full-stack sales management platform for chemical trading businesses. Manages the complete order lifecycle from initial enquiry through production and shipping, with supporting tools for contacts, products, proforma invoices, letters of credit, forecasting, and reporting.

---

## Features

### Orders
- Full order lifecycle: Enquiry → Quotation Sent → PI Issued → LC Opened → Production
- Shipping statuses (Booking, Cargo Closing, ETD, ETA, Delivered) auto-advance based on shipping schedule dates
- Per-order shipping schedule with carrier, tracking, and milestone dates
- Line-item pricing with drums, bank charges, shipping, commission, tax, and inspection charges
- Auto-generated order and quotation numbers
- Duplicate order function

### Products & Pricing
- Product catalogue with SKU, category, grade, CAS number, packaging types, and unit of measure
- Base price tracking with last-updated date
- Pricing history view across orders

### Contacts
- Company and individual contact records
- Contact detail page with full order and activity history

### Proforma Invoices & Letters of Credit
- Generate and view proforma invoices linked to orders
- LC tracker with status, expiry, and document management

### Forecasting
- Monthly quantity forecasts per product
- Actual vs forecast variance reporting

### Reports
- Weekly sales reports
- Order and line-item exports to CSV

### Other
- Dashboard with live order pipeline and shipping monitor
- Meetings, notes, samples, and to-do tracking
- Company settings: logo, branding, bank details, default unit, order number prefixes
- Admin panel

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express, Mongoose |
| Database | MongoDB |
| Frontend | Vanilla HTML/CSS/JS (no framework) |
| Auth | JWT |
| Deployment | Docker Compose |

---

## Getting Started

**Prerequisites:** Docker Desktop

```bash
git clone https://github.com/indunissanka/CoreSales.git
cd CoreSales
docker compose up -d --build
```

The app will be available at `http://localhost` (frontend) and `http://localhost:5000` (API).

---

## Project Structure

```
CoreSales/
├── backend/
│   ├── models/        # Mongoose schemas
│   ├── routes/        # Express API routes
│   ├── middleware/    # Auth middleware
│   └── utils/         # Auto-numbering helpers
├── frontend/
│   └── public/        # HTML pages + JS + CSS
└── docker-compose.yml
```
