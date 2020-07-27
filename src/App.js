import React, { useState, useEffect } from 'react';
import styles from './App.less';

function App() {
  const [trainsInTransit, setTrainsInTransit] = useState('None');
  const [currentTime, setCurrentTime] = useState('09:00');
  const [journeys, setJourneys] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/journeys')
      .then((res) => res.json())
      .then((data) => setJourneys(data));
  }, []);

  return (
    <div className="App">
      <header>
        <h3>Jiminny Trainspotting</h3>
        <button hidden>Start</button>
        <section hidden className="header-info">
          <h4>Trains in transit:&nbsp;</h4>
          <p>{trainsInTransit}</p>
          <h4 id="current-time-title">Current time:&nbsp;</h4>
          <p>{currentTime}</p>
        </section>
      </header>
      <table className={styles.grid}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Route</th>
            <th>Timetable</th>
            <th hidden id="next-station-title">
              Next Station
            </th>
            <th>Train</th>
          </tr>
        </thead>
        {journeys.map((j, i) => (
          <tbody key={i}>
            <tr>
              <td>{j.name}</td>
              <td>{j.route}</td>
              <td>
                {j.timetable.map((t) => {
                  const journeyDateTime = new Date(t.time);
                  console.log(journeyDateTime, t.time);
                  return (
                    <p>{`${journeyDateTime.getHours()}:${journeyDateTime.getMinutes()}: ${
                      t.station
                    }`}</p>
                  );
                })}
              </td>
              <td hidden className="next-station-content">
                Next station
              </td>
              <td>{j.train.name}</td>
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}

export default App;
