DELIMITER $$


DROP PROCEDURE IF EXISTS UpdateMatchScoreAndLadder;
CREATE PROCEDURE UpdateMatchScoreAndLadder(
    IN p_match_date DATE,
    IN p_match_id INT,
    IN p_league_id INT,
    IN p_winner_id INT,
	IN p_loser_id INT,
    IN p_entered_by VARCHAR(200),
    IN p_p1_confirmed VARCHAR(200),
    IN p_p2_confirmed VARCHAR(200),    
    IN p_set1_p1 INT,
    IN p_set1_p2 INT,
    IN p_set2_p1 INT,
    IN p_set2_p2 INT,
    IN p_set3_p1 INT,
    IN p_set3_p2 INT
)
BEGIN

	-- DECLARE v_match_id INT;
	DECLARE exit handler for SQLEXCEPTION
    BEGIN
        -- Rollback transaction in case of error
        ROLLBACK;
    END;
    
	-- Check if match_id was found, if not, raise an error
    IF p_match_id IS NULL THEN
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
    `entered_by` = p_entered_by,
    `player1_confirmed` = p_p1_confirmed,
    `player2_confirmed` = p_p2_confirmed,
    `winner_id` = p_winner_id,
    `loser_id` = p_loser_id
WHERE
    `match_id` = p_match_id;
    
-- Update ladder only once both players have confirmed
IF (p_p1_confirmed is NOT NULL) AND (p_p2_confirmed is NOT NULL) THEN
    -- Update the ladder for a single WIN
    INSERT INTO `tennis_ladder`.`singles_ladder`
    (`player_id`, `league_id`, `matches`, `points`, `wins`)
    VALUES (p_winner_id, p_league_id, 1, 3, 1)
    ON DUPLICATE KEY UPDATE
        matches = matches + 1,
        points = points + 3,
        wins = wins + 1;
        
    -- Update the ladder for a LOSS
    INSERT INTO `tennis_ladder`.`singles_ladder`
    (`player_id`, `league_id`, `matches`, `points`, `losses`)
    VALUES (p_loser_id, p_league_id, 1, 1, 1)
    ON DUPLICATE KEY UPDATE
        matches = matches + 1,
        points = points + 1,
        losses = losses + 1;
END IF;

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
    WHERE `match_id` = p_match_id;
    
END $$

DELIMITER ;