'use client';

export default function SplashScreen() {
  return (
    <div
      className="screen active"
      id="screen-splash"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg)',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          animation: 'fadeInSplash 1.2s ease-out forwards',
        }}
      >
        {/* Large Brand Icon */}
        <div
          style={{
            fontSize: '80px',
            marginBottom: '16px',
            animation: 'rotateSplash 2.5s infinite linear',
            display: 'inline-block',
          }}
        >
          ♻
        </div>

        {/* Brand Name */}
        <h1
          style={{
            fontSize: '36px',
            fontWeight: 800,
            color: 'var(--primary-green)',
            letterSpacing: '2px',
            marginBottom: '8px',
          }}
        >
          CERCLY
        </h1>

        {/* Brand Slogan */}
        <p
          style={{
            fontSize: '16px',
            fontWeight: 700,
            color: 'var(--dark-green)',
            opacity: 0.9,
          }}
        >
          اجمع لأثر يدوم
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeInSplash {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes rotateSplash {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
