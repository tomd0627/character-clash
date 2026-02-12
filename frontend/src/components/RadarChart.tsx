import React from 'react';

interface RadarChartProps {
  char1Name: string;
  char1Stats: {
    [key: string]: number;
  };
  char2Name: string;
  char2Stats: {
    [key: string]: number;
  };
}

const RadarChart: React.FC<RadarChartProps> = ({
  char1Name,
  char1Stats,
  char2Name,
  char2Stats,
}) => {
  const statLabels = Object.keys(char1Stats);
  const dataPoints1 = Object.values(char1Stats);
  const dataPoints2 = Object.values(char2Stats);

  // Simple SVG radar chart
  const size = 300;
  const center = size / 2;
  const maxValue = 100;
  const layers = 5;
  const pointCount = statLabels.length;

  // Calculate SVG points
  const getPoint = (index: number, value: number) => {
    const angle = (index / pointCount) * 2 * Math.PI - Math.PI / 2;
    const radius = (value / maxValue) * (size / 2 - 40);
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  };

  const points1 = dataPoints1.map((val, i) => getPoint(i, val));
  const points2 = dataPoints2.map((val, i) => getPoint(i, val));

  const pathString1 =
    points1.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const pathString2 =
    points2.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  return (
    <div className="radar-chart-container">
      <h3>Combat Stats Radar</h3>
      <svg width={size} height={size} className="radar-svg">
        {/* Grid circles */}
        {Array.from({ length: layers }).map((_, i) => {
          const r = ((i + 1) / layers) * (size / 2 - 40);
          return <circle key={`grid-${i}`} cx={center} cy={center} r={r} className="grid-circle" />;
        })}

        {/* Axes */}
        {statLabels.map((_, i) => {
          const end = getPoint(i, maxValue);
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={end.x}
              y2={end.y}
              className="axis-line"
            />
          );
        })}

        {/* Character 1 polygon */}
        <path d={pathString1} className="radar-polygon char1" opacity={0.6} />

        {/* Character 2 polygon */}
        <path d={pathString2} className="radar-polygon char2" opacity={0.6} />

        {/* Data points */}
        {points1.map((p, i) => (
          <circle key={`point1-${i}`} cx={p.x} cy={p.y} r={4} className="data-point char1" />
        ))}
        {points2.map((p, i) => (
          <circle key={`point2-${i}`} cx={p.x} cy={p.y} r={4} className="data-point char2" />
        ))}

        {/* Labels */}
        {statLabels.map((label, i) => {
          const labelPoint = getPoint(i, maxValue + 15);
          return (
            <text
              key={`label-${i}`}
              x={labelPoint.x}
              y={labelPoint.y}
              className="stat-label"
              textAnchor="middle"
            >
              {label.slice(0, 3).toUpperCase()}
            </text>
          );
        })}
      </svg>

      <div className="radar-legend">
        <div className="legend-item">
          <span className="legend-color char1"></span>
          <span>{char1Name}</span>
        </div>
        <div className="legend-item">
          <span className="legend-color char2"></span>
          <span>{char2Name}</span>
        </div>
      </div>
    </div>
  );
};

export default RadarChart;
