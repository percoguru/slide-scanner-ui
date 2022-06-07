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

function CreateGrid(props) {
  const [locations, setLocations] = useState({});

  useEffect(() => {
    axios
      .get("http://localhost:2000/location")
      .then(function (response) {
        console.log(response.data);
        setLocations(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      })
      .then(function () {
        // always executed
      });
  }, [props.path.length]);

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
    }, 500);

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
              } else if (locations[key] === null) {
                return <div className="skipped" key={key}></div>;
              } else {
                return <div className="column" key={key}></div>;
              }
            })}
        </div>
      );
    });
}

// const checkMoveLegal = (currentPos, direction) => {
//   const newLocation = calcuateNextLoc(currentPos, direction);

//   if (
//     newLocation[0] >= 0 &&
//     newLocation[1] >= 0 &&
//     newLocation[0] < HEIGHT &&
//     newLocation[1] < WIDTH
//   ) {
//     return true;
//   }
//   return false;
// };

function App() {
  const [path, setPath] = useState(["0-0"]);
  // const [upActive, setUpActive] = useState(false);
  // const [downActive, setDownActive] = useState(false);
  // const [rightActive, setRightActive] = useState(false);
  // const [leftActive, setLeftActive] = useState(false);

  // useEffect(() => {
  //   const currentPos = path[path.length - 1].split("-");
  //   if (checkMoveLegal(currentPos, "up")) {
  //     setUpActive(true);
  //   } else {
  //     setUpActive(false);
  //   }

  //   if (checkMoveLegal(currentPos, "down")) {
  //     setDownActive(true);
  //   } else {
  //     setDownActive(false);
  //   }

  //   if (checkMoveLegal(currentPos, "right")) {
  //     setRightActive(true);
  //   } else {
  //     setRightActive(false);
  //   }

  //   if (checkMoveLegal(currentPos, "left")) {
  //     setLeftActive(true);
  //   } else {
  //     setLeftActive(false);
  //   }
  // }, [path]);

  function moveCamera(direction) {
    const latestLocation = path[path.length - 1].split("-");

    const newLocation = calcuateNextLoc(latestLocation, direction);

    if (
      newLocation[0] >= 0 &&
      newLocation[1] >= 0 &&
      newLocation[0] < HEIGHT &&
      newLocation[1] < WIDTH
    ) {
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

  function keyDownHandler(event) {
    if (event.code === "ArrowUp") {
      moveCamera("up");
    }

    if (event.code === "ArrowDown") {
      console.log(1, path);
      moveCamera("down");
    }

    if (event.code === "ArrowLeft") {
      moveCamera("left");
    }

    if (event.code === "ArrowRight") {
      moveCamera("right");
    }
  }

  return (
    <div className="App" onKeyDown={keyDownHandler} tabIndex={0}>
      <div className="container">
        <CreateGrid path={path} />
      </div>
      {/* <div className="container">
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
      </div> */}
    </div>
  );
}

export default App;
