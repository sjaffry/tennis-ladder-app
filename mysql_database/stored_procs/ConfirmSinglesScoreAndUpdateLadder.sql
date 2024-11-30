DELIMITER $$


DROP PROCEDURE IF EXISTS ConfirmSinglesScoreAndUpdateLadder;
CREATE PROCEDURE ConfirmSinglesScoreAndUpdateLadder(
    IN p_match_id INT,
    IN p_player_designation INT,
    IN p_email VARCHAR(200),
    IN p_winner_id INT,
    IN p_loser_id INT,
    IN p_league_id INT
)
BEGIN

	DECLARE v_p1_confirmed VARCHAR(200);
    DECLARE v_p2_confirmed VARCHAR(200);
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
    
	-- update a match score. Scores are assumed to be provided from winner's perspective
	IF p_player_designation = 1 THEN
		UPDATE `tennis_ladder`.`singles_match` 
		SET 
		`player1_confirmed` = p_email
		WHERE
		`match_id` = p_match_id;
	ELSEIF p_player_designation = 2 THEN
		UPDATE `tennis_ladder`.`singles_match` 
		SET 
		`player2_confirmed` = p_email
		WHERE
		`match_id` = p_match_id;
	END IF;
    
-- Update ladder only once both players have confirmed
	SELECT player1_confirmed, player2_confirmed
    INTO v_p1_confirmed, v_p2_confirmed
    FROM `tennis_ladder`.`singles_match`
    WHERE match_id = p_match_id;


IF (v_p1_confirmed is NOT NULL) AND (v_p2_confirmed is NOT NULL) THEN
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
    (`player_id`, `league_id`, `matches`, `losses`)
    VALUES (p_loser_id, p_league_id, 1, 1)
    ON DUPLICATE KEY UPDATE
        matches = matches + 1,
        losses = losses + 1;
END IF;

	COMMIT;
    
END $$

DELIMITER ;