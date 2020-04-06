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
 * 		@note data is global object
 */
const overLay = (key) => {
	 let businessObj = bData[key];
	 let images = document.getElementById("image-column")
	 let newHtml = "";
	 for (const ilink of businessObj.images) {
		 newHtml += '<img src="'  + ilink + '">';
	 }
	 images.innerHTML = newHtml; // puts retrieved images in overlay
	 
	 document.getElementById("businesslogo").innerHTML = '<h1>' + businessObj.DTA_data.properties.point_name + '</h1>'
	 // ^ puts correct business name on overlay page
	 let linkCol = document.getElementById("link-column");
	 newHtml = "";
	 if (typeof businessObj.DTA_data.properties['website'] !== 'undefined')
		newHtml += '<a href="' + businessObj.DTA_data.properties['website'] + '"><h3>Website</h3>' + businessObj.DTA_data.properties['website'] + '</a>';
	 if (typeof businessObj.DTA_data.properties['telephone'] !== 'undefined')
		newHtml += '<h3>Phone Number</h3>' + businessObj.DTA_data.properties['telephone'];
	 if (typeof businessObj.online_order_link !== 'undefined')
		newHtml += '<a href="' + businessObj.online_order_link + '"><h3>Order Online Here</h3></a>' ;
	 if (typeof businessObj.gift_card_link!== 'undefined')
		newHtml += '<a href="' + businessObj.gift_card_link + '"><h3>Purchase Gift Cards Here</h3></a>';
	linkCol.innerHTML = newHtml; // puts data in side column

}

