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

    // Format the frieze as an HTML table with offset
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
                    return `<td style="width: 20px; height: 20px;"></td><td style="width: 20px; height: 20px; text-align: center;">${cell}</td><td style="width: 20px; height: 20px;">`;
                  }
                  return `<td style="width: 20px; height: 20px; text-align: center;">${cell}</td><td style="width: 20px; height: 20px;">`;
                })
                .join("")}
            </tr>
          `)
          .join("")}
      </table>
    `;

    statusMessage.innerHTML = `Full triangulation! <br/> Quiddity sequence: [${quidditySequence.join(", ")}]<br><br>Frieze pattern:<br>${friezeHTML}`;
  } else if (diagonals.length === 1) {
    statusMessage.textContent = `Partial triangulation: ${diagonals.length} diagonal.`;
  } else if (diagonals.length < n - 3) {
    statusMessage.textContent = `Partial triangulation: ${diagonals.length} diagonals.`;
  } else {
    statusMessage.textContent = "Error: too many diagonals! Please tell me how you did that.";
  }
}

function completeTriangulation() {
  const allDiagonals = [];
  const n = vertices.length;

  // Generate all possible diagonals
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const areAdjacent = (Math.abs(i - j) === 1) || (Math.abs(i - j) === n - 1);
      if (!areAdjacent) {
        allDiagonals.push([i, j]);
      }
    }
  }

  // Filter out diagonals that are already in the triangulation
  const missingDiagonals = allDiagonals.filter(([a, b]) => {
    return !diagonals.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
  });

  // Randomly add missing diagonals until the triangulation is complete
  while (diagonals.length < n - 3 && missingDiagonals.length > 0) {
    const randomIndex = Math.floor(Math.random() * missingDiagonals.length);
    const [a, b] = missingDiagonals.splice(randomIndex, 1)[0];

    // Check if the new diagonal crosses any existing diagonal
    let crosses = false;
    for (const [c, d] of diagonals) {
      if ((isBetween(a, b, c) !== isBetween(a, b, d)) &&
          (isBetween(c, d, a) !== isBetween(c, d, b))) {
        crosses = true;
        break;
      }
    }

    // Add the diagonal if it doesn't cross any existing diagonal
    if (!crosses) {
      diagonals.push([a, b]);
    }
  }

  drawPolygon(); // Redraw the polygon with the new diagonals
  updateStatusMessage(); // Update the status message
}

// Attach the function to the new button
const completeTriangulationButton = document.getElementById("completeTriangulation");
completeTriangulationButton.addEventListener("click", completeTriangulation);

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

function createFanTriangulation() {
  const n = vertices.length;

  // Clear existing diagonals
  diagonals = [];

  // Add fan triangulation diagonals [0, 2], [0, 3], ..., [0, n-2]
  for (let i = 2; i < n-1; i++) {
    diagonals.push([0, i]);
  }

  drawPolygon(); // Redraw the polygon with the new diagonals
  updateStatusMessage(); // Update the status message
}

function createZigZagTriangulation() {
  const n = vertices.length;

  // Clear existing diagonals
  diagonals = [];

  // Add zig-zag triangulation diagonals
  let current = 0;
  let forward = true;
  
  
  for (let i = 1; i < n; i++) {
    if (i<n/2-1) {
      diagonals.push([i, n-i]);
    } else if (i>n/2+1) {
      diagonals.push([i, n-i+1]);
    }
    forward = !forward;
  }
  if (n%2==0) {
    diagonals.push([n/2-1, n/2+1]);
  }

  drawPolygon(); // Redraw the polygon with the new diagonals
  updateStatusMessage(); // Update the status message
}

// Attach the function to the new button
const zigZagTriangulationButton = document.getElementById("zigZagTriangulation");
zigZagTriangulationButton.addEventListener("click", createZigZagTriangulation);

// Attach the function to the new button
const fanTriangulationButton = document.getElementById("fanTriangulation");
fanTriangulationButton.addEventListener("click", createFanTriangulation);

// Function to check if a point is near a line segment
function isPointNearLineSegment(x, y, x1, y1, x2, y2, tolerance = 5) {
  // Check if the click is near either endpoint (vertices)
  const distanceToStart = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
  const distanceToEnd = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);

  if (distanceToStart <= tolerance || distanceToEnd <= tolerance) {
    return false; // Click is near a vertex, not the line segment
  }
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  const param = lenSq !== 0 ? dot / lenSq : -1;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = x - xx;
  const dy = y - yy;
  return dx * dx + dy * dy <= tolerance * tolerance;
}

