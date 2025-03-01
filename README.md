# Tennis & Pickleball Ladder App
A cost efficient, completely serverless, AI powered application to organize and run a ladder based flex league for Tennis and Pickleball - singles and doubles.

### There are 3 main flows:
1. CRUD flow (League admins) - Create new leagues, add players to league and have the app automatically setup head-to-head matches.
2. CRUD flow (Players) - Players view match schedules, add their availability, add match scores and view ladder. Additionally, players are able to schedule matches via the app
3. "Match robot flow (AI)" - Players can send an email to the sports ladder robot (powered by LLM) that kicks off a state machine to read and parse the match result email and automatically enter scores in the database


## Architecture
### Flows 1 and 2 (CRUD flows)
![crud flow](/src/images/crud-flow-sports-ladder.png)

### Flow 3 (Match robot flow)
![robot flow](/src/images/robot-flow-sports-ladder.png)
