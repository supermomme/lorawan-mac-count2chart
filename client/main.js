var ctx = document.getElementById('chart').getContext('2d');
var myChart = new Chart(ctx, {
  type: 'line',
  data: {},
  options: {
    maintainAspectRatio: false,
    animation: {
      duration: 0 // general animation time
    },
    spanGaps: true,
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

console.log(myChart.data.labels);

firebase.initializeApp({
  databaseURL: "https://maccount-e3d11-default-rtdb.europe-west1.firebasedatabase.app",
});



const startDate = moment().startOf('day')
const endDate = moment().endOf('day')

var database = firebase.database().ref('/');
database.on('value', (snapshot) =>{
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
      })
    }
  }
  myChart.update();
});



String.prototype.toColor = function() {
	var colors = ["#e51c23", "#e91e63", "#9c27b0", "#673ab7", "#3f51b5", "#5677fc", "#03a9f4", "#00bcd4", "#009688", "#259b24", "#8bc34a", "#afb42b", "#ff9800", "#ff5722", "#795548", "#607d8b"]
	
    var hash = 0;
	if (this.length === 0) return hash;
    for (var i = 0; i < this.length; i++) {
        hash = this.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash;
    }
    hash = ((hash % colors.length) + colors.length) % colors.length;
    return colors[hash];
}