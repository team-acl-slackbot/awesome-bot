const pool = require('../utils/pool');

module.exports = class Meeting {
    id;
    meetingUsers;
    meetingRequester;
    topic;
    dateCreated;
    meetingDate;
    dmChannel;

    constructor(row) {
        this.id = row.id;
        this.meetingUsers = row.meeting_users;
        this.meetingRequester = row.meeting_requester;
        this.topic = row.topic;
        this.dateCreated = row.date_created;
        this.meetingDate = row.meeting_date;
        this.dmChannel = row.dm_channel;
    }

    static async createMeeting (requester, users, topic, meetingDate, channel) {
        console.log(requester, users, topic, meetingDate, channel)
        const {
            rows,
        } = await pool.query(
            'INSERT INTO meetings (meeting_requester, meeting_users, topic, meeting_date, dm_channel) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [requester, users, topic, meetingDate, channel]

        );

        return new Meeting(rows[0]);
    }
    
}

    