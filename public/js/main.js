$(document).ready(function(){
  $('.delete-user').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('dataId');
    $.ajax({
      type: 'DELETE',
      url: '/user/' + id,
      success: function(response){
        alert('Deleting User'),
        window.location.href='/all_users'
      },
      error: function(err){
        console.log(err);
      }
    });
  });
});
