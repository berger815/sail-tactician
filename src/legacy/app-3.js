document.addEventListener('DOMContentLoaded',function(){
  try{
    const d=document.getElementById('recRaceDate');
    if(d && !d.value){
      const now=new Date();
      const local=new Date(now.getTime()-now.getTimezoneOffset()*60000);
      d.value=local.toISOString().slice(0,10);
    }
    const t=document.getElementById('recWarningTime');
    if(t && !t.value)t.value='13:00';
  }catch(e){}
});
