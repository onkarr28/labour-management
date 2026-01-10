# Bug Fix: Worker Credentials Not Saving to Firebase

## Issue
When new workers were created, their login credentials (ID and password) were NOT being immediately saved to Firebase. This prevented workers from logging in with their newly created credentials.

## Root Cause
- `AddLabourScreen.js` was creating workers with credentials in local state only
- No immediate Firebase save for the worker's credentials
- Worker login system had no Firebase fallback

## Solution

### 1. New Service: `firebaseWorkers.js`
Created a new Firebase service to manage worker credentials and data:

```javascript
// Save worker credentials immediately after creation
saveWorkerCredentials(workerId, workerData)

// Authenticate worker by credentials
getWorkerByCredentials(loginId, password)

// Fetch worker by ID
getWorkerById(workerId)

// Get all workers for a contractor
getWorkersByContractor(contractorId)

// Add worker to additional contractor
addWorkerToContractorFB(workerId, contractorId)

// Delete worker from Firebase
deleteWorkerFromFirebase(workerId)
```

### 2. Updated `AddLabourScreen.js`
Now immediately saves worker credentials to Firebase:

```javascript
// When worker is created:
const newLabour = {
  id: `labour_${Date.now()}`,
  name: formData.name,
  loginId: credentials.loginId,
  password: credentials.password,
  contractorId: user?.contractorId,
  contractorIds: [user?.contractorId],  // Multi-contractor support
  // ... other fields
};

// IMMEDIATELY save to Firebase
await saveWorkerCredentials(newLabour.id, {
  name: newLabour.name,
  loginId: newLabour.loginId,
  password: newLabour.password,
  contractorId: user?.contractorId,
  contractorIds: [user?.contractorId],
  mobile: newLabour.mobile,
});
```

### 3. Updated `LoginScreen.js`
Enhanced login flow to check Firebase for worker credentials:

```javascript
const handleLogin = async () => {
  // First: Try contractor login
  let result = await login(username, password, state.labours);
  
  // Second: If contractor login fails, try worker login from Firebase
  if (!result.success) {
    const worker = await getWorkerByCredentials(username, password);
    if (worker) {
      result = { success: true, isWorker: true, worker };
    }
  }
  
  // Show result
  if (!result.success) {
    showToast('Login Failed', 'Invalid credentials', 'error');
  }
};
```

## Multi-Contractor Independent Tracking

✅ **Verified Working:**

### 1. Each Contractor Sees Only Their Workers
- **DashboardScreen.js** filters by `contractorId`:
```javascript
const contractorWorkers = useMemo(() => {
  return labours.filter(l => {
    const workerContractorIds = l.contractorIds || [l.contractorId];
    return workerContractorIds.includes(user?.contractorId);
  });
}, [labours, user?.contractorId]);
```

### 2. Shared Workers Tracked Independently
- Same worker can be in `contractorIds: ['contractor_1', 'contractor_2']`
- Each contractor's advances/payments stored with `contractorId` field:

```javascript
advances: [
  { date: '2026-01-05', amount: 500, contractorId: 'contractor_1' },
  { date: '2026-01-05', amount: 300, contractorId: 'contractor_2' }
]
```

### 3. Dashboard Shows Correct Numbers Per Contractor
- Weekly advances: Only sums advances from current contractor
- Weekly payout: Only calculates based on current contractor's advances
- Present today: Shows workers of current contractor

### 4. Auto-Refresh Every 1 Second
- Dashboard automatically refreshes to show real-time updates
- Each contractor sees only their own data

## Firebase Collections

### `contractors` Collection
```
contractor_1 → {
  contractorId: "contractor_1",
  name: "Shivaji Kokate",
  username: "shivaji_kokate",
  password: "Shiv@2026"
}

contractor_2 → {
  contractorId: "contractor_2",
  name: "Dattatray Jagtap",
  username: "dattatray_jagtap",
  password: "Datta@2026"
}
```

### `workers` Collection (NEW)
```
labour_12345 → {
  id: "labour_12345",
  name: "Rajesh",
  loginId: "rajesh_001",
  password: "Raj@001",
  contractorIds: ["contractor_1", "contractor_2"],
  mobile: "9876543210",
  createdAt: "2026-01-05T10:30:00.000Z"
}
```

### `labours` Collection
```
labour_12345 → {
  id: "labour_12345",
  name: "Rajesh",
  contractorId: "contractor_1",
  contractorIds: ["contractor_1", "contractor_2"],
  advances: [
    { date: "2026-01-05", amount: 500, contractorId: "contractor_1" },
    { date: "2026-01-05", amount: 300, contractorId: "contractor_2" }
  ],
  payments: [
    { date: "2026-01-05", amount: 1000, contractorId: "contractor_1" }
  ],
  // ... other fields
}
```

## Testing Flow

### 1. Create Worker
```
1. Login as Shivaji Kokate (shivaji_kokate / Shiv@2026)
2. Go to "Add Labour"
3. Fill in worker details (e.g., "Rajesh", 9876543210, ₹700)
4. Note the generated credentials (e.g., rajesh_001 / Raj@001)
5. Worker credentials immediately saved to Firebase `workers` collection
```

### 2. Worker Login
```
1. Logout from contractor account
2. Enter worker credentials (rajesh_001 / Raj@001)
3. System checks:
   - First: Contractor credentials (fails)
   - Second: Worker credentials in Firebase (succeeds!)
4. Worker dashboard loads
```

### 3. Shared Worker Setup
```
1. From Shivaji's account: Create worker "Mahesh"
   → Credentials: mahesh_001 / Mah@001
   → Saved to Firebase immediately

2. Use admin function to add to Dattatray:
   → addWorkerToContractorFB('labour_xyz', 'contractor_2')
   → Updates contractorIds array

3. Login as Dattatray:
   → Sees "Mahesh" in worker list
   → Can track independently
   → Advances tracked separately

4. Mahesh logs in with mahesh_001 / Mah@001:
   → Can be assigned to work for both contractors
   → Can view both dashboards (if implemented)
```

## Backward Compatibility

✅ Old format (single `contractorId`) still works:
```javascript
// Old format
const workerContractorIds = l.contractorIds || (l.contractorId ? [l.contractorId] : []);
```

✅ Existing workers automatically supported in multi-contractor system

## Files Modified

1. **NEW**: `src/services/firebaseWorkers.js` - Worker credential management
2. **MODIFIED**: `src/screens/AddLabourScreen.js` - Save credentials immediately
3. **MODIFIED**: `src/screens/LoginScreen.js` - Check Firebase for worker credentials

## Next Steps

1. ✅ Test worker creation (credentials now saved immediately)
2. ✅ Test worker login (Firebase credentials work)
3. ✅ Test contractor sees only their workers
4. ✅ Test shared worker is tracked independently
5. ✅ Test advances/payments separated by contractor

## Commands to Test

```bash
# Restart dev server
cd construction-labour-app
npx expo start -c

# Create a new worker - credentials automatically saved to Firebase
# Login as the new worker - credentials fetched from Firebase
# Check Firebase Console → Collections:
#   - workers (NEW)
#   - contractors
#   - labours
```
