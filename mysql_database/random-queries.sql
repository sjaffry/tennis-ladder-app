delete from debug_table;

select * from debug_table;

select * from player_league order by league_id;

alter table singles_match add ( player1_confirmed VARCHAR(255), player2_confirmed VARCHAR(255));

alter table singles_match drop column confirmed_by;

select * from player;

select * from league;


update league set league_type = "doubles" where league_id=2;

select * from player_league where league_id = 1;

select * from singles_ladder;

update player set email = "syejaffr@amazon.com" where player_id = 4;

update singles_match set entered_by = "robot" where match_id=2;

update singles_match set player1_confirmed = null where match_id=10;

select * from singles_match where league_id=1;

delete from singles_match where league_id=2;

delete from singles_ladder where league_id = 2;

select email from player p where player_id in (3,2);

CALL `tennis_ladder`.`UpdateMatchScoreAndLadder`('2024-01-01', 2, 1, 4, 'sajaffry@gmail.com', 'annieraza@gmail.com', 6,1,6,2,1,0);

CALL `tennis_ladder`.`UpdateMatchScoreAndLadderRobot`('2024-01-01', 'mens 3.0', 'Syed', 'Jaffry', 'Charlie', 'Trishner', 6,1,6,2,1,0);

CALL `tennis_ladder`.`ConfirmSinglesScoreAndUpdateLadder`(1,2,'sajaffry@gmail.com',1,3,1);

INSERT INTO `tennis_ladder`.`league`
(`league_id`,
`league_name`,
`end_date`,
`business_name`,
`category`,
`league_type`)
VALUES
(null,
'mens 3.5 flex league OCT-DEC',
'2025-03-31 12:00:00',
'FTSC',
'Tennis',
'singles'
)
ON DUPLICATE KEY UPDATE
	league_name = 'mens 3.0 flex league JAN-MAR',
    end_date = '2025-03-31 12:00:00',
    business_name = 'FTSC';

select * from league;
---------------------------
-- DOUBLES

select * from doubles_match;
    
    select * from doubles_team;
    
    select * from team_league;
    
    select * from doubles_ladder;
    
    delete from doubles_ladder;
    
    CALL `tennis_ladder`.`UpdateDoublesMatchScoreAndLadderRobot`('2024-01-01', 'FTSC', 'mix doubles', 'Syed', 'Jaffry', 'Saira', 'Jaffry', 'John', 'Jackson', 'Jill', 'Jackson', 6,1,6,2,1,0);
    
    CALL `tennis_ladder`.`ConfirmDoublesScoreAndUpdateLadder`(1, 2, 'sajaffry@gmail.com',1,2,2);

