delete from debug_table;

select * from debug_table;

select * from player_league;

alter table singles_match add ( player1_confirmed VARCHAR(255), player2_confirmed VARCHAR(255));

alter table singles_match drop column confirmed_by;

select * from player;

select * from league;

delete from singles_match where match_id = 8;

select * from singles_ladder;

update singles_match set entered_by = "robot" where match_id=2;

select * from singles_match where league_id=2;

CALL `tennis_ladder`.`UpdateMatchScoreAndLadder`('2024-01-01', 2, 1, 4, 'sajaffry@gmail.com', 'annieraza@gmail.com', 6,1,6,2,1,0);

CALL `tennis_ladder`.`UpdateMatchScoreAndLadderRobot`('2024-01-01', 'mens 3.0', 'Syed', 'Jaffry', 'Charlie', 'Trishner', 6,1,6,2,1,0);


SELECT @winner_id, @loser_id, @league_id, @match_id;

SELECT pl.player_id, pl.league_id
FROM player p, player_league pl
WHERE (p.first_name = 'Saira' AND p.last_name = 'Jaffry')
AND p.player_id = pl.player_id


AND pl.league_id = 1;


-- Stored proc for Robot entry

-- Get the player id of the first player
SELECT pl.player_id as "loser_id"
FROM player p, player_league pl, league l
WHERE (p.first_name = 'Syed' AND p.last_name = 'Jaffry')
AND p.player_id = pl.player_id
AND pl.league_id = l.league_id
AND l.league_name like 'mix doubles%';

-- Get the player id of the second player
SELECT pl.player_id as "winner_id"
FROM player p, player_league pl, league l
WHERE (p.first_name = 'Saira' AND p.last_name = 'Jaffry')
AND p.player_id = pl.player_id
AND pl.league_id = l.league_id
AND l.league_name like 'mix doubles%';

    SELECT sm.player1_id, 
		sm.player2_id,
        sm.entered_by,
        sm.player1_confirmed,
        sm.player2_confirmed,
        sm.league_id,
		sm.winner_id,
		sm.loser_id,
		sm.set1_p1,
		sm.set1_p2,
		sm.set2_p1,
		sm.set2_p2,
		sm.set3_p1,
		sm.set3_p2
    FROM `tennis_ladder`.`singles_match` sm
    WHERE `match_id` = 11;
        
---------------------------
-- DOUBLES
      

	SELECT 
		match_id
     FROM
		singles_match sm
	WHERE
		((sm.player1_id = 1
			AND sm.player2_id = 2)
			OR (sm.player1_id = 2
			AND sm.player2_id = 1))
			AND sm.league_id = 2;    
    
    select * from doubles_match;
    
    select * from doubles_team;
    
    select * from team_league;
    
    select * from league;
    
    select * from doubles_team;
    
    CALL `tennis_ladder`.`UpdateDoublesMatchScoreAndLadderRobot`('2024-01-01', 'FTSC', 'mens 3.0', 'Syed', 'Jaffry', 'Saira', 'Jaffry', 'John', 'Jackson', 'Jill', 'Jackson', 6,1,6,2,1,0);

SELECT 
    match_id
FROM
    doubles_match dm
WHERE
    ((dm.team1_id = 1
        AND dm.team2_id = 2)
        OR (dm.team1_id = 2
        AND dm.team2_id = 1))
        AND dm.league_id = 2;

SELECT DISTINCT dt.team_id, tl.league_id
FROM player p1, player p2, doubles_team dt, team_league tl, league l
WHERE (p1.first_name = 'Syed' AND p1.last_name = 'Jaffry')
AND (p2.first_name = 'Saira' AND p2.last_name = 'Jaffry')
AND (p1.player_id = dt.player1_id OR p1.player_id = dt.player2_id)
AND (p2.player_id = dt.player1_id OR p2.player_id = dt.player2_id)
AND tl.league_id = l.league_id
AND REPLACE(l.league_name, "'", '') LIKE CONCAT(REPLACE('mens 3.0', "'", ''), '%')
AND lower(l.business_name) = lower('FTSC');

SELECT DISTINCT dt.team_id
FROM player p1, player p2, doubles_team dt, team_league tl
WHERE (p1.first_name = 'John' AND p1.last_name = 'Jackson')
AND (p2.first_name = 'Jill' AND p2.last_name = 'Jackson')
AND (p1.player_id = dt.player1_id OR p1.player_id = dt.player2_id)
AND (p2.player_id = dt.player1_id OR p2.player_id = dt.player2_id)
AND tl.league_id = 2;
    
    
SELECT 
    match_id
FROM
    doubles_match dm
WHERE
    ((dm.team1_id = 1
        AND dm.team2_id = 2)
        OR (dm.team1_id = 2
        AND dm.team2_id = 1))
        AND dm.league_id = 2;
        
    SELECT dm.team1_id, 
		dm.team2_id,
        dm.entered_by,
        dm.team1_confirmed,
        dm.team2_confirmed,
        dm.league_id,
		dm.winner_team_id,
		dm.loser_team_id,
		dm.set1_t1,
		dm.set1_t2,
		dm.set2_t1,
		dm.set2_t2,
		dm.set3_t1,
		dm.set3_t2,
        p1.email as 'player1_email',
        p2.email as 'player2_email'
    FROM `tennis_ladder`.`doubles_match` dm, player p1, player p2
    WHERE `match_id` = 1
    AND p1.player_id = dm.player1_id
    AND p2.player_id = dm.player2_id;
	
    