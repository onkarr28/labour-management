# Construction Labour Management Mobile App

A production-ready React Native/Expo application designed for contractors to manage daily workers, track attendance, record advances, and automate weekly salary calculations.

## Features

✨ **Complete Labour Management System**
- Worker profile management with photo capture
- Real-time attendance tracking with calendar interface
- Financial ledger (Khata) system with advance management
- Weekly salary calculations and payroll reports
- Dashboard with summary statistics

🎨 **Beautiful Pastel Design**
- Soft, professional pastel color scheme
- Smooth animations and transitions
- Responsive UI for different screen sizes
- Floating cards with subtle shadows

📱 **Mobile-First Approach**
- Offline-first architecture (no internet required)
- Fast and responsive performance
- Intuitive navigation with bottom tabs
- Touch-friendly interface (44px+ touchable areas)

💾 **Local Data Storage**
- All data stored locally using AsyncStorage
- No cloud dependency
- Backup and restore functionality
- Secure data management

## Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation 6.x (Stack + Bottom Tabs)
- **State Management**: React Context API with useReducer
- **Local Storage**: AsyncStorage
- **Icons**: lucide-react-native
- **Calendar**: react-native-calendars

## Project Structure

```
construction-labour-app/
├── src/
│   ├── screens/
│   │   ├── DashboardScreen.js          # Home dashboard
│   │   ├── LabourListScreen.js         # Worker list and search
│   │   ├── AddLabourScreen.js          # Add new worker form
│   │   ├── LabourDetailScreen.js       # Worker details and khata
│   │   ├── AttendanceCalendarScreen.js # Calendar attendance marking
│   │   └── WeeklyReportScreen.js       # Weekly payroll report
│   ├── components/
│   │   ├── SummaryCard.js              # Summary statistics card
│   │   ├── LabourCard.js               # Worker card component
│   │   ├── QuickActionButton.js        # Action button
│   │   ├── AdvanceItem.js              # Advance transaction item
│   │   └── WeeklySummaryCard.js        # Weekly summary card
│   ├── context/
│   │   └── LabourContext.js            # Global state management
│   ├── utils/
│   │   ├── calculations.js             # Financial calculations
│   │   ├── dateHelpers.js              # Date utilities
│   │   └── storage.js                  # AsyncStorage operations
│   └── constants/
│       ├── colors.js                   # Color palette and theme
│       └── typography.js               # Typography styles
├── App.js                              # Navigation and app entry
└── package.json                        # Dependencies
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- npm or yarn
- Expo CLI: `npm install -g expo-cli`

### Installation Steps

```bash
# 1. Navigate to the project directory
cd construction-labour-app

# 2. Install dependencies
npm install
# or
yarn install

# 3. Start the Expo development server
npm start

# 4. Choose platform:
#    - Press 'a' for Android emulator
#    - Press 'i' for iOS simulator
#    - Press 'w' for web browser
#    - Scan QR code with Expo Go app on physical device
```

## Usage Guide

### Adding Workers
1. Tap **"Add New Labour"** on Dashboard or **"+"** button on Labour tab
2. Fill worker details:
   - Name (3+ characters)
   - Mobile number (10 digits)
   - Daily rate (₹200-₹5000)
   - Trade/Skill (dropdown)
   - Joining date
3. Tap **"Add Worker"**

### Marking Attendance
1. Go to **Workers** tab → Select a worker
2. Tap **"Mark Attendance"**
3. Calendar view opens
4. Tap any date to mark Present/Absent
5. Long press to record advances

### Recording Advances
1. From attendance calendar: Long press a date
2. Enter advance amount and optional note
3. Tap **"Save"**

### Viewing Financial Summary
1. Go to **Workers** tab → Select worker → **"View Details"**
2. See:
   - Days worked (lifetime)
   - Amount earned
   - Total advances
   - Net payable amount

### Weekly Report
1. Tap **"Reports"** tab
2. View:
   - Active workers this week
   - Total payout required
   - Total advances given
   - Worker-wise breakdown table
   - Payday checklist

## Color Palette (Pastel Theme)

| Color | Hex Code | Usage |
|-------|----------|-------|
| Primary Pink | #FFB6C1 | Primary actions |
| Mint Green | #B0E0D8 | Secondary actions |
| Pastel Blue | #BFDBFE | Information |
| Background | #FAFAFA | App background |
| Card | #FFFFFF | Card backgrounds |
| Text Primary | #2D3748 | Main text |
| Text Secondary | #718096 | Secondary text |
| Success Green | #86EFAC | Positive actions |
| Error Red | #FCA5A5 | Errors, negatives |
| Warning Orange | #FED7AA | Warnings |

## Data Structure

### Worker Object
```javascript
{
  id: 'unique-uuid',
  photo: 'base64-string-or-uri',
  name: 'Worker Name',
  mobile: '9876543210',
  dailyRate: 600,
  joiningDate: '2025-01-01',
  trade: 'Mason',
  attendance: {
    '2025-01-01': { status: 'present', marked: true },
    '2025-01-02': { status: 'absent', marked: true }
  },
  advances: [
    { date: '2025-01-01', amount: 500, note: 'Emergency' }
  ],
  totalAdvance: 500,
  currentBalance: 1200
}
```

## Calculations

### Important Formulas

**Earned Amount** = Days Present × Daily Rate

**Total Advances** = Sum of all advance amounts

**Net Payable** = Earned Amount - Total Advances

**Attendance Percentage** = (Days Present / Total Working Days) × 100

**Advance Ratio** = (Total Advances / Earned Amount) × 100

## Edge Cases Handled

✓ No workers added (empty state)
✓ No attendance marked for month
✓ Worker with no photo (placeholder)
✓ Duplicate mobile numbers (validation)
✓ Negative balance (advance > earned)
✓ Future dates (disabled)
✓ Storage errors (graceful handling)

## Performance Optimizations

- **Lazy Loading**: Photos load on demand
- **Memoization**: React.memo for list cards
- **Pagination**: For 50+ workers
- **Debouncing**: 300ms search delay
- **Efficient Calculations**: Cache balances
- **Image Compression**: Max 200KB

## Accessibility Features

✓ Minimum 44x44px touchable areas
✓ 4.5:1 color contrast ratio
✓ Screen reader support
✓ Font size respects device settings
✓ Text alternatives for icons

## Security & Privacy

✓ Fully offline (no external servers)
✓ Local storage only
✓ No unnecessary permissions
✓ Data encryption supported
✓ Secure deletion available

## Testing Scenarios

- Add 10+ workers with different rates
- Mark full month attendance
- Record multiple advances
- Calculate weekly payouts
- Edit and delete workers
- Test with 100+ workers
- Verify data persistence
- Test all edge cases

## Future Enhancements

- [ ] Biometric/PIN app lock
- [ ] Advanced analytics dashboard
- [ ] SMS reminders
- [ ] Cloud backup option
- [ ] Multi-site support
- [ ] Contractor hierarchy
- [ ] Expense tracking
- [ ] Dark mode toggle
- [ ] Multiple language support
- [ ] PDF report generation

## Troubleshooting

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start
```

### Photos not saving
- Check device storage permission
- Ensure AsyncStorage has permission
- Restart app

### Data not persisting
- Check AsyncStorage setup
- Verify MMKV installation (if using)
- Check device storage limits

## Build for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## Support & Documentation

- [React Native Docs](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)

## License

MIT License - Feel free to use this project

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**Built for Construction Site Managers** 👷‍♂️

*Making labour management simple, transparent, and efficient*
