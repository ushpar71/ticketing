const nakshatra = require('./json/nakshatra.json');

const division = 27;
const duration = 360 / division;

//-----
export const getNakshatras = () => {
  return nakshatra;
};

//-----
export const getNNakshatra = (id: number) => {
  id === 0 ? (id = 1) : id;
  return getNNNakshatra(id);
};

//-----
export const getNNNakshatra = (startId: number = 0, endId: number = 0) => {
  var num = startId + endId;

  while (num > division) {
    num -= division;
  }

  while (num < 1) {
    num += division;
  }

  return nakshatra[num];
};

//-----
export const getDNakshatra = (startDeg: number = 0, nakshatras: number = 0) => {
  var num = Math.round(startDeg / duration) + nakshatras;

  while (num > division) {
    num -= division;
  }

  while (num < 1) {
    num += division;
  }

  return nakshatra[num];
};
