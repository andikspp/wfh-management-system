import { useEffect, useState } from 'react';
import { formatDate, formatTime } from '../utils';

/** Jam digital yang berjalan real-time */
export function LiveClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="live-clock">
      <div className="live-clock-time">{formatTime(now)}</div>
      <div className="live-clock-date">{formatDate(now)}</div>
    </div>
  );
}
