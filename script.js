function onClickHandler(){
	var api;
	//communicating with DroneDeploy using api.
	new DroneDeploy({ version: 1})
        .then(function(dronedeployApi) {
		  //console.log('DroneDeploy Api: ', dronedeployApi);
		  api = dronedeployApi;
		  //return the plan that is currently viewed by user.
          return dronedeployApi.Plans.getCurrentlyViewed()
        })
        .then(function(plan) {
		  //fetch id of that plan
          //console.log("plan : "+plan.id);
		  //return array of link of Tile images based on PlanId
		  return api.Tiles.get({planId: plan.id, layerName: 'ortho', zoom: 16});
        })
		.then(function(tileResponse){
			//console.log("tiles data "+tileResponse.tiles);
			return tileResponse.tiles;
		})
		.then(function(tiles){
			//custom web server
			const webServerUrl = 'https://dronedeploy-app-server-purva.herokuapp.com/getEncodedUrl/';
			  const body = JSON.stringify({
				'tile': tiles
			  });
			  //console.log("body "+body)
			  return fetch(webServerUrl, {
				method: 'POST',
				body: body
			  })
				.then((res) => res.json())
				.then((rjson) => rjson.msg);
		})
		.then(function(encodedTiles){
			const docDefinition = generatePDFcontent(encodedTiles);
			pdfMake.createPdf(docDefinition).open();
		});
}


function generatePDFcontent(list) {
  let content = [{ text: 'PDF generated from DroneDeploy app made by Purva Patel', style: 'header' }];
  const contentStyle = {
    header: {
      fontSize: 16,
      bold: true
    }
  };
  for (let i = 0; i < list.length; i++) {
    content.push({
      image: `data:image/jpeg;base64,${list[i]}`
    });
  }
  return (
  {
    content: content,
    styles: contentStyle
  }
  );
}