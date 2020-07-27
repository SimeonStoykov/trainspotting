import React, { useState, useEffect } from 'react';
import styles from './App.less';

function App() {
  const [trainsInTransit, setTrainsInTransit] = useState('None');
  const [minutesPassed, setMinutesPassed] = useState(0);
  const [journeys, setJourneys] = useState([]);
  const [isTimerActive, setIsTimerActive] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3000/journeys')
      .then((res) => res.json())
      .then((data) => setJourneys(data));
  }, []);

  useEffect(() => {
    let timerInterval = null;
    if (isTimerActive) {
      timerInterval = setInterval(() => {
        setMinutesPassed((minutesPassed) => minutesPassed + 1);
      }, 500);
    } else if (!isTimerActive && minutesPassed !== 0) {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [isTimerActive, minutesPassed]);

  function toggleTimer() {
    setIsTimerActive(!isTimerActive);
  }

  return (
    <div className="App">
      <header>
        <h3>Jiminny Trainspotting</h3>
        <button hidden onClick={toggleTimer}>
          {isTimerActive ? 'Pause' : 'Start'}
        </button>
        <section hidden className="header-info">
          <h4>Trains in transit:&nbsp;</h4>
          <p>{trainsInTransit}</p>
          <h4 id="current-time-title">Current time:&nbsp;</h4>
          <p>{minutesPassed}</p>
        </section>
      </header>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th className="name-column">Name</th>
            <th className="route-column">Route</th>
            <th className="name-route-column" hidden>
              Name / Route
            </th>
            <th className="timetable-column">Timetable</th>
            <th className="next-station-column" hidden>
              Next Station
            </th>
            <th className="train-column">Train</th>
          </tr>
        </thead>
        <tbody>
          {journeys.map((j, i) => (
            <tr key={i}>
              <td className="name-column">{j.name}</td>
              <td className="route-column">{j.route}</td>
              <td hidden className="name-route-column">
                {j.name} / {j.route}
              </td>
              <td className="timetable-column">
                {j.timetable.map((t) => {
                  const journeyDateTime = new Date(t.time);
                  return (
                    <p>{`${journeyDateTime.getHours()}:${journeyDateTime.getMinutes()}: ${
                      t.station
                    }`}</p>
                  );
                })}
              </td>
              <td className="next-station-column" hidden>
                Next station
              </td>
              <td className="train-column">{j.train.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
