	 DELIMITER $$


DROP PROCEDURE IF EXISTS UpdateMatchScoreAndLadderRobot;
CREATE PROCEDURE UpdateMatchScoreAndLadderRobot(
    IN p_match_date DATE,
    IN p_business_name VARCHAR(200),
    IN p_league_name VARCHAR(200),
    IN p_winner_fname VARCHAR(200),
    IN p_winner_lname VARCHAR(200),
    IN p_loser_fname VARCHAR(200),
    IN p_loser_lname VARCHAR(200),
    IN p_set1_p1 INT,
    IN p_set1_p2 INT,
    IN p_set2_p1 INT,
    IN p_set2_p2 INT,
    IN p_set3_p1 INT,
    IN p_set3_p2 INT
)
BEGIN

	DECLARE v_match_id INT;
    DECLARE v_winner_id INT;
    DECLARE v_loser_id INT;
    DECLARE v_league_id INT;
	DECLARE exit handler for SQLEXCEPTION
    BEGIN
        -- Rollback transaction in case of error
        ROLLBACK;
    END;
    
    -- Let's get player id of the winner & league id
SELECT pl.player_id, l.league_id
INTO v_winner_id, v_league_id
FROM player p, player_league pl, league l
WHERE (p.first_name = p_winner_fname AND p.last_name = p_winner_lname)
AND p.player_id = pl.player_id
AND pl.league_id = l.league_id
AND REPLACE(l.league_name, "'", '') LIKE CONCAT(REPLACE(p_league_name, "'", ''), '%')
AND lower(l.business_name) = lower(p_business_name);


    -- Let's get player id of the loser
SELECT pl.player_id
INTO v_loser_id
FROM player p, player_league pl
WHERE (p.first_name = p_loser_fname AND p.last_name = p_loser_lname)
AND p.player_id = pl.player_id
AND pl.league_id = v_league_id;

	-- Let's now get the unique match id between the 2 players.
SELECT 
    match_id
INTO v_match_id 
FROM
    singles_match sm
WHERE
    ((sm.player1_id = v_winner_id
        AND sm.player2_id = v_loser_id)
        OR (sm.player1_id = v_loser_id
        AND sm.player2_id = v_winner_id))
        AND sm.league_id = v_league_id;
    
-- Check if match_id was found, if not, raise an error	    
IF v_match_id IS NULL THEN
	SIGNAL SQLSTATE '45000'
	SET MESSAGE_TEXT = 'No matches found';
END IF;
    
    -- We want both the match score and the ladder to be updated together or none
    START TRANSACTION;
	-- update a match score. Scores are assumed to be provided from winner's perspective
	UPDATE `tennis_ladder`.`singles_match` 
SET 
    `match_date` = p_match_date,
    `set1_p1` = p_set1_p1,
    `set1_p2` = p_set1_p2,
    `set2_p1` = p_set2_p1,
    `set2_p2` = p_set2_p2,
    `set3_p1` = p_set3_p1,
    `set3_p2` = p_set3_p2,
    `completed` = 'Y',
    `entered_by` = 'robot',
    `winner_id` = v_winner_id,
    `loser_id` = v_loser_id
WHERE
    `match_id` = v_match_id;

	COMMIT;
    
	-- Retrieve and return all data for the updated match
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
    WHERE `match_id` = v_match_id;
    
END $$

DELIMITER ;