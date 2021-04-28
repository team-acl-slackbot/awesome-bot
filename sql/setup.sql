DROP TABLE IF EXISTS meetings;

CREATE TABLE meetings (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    meeting_users TEXT[] NOT NULL,
    meeting_requester TEXT NOT NULL,
    topic TEXT NOT NULL,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meeting_date TIMESTAMP NOT NULL,
    dm_channel TEXT NOT NULL
);