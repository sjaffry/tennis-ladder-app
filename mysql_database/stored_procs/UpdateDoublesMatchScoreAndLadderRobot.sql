	 DELIMITER $$


DROP PROCEDURE IF EXISTS UpdateDoublesMatchScoreAndLadderRobot;

CREATE PROCEDURE UpdateDoublesMatchScoreAndLadderRobot(
    IN p_match_date DATE,
    IN p_business_name VARCHAR(200),
    IN p_league_name VARCHAR(200),
    IN p_winner_p1_fname VARCHAR(200),
    IN p_winner_p1_lname VARCHAR(200),
    IN p_winner_p2_fname VARCHAR(200),
    IN p_winner_p2_lname VARCHAR(200),
    IN p_loser_p1_fname VARCHAR(200),
    IN p_loser_p1_lname VARCHAR(200),
    IN p_loser_p2_fname VARCHAR(200),
    IN p_loser_p2_lname VARCHAR(200),
    IN p_set1_t1 INT,
    IN p_set1_t2 INT,
    IN p_set2_t1 INT,
    IN p_set2_t2 INT,
    IN p_set3_t1 INT,
    IN p_set3_t2 INT
)
BEGIN

	DECLARE v_match_id INT;
    DECLARE v_winner_team_id INT;
    DECLARE v_loser_team_id INT;
    DECLARE v_league_id INT;
	DECLARE exit handler for SQLEXCEPTION
    BEGIN
        -- Rollback transaction in case of error
        ROLLBACK;
    END;
    
    -- Let's get team id of the winner plus league_id
SELECT DISTINCT dt.team_id, tl.league_id
INTO v_winner_team_id, v_league_id
FROM player p1, player p2, doubles_team dt, team_league tl, league l
WHERE (p1.first_name = p_winner_p1_fname AND p1.last_name = p_winner_p1_lname)
AND (p2.first_name = p_winner_p2_fname AND p2.last_name = p_winner_p2_lname)
AND (p1.player_id = dt.player1_id OR p1.player_id = dt.player2_id)
AND (p2.player_id = dt.player1_id OR p2.player_id = dt.player2_id)
AND tl.league_id = l.league_id
AND REPLACE(l.league_name, "'", '') LIKE CONCAT(REPLACE(p_league_name, "'", ''), '%')
AND lower(l.business_name) = lower(p_business_name); 


    -- Let's get team id of the loser
SELECT DISTINCT dt.team_id
INTO v_loser_team_id
FROM player p1, player p2, doubles_team dt, team_league tl
WHERE (p1.first_name = p_loser_p1_fname AND p1.last_name = p_loser_p1_lname)
AND (p2.first_name = p_loser_p2_fname AND p2.last_name = p_loser_p2_lname)
AND (p1.player_id = dt.player1_id OR p1.player_id = dt.player2_id)
AND (p2.player_id = dt.player1_id OR p2.player_id = dt.player2_id)
AND tl.league_id = v_league_id;

	-- Let's now get the unique match id between the 2 teams.
    -- 
SELECT 
    match_id
INTO v_match_id 
FROM
    doubles_match dm
WHERE
    ((dm.team1_id = v_winner_team_id
        AND dm.team2_id = v_loser_team_id)
        OR (dm.team1_id = v_loser_team_id
        AND dm.team2_id = v_winner_team_id))
        AND dm.league_id = v_league_id;
    
-- Check if match_id was found, if not, raise an error	    
IF v_match_id IS NULL THEN
	SIGNAL SQLSTATE '45000'
	SET MESSAGE_TEXT = 'No matches found';
END IF;
    
    -- We want both the match score and the ladder to be updated together or none
    START TRANSACTION;
	-- update a match score. Scores are assumed to be provided from winner's perspective
	UPDATE `tennis_ladder`.`doubles_match` 
SET 
    `match_date` = p_match_date,
    `set1_t1` = p_set1_t1,
    `set1_t2` = p_set1_t2,
    `set2_t1` = p_set2_t1,
    `set2_t2` = p_set2_t2,
    `set3_t1` = p_set3_t1,
    `set3_t2` = p_set3_t2,
    `completed` = 'Y',
    `entered_by` = 'robot',
    `winner_team_id` = v_winner_team_id,
    `loser_team_id` = v_loser_team_id
WHERE
    `match_id` = v_match_id;

	COMMIT;
    
	-- Retrieve and return all data for the updated match
    SELECT "doubles" as Match_type, 
		dm.match_id,
		dm.team1_id, 
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
		dm.set3_t2
    FROM `tennis_ladder`.`doubles_match` dm
    WHERE `match_id` = v_match_id;
    
END $$

DELIMITER ;