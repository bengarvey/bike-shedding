import React from 'react';
import { Chance } from "chance";
import { ResponsiveOrdinalFrame } from 'semiotic';
var rideData = require('../data/indego.json');
var chance = new Chance();

var bikeData = {};

var minDate = new Date("2018-01-01");
var maxDate = ("2017-01-01");
var maxTime = 0;
rideData.forEach( function(ride) {
  if (typeof(bikeData[ride.bike_id]) == 'undefined') {
    bikeData[ride.bike_id] = {
      id: ride.bike_id,
      rides: [],
      start_time: "2017-10-02 22:48:00"
    }
  }
  ride.start_time = new Date(ride.start_time);
  ride.end_time = new Date(ride.end_time);
  ride.duration = ride.end_time.getTime() - ride.start_time.getTime();
  bikeData[ride.bike_id].rides.push(ride);

  minDate = minDate < ride.start_time ? minDate : ride.start_time;
  maxDate = maxDate > ride.end_time ? maxDate : ride.end_time;

});

maxTime = maxDate.getTime() - minDate.getTime();

var data = [];

Object.keys(bikeData).forEach( function(key) {
  bikeData[key].rideTime = calculateRideTime(bikeData[key]);
  bikeData[key].utilization = (bikeData[key].rideTime / maxTime) * 100;
  data.push(bikeData[key]);
});

data.sort(sortBikes);

function calculateRideTime(bike) {
  var seconds = 0;
  bike.rides.forEach( function(ride) {
    seconds += ride.end_time.getTime() - ride.start_time.getTime();
  });
  return seconds;
}

function sortBikes(a, b) {
  return b.utilization - a.utilization;
}

function sortDates(a, b) {
  return a.start.getTime() - b.start.getTime();
}

function getRides(total) {
  var rides = [];
  for(var i=0; i<total; i++) {
    var start = chance.date({year: 1980});
    var ride = {
      start: start,
      end: new Date(start.getTime() + getRandomTime())
    }
    rides.push(ride);
  }
  return rides;
}

function getRandomTime() {
  return chance.integer({min:1, max:getMaxTime()});
}

function getMaxTime() {
  return 1000 * 60 * 60;
}

function getRect(ride, column, rScale, key, id) {
  return (
  <rect
    key={`${key}-${id}`}
    fill="#0081D0"
    width={rScale(ride.end_time) - rScale(ride.start_time)}
    height={column.width}
    x={rScale(ride.start_time)}
    y={column.x}
  />
  )
}

function formatDate(date) {
  return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`;
}

function getRects(rides, column, rScale, key) {
  var result = [];
  var count = 0;
  rides.forEach( function(ride) {
    result.push(getRect(ride, column, rScale, key, count));
    count += 1;
  });
  return <g key={`piece-${key}`}>{result}</g>;
}

function timeline({ data, rScale, adjustedSize, margin }) {
  const renderedPieces = [];
  const keys = Object.keys(data);
  keys.forEach(key => {
    //Only one piece of data per column though we'll render multiple graphical elements
    const column = data[key];
    const president = column.pieceData[0].data;
    //Calculate individual start and width of each graphical band
    var markObject = getRects(president.rides, column, rScale, key);
    renderedPieces.push(markObject);
  });
  return renderedPieces;
}


const Bike = () => (
  <div className="chartContainer">
    <h1><img src="logo.png" width="25%"/></h1>
    <h3>Which bikes were used the most from {formatDate(minDate)} to {formatDate(maxDate)}?</h3>
    <ResponsiveOrdinalFrame
        projection="horizontal"
        data={data}
        rExtent={[minDate, maxDate]}
        size={[600, 15000]}
        rAccessor="start_time"
        oAccessor="id"
        oLabel={(d, i, ob) => (
          <text style={{ fill: '#999999', fontSize: "8px", textAnchor: "end", opacity: i % 2 ? 0.5 : 1 }} y={4}>
            {d} {bikeData[d].utilization.toFixed(2)}%
          </text>
        )}
        oPadding={7}
        type={{
          type: timeline
        }}
        hoverAnnotation={true}
        tooltipContent={d => (
          <div className="tooltip-content">
            <p>Bike Id: {d.pieces[0].id}</p>
            <p>
              Utilization: {(d.pieces[0].rideTime / maxTime).toFixed(2)}%
            </p>
          </div>
        )}
        lineStyle={d => ({ fill: d.label, stroke: d.label, fillOpacity: 0.75 })}
        margin={{ left: 60, top: 10, bottom: 50, right: 20 }}
      />
  </div>
)

export default Bike
