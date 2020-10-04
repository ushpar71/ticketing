const rasi = require('./json/rasi.json');

const division = 12;
const duration = 360 / division;

//-----
export const getRasis = () => {
  return rasi;
};

//-----
export const getNRasi = (id: number) => {
  id === 0 ? (id = 1) : id;
  return getNNRasi(id);
};

//-----
export const getNNRasi = (startId: number = 0, endId: number = 0) => {
  var num = startId + endId;

  while (num > division) {
    num -= division;
  }

  while (num < 1) {
    num += division;
  }

  return rasi[num];
};

//-----
export const getDRasi = (startDeg: number = 0, rasis: number = 0) => {
  var num = Math.round(startDeg / duration) + rasis;

  while (num > division) {
    num -= division;
  }

  while (num < 1) {
    num += division;
  }

  return rasi[num];
};
