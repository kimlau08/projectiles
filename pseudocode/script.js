/*
Objects
    1. Game board
        object scoreboard
        object obstacles
        object targets

        method startGame 
            place targest in position
            place obstacles in position
            initialize launchers
            initalize projectiles
        method playGame 
            while the game is not stopped 
                red launcher launch projectile
                if (green launcher is not hit)
                    green launcher launch projectile
                    if (red launcher is not hit)
                continue
    2. lauchers(players)
        object projectile
        method launch
            shoot projectile based on control parameters
    3. projectiles
            object position
    4. obstacles
            object position
    5. targets
            object position
            object status (intact and scores)
    6. positions (x,y,z)
*/