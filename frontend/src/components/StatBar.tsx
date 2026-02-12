import React from 'react';

interface StatBarProps {
  label: string;
  char1Value: number;
  char2Value: number;
  char1Name: string;
  char2Name: string;
}

const StatBar: React.FC<StatBarProps> = ({ label, char1Value, char2Value, char1Name, char2Name }) => {
  const maxValue = Math.max(char1Value, char2Value);
  const char1Percent = (char1Value / maxValue) * 100;
  const char2Percent = (char2Value / maxValue) * 100;

  return (
    <div className="stat-bar-container">
      <div className="stat-label">{label}</div>
      <div className="stat-bars">
        <div className="stat-row">
          <span className="char-name">{char1Name}</span>
          <div className="bar-background">
            <div className="bar-fill char1" style={{ width: `${char1Percent}%` }}></div>
          </div>
          <span className="stat-value">{Math.round(char1Value)}</span>
        </div>
        <div className="stat-row">
          <span className="char-name">{char2Name}</span>
          <div className="bar-background">
            <div className="bar-fill char2" style={{ width: `${char2Percent}%` }}></div>
          </div>
          <span className="stat-value">{Math.round(char2Value)}</span>
        </div>
      </div>
    </div>
  );
};

export default StatBar;
