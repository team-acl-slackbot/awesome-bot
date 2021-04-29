const pool = require('../lib/utils/pool');
const setup = require('../data/setup');
const request = require('supertest');
const app = require('../lib/app');
const { convertDueDate } = require('../lib/utils/canvas-utils');

describe('awesome-bot routes', () => {
  beforeEach(() => {
    return setup(pool);
  });
  it('should convert the date to correct format', () => {
    expect(convertDueDate("2021-04-29T16:00:00Z")).toEqual("4/29/2021, 4:00:00 PM")
  })
});
