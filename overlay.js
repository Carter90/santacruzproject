/*
 * Please see the included README.md file for license terms and conditions.
 */
/** @file overlay.js
 *      Purpose:  creates overlay for businesses
 *
 * @author Keith Gudger
 */
 
/**
 *      function to populate overlay with correct business data
 *      @param key is key into data structure
 * 		@note bData is global object
 */
const overLay = (key) => {
	 let businessObj = bData[key];
	 let images = document.getElementById("image-column")
	 let newHtml = "";

	 document.getElementById("businesslogo").innerHTML = '<div id="logo-inner-box""><h1>' + 
					businessObj.DTA_data.properties.point_name + '</h1></div>'
	 // ^ puts correct business name on overlay page

	 if (Boolean(businessObj.images[0])) { // override text if image[0] exists
		 document.getElementById("businesslogo").innerHTML = 
			'<div id="logo-inner-box"><img src="' + businessObj.images[0] + 
				'"></div>'
	 } 
	 	 
	 for(let i = 1; i < businessObj.images.length; i++) {
	 	 newHtml += '<img src="'  + businessObj.images[i] + '">';
	 } // ignore image 0 as it's the logo (if it exists)
	 images.innerHTML = newHtml; // puts retrieved images in overlay
	 
	 let linkCol = document.getElementById("link-column");
	 newHtml = "";
	 if (Boolean(businessObj.DTA_data.properties.point_name))
		newHtml += '<h1>' + businessObj.DTA_data.properties.point_name + '</h1>';
	 if (Boolean(businessObj.DTA_data.properties['telephone']))
		newHtml += '<h2>' + businessObj.DTA_data.properties['telephone'] + '</h2>';
	 if (Boolean(businessObj.DTA_data.properties['covid-narrative']))
		newHtml += '<h2>' + businessObj.DTA_data.properties['covid-narrative'] + '</h2>';
	 if (Boolean(businessObj.content['subheader1']))
		newHtml += '<h2>' + businessObj.content['subheader1'] + '</h2>';
	 if (Boolean(businessObj.DTA_data.properties['website'])) {
		newHtml += '<a href="' + 
						businessObj.DTA_data.properties['website'] + 
						'"><img src="images/homelink.board.png"></a>';
	 }
/*	 if (Boolean(businessObj.group['group_nested_label']))
		newHtml += '<h2>' + businessObj.group['group_nested_label'] + '</h2>';*/
	 if (Boolean(businessObj.gift_card_link)) {
		newHtml += '<a href="' + 
						businessObj.gift_card_link + 
						'"><img src="images/giftlink.board.png"></a>';
	 }
	 if (Boolean(businessObj.online_order_link)) {
		newHtml += '<a href="' + businessObj.online_order_link + 
						'"><img src="images/shop.board.png"></a>';
	 }
	linkCol.innerHTML = newHtml; // puts data in side column

}

/**
 *      function to search business data for business name
 *      @param sTerm is search term to look for in data structure
 * 		@note bData is global object
 */
const searchTerm = (sTerm) => {
	let businessObj = bData;

	const options2 = {
	  limit: 10, // don't return more results than you need!
	  threshold: -10000, // don't return bad results

	  keys: ['value.DTA_data.properties.point_name',
			'value.content.header',
			'value.group.group_nested_label',
			'value.group.group_label',
			'value.DTA_data.properties.covid-narrative']
	}
	const result2 = fuzzysort.go(sTerm,listOfObjects,options2);
	
	if ( result2['total'] != 0 ) {
	var newHtml = "<ul>" ;
	for (var rkey in result2) {
	  if (rkey != "total") { // there's one final rkey that's not data
		let rscore = result2[rkey]['score'] ;
		console.log("Score " + rkey + " = " + rscore + " " + 
			businessObj[result2[rkey]['obj']['key']].DTA_data.properties.point_name);
		if ( rscore > -1000) { // good result
			let bkey = result2[rkey]['obj']['key'] ;
			let sString = businessObj[bkey].DTA_data.properties.point_name;
			newHtml += '<li><a href="' + 'javascript:thenGoHere(' + result2[rkey]['obj']['key'] +
			')">' + sString + "</a></li>" ;
		}
	  }
	}			
	newHtml += "</ul>";
	} else {
		var newHtml = "No Results Found";
	}
	document.getElementById("searchResults").innerHTML = newHtml;
}

/**
 *      function to go to the business lat and lon
 *      @param key index in data structure
 */
const thenGoHere = (key) => {
//	CurrentMarker.position = undefined ;
	// need to do this to force move to searched business
	seeMore(key,true);
}
