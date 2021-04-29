const pool = require('../utils/pool');

module.exports = class Meeting {
    id;
    meetingUsers;
    meetingRequester;
    topic;
    dateCreated;
    meetingDate;
    dmPermalink;

    constructor(row) {
        this.id = row.id;
        this.meetingUsers = row.meeting_users;
        this.meetingRequester = row.meeting_requester;
        this.topic = row.topic;
        this.dateCreated = row.date_created;
        this.meetingDate = row.meeting_date;
        this.dmPermalink = row.dm_permalink;
    }

    static async createMeeting (requester, users, topic, meetingDate, link) {
        const {
            rows,
        } = await pool.query(
            'INSERT INTO meetings (meeting_requester, meeting_users, topic, meeting_date, dm_permalink) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [requester, users, topic, meetingDate, link]

        );

        return new Meeting(rows[0]);
    }


    static async getMeetingsByUser (user) {
        const {
            rows,
        } = await pool.query(
            `SELECT * FROM meetings WHERE meeting_requester=$1 ORDER BY meeting_date ASC`,
            [user]

        );

        if (rows.length === 0){ return null}

        return rows.map(meeting => new Meeting(meeting));
    }
    
}

    