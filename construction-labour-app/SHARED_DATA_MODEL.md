# Shared Data Model Update - Multiple Contractors

## Overview
Changed from **independent contractor tracking** to **shared worker data model** where:
- ✅ Both contractors see the SAME worker data (advances, attendance, earnings)
- ✅ Payment tracking shows WHO PAID (which contractor made the payment)
- ✅ All calculations are identical for both contractors
- ✅ Each contractor can see advances/payments made by the other contractor

---

## Key Changes

### 1. **Data Structure**

#### Old Model (Independent)
```javascript
advances: [
  { date: "2026-01-05", amount: 500, contractorId: "contractor_1" },  // Only Shivaji sees this
  { date: "2026-01-05", amount: 300, contractorId: "contractor_2" }   // Only Dattatray sees this
]
```

#### New Model (Shared)
```javascript
advances: [
  { date: "2026-01-05", amount: 500, paidBy: "contractor_1", contractorName: "Shivaji Kokate" },
  { date: "2026-01-05", amount: 300, paidBy: "contractor_2", contractorName: "Dattatray Jagtap" }
]
// Both contractors see ALL advances - just shows who paid each one
```

---

## Implementation Details

### 2. **Calculations Update** (`calculations.js`)
```javascript
// calculateTotalAdvances() - Now sums ALL advances regardless of paidBy
const total = advances.reduce((sum, adv) => sum + adv.amount, 0);
// Result: ₹800 (both contractors see this)

// calculateWeekSummary() - Also uses all advances
weekAdvanceTotal = weekAdvances.reduce((sum, adv) => sum + adv.amount, 0);
netPay = earned - weekAdvanceTotal - weekPaymentTotal;
// Result: Same calculation for both contractors
```

### 3. **Recording Advances** (`LabourDetailScreen.js`)
```javascript
// When contractor records an advance:
addAdvance(labourId, {
  date: getTodayString(),
  amount: 500,
  note: 'Lunch money',
  paidBy: user?.contractorId,              // contractor_1 or contractor_2
  contractorName: user?.name,              // "Shivaji Kokate" or "Dattatray Jagtap"
});

// Both contractors immediately see this in the worker's record
```

### 4. **Recording Payments** (`LabourDetailScreen.js`)
```javascript
// When contractor records a payment:
recordPayment({
  labourId,
  payment: {
    date: getTodayString(),
    amount: 1000,
    note: 'Weekly salary',
    paidBy: user?.contractorId,              // contractor_1 or contractor_2
    contractorName: user?.name,
  }
});

// Both contractors see "Paid by: Shivaji Kokate" or "Paid by: Dattatray Jagtap"
```

### 5. **Display Components**

#### AdvanceItem Component
```javascript
// Shows who paid
<Text>{contractorName}</Text>  // Displays "Shivaji Kokate" or "Dattatray Jagtap"

// Transaction looks like:
Date: 2026-01-05
Shivaji Kokate
₹500
```

#### TransactionHistoryScreen
```javascript
// Displays contractor name with each transaction
Date: 2026-01-05
Shivaji Kokate    ← Shows who paid
Amount: ₹500

Date: 2026-01-05
Dattatray Jagtap  ← Shows who paid
Amount: ₹300

// Both contractors see both transactions
```

---

## Workflow Example

### Day 1: Shivaji Creates and Pays Worker Rajesh
```
Shivaji's Account:
1. Add Worker: Rajesh (₹700/day)
   → Worker visible to both contractors

2. Mark Rajesh present (Day 1)
   → Both see: Attended Site A

3. Give ₹500 advance
   → Record shows: "Paid by: Shivaji Kokate"
   → Both see: ₹500 advance

Dashboard (Shivaji):
- Total advances: ₹500
- Amount to pay Rajesh: ₹700 - ₹500 = ₹200

Dashboard (Dattatray):
- Total advances: ₹500 (same!)
- Amount to pay Rajesh: ₹700 - ₹500 = ₹200 (same!)
```

### Day 2: Dattatray Also Uses Rajesh
```
Dattatray's Account:
1. Rajesh already visible in worker list

2. Mark Rajesh present (Day 2)
   → Both see: Attended Site B

3. Give ₹300 advance
   → Record shows: "Paid by: Dattatray Jagtap"
   → Both see: ₹300 advance

Dashboard (Shivaji):
- Days worked: 2
- Earned: ₹1400
- Total advances: ₹500 + ₹300 = ₹800 (now includes Dattatray's)
- Amount to pay: ₹1400 - ₹800 = ₹600

Dashboard (Dattatray):
- Days worked: 2
- Earned: ₹1400 (same!)
- Total advances: ₹500 + ₹300 = ₹800 (same!)
- Amount to pay: ₹1400 - ₹800 = ₹600 (same!)

Transaction History (Both See):
1. 2026-01-05: ₹500 paid by Shivaji Kokate
2. 2026-01-06: ₹300 paid by Dattatray Jagtap
```

---

## Files Modified

| File | Changes |
|------|---------|
| `calculations.js` | All advances/payments summed (not per-contractor) |
| `LabourDetailScreen.js` | Added paidBy and contractorName to advances/payments |
| `AdvanceItem.js` | Display contractor name badge |
| `TransactionHistoryScreen.js` | Show contractor name with each transaction |
| `DashboardScreen.js` | Already correct - calculates from all data |
| `WeeklyReportScreen.js` | Already correct - uses shared data |

---

## Benefits

✅ **No More Data Conflicts**
- Single source of truth for each worker

✅ **Perfect Transparency**
- Each contractor sees what the other paid/advanced

✅ **Accurate Calculations**
- Balance sheet is identical for both contractors

✅ **Audit Trail**
- Every payment/advance shows who made it

✅ **Same Worker, Multiple Sites**
- Worker can work for both contractors on same day
- Both track in transaction history
- Financial summaries are consistent

---

## Testing Checklist

- [ ] Create worker as Shivaji
- [ ] Give ₹500 advance (Shivaji's account)
- [ ] Login as Dattatray - sees same worker, same ₹500 advance
- [ ] Dattatray gives ₹300 advance
- [ ] Login as Shivaji - sees ₹500 + ₹300 = ₹800 total
- [ ] Dashboard shows same totals for both
- [ ] Transaction history shows "Paid by: Shivaji" and "Paid by: Dattatray"
- [ ] Weekly report totals match for both contractors

---

## Migration Notes

**Existing Data:**
- Old format with `contractorId` per advance still works
- Will automatically display with paidBy field
- Recommended: Add contractor info to old advances if needed

**New Data:**
- Always includes `paidBy` and `contractorName`
- Cleaner tracking and transparency
