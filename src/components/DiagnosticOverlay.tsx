import { useEffect, useState } from 'react';

interface DiagnosticInfo {
  userAgent: string;
  browserZoom: number;
  devicePixelRatio: number;
  colorScheme: string;
  colorGamut: string;
  prefersReducedMotion: boolean;
  supportsBackdropFilter: boolean;
  hardwareAcceleration: string;
  screenResolution: string;
  viewportSize: string;
  colorDepth: number;
  browserName: string;
  browserVersion: string;
}

export const DiagnosticOverlay: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [diagnosticInfo, setDiagnosticInfo] = useState<DiagnosticInfo | null>(null);

  useEffect(() => {
    // Проверяем, нужно ли показать диагностику (по нажатию Ctrl+Shift+D)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsVisible(prev => !prev);
        if (!diagnosticInfo) {
          collectDiagnosticInfo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [diagnosticInfo]);

  const collectDiagnosticInfo = () => {
    // Определяем браузер
    const ua = navigator.userAgent;
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';

    if (ua.includes('Chrome') && !ua.includes('Edg')) {
      browserName = 'Chrome';
      browserVersion = ua.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Edg')) {
      browserName = 'Edge';
      browserVersion = ua.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Firefox')) {
      browserName = 'Firefox';
      browserVersion = ua.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
    } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
      browserName = 'Safari';
      browserVersion = ua.match(/Version\/(\d+)/)?.[1] || 'Unknown';
    }

    // Проверяем zoom браузера
    const browserZoom = Math.round((window.outerWidth / window.innerWidth) * 100);

    // Проверяем цветовую схему
    const colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

    // Проверяем цветовую гамму
    let colorGamut = 'sRGB';
    if (window.matchMedia('(color-gamut: p3)').matches) {
      colorGamut = 'P3';
    } else if (window.matchMedia('(color-gamut: rec2020)').matches) {
      colorGamut = 'Rec2020';
    }

    // Проверяем prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Проверяем поддержку backdrop-filter
    const supportsBackdropFilter = CSS.supports('backdrop-filter', 'blur(5px)') ||
                                   CSS.supports('-webkit-backdrop-filter', 'blur(5px)');

    // Определяем аппаратное ускорение (косвенно через canvas)
    let hardwareAcceleration = 'Unknown';
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (gl) {
        const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          hardwareAcceleration = renderer ? 'Enabled (GPU: ' + renderer + ')' : 'Unknown';
        } else {
          hardwareAcceleration = 'Enabled (GPU info unavailable)';
        }
      } else {
        hardwareAcceleration = 'Disabled or unavailable';
      }
    } catch (e) {
      hardwareAcceleration = 'Error checking';
    }

    setDiagnosticInfo({
      userAgent: ua,
      browserZoom,
      devicePixelRatio: window.devicePixelRatio,
      colorScheme,
      colorGamut,
      prefersReducedMotion,
      supportsBackdropFilter,
      hardwareAcceleration,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      browserName,
      browserVersion,
    });
  };

  if (!isVisible || !diagnosticInfo) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        color: 'white',
        padding: '20px',
        borderRadius: '10px',
        zIndex: 99999,
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '2px solid #4ade80',
        boxShadow: '0 0 30px rgba(74, 222, 128, 0.5)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#4ade80' }}>🔍 Диагностика браузера</h2>
        <button
          onClick={() => setIsVisible(false)}
          style={{
            background: 'transparent',
            border: '2px solid #ef4444',
            color: '#ef4444',
            padding: '5px 15px',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ✕ Закрыть
        </button>
      </div>

      <div style={{ fontSize: '14px', lineHeight: '1.8' }}>
        <DiagnosticRow label="Браузер" value={`${diagnosticInfo.browserName} ${diagnosticInfo.browserVersion}`} />
        <DiagnosticRow label="Zoom браузера" value={`${diagnosticInfo.browserZoom}%`} status={diagnosticInfo.browserZoom === 100 ? 'ok' : 'warning'} />
        <DiagnosticRow label="DPI масштаб (devicePixelRatio)" value={diagnosticInfo.devicePixelRatio.toString()} />
        <DiagnosticRow label="Цветовая схема системы" value={diagnosticInfo.colorScheme} status={diagnosticInfo.colorScheme === 'dark' ? 'ok' : 'warning'} />
        <DiagnosticRow label="Цветовая гамма монитора" value={diagnosticInfo.colorGamut} status={diagnosticInfo.colorGamut === 'sRGB' ? 'ok' : 'info'} />
        <DiagnosticRow label="Prefers Reduced Motion" value={diagnosticInfo.prefersReducedMotion ? 'Да (анимации отключены)' : 'Нет'} status={diagnosticInfo.prefersReducedMotion ? 'warning' : 'ok'} />
        <DiagnosticRow label="Поддержка backdrop-filter" value={diagnosticInfo.supportsBackdropFilter ? 'Да ✓' : 'Нет ✗'} status={diagnosticInfo.supportsBackdropFilter ? 'ok' : 'error'} />
        <DiagnosticRow label="Аппаратное ускорение" value={diagnosticInfo.hardwareAcceleration} status={diagnosticInfo.hardwareAcceleration.includes('Enabled') ? 'ok' : 'warning'} />
        <DiagnosticRow label="Разрешение экрана" value={diagnosticInfo.screenResolution} />
        <DiagnosticRow label="Размер viewport" value={diagnosticInfo.viewportSize} />
        <DiagnosticRow label="Глубина цвета" value={`${diagnosticInfo.colorDepth} бит`} />

        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: 'rgba(74, 222, 128, 0.1)', borderRadius: '5px', border: '1px solid #4ade80' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#4ade80' }}>💡 Возможные проблемы:</p>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {diagnosticInfo.browserZoom !== 100 && (
              <li style={{ color: '#fbbf24' }}>⚠️ Zoom браузера не 100% - может искажать размеры элементов</li>
            )}
            {!diagnosticInfo.supportsBackdropFilter && (
              <li style={{ color: '#ef4444' }}>❌ Backdrop-filter не поддерживается - размытие не работает</li>
            )}
            {diagnosticInfo.colorScheme === 'light' && (
              <li style={{ color: '#fbbf24' }}>⚠️ Системная тема светлая - может влиять на отображение</li>
            )}
            {diagnosticInfo.prefersReducedMotion && (
              <li style={{ color: '#fbbf24' }}>⚠️ Включён режим уменьшения анимаций</li>
            )}
            {!diagnosticInfo.hardwareAcceleration.includes('Enabled') && (
              <li style={{ color: '#fbbf24' }}>⚠️ Аппаратное ускорение может быть отключено</li>
            )}
            {diagnosticInfo.colorGamut !== 'sRGB' && (
              <li style={{ color: '#60a5fa' }}>ℹ️ Широкая цветовая гамма ({diagnosticInfo.colorGamut}) - цвета могут выглядеть ярче</li>
            )}
          </ul>
        </div>

        <div style={{ marginTop: '15px', padding: '10px', backgroundColor: 'rgba(96, 165, 250, 0.1)', borderRadius: '5px', fontSize: '12px' }}>
          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>Как исправить различия:</p>
          <ol style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Проверьте zoom браузера (Ctrl + 0 для сброса)</li>
            <li>Отключите расширения браузера (особенно Dark Reader)</li>
            <li>Включите аппаратное ускорение в настройках браузера</li>
            <li>Отключите Night Light / f.lux на ночь</li>
            <li>Очистите кэш браузера (Ctrl + Shift + Delete)</li>
          </ol>
        </div>

        <div style={{ marginTop: '15px', fontSize: '11px', color: '#9ca3af', borderTop: '1px solid #374151', paddingTop: '10px' }}>
          <p style={{ margin: 0 }}><strong>User Agent:</strong></p>
          <p style={{ margin: '5px 0 0 0', wordBreak: 'break-all' }}>{diagnosticInfo.userAgent}</p>
        </div>
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#9ca3af' }}>
        Нажмите Ctrl+Shift+D для скрытия | Отправьте скриншот этого окна разработчику
      </div>
    </div>
  );
};

interface DiagnosticRowProps {
  label: string;
  value: string;
  status?: 'ok' | 'warning' | 'error' | 'info';
}

const DiagnosticRow: React.FC<DiagnosticRowProps> = ({ label, value, status }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'ok': return '#4ade80';
      case 'warning': return '#fbbf24';
      case 'error': return '#ef4444';
      case 'info': return '#60a5fa';
      default: return '#d1d5db';
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid #374151'
    }}>
      <span style={{ color: '#9ca3af', fontWeight: 500 }}>{label}:</span>
      <span style={{ color: getStatusColor(), fontWeight: 600 }}>{value}</span>
    </div>
  );
};
