# Contractor Testing Guide

## Contractor Login Credentials

### Contractor 1: Shivaji Kokate
```
Username: shivaji_kokate
Password: Shiv@2026
Contractor ID: contractor_1
```

### Contractor 2: Dattatray Jagtap
```
Username: dattatray_jagtap
Password: Datta@2026
Contractor ID: contractor_2
```

## Features to Test

### 1. **Separate Access**
- [ ] Login as Shivaji → See only Shivaji's workers
- [ ] Logout → Login as Dattatray → See only Dattatray's workers
- [ ] Workers don't mix between contractors

### 2. **Shared Worker Setup**
- [ ] Create worker "Shared Worker" via Shivaji's account
- [ ] Use `addWorkerToContractor()` to add to Dattatray
- [ ] Login as Dattatray → Should see "Shared Worker" in their list

### 3. **Independent Financial Tracking**
```
Test Case: Shared Worker Mahesh

Shivaji's View:
- Add Mahesh: Daily Rate ₹700
- Mark present 3 days = ₹2100 earned
- Give advance ₹500
- Should show to pay: ₹1600

Dattatray's View:
- Same worker Mahesh (via addWorkerToContractor)
- Daily Rate ₹600
- Mark present 2 days = ₹1200 earned
- Give advance ₹300
- Should show to pay: ₹900

IMPORTANT: Each contractor shows ONLY their own advances/payments
```

### 4. **Dashboard Auto-Refresh**
- [ ] Open Shivaji's dashboard
- [ ] Watch as it refreshes every 1 second
- [ ] Numbers update live

### 5. **Shared Worker Monitoring**
- [ ] Add same worker to both contractors
- [ ] Both can see worker's attendance on that day
- [ ] Each tracks their own advances/payments separately

## Scenario to Test

### Full Workflow

**Day 1: Setup**
1. Login as Shivaji
2. Add worker "Rajesh"
3. Mark Rajesh present for Site A
4. Give ₹500 advance

**Day 2: Add to Second Contractor**
1. Call: `addWorkerToContractor('rajesh_id', 'contractor_2')`
2. Logout
3. Login as Dattatray
4. Verify Rajesh appears in their worker list
5. Mark Rajesh present for Site B (same day)
6. Give ₹300 advance

**Day 3: Check Financials**
1. Login as Shivaji → Check Weekly Report
   - Rajesh earned: ₹? (based on daily rate × days)
   - Advance given: ₹500
   - Amount to pay: ₹?

2. Logout → Login as Dattatray → Check Weekly Report
   - Rajesh earned: ₹? (DIFFERENT daily rate)
   - Advance given: ₹300
   - Amount to pay: ₹?

**Expected Result**: Each contractor shows DIFFERENT calculations for same worker

## Firebase Verification

After first app launch, verify in Firebase Console:

### Collection: `contractors`
```json
{
  "contractor_1": {
    "username": "shivaji_kokate",
    "password": "Shiv@2026",
    "name": "Shivaji Kokate",
    "contractorId": "contractor_1"
  },
  "contractor_2": {
    "username": "dattatray_jagtap",
    "password": "Datta@2026",
    "name": "Dattatray Jagtap",
    "contractorId": "contractor_2"
  }
}
```

### Collection: `labours` (Example)
```json
{
  "rajesh_id": {
    "name": "Rajesh",
    "contractorIds": ["contractor_1", "contractor_2"],
    "advances": [
      { "date": "2026-01-02", "amount": 500, "contractorId": "contractor_1" },
      { "date": "2026-01-02", "amount": 300, "contractorId": "contractor_2" }
    ]
  }
}
```

## Troubleshooting

### Workers not appearing for second contractor
- Check if `addWorkerToContractor()` was called
- Verify `contractorIds` array in Firebase
- Restart app to refresh worker list

### Different advances showing
- This is CORRECT behavior
- Each contractor tracks independently
- Check the `contractorId` field in advances array

### Same worker showing twice
- This is NOT a bug
- Same worker can appear in both contractors' lists
- They are the same person, tracked separately per contractor
