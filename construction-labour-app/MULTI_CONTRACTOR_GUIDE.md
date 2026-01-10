# Multi-Contractor System Documentation

## Overview

The app now supports multiple contractors with the ability to share workers between contractors. Each contractor has independent access to their workers' data while shared workers can be monitored and paid by multiple contractors.

## Key Features

### 1. **Separate Contractor Accounts**

Each contractor has their own login credentials and can only see their own workers:

- **Shivaji Kokate**
  - Username: `shivaji_kokate`
  - Password: `Shiv@2026`
  - Contractor ID: `contractor_1`

- **Dattatray Jagtap**
  - Username: `dattatray_jagtap`
  - Password: `Datta@2026`
  - Contractor ID: `contractor_2`

### 2. **Shared Workers (Multiple Contractors)**

Workers can now be assigned to multiple contractors:

```javascript
// Worker object structure
{
  id: 'worker_id',
  name: 'Worker Name',
  contractorIds: ['contractor_1', 'contractor_2'], // Multiple contractors
  // OR legacy format (backward compatible)
  contractorId: 'contractor_1',
  // ... other fields
}
```

### 3. **Independent Financial Tracking**

Each contractor tracks:
- **Advances given** to their workers
- **Payments made** to their workers
- **Attendance records** for their workers
- **Net balance** calculations

### 4. **Dashboard Auto-Refresh**

Contractor dashboards auto-refresh every 1 second showing:
- Workers present today
- Weekly payouts
- Weekly advances
- Workers by site allocation

## Database Structure

### Firebase Collections

#### `contractors`
Stores contractor credentials:
```javascript
{
  contractor_1: {
    username: 'shivaji_kokate',
    password: 'Shiv@2026',
    name: 'Shivaji Kokate',
    contractorId: 'contractor_1'
  },
  contractor_2: {
    username: 'dattatray_jagtap',
    password: 'Datta@2026',
    name: 'Dattatray Jagtap',
    contractorId: 'contractor_2'
  }
}
```

#### `labours`
Worker data with multi-contractor support:
```javascript
{
  worker_id: {
    id: 'worker_id',
    name: 'Worker Name',
    contractorIds: ['contractor_1', 'contractor_2'],
    advances: [
      { date: '2026-01-02', amount: 500, note: 'Advance', contractorId: 'contractor_1' },
      { date: '2026-01-03', amount: 300, note: 'Advance', contractorId: 'contractor_2' }
    ],
    payments: [
      { date: '2026-01-04', amount: 1000, note: 'Payment', contractorId: 'contractor_1' },
      { date: '2026-01-05', amount: 800, note: 'Payment', contractorId: 'contractor_2' }
    ]
  }
}
```

## How It Works

### For Shared Workers

**Example: Shared Worker with Both Contractors**

```javascript
// Worker belongs to both contractors
const worker = {
  id: 'shared_worker_1',
  name: 'Shared Worker',
  contractorIds: ['contractor_1', 'contractor_2'],
  advances: [
    { date: '2026-01-02', amount: 500, contractorId: 'contractor_1', note: 'From Shivaji' },
    { date: '2026-01-03', amount: 300, contractorId: 'contractor_2', note: 'From Dattatray' }
  ],
  payments: [
    { date: '2026-01-04', amount: 1000, contractorId: 'contractor_1', note: 'Paid by Shivaji' },
    { date: '2026-01-05', amount: 800, contractorId: 'contractor_2', note: 'Paid by Dattatray' }
  ]
}

// Each contractor sees:
// Shivaji sees: Advance of 500 + Payment of 1000
// Dattatray sees: Advance of 300 + Payment of 800
```

### Financial Independence

Each contractor independently:
1. **Gives advances** to their workers
2. **Tracks attendance** for their work
3. **Pays their workers** based on their attendance
4. **Clears hisaab** (settlement) when they pay

Example:
```
Worker: Mahesh (works for both contractors)

From Shivaji:
- Daily Rate: ₹700
- Days worked: 10 days = ₹7000 earned
- Advances taken: ₹1000
- Amount to pay: ₹6000

From Dattatray:
- Daily Rate: ₹600
- Days worked: 8 days = ₹4800 earned
- Advances taken: ₹500
- Amount to pay: ₹4300

Total for Mahesh: ₹10300 across both contractors
```

## API Usage

### Add Worker to Contractor

```javascript
import { addWorkerToContractor } from './services/workerContractorService';

// Add existing worker to another contractor
await addWorkerToContractor('worker_id', 'contractor_2');
```

### Remove Worker from Contractor

```javascript
import { removeWorkerFromContractor } from './services/workerContractorService';

// Remove worker from a contractor
await removeWorkerFromContractor('worker_id', 'contractor_2');
```

### Check Worker-Contractor Relationship

```javascript
import { isWorkerOfContractor, getWorkerContractorIds, getSharedContractors } from './services/workerContractorService';

// Get all contractors for a worker
const contractorIds = getWorkerContractorIds(worker);

// Check if worker belongs to contractor
const belongsTo = isWorkerOfContractor(worker, 'contractor_1');

// Get shared contractors between two workers
const sharedContractors = getSharedContractors(worker1, worker2);
```

## Workflow Example

### Scenario: Mahesh works for both Shivaji and Dattatray

1. **Monday-Thursday (Shivaji's work)**
   - Mahesh marked present for Shivaji
   - Shivaji gives ₹1000 advance
   - Earned: ₹2800 (4 days × ₹700)

2. **Thursday-Friday (Dattatray's work)**
   - Same day, Mahesh marked present for Dattatray too
   - Dattatray gives ₹500 advance
   - Earned: ₹1200 (2 days × ₹600)

3. **End of Week - Shivaji's Settlement**
   - Earned from Shivaji: ₹2800
   - Less advances: ₹1000
   - To pay: ₹1800

4. **End of Week - Dattatray's Settlement**
   - Earned from Dattatray: ₹1200
   - Less advances: ₹500
   - To pay: ₹700

5. **Mahesh's Total**
   - Total earned: ₹4000
   - Total advances: ₹1500
   - Total to pay: ₹2500

## Test Workers Removed

All test workers have been removed from the app. The app now starts with an empty workers list.

To add workers:
1. Each contractor logs in
2. Navigates to Workers section
3. Clicks "+" button to add new worker
4. Worker data is synced to Firebase
5. Workers can be assigned to multiple contractors via `addWorkerToContractor()`

## Backward Compatibility

The system maintains backward compatibility with the old single-contractor format:

```javascript
// Old format (still works)
worker.contractorId = 'contractor_1'

// New format (preferred)
worker.contractorIds = ['contractor_1', 'contractor_2']

// System automatically handles both
const contractorIds = getWorkerContractorIds(worker);
```
