import React from 'react';
import { View } from 'react-native';

// Simple icon placeholders
export const Home = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }} />
);

export const Users = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);

export const BarChart3 = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color }} />
);

export const Search = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: size/2 }} />
);

export const Wallet = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);

export const TrendingUp = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color }} />
);

export const ChevronLeft = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color }} />
);

export const ChevronRight = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color }} />
);

export const Trash2 = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);

export const Edit = ({ size = 24, color = '#000' }) => (
  <View style={{ width: size, height: size, backgroundColor: color, borderRadius: 4 }} />
);
