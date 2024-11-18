SELECT DISTINCT l.league_name FROM league l, player_league pl, player p
WHERE l.league_id = pl.league_id
AND p.player_id = pl.player_id
AND l.business_name = 'FTSC'
AND l.category = 'Tennis';

SELECT * FROM league;

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
WHERE p.email = "annieraza@gmail.com"
AND (p.player_id = m.player1_id OR p.player_id = m.player2_id);

SELECT * from player;

SELECT * from league;

 SELECT ROW_NUMBER() OVER() AS "rank",
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
	ORDER BY sl.`points` DESC

