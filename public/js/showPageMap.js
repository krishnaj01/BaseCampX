mapboxgl.accessToken = mapBoxToken;
const map = new mapboxgl.Map({
    container: 'showPage-map',
    style: 'mapbox://styles/mapbox/streets-v11',
    // projection: 'globe', // Display the map as a globe, since satellite-v9 defaults to Mercator
    zoom: 10,
    center: campground.geometry.coordinates
});

map.addControl(new mapboxgl.NavigationControl());

const marker = new mapboxgl.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25})
        .setHTML(
            `<h5>${campground.title}</h5><p>${campground.location}</p>`
        )
    )
    .addTo(map);