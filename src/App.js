import "./App.css";
import axios from "axios";
import { useEffect, useState } from "react";

const HEIGHT = 50;
const WIDTH = 150;

const keyStrokeDirections = {
  right: [0, 1],
  left: [0, -1],
  up: [-1, 0],
  down: [1, 0],
};

const calcuateNextLoc = (currentPos, move) => {
  return [
    Number(currentPos[0]) + keyStrokeDirections[move][0],
    Number(currentPos[1]) + keyStrokeDirections[move][1],
  ];
};

function CreateGrid() {
  const [locations, setLocations] = useState({});

  useEffect(() => {
    const intervalId = setInterval(() => {
      axios
        .get("http://localhost:2000/location")
        .then(function (response) {
          setLocations(response.data);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          // always executed
        });
    }, 1000);

    return () => clearInterval(intervalId);
  });

  return Array(HEIGHT)
    .fill(1)
    .map((a, i) => {
      return (
        <div className="row" key={i}>
          {Array(WIDTH)
            .fill(1)
            .map((a, j) => {
              const key = `${i}-${j}`;
              if (locations[key]) {
                switch (locations[key].state) {
                  case "skipped":
                    return <div className="skipped" key={key}></div>;
                  case "captured":
                    return <div className="captured" key={key}></div>;
                  case "focused":
                    return <div className="focused" key={key}></div>;
                  default:
                    return <div className="skipped" key={key}></div>;
                }
              } else {
                return <div className="column" key={key}></div>;
              }
            })}
        </div>
      );
    });
}

const checkMoveLegal = (currentPos, direction) => {
  const newLocation = calcuateNextLoc(currentPos, direction);

  if (newLocation[0] >= 0 && newLocation[1] >= 0) {
    return true;
  }
  return false;
};

function App() {
  const [path, setPath] = useState(["0-0"]);
  const [upActive, setUpActive] = useState(false);
  const [downActive, setDownActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);
  const [leftActive, setLeftActive] = useState(false);

  useEffect(() => {
    const currentPos = path[path.length - 1].split("-");
    if (checkMoveLegal(currentPos, "up")) {
      setUpActive(true);
    }

    if (checkMoveLegal(currentPos, "down")) {
      setDownActive(true);
    }

    if (checkMoveLegal(currentPos, "right")) {
      setRightActive(true);
    }

    if (checkMoveLegal(currentPos, "left")) {
      setLeftActive(true);
    }
  }, [path]);

  function moveCamera(direction) {
    const latestLocation = path[path.length - 1].split("-");

    const newLocation = calcuateNextLoc(latestLocation, direction);

    if (newLocation[0] >= 0 && newLocation[1] >= 0) {
      axios
        .post("http://localhost:2000/key-stroke", {
          direction,
        })
        .then(function (response) {
          setPath(response.data);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          // always executed
        });
    }
  }

  return (
    <div className="App">
      <div className="container">
        <CreateGrid />
      </div>
      <div className="container">
        <button disabled={!upActive} onClick={() => moveCamera("up")}>
          Up
        </button>
        <button disabled={!downActive} onClick={() => moveCamera("down")}>
          Down
        </button>
        <button disabled={!leftActive} onClick={() => moveCamera("left")}>
          Left
        </button>
        <button disabled={!rightActive} onClick={() => moveCamera("right")}>
          Right
        </button>
      </div>
    </div>
  );
}

export default App;
