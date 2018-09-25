$(function(){
  var socket = io();
  socket.on('user count',(data)=>{
    console.log('当前用户数:'+data);
  });
  socket.on('user',(data)=>{
    $('#num-users').text(data.currentUsers+' users online');
    var message = data.name;
    if(data.connected) {
      message += ' has joined the chat.';
    } else {
      message += ' has left the chat.';
    }
    socket.emit('userInOut',message);
    $('#messages').append($('<li>').html('<b>'+ message +'<\/b>'));
  });
  socket.on('chat message',(data)=>{
    var name = data.name;
    var message = data.message;
    $('#messages').append($('<li>').html('<b>'+name+':<\/b>'+message));
  });
  socket.on('userInOut',(data)=>{
    alert(data);
  });
  // Form submittion with new message in field with id 'm'
  $('form').submit(function(){
    var messageToSend = $('#m').val();
    socket.emit('chat message',messageToSend);
    $('#m').val('');
    return false; // prevent form submit from refreshing page
  });    
});
