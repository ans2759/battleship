<?php
    //let's imagine that we are getting p1 and p2 player names from load of doc in session
    $p0='Alex';
    $p1='Lauren';
    $gameId=59;
    $turn=0;
    $playerId = 0;
    $otherPlayerId = 1;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Battleship</title>
    <style type="text/css">
        #background { fill: #aaa; stroke: black; stroke-width: 2px; }
        .player0   {fill: #990000; stroke: white; stroke-width: 1px; cursor:pointer; }
        .player1 {fill: green; stroke: white; stroke-width: 1px; cursor:pointer;}
        .htmlBlock {position:absolute;top:200px;left:300px;width:200px;height:100px;background:#ffc;padding:10px;}
        body{padding:0px;margin:0px;}
        /*New*/
        #svgBoard {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }
        .water { 
            fill:blue;
            stroke:black;
            stroke-width:1px; 
        }
        .shot { 
            fill:white; 
            stroke:black;
            stroke-width:1px;
        }
        .bText {
            font-size: 12pt;
            font-weight: bolder;
        }
        #finalize, #fire{
            display:none;
        }
/*        #messages {
            float: right;
        }*/
        #status, #gameInfo {
            clear: both;
            display: block;
            float: right;
        }
        form {
            float: right;
        }

    </style>
    <!-- ******************* NEW ******************* -->
    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="js/ajaxFunctions.js" type="text/javascript"></script>
    <script src="js/Cell.js" type="text/javascript"></script>
    <script src="js/Piece.js" type="text/javascript"></script>
    <script src="js/gameFunctions.js" type="text/javascript"></script>
    <script>
        //get the name of the player...
        var player0="<?php echo $p0; ?>";
        var player1 = "<?php echo $p1; ?>";
        var gameId = <?php echo $gameId; ?>;
        var playerId = <?php echo $playerId; ?>;
        var turn = <?php echo $turn; ?>;
        var svgns="http://www.w3.org/2000/svg";

        $(document).ready(function() {
            checkTurnAjax(-1);
            $("#sendChat").click(function() {
                sendChatAjax($("#chatText").val(), gameNumber);
            });
        });
    </script>
</head>
<body onload="start()">
<div style="position:absolute;left:50px;top:50px;">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="900px" height="700px" id="svgBoard">
    
    <!-- Make the background, some new here!-->
    <rect x="0px" y="0px" width="100%" height="100%" id="background" />

    <g id="finalize">
        <rect x="650px" y="220px" height="50px" width="110px" fill="red" stroke="blue" stroke-width="3" rx="20" ry="20"></rect>
        <text class="bText" x="657px" y="245px" fill="blue">Finalize Ships</text>
    </g>

    <g id="fire">
        <circle cx="650px" cy="320px" r="25" fill="red" stroke="black" stroke-width="1" ></circle>
        <text x="633px" y="325px" fill="black">FIRE</text>
    </g>


</svg>
<button type="button" id="finalize">Finalize Alignment</button>
</div>
<div id="status"></div>
<form>
    <div id="messages"></div>
    <input id="chatText" type="text" />
    <button type="button" id="sendChat" >SEND MESSAGE</button>
</form>
<div id="gameInfo">
    <table>
        <tr><td>Your Ships:</td><td id="your_ships"></td></tr>
        <tr><td>Opponent Ships:</td><td id="opp_ships"></td></tr>
        <tr><td>Previous Shots: </td><td id="prev_shots"></td></tr>
        <tr><td>Firing at: </td><td id="targeting"></td></tr>
    </table>
</div>
</body>
</html>