/**
 * INSTALLATION GUIDE
 * 
 * This is a complete React Native/Expo application for Construction Labour Management.
 * Follow these steps to get started:
 */

/* ============================================
   STEP 1: ENVIRONMENT SETUP
   ============================================ */

// Prerequisites:
// - Node.js v16+ (https://nodejs.org)
// - npm or yarn (comes with Node.js)
// - Expo CLI: npm install -g expo-cli

/* ============================================
   STEP 2: INSTALL DEPENDENCIES
   ============================================ */

// Navigate to project directory
cd construction-labour-app

// Install all dependencies
npm install

// Alternative: using yarn
yarn install

/* ============================================
   STEP 3: START DEVELOPMENT SERVER
   ============================================ */

// Start Expo development server
npm start
yarn start

// You'll see a menu:
// Press a => Open Android emulator
// Press i => Open iOS simulator
// Press w => Open in web browser
// Press q => Quit

/* ============================================
   STEP 4: TEST ON DEVICE
   ============================================ */

// Option A: Physical Device
// 1. Install Expo Go app from App Store/Play Store
// 2. Scan QR code shown in terminal
// 3. App will open in Expo Go

// Option B: Emulator/Simulator
// 1. Have Android emulator or iOS simulator running
// 2. Press 'a' or 'i' in terminal

/* ============================================
   FEATURES READY TO USE
   ============================================ */

Features Included:

✓ Dashboard with summary statistics
✓ Worker management (add, edit, delete)
✓ Real-time attendance tracking
✓ Calendar interface for attendance
✓ Advance recording and tracking
✓ Weekly payroll reports
✓ Financial ledger (Khata) system
✓ Search and filter workers
✓ Beautiful pastel UI design
✓ Offline-first data storage
✓ Automatic calculations

/* ============================================
   FILE STRUCTURE
   ============================================ */

Key Directories:

src/screens/         - All app screens (6 main screens)
src/components/      - Reusable UI components
src/context/         - State management (LabourContext)
src/utils/           - Helper functions
src/constants/       - Colors and typography

/* ============================================
   QUICK START WORKFLOW
   ============================================ */

1. Start the server: npm start
2. Open on device/emulator
3. Tap "Add New Labour" to add your first worker
4. Mark attendance using the calendar
5. View worker details and financial summary
6. Check weekly reports

/* ============================================
   CUSTOMIZATION
   ============================================ */

Customize colors:
→ Edit: src/constants/colors.js

Customize fonts/typography:
→ Edit: src/constants/typography.js

Add new screens:
→ Create file in: src/screens/
→ Update navigation in: App.js

/* ============================================
   COMMON COMMANDS
   ============================================ */

Start development:           npm start
Start with Android:          npm run android
Start with iOS:              npm run ios
Start web version:           npm run web
Install dependencies:        npm install
Update dependencies:         npm update
Clear cache:                 expo start -c

/* ============================================
   TROUBLESHOOTING
   ============================================ */

Problem: "Module not found"
Solution: npm install (run again)

Problem: "Port 19000 is already in use"
Solution: expo start -c (clear cache)
          or kill the process on port 19000

Problem: "Permission denied"
Solution: chmod +x node_modules/.bin/*

Problem: "AsyncStorage not working"
Solution: Ensure @react-native-async-storage/async-storage is installed

/* ============================================
   BUILDING FOR PRODUCTION
   ============================================ */

Using Expo (Recommended):

For iOS:
$ eas build --platform ios
$ eas submit --platform ios

For Android:
$ eas build --platform android
$ eas submit --platform android

/* ============================================
   DOCUMENTATION
   ============================================ */

See README.md for:
- Detailed feature documentation
- Data structure schemas
- Calculation formulas
- Security information
- Testing scenarios

/* ============================================
   SUPPORT
   ============================================ */

Documentation: See README.md
React Native: https://reactnative.dev/
Expo Docs: https://docs.expo.dev/
React Navigation: https://reactnavigation.org/

/* ============================================
   YOU'RE ALL SET! 🚀
   ============================================ */

Your Labour Management app is ready to use!
Start building and customizing it for your needs.

Happy coding! 💻👷‍♂️

*/
