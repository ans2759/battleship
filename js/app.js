(function() {
    var app = angular.module('chat', []);

    app.controller('ChatController', function() {
        $http ( {
            method: 'GET',
            url: 'mid.php',
            data: '{method:"getChat",a:"chat"}',
            responseType: 'json'
        }).then(function callbackChat(response){
            var h='';
              for(i=0;i<data.length;i++){
                console.dir(data[i]);
                if(data[i].challenge === null) {
                  h+=data[i].userName+' says: '+data[i].text + '<span style="color:gray"> at time ' +data[i].createdAt+'</span><br/>';
                }
                else {
                  //display challenge
                  h += "<span class='challenge'><strong>" + data[i].username + "</strong> challenges"
                }
              }
              $('#text').html(h);
              setTimeout('getChat()',2000);
        });
    });

})();