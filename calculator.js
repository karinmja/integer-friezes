const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const n = 7;  // number of vertices
const radius = 250;
const center = { x: canvas.width / 2, y: canvas.height / 2 };
const vertices = [];

// Calculate vertex positions
for (let i = 0; i < n; i++) {
  const angle = (2 * Math.PI * i) / n - Math.PI / 2;
  const x = center.x + radius * Math.cos(angle);
  const y = center.y + radius * Math.sin(angle);
  vertices.push({ x, y });
}

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
      // Add logic here to draw diagonals, store edges, etc.
      break;
    }
  }
});