const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const { convertDueDate } = require('../lib/utils/canvas-utils');
const { participantsChecker } = require('../lib/utils/zoom-utils');

describe('awesome-bot routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('should convert the date to correct format',()=>{
    expect(convertDueDate("2021-04-29T16:00:00Z")).toEqual("4/29/2021, 4:00:00 PM")
  })
  it('return the list of participants', ()=>{
    const dummyData = [
      'Jane',
      'Doe',
      'John'
    ]
    expect(participantsChecker(dummyData)).toEqual(`\n - Jane, \n - Doe, \n - John`)
  })
  it('returns none because no participants', ()=>{
    const dummyData = []
    expect(participantsChecker(dummyData)).toEqual(`None`)
  })
});
