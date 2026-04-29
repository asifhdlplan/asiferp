const ids = [
  "orderQty",
  "fabricWidth",
  "gsm",
  "warpCount",
  "weftCount",
  "loomSpeed",
  "ppi",
  "loomCount",
  "efficiency",
  "waste",
  "hoursPerDay",
];

const formatNum = (value, digits = 2) =>
  Number(value).toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });

function getInputs() {
  return ids.reduce((acc, id) => {
    acc[id] = Number(document.getElementById(id).value);
    return acc;
  }, {});
}

function calculatePlan(input) {
  const widthMeters = input.fabricWidth * 0.0254;
  const areaM2 = input.orderQty * widthMeters;
  const baseFabricKg = (areaM2 * input.gsm) / 1000;
  const totalFabricKg = baseFabricKg * (1 + input.waste / 100);

  const warpFactor = input.weftCount / (input.warpCount + input.weftCount);
  const weftFactor = input.warpCount / (input.warpCount + input.weftCount);

  const warpYarnKg = totalFabricKg * warpFactor;
  const weftYarnKg = totalFabricKg * weftFactor;

  const metersPerMinutePerLoom = input.loomSpeed / (input.ppi * 39.37);
  const dailyOutputMeters =
    metersPerMinutePerLoom *
    60 *
    input.hoursPerDay *
    input.loomCount *
    (input.efficiency / 100);

  const targetMeters = input.orderQty * (1 + input.waste / 100);
  const productionDays = targetMeters / dailyOutputMeters;

  return {
    "Fabric Area": `${formatNum(areaM2)} m²`,
    "Fabric Weight (Base)": `${formatNum(baseFabricKg)} kg`,
    "Fabric Weight (with Waste)": `${formatNum(totalFabricKg)} kg`,
    "Warp Yarn Requirement": `${formatNum(warpYarnKg)} kg`,
    "Weft Yarn Requirement": `${formatNum(weftYarnKg)} kg`,
    "Loom Output / Day": `${formatNum(dailyOutputMeters)} m`,
    "Estimated Production Time": `${formatNum(productionDays)} days`,
  };
}

function renderResults(result) {
  const container = document.getElementById("results");
  container.innerHTML = Object.entries(result)
    .map(
      ([key, value]) => `
      <article class="metric">
        <h4>${key}</h4>
        <p>${value}</p>
      </article>
    `
    )
    .join("");
}

document.getElementById("calculateBtn").addEventListener("click", () => {
  const inputs = getInputs();
  renderResults(calculatePlan(inputs));
});

renderResults(calculatePlan(getInputs()));
