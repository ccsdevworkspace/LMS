import { useEffect, useState, useRef } from 'react';
import {
  StreamCall,
  StreamTheme,
  SpeakerLayout,
  PaginatedGridLayout,
  useCall,
  useCallStateHooks,
  CallingState,
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
  LayoutGrid,
  Clock,
  Shield,
  Send,
  X,
  AlertTriangle,
} from 'lucide-react';
import { endLiveClass } from '../../api/liveClass';

function MeetingControls({
  course,
  isOwner,
  onLeave,
  layout,
  setLayout,
  activePanel,
  setActivePanel,
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
      {/* Google Meet Style Bottom Control Bar */}
      <nav className="h-20 bg-neutral-900/95 backdrop-blur border-t border-neutral-800 px-4 sm:px-8 flex items-center justify-between z-30 select-none">
        {/* Left Section: Time & Info */}
        <div className="hidden md:flex items-center gap-3 min-w-50">
          <span className="text-sm font-semibold text-neutral-300 truncate max-w-45">
            {course.name}
          </span>
          <span className="text-xs text-neutral-500 font-mono">
            {course.section || 'Live Class'}
          </span>
        </div>

        {/* Center Section: Core Media & Interaction Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto">
          {/* Microphone Button */}
          <button
            type="button"
            onClick={toggleMicrophone}
            className={`p-3.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 shadow-md flex items-center justify-center ${
              !isMicMuted
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={!isMicMuted ? 'Turn off microphone' : 'Turn on microphone'}
          >
            {!isMicMuted ? <Mic size={20} /> : <MicOff size={20} />}
          </button>

          {/* Camera Button */}
          <button
            type="button"
            onClick={toggleCamera}
            className={`p-3.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 shadow-md flex items-center justify-center ${
              !isCamMuted
                ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={!isCamMuted ? 'Turn off camera' : 'Turn on camera'}
          >
            {!isCamMuted ? <VideoIcon size={20} /> : <VideoOff size={20} />}
          </button>

          {/* Screen Share Button */}
          <button
            type="button"
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 shadow-md hidden sm:flex items-center justify-center ${
              !isScreenShareDisabled
                ? 'bg-primary-600 text-white shadow-[0_0_12px_rgba(15,107,104,0.6)]'
                : 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700'
            }`}
            title={!isScreenShareDisabled ? 'Stop sharing screen' : 'Share entire screen'}
          >
            <ScreenShare size={20} />
          </button>

          {/* Layout Switcher */}
          <button
            type="button"
            onClick={() => setLayout(layout === 'speaker' ? 'grid' : 'speaker')}
            className={`p-3.5 rounded-full transition-all duration-200 cursor-pointer active:scale-95 hidden sm:flex items-center justify-center ${
              layout === 'grid'
                ? 'bg-primary-600 text-white'
                : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700'
            }`}
            title={layout === 'speaker' ? 'Switch to Grid view' : 'Switch to Speaker view'}
          >
            <LayoutGrid size={20} />
          </button>

          {/* Leave / End Call Button (Google Meet Red Pill) */}
          {isOwner ? (
            <button
              type="button"
              onClick={() => setShowEndModal(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ml-2"
              title="End class or leave"
            >
              <PhoneOff size={18} />
              <span className="hidden sm:inline">Leave</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleLeaveJustMe}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer active:scale-95 ml-2"
              title="Leave call"
            >
              <PhoneOff size={18} />
              <span className="hidden sm:inline">Leave</span>
            </button>
          )}
        </div>

        {/* Right Section: Drawers & Utility */}
        <div className="flex items-center gap-2 min-w-50 justify-end">
          {/* Participants Toggle */}
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

          {/* In-Call Chat Toggle */}
          <button
            type="button"
            onClick={() => setActivePanel(activePanel === 'chat' ? null : 'chat')}
            className={`p-3 rounded-full transition-all cursor-pointer ${
              activePanel === 'chat'
                ? 'bg-primary-600 text-white'
                : 'text-neutral-300 hover:bg-neutral-800'
            }`}
            title="Meeting Chat"
          >
            <MessageSquare size={19} />
          </button>
        </div>
      </nav>

      {/* Instructor End Class Options Modal */}
      {showEndModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
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
                className="w-full py-2 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors"
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
      // NOTE: Do NOT manually push to chatMessages here.
      // sendCustomEvent fires the 'custom' event for all participants including
      // the sender, so the listener above already handles adding it.
      setInputMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  if (!activePanel) return null;

  return (
    <aside className="w-full sm:w-80 md:w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col h-full z-20 transition-all duration-300">
      {/* Panel Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
        <h3 className="text-sm font-bold text-neutral-200">
          {activePanel === 'participants' ? `Participants (${participants.length})` : 'In-call Messages'}
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
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          {participants.map((p) => {
            const isCallHost = p.userId === course.createdById;
            return (
              <div
                key={p.sessionId}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-800/40 border border-neutral-800"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {p.image ? (
                      <img src={p.image} alt={p.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      (p.name || 'U').charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-neutral-200 truncate">
                      {p.name || p.userId}
                    </span>
                    {isCallHost && (
                      <span className="text-[10px] text-primary-400 font-bold flex items-center gap-1">
                        <Shield size={10} /> Instructor / Host
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-neutral-400">
                  {p.isAudioMuted ? (
                    <MicOff size={16} className="text-red-400" />
                  ) : (
                    <Mic size={16} className="text-emerald-400" />
                  )}
                  {p.isVideoMuted && <VideoOff size={16} className="text-neutral-500" />}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* In-Call Chat */
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {chatMessages.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 text-xs text-center p-6">
                <MessageSquare size={32} className="mb-2 opacity-50" />
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

          <form onSubmit={handleSendMessage} className="p-3 border-t border-neutral-800 flex items-center gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Send a message to everyone..."
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-primary-500"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 bg-primary-600 hover:bg-btn-hover text-white rounded-xl disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </aside>
  );
}

function MeetingContainer({ course, isOwner, onLeave }) {
  const call = useCall();
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();

  const [layout, setLayout] = useState('speaker'); // 'speaker' or 'grid'
  const [activePanel, setActivePanel] = useState(null); // 'participants' | 'chat' | null
  const [callDurationSeconds, setCallDurationSeconds] = useState(0);
  const [classEndedNotice, setClassEndedNotice] = useState(false);

  // Timer for live class duration
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDurationSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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
    <div className="flex flex-col h-screen w-screen bg-neutral-950 text-white overflow-hidden select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-neutral-900/80 backdrop-blur border-b border-neutral-800/80 px-4 sm:px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-0.5 rounded-full text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <Clock size={13} />
            <span>{formatTimer(callDurationSeconds)}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-neutral-300 hidden sm:inline">
            {course.name}
          </span>
          <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
            {isOwner ? 'Instructor' : 'Student'}
          </span>
        </div>
      </header>

      {/* Main Video Area with side drawer */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 h-full w-full overflow-hidden p-3 sm:p-5 flex items-center justify-center bg-neutral-950">
          <StreamTheme className="h-full w-full">
            {layout === 'speaker' ? (
              <SpeakerLayout participantsBarPosition="bottom" />
            ) : (
              <PaginatedGridLayout />
            )}
          </StreamTheme>
        </main>

        {/* Side Panel (Participants or In-call Chat) */}
        <MeetingSidePanel
          activePanel={activePanel}
          onClose={() => setActivePanel(null)}
          course={course}
          isOwner={isOwner}
        />
      </div>

      {/* Bottom Control Bar */}
      <MeetingControls
        course={course}
        isOwner={isOwner}
        onLeave={onLeave}
        layout={layout}
        setLayout={setLayout}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
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
