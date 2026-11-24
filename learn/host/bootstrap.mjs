import('./integration.mjs').catch(error=>{
  document.getElementById('host-loading').hidden=true;
  const status=document.getElementById('host-error');
  status.hidden=false;status.textContent=`Editor could not be loaded: ${error.message} Reload the page to try again.`;
  document.getElementById('download-bundle').disabled=true;
});
