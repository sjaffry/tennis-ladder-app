UPDATE `tennis_ladder`.`singles_match`
SET
`match_date` = '2024-01-01',
`winner_id` = null,
`loser_id` = null,
`set1_p1` = null,
`set1_p2` = null,
`set2_p1` = null,
`set2_p2` = null,
`set3_p1` = null,
`set3_p2` = null,
`completed` = null,
`entered_by` = null,
`player1_confirmed` = null,
`player2_confirmed` = null
WHERE `match_id` = 1;

UPDATE `tennis_ladder`.`doubles_match`
SET
`match_date` = '2024-01-01',
`winner_team_id` = null,
`loser_team_id` = null,
`set1_t1` = null,
`set1_t2` = null,
`set2_t1` = null,
`set2_t2` = null,
`set3_t1` = null,
`set3_t2` = null,
`completed` = null,
`entered_by` = null,
`team1_confirmed` = null,
`team2_confirmed` = null
WHERE `match_id` = 1;

UPDATE `tennis_ladder`.`singles_match`
SET
`match_date` = '2024-10-09',
`set1_p1` = 6,
`set1_p2` = 3,
`set2_p1` = 6,
`set2_p2` = 3,
`completed` = 'Y',
`entered_by` = 'annieraza@gmail.com'
WHERE `match_id` = 5;

UPDATE `tennis_ladder`.`singles_match`
SET
`player1_id` = 3,
`player2_id` = 1
WHERE `match_id` = 1;

UPDATE league
SET
league_name = "mix doubles flex league OCT-DEC"
WHERE league_id in (2);

