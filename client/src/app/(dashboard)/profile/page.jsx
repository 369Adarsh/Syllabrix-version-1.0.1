'use client';
import { useAuth } from '@/contexts/AuthContext';
import ProfileView from '@/components/profile/ProfileView';
export default function ProfilePage() { const { user } = useAuth(); return <ProfileView userId={user?.id} />; }
