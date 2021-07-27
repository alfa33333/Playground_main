   
    var width=100;
    var difference=10;
    var intervalID=0;
    var blockclick=0;
    var parentwidth = 100;
    var clicktext = document.getElementById("Click-tag");

   function get_parendW(elem){
        var parentElem = document.getElementById(elem).parentElement;
        if(!parentElem){
            parentElem = document.getElementById(elem).parentNode;
        }
        parentwidth = parentElem.clientWidth
        console.log(parentwidth);
   }

   function expand(clicked_id){
       width = document.getElementById(clicked_id).width
       get_parendW(clicked_id);
       console.log(blockclick);
    if (blockclick==0){
        increase(clicked_id); 
    }
    else{
        console.log(document.getElementById(clicked_id).parentNode.id)
        decrease(clicked_id);
    }
   }

    function increase(clicked_id)
    {
        clearInterval(intervalID);
        // var clicktext = document.getElementById("Click-tag");
        clicktext.style.display = "none";
        intervalID=setInterval(zoomIn, 20, clicked_id);
    }
    function decrease(clicked_id)
    {
        clearInterval(intervalID);
        intervalID=setInterval(shrink, 10, clicked_id);
        
    }

    function zoomIn(clicked_id)
    {
        var currentWidth = document.getElementById(clicked_id).clientWidth;
        var  viewportWidth = window.innerWidth;
        console.log(viewportWidth, 'viewport');
        if ( currentWidth < viewportWidth && currentWidth < 600) 
        {
            width = currentWidth + difference;
            if ( width > viewportWidth)
                {
                    width = viewportWidth;
                }
            document.getElementById(clicked_id).style.width = width + "px";
            console.log(width, 'hi2'); 
        }
        else
        {
            clearInterval(intervalID);
            blockclick=1;           
            var text = document.getElementById("text")
            if (blockclick=1 && currentWidth){
                     text.style.display = "block";
            }
        }


    }

    function shrink(clicked_id)
		{
            var text = document.getElementById("text")
            text.style.display = "none";
			if(width > 0)
			{
  				width = width-difference;
                if (width < 0)
                  {
                      width = 0;
                  }
				document.getElementById(clicked_id).style.width=width+"px";
				console.log(width);
			}
			else
			{
				clearInterval(intervalID);
                blockclick=0;
                clicktext.style.display = "block";
                
			}
            console.log(parentwidth, 'shrink')
			console.log(width-parentwidth);
		}
