INSERT INTO `tennis_ladder`.`league`
(`league_name`,
`end_date`,
`business_name`)
VALUES
('mens 3.0 flex league JAN-MAR',
'2025-03-31 12:00:00',
'FTSC'
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
('shoutavouch2@gmail.com',
4,
'Jill',
'Jackson',
'F',
'3.0',
'FTSC');

SELECT * FROM player;

INSERT INTO `tennis_ladder`.`player_league`
(`league_id`,
`player_id`)
VALUES
(2,
2);


SELECT * FROM player_league;

INSERT INTO `tennis_ladder`.`singles_match`
(
`player1_id`,
`player2_id`,
`league_id`)
VALUES
(4,
1,
2);

SELECT * FROM singles_match;

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
