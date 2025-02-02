DELIMITER $$


DROP PROCEDURE IF EXISTS AddPlayerToLeague;
CREATE PROCEDURE AddPlayerToLeague(
    IN p_email VARCHAR(200),
    IN p_first_name VARCHAR(200),
    IN p_last_name VARCHAR(200),
	IN p_league_id INT,
    IN p_usta_rating VARCHAR(10),
    IN p_gender CHAR(1),
    IN p_business_name VARCHAR(200)
)
BEGIN

	DECLARE v_league_id INT;
    DECLARE v_player_id INT;
	DECLARE exit handler for SQLEXCEPTION
    BEGIN
        -- Rollback transaction in case of error
        ROLLBACK;
    END;

	-- Check that the league id provided exists in the database
	SELECT 
		l.league_id
	INTO v_league_id FROM
		league l
	WHERE
		 l.league_id = p_league_id;
    
	-- Check if match_id was found, if not, raise an error
    IF v_league_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'No leagues found';
    END IF;
    
    -- We want both the player record add/update and the linking to league to be updated together or none
    START TRANSACTION;
	-- Upsert player
		INSERT INTO `tennis_ladder`.`player`
		(`email`,
		`first_name`,
		`last_name`,
		`gender`,
		`usta_rating`,
		`business_name`)
		VALUES
		(
		p_email,
        p_first_name,
        p_last_name,
        p_gender,
        p_usta_rating,
        p_business_name
		)
		ON DUPLICATE KEY UPDATE
		first_name = p_first_name, 
		last_name = p_last_name,
		gender = p_gender,
		usta_rating = p_usta_rating;

	-- Check that the league id provided exists in the database
		SELECT 
			p.player_id
		INTO v_player_id FROM
			player p
		WHERE
			 p.email = p_email;

		-- Upsert player into league
		INSERT INTO `tennis_ladder`.`player_league`
		(`player_id`, `league_id`)
		VALUES (p_player_id, p_league_id)
		ON DUPLICATE KEY UPDATE
			player_id = v_player_id,
			league_id = v_league_id;

    COMMIT;
    
END $$

DELIMITER ;