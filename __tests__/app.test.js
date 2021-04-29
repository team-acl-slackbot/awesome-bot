const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const { convertDueDate } = require('../lib/utils/canvas-utils');
const { participantsChecker, aggregateBlock } = require('../lib/utils/zoom-utils');
const { blockDataForTest } = require('../lib/zoom/blockDataForTest');


describe('awesome-bot routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('should convert the date to correct format', () => {
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
  it('returns a block', ()=>{
    const blockData = [
      {
        _id: '5f58f91f7ad1c0ea0b995937',
        zoomId: '498946105',
        joinUrl: 'https://zoom.us/j/498946105?pwd=TnFCSmpRTDBua1ZlZGRObVc1U0VXdz09',
        name: 'Community & Current Events',
      },
      {
        _id: '5fb743a030e95f0de1d63b79',
        zoomId: '2090393356',
        joinUrl: 'https://zoom.us/j/2090393356?pwd=YmdBTUFCVlUwOHYvWkZSeXlZSHNLQT09',
        name: "Mercury Room's Personal Meeting Room",
      }
    ]
    expect(aggregateBlock(blockData)).toEqual(blockDataForTest)
  })
});
