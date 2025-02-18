INSERT INTO `tennis_ladder`.`league`
(`league_name`,
`end_date`,
`business_name`,
`category`,
`league_type`)
VALUES
('mens 4.0 flex league MAR-JUN',
'2025-03-31 12:00:00',
'FTSC',
'Tennis',
'singles'
);

SELECT * FROM league;

INSERT INTO `tennis_ladder`.`player`
(`email`,
`player_id`,
`first_name`,
`last_name`,
`gender`,
`usta_rating`,
`business_name`)
VALUES
('charlie@gmail.com',
5,
'Charlie',
'Tristsner',
'M',
'3.0',
'FTSC');

SELECT * FROM player;

INSERT INTO `tennis_ladder`.`doubles_team`
(`team_id`,
`player1_id`,
`player2_id`)
VALUES
(3,
3,
5);

SELECT * FROM doubles_team;

INSERT INTO `tennis_ladder`.`player_league`
(`league_id`,
`player_id`)
VALUES
(2,
1);

SELECT * FROM player_league;

INSERT INTO `tennis_ladder`.`team_league`
(`league_id`,
`team_id`)
VALUES
(2,
3);

SELECT * FROM team_league;

INSERT IGNORE INTO `tennis_ladder`.`singles_match`
(
`player1_id`,
`player2_id`,
`league_id`)
VALUES
(
1,
5,
1);

SELECT * FROM singles_match;

INSERT INTO `tennis_ladder`.`doubles_match`
(
`team1_id`,
`team2_id`,
`league_id`)
VALUES
(3,
1,
2);

SELECT * FROM doubles_match;

INSERT INTO `tennis_ladder`.`singles_ladder`
(`player_id`,
`league_id`,
`points`,
`wins`,
`losses`
)
VALUES
(1,
2,
3,
1,
2);

-- WIN ENTRY
INSERT INTO `tennis_ladder`.`singles_ladder`
(`player_id`,
`league_id`,
`matches`,
`points`,
`wins`,
`losses`
)
VALUES
(1,
2,
1,
3,
1,
0)
ON DUPLICATE KEY UPDATE
matches = matches + 1, points = points + 3, wins = wins + 1;

DELETE FROM singles_ladder WHERE player_id=2 and league_id=2;

SELECT * FROM singles_ladder;

-- LOSS ENTRY
INSERT INTO `tennis_ladder`.`singles_ladder`
(`player_id`,
`league_id`,
`matches`,
`losses`
)
VALUES
(1,
2,
1,
1)
ON DUPLICATE KEY UPDATE
matches = matches + 1, losses = losses + 1;

-- Add availability
INSERT INTO availability (player_id, available_date, morning, afternoon, evening) 
VALUES (1, '2025-02-18', TRUE, TRUE, FALSE);



