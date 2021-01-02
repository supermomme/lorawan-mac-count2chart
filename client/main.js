const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const date = urlParams.get('date')


const momentX = date == null ? moment() : moment(date, "DD.MM.YYYY")

const momentsThisDay = []
const startOfDay = momentX.clone().startOf('day')
const endOfDay = momentX.clone().endOf('day')
var duration = moment.duration(endOfDay.diff(startOfDay));
console.log(Math.floor(duration.asMinutes()))
for (let i = 0; i <= Math.floor(duration.asMinutes()); i++) {
  momentsThisDay.push(startOfDay.clone().add(i, 'minutes'))
}

var ctx = document.getElementById('chart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: momentsThisDay.map(v => v.format('DD.MM.YYYY HH:mm'))
  },
  options: {
    maintainAspectRatio: false,
    animation: {
      duration: 0 // general animation time
    },
    hover: {
      animationDuration: 0 // duration of animations when hovering an item
    },
    responsiveAnimationDuration: 0, // animation duration after a resize
    spanGaps: true,
    bezierCurve : false,
    showLines: false,
    scales: {
      yAxes: [{
        ticks: {
          suggestedMin: 0,
          suggestedMax: 100
        }
      }]
    }
  }
});

function addData(chart, label, data) {
  chart.data.labels.push(label);
  chart.data.datasets.forEach((dataset) => {
      dataset.data.push(data);
  });
  chart.update();
}

function removeData(chart) {
  chart.data.labels.pop();
  chart.data.datasets.forEach((dataset) => {
      dataset.data.pop();
  });
  chart.update();
}


firebase.initializeApp({
  databaseURL: "https://maccount-e3d11-default-rtdb.europe-west1.firebasedatabase.app",
});

const startDate = moment().startOf('day')
const endDate = moment().endOf('day')

const database = firebase.database();

const boards = {
  breadboard1: database.ref('/new/breadboard1'),
  momme1: database.ref('/new/momme1'),
  noboard1: database.ref('/new/noboard1'),
  noboard2: database.ref('/new/noboard2'),
  noboard3: database.ref('/new/noboard3'),
  noboard4: database.ref('/new/noboard4'),
  noboard5: database.ref('/new/noboard5'),
}

for (const boardName in boards) {
  boards[boardName].child(startOfDay.format('YYYY-MM-DD')).on('value', (snapshot) => {
    const data = snapshot.val()
    if (data == undefined) return
    let minuteBuckets = Object.keys(data).reduce((prev, cur) => {
      let min = cur.substring(0, 5)
      if (prev[min] == undefined) {
        prev[min] = {
          val: data[cur],
          count: 1
        }
      } else {
        prev[min].val += data[cur]
        prev[min].count++
      }
      return prev
    }, {})
    minuteBuckets = Object.keys(minuteBuckets).reduce((prev, cur) => {
      prev[cur] = minuteBuckets[cur].val / minuteBuckets[cur].count
      return prev
    }, {})
    const chartData = momentsThisDay.map(m => minuteBuckets[m.format('HH-mm')])
    const datasetIndex = myChart.data.datasets.findIndex(v => v.label == boardName)
    if (datasetIndex === -1) {
      myChart.data.datasets.push({
        label: boardName,
        data: chartData,
        backgroundColor: boardName.toColor(),
        borderColor: boardName.toColor(),
        fill: false,
        lineTension: 0,
        showLine: false,
      })
    } else {
      myChart.data.datasets[datasetIndex].data = chartData
    }
    myChart.update();
  })
}


String.prototype.toColor = function() {
  if (this.toString() === 'breadboard1') return 'red'
  if (this.toString() === 'momme1') return 'green'
  if (this.toString() === 'noboard1') return 'orange'
  if (this.toString() === 'noboard2') return 'magenta'
  if (this.toString() === 'noboard3') return 'purple'
  if (this.toString() === 'noboard4') return 'violet'
  if (this.toString() === 'noboard5') return 'blue'
	var colors = [
    "#0CF0A0",
    "#CFFA0C",
    "#E38E17",
    "#FA0C5A",
    "#1E05F0",
    "#12F20C",
    "#FCCE0D",
    "#E63100",
    "#AF12FF",
    "#139AF2"
  ]
  
  var hash = 0;
	if (this.length === 0) return hash;
  for (var i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  hash = ((hash % colors.length) + colors.length) % colors.length;
  return colors[hash];
}