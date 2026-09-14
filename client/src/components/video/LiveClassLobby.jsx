import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  ArrowLeft,
  Sparkles,
  Radio,
  Clock,
  RefreshCw,
  AlertCircle,
  X,
} from 'lucide-react';

export default function LiveClassLobby({
  course,
  isOwner,
  activeClass,
  user,
  onProceed,
  onCreateClass,
  onRefresh,
  loadingAction,
  isRefreshing,
  actionError,
  onDismissError,
}) {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [audioLevel, setAudioLevel] = useState(0);
  const [permissionError, setPermissionError] = useState(null);

  // Initialize media devices for preview
  useEffect(() => {
    let isMounted = true;

    async function initMedia() {
      try {
        setPermissionError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // Setup audio visualizer
        try {
          const AudioContext = window.AudioContext || window.webkitAudioContext;
          if (AudioContext) {
            const audioCtx = new AudioContext();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateMeter = () => {
              if (!analyserRef.current) return;
              analyserRef.current.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
              }
              const average = sum / dataArray.length;
              setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
              animationFrameRef.current = requestAnimationFrame(updateMeter);
            };
            updateMeter();
          }
        } catch (audioErr) {
          console.warn('Audio metering unavailable:', audioErr);
        }
      } catch (err) {
        console.warn('Media access error in lobby:', err);
        if (isMounted) {
          setPermissionError(
            err.name === 'NotAllowedError'
              ? 'Camera or microphone permission was denied. Please allow access in your browser settings.'
              : 'Unable to access camera or microphone.'
          );
          setIsCamOn(false);
          setIsMicOn(false);
        }
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle toggling mic
  const toggleMic = () => {
    const nextState = !isMicOn;
    setIsMicOn(nextState);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  // Handle toggling cam
  const toggleCam = () => {
    const nextState = !isCamOn;
    setIsCamOn(nextState);
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = nextState;
      });
    }
  };

  // Cleanup local preview stream before transitioning to Stream Video
  const handleProceedClick = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onProceed({ isMicOn, isCamOn });
  };

  const handleCreateClick = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    onCreateClass({ isMicOn, isCamOn });
  };

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-app text-fg flex flex-col">
      {/* Top Header */}
      <header className="px-6 py-4 border-b border-border bg-card/60 backdrop-blur flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="p-2 rounded-xl text-fg-muted hover:text-fg hover:bg-muted transition-colors flex items-center gap-1.5 text-sm font-semibold cursor-pointer"
            title="Back to course"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Back to course</span>
          </button>
          <div className="h-5 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="text-base font-bold text-fg leading-none">{course.name}</h1>
            <p className="text-xs font-semibold text-fg-muted uppercase tracking-wider mt-0.5">
              {course.section || 'Live Classroom'}
            </p>
          </div>
        </div>

        {activeClass && (
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            LIVE NOW
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-center">
          {/* Left Column: Video Preview Window (Google Meet style) */}
          <section className="lg:col-span-7 flex flex-col items-center">
            <div className="relative w-full aspect-video max-w-xl bg-neutral-900 rounded-3xl overflow-hidden shadow-xl border border-border/40 flex items-center justify-center">
              {/* Camera Feed */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover -scale-x-100 transition-opacity duration-300 ${
                  isCamOn ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              />

              {/* Avatar placeholder when camera is off */}
              {!isCamOn && (
                <div className="flex flex-col items-center justify-center gap-4 z-10 select-none">
                  <div className="relative">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary-600/30 border-2 border-primary-500/40 flex items-center justify-center shadow-inner">
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.fullName}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl sm:text-4xl font-black text-primary-200">
                          {userInitial}
                        </span>
                      )}
                    </div>
                    {/* Audio wave indicator around avatar */}
                    {isMicOn && audioLevel > 15 && (
                      <span
                        className="absolute -inset-2 rounded-full border-2 border-emerald-400/60 animate-ping pointer-events-none"
                        style={{ animationDuration: '1.2s' }}
                      />
                    )}
                  </div>
                  <p className="text-sm font-medium text-neutral-400">Camera is off</p>
                </div>
              )}

              {/* Floating Bottom Control Pills (GMeet style) */}
              <div className="absolute bottom-5 inset-x-0 flex items-center justify-center gap-3 z-20">
                {/* Microphone Toggle Button */}
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-3.5 rounded-full transition-all duration-200 shadow-md flex items-center justify-center cursor-pointer active:scale-95 ${
                    isMicOn
                      ? 'bg-neutral-800/90 hover:bg-neutral-700 text-white border border-neutral-700'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isMicOn ? 'Turn off microphone' : 'Turn on microphone'}
                >
                  {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
                </button>

                {/* Camera Toggle Button */}
                <button
                  type="button"
                  onClick={toggleCam}
                  className={`p-3.5 rounded-full transition-all duration-200 shadow-md flex items-center justify-center cursor-pointer active:scale-95 ${
                    isCamOn
                      ? 'bg-neutral-800/90 hover:bg-neutral-700 text-white border border-neutral-700'
                      : 'bg-red-500 hover:bg-red-600 text-white'
                  }`}
                  title={isCamOn ? 'Turn off camera' : 'Turn on camera'}
                >
                  {isCamOn ? <VideoIcon size={20} /> : <VideoOff size={20} />}
                </button>
              </div>

              {/* Microphone sound indicator in top corner */}
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-neutral-900/80 backdrop-blur px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-300 border border-neutral-800">
                {isMicOn ? (
                  <div className="flex items-center gap-1">
                    <span
                      className={`h-2 w-2 rounded-full transition-colors ${
                        audioLevel > 15 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-neutral-500'
                      }`}
                    />
                    <span>{audioLevel > 15 ? 'Speaking' : 'Mic on'}</span>
                  </div>
                ) : (
                  <span className="text-red-400">Mic muted</span>
                )}
              </div>
            </div>

            {permissionError && (
              <div className="mt-3 flex items-center gap-2 text-xs text-danger bg-danger/10 px-3 py-2 rounded-xl border border-danger/20 max-w-xl w-full">
                <AlertCircle size={15} className="shrink-0" />
                <span>{permissionError}</span>
              </div>
            )}
          </section>

          {/* Right Column: Information & Actions */}
          <section className="lg:col-span-5 flex flex-col justify-center">
            {/* If Joiner and NO ongoing live class */}
            {!isOwner && !activeClass ? (
              <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col items-center sm:items-start text-center sm:text-left gap-4">
                {actionError && (
                  <div className="w-full flex items-start justify-between gap-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-semibold text-left">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{actionError}</span>
                    </div>
                    {onDismissError && (
                      <button
                        type="button"
                        onClick={onDismissError}
                        className="text-red-400 hover:text-red-300 cursor-pointer p-0.5 rounded-lg hover:bg-red-500/10"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1">
                  <Clock size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-extrabold text-fg tracking-tight">
                    No ongoing class yet
                  </h2>
                  <p className="text-sm text-fg-muted mt-2 leading-relaxed">
                    The instructor hasn't started the live class for <span className="font-semibold text-fg">{course.name}</span> yet. Please check back later or wait for your instructor to begin.
                  </p>
                </div>

                <div className="w-full pt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="flex-1 bg-primary-600 hover:bg-btn-hover text-fg-inverse dark:text-fg px-6 py-3.5 rounded-2xl text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                  >
                    <ArrowLeft size={16} />
                    Back to Course
                  </button>

                  <button
                    type="button"
                    onClick={onRefresh}
                    disabled={isRefreshing}
                    className="p-3.5 border border-border hover:bg-muted rounded-2xl text-fg-muted hover:text-fg transition-all flex items-center justify-center cursor-pointer disabled:opacity-50 active:scale-95"
                    title="Refresh status"
                  >
                    <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                  </button>
                </div>
              </div>
            ) : (
              /* If Creator OR (Joiner and Active Live Class exists) */
              <div className="bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col gap-6">
                {actionError && (
                  <div className="flex items-start justify-between gap-3 p-3.5 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl text-xs font-semibold">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{actionError}</span>
                    </div>
                    {onDismissError && (
                      <button
                        type="button"
                        onClick={onDismissError}
                        className="text-red-400 hover:text-red-300 cursor-pointer p-0.5 rounded-lg hover:bg-red-500/10"
                        title="Dismiss"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                )}
                <div>
                  <span className="inline-block text-xs font-extrabold tracking-wider uppercase text-primary-600 dark:text-primary-400 bg-primary-600/10 px-3 py-1 rounded-full mb-3">
                    {isOwner ? 'Instructor Room' : 'Student Join'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-fg tracking-tight">
                    {isOwner ? 'Ready to start the class?' : 'Ready to join?'}
                  </h2>
                  <p className="text-sm text-fg-muted mt-1.5 leading-relaxed">
                    {isOwner
                      ? 'You will enter as the instructor and can share screen, chat, and host the live session.'
                      : 'You are about to join the live session with your camera and microphone configured.'}
                  </p>
                </div>

                {/* User chip */}
                <div className="flex items-center gap-3.5 p-3.5 bg-muted/60 border border-border rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-fg-inverse dark:text-fg font-bold flex items-center justify-center text-sm shrink-0">
                    {user?.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-bold text-fg truncate">
                      {user?.fullName || 'Anonymous User'}
                    </span>
                    <span className="text-xs text-fg-subtle">
                      {isOwner ? 'Host / Instructor' : 'Participant'}
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex flex-col gap-3 pt-2">
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={handleCreateClick}
                      disabled={loadingAction}
                      className="w-full bg-primary-600 hover:bg-btn-hover text-fg-inverse dark:text-fg py-4 px-6 rounded-2xl text-base font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                    >
                      {loadingAction ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Starting Live Class...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Sparkles size={18} />
                          <span>Create Live Class</span>
                        </div>
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleProceedClick}
                      disabled={loadingAction}
                      className="w-full bg-primary-600 hover:bg-btn-hover text-fg-inverse dark:text-fg py-4 px-6 rounded-2xl text-base font-bold shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98 disabled:opacity-60"
                    >
                      {loadingAction ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw size={18} className="animate-spin" />
                          <span>Joining...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Radio size={18} />
                          <span>Proceed to Live Class</span>
                        </div>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => navigate(`/courses/${course.id}`)}
                    className="w-full py-2.5 text-xs font-semibold text-fg-muted hover:text-fg transition-colors"
                  >
                    Cancel and return to course
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
