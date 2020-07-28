import React, { useState, useEffect } from 'react';
import { useInterval } from './customHooks';
import { addMinutes, padWithZero } from './helpers';
import styles from './App.less';
import undergroundImg from './images/underground.png';

function App() {
  const [trainsInTransit, setTrainsInTransit] = useState('None');
  const [currentTime, setCurrentTime] = useState(new Date(2020, 5, 4, 9, 0));
  const [journeys, setJourneys] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    fetch('http://localhost:3000/journeys')
      .then((res) => res.json())
      .then((data) => setJourneys(data));
  }, []);

  useInterval(
    () => {
      setCurrentTime((currentTime) => addMinutes(currentTime, 1));
    },
    isTimerRunning ? 500 : null
  );

  useEffect(() => {
    console.log(journeys);
  }, [currentTime, journeys]);

  function toggleTimer() {
    setIsTimerRunning((isTimerRunning) => !isTimerRunning);
  }

  function getIcons(journey) {
    if (journey && journey.timetable) {
      const lastStopInfo = journey.timetable[journey.timetable.length - 1];
      const lastStopTime = new Date(lastStopInfo.time);
      lastStopTime.setMinutes(
        lastStopTime.getMinutes() + lastStopTime.getTimezoneOffset()
      );
      const lastStopHours = lastStopTime.getHours();
      const lastStopMinutes = lastStopTime.getMinutes();
      const totalMinutes = (lastStopHours - 9) * 60 + lastStopMinutes;
      let stationIcons = [];
      const stopLines = [];
      for (let i = 0; i < journey.timetable.length; i++) {
        const currStop = journey.timetable[i];
        const currStopTime = new Date(currStop.time);
        currStopTime.setMinutes(
          currStopTime.getMinutes() + currStopTime.getTimezoneOffset()
        );
        const currStopHours = currStopTime.getHours();
        const currStopMinutes = currStopTime.getMinutes();
        let minutesToStop = (currStopHours - 9) * 60 + currStopMinutes;
        stationIcons.push(
          <img
            className="station-icon"
            src={undergroundImg}
            style={{ position: 'absolute', left: minutesToStop * 5 - 10 }}
            alt="Underground"
            title={currStop.station}
          />
        );
        stopLines.push(
          <div
            style={{
              borderLeft: '1px solid #000000',
              position: 'absolute',
              left: minutesToStop * 5,
              height: '28px',
            }}
          ></div>
        );
      }
      return (
        <>
          <div className="station-icons-row">{stationIcons}</div>
          <div className="stop-lines-row">{stopLines}</div>
          <div
            className="journey-line"
            style={{ width: totalMinutes * 5 }}
          ></div>
        </>
      );
    }
  }

  return (
    <div className="App">
      <header>
        <h3>Jiminny Trainspotting</h3>
        <button hidden onClick={toggleTimer}>
          {isTimerRunning ? 'Pause' : 'Start'}
        </button>
        <section hidden className="header-info">
          <h4>Trains in transit:&nbsp;</h4>
          <p>{trainsInTransit}</p>
          <h4 id="current-time-title">Current time:&nbsp;</h4>
          <p>
            {padWithZero(currentTime.getHours())}:
            {padWithZero(currentTime.getMinutes())}
          </p>
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
              <td className="timetable-column text">
                {j.timetable.map((t, timeIndex) => {
                  const journeyDateTime = new Date(t.time);
                  return (
                    <p
                      key={timeIndex}
                    >{`${journeyDateTime.getHours()}:${journeyDateTime.getMinutes()}: ${
                      t.station
                    }`}</p>
                  );
                })}
              </td>
              <td className="timetable-column icons" hidden>
                {getIcons(j)}
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