// Handle click to detect diagonal and show menu
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let clickedDiagonal = null;

  // Check if the click is near any diagonal
  for (let i = 0; i < diagonals.length; i++) {
    const [a, b] = diagonals[i];
    const { x: x1, y: y1 } = vertices[a];
    const { x: x2, y: y2 } = vertices[b];

    if (isPointNearLineSegment(mouseX, mouseY, x1, y1, x2, y2)) {
      clickedDiagonal = i;
      break;
    }
  }

  if (clickedDiagonal !== null) {
    // Show the menu near the clicked diagonal
    const vertexMenu = document.getElementById("vertexMenu");
    vertexMenu.style.display = "block";
    vertexMenu.style.left = `${e.clientX}px`;
    vertexMenu.style.top = `${e.clientY}px`;

    // Attach delete functionality to the menu
    const deleteButton = document.getElementById("deleteVertex");
    deleteButton.onclick = function () {
      diagonals.splice(clickedDiagonal, 1); // Remove the clicked diagonal
      vertexMenu.style.display = "none"; // Hide the menu
      drawPolygon(); // Redraw the polygon
      updateStatusMessage(); // Update the status message
    };
  } else {
    // Hide the menu if no diagonal is clicked
    const vertexMenu = document.getElementById("vertexMenu");
    vertexMenu.style.display = "none";
  }
});

// Function to check if the triangulation is complete
function isFullTriangulation() {
  return diagonals.length === n - 3;
}

// Function to find the unique permissible diagonal that replaces the given diagonal
function findReplacementDiagonal(a, b) {
// List all diagonals that do not cross the existing diagonals, except the one being replaced
  const replacementDiagonals = [];
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const areAdjacent = (Math.abs(i - j) === 1) || (Math.abs(i - j) === n - 1);
      if (areAdjacent) {
        continue; // Skip adjacent vertices
      }
      //check that the diagonal is not an existing diagonal
      if (diagonals.some(d => (d[0] === i && d[1] === j) || (d[0] === j && d[1] === i))) {
        continue;}
      let crosses = false;
      for (const [c, d] of diagonals) {
        if ((c !== a || d !== b) && (isBetween(i, j, c) !== isBetween(i, j, d)) && (isBetween(c, d, i) !== isBetween(c, d, j))) {
          crosses = true;
          break;
        }
      }
      if (!crosses) {
          replacementDiagonals.push([i, j]);
        }
      
    }
  }
  console.log(diagonals);
  console.log("Replacement diagonals:", replacementDiagonals);
  // Check if there is exactly one valid replacement diagonal
  if (replacementDiagonals.length === 1) {
    return replacementDiagonals[0]; // Return the unique replacement diagonal
  }

  return null; // No valid replacement diagonal found
}

// Handle click to detect diagonal and show menu
canvas.addEventListener("click", function (e) {
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  let clickedDiagonal = null;

  // Check if the click is near any diagonal
  for (let i = 0; i < diagonals.length; i++) {
    const [a, b] = diagonals[i];
    const { x: x1, y: y1 } = vertices[a];
    const { x: x2, y: y2 } = vertices[b];

    if (isPointNearLineSegment(mouseX, mouseY, x1, y1, x2, y2)) {
      clickedDiagonal = i;
      break;
    }
  }

  if (clickedDiagonal !== null) {
    // Show the menu near the clicked diagonal
    const vertexMenu = document.getElementById("vertexMenu");
    vertexMenu.style.display = "block";
    vertexMenu.style.left = `${e.clientX}px`;
    vertexMenu.style.top = `${e.clientY}px`;

    // Enable or disable the "Mutate" button based on triangulation status
    const mutateButton = document.getElementById("mutateDiagonal");
    if (isFullTriangulation()) {
      mutateButton.disabled = false;
    } else {
      mutateButton.disabled = true;
    }

    // Attach delete functionality to the menu
    const deleteButton = document.getElementById("deleteVertex");
    deleteButton.onclick = function () {
      diagonals.splice(clickedDiagonal, 1); // Remove the clicked diagonal
      vertexMenu.style.display = "none"; // Hide the menu
      drawPolygon(); // Redraw the polygon
      updateStatusMessage(); // Update the status message
    };

    // Attach mutate functionality to the menu
    mutateButton.onclick = function () {
      const [a, b] = diagonals[clickedDiagonal];
      const replacement = findReplacementDiagonal(a, b);

      if (replacement) {
        diagonals.splice(clickedDiagonal, 1); // Remove the current diagonal
        diagonals.push(replacement); // Add the replacement diagonal
        vertexMenu.style.display = "none"; // Hide the menu
        drawPolygon(); // Redraw the polygon
        updateStatusMessage(); // Update the status message
      } else {
        alert("No valid replacement diagonal found!");
      }
    };
  } else {
    // Hide the menu if no diagonal is clicked
    const vertexMenu = document.getElementById("vertexMenu");
    vertexMenu.style.display = "none";
  }
});