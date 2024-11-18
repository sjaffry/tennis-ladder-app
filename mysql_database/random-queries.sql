delete from debug_table;

select * from debug_table;

alter table singles_match add ( player1_confirmed VARCHAR(255), player2_confirmed VARCHAR(255));

alter table singles_match drop column confirmed_by;

select * from player;

select * from league;

delete from singles_match where match_id = 8;

select * from singles_ladder;

update singles_match set entered_by = "robot" where match_id=2;

select * from singles_match where league_id=2;

CALL `tennis_ladder`.`UpdateMatchScoreAndLadder`('2024-01-01', 2, 1, 4, 'sajaffry@gmail.com', 'annieraza@gmail.com', 6,1,6,2,1,0);

CALL `tennis_ladder`.`UpdateMatchScoreAndLadderRobot`('2024-01-01', 'mens 3.0', 'Syed', 'Jaffry', 'Saira', 'Jaffry', 6,1,6,2,1,0);

CALL `tennis_ladder`.`UpdateMatchScoreAndLadderRobot`('2024-01-01', 'mens 3.0', 'Syed', 'Jaffry', 'Saira', 'Jaffry', 6,1,6,2,1,0, @winner_id, @loser_id, @league_id, @match_id);
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

-- Get the match id of the two players
SELECT 
    match_id
FROM singles_match sm
WHERE
    ((sm.player1_id = p_winner_id
        AND sm.player2_id = p_loser_id)
        OR (sm.player1_id = p_loser_id
        AND sm.player2_id = p_winner_id))
        AND sm.league_id = p_league_id;
        
---------------------------

      

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
    
    alter table debug_table add (p1_fname VARCHAR(200), p1_lname VARCHAR(200));
    

    