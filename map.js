//controller - allows for returning from store view
let ViewController = {
  PreviousCoords: {
    lat: 0,
    lng: 0
  },
  addPrevious: function(lat, lng){
    this.PreviousCoords.lat = lat
    this.PreviousCoords.lng = lng
  },
  getPrevious: function(){
    return { lat: this.PreviousCoords.lat, lng: this.PreviousCoords.lng }
  }
}

let BusinessObj = {}
let CurrentMarker = {}

// Initial Fetch of Business Data http://ec2-54-202-236-40.us-west-2.compute.amazonaws.com
const fetchData = async () => {
  return await fetch('https://ec2-54-202-236-40.us-west-2.compute.amazonaws.com', {
    mode: 'cors',
    headers: {
      'Access-Control-Allow-Origin':'*'
    }
  })
  .then(response => response.json())
  .then(data => {
    //console.log(data)
    return data
  })
  .catch(function() {
        console.log("main data fetch error");
  });
}

//overlay controls
const openOverlay = () => {
  let target = document.getElementById("overlay")
  target.style.display = "block"
}

const closeOverlay = () => {
  let prevCoords = ViewController.getPrevious()
  let goto = new google.maps.LatLng(prevCoords.lat, prevCoords.lng)
  document.getElementById("overlay").style.display = "none"
}

const seeMore = (key) => {
  //ViewController.addPrevious(lat, lng);
  goHere()
  //populate with business info
  overLay(key)
  openOverlay()
}

const goHere = async () => {
  const lng = CurrentMarker.position.lng()
  const lat = CurrentMarker.position.lat()
  const roadCoords = await getRoadCoords(lat,lng)
  console.log('go here', lng, lat, roadCoords)
  let goto = new google.maps.LatLng(roadCoords.latitude, roadCoords.longitude)
  panorama.setPosition(goto)
}

const goInside = () => {
  console.log('go inside')
  const lng = CurrentMarker.position.lng()
  const lat = CurrentMarker.position.lat()
  //const roadCoords = getRoadCoords(lat,lng)
  let goto = new google.maps.LatLng(lat, lng)
  panorama.setPosition(goto)
}

// Gets Coordinates of road from nearest lat, lng using roads api
const getRoadCoords = async (lat, lng) => {
  return await fetch('https://roads.googleapis.com/v1/nearestRoads?points=' + lat + ',' + lng + '&key=AIzaSyDVjNL6rNtWlbUFymUbRb3KFRvMDTkIC-k')
  .then((response) => {
    return response.json()
  })
  .then((data)=>{
    //console.log('dat data', data)
    return data.snappedPoints[0].location
  })
}

// Info Window Addon Controller
const addInfoWindow = (marker, businessObj, isPanoramic, key) => {

  Object.assign(BusinessObj, businessObj)

  let content = ''
  // added body content below 4/6/20 kg
  let bcontent = 'More coming soon'
  if(isPanoramic == true ){
	if (typeof businessObj.DTA_data.properties['covid-narrative'] !== 'undefined') {
		bcontent = businessObj.DTA_data.properties['covid-narrative']
	}
    content = '<div id="panocontent">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<h1 id="firstHeading" class="firstHeading">' + businessObj.DTA_data.properties.point_name + '</h1>'+
        '<div id="bodyContent">'+
        '<p><b>' + bcontent + '</b>'+
        '</div>'+
      ' <input id="seemore" type="button" value="See More" onclick="seeMore('
			+ key + ')"></input>'+
      ' <input id="comeinside" type="button" value="Go Inside" onclick="goInside()"></input>'+
        '</div>'
    }

  if(isPanoramic == false){
      content = '<div id="mapcontent">'+
          '<div id="siteNotice">'+
          '</div>'+
          '<div id="firstHeading" class="firstHeading">' + businessObj.DTA_data.properties.point_name + '</div>'+
          '</div>'
    }

    let infoWindow = new google.maps.InfoWindow({
        content: content
    })
    if(isPanoramic == true){
      marker.addListener('click', function () {
        Object.assign(CurrentMarker, marker)
        infoWindow.open(map, marker)
      })
    }
    if(isPanoramic == false){
      marker.addListener('mouseover', function () {
        infoWindow.open(map, marker)
      })
      marker.addListener('mouseout', function () {
        infoWindow.close(map, marker)
      })
      marker.addListener('click', function () {
        Object.assign(CurrentMarker, marker)
        goHere()
      })
    }

}

var bData = {}; // global object to hold the returned data

/******************
Google Maps Init
*******************/
async function initialize() {

  // fetch business data
  const data = await fetchData()
  bData = data; // here's where it's stored

  //set map
  //starting coordinates
  let startPacific = {lat: 36.976725, lng: -122.0269576}

window.map = new google.maps.Map(document.getElementById('map'), {
    center: startPacific,
    zoom: 18,
    visible: true
  })

  // set panorama
window.panorama = new google.maps.StreetViewPanorama(
      document.getElementById('pano'), {
        position: startPacific,
        mode : 'webgl',
        pov: {
          heading: 170,
          pitch: 8
        },
        visible: true,
        motionTracking: false,
        motionTrackingControl: false,
        zoom: 1
  })

  for (var key in data){

    let dot = ''
    if(data[key].type == 'dining'){
      dot = '/images/reddot.png'
    }
    if(data[key].type == 'retail'){
      dot = '/images/greendot.png'
    }
    if(data[key].type == 'play'){
      dot = '/images/bluedot.png'
    }

    let image = {
      url: dot,
      size: new google.maps.Size(40, 40),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(0, 32)
    }

    let shape = {
      coords: [1, 1, 1, 20, 18, 20, 18, 1],
      type: 'poly'
    }

    let cords = data[key].DTA_data.geometry.coordinates
    let name = data[key].DTA_data.properties.point_name

    let mapMarkers = new google.maps.Marker({
      position: new google.maps.LatLng(cords[1],cords[0]),
      map: window.map,
      icon: image,
      shape: shape,
      title: name
    })

    let panoMarker = new google.maps.Marker({
       position: new google.maps.LatLng(cords[1],cords[0]),
       map: window.panorama,
       icon: image,
       shape: shape,
       title: name
    })

	// added key argument so "seeMore" can populate popup 4/6/20 kg
    addInfoWindow(panoMarker, data[key], true, key)
    addInfoWindow(mapMarkers, data[key], false, key)

    window.map.setOptions({draggable: false})

  }

  // Event Listeners

  //keeps map center on pegman as moving in street view
  google.maps.event.addListener(panorama, 'position_changed', function() {
    const position = window.panorama.getPosition()
    const center = new google.maps.LatLng(position.lat(), position.lng())
    window.map.panTo(center)
  })

  //
  document.getElementById("closebutton").addEventListener('click', function(){
    closeOverlay()
  })

  await window.map.setStreetView(window.panorama)

}
