console.log('page load@: '+new Date());

var topLimit = null;
var marginHeight = 22;
var tempCount = 0;
var dataArray = [];
var newData = [];
var allData = [];
var scrollUpDistance = 0;
var animationInprogress = false;
var $comment = null;
var isNeedScroll = false;
var firstMessageId = null;
var templates = null;

Array.prototype.indexOfN = function(o){
  for(var i=0;i<this.length;i++){
    if(this[i][o.name] == o.value){return i;}
  }
  return -1;
}
Array.prototype.lastIndexOfN = function(o){
  for(var i=this.length-1;i>=0;i--){
    if(this[i][o.name] == o.value){return i;}
  }
  return -1;
}

$(function(){
  // $.get('template.tmpl.html', function(templates) {
  //   $('body').append(templates);
  // });

  topLimit = $('ul').position().top+$('ul').height();
  $comment = $('#commentsList');

  templates = doT.template($('#messageT').html());
  myTimer=setInterval(checkNewData,1000);
  $comment.mouseover(function(){
    clearInterval(myTimer);
  });
  
  $comment.mouseout(function(){
    myTimer=setInterval(checkNewData,1000);
  });
});


function clearStatus(curr){
  setTimeout(function(){
    clearStatusIn(curr)},2000);
}  
function clearStatusIn(curr){
  var $curr = $(curr);
  if(!$curr.hasClass('active')){return;}
  $curr.removeClass('active');
}
function showNewMessageWithAnimation(data){
  
  data.top = data.curr.attr('data-top');
  data.left = data.curr.attr('data-left');
  data.curr.animate({
    top: data.top,
    left: data.left
  },500,function(){
    console.log('data animation end');
    animationInprogress = false;
    data.temp = allData.shift();
    data.temp.isNew = false;
    allData.push(data.temp);
    dataArray.push(data.temp);
    clearStatus(data.curr);
    console.log('allData length:'+allData.length+'<--> current lis:'+$('#commentsList>li').length);
  })
  
}

function scrollUp(data,cb){
  if($('#commentsList>li').length == 1){cb(data);return;}
  $('#commentsList>li').animate(
    {move:-(data.curr.height()+marginHeight)},
    {
      step: function(now,fx) {
        $(this).css('transform','translate(0px,'+now+'px)');  
      },
      duration:'500'
    },
    'linear'
    );
  console.log('scrollUp success');
  setTimeout(function(){
        //if(cb){cb(data);}
        removeLi(data,cb);
      },500);
  
}


function removeLi(data,cb){
  $('#commentsList>li').each(function(){
    if($(this).position().top+$(this).height()<=0){
      $(this).attr('del','1');
      var ID = $(this).attr('id').slice(2);
      var IDD = 0;
      dataArray.filter(function(item,key){
        if(item.dataMessageid == ID){IDD = key;return;}
      });
      dataArray.splice(IDD,1);
    }else{
      $(this).css('top',$(this).position().top+"px");
      $(this).css('transform','');
    }
    
  });
  console.log('hidden li removed:'+$('[del=1]').length);
    //refreshView();
    $('[del=1]').remove();
    
    if(cb){cb(data);}
  }

  function compare(o1,o2){
    if(o1.dataMessageid <= o2.dataMessageid){return -1;}
    return 1;
  }


  function getNewData(data) {
    tempCount++;

    if (data instanceof Array) {
      allData.sort(compare);
      if (allData.length + newData.length == 0) {
        firstMessageId = data[0].dataMessageid;
      }
      data.forEach(function(item, index, array){
        item.isNew = true;
        item.currDateStr = "";
        item.messageid = allData.length+newData.length+1;

      })
      newData = newData.concat(data);
    }else{

      
    //console.log('get new message->'+data.name+':'+data.message);
    data.currDate = new Date();

    if (allData.length + newData.length == 0) {
      firstMessageId = data.dataMessageid;
    }

    data.currH = data.currDate.getHours();
    data.currM = data.currDate.getMinutes();
    data.currS = data.currDate.getSeconds();
    data.currDateStr = (data.currH < 10 ? "0" + data.currH : data.currH) + ":" + (data.currM < 10 ? "0" + data.currM : data.currM) + ":" + (data.currS < 10 ? "0" + data.currS : data.currS);
    data.topLimit = topLimit;
    data.dataMessageid = tempCount;
    data.message += tempCount;
    data.isNew = true;
    newData.push(data);
  }
  addData();
}

/**
 * [addData]
 * insert new data to next item and display immediately
 * remove this new data from newData array.
 */
 function addData(){
  if(animationInprogress){return;}
  var data = newData[0];
  
  data.isNew = true;
  data.isDisplay = false;
  data.i = allData.lastIndexOfN({name:'isNew',value:true});
  data.left = 0;

  data.translateSide = (Math.random()<0.5?-1000:1000);
  data.html = templates(data);
  $comment.append(data.html);
  data.curr = $('#li'+data.dataMessageid);

  data.top = $('#commentsList').height() - data.curr.height();
  $('#li'+data.dataMessageid).attr('data-top',data.top);
  
  allData.splice(data.i+1,0,data);

  newData.shift();

  scrollUp(data,showNewMessageWithAnimation);
    //showNewMessageWithAnimation();
    animationInprogress = true;
    console.log('new data start animation');
  }

/**
 * [scrollData]:
 * scroll message based on current old data
 *
 * if next item to show is first message, we need sort first to make all message display base on time line
 * 
 * @return {[type]} [description]
 */
 function scrollData(){
  if(animationInprogress){return;}
  var data = allData[0];
  if(data.dataMessageid == firstMessageId){
    allData.sort(compare);
    console.log('all data sorted');
  }

  data.isDisplay = false;

    data.left = 0;
    data.html = templates(data);
    if($('#li'+data.dataMessageid).length != 0){$('#li'+data.dataMessageid).remove();}
    $comment.append(data.html);

    data.curr = $('#li'+data.dataMessageid);

    // data.top = $('#commentsList').height() - data.curr.height();
    $('#li'+data.dataMessageid).attr('data-top',data.top);

    //allData.shift();
    //allData.push(data);
    animationInprogress = true;

    scrollUp(data,showNewMessageWithAnimation);    
    console.log('old data start animation');
  }

 function checkNewData(){
  if(animationInprogress){return;}
  if(newData.length > 0){addData();}
  else if(checkIfNeedScroll()){
    console.log('need scroll to display old data');
    scrollData();
  }
}

function checkIfNeedScroll(){
  var i=0;
  $('#commentsList>li').each(function(){
    if($(this).position().top >= 0 && $(this).position().top+$(this).height() <= $('#commentsList').height()){
      i++;
    }
  });
  if(i < allData.length){
    var temp = $('#commentsList li:last-child');
    if(temp.position().top + 2*(temp.height()+marginHeight) > $('#commentsList').height()){return true;}
    return false;
  }
  return false;
}

function removeData(data) {
  var i = allData.indexOfN({
    name: 'messageid',
    value: data.messageid
  });
  if (i == -1) {
    return;
  }
  allData.splice(i, 1);
}

function autoTestAdd(num){
  num = (num?num:10);
  for(var i=0;i<num;i++){
    getNewData({"message":"测试数据测试数据测试数据","imgUrl":"http://img1.imgtn.bdimg.com/it/u=1603548911,2310384524&fm=21&gp=0.jpg","name":"小萝莉","messageid":+(i+1)});
  }
}

function autoTestRemove(messageid){
  messageid = (messageid?messageid:allData[allData.length-1].messageid);
  var i = allData.indexOfN({name:'messageid',value:messageid});
  removeData(allData[i]);
}