const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const n = 7;  // number of vertices
const radius = 250;
const center = { x: canvas.width / 2, y: canvas.height / 2 };
const vertices = [];

let selectedVertices = [];
let diagonals = [];



// Calculate vertex positions
for (let i = 0; i < n; i++) {
  const angle = (2 * Math.PI * i) / n - Math.PI / 2;
  const x = center.x + radius * Math.cos(angle);
  const y = center.y + radius * Math.sin(angle);
  vertices.push({ x, y });
}

function isBetween(a, b, x) {
  if (a < b) {
    return a < x && x < b;
  } else {
    return a < x || x < b;
  }
}

function updateStatusMessage() {
  const n = vertices.length;
  const statusMessage = document.getElementById("statusMessage");
  if (diagonals.length === n - 3) {
    statusMessage.textContent = "Full triangulation!";
  } 
  else if (diagonals.length === 1) {
    statusMessage.textContent = `Partial triangulation: ${diagonals.length} diagonal.`;

  }
    else if (diagonals.length < n - 3) {
    statusMessage.textContent = `Partial triangulation: ${diagonals.length} diagonals.`;
  } else {
    statusMessage.textContent = "Error: too many diagonals! Please tell me how you did that.";
  }
}

function resetTriangulation() {
  diagonals = [];
  selectedVertices = [];
  drawPolygon();  // Re-draw the polygon without any diagonals.
  updateStatusMessage();  // Update the status to reflect the reset.
}

const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", resetTriangulation);

// Draw the polygon
function drawPolygon() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.moveTo(vertices[0].x, vertices[0].y);
  for (let i = 1; i < n; i++) {
    ctx.lineTo(vertices[i].x, vertices[i].y);
  }
  ctx.closePath();
  ctx.stroke();
  // Draw diagonals

  ctx.strokeStyle = "red";
  diagonals.forEach(([i, j]) => {
    const vi = vertices[i];
    const vj = vertices[j];
    ctx.beginPath();
    ctx.moveTo(vi.x, vi.y);
    ctx.lineTo(vj.x, vj.y);
    ctx.stroke();
  });
  ctx.strokeStyle = "black";  // reset for polygon outline


  // Draw vertices as circles
  vertices.forEach((v, i) => {
    ctx.beginPath();
    ctx.arc(v.x, v.y, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
    ctx.fillStyle = "white";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(i, v.x, v.y);  // optional: show index numbers

  });

  // Draw highlight for selected vertices
  ctx.strokeStyle = "blue";
  ctx.lineWidth = 2;
  selectedVertices.forEach(i => {
    const v = vertices[i];
    ctx.beginPath();
    ctx.arc(v.x, v.y, 12, 0, 2 * Math.PI);
    ctx.stroke();
  });
ctx.lineWidth = 1;  // reset
ctx.strokeStyle = "black";  // reset
}

drawPolygon();

// Handle click to select vertex
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  for (let i = 0; i < vertices.length; i++) {
    const dx = vertices[i].x - mouseX;
    const dy = vertices[i].y - mouseY;
    if (dx * dx + dy * dy < 100) {
      console.log("Clicked vertex:", i);
      selectedVertices.push(i);
    
      if (selectedVertices.length === 2) {
        let [a, b] = selectedVertices;
        if (a > b) {
          [a, b] = [b, a];
        }
        const areAdjacent = (Math.abs(a - b) === 1) || (Math.abs(a - b) === n - 1);
        // Prevent duplicate diagonals or edges (optional)
        if (a !== b && !areAdjacent && !diagonals.some(d => (d[0] === a && d[1] === b) || (d[0] === b && d[1] === a))) {
          if (a !== b && !areAdjacent && !diagonals.some(d => (d[0] === a && d[1] === b) || (d[0] === b && d[1] === a))) {
    
            let crosses = false;
            for (const [c, d] of diagonals) {
              if ((isBetween(a, b, c) !== isBetween(a, b, d)) &&
                  (isBetween(c, d, a) !== isBetween(c, d, b))) {
                crosses = true;
                break;
              }
            }
        
            if (!crosses) {
              diagonals.push([a, b]);
              updateStatusMessage();
            }
          }
        
        }
        selectedVertices = [];  // reset
      }
    
      drawPolygon();  // redraw to show changes
      break;
    }
  }
});
