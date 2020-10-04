import { getRasis, getNRasi, getNNRasi, getDRasi } from '../rasi';

it('all test', async () => {
  expect(getRasis().length).toEqual(13);
});

it('0 test', async () => {
  expect(getNRasi(0).id).toEqual(1);
});

it('12+1 test', async () => {
  expect(getNNRasi(12, 1).id).toEqual(1);
});

it('13+1 test', async () => {
  expect(getNNRasi(13, 1).id).toEqual(2);
});

it('345.9+1 test', async () => {
  expect(getDRasi(13, 1).id).toEqual(1);
});
