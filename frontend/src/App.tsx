import React from 'react';
import axios from 'axios';
import StatBar from './components/StatBar';
import RadarChart from './components/RadarChart';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

interface ComparisonResult {
  character1Name: string;
  character2Name: string;
  verdict: string;
  winPercentage: number;
  confidenceLevel: number;
  statBreakdown: any;
  scenarios: any;
  analysis: string;
}

interface SearchResult {
  id: string;
  name: string;
  universe: string;
  version: string;
  confidence: number;
}

function App() {
  const [selectedChar1, setSelectedChar1] = React.useState<string>('');
  const [selectedChar1Name, setSelectedChar1Name] = React.useState<string>('');
  const [selectedChar2, setSelectedChar2] = React.useState<string>('');
  const [selectedChar2Name, setSelectedChar2Name] = React.useState<string>('');
  const [comparison, setComparison] = React.useState<ComparisonResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [searchInput1, setSearchInput1] = React.useState('');
  const [searchResults1, setSearchResults1] = React.useState<SearchResult[]>([]);
  const [showSearchDropdown1, setShowSearchDropdown1] = React.useState(false);
  const [mouseOverDropdown1, setMouseOverDropdown1] = React.useState(false);
  const [highlightedIndex1, setHighlightedIndex1] = React.useState(-1);
  const [searchError1, setSearchError1] = React.useState<string>('');
  const [searchInput2, setSearchInput2] = React.useState('');
  const [searchResults2, setSearchResults2] = React.useState<SearchResult[]>([]);
  const [showSearchDropdown2, setShowSearchDropdown2] = React.useState(false);
  const [mouseOverDropdown2, setMouseOverDropdown2] = React.useState(false);
  const [highlightedIndex2, setHighlightedIndex2] = React.useState(-1);
  const [searchError2, setSearchError2] = React.useState<string>('');
  const [submissionError, setSubmissionError] = React.useState<string>('');
  const [validCharacterIds, setValidCharacterIds] = React.useState<string[]>([]);

  // AbortControllers to cancel previous requests on new searches
  const abortController1 = React.useRef<AbortController | null>(null);
  const abortController2 = React.useRef<AbortController | null>(null);

  // Function to refresh the allowlist from the backend
  const refreshAllowlist = React.useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/characters`);
      const ids = Array.isArray(res.data) ? res.data.map((char: any) => char.id) : [];
      setValidCharacterIds(ids);
      return ids;
    } catch (err) {
      console.error('Failed to fetch valid characters:', err);
      return [];
    }
  }, []);

  // Fetch valid character IDs from backend on component mount
  React.useEffect(() => {
    refreshAllowlist();
  }, [refreshAllowlist]);

  // Generic search handler factory for both character slots
  const createSearchHandler = (
    slot: 1 | 2,
    setInput: (val: string) => void,
    setResults: (val: SearchResult[]) => void,
    setError: (val: string) => void,
    setDropdown: (val: boolean) => void,
    setHighlight: (val: number) => void,
    setSelected: (id: string) => void,
    setSelectedName: (name: string) => void,
    abortRef: React.MutableRefObject<AbortController | null>
  ) => {
    return async (input: string) => {
      setInput(input);
      setHighlight(-1);
      setError('');
      setSubmissionError('');
      setSelected('');
      setSelectedName('');

      if (input.length < 2) {
        setResults([]);
        setDropdown(false);
        return;
      }

      // Cancel previous request to prevent race conditions
      if (abortRef.current) {
        abortRef.current.abort();
      }
      abortRef.current = new AbortController();

      try {
        const res = await axios.get(`${API_BASE}/characters/search/${input}`, {
          signal: abortRef.current.signal,
        });
        const resultsArray = Array.isArray(res.data) ? res.data : res.data ? [res.data] : [];
        const filteredResults = resultsArray.filter(
          result => result.name && result.name.toLowerCase().includes(input.toLowerCase())
        );
        setResults(filteredResults);
        if (filteredResults.length === 0) {
          setError(`No characters found matching "${input}"`);
        }
        setDropdown(filteredResults.length > 0);

        // Refresh allowlist in case a new character was just cached
        if (filteredResults.length > 0) {
          refreshAllowlist();
        }
      } catch (err: any) {
        if (err.name !== 'CanceledError') {
          console.error('Search error:', err.message);
          setResults([]);
          setDropdown(false);
          setError('Search failed. Please try again.');
        }
      }
    };
  };

  const handleSearch1 = createSearchHandler(
    1,
    setSearchInput1,
    setSearchResults1,
    setSearchError1,
    setShowSearchDropdown1,
    setHighlightedIndex1,
    setSelectedChar1,
    setSelectedChar1Name,
    abortController1
  );

  const handleSearch2 = createSearchHandler(
    2,
    setSearchInput2,
    setSearchResults2,
    setSearchError2,
    setShowSearchDropdown2,
    setHighlightedIndex2,
    setSelectedChar2,
    setSelectedChar2Name,
    abortController2
  );

  // Generic keydown handler factory
  const createKeyDownHandler = (
    dropdown: boolean,
    results: SearchResult[],
    highlighted: number,
    setHighlight: (val: number) => void,
    setSelected: (id: string) => void,
    setSelectedName: (name: string) => void,
    setInput: (val: string) => void,
    setResults: (val: SearchResult[]) => void,
    setDropdown: (val: boolean) => void
  ) => {
    return (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!dropdown || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlight(prev => (prev < results.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlight(prev => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (highlighted >= 0) {
            const selectedResult = results[highlighted];
            setSelected(selectedResult.id);
            setSelectedName(selectedResult.name);
            setInput(selectedResult.name);
            setResults([]);
            setDropdown(false);
            setHighlight(-1);
          }
          break;
        case 'Escape':
          setDropdown(false);
          setHighlight(-1);
          break;
        default:
          break;
      }
    };
  };

  const handleKeyDown1 = createKeyDownHandler(
    showSearchDropdown1,
    searchResults1,
    highlightedIndex1,
    setHighlightedIndex1,
    setSelectedChar1,
    setSelectedChar1Name,
    setSearchInput1,
    setSearchResults1,
    setShowSearchDropdown1
  );

  const handleKeyDown2 = createKeyDownHandler(
    showSearchDropdown2,
    searchResults2,
    highlightedIndex2,
    setHighlightedIndex2,
    setSelectedChar2,
    setSelectedChar2Name,
    setSearchInput2,
    setSearchResults2,
    setShowSearchDropdown2
  );

  // Check if both character selections are valid and can be submitted
  const areSelectionsValid = (): boolean => {
    // Must have both characters selected
    if (!selectedChar1 || !selectedChar2 || !selectedChar1Name || !selectedChar2Name) {
      return false;
    }

    // Input must match selected character name (prevents manual invalid input)
    if (searchInput1 !== selectedChar1Name || searchInput2 !== selectedChar2Name) {
      return false;
    }

    // Must be different characters
    if (selectedChar1 === selectedChar2) {
      return false;
    }

    // CRITICAL: Both character IDs must be in the allowlist of valid database characters
    // Only enforce if allowlist has been loaded
    if (validCharacterIds.length > 0) {
      if (
        !validCharacterIds.includes(selectedChar1) ||
        !validCharacterIds.includes(selectedChar2)
      ) {
        return false;
      }
    }

    return true;
  };

  const handleCompare = async () => {
    setSubmissionError('');

    // Verify both selections are valid before submitting
    if (!selectedChar1 || !selectedChar1Name) {
      setSubmissionError('Please select a character for slot 1');
      return;
    }

    if (searchInput1 !== selectedChar1Name) {
      setSubmissionError('Please select a valid character from the dropdown for slot 1');
      return;
    }

    if (!selectedChar2 || !selectedChar2Name) {
      setSubmissionError('Please select a character for slot 2');
      return;
    }

    if (searchInput2 !== selectedChar2Name) {
      setSubmissionError('Please select a valid character from the dropdown for slot 2');
      return;
    }

    if (selectedChar1 === selectedChar2) {
      setSubmissionError('Please select two different characters');
      return;
    }

    // CRITICAL: Verify both character IDs are in the allowlist of valid database characters
    // Only enforce if allowlist has been loaded
    if (validCharacterIds.length > 0) {
      if (!validCharacterIds.includes(selectedChar1)) {
        setSubmissionError(
          'Character 1 is not a valid database character. Please reselect from the dropdown.'
        );
        setSelectedChar1('');
        setSelectedChar1Name('');
        return;
      }

      if (!validCharacterIds.includes(selectedChar2)) {
        setSubmissionError(
          'Character 2 is not a valid database character. Please reselect from the dropdown.'
        );
        setSelectedChar2('');
        setSelectedChar2Name('');
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/compare`, {
        char1Id: selectedChar1,
        char2Id: selectedChar2,
      });
      setComparison(res.data);
    } catch (err: any) {
      setSubmissionError('Comparison failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>⚔️ Character Clash</h1>
      </header>

      <div className="selection-panel">
        <div className="character-selector">
          <div className="selector-input">
            <input
              type="text"
              placeholder="Search character..."
              value={searchInput1}
              onChange={e => handleSearch1(e.target.value)}
              onKeyDown={handleKeyDown1}
              onFocus={() => {
                if (searchInput1.length >= 2 && searchResults1.length > 0) {
                  setShowSearchDropdown1(true);
                }
              }}
              onBlur={() => {
                // Close dropdown only if mouse isn't over it
                if (!mouseOverDropdown1) {
                  setShowSearchDropdown1(false);
                }
              }}
              className="search-input"
            />
            {showSearchDropdown1 && searchResults1.length > 0 && (
              <div
                className="search-dropdown"
                onMouseEnter={() => setMouseOverDropdown1(true)}
                onMouseLeave={() => setMouseOverDropdown1(false)}
              >
                {searchResults1.map((result, index) => (
                  <div
                    key={result.id}
                    className={`search-item ${index === highlightedIndex1 ? 'highlighted' : ''}`}
                    onMouseEnter={() => setHighlightedIndex1(index)}
                    onMouseLeave={() => setHighlightedIndex1(-1)}
                    onMouseDown={() => {
                      setSelectedChar1(result.id);
                      setSelectedChar1Name(result.name);
                      setSearchInput1(result.name);
                      setSearchResults1([]);
                      setShowSearchDropdown1(false);
                      setHighlightedIndex1(-1);
                    }}
                  >
                    {result.imageUrl && !result.imageUrl.includes('placeholder') && (
                      <img src={result.imageUrl} alt={result.name} className="search-item-image" />
                    )}
                    <div className="search-item-text">
                      <div>{result.name}</div>
                      {result.universe &&
                        result.universe !== 'Unknown' &&
                        result.universe !== 'dragon-ball' && (
                          <small>
                            {result.version && result.version !== 'Unknown'
                              ? result.version
                              : result.universe}
                          </small>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {searchError1 && <div className="search-error">{searchError1}</div>}
        </div>

        <div className="vs-divider">VS</div>

        <div className="character-selector">
          <div className="selector-input">
            <input
              type="text"
              placeholder="Search character..."
              value={searchInput2}
              onChange={e => handleSearch2(e.target.value)}
              onKeyDown={handleKeyDown2}
              onFocus={() => {
                if (searchInput2.length >= 2 && searchResults2.length > 0) {
                  setShowSearchDropdown2(true);
                }
              }}
              onBlur={() => {
                // Close dropdown only if mouse isn't over it
                if (!mouseOverDropdown2) {
                  setShowSearchDropdown2(false);
                }
              }}
              className="search-input"
            />
            {showSearchDropdown2 && searchResults2.length > 0 && (
              <div
                className="search-dropdown"
                onMouseEnter={() => setMouseOverDropdown2(true)}
                onMouseLeave={() => setMouseOverDropdown2(false)}
              >
                {searchResults2.map((result, index) => (
                  <div
                    key={result.id}
                    className={`search-item ${index === highlightedIndex2 ? 'highlighted' : ''}`}
                    onMouseEnter={() => setHighlightedIndex2(index)}
                    onMouseLeave={() => setHighlightedIndex2(-1)}
                    onMouseDown={() => {
                      setSelectedChar2(result.id);
                      setSelectedChar2Name(result.name);
                      setSearchInput2(result.name);
                      setSearchResults2([]);
                      setShowSearchDropdown2(false);
                      setHighlightedIndex2(-1);
                    }}
                  >
                    {result.imageUrl && !result.imageUrl.includes('placeholder') && (
                      <img src={result.imageUrl} alt={result.name} className="search-item-image" />
                    )}
                    <div className="search-item-text">
                      <div>{result.name}</div>
                      {result.universe &&
                        result.universe !== 'Unknown' &&
                        result.universe !== 'dragon-ball' && (
                          <small>
                            {result.version && result.version !== 'Unknown'
                              ? result.version
                              : result.universe}
                          </small>
                        )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {searchError2 && <div className="search-error">{searchError2}</div>}
        </div>

        <div className="buttons-container">
          <button
            onClick={handleCompare}
            disabled={loading || !areSelectionsValid()}
            className="compare-button"
          >
            {loading ? 'Analyzing...' : 'Fight!'}
          </button>

          {(selectedChar1 || selectedChar2 || comparison) && (
            <button
              onClick={() => {
                setSelectedChar1('');
                setSelectedChar1Name('');
                setSelectedChar2('');
                setSelectedChar2Name('');
                setComparison(null);
                setSearchInput1('');
                setSearchInput2('');
                setSearchResults1([]);
                setSearchResults2([]);
                setSearchError1('');
                setSearchError2('');
                setSubmissionError('');
              }}
              className="clear-button"
            >
              Clear
            </button>
          )}
        </div>
        {submissionError && <div className="submission-error">{submissionError}</div>}
      </div>

      {comparison && (
        <div className="results-panel">
          <div className="verdict-section">
            <h2>Battle Verdict</h2>
            <div className="verdict-box">
              <div className="verdict-text">{comparison.verdict}</div>
              <div className="verdict-stats">
                <div className="stat-item">
                  <span className="value value--large">{comparison.confidenceLevel}%</span>
                </div>
                <div className="stat-item">
                  <span className="label">Win Probability</span>
                  <div className="probability-bar">
                    <div
                      className="prob-bar char1"
                      style={{ width: `${comparison.winPercentage}%` }}
                    ></div>
                  </div>
                  <span className="value">
                    {comparison.winPercentage}% vs {100 - comparison.winPercentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stat Comparison */}
          <div className="stats-comparison-section">
            <h2>Combat Statistics</h2>
            <div className="stats-grid">
              <StatBar
                label="Strength"
                char1Value={comparison.statBreakdown.strength.char1Score}
                char2Value={comparison.statBreakdown.strength.char2Score}
                char1Name={comparison.character1Name}
                char2Name={comparison.character2Name}
              />
              <StatBar
                label="Speed"
                char1Value={comparison.statBreakdown.speed.char1Score}
                char2Value={comparison.statBreakdown.speed.char2Score}
                char1Name={comparison.character1Name}
                char2Name={comparison.character2Name}
              />
              <StatBar
                label="Durability"
                char1Value={comparison.statBreakdown.durability.char1Score}
                char2Value={comparison.statBreakdown.durability.char2Score}
                char1Name={comparison.character1Name}
                char2Name={comparison.character2Name}
              />
              <StatBar
                label="Stamina"
                char1Value={comparison.statBreakdown.stamina.char1Score}
                char2Value={comparison.statBreakdown.stamina.char2Score}
                char1Name={comparison.character1Name}
                char2Name={comparison.character2Name}
              />
              <StatBar
                label="Energy Output"
                char1Value={comparison.statBreakdown.energyOutput.char1Score}
                char2Value={comparison.statBreakdown.energyOutput.char2Score}
                char1Name={comparison.character1Name}
                char2Name={comparison.character2Name}
              />
              <StatBar
                label="Technique"
                char1Value={comparison.statBreakdown.technique.char1Score}
                char2Value={comparison.statBreakdown.technique.char2Score}
                char1Name={comparison.character1Name}
                char2Name={comparison.character2Name}
              />
              <StatBar
                label="Experience"
                char1Value={comparison.statBreakdown.experience.char1Score}
                char2Value={comparison.statBreakdown.experience.char2Score}
                char1Name={comparison.character1Name}
                char2Name={comparison.character2Name}
              />
              <StatBar
                label="Adaptability"
                char1Value={comparison.statBreakdown.adaptability.char1Score}
                char2Value={comparison.statBreakdown.adaptability.char2Score}
                char1Name={comparison.character1Name}
                char2Name={comparison.character2Name}
              />
            </div>
          </div>

          {/* Radar Chart */}
          <div className="radar-section">
            <RadarChart
              char1Name={comparison.character1Name}
              char1Stats={{
                Strength: comparison.statBreakdown.strength.char1Score,
                Speed: comparison.statBreakdown.speed.char1Score,
                Durability: comparison.statBreakdown.durability.char1Score,
                Stamina: comparison.statBreakdown.stamina.char1Score,
                Energy: comparison.statBreakdown.energyOutput.char1Score,
                Technique: comparison.statBreakdown.technique.char1Score,
              }}
              char2Name={comparison.character2Name}
              char2Stats={{
                Strength: comparison.statBreakdown.strength.char2Score,
                Speed: comparison.statBreakdown.speed.char2Score,
                Durability: comparison.statBreakdown.durability.char2Score,
                Stamina: comparison.statBreakdown.stamina.char2Score,
                Energy: comparison.statBreakdown.energyOutput.char2Score,
                Technique: comparison.statBreakdown.technique.char2Score,
              }}
            />
          </div>

          {/* Scenario Analysis */}
          <div className="scenarios-section">
            <h2>Scenario Analysis</h2>
            <div className="scenarios-grid">
              <div className="scenario-card">
                <h4>Random Encounter</h4>
                <p className="scenario-winner">
                  Winner:{' '}
                  <strong>
                    {comparison.scenarios.randomEncounter.winner === 'character1'
                      ? comparison.character1Name
                      : comparison.character2Name}
                  </strong>
                </p>
                <p className="scenario-confidence">
                  Confidence: {Math.round(comparison.scenarios.randomEncounter.confidence * 100)}%
                </p>
                <p className="scenario-reasoning">
                  {comparison.scenarios.randomEncounter.reasoning}
                </p>
              </div>

              <div className="scenario-card">
                <h4>Bloodlusted</h4>
                <p className="scenario-winner">
                  Winner:{' '}
                  <strong>
                    {comparison.scenarios.bloodlusted.winner === 'character1'
                      ? comparison.character1Name
                      : comparison.character2Name}
                  </strong>
                </p>
                <p className="scenario-confidence">
                  Confidence: {Math.round(comparison.scenarios.bloodlusted.confidence * 100)}%
                </p>
                <p className="scenario-reasoning">{comparison.scenarios.bloodlusted.reasoning}</p>
              </div>

              <div className="scenario-card">
                <h4>With Prep Time</h4>
                <p className="scenario-winner">
                  Winner:{' '}
                  <strong>
                    {comparison.scenarios.withPrepTime.winner === 'character1'
                      ? comparison.character1Name
                      : comparison.character2Name}
                  </strong>
                </p>
                <p className="scenario-confidence">
                  Confidence: {Math.round(comparison.scenarios.withPrepTime.confidence * 100)}%
                </p>
                <p className="scenario-reasoning">{comparison.scenarios.withPrepTime.reasoning}</p>
              </div>

              <div className="scenario-card">
                <h4>In-Character</h4>
                <p className="scenario-winner">
                  Winner:{' '}
                  <strong>
                    {comparison.scenarios.inCharacter.winner === 'character1'
                      ? comparison.character1Name
                      : comparison.character2Name}
                  </strong>
                </p>
                <p className="scenario-confidence">
                  Confidence: {Math.round(comparison.scenarios.inCharacter.confidence * 100)}%
                </p>
                <p className="scenario-reasoning">{comparison.scenarios.inCharacter.reasoning}</p>
              </div>
            </div>
          </div>

          {/* Analysis */}
          <div className="analysis-section">
            <h2>Detailed Analysis</h2>
            <div className="analysis-content">
              {comparison.analysis.split('\n').map((line, i) => {
                if (line.startsWith('##')) {
                  return (
                    <h3 key={i} className="analysis-heading">
                      {line.replace(/^#+\s/, '')}
                    </h3>
                  );
                }
                if (line.startsWith('- ')) {
                  return (
                    <li key={i} className="analysis-item">
                      {line.replace(/^- /, '')}
                    </li>
                  );
                }
                if (line.trim() === '') return null;
                return (
                  <p key={i} className="analysis-text">
                    {line}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <footer className="app-footer">
        <p>⚖️ All comparisons are based on available canon feats and known abilities.</p>
        <p>
          This analysis combines multiple combat dimensions and is best viewed as entertaining
          debate, not definitive.
        </p>
      </footer>
    </div>
  );
}

export default App;
