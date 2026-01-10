export const colors = {
  // Primary Colors
  primary: {
    pink: '#FFB6C1',      // Soft Pink
    mint: '#B0E0D8',      // Light Mint Green
    blue: '#BFDBFE',      // Soft Pastel Blue
  },
  
  // Background & Cards
  background: '#FAFAFA',  // Clean Off-White
  card: '#FFFFFF',        // Pure White
  
  // Text Colors
  text: {
    primary: '#2D3748',   // Dark Gray
    secondary: '#718096', // Medium Gray
  },
  
  // Status Colors
  success: '#86EFAC',     // Pastel Green
  error: '#FCA5A5',       // Pastel Red
  warning: '#FED7AA',     // Pastel Orange
  
  // Functional Colors
  border: '#E2E8F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
  disabled: '#CBD5E0',
};

export const theme = {
  colors,
  
  // Spacing
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  // Border Radius
  radius: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  
  // Shadow
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 3,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 5,
    },
  },
};
