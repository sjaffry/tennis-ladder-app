DELIMITER $$


DROP PROCEDURE IF EXISTS UpdateDoublesMatchScoreAndLadder;
CREATE PROCEDURE UpdateDoublesMatchScoreAndLadder(
    IN p_match_date DATE,   
	IN p_match_id INT,
    IN p_league_id INT,
    IN p_winner_player1_id INT,
    IN p_winner_player2_id INT,
    IN p_loser_player1_id INT,
    IN p_loser_player2_id INT,
    IN p_entered_by VARCHAR(200),   
    IN p_winner_confirmed VARCHAR(200),
    IN p_loser_confirmed VARCHAR(200),
    IN p_set1_t1 INT,
    IN p_set1_t2 INT,
    IN p_set2_t1 INT,
    IN p_set2_t2 INT,
    IN p_set3_t1 INT,
    IN p_set3_t2 INT
)
BEGIN

	DECLARE v_match_id INT;
	DECLARE exit handler for SQLEXCEPTION
    BEGIN
        -- Rollback transaction in case of error
        ROLLBACK;
    END;
    
    -- We want both the match score and the ladder to be updated together or none
    START TRANSACTION;
	-- update a match score. Scores are assumed to be provided from winner's perspective
	INSERT INTO `tennis_ladder`.`doubles_match` (
		`match_id`,
        `match_date`,
        `player1_id`,
        `player2_id`,
        `player3_id`,
        `player4_id`,
        `set1_t1`,
        `set1_t2`,
        `set2_t1`,
        `set2_t2`,
        `set3_t1`,
        `set3_t2`,
        `league_id`,
        `completed`,
        `entered_by`,
        `winner_confirmed`,
        `loser_confirmed`,
        `winner1_id`,
        `winner2_id`,
        `loser1_id`,
        `loser2_id`)
    VALUES (
        p_match_id,
        p_match_date,
        p_winner_player1_id,
        p_winner_player2_id,
        p_loser_player1_id,
        p_loser_player2_id,
        p_set1_t1,
        p_set1_t2,
        p_set2_t1,
        p_set2_t2,
        p_set3_t1,
        p_set3_t2,
        p_league_id,
        'Y',
        p_entered_by,
        p_winner_confirmed,
        p_loser_confirmed,
        p_winner_player1_id,
        p_winner_player2_id,
        p_loser_player1_id,
        p_loser_player2_id )
	ON DUPLICATE KEY UPDATE
        `match_date` = p_match_date,
        `player1_id` = p_winner_player1_id,
        `player2_id` = p_winner_player2_id,
        `player3_id` = p_loser_player1_id,
        `player4_id` = p_loser_player2_id,
        `set1_t1` = p_set1_t1,
        `set1_t2` = p_set1_t2,
        `set2_t1` = p_set2_t1,
        `set2_t2` = p_set2_t2,
        `set3_t1` = p_set3_t1,
        `set3_t2` = p_set3_t2,
        `league_id` = p_league_id,
        `completed` = 'Y',
        `entered_by` = p_entered_by,
        `winner_confirmed` = p_winner_confirmed,
        `loser_confirmed` = p_loser_confirmed,
        `winner1_id` = p_winner_player1_id,
        `winner2_id` = p_winner_player2_id,
        `loser1_id` = p_loser_player1_id,
        `loser2_id` = p_loser_player2_id;
		

		-- Check if match_id was provided as input, if so then update v_match_id value with it
    IF p_match_id IS NOT NULL THEN
        SET v_match_id = p_match_id;
	ELSE
		-- Get the match ID of the inserted/updated match
		SET v_match_id = LAST_INSERT_ID();
    END IF;


-- Update ladder only once both players have confirmed
IF (p_winner_confirmed is NOT NULL) AND (p_loser_confirmed is NOT NULL) THEN
    -- Update the ladder for the first player of the winning team
    INSERT INTO `tennis_ladder`.`doubles_ladder`
    (`player_id`, `league_id`, `matches`, `points`, `wins`)
    VALUES (p_winner_player1_id, p_league_id, 1, 3, 1)
    ON DUPLICATE KEY UPDATE
        matches = matches + 1,
        points = points + 3,
        wins = wins + 1;

    -- Update the ladder for the second player of the winning team
    INSERT INTO `tennis_ladder`.`doubles_ladder`
    (`player_id`, `league_id`, `matches`, `points`, `wins`)
    VALUES (p_winner_player2_id, p_league_id, 1, 3, 1)
    ON DUPLICATE KEY UPDATE
        matches = matches + 1,
        points = points + 3,
        wins = wins + 1;
        
    -- Update the ladder for the first player of the losing team
    INSERT INTO `tennis_ladder`.`doubles_ladder`
    (`player_id`, `league_id`, `matches`, `points`, `losses`)
    VALUES (p_loser_player1_id, p_league_id, 1, 1, 1)
    ON DUPLICATE KEY UPDATE
        matches = matches + 1,
        points = points + 1,
        losses = losses + 1;

    -- Update the ladder for the second player of the losing team
    INSERT INTO `tennis_ladder`.`doubles_ladder`
    (`player_id`, `league_id`, `matches`, `points`, `losses`)
    VALUES (p_loser_player2_id, p_league_id, 1, 1, 1)
    ON DUPLICATE KEY UPDATE
        matches = matches + 1,
        points = points + 1,
        losses = losses + 1;
END IF;

	COMMIT;
    
	-- Retrieve and return all data for the updated match
        SELECT 
		dm.match_id,
        dm.player1_id,
        dm.player2_id,
        dm.player3_id,
        dm.player4_id,
        p1.first_name as 'player1_fname',
        p2.first_name as 'player2_fname',
        p3.first_name as 'player3_fname',
        p4.first_name as 'player4_fname',
        dm.set1_t1,
        dm.set1_t2,
        dm.set2_t1,
        dm.set2_t2,
        dm.set3_t1,
        dm.set3_t2,
        dm.winner1_id,
        dm.winner2_id,
        dm.loser1_id,
        dm.loser2_id,
        dm.entered_by,
        dm.winner_confirmed,
        dm.loser_confirmed,
        dm.league_id
    FROM `tennis_ladder`.`doubles_match` dm,
		`tennis_ladder`.`player` p1, 
        `tennis_ladder`.`player` p2, 
        `tennis_ladder`.`player` p3, 
        `tennis_ladder`.`player` p4
    WHERE dm.`match_id` = v_match_id
    AND dm.player1_id = p1.player_id
    AND dm.player2_id = p2.player_id
    AND dm.player3_id = p3.player_id
    AND dm.player4_id = p4.player_id;

END $$

DELIMITER ;