import { ChartWrapper } from "./chart-wrapper";

/**
 * @type {Map<string, Map<string, number[]>>}
 */
const dataSources = new Map();

/**
 * @type {ChartWrapper[]}
 */
let charts = [];

/**
 * @type {Map<number, string>}
 */
let columnNames = new Map();

let dataSeriesToAdd = [];

init();

function init() {
	document
		.getElementById("data-source-form__submit")
		.addEventListener("click", onDataSourceSubmitted);

	document
		.getElementById("data-source-form__cancel")
		.addEventListener("click", onCancel);

	document
		.getElementById("data-source-form__file")
		.addEventListener("input", onDataSourceAdded);

	document
		.getElementById("chart-config-form__data-source-select")
		.addEventListener("input", onDataSourceChanged);

	document
		.getElementById("chart-config-form__submit")
		.addEventListener("click", createChart);

	document
		.getElementById("data-source-dialog-button")
		.addEventListener("click", openDataSourceDialog);
}

async function onDataSourceAdded() {
	const nameInput = document.getElementById("data-source-form__name");
	const fileInput = document.getElementById("data-source-form__file");

	const name = nameInput.value;
	const file = fileInput.files[0];

	if (!validateNewDataSource(name, file)) {
		clearNewDataSourceForm(nameInput, fileInput);
		return;
	}

	try {
		dataSeriesToAdd = await openFile(file);
	} catch {
		window.alert("Plik jest niepoprawny.");
		clearNewDataSourceForm(nameInput, fileInput);
		return;
	}

	const columnsContainer = document.getElementById(
		"data-source-form__colums-container"
	);

	columnNames = new Map(
		dataSeriesToAdd.map((e, index) => [index, `Kolumna ${index}`])
	);

	for (const index in dataSeriesToAdd) {
		const node = document.createElement("div");
		node.innerHTML = `<input value="${columnNames.get(+index)}"></input>`;

		node.addEventListener("input", event =>
			columnNames.set(+id, event.target.value)
		);

		columnsContainer.appendChild(node);
	}
}

function onDataSourceSubmitted() {
	const nameInput = document.getElementById("data-source-form__name");
	const fileInput = document.getElementById("data-source-form__file");

	const name = nameInput.value;

	dataSources.set(
		name,
		new Map(
			dataSeriesToAdd.map((element, index) => [columnNames.get(index), element])
		)
	);

	generateSelect(
		"chart-config-form__data-source-select",
		Array.from(dataSources.keys())
	);

	if (dataSources.size === 1) {
		onDataSourceChanged({
			target: {
				value: name,
			},
		});
	}

	clearNewDataSourceForm(nameInput, fileInput);
	document.getElementById("data-source-dialog").close();
}

function onDataSourceChanged(event) {
	const data = dataSources.get(event.target.value);
	const keys = Array.from(data.keys());
	generateSelect("chart-config-form__x-axis-select", keys);
	generateSelect("chart-config-form__y-axis-select", keys, keys[1]);
}

function clearNewDataSourceForm(nameInput, fileInput) {
	nameInput.value = "";
	fileInput.value = "";
	columnNames = new Map();
	dataSeriesToAdd = [];
	document.getElementById("data-source-form__colums-container").innerHTML = "";
}

function onCancel() {
	const nameInput = document.getElementById("data-source-form__name");
	const fileInput = document.getElementById("data-source-form__file");

	clearNewDataSourceForm(nameInput, fileInput);

	document.getElementById("data-source-dialog").close();
}

function validateNewDataSource(name, file) {
	let message = "";
	if (!name?.length) {
		message = "Nie podano nazwy serii danych.";
	}

	if (dataSources.has(name)) {
		message = "Źródło danych o tej nazwie musi być unikalne";
	}

	if (!file) {
		message = "Nie dodano pliku.";
	}

	if (message.length) {
		window.alert(message);
		return false;
	}

	return true;
}

