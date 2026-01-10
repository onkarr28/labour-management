import React from 'react';
import {
  Home as LucideHome,
  Users as LucideUsers,
  User as LucideUser,
  BarChart3 as LucideBarChart3,
  Search as LucideSearch,
  Wallet as LucideWallet,
  TrendingUp as LucideTrendingUp,
  ChevronLeft as LucideChevronLeft,
  ChevronRight as LucideChevronRight,
  Trash2 as LucideTrash2,
  Edit as LucideEdit,
  Lock as LucideLock,
  LogOut as LucideLogOut,
  Eye as LucideEye,
  EyeOff as LucideEyeOff,
} from 'lucide-react-native';
import { colors } from '../constants/colors';

const defaultSize = 24;
const defaultColor = colors.text.primary;

export const Home = ({ size = defaultSize, color = defaultColor }) => (
  <LucideHome size={size} color={color} />
);

export const Users = ({ size = defaultSize, color = defaultColor }) => (
  <LucideUsers size={size} color={color} />
);

export const User = ({ size = defaultSize, color = defaultColor }) => (
  <LucideUser size={size} color={color} />
);

export const BarChart3 = ({ size = defaultSize, color = defaultColor }) => (
  <LucideBarChart3 size={size} color={color} />
);

export const Search = ({ size = defaultSize, color = defaultColor }) => (
  <LucideSearch size={size} color={color} />
);

export const Wallet = ({ size = defaultSize, color = defaultColor }) => (
  <LucideWallet size={size} color={color} />
);

export const TrendingUp = ({ size = defaultSize, color = defaultColor }) => (
  <LucideTrendingUp size={size} color={color} />
);

export const ChevronLeft = ({ size = defaultSize, color = defaultColor }) => (
  <LucideChevronLeft size={size} color={color} />
);

export const ChevronRight = ({ size = defaultSize, color = defaultColor }) => (
  <LucideChevronRight size={size} color={color} />
);

export const Trash2 = ({ size = defaultSize, color = defaultColor }) => (
  <LucideTrash2 size={size} color={color} />
);

export const Edit = ({ size = defaultSize, color = defaultColor }) => (
  <LucideEdit size={size} color={color} />
);

export const Lock = ({ size = defaultSize, color = defaultColor }) => (
  <LucideLock size={size} color={color} />
);

export const LogOut = ({ size = defaultSize, color = defaultColor }) => (
  <LucideLogOut size={size} color={color} />
);

export const Eye = ({ size = defaultSize, color = defaultColor }) => (
  <LucideEye size={size} color={color} />
);

export const EyeOff = ({ size = defaultSize, color = defaultColor }) => (
  <LucideEyeOff size={size} color={color} />
);
