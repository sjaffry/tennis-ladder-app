DELIMITER $$


DROP PROCEDURE IF EXISTS ConfirmDoublesScoreAndUpdateLadder;
CREATE PROCEDURE ConfirmDoublesScoreAndUpdateLadder(
    IN p_match_id INT,
    IN p_team_designation INT,
    IN p_email VARCHAR(200),
    IN p_winner_team_id INT,
    IN p_loser_team_id INT,
    IN p_league_id INT
)
BEGIN

	DECLARE v_t1_confirmed VARCHAR(200);
    DECLARE v_t2_confirmed VARCHAR(200);
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
    
    
	SELECT team1_confirmed, team2_confirmed
    INTO v_t1_confirmed, v_t2_confirmed
    FROM `tennis_ladder`.`doubles_match`
    WHERE match_id = p_match_id;
    
    -- First let's ensure that this stored proc is idempotent. Avoid updating the ladder on repeat calls with same parameters
	IF (v_t1_confirmed is NULL) OR (v_t2_confirmed is NULL) THEN    
    
		-- update a match score. Scores are assumed to be provided from winner's perspective
		IF p_team_designation = 1 THEN
			UPDATE `tennis_ladder`.`doubles_match` 
			SET 
			`team1_confirmed` = p_email
			WHERE
			`match_id` = p_match_id;
		ELSEIF p_team_designation = 2 THEN
			UPDATE `tennis_ladder`.`doubles_match` 
			SET 
			`team2_confirmed` = p_email
			WHERE
			`match_id` = p_match_id;
		END IF;
		
		-- Update ladder only once both players have confirmed
		SELECT team1_confirmed, team2_confirmed
		INTO v_t1_confirmed, v_t2_confirmed
		FROM `tennis_ladder`.`doubles_match`
		WHERE match_id = p_match_id;


		IF (v_t1_confirmed is NOT NULL) AND (v_t2_confirmed is NOT NULL) THEN
			-- Update the ladder for a single WIN
			INSERT INTO `tennis_ladder`.`doubles_ladder`
			(`team_id`, `league_id`, `matches`, `points`, `wins`)
			VALUES (p_winner_team_id, p_league_id, 1, 3, 1)
			ON DUPLICATE KEY UPDATE
				matches = matches + 1,
				points = points + 3,
				wins = wins + 1;
				
			-- Update the ladder for a LOSS
			INSERT INTO `tennis_ladder`.`doubles_ladder`
			(`team_id`, `league_id`, `matches`, `losses`)
			VALUES (p_loser_team_id, p_league_id, 1, 1)
			ON DUPLICATE KEY UPDATE
				matches = matches + 1,
				losses = losses + 1;
		END IF;
	END IF;
	
    COMMIT;
    
END $$

DELIMITER ;