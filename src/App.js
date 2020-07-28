import React, { useState, useEffect } from 'react';
import { useInterval } from './customHooks';
import { addMinutes, padWithZero } from './helpers';
import undergroundImg from './images/underground.png';
import trainImg from './images/train.png';
import './App.less';

const TIMER_DELAY = 500;
const MAX_JOURNEY_HOUR = 11;
const WIDTH_FOR_MINUTE = 5;

function App() {
  const [trainsInTransit, setTrainsInTransit] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date(2020, 5, 4, 9, 0));
  const [journeys, setJourneys] = useState([]);
  const [nextStations, setNextStations] = useState({});
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
    isTimerRunning ? TIMER_DELAY : null
  );

  useEffect(() => {
    const currentHours = currentTime.getHours();
    if (currentHours < MAX_JOURNEY_HOUR && isTimerRunning) {
      const currentMinutes = currentTime.getMinutes();
      journeys.forEach((j) => {
        const nextStation = j.timetable.find((tti) => {
          const stopTime = new Date(tti.time);
          stopTime.setMinutes(
            stopTime.getMinutes() + stopTime.getTimezoneOffset()
          );
          const stopHours = stopTime.getHours();
          const stopMinutes = stopTime.getMinutes();
          return (
            stopHours > currentHours ||
            (stopHours === currentHours && stopMinutes > currentMinutes)
          );
        });

        if (nextStation) {
          setNextStations((nextStations) => ({
            ...nextStations,
            [j.name]: nextStation.station,
          }));
        }

        const lastStopInfo = j.timetable[j.timetable.length - 1];
        const lastStopTime = new Date(lastStopInfo.time);
        lastStopTime.setMinutes(
          lastStopTime.getMinutes() + lastStopTime.getTimezoneOffset()
        );
        const lastStopHours = lastStopTime.getHours();
        const lastStopMinutes = lastStopTime.getMinutes();
        const isTrainAlreadyInArr = trainsInTransit.find(
          (t) => t.id === j.train.id
        );
        if (
          !isTrainAlreadyInArr &&
          (currentHours < lastStopHours ||
            (currentHours === lastStopHours &&
              currentMinutes < lastStopMinutes))
        ) {
          setTrainsInTransit((trainsInTransit) => [
            ...trainsInTransit,
            { id: j.train.id, name: j.train.name },
          ]);
        } else if (
          currentHours === lastStopHours &&
          currentMinutes === lastStopMinutes
        ) {
          setTrainsInTransit(
            trainsInTransit.filter((t) => t.id !== j.train.id)
          );
        }
      });
    } else if (
      currentHours === MAX_JOURNEY_HOUR &&
      trainsInTransit.length > 0
    ) {
      setTrainsInTransit([]);
    }
  }, [currentTime, journeys, isTimerRunning, trainsInTransit]);

  function toggleTimer() {
    setIsTimerRunning((isTimerRunning) => !isTimerRunning);
  }

  function getJourneyTimetable(journey) {
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
      const stopTimes = [];
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
            key={i}
            className="station-icon"
            src={undergroundImg}
            style={{ left: minutesToStop * WIDTH_FOR_MINUTE - 10 }}
            alt="Underground"
            title={currStop.station}
          />
        );
        stopLines.push(
          <div
            key={i}
            className="stop-line"
            style={{ left: minutesToStop * WIDTH_FOR_MINUTE }}
          ></div>
        );
        stopTimes.push(
          <div
            key={i}
            className="stop-time"
            style={{ left: minutesToStop * WIDTH_FOR_MINUTE - 9 }}
          >
            {padWithZero(currStopHours)}:{padWithZero(currStopMinutes)}
          </div>
        );
      }
      let trainLeftPosition =
        ((currentTime.getHours() - 9) * 60 + currentTime.getMinutes()) *
          WIDTH_FOR_MINUTE -
        8;
      const maxTrainLeftPos = totalMinutes * WIDTH_FOR_MINUTE - 8;
      if (trainLeftPosition > maxTrainLeftPos)
        trainLeftPosition = maxTrainLeftPos;
      return (
        <>
          <div className="station-icons-row">{stationIcons}</div>
          <div className="stop-lines-row">{stopLines}</div>
          <div
            className="journey-line"
            style={{ width: totalMinutes * WIDTH_FOR_MINUTE }}
          ></div>
          <div
            className="train-icon-wrapper"
            style={{ left: trainLeftPosition }}
          >
            <img className="train-icon" src={trainImg} alt="Train" />
          </div>
          <div className="stop-times-row">{stopTimes}</div>
        </>
      );
    }
  }

  return (
    <div className="app">
      <header>
        <h3>Jiminny Trainspotting</h3>
        <button hidden onClick={toggleTimer}>
          {isTimerRunning ? 'Pause' : 'Start'}
        </button>
        <section hidden className="header-info">
          <h4>Trains in transit:&nbsp;</h4>
          <p>
            {trainsInTransit.length
              ? trainsInTransit.map((t) => t.name).join(', ')
              : 'None'}
          </p>
          <h4 id="current-time-title">Current time:&nbsp;</h4>
          <p>
            {padWithZero(currentTime.getHours())}:
            {padWithZero(currentTime.getMinutes())}
          </p>
        </section>
      </header>
      <table>
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
                  journeyDateTime.setMinutes(
                    journeyDateTime.getMinutes() +
                      journeyDateTime.getTimezoneOffset()
                  );
                  return (
                    <p key={timeIndex}>{`${padWithZero(
                      journeyDateTime.getHours()
                    )}:${padWithZero(journeyDateTime.getMinutes())}: ${
                      t.station
                    }`}</p>
                  );
                })}
              </td>
              <td className="timetable-column icons" hidden>
                {getJourneyTimetable(j)}
              </td>
              <td className="next-station-column" hidden>
                {nextStations[j.name]}
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
