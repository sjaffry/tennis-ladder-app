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
(1,
4);


SELECT * FROM player_league;

