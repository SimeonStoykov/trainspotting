import React, { useState, useEffect } from "react";
import styles from "./App.css";

function App() {
  const [trainsInTransit, setTrainsInTransit] = useState("None");
  const [currentTime, setCurrentTime] = useState("09:00");
  const [journeys, setJourneys] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/journeys")
      .then((res) => res.json())
      .then((data) => setJourneys(data));
  }, []);

  return (
    <div className="App">
      <header>
        <h3>Jiminny Trainspotting</h3>
        <button>Start</button>
        <section className="header-info">
          <h4>Trains in transit:&nbsp;</h4>
          <p>{trainsInTransit}</p>
          <h4 id="current-time-title">Current time:&nbsp;</h4>
          <p>{currentTime}</p>
        </section>
      </header>
      <main className={styles.grid}>
        <header>
          <h4>Name</h4>
          <h4>Route</h4>
          <h4>Timetable</h4>
          <h4>Next Station</h4>
          <h4>Train</h4>
        </header>
        <section>
          {journeys.map((j, i) => (
            <article key={i}>
              <div>{j.name}</div>
              <div>{j.route}</div>
              <div>
                {j.timetable.map((t) => (
                  <>
                    <div>{t.time}</div>
                  </>
                ))}
              </div>
              <div>Next station</div>
              <div>{j.train.name}</div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}

export default App;
