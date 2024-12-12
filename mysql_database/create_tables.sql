DROP TABLE IF EXISTS player;
CREATE TABLE player (
    email VARCHAR(255) NOT NULL UNIQUE,
    player_id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    gender CHAR(1) NOT NULL,
    usta_rating VARCHAR(10),
    business_name VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS league;
CREATE TABLE league (
    league_id INT AUTO_INCREMENT PRIMARY KEY,
    league_name VARCHAR(100) NOT NULL,
    category VARCHAR(100) NOT NULL,
    league_type VARCHAR(100) NOT NULL,
    end_date DATE,
    business_name VARCHAR(100) NOT NULL
);

DROP TABLE IF EXISTS player_league;
CREATE TABLE player_league (
    league_id INT NOT NULL,
    player_id INT NOT NULL,
    PRIMARY KEY (league_id, player_id),
    FOREIGN KEY (player_id) REFERENCES player(player_id),
    FOREIGN KEY (league_id) REFERENCES league(league_id)
);

DROP TABLE IF EXISTS doubles_team;
CREATE TABLE doubles_team (
    team_id INT AUTO_INCREMENT PRIMARY KEY,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    FOREIGN KEY (player1_id) REFERENCES player(player_id),
    FOREIGN KEY (player2_id) REFERENCES player(player_id)
);

DROP TABLE IF EXISTS team_league;
CREATE TABLE team_league (
    league_id INT NOT NULL,
    team_id INT NOT NULL,
    PRIMARY KEY (league_id, team_id),
    FOREIGN KEY (team_id) REFERENCES doubles_team(team_id),
    FOREIGN KEY (league_id) REFERENCES league(league_id)
);

DROP TABLE IF EXISTS singles_match;
CREATE TABLE singles_match (
	match_id INT AUTO_INCREMENT PRIMARY KEY,
    match_date DATE,
    player1_id INT NOT NULL,
    player2_id INT NOT NULL,
    set1_p1 INT,
    set1_p2 INT,
    set2_p1 INT,
    set2_p2 INT,
    set3_p1 INT,
    set3_p2 INT,
    league_id INT NOT NULL,
    completed CHAR(1),
    entered_by VARCHAR(255),
    player1_confirmed VARCHAR(255),
    player2_confirmed VARCHAR(255),
    winner_id INT,
    loser_id INT,
    FOREIGN KEY (player1_id) REFERENCES player(player_id),
    FOREIGN KEY (player2_id) REFERENCES player(player_id),
    FOREIGN KEY (league_id) REFERENCES league(league_id),
    FOREIGN KEY (player1_id, league_id) REFERENCES player_league(player_id, league_id),
    FOREIGN KEY (player2_id, league_id) REFERENCES player_league(player_id, league_id),
    UNIQUE (player1_id, player2_id, match_id, league_id)
);

DROP TABLE IF EXISTS doubles_match;
CREATE TABLE doubles_match (
	match_id INT AUTO_INCREMENT PRIMARY KEY,
    match_date DATE NOT NULL,
    team1_id INT NOT NULL,
    team2_id INT NOT NULL,
    set1_t1 INT,
    set1_t2 INT,
    set2_t1 INT,
    set2_t2 INT,
    set3_t1 INT,
    set3_t2 INT,
    league_id INT NOT NULL,
    completed CHAR(1),
    entered_by VARCHAR(255),
    team1_confirmed VARCHAR(255),
    team2_confirmed VARCHAR(255),
    winner_team_id INT,
    loser_team_id INT,
    FOREIGN KEY (team1_id) REFERENCES doubles_team(team_id),
    FOREIGN KEY (team2_id) REFERENCES doubles_team(team_id),
    FOREIGN KEY (league_id) REFERENCES league(league_id),
    FOREIGN KEY (team1_id, league_id) REFERENCES team_league(team_id, league_id),
    FOREIGN KEY (team2_id, league_id) REFERENCES team_league(team_id, league_id),
    UNIQUE (team1_id, team2_id, match_id, league_id)
);

DROP TABLE IF EXISTS singles_ladder;
CREATE TABLE singles_ladder (
	player_id INT NOT NULL,
    league_id INT NOT NULL,
    matches INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    PRIMARY KEY (player_id, league_id),
    FOREIGN KEY (player_id) REFERENCES player(player_id),
    FOREIGN KEY (league_id) REFERENCES league(league_id)
);

DROP TABLE IF EXISTS doubles_ladder;
CREATE TABLE doubles_ladder (
	team_id INT NOT NULL,
    league_id INT NOT NULL,
    matches INT NOT NULL DEFAULT 0,
    points INT NOT NULL DEFAULT 0,
    wins INT NOT NULL DEFAULT 0,
    losses INT NOT NULL DEFAULT 0,
    PRIMARY KEY (team_id, league_id),
    FOREIGN KEY (team_id) REFERENCES doubles_team(team_id),
    FOREIGN KEY (league_id) REFERENCES league(league_id)
);
 