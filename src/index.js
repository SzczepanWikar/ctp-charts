import { ChartWrapper } from './chart-wrapper';

init();
function init() {
  openFile();
}

function openFile() {
  fetch('data.lvm')
    .then(async (res) => res.text())
    .then((res) => {
      const formattedData = formatData(res);
      showCharts(formattedData);
    });
}

function formatData(res) {
  const data = res
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) =>
      line.split('\t').reduce((acc, val) => {
        const parsedVal = parseFloat(val.replace(',', '.'));
        if (!isNaN(parsedVal)) acc.push(parsedVal);
        return acc;
      }, []),
    );
  return data;
}

async function showCharts(data) {
  const voltageChart = new ChartWrapper({
    elementId: 'voltage-chart',
    xAxisData: data.map((e) => e[0]),
    yAxisData: data.map((e) => e[2]),
    xAxisTitle: 'Czas [s]',
    yAxisTitle: 'Napiecie [V]',
    maxNumberOfElementsOnChart: 500,
    borderColor: 'rgb(75, 192, 192)',
  });

  const shiftChart = new ChartWrapper({
    elementId: 'distance-chart',
    xAxisData: data.map((e) => e[0]),
    yAxisData: data.map((e) => e[1]),
    xAxisTitle: 'Czas [s]',
    yAxisTitle: 'Odległość [mm]',
    maxNumberOfElementsOnChart: 500,
    borderColor: 'rgb(90, 100, 90)',
  });
}
