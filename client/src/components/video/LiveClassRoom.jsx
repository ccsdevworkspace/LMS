import { useEffect, useState, useRef, useMemo } from 'react';
import {
  StreamCall,
  StreamTheme,
  ParticipantView,
  ParticipantsAudio,
  useCall,
  useCallStateHooks,
  CallingState,
  hasScreenShare,
  hasAudio,
  hasVideo,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ScreenShare,
  PhoneOff,
  Users,
  MessageSquare,
  Clock,
  Shield,
  Send,
  X,
  AlertTriangle,
} from 'lucide-react';
import { endLiveClass } from '../../api/liveClass';

function GoogleMeetCard({ participant, course, compact = false }) {
  if (!participant) return null;

  const isSpeaking = participant.isSpeaking;
  const isVideoMuted = !hasVideo(participant);
  const isAudioMuted = !hasAudio(participant);
  const isHost = participant.userId === course.createdById;
  const isLocal = participant.isLocalParticipant;

  return (
    <div
      className={`relative w-full h-full min-h-0 min-w-0 rounded-2xl sm:rounded-3xl overflow-hidden bg-[#1e1f20] border transition-all duration-200 flex items-center justify-center select-none shadow-md gm-participant-tile ${
        isSpeaking
          ? 'border-emerald-400/90 ring-2 ring-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.25)]'
          : 'border-neutral-800/80'
      }`}
    >
      {/* Video or Avatar */}
      {isVideoMuted ? (
        <div className="w-full h-full flex items-center justify-center bg-[#1e1f20] relative">
          <div
            className={`relative flex items-center justify-center rounded-full transition-all duration-300 ${
              isSpeaking ? 'ring-4 ring-emerald-400/40 scale-105' : ''
            }`}
          >
            {participant.image ? (
              <img
                src={participant.image}
                alt={participant.name || 'Participant'}
                className={`${
                  compact ? 'w-12 h-12' : 'w-18 h-18 sm:w-24 sm:h-24'
                } rounded-full object-cover border-2 border-white/10 shadow-xl`}
              />
            ) : (
              <div
                className={`${
                  compact
                    ? 'w-12 h-12 text-lg'
                    : 'w-18 h-18 sm:w-24 sm:h-24 text-2xl sm:text-3xl'
                } rounded-full bg-linear-to-br from-primary-600 to-teal-800 text-white font-bold flex items-center justify-center shadow-xl border-2 border-white/10`}
              >
                {(participant.name || participant.userId || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>
        </div>
      ) : (
        <ParticipantView
          participant={participant}
          muteAudio={true}
          mirror={isLocal}
          ParticipantViewUI={null}
          className="w-full h-full aspect-auto!"
        />
      )}

      {/* Bottom-left Glassmorphism Pill: Name, Role, Mic */}
      <div className="absolute bottom-2 left-2 z-10 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full text-white flex items-center gap-1.5 shadow-sm max-w-[90%] pointer-events-none">
        {/* Mic Status */}
        {isAudioMuted ? (
          <div className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
            <MicOff size={11} className="text-red-400" />
          </div>
        ) : (
          <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
            <Mic size={11} className="text-emerald-400" />
          </div>
        )}

        {/* Participant Name */}
        <span className="truncate font-medium text-[11px] sm:text-xs text-neutral-200">
          {participant.name || participant.userId}
          {isLocal && ' (You)'}
        </span>

        {/* Host Badge */}
        {isHost && (
          <span className="text-[9px] bg-primary-600/50 text-primary-300 font-bold px-1.5 py-0.5 rounded-full shrink-0 flex items-center gap-0.5">
            <Shield size={9} /> Host
          </span>
        )}
      </div>

      {/* Speaking subtle badge on top-right if speaking */}
      {isSpeaking && (
        <div className="absolute top-2 right-2 z-10 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          Speaking
        </div>
      )}
    </div>
  );
}

function GoogleMeetLayout({ course, call }) {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();
  const [showSelfPreview, setShowSelfPreview] = useState(false);

  // Check if anyone is screen sharing
  const screenSharingParticipant = participants.find((p) => hasScreenShare(p));
  const isLocalPresenter = screenSharingParticipant?.isLocalParticipant;

  const handleStopSharing = async () => {
    try {
      if (call?.screenShare) {
        await call.screenShare.disable();
      }
    } catch (err) {
      console.error('Error stopping screen share:', err);
    }
  };

  // Sort participants: Host/Instructor first, then active speakers, then others
  const sortedParticipants = useMemo(() => {
    const list = [...participants];
    list.sort((a, b) => {
      const isAHost = a.userId === course.createdById;
      const isBHost = b.userId === course.createdById;
      if (isAHost && !isBHost) return -1;
      if (!isAHost && isBHost) return 1;
      if (a.isDominantSpeaker && !b.isDominantSpeaker) return -1;
      if (!a.isDominantSpeaker && b.isDominantSpeaker) return 1;
      return 0;
    });
    return list;
  }, [participants, course.createdById]);

  // If someone is screen sharing: Spotlight view
  if (screenSharingParticipant) {
    const otherParticipants = participants.filter(
      (p) => p.sessionId !== screenSharingParticipant.sessionId
    );

    return (
      <div className="h-full w-full flex flex-col md:flex-row overflow-hidden gap-2">
        {/* Screen Share Stage */}
        <div className="flex-1 h-[62%] sm:h-[66%] md:h-full w-full min-h-0 relative p-1">
          {isLocalPresenter && !showSelfPreview ? (
            /* Google Meet Presenter Card (Prevents infinite mirror loop and echo) */
            <div className="w-full h-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-[#1e1f20] border border-neutral-800 p-6 flex flex-col items-center justify-center text-center shadow-xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-primary-600/20 text-primary-400 border border-primary-500/30 flex items-center justify-center mb-4 shadow-inner">
                <ScreenShare size={32} className="sm:w-10 sm:h-10 text-primary-400" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1.5">
                You're presenting to everyone
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mb-6 leading-relaxed">
                To prevent an infinite mirror loop and audio echo, your screen feed is hidden here. Everyone else in the live class can see your presentation.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleStopSharing}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold text-xs sm:text-sm px-5 py-2.5 rounded-full shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <PhoneOff size={15} />
                  Stop presenting
                </button>

                <button
                  type="button"
                  onClick={() => setShowSelfPreview(true)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-medium text-xs sm:text-sm px-4 py-2.5 rounded-full border border-neutral-700 transition-all active:scale-95 cursor-pointer"
                >
                  View presentation
                </button>
              </div>
            </div>
          ) : (
            /* Standard Screen Share View (For viewers or presenter with preview enabled) */
            <div className="w-full h-full relative rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl flex items-center justify-center gm-screenshare-tile">
              <ParticipantView
                participant={screenSharingParticipant}
                trackType="screenShareTrack"
                muteAudio={true}
                ParticipantViewUI={null}
                className="w-full h-full"
              />
              <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-auto">
                <div className="bg-black/75 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1.5 shadow">
                  <ScreenShare size={14} className="text-primary-400" />
                  <span>
                    {isLocalPresenter
                      ? 'Your Screen (Preview)'
                      : `${screenSharingParticipant.name || 'User'}'s Screen`}
                  </span>
                </div>
                {isLocalPresenter && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSelfPreview(false)}
                      className="bg-black/75 backdrop-blur-md hover:bg-neutral-800 text-neutral-300 hover:text-white px-3 py-1.5 rounded-full text-xs font-medium border border-neutral-700 transition-colors cursor-pointer"
                    >
                      Hide preview
                    </button>
                    <button
                      type="button"
                      onClick={handleStopSharing}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer"
                    >
                      Stop presenting
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Other participants thumbnail strip */}
        <div className="h-[38%] sm:h-[34%] md:h-full w-full md:w-60 lg:w-72 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto p-1 scrollbar-none shrink-0">
          {!isLocalPresenter && (
            <div className="w-48 sm:w-56 md:w-full h-full md:h-40 shrink-0">
              <GoogleMeetCard participant={screenSharingParticipant} course={course} compact />
            </div>
          )}
          {otherParticipants.map((p) => (
            <div key={p.sessionId} className="w-48 sm:w-56 md:w-full h-full md:h-40 shrink-0">
              <GoogleMeetCard participant={p} course={course} compact />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard Video Call Grids (Google Meet style)
  const count = sortedParticipants.length;

  if (count <= 1) {
    return (
      <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
        <div className="w-full h-full max-w-4xl max-h-full">
          <GoogleMeetCard participant={sortedParticipants[0]} course={course} />
        </div>
      </div>
    );
  }

  if (count === 2) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1 gap-2 sm:gap-4 h-full w-full p-1.5 sm:p-3">
        {sortedParticipants.map((p) => (
          <div key={p.sessionId} className="w-full h-full min-h-0 min-w-0">
            <GoogleMeetCard participant={p} course={course} />
          </div>
        ))}
      </div>
    );
  }

  if (count === 3) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 md:grid-cols-3 md:grid-rows-1 gap-2 sm:gap-3 h-full w-full p-1.5 sm:p-3">
        {/* On mobile: first participant (instructor) takes top half */}
        {/* On desktop: all 3 take equal columns */}
        <div className="col-span-2 md:col-span-1 row-span-1 w-full h-full min-h-0 min-w-0">
          <GoogleMeetCard participant={sortedParticipants[0]} course={course} />
        </div>
        <div className="col-span-1 row-span-1 w-full h-full min-h-0 min-w-0">
          <GoogleMeetCard participant={sortedParticipants[1]} course={course} />
        </div>
        <div className="col-span-1 row-span-1 w-full h-full min-h-0 min-w-0">
          <GoogleMeetCard participant={sortedParticipants[2]} course={course} />
        </div>
      </div>
    );
  }

  if (count === 4) {
    return (
      <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3 h-full w-full p-1.5 sm:p-3">
        {sortedParticipants.map((p) => (
          <div key={p.sessionId} className="w-full h-full min-h-0 min-w-0">
            <GoogleMeetCard participant={p} course={course} />
          </div>
        ))}
      </div>
    );
  }

  if (count === 5 || count === 6) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 grid-rows-3 md:grid-rows-2 gap-2 sm:gap-3 h-full w-full p-1.5 sm:p-3">
        {sortedParticipants.map((p) => (
          <div key={p.sessionId} className="w-full h-full min-h-0 min-w-0">
            <GoogleMeetCard participant={p} course={course} />
          </div>
        ))}
      </div>
    );
  }

  // > 6 participants
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 overflow-y-auto max-h-full h-full w-full p-1.5 sm:p-3">
      {sortedParticipants.map((p) => (
        <div key={p.sessionId} className="aspect-4/3 min-h-36 sm:min-h-48 w-full">
          <GoogleMeetCard participant={p} course={course} />
        </div>
      ))}
    </div>
  );
}

function MeetingControls({
  course,
  isOwner,
  onLeave,
  activePanel,
  setActivePanel,
  unreadCount = 0,
}) {
  const call = useCall();
  const {
    useMicrophoneState,
    useCameraState,
    useScreenShareState,
    useParticipants,
  } = useCallStateHooks();

  const { microphone, isMute: isMicMuted } = useMicrophoneState();
  const { camera, isMute: isCamMuted } = useCameraState();
  const { screenShare, isMute: isScreenShareDisabled } = useScreenShareState();
  const participants = useParticipants();

  const [showEndModal, setShowEndModal] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const toggleMicrophone = async () => {
    try {
      await microphone.toggle();
    } catch (err) {
      console.error('Error toggling microphone:', err);
    }
  };

  const toggleCamera = async () => {
    try {
      await camera.toggle();
    } catch (err) {
      console.error('Error toggling camera:', err);
    }
  };

  const toggleScreenShare = async () => {
    try {
      await screenShare.toggle();
    } catch (err) {
      console.error('Error toggling screen share:', err);
      if (err.name !== 'NotAllowedError') {
        alert(err?.message || 'Screen sharing is not supported or was denied.');
      }
    }
  };

  const handleEndClassForEveryone = async () => {
    try {
      setIsEnding(true);
      await endLiveClass(course.id);
      if (call) {
        await call.endCall();
      }
      onLeave();
    } catch (err) {
      console.error('Error ending class:', err);
      onLeave();
    } finally {
      setIsEnding(false);
      setShowEndModal(false);
    }
  };

  const handleLeaveJustMe = async () => {
    try {
      if (call) {
        await call.leave();
      }
      onLeave();
    } catch (err) {
      console.error('Error leaving call:', err);
      onLeave();
    }
  };

  return (
    <>
      {/* Bottom Control Bar */}
      <nav className="h-16 sm:h-20 bg-neutral-900/95 backdrop-blur border-t border-neutral-800 px-3 sm:px-6 flex items-center justify-between z-30 select-none shrink-0 pb-[env(safe-area-inset-bottom,0px)]">
        {/* Left Section: Course Info (Desktop only) */}
        <div className="hidden md:flex items-center gap-3 min-w-44">
          <span className="text-sm font-semibold text-neutral-300 truncate max-w-44">
            {course.name}
          </span>
          <span className="text-xs text-neutral-500 font-mono shrink-0">
            {course.section || 'Live Class'}
          </span>
        </div>

        {/* Center Section: Core Media & Interaction Buttons */}
        <div className="flex items-center justify-center gap-2 sm:gap-3 w-full md:w-auto mx-auto">
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleMicrophone}
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 shadow-md flex items-center justify-center ${
              !isMicMuted
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={!isMicMuted ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {!isMicMuted ? <Mic size={19} /> : <MicOff size={19} />}
          </button>

          {/* Camera Button */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 shadow-md flex items-center justify-center ${
              !isCamMuted
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={!isCamMuted ? 'Turn off camera' : 'Turn on camera'}
          >
            {!isCamMuted ? <VideoIcon size={19} /> : <VideoOff size={19} />}
          </button>

          {/* Screen Share Button (Available on mobile & desktop) */}
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 shadow-md flex items-center justify-center ${
              !isScreenShareDisabled
                ? 'bg-primary-600 text-white shadow-[0_0_12px_rgba(15,107,104,0.6)]'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title={!isScreenShareDisabled ? 'Stop sharing screen' : 'Share screen'}
          >
            <ScreenShare size={19} />
          </button>

          {/* Chat Button (Available on mobile & desktop) */}
          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
            className={`p-3 sm:p-3.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 shadow-md relative flex items-center justify-center ${
              activePanel === 'chat'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title="In-call chat"
          >
            <MessageSquare size={19} />
            {unreadCount > 0 && activePanel !== 'chat' && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Leave / End Call Button */}
          {isOwner ? (
            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ml-1"
              title="End class or leave"
            >
              <PhoneOff size={17} />
              <span className="hidden sm:inline">Leave</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLeaveJustMe}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ml-1"
              title="Leave call"
            >
              <PhoneOff size={17} />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>

        {/* Right Section: Participants Drawer (Desktop) */}
        <div className="hidden md:flex items-center gap-2 min-w-44 justify-end">
          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'participants' ? null : 'participants')}
            className={`p-3 rounded-full transition-all cursor-pointer relative ${
              activePanel === 'participants'
                ? 'bg-primary-600 text-white'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
            title="Participants"
          >
            <Users size={19} />
            <span className="absolute -top-1 -right-1 bg-neutral-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {participants.length}
            </span>
          </button>
        </div>
      </nav>

      {/* Instructor End Class Options Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-neutral-900 border border-neutral-800 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-5">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 text-red-400 rounded-2xl shrink-0">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold">Leave Live Class?</h3>
                <p className="text-sm text-neutral-400 mt-1 leading-relaxed">
                  As the instructor, you can end the live class session for all students or just leave temporarily.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleEndClassForEveryone}
                disabled={isEnding}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 active:scale-98"
              >
                {isEnding ? 'Ending class...' : 'End class for everyone'}
              </button>

              <button
                type="button"
                onClick={handleLeaveJustMe}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold py-3 px-4 rounded-xl text-sm transition-all cursor-pointer active:scale-98"
              >
                Leave class (keep room open)
              </button>

              <button
                type="button"
                onClick={() => setShowEndModal(false)}
                className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function MeetingSidePanel({ activePanel, onClose, course, isOwner }) {
  const { useParticipants, useLocalParticipant } = useCallStateHooks();
  const participants = useParticipants();
  const localParticipant = useLocalParticipant();
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const call = useCall();
  const chatEndRef = useRef(null);

  // Listen for custom chat events on the call
  useEffect(() => {
    if (!call) return;

    const unsubscribe = call.on('custom', (event) => {
      if (event.custom?.type === 'chat_message') {
        setChatMessages((prev) => [
          ...prev,
          {
            id: event.custom.id || Date.now().toString(),
            sender: event.custom.sender,
            text: event.custom.text,
            time: event.custom.time,
            isInstructor: event.custom.isInstructor,
          },
        ]);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [call]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !call) return;

    const messagePayload = {
      type: 'chat_message',
      id: `${Date.now()}_${Math.random()}`,
      sender: localParticipant?.name || localParticipant?.userId || 'User',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isInstructor: isOwner,
    };

    try {
      await call.sendCustomEvent(messagePayload);
      setInputMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!activePanel) return null;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Side Panel on Desktop / Bottom Sheet on Mobile */}
      <aside className="fixed inset-x-0 bottom-0 z-50 h-[82dvh] max-h-[82dvh] rounded-t-3xl md:static md:inset-auto md:h-full md:max-h-none md:w-80 lg:w-96 bg-neutral-900 border-t md:border-t-0 md:border-l border-neutral-800 flex flex-col shadow-2xl transition-all duration-300">
        {/* Mobile Drag Indicator */}
        <div className="md:hidden w-12 h-1.5 bg-neutral-700 rounded-full mx-auto my-2.5 shrink-0" />

        {/* Panel Header */}
        <div className="px-4 py-3 border-b border-neutral-800 flex items-center justify-between shrink-0">
          <h3 className="text-sm font-bold text-neutral-200">
            {activePanel === 'participants'
              ? `Participants (${participants.length})`
              : 'In-call Messages'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Panel Body */}
        {activePanel === 'participants' ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 min-h-0">
            {participants.map((p) => {
              const isCallHost = p.userId === course.createdById;
              const isParticipantAudioMuted = !hasAudio(p);
              const isParticipantVideoMuted = !hasVideo(p);

              return (
                <div
                  key={p.sessionId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/50 border border-neutral-800"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (p.name || 'U').charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-neutral-200 truncate">
                        {p.name || p.userId}
                        {p.isLocalParticipant && ' (You)'}
                      </span>
                      {isCallHost && (
                        <span className="text-[10px] text-primary-400 font-bold flex items-center gap-1">
                          <Shield size={10} /> Instructor / Host
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 shrink-0">
                    {isParticipantAudioMuted ? (
                      <MicOff size={16} className="text-red-400" />
                    ) : (
                      <Mic size={16} className="text-emerald-400" />
                    )}
                    {isParticipantVideoMuted && <VideoOff size={16} className="text-neutral-500" />}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* In-Call Chat */
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-0">
              {chatMessages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-xs text-center p-6">
                  <MessageSquare size={32} className="mb-2 opacity-50 text-neutral-400" />
                  <p>Messages can only be seen by people in the call and are deleted when the call ends.</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div key={msg.id} className="flex flex-col gap-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-neutral-300">{msg.sender}</span>
                      {msg.isInstructor && (
                        <span className="bg-primary-600/30 text-primary-400 px-1.5 py-0.2 rounded text-[10px] font-bold">
                          Host
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500">{msg.time}</span>
                    </div>
                    <div className="bg-neutral-800/80 text-neutral-200 p-2.5 rounded-2xl rounded-tl-none border border-neutral-800/60 leading-relaxed wrap-break-word">
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            <form
              onSubmit={handleSendMessage}
              className="p-3 border-t border-neutral-800 flex items-center gap-2 shrink-0 bg-neutral-900 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Send a message to everyone..."
                className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="p-2.5 bg-primary-600 hover:bg-btn-hover text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer shrink-0"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        )}
      </aside>
    </>
  );
}

function MeetingContainer({ course, isOwner, onLeave }) {
  const call = useCall();
  const { useCallCallingState, useParticipants } = useCallStateHooks();
  const callingState = useCallCallingState();
  const participants = useParticipants();

  const [activePanel, setActivePanel] = useState(null); // 'participants' | 'chat' | null
  const [unreadCount, setUnreadCount] = useState(0);
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [classEndedNotice, setClassEndedNotice] = useState(false);

  // Timer for live class duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTogglePanel = (panel) => {
    setActivePanel((prev) => {
      const next = prev === panel ? null : panel;
      if (next === 'chat') {
        setUnreadCount(0);
      }
      return next;
    });
  };

  // Track unread messages if chat panel is closed
  useEffect(() => {
    if (!call) return;

    const unsubscribe = call.on('custom', (event) => {
      if (event.custom?.type === 'chat_message') {
        if (activePanel !== 'chat') {
          setUnreadCount((prev) => prev + 1);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [call, activePanel]);

  // Listen for call ended event
  useEffect(() => {
    if (!call) return;

    const unsubscribe = call.on('call.ended', () => {
      setClassEndedNotice(true);
      setTimeout(() => {
        onLeave();
      }, 3500);
    });

    return () => {
      unsubscribe();
    };
  }, [call, onLeave]);

  // Handle callingState changes
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      onLeave();
    }
  }, [callingState, onLeave]);

  const formatTimer = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    return hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="fixed inset-0 h-dvh max-h-dvh w-full bg-neutral-950 text-white overflow-hidden select-none flex flex-col z-40">
      {/* Top Header Bar */}
      <header className="h-12 sm:h-14 bg-neutral-900/90 backdrop-blur border-b border-neutral-800 px-3 sm:px-6 flex items-center justify-between z-20 shrink-0">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 bg-red-500/15 text-red-400 border border-red-500/25 px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-neutral-300">
            <Clock size={12} className="text-neutral-400" />
            <span>{formatTimer(callDurationSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-200 hidden sm:inline truncate max-w-44">
            {course.name}
          </span>

          {/* Participants Toggle Pill (Google Meet mobile style) */}
          <button
            type="button"
            onClick={() => handleTogglePanel('participants')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activePanel === 'participants'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700/60'
            }`}
            title="View participants"
          >
            <Users size={13} />
            <span>{participants.length}</span>
          </button>

          <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-800/80 border border-neutral-700/50 px-2 py-0.5 rounded-full">
            {isOwner ? 'Instructor' : 'Student'}
          </span>
        </div>
      </header>

      {/* Main Video Area with side drawer */}
      <div className="flex-1 flex min-h-0 w-full overflow-hidden relative">
        <main className="flex-1 h-full w-full overflow-hidden p-1.5 sm:p-3 flex items-center justify-center bg-neutral-950">
          <StreamTheme className="h-full w-full">
            <ParticipantsAudio participants={participants} />
            <GoogleMeetLayout course={course} call={call} />
          </StreamTheme>
        </main>

        {/* Side Panel (Participants or In-call Chat) */}
        <MeetingSidePanel
          activePanel={activePanel}
          onClose={() => handleTogglePanel(null)}
          course={course}
          isOwner={isOwner}
        />
      </div>

      {/* Bottom Control Bar */}
      <MeetingControls
        course={course}
        isOwner={isOwner}
        onLeave={onLeave}
        activePanel={activePanel}
        setActivePanel={handleTogglePanel}
        unreadCount={unreadCount}
      />

      {/* Class Ended Banner Notice */}
      {classEndedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center">
              <PhoneOff size={28} />
            </div>
            <h3 className="text-xl font-bold text-white">Class Ended</h3>
            <p className="text-sm text-neutral-400 leading-relaxed">
              The live class has been ended by the instructor. Redirecting you back to your course...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveClassRoom({
  call,
  course,
  isOwner,
  onLeave,
  initialDevices,
}) {
  // Apply initial device settings upon joining
  useEffect(() => {
    if (!call) return;

    async function applyInitialDevices() {
      try {
        if (initialDevices?.isMicOn) {
          await call.microphone.enable();
        } else {
          await call.microphone.disable();
        }

        if (initialDevices?.isCamOn) {
          await call.camera.enable();
        } else {
          await call.camera.disable();
        }
      } catch (err) {
        console.warn('Error applying initial device state:', err);
      }
    }

    applyInitialDevices();
  }, [call, initialDevices]);

  return (
    <StreamCall call={call}>
      <MeetingContainer course={course} isOwner={isOwner} onLeave={onLeave} />
    </StreamCall>
  );
}
