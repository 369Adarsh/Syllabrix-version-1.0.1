'use client';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import ProfileView from '@/components/profile/ProfileView';
export default function UserProfilePage() { const { userId } = useParams(); const { user } = useAuth(); return <ProfileView userId={userId} />; }
