init();
function init() {
  showCharts();
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
  const formattedData = [];
  for (const line of res.split('\r\n')) {
    formattedData.push(
      line.split('\t').map((e) => parseFloat(e.replace(',', '.'))),
    );
  }
  return formattedData;
}

function showCharts(data) {
  console.log('Charts are ready to display.');
}
