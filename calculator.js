const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let n = 7;  // number of vertices
const radius = 250;
const center = { x: canvas.width / 2, y: canvas.height / 2 };
let vertices = createVertices(n);  // Array of vertex positions

let selectedVertices = [];
let diagonals = [];

function createVertices(numVertices) {
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const radius = Math.min(centerX, centerY) * 0.8;
  const verts = [];

  for (let i = 0; i < numVertices; i++) {
    const angle = (2 * Math.PI * i) / numVertices;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    verts.push({ x, y });
  }

  return verts;
}

// Function to check if x is between a and b
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
    const quidditySequence = calculateQuidditySequence();
    const frieze = calculateFrieze(quidditySequence);

    // Format the frieze for display
    const friezeHTML = `
      <table style="border-collapse: collapse; margin: 0 auto;">
      ${frieze
        .map((row, rowIndex) => `
          <tr>
            ${row
              .map((cell, colIndex) => {
                // Add offset: empty cells for diagonal alignment
                if (rowIndex % 2 === 1 && colIndex === 0) {
                  // Add an empty cell at the start of odd rows
                  return `<td style="width: 20px; height: 20px;"></td><td style="width: 20px; height: 20px; text-align: center; border: 1px solid black;">${cell}</td><td style="width: 20px; height: 20px;"></td>`;
                }
                return `<td style="width: 20px; height: 20px; text-align: center; border: 1px solid black;">${cell}</td><td style="width: 20px; height: 20px;"></td>`;
              })
              .join("")}
          </tr>
        `)
        .join("")}
      </table>
    `;
    statusMessage.innerHTML = `Full triangulation! Quiddity sequence: [${quidditySequence.join(", ")}]<br><br>Frieze pattern:<br>${friezeHTML}`;
  } else if (diagonals.length === 1) {
    statusMessage.textContent = `Partial triangulation: ${diagonals.length} diagonal.`;
  } else if (diagonals.length < n - 3) {
    statusMessage.textContent = `Partial triangulation: ${diagonals.length} diagonals.`;
  } else {
    statusMessage.textContent = "Error: too many diagonals! Please tell me how you did that.";
  }
}

// Function to reset the triangulation
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

  ctx.strokeStyle = "blue";
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

function updatePolygonSize() {
  const numVerticesInput = document.getElementById("numVertices");
  let numVertices = parseInt(numVerticesInput.value, 10);

  // Ensure the number of vertices is at least 4
  if (numVertices < 4) {
    alert("The polygon must have at least 4 vertices!");
    return;
  }
  n = numVertices;
  // Reset diagonals and selected vertices
  diagonals = [];
  selectedVertices = [];
  
  // Update the vertices array to create a new polygon with the specified number of vertices
  //vertices = Array.from({ length: numVertices }, (_, i) => i);  // Array [0, 1, 2, ..., n-1]
  vertices = createVertices(n);  // Create new vertices based on the updated number of vertices
  drawPolygon();  // Redraw the polygon with the new number of vertices
  updateStatusMessage();  // Update the status message
}

function calculateQuidditySequence() {
  // Check if the triangulation is complete
  if (diagonals.length !== n - 3) {
    console.error("The triangulation is not complete. Cannot calculate quiddity sequence.");
    return []; // Return an empty array if the triangulation is incomplete
  }

  // Initialize the quiddity sequence with zeros
  const quidditySequence = Array(n).fill(0);

  // Count the number of diagonals connected to each vertex
  diagonals.forEach(([a, b]) => {
    quidditySequence[a]++;
    quidditySequence[b]++;
  });

  // Add 1 to each vertex to account for the polygon edges
  for (let i = 0; i < n; i++) {
    quidditySequence[i] += 1;
  }

  return quidditySequence;
}

const updatePolygonButton = document.getElementById("updatePolygon");
updatePolygonButton.addEventListener("click", updatePolygonSize);

function calculateFrieze(quidditySequence) {
  const n = quidditySequence.length;

  // Initialize the frieze grid
  const frieze = [];

  // First row: all zeroes
  frieze.push(Array(n * 2).fill(0));
  console.log("First row:", frieze[0]);
  // Second row: all ones, offset diagonally
  frieze.push(Array(n * 2).fill(1));
  console.log("Second row:", frieze[1]);
  // Third row: quiddity sequence repeated twice
  frieze.push([...quidditySequence, ...quidditySequence]);
  console.log("Third row:", frieze[2]);
  // Fill the rest of the frieze
  for (let row = 3; row < n + 1; row++) {
    const currentRow = Array(n * 2).fill(0);

    for (let col = 0; col < n * 2; col++) {
      // Get the numbers in the diamond
      const a = frieze[row - 2][col]; // Current row, two rows above
      let b = 0;
      let c = 0;
      if (row % 2 === 0) {
        b = frieze[row - 1][(col - 1 + n * 2) % (n * 2)]; // Left in the row above
        c = frieze[row - 1][col]; // Right in the row above
      } else {
        b = frieze[row - 1][(col + 1 + n * 2) % (n * 2)]; // Right in the row above
        c = frieze[row - 1][col]; // Left in the row above
      }
      // Calculate the number using the rule: b * c - a * d = 1
      currentRow[col] = Math.floor((b * c - 1) / a);
    }
    console.log(`Row ${row}:`, currentRow);
    frieze.push(currentRow);
  }

  // Add the final rows: all ones and all zeroes
  //frieze.push(Array(n * 2).fill(1));
  //frieze.push(Array(n * 2).fill(0));

  return frieze;
}

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

