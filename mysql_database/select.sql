SELECT DISTINCT l.league_name FROM league l, player_league pl, player p
WHERE l.league_id = pl.league_id
AND p.player_id = pl.player_id
AND l.business_name = 'FTSC'
AND l.category = 'Tennis';

SELECT concat(p1.first_name, ' ', p1.last_name) as 'player1', concat(p2.first_name, ' ', p2.last_name) as 'player2'
FROM `tennis_ladder`.`singles_match` sm, `tennis_ladder`.`player` p1, `tennis_ladder`.`player` p2
WHERE sm.league_id = 1
AND sm.player1_id = p1.player_id
AND sm.player2_id = p2.player_id;

WITH matches AS (
SELECT
p1.first_name as p1_firstname,
p1.last_name as p1_lastname,
p2.first_name as p2_firstname,
p2.last_name as p2_lastname,
sm.player1_id,
sm.player2_id,
set1_p1,
set1_p2,
set2_p1,
set2_p2,
set3_p1,
set3_p2
FROM singles_match sm, player p1, player p2
WHERE sm.player1_id = p1.player_id
AND sm.player2_id = p2.player_id
AND sm.league_id = 2)
SELECT m.* 
FROM player p, matches m
WHERE p.email = "sajaffry@gmail.com"
AND (p.player_id = m.player1_id OR p.player_id = m.player2_id);

SELECT count(*) from player;

DELETE from player_league WHERE league_id in (2,3);

delete from player where player_id > 5;

delete from team_league where league_id = 2;

select * from team_league where league_id = 2;

DELETE from doubles_ladder where league_id = 2;

SELECT * from doubles_ladder where league_id in (2,3);

DELETE from doubles_match where league_id=2;

 
		p.`first_name`,
		p.`last_name`,
		sl.`points`,
		sl.`matches`,
		sl.`wins`,
		sl.`losses`,
		CAST(ROUND(sl.`wins` / sl.`matches` * 100, 2) AS CHAR) AS "win_rate"
	FROM singles_ladder as sl, player p
	WHERE sl.`league_id` = 2
	AND sl.player_id = p.player_id
	ORDER BY sl.`points` DESC;
    
-- Get doubles match
WITH matches AS (
	SELECT
	dm.match_id,
	p1.first_name as p1_firstname,
	p2.first_name as p2_firstname,
	p3.first_name as p3_firstname,
	p4.first_name as p4_firstname,
	p1.player_id as player1_id,
    p2.player_id as player2_id,
    p3.player_id as player3_id,
    p4.player_id as player4_id,
	dm.team1_id,
	dm.team2_id,
	set1_t1,
	set1_t2,
	set2_t1,
	set2_t2,
	set3_t1,
	set3_t2
	FROM doubles_match dm, doubles_team dt1, doubles_team dt2, player p1, player p2, player p3, player p4
	WHERE dm.team1_id = dt1.team_id
	AND dt1.player1_id = p1.player_id
	AND dt1.player2_id = p2.player_id
	AND dt2.player1_id = p3.player_id
	AND dt2.player2_id = p4.player_id
	AND dm.team2_id = dt2.team_id
	AND dm.league_id = 2)
SELECT m.* 
FROM player p, matches m
WHERE p.email = "syejaffr@amazon.com"
AND (p.player_id = m.player1_id OR p.player_id = m.player2_id OR p.player_id = m.player3_id OR p.player_id = m.player4_id);


	SELECT
	p.first_name, p.middle_name, p.last_name, p.gender, p.email, p.usta_rating, l.league_name
	FROM league l, player p, player_league pl
	WHERE pl.player_id = p.player_id
	AND l.league_id = pl.league_id
	AND l.league_id = 1;
