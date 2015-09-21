



var Chart = function(game){

    this.game = game;
    this.data = game.actors;

    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;


    var canvasChart = document.createElement('canvas');
    document.body.appendChild(canvasChart); // adds the canvas to the body element
    canvasChart.style.background = "white";
    canvasChart.width = WIDTH;
    canvasChart.height = HEIGHT;
    this.contextChart = canvasChart.getContext("2d");

    this.lastChartPos = [
        {x:0 , y:0},
        {x:0 , y:0},
        {x:0 , y:0}
    ];


    this.start = new Date().getTime();

    var __self = this;
    setInterval(function(){
        __self.drawChart();
    },1000);
};
Chart.prototype = {

    chartColor : [
        "black",
        "blue",
        "red"
    ],
    chartScale: [
        1,
        1,
        5
    ],


    drawChart: function (){
        var stats = [0,0,0];
        for(var i = this.data.length;i--;){
            stats[this.data[i].actorType]++;
        }

        var time = parseInt((new Date().getTime() - this.start)/1000);


        for(var i = 0 ;i <=2;i++){
            this.contextChart.strokeStyle = this.chartColor[i]
            this.contextChart.beginPath();
            this.contextChart.moveTo(this.lastChartPos[i].x, this.lastChartPos[i].y);
            this.contextChart.lineTo(time, stats[i] * this.chartScale[i]);
            this.contextChart.stroke();
            this.lastChartPos[i] = {x: time, y: stats[i] * this.chartScale[i]};
        }


    }

}
