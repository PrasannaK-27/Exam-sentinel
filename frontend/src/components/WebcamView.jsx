import { useEffect, useRef } from 'react';

const WebcamView = ({ stream, muted = true, className = '', label = '' }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={`relative rounded-xl overflow-hidden bg-surface-800 ${className}`}>
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center min-h-[180px]">
          <div className="text-center">
            <div className="w-12 h-12 bg-surface-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.677V15.3a1 1 0 01-1.447.894L15 14M4 8h11a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1z" />
              </svg>
            </div>
            <p className="text-slate-500 text-sm">No camera feed</p>
          </div>
        </div>
      )}
      {label && (
        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
          {label}
        </div>
      )}
      {stream && (
        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-red-500/90 text-white text-xs px-2 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE
        </div>
      )}
    </div>
  );
};

export default WebcamView;
