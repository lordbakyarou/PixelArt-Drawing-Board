//The code allows users to draw on a grid using either a mouse or touch input. It also supports features like erasing, changing colors, zooming, saving the drawing, and undoing actions.

let events = {
  mouse: {
    down: "mousedown",
    move: "mousemove",
    up: "mouseup",
  },
  touch: {
    down: "touchstart",
    move: "touchmove",
    up: "touchend",
  },
};

let deviceType = "";

const isTouchDevice = () => {
  try {
    document.createEvent("TouchEvent");
    deviceType = "touch";
    return true;
  } catch (e) {
    deviceType = "mouse";
    return false;
  }
};

isTouchDevice();

const container = document.querySelector(".container");
const gridButton = document.getElementById("submit-grid");
const clearGridButton = document.getElementById("clear-grid");
const gridWidth = document.getElementById("width-range");
const gridHeight = document.getElementById("height-range");
const colorButton = document.getElementById("color-input");
const eraseBtn = document.getElementById("erase-btn");
const paintBtn = document.getElementById("paint-btn");
const widthValue = document.getElementById("width-value");
const heightValue = document.getElementById("height-value");

const saveDrawingButton = document.getElementById("save-btn");

const buttons = document.querySelectorAll(".button-click");

const widthRange = document.getElementById("width-range");
const heightRange = document.getElementById("height-range");

const zoomLevel = document.getElementById("zoom-level");

const zoomValue = document.getElementById("zoom-value");

zoomValue.textContent = zoomLevel.value;

zoomLevel.addEventListener("input", () => {
  const zoomLevelNumber = parseInt(zoomLevel.value);
  container.style.zoom = `${zoomLevelNumber / 10}`;

  // Update the zoom value display
  zoomValue.innerText = zoomLevelNumber.toString().padStart(2, "0");
});

widthRange.addEventListener("input", () => {
  widthValue.value = widthRange.value.padStart(2, "0");
});

heightRange.addEventListener("input", () => {
  heightValue.value = heightRange.value.padStart(2, "0");
});

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    button.classList.remove("button-click");
    void button.offsetWidth;
    button.classList.add("button-click");
  });
});

let draw = false;
let erase = false;

let history = [];

let previousState = Array.from({ length: gridHeight.value }, () =>
  Array.from({ length: gridWidth.value }, () => "transparent")
);

gridButton.addEventListener("click", () => {
  container.innerHTML = "";
  const count = 0;
  for (let i = 0; i < gridHeight.value; i++) {
    let div = document.createElement("div");
    div.classList.add("gridRow");

    for (let j = 0; j < gridWidth.value; j++) {
      let col = document.createElement("div");
      col.classList.add("gridCol");
      col.setAttribute("id", `gridCol${i}_${j}`);

      col.addEventListener(events[deviceType].down, () => {
        draw = true;
        let colIndex = parseInt(col.getAttribute("id").split("_")[1]);
        let rowIndex = parseInt(col.getAttribute("id").split("_")[0]);
        if (erase) {
          col.style.backgroundColor = "transparent";
          if (history.length > 0) {
            history[history.length - 1][rowIndex][colIndex] = null;
          }
        } else {
          col.style.backgroundColor = colorButton.value;
        }
      });

      col.addEventListener(events[deviceType].move, (e) => {
        let element = document.elementFromPoint(
          !isTouchDevice() ? e.clientX : e.touches[0].clientX,
          !isTouchDevice() ? e.clientY : e.touches[0].clientY
        );
        if (element && element.classList.contains("gridCol")) {
          if (draw && !erase) {
            element.style.backgroundColor = colorButton.value;
          } else if (draw && erase) {
            element.style.backgroundColor = "transparent";
          }
        }
      });

      col.addEventListener(events[deviceType].up, () => {
        draw = false;
        if (!erase) {
          if (
            history.length === 0 ||
            JSON.stringify(history[history.length - 1]) !==
              JSON.stringify(previousState)
          ) {
            history.push(previousState);
          }
          previousState = Array.from(container.children).map((row) => {
            return Array.from(row.children).map(
              (col) => col.style.backgroundColor
            );
          });
        }
      });

      div.appendChild(col);
    }

    container.appendChild(div);
  }
});

clearGridButton.addEventListener("click", () => {
  let gridColumns = document.querySelectorAll(".gridCol");
  gridColumns.forEach((element) => {
    element.style.backgroundColor = "transparent";
  });
});

eraseBtn.addEventListener("click", () => {
  erase = true;
});

paintBtn.addEventListener("click", () => {
  erase = false;
});

gridWidth.addEventListener("input", () => {
  widthValue.innerHTML =
    gridWidth.value < 9 ? `0${gridWidth.value}` : gridWidth.value;
});

gridHeight.addEventListener("input", () => {
  heightValue.innerHTML =
    gridHeight.value < 9 ? `0${gridHeight.value}` : gridHeight.value;
});

window.onload = () => {
  gridHeight.value = 0;
  gridWidth.value = 0;
};

document.addEventListener("keydown", (event) => {
  if (event.ctrlKey && event.key === "z") {
    // Undo the last action
    if (history.length > 0) {
      let lastAction = history.pop();
      previousState = lastAction; // Update previousState to last state in history
      Array.from(container.children).forEach((row, rowIndex) => {
        Array.from(row.children).forEach((col, colIndex) => {
          if (lastAction[rowIndex][colIndex] === null) {
            col.style.backgroundColor = "transparent";
          } else {
            col.style.backgroundColor = lastAction[rowIndex][colIndex];
          }
        });
      });
    }
  }
});

saveDrawingButton.addEventListener("click", () => {
  const canvas = document.createElement("canvas");
  const container = document.querySelector(".container");
  const gridRows = container.querySelectorAll(".gridRow");
  const width = gridRows[0].querySelectorAll(".gridCol").length;
  const height = gridRows.length;
  const factor = 10;

  canvas.width = width * factor;
  canvas.height = height * factor;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  Array.from(gridRows).forEach((row, rowIndex) => {
    Array.from(row.querySelectorAll(".gridCol")).forEach((col, colIndex) => {
      const bgColor = col.style.backgroundColor;
      if (bgColor !== "" && bgColor !== "transparent") {
        ctx.fillStyle = bgColor;
        ctx.fillRect(colIndex * factor, rowIndex * factor, factor, factor);
      }
    });
  });

  const downloadLink = document.createElement("a");
  downloadLink.download = "drawing.png";
  downloadLink.href = canvas.toDataURL("image/png");
  downloadLink.click();
});
