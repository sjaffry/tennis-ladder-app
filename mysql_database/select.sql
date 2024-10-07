SELECT DISTINCT l.league_name FROM league l, player_league pl, player p
WHERE l.league_id = pl.league_id
AND p.player_id = pl.player_id
AND l.business_name = 'FTSC';

SELECT p1.first_name, p1.last_name, p2.first_name, p2.last_name
FROM player p1, singles_match sm, player p2
WHERE p1.email = 'shoutavouch2@gmail.com'
AND ((p1.player_id = sm.player1_id AND p2.player_id = sm.player2_id) OR
	(p1.player_id = sm.player2_id AND p2.player_id = sm.player1_id));

SELECT * from player;

SELECT * FROM singles_match;
