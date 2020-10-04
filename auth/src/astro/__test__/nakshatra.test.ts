import {
  getNakshatras,
  getNNakshatra,
  getNNNakshatra,
  getDNakshatra,
} from '../nakshatra';

it('all test', async () => {
  expect(getNakshatras().length).toEqual(28);
});

it('0 test', async () => {
  expect(getNNakshatra(0).id).toEqual(1);
});

it('28+1 test', async () => {
  expect(getNNNakshatra(27, 1).id).toEqual(1);
});

it('28+1 test', async () => {
  expect(getNNNakshatra(28, 1).id).toEqual(2);
});

it('240+1 test', async () => {
  expect(getDNakshatra(240, 1).id).toEqual(19);
});

it('252 test', async () => {
  expect(getDNakshatra(252, 0).id).toEqual(19);
});
