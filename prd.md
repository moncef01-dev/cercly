# PRD: CERCY — منصة إدارة جمع وإعادة تدوير النفايات

## 1. Product Vision

CERCY is a digital platform connecting the entire waste management and recycling value chain in Algeria. It bridges households/partners, collection teams, sorting centers, and recycling factories into one real-time collaborative network. The goal is to formalize the informal recycling sector, increase recycling rates, and create transparency across all stages of waste processing.

## 2. Problem Statement

- Algeria generates millions of tons of municipal solid waste annually, with a low formal recycling rate
- Collection, sorting, and recycling operate in silos with no shared visibility
- Sorting centers lack real-time inventory management
- Factories struggle to find available materials from sorting centers
- Citizens/partners have no visibility into the environmental impact of their recycling efforts
- No unified system tracks material flow from collection point to final recycling

## 3. Target Users & Roles

| Role | Description | Key Needs |
|------|-------------|-----------|
| **Collector (فرق الجمع)** | Field teams collecting waste from partner locations | Route planning, collection recording, photo documentation, delivery tracking |
| **Sorter (مراكز الفرز)** | Sorting centers receiving and processing materials | Reception recording, inventory management, order fulfillment |
| **Factory (مصانع التدوير)** | Recycling factories purchasing sorted materials | Material availability view, purchase order creation, shipment tracking |
| **Partner (الشركاء)** | Citizens/businesses participating in recycling | Schedule management, impact tracking, reward points, profile management |
| **Admin (الإدارة العامة)** | Platform overseers | User management, operation monitoring, cross-role analytics |

## 4. Core Features

### 4.1 Authentication & Role Switching
- Role-based login screen
- Quick role switching in the app shell for demo/multi-role users

### 4.2 Collector Module
- **Dashboard**: Daily collection summary with progress toward target, collection point status
- **Route Map**: Interactive route visualization with completed/pending/upcoming stops
- **Collection Recording**: Form to record weight, material types, and photo documentation at each collection point
- **History Log**: Chronological record of all collection operations

### 4.3 Sorter Module
- **Dashboard**: Daily reception and sorting stats, material inventory overview, incoming purchase orders
- **Reception Recording**: Form to log incoming material from collector teams (team, material type, weight, notes)
- **Inventory Management**: Per-material stock levels with capacity indicators (visual progress bars)
- **Reports**: Aggregated processing quantities over time and material distribution breakdown

### 4.4 Factory Module
- **Dashboard**: Weekly/monthly material intake stats, active orders, upcoming shipments
- **Available Inventory**: Real-time view of sorted material availability across all sorting centers
- **Order Management**: Create purchase orders (select center, material, quantity) and track order status (pending/confirmed/delivered)
- **Shipment Tracking**: Incoming shipment details with ETA and status

### 4.5 Partner Module
- **Dashboard**: Personal recycling impact (total recycled, reward points, CO₂ saved, participation level)
- **Environmental Impact**: Detailed breakdown of trees saved, water conserved, energy saved, CO₂ reduced
- **Schedule Management**: View upcoming collection appointments with confirm/reschedule actions
- **Profile**: Personal information management

### 4.6 Admin Module
- **Dashboard**: Platform-wide KPIs (registered partners, total recycling, active centers/factories)
- **User Management**: Search, filter by role, view/edit user details with active/inactive status
- **Operations Monitoring**: Queue of pending approvals (purchase orders, new center registrations, complaints)
- **Cross-Role Reports**: Aggregated analytics

### 4.7 Shared Components
- **Notification Panel**: Real-time alerts for all roles (material receipts, order updates, schedule changes)
- **Chart Widget**: Monthly processing quantities bar chart + material distribution breakdown

## 5. Data Model

| Entity | Key Fields |
|--------|-----------|
| User | id, name, role, email, phone, address, status, avatar |
| CollectionPoint | id, name, address, materials[], schedule |
| CollectionRecord | id, collectorId, pointId, weight, materials[], photo, timestamp |
| Material | id, name, unit, icon, color |
| Inventory | centerId, materialId, quantity, capacity, lastUpdated |
| PurchaseOrder | id, factoryId, centerId, materialId, quantity, status, createdAt |
| Shipment | id, orderId, from, material, quantity, eta, status |
| Notification | id, userId, text, time, isNew, type |

## 6. Success Metrics

- Number of registered collectors, sorters, factories, and partners
- Total waste processed (tons) per month
- Average sorting efficiency (%)
- Purchase order fulfillment rate
- Partner engagement (active vs registered)

## 7. Future Iterations

- Live map integration (Google Maps / OSM)
- Real-time WebSocket updates for inventory and notifications
- Mobile apps (native) with offline support for collectors
- Payment gateway integration for purchase orders
- Gamification — leaderboards, achievements for partners
- AI-powered route optimization for collectors
- Barcode/RFID tagging for material tracking
- Multilingual support (Arabic, French, English)
