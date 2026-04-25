import React from 'react';

const BAR_COUNT = 48;

function lerpColor(t: number) {
    const r = Math.round(162 + (30  - 162)  * t);
    const g = Math.round(56  + (215 - 56)   * t);
    const b = Math.round(255 + (96  - 255)  * t);
    return `rgb(${r},${g},${b})`;
}

const BARS = Array.from({ length: BAR_COUNT }, (_, i) => {
    const t = i / (BAR_COUNT - 1);
    const color = lerpColor(t);
    return {
        duration: 1.8 + Math.abs(Math.sin(i * 2.3)) * 1.8,
        delay:    (i * 0.09) % 1.4,
        maxHeight: 12 + Math.abs(Math.sin(i * 1.1)) * 28,
        color,
    };
});

const NOTES = [
    { symbol: '♪', x: 5,  size: 18, duration: 18, delay: 0,   color: 'rgba(162,56,255,0.25)' },
    { symbol: '♫', x: 12, size: 28, duration: 24, delay: 3,   color: 'rgba(30,215,96,0.20)' },
    { symbol: '♩', x: 22, size: 14, duration: 16, delay: 7,   color: 'rgba(162,56,255,0.15)' },
    { symbol: '♬', x: 33, size: 32, duration: 28, delay: 1,   color: 'rgba(30,215,96,0.25)' },
    { symbol: '♪', x: 45, size: 20, duration: 20, delay: 10,  color: 'rgba(162,56,255,0.18)' },
    { symbol: '♫', x: 55, size: 13, duration: 15, delay: 5,   color: 'rgba(30,215,96,0.15)' },
    { symbol: '♩', x: 65, size: 26, duration: 22, delay: 8,   color: 'rgba(162,56,255,0.20)' },
    { symbol: '♬', x: 75, size: 16, duration: 19, delay: 2,   color: 'rgba(30,215,96,0.18)' },
    { symbol: '♪', x: 83, size: 30, duration: 26, delay: 12,  color: 'rgba(162,56,255,0.22)' },
    { symbol: '♫', x: 91, size: 12, duration: 14, delay: 6,   color: 'rgba(30,215,96,0.14)' },
    { symbol: '♩', x: 38, size: 22, duration: 21, delay: 14,  color: 'rgba(162,56,255,0.16)' },
    { symbol: '♬', x: 58, size: 17, duration: 17, delay: 9,   color: 'rgba(30,215,96,0.22)' },
    { symbol: '♪', x: 18, size: 24, duration: 23, delay: 11,  color: 'rgba(162,56,255,0.12)' },
    { symbol: '♫', x: 78, size: 20, duration: 25, delay: 4,   color: 'rgba(30,215,96,0.17)' },
];

function WaveBackground() {
    return (
        <>
        <div className="equalizer-bg" aria-hidden="true">
            {BARS.map((b, i) => (
                <div
                    key={i}
                    className="eq-bar"
                    style={{
                        animationDuration: `${b.duration}s`,
                        animationDelay: `-${b.delay}s`,
                        '--max-h': `${b.maxHeight}px`,
                        '--bar-color': b.color,
                    } as React.CSSProperties}
                />
            ))}
        </div>
        <div className="notes-bg" aria-hidden="true">
            {NOTES.map((n, i) => (
                <span
                    key={i}
                    className="floating-note"
                    style={{
                        left: `${n.x}%`,
                        fontSize: `${n.size}px`,
                        color: n.color,
                        animationDuration: `${n.duration}s`,
                        animationDelay: `-${n.delay}s`,
                    }}
                >
                    {n.symbol}
                </span>
            ))}
        </div>
        </>
    );
}

export default WaveBackground;
