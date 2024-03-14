import Chart from 'chart.js/auto';

export class ChartWrapper {
  #maxNumberOfElementsOnChart;
  #xAxisData;
  #yAxisData;
  #xAxisTitle;
  #yAxisTitle;
  #borderColor;
  #end;

  #element;
  #chart;

  /**
   * @param {ChartWrapperConfig} config
   */
  constructor(config) {
    const {
      elementId,
      xAxisData,
      yAxisData,
      maxNumberOfElementsOnChart,
      xAxisTitle,
      yAxisTitle,
      borderColor,
    } = config;

    if (xAxisData.length !== yAxisData.length) {
      throw new Error('xAxisData.length must be equal to yAxisData.length.');
    }

    this.#element = document.getElementById(elementId);
    this.#xAxisData = xAxisData;
    this.#yAxisData = yAxisData;
    this.#maxNumberOfElementsOnChart = maxNumberOfElementsOnChart;
    this.#end = maxNumberOfElementsOnChart;
    this.#xAxisTitle = xAxisTitle;
    this.#yAxisTitle = yAxisTitle;
    this.#borderColor = borderColor;

    this.#generate();
  }

  async #generate() {
    const chartData = {
      labels: this.#xAxisData.slice(0, this.#maxNumberOfElementsOnChart),
      datasets: [
        {
          label: this.#yAxisTitle,
          data: this.#yAxisData.slice(0, this.#maxNumberOfElementsOnChart),
          fill: false,
          borderColor: this.#borderColor,
          tension: 0.1,
        },
      ],
    };

    const config = {
      type: 'line',
      data: chartData,
      options: {
        animation: false,
      },
    };

    this.#chart = new Chart(this.#element, config);
    setInterval(() => {
      this.#setEndAfterChartFilled();
      this.#updateChart();
    }, 2);
  }

  #updateChart() {
    const { labels, datasets } = this.#chart.data;
    labels.shift();
    labels.push(this.#xAxisData[this.#end]);

    for (const dataset of datasets) {
      dataset.data.shift();
      dataset.data.push(this.#yAxisData[this.#end]);
    }

    this.#chart.update();
  }

  #setEndAfterChartFilled() {
    if (this.#end < this.#xAxisData.length - 1) {
      this.#end++;
    } else {
      this.#end = 0;
    }
  }
}

/**
 * Configuration for chart
 */
export class ChartWrapperConfig {
  /**
   * id of HTML Element
   * @type {string}
   */
  elementId;
  /**
   * @type {number[]}
   */
  xAxisData;
  /**
   * @type {number[]}
   */
  yAxisData;
  /**
   * @type {number[]}
   */
  xAxisTitle;
  /**
   * @type {number[]}
   */
  yAxisTitle;
  /**
   * @type {number}
   */
  maxNumberOfElementsOnChart;
  /**
   * CSS compatible color text
   * @type {string}
   */
  borderColor;
}
