// Map
function init() {
  let myMap = new ymaps.Map("ymap", {
    center: [25.195137, 55.278478],
    zoom: 11,
    controls: [],
  });
  myMap.behaviors.disable('scrollZoom');
  myMap.behaviors.disable('drag');
  let coords = [
    [25.201397, 55.269513],
    [25.189938, 55.300089],
    [25.12294, 55.207095],
    [25.098174, 55.161451],
  ];
  
  const myCollection = new ymaps.GeoObjectCollection({}, {
    draggable: false, // and draggable
    iconLayout: 'default#image', //all placemarks are red
    iconImageHref: './img/img-mapmarker.png',
    iconImageSize: [46, 57],
    iconImageOffset: [-35, -52]
  });
  
  for (var i = 0; i < coords.length; i++) {
    myCollection.add(new ymaps.Placemark(coords[i]));
  }
  myMap.geoObjects.add(myCollection);
  
}




ymaps.ready(init);