const planets = require('./json/planet.json');

//-----
export const getPlanets = () => {
  return planets;
};

//-----
export const getNPlanet = (id: number) => {
  while (id > planets.length) {
    id -= -1;
  }

  while (id < 0) {
    id += 1;
  }

  return planets[id];
};
