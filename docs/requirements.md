# Software Requirements

## Vision

Awesome-bot is a Slack Application designed to increase the productivity of both students and staff of the Alchemy Code Lab by bringing commonly used tooling into the Slack environment.  This minimizes the need to open new tabs, search for data, and time spent looking elsewhere.  This app looks to minimize data sharding and the frustrations of having to search multiple locations for the requested information.

## Scope (In/Out)

### What will Awesome-Bot do?

  - Awesome-bot will be a series of `/` (slash) commands that will control the interactivity of the Bot with the workspace.
  - Create meeting events with specific users and create reminders.
  - Remind/list upcoming Canvas LMS assignments due.
  - Allow users to search and find Alchemy Zoom channels.
  - Allow users to search for `npm` packages from `npmjs.com`.

### What won't Awesome-Bot do?

  - This application will not be for public distribution, and is tailored to the Alchemy specific tooling.
  - Will not be a full replacement for external tooling/resources, but will give high-level overview.
  
### MVP
  
  - Awesome-Bot will at minimum will be able to respond to basic `/slash` commands, and return the correct data from external tooling resources.

### Stretch

  - Prompts will use highly interactive Slack `modals` in order to increate polish and ease of use.
  - Users will be able to cancel, update, and change events on the fly.

## Functional Requirements

  - A user can create a meeting that creates a new message with all included users.
  - A user can find any ACL Zoom room by name or availability.
  - A user can get reminders about all upcoming Canvas LMS assignments.
  
## Non-Functional Requirements

  - Security
      - Each request from Slack will be verified using Slack's official method of pre-generated token comparison.  Our app will compare sent & calulated token values on every request to determine if each request was genuine from Slack.  
      - Due to the limited scope (ACL-specific), there will be no public installations of the app.  
      - Minimal user data is stored (username, etc.) and no sensitive data (passwords).
      
  -Usability
      - The bot will have constant uptime to make commands always availabe to the user.
      - The bot will only be available through `/slash` commands, so the front-end is limited to only one location.

## Data Flow

When a user enters the correct trigger (`/slash`) command, a request is sent the correct app endpoint.  The request is verified.  The end point parses the data and sends the data to the correct function.  The Slack web-api is sent via POST request with the correct modals/views and the user sees the changes, either in a new modal opening, or a message sent back.  If further data is exchanged, it is done through Slack's interactive endpoint to the bot.


