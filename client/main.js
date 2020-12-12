var ctx = document.getElementById('chart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'line',
  data: {},
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

var database = firebase.database().ref('/');
database.once('value', (snapshot) =>{
  const data = snapshot.val();
  const allDates = Object.keys(data).reduce((prev, boardName) => {
    return [
      ...prev,
      ...Object.keys(data[boardName]).reduce((prev, dateString) => {
        return [
          ...prev,
          { original: dateString, moment: moment(dateString, "MM-DD-YYYY-HH-mm-ss") }
        ]
      }, [])
    ]
  }, []).filter(v => v.moment.isAfter(startDate) && v.moment.isBefore(endDate)).sort((a, b) => a.moment.isAfter(b.moment) ? 1 : -1)

  myChart.data.labels = allDates.map(v => v.moment.format('DD.MM.YYYY HH:mm:ss'))
  myChart.data.datasets = []

  for (const boardName in data) {
    if (data.hasOwnProperty(boardName)) {
      const boardData = allDates.reduce((prev, cur) => [...prev, null], [])
      for (const dateString in data[boardName]) {
        let allDateIndex = allDates.findIndex(v => v.original === dateString)
        if (allDateIndex != -1) {
          boardData[allDateIndex] = data[boardName][dateString]
        }
      }
      
      myChart.data.datasets.push({
        label: boardName,
        data: boardData,
        backgroundColor: boardName.toColor(),
        borderColor: boardName.toColor(),
        fill: false,
        lineTension: 0,
        showLine: false,
      })
    }
  }
  
  myChart.update();
});



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