/**
 *
 * @param {File} file
 * @returns {number}
 */
async function openFile(file) {
	const fileContent = await readUploadedFileAsText(file);
	const formattedData = formatData(fileContent);
	return formattedData;
}

function formatData(res) {
	const preData = res
		.split(/\r?\n/)
		.filter(Boolean)
		.map(line => line.split("\t"));

	if (!preData[0]?.length) {
		throw new Error("NO_CONTENT");
	}

	if (preData[0].length < 2) {
		throw new Error("TOO_LITLE_COLUMS");
	}

	const data = Array.from({ length: preData[0].length }, () => []);

	for (const element of preData) {
		const parsedElement = element.map(e => parseFloat(e.replace(",", ".")));

		if (!validateDataRow(parsedElement, data.length)) {
			continue;
		}

		for (const index in parsedElement) {
			data[index].push(parsedElement[index]);
		}
	}

	return data;
}

/**
 *
 * @param {File} file
 */
function readUploadedFileAsText(inputFile) {
	const temporaryFileReader = new FileReader();

	return new Promise((resolve, reject) => {
		temporaryFileReader.onerror = () => {
			temporaryFileReader.abort();
			reject(new DOMException("Problem parsing input file."));
		};

		temporaryFileReader.onload = () => {
			resolve(temporaryFileReader.result);
		};
		temporaryFileReader.readAsText(inputFile);
	});
}

/**
 *
 * @param {number[]} row
 * @param {number} exceptedLength
 * @returns {boolean}
 */
function validateDataRow(row, exceptedLength) {
	if (row.every(e => e.length === 0)) {
		return false;
	}

	if (row.length !== exceptedLength || row.some(e => isNaN(e))) {
		throw new Error("INCORRECT_DATA");
	}

	return true;
}

function generateSelect(elementId, values, selectedOption = null) {
	const children = values.map(e => `<option>${e}</option>`);
	const select = document.getElementById(elementId);
	select.innerHTML = children.join();

	if (selectedOption) {
		select.value = selectedOption;
	}
}

function createChart() {
	/**
	 * @type {ChartWrapperConfig}
	 */

	const dataSourceKey = document.getElementById(
		"chart-config-form__data-source-select"
	).value;

	const xAxisInputValue = document.getElementById(
		"chart-config-form__x-axis-select"
	).value;

	const yAxisInputValue = document.getElementById(
		"chart-config-form__y-axis-select"
	).value;

	const color = document.getElementById("chart-config-form__color").value;

	const dataSource = dataSources.get(dataSourceKey);

	const elementId = "chart-" + charts.length;

	newChartDiv(elementId);

	const config = {
		elementId,
		xAxisData: dataSource.get(xAxisInputValue),
		yAxisData: dataSource.get(yAxisInputValue),
		xAxisTitle: xAxisInputValue,
		yAxisTitle: yAxisInputValue,
		maxNumberOfElementsOnChart: 500,
		borderColor: color,
	};

	charts.push(new ChartWrapper(config));
}

function newChartDiv(elementId) {
	const chartContainer = document.createElement("div");
	chartContainer.classList.add("chart");

	const closeButton = document.createElement("button");
	closeButton.innerHTML = "X";
	closeButton.classList.add("chart-button");
	closeButton.addEventListener("click", () => deleteChart(elementId));

	const chart = document.createElement("canvas");
	chart.id = elementId;

	chartContainer.appendChild(closeButton);
	chartContainer.appendChild(chart);

	document.getElementById("charts_container").appendChild(chartContainer);
}

function openDataSourceDialog() {
	document.getElementById("data-source-dialog").showModal();
}

function deleteChart(elementId) {
	const chart = charts.find(e => e.getElement().id === elementId);

	if (!chart) {
		return;
	}

	const element = chart.getElement();

	if (!element) {
		return;
	}

	element.parentElement.remove();

	charts = charts.filter(e => e.getElement().id !== elementId);
}
