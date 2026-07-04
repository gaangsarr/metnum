let chartInstance = null;

function hitungRiemann() {
  const fxStr = document.getElementById("fx").value;
  const a = parseFloat(document.getElementById("bawah").value);
  const b = parseFloat(document.getElementById("atas").value);
  const n = parseInt(document.getElementById("n").value);

  if (isNaN(a) || isNaN(b) || isNaN(n)) {
    alert("Mohon masukkan angka input yang valid.");
    return;
  }
  if (a >= b) {
    alert("Error: Batas bawah (a) harus lebih kecil daripada batas atas (b)!");
    return;
  }
  if (n < 1 || n > 500) {
    alert("Error: Jumlah partisi (n) harus berada di antara 1 sampai 500!");
    return;
  }

  let expr, f;
  try {
    expr = math.compile(fxStr);
    f = (x) => expr.evaluate({ x: x });
    f(a);
  } catch (e) {
    alert(
      "Fungsi f(x) tidak valid. Pastikan penulisan benar, contoh: x^2, sin(x), 2*x + 1",
    );
    return;
  }

  const deltaX = (b - a) / n;
  let totalLuas = 0;
  let tableRows = "";
  let barData = [];
  let lineDataX = [];
  let lineDataY = [];

  const smoothSteps = 500;
  const stepSize = (b - a) / smoothSteps;
  for (let k = 0; k <= smoothSteps; k++) {
    let currentX = a + k * stepSize;
    lineDataX.push(currentX);
    lineDataY.push(f(currentX));
  }

  for (let i = 1; i <= n; i++) {
    let xi = a + i * deltaX;
    let fxi = f(xi);
    let luasKotak = deltaX * fxi;
    totalLuas += luasKotak;

    tableRows += `
      <tr>
        <td>${i}</td>
        <td>${xi.toFixed(4)}</td>
        <td>${fxi.toFixed(4)}</td>
        <td>${luasKotak.toFixed(4)}</td>
      </tr>
    `;
    barData.push({ x: xi, y: fxi });
  }

  document.getElementById("tableBody").innerHTML = tableRows;

  let analitis = 0;
  let m = 10000;
  let h = (b - a) / m;
  let sumSimp = f(a) + f(b);
  for (let j = 1; j < m; j++) {
    let xj = a + j * h;
    sumSimp += j % 2 === 0 ? 2 * f(xj) : 4 * f(xj);
  }
  analitis = (h / 3) * sumSimp;

  let error = Math.abs(totalLuas - analitis);

  document.getElementById("resDelta").innerHTML =
    `<span class="val">${deltaX.toFixed(4)}</span>`;
  document.getElementById("resNumerik").innerHTML =
    `<span class="val">${totalLuas.toFixed(4)}</span>`;
  document.getElementById("resAnalitis").innerHTML =
    `<span class="val">${analitis.toFixed(4)}</span>`;
  document.getElementById("resError").innerHTML =
    `<span class="val">${error.toFixed(4)}</span>`;

  renderChart(lineDataX, lineDataY, barData, deltaX);
}

function renderChart(lineX, lineY, barData, deltaX) {
  const ctx = document.getElementById("riemannChart").getContext("2d");

  if (chartInstance) {
    chartInstance.destroy();
  }

  const barDatasets = barData.map((data, index) => {
    return {
      label: `Partisi ke-${index + 1}`,
      data: [
        { x: data.x - deltaX, y: data.y },
        { x: data.x, y: data.y },
      ],
      type: "line",
      fill: true,
      backgroundColor: "rgba(31, 78, 140, 0.25)",
      borderColor: "#1f4e8c",
      borderWidth: 1.5,
      stepped: "before",
      pointRadius: 0,
      hitRadius: 10,
      hoverRadius: 5,
    };
  });

  const curveDataset = {
    label: "Kurva Asli f(x)",
    data: lineX.map((x, idx) => ({ x: x, y: lineY[idx] })),
    type: "line",
    borderColor: "#ae382b",
    borderWidth: 3,
    fill: false,
    pointRadius: 0,
    hitRadius: 10,
    hoverRadius: 4,
  };

  chartInstance = new Chart(ctx, {
    data: {
      datasets: [curveDataset, ...barDatasets],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: "rgba(30, 37, 48, 0.9)",
          titleFont: { size: 13, family: "Inter" },
          bodyFont: { size: 14, family: "IBM Plex Mono" },
          padding: 12,
          callbacks: {
            title: function (context) {
              return context[0].dataset.label;
            },
            label: function (context) {
              let xVal = context.parsed.x.toFixed(4);
              let yVal = context.parsed.y.toFixed(4);
              return `Titik (x, y) = (${xVal}, ${yVal})`;
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Sumbu X (Batas Partisi)",
            font: { weight: "bold", size: 13, family: "Inter" },
          },
          grid: { borderColor: "#c7d3dc", borderWidth: 2 },
        },
        y: {
          title: {
            display: true,
            text: "Sumbu Y (Tinggi Fungsi)",
            font: { weight: "bold", size: 13, family: "Inter" },
          },
          grid: { borderColor: "#c7d3dc", borderWidth: 2 },
        },
      },
    },
  });
}

// Jalankan otomatis saat halaman pertama kali dimuat
window.onload = hitungRiemann;
