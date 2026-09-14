import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StreamVideoClient, StreamVideo } from '@stream-io/video-react-sdk';
import { useUserStore } from '../stores/user';
import {
  getLiveClassStatus,
  createLiveClass,
  getLiveClassToken,
} from '../api/liveClass';
import LiveClassLobby from '../components/video/LiveClassLobby';
import LiveClassRoom from '../components/video/LiveClassRoom';
import Loading from '../components/app/Loading';
import EmptyState from '../components/app/EmptyState';
import { BookX, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LiveClassPage() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const profile = useUserStore((s) => s.profile);
  const fetchProfile = useUserStore((s) => s.fetchProfile);

  const [loading, setLoading] = useState(true);
  const [courseData, setCourseData] = useState(null);
  const [activeClass, setActiveClass] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState(null);

  const [view, setView] = useState('lobby'); // 'lobby' | 'room'
  const [streamClient, setStreamClient] = useState(null);
  const [currentCall, setCurrentCall] = useState(null);
  const [initialDevices, setInitialDevices] = useState({ isMicOn: true, isCamOn: true });
  const [loadingAction, setLoadingAction] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (!profile && fetchProfile) {
      fetchProfile().catch(() => {});
    }
  }, [profile, fetchProfile]);

  useEffect(() => {
    let ignore = false;

    const fetchStatus = async () => {
      try {
        setError(null);
        const data = await getLiveClassStatus(courseId);
        if (!ignore) {
          setCourseData(data.course);
          setIsOwner(data.isOwner);
          setActiveClass(data.active ? data.liveClass : null);
        }
      } catch (err) {
        if (!ignore) {
          console.error('Error fetching live class status:', err);
          setError(err.response?.data?.error || 'Failed to access live classroom');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    if (courseId) {
      fetchStatus();
    }

    return () => {
      ignore = true;
    };
  }, [courseId]);

  const refreshStatus = async () => {
    setIsRefreshing(true);
    setActionError(null);
    try {
      const data = await getLiveClassStatus(courseId);
      setCourseData(data.course);
      setIsOwner(data.isOwner);
      setActiveClass(data.active ? data.liveClass : null);
    } catch (err) {
      console.error('Error refreshing live class status:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle teacher creating the live class
  const handleCreateClass = async ({ isMicOn, isCamOn }) => {
    try {
      setLoadingAction(true);
      setActionError(null);
      setInitialDevices({ isMicOn, isCamOn });

      const res = await createLiveClass(courseId);
      const { callId, apiKey, token, user } = res;

      const client = new StreamVideoClient({
        apiKey,
        user: {
          id: user?.id || profile?.id || 'instructor',
          name: user?.name || profile?.fullName || 'Instructor',
          image: user?.image || profile?.avatarUrl || undefined,
        },
        token,
      });

      const call = client.call('default', callId);
      await call.join({ create: true });

      setStreamClient(client);
      setCurrentCall(call);
      setView('room');
    } catch (err) {
      console.error('Failed to create live class:', err);
      setActionError(err.response?.data?.error || 'Failed to start live class session');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle student joining an active live class
  const handleProceedToClass = async ({ isMicOn, isCamOn }) => {
    if (!activeClass?.callId) {
      setActionError('No active live class found. Please wait for your instructor to begin.');
      return;
    }

    try {
      setLoadingAction(true);
      setActionError(null);
      setInitialDevices({ isMicOn, isCamOn });

      const authRes = await getLiveClassToken(courseId);
      const { apiKey, token, user } = authRes;

      const client = new StreamVideoClient({
        apiKey,
        user: {
          id: user.id,
          name: user.name,
          image: user.image,
        },
        token,
      });

      const call = client.call('default', activeClass.callId);
      await call.join();

      setStreamClient(client);
      setCurrentCall(call);
      setView('room');
    } catch (err) {
      console.error('Failed to join live class:', err);
      setActionError(err.response?.data?.error || 'Failed to join live class session');
    } finally {
      setLoadingAction(false);
    }
  };

  // Cleanup on leaving the room
  const handleLeaveRoom = async () => {
    if (streamClient) {
      try {
        await streamClient.disconnectUser();
      } catch (err) {
        console.warn('Error disconnecting Stream client:', err);
      }
    }
    setStreamClient(null);
    setCurrentCall(null);
    navigate(`/courses/${courseId}`);
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !courseData) {
    return (
      <EmptyState
        icon={BookX}
        title="Live Classroom"
        accent="Unavailable"
        description={error || 'Course not found or access denied.'}
      >
        <Link
          to={`/courses/${courseId || ''}`}
          className="flex items-center gap-2 p-3 rounded-xl bg-primary-600 text-sm font-medium text-fg-inverse dark:text-fg hover:bg-btn-hover transition-colors"
        >
          Back to Course
          <ArrowRight size={16} />
        </Link>
      </EmptyState>
    );
  }

  if (view === 'room' && streamClient && currentCall) {
    return (
      <StreamVideo client={streamClient}>
        <LiveClassRoom
          call={currentCall}
          course={courseData}
          isOwner={isOwner}
          onLeave={handleLeaveRoom}
          initialDevices={initialDevices}
        />
      </StreamVideo>
    );
  }

  return (
    <LiveClassLobby
      course={courseData}
      isOwner={isOwner}
      activeClass={activeClass}
      user={profile}
      onCreateClass={handleCreateClass}
      onProceed={handleProceedToClass}
      onRefresh={refreshStatus}
      loadingAction={loadingAction}
      isRefreshing={isRefreshing}
      actionError={actionError}
      onDismissError={() => setActionError(null)}
    />
  );
}
