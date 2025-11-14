$(document).ready(function(){
  $("button").click(function(){
    $("div").animate({  
      left: '150px',
      height: '150px',
      width: '250px',
      opacity: '0.5',
      backgroundColor: 'blue'
    }, 1000)
    .animate({
      left: '0px',
      height: '100px',
      width: '200px',
      opacity: '1',
      backgroundColor: 'green'
    }, 1000);
  });
});
