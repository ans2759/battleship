<?php
   $gameId = filter_var($_GET['gameId'], FILTER_SANITIZE_STRING);
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Battleship</title>
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" />
    <link rel="stylesheet" href="css/styles.css" />
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
        #yt {
            display: none;
        }

    </style>
    <!-- ******************* NEW ******************* -->
    <script src="https://code.jquery.com/jquery-2.1.4.min.js"></script>
    <script src="js/ajaxFunctions.js" type="text/javascript"></script>
    <script src="js/Cell.js" type="text/javascript"></script>
    <script src="js/Piece.js" type="text/javascript"></script>
    <script src="js/gameFunctions.js" type="text/javascript"></script>
    <script>

        var gameId = "<?= $gameId ?>";
        var svgns="http://www.w3.org/2000/svg";

        $(document).ready(function() {
            checkTurnAjax(-1);
            $("#sendChat").click(function() {
                sendChatAjax($("#chatText").val(), gameId);
            });
        });
    </script>
</head>
<body onload="start()">
<div style="position:absolute;left:50px;top:50px;">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="650px" height="700px" id="svgBoard">

    <!-- Make the background, some new here!-->
    <rect x="0px" y="0px" width="100%" height="100%" id="background" />

    <g id="finalize">
        <rect x="150px" y="610px" height="50px" width="120px" fill="red" stroke="blue" stroke-width="3" rx="20" ry="20"></rect>
        <text class="bText" x="157px" y="640px" fill="blue">Finalize Ships</text>
    </g>

    <g id="fire">
        <circle cx="175px" cy="640px" r="25" fill="red" stroke="black" stroke-width="1" ></circle>
        <text x="158px" y="645px" fill="black">FIRE</text>
    </g>


</svg>

</div>
<div class="container">
    <div class="row">
        <div class="col-md-4" style="float: right; margin-top:50px;">
            <div id="status"></div>
            <div id="nyt" class="panel panel-danger">
                <div class="panel-heading">Not Your Turn</div>
            </div>
            <div id="yt" class="panel panel-success">
                <div class="panel-heading">Your Turn</div>
            </div>
            <div id="gameInfo">
                <table class="table table-condensed table-bordered table-striped">
                    <tr class="info"><td>Your Ships:</td><td id="your_ships"></td></tr>
                    <tr class="warning"><td>Opponent Ships:</td><td id="opp_ships"></td></tr>
                    <tr><td>Previous Shots: </td><td id="prev_shots"></td></tr>
                    <tr class="danger"><td>Firing at: </td><td id="targeting"></td></tr>
                </table>
            </div>
            <div class="panel panel-info" style="max-height:510px;">
                <div class="panel-heading">
                    In-Game Chat
                </div>
                <div class="panel-body" id="chat_cont">
                    <ul class="media-list" id="chat_body">
                        <!--messages dynamically added here-->
                    </ul>
                </div>
                <div class="panel-footer">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Enter Message" name="chatText" id="chatText" />
                        <span class="input-group-btn">
                            <button class="btn btn-info" type="button" name="sendChat" id="sendChat">SEND</button>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="modal fade" id="myModal" tabindex="-1" role="dialog" aria-labelledby="myModalLabel">
    <div class="modal-dialog" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="location.href = './room.html'"><span aria-hidden="true">&times;</span></button>
                <h4 class="modal-title" id="myModalLabel"></h4>
            </div>
            <div class="modal-footer ">
                <p class="success">Close to return the the lobby to challenge someone else</p>
                <button type="button" class="btn btn-default btn-lg" data-dismiss="modal" onclick="location.href = './room.html'">Lobby</button>
            </div>
        </div>
    </div>
</div>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/js/bootstrap.min.js" integrity="sha384-0mSbJDEHialfmuBBQP6A4Qrprq5OVfW37PRR3j5ELqxss1yVqOtnepnHVP9aJ7xS" crossorigin="anonymous"></script>
</body>
</html>