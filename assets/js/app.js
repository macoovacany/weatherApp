API_KEY_WEATHER = 'b57a086ab34710904001fa7b284f833c'
// weatherURL = 'https://openweathermap.org/api';

const k2c_temp = (k) => Math.round(k - 273.15);
const mps2kts = (mps) => Math.round(mps * 1.94384);
const dt2date = function (dt) {
    let d = new Date(dt * 1000)
    return d.toLocaleString().split(',')[0]
}

const uvClass = (uvi) => {
    if (uvi < 2) {
        return 'uv-low';
    } else if (uvi < 5) {
        return 'uv-mod';
    } else if (uvi < 7) {
        return 'uv-high';
    } else if (uvi < 10) {
        return 'uv-very-high';
    } else {
        return 'uv-extreme';
    }
}



// *****************************************************************************
// search results handling
// *****************************************************************************

// references to the HTML DOM items
document.querySelector("#city-search-form").addEventListener('submit', (event) => {
    event.preventDefault();
    let city = document.querySelector("#search-for-city-input").value;
    searchForCity(city);
}
)

// Add searched city to local storage
function searchForCity(city) {
    fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=${API_KEY_WEATHER}`)
        .then(response => response.json())
        .then(arrData => {
            // data is an array because multiple values returned
            // assumme the first is correct 
            data = arrData[0];
            // the city input may be any case: 'aDeLaIdE'
            // but the results  data.name value 
            // from the api call will be ok :  "Adelaide"
            //  so we use the data.name value as the canonical value
            let storedCityData = JSON.parse(localStorage.getItem('weatherApp'));
            cities = Object.keys(storedCityData);
            // update the local storage data if it's not already there
            if (!cities.includes(data.name)) {
                storedCityData[data.name] = data;
                localStorage.setItem('weatherApp', JSON.stringify(storedCityData));
                // update the list of cities for the update to the search results
                cities.push(data.name)
                cities.sort()
            }
            updateSearchResultsList(cities);
        })
}


const updateSearchResultsList = (cities) => {            //  now update the DOM
    let searchResultsList = document.querySelector('#search-results');
    // clear the results and reload
    searchResultsList.innerHTML = '';

    cities.sort().forEach(city => {
        let li = document.createElement('li');
        let liText = document.createTextNode(city);
        li.appendChild(liText);
        searchResultsList.appendChild(li);
    })
}



// ***********************************************************
// update weather results
// ***********************************************************
const updateWeatherReport = (city) => {
    const cityElement = document.querySelector('#city-weather');


    // convert city name into lat / long from local storage
    let storedCityData = JSON.parse(localStorage.getItem('weatherApp'));
    let { lat, lon } = storedCityData[city]



    // window.fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=appid=${API_KEY_WEATHER}`)
    window.fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${API_KEY_WEATHER}`)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            cityElement.innerHTML = cityWeatherTemplate(city, data);
        })
}


// ***********************************************************
// html templates
// ***********************************************************
const fiveDayForecastTemplate = function (date, icon, temp, humidity) {
    return `<p class="date">${date}</p>
<p class="icon"><i class="wi ${icon}"></i></p>
<p class="temp">Temperature: ${temp} °C</p>
<p class="humidity">humidity: ${humidity}</p>`;
}


const cityWeatherTemplate = (cityname, data) => {
    const date = dt2date(data.current.dt);



    return `                    <h3>${cityname} (${date})</h3>
<p><div class='grid grid-cols-3 gap-4'> <div> Temperature </div> <div class='col-span-2'>${k2c_temp(data.current.temp)}°C </div> </div></p>
<p><div class='grid grid-cols-3 gap-4'> <div> Humidity </div><div class='col-span-2'>${data.current.humidity}%  </div> </div></p>
<p><div class='grid grid-cols-3 gap-4'> <div> Wind speed </div> <div class='col-span-2'>${mps2kts(data.current.wind_speed)} kts  </div> </div></p>
<p><div class='grid grid-cols-3 gap-4'> <div> UV-index </div> <div class='col-span-2'><div class='${uvClass(data.current.uvi)}'>${data.current.uvi} </div> </div> </div></p>
`
}






const upDateFiveDayForecast = (city) => {
    for (let index = 1; index <= 5; index++) {
        const element = document.querySelector(`#today-plus-${index}`);
        element.innerHTML = fiveDayForecastTemplate(`8/${10 + index}/2019`, 'wi-day-sunny', '86.54°F', `${40 + index * 2}%`);
    }
}








document.addEventListener("DOMContentLoaded", (e) => {
    e.preventDefault();
    if (!localStorage.getItem('weatherApp')) {
        localStorage.setItem('weatherApp', '{}')
    } else {
        let storedCityData = JSON.parse(localStorage.getItem('weatherApp'));
        cities = Object.keys(storedCityData);
        updateSearchResultsList(cities)
    }
});




