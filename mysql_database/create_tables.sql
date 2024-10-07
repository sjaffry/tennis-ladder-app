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
    end_date DATETIME,
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

DROP TABLE IF EXISTS singles_match;
CREATE TABLE singles_match (
	match_id INT AUTO_INCREMENT PRIMARY KEY,
    match_date DATETIME NOT NULL,
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
    FOREIGN KEY (player1_id) REFERENCES player(player_id),
    FOREIGN KEY (player2_id) REFERENCES player(player_id)
);

DROP TABLE IF EXISTS doubles_match;
CREATE TABLE doubles_match (
	match_id INT AUTO_INCREMENT PRIMARY KEY,
    match_date DATETIME NOT NULL,
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
    FOREIGN KEY (team1_id) REFERENCES doubles_team(team_id),
    FOREIGN KEY (team2_id) REFERENCES doubles_team(team_id)
);
 