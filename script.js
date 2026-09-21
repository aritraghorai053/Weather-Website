// Search elements
const searchInput = document.querySelector(".search-box input");
const searchButton = document.querySelector(".search-button");

// Location
const LocationName = document.querySelector(".location h1");

// Current weather
const temperature = document.querySelector(".temperature-value");
const weatherCondition = document.querySelector(".weather-condition");

// Other weather details
const humidity = document.querySelector(".humidity-value");
const wind = document.querySelector(".wind-value");

// Error msg
const errorMessage = document.querySelector(".error-message");

// Dynamic weather icon
const weatherIcon = document.querySelector(".weather-icon");

const weatherVideo = document.querySelector("#weather-video");

const currentLocationButton = document.querySelector(".current-location-btn");

// Update current weather
const weatherDate = document.querySelector("#weather-date");
const minTemp = document.querySelector("#min-temp");
const maxTemp = document.querySelector("#max-temp");
const weatherDescription = document.querySelector("#weather-description");
const feelsLike = document.querySelector("#feels-like");

const dailyForecastContainer = document.querySelector(".daily-forecast");

// Hourly forecast elements
const hourlyContainer = document.querySelector(".hourly-container");

// Temperature chart elements
const chartPath = document.querySelector(".chart-path");
const chartArea = document.querySelector(".chart-area");
const chartPoint = document.querySelector(".chart-point");
const chartTimes = document.querySelector(".chart-times");

// Air quality elements
const aqiCircle = document.querySelector(".aqi-circle");
const aqiValue = document.querySelector(".aqi-circle strong");
const aqiStatus = document.querySelector(".aqi-circle span");
const aqiDescription = document.querySelector(".aqi-info p");
const pm25Value = document.querySelector(".pollutants div:nth-child(1) strong");
const pm10Value = document.querySelector(".pollutants div:nth-child(2) strong");
const coValue = document.querySelector(".pollutants div:nth-child(3) strong");
const no2Value = document.querySelector(".pollutants div:nth-child(4) strong");

// Sunrise / sunset elements
const sunriseTimeEl = document.querySelector(".sun-times div:first-child strong");
const sunsetTimeEl = document.querySelector(".sun-times div:last-child strong");
const daylightDurationEl = document.querySelector(".daylight strong");
const sunIcon = document.querySelector(".sun");

// Outdoor activities
const activityCards = document.querySelectorAll(".activity-card");

// Theme toggle elements
const themeButton = document.querySelector(".header-actions .icon-btn[aria-label='Theme']");
const themeIcon = themeButton ? themeButton.querySelector("i") : null;

console.log("weather app javascript connected");

searchButton.addEventListener("click", () => {
    const city = searchInput.value.trim();

    if (city === "") {
        alert("Please enter a city name");
        return;
    }

    // console.log("Searching for: ", city);
    getWeather(city);
});

// For enter key
searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        searchButton.click();
    }
});



// Fetch api

async function getWeather(city) {
    const API_KEY = "a92dc9452c62b23a1bd80881b815667b";
    const API_URL =
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
            errorMessage.textContent = data.message;
            errorMessage.style.display = "block";
            return;
        }

        // Clear previous error
        errorMessage.textContent = "";
        errorMessage.style.display = "none";

        const dayTime = isDayTime(data);
        console.log("is Day: ", dayTime);

        // Api data
        console.log("City:", data.name);
        console.log("Temperature:", data.main.temp);
        console.log("Humidity:", data.main.humidity);
        console.log("Wind:", data.wind.speed);
        console.log("Condition:", data.weather[0].main);
        console.log("Sunrise: ", data.sys.sunrise);
        console.log("Sunset: ", data.sys.sunset);

        // Update html
        LocationName.textContent = data.name;
        temperature.textContent = Math.round(data.main.temp);

        const condition = data.weather[0].main;
        const weatherId = data.weather[0].id;

        // minTemp.textContent  `${Math.round(data.main.temp_min)} °C`;
        // maxTemp.textContent  `${Math.round(data.main.temp_max)} °C`;
        feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)} °C`;
        weatherDescription.textContent = data.weather[0].description;

        console.log("Weather ID:", weatherId);

        weatherCondition.textContent = condition;
        humidity.textContent = `${data.main.humidity}%`;
        wind.textContent = `${data.wind.speed} m/s`;

        updateWeatherIcon(condition, dayTime);
        updateWeatherVideo(condition, weatherId, dayTime);
        getForecast(city, data.timezone);
        updateDate(data.timezone);
        getAirQuality(data.coord.lat, data.coord.lon);
        updateWeatherDetails(data);
        updateSunriseSunset(data);
        updateOutdoorActivities(data);

    } catch (error) {
        errorMessage.textContent =
            "Something went wrong. Please try again.";

        console.log("Network Error:", error);
    }

}

// Get the forecast data
async function getForecast(city, timezoneOffset) {

    const API_KEY = "a92dc9452c62b23a1bd80881b815667b";

    const API_URL =
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    try {

        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
            console.log(data.message);
            return;
        }

        console.log("Forecast data:", data);

        // Today's date
        // const today  new Date().toISOString().split("T")[0];
        const utcTime =
            Date.now() + new Date().getTimezoneOffset() * 60000;

        const cityTime =
            new Date(utcTime + timezoneOffset * 1000);

        const today =
            cityTime.toISOString().split("T")[0];

        console.log("City today: ", today);

        // // get today's forecast
        // const todayForecast  data.list.filter(item > {
        //     return item.dt_txt.startsWith(today);
        // });

        // console.log("Today's forecast:", todayForecast);

        // const temperatures  todayForecast.map(item > {
        //     return item.main.temp;
        // });

        // const todayMin  Math.min(...temperatures);
        // const todayMax  Math.max(...temperatures);

        // console.log("Today's Min: ", todayMin);
        // console.log("Today's Max: ", todayMax);

        // minTemp.textContent  `${Math.round(todayMin)} °C`;
        // maxTemp.textContent  `${Math.round(todayMax)} °C`;

        const dailyForecast = {};

        data.list.forEach(item => {
            const localDate = new Date((item.dt + timezoneOffset) * 1000).toISOString().split("T")[0];

            if (!dailyForecast[localDate]) {
                dailyForecast[localDate] = [];
            }
            dailyForecast[localDate].push(item);
        });

        const dates = Object.keys(dailyForecast);

        // Today's forecast
        const todayData = dailyForecast[dates[0]];
        const todayTemperatures = todayData.map(item => {
            return item.main.temp;
        });

        const todayMin = Math.min(...todayTemperatures);
        const todayMax = Math.max(...todayTemperatures);

        minTemp.textContent = `${Math.round(todayMin)} °C`;
        maxTemp.textContent = `${Math.round(todayMax)} °C`;

        dailyForecastContainer.innerHTML = "";

        let dayIndex = 0;
        for (const date in dailyForecast) {

            const temperatures = dailyForecast[date].map(item => {
                return item.main.temp;
            });

            const min = Math.min(...temperatures);
            const max = Math.max(...temperatures);

            const middleIndex = Math.floor(
                dailyForecast[date].length / 2
            );

            const weatherData =
                dailyForecast[date][middleIndex];

            const condition =
                weatherData.weather[0].main;

            const isDay = weatherData.sys ? weatherData.sys.pod === "d" : true;

            const rainChance =
                Math.round((weatherData.pop || 0) * 100);

            const dayName = getDayName(date, dayIndex);

            const row = document.createElement("div");

            row.classList.add("day-row");

            row.innerHTML = `
                <div class="day-name">
                    <strong>${dayName}</strong>
                    <span>${date.slice(5).replace("-", "/")}</span>
                </div>

                <div class="day-weather">
                    <span>${getWeatherEmoji(condition, isDay)}</span>
                    <small>${condition}</small>
                </div>

                <div class="rain-chance">
                    💧 ${rainChance}%
                </div>

                <div class="temperatures">
                    <span>${Math.round(min)}°</span>
                    <strong>${Math.round(max)}°</strong>
                </div>
            `;
            dailyForecastContainer.appendChild(row);

            console.log(
                dayName,
                date,
                Math.round(min),
                Math.round(max),
                condition,
                rainChance + "%"
            );
            dayIndex++;
        }

        console.log("Daily Forecast: ", dailyForecast);

        // Update hourly forecast and temperature chart
        updateHourlyForecast(data.list, timezoneOffset);
        updateTemperatureChart(data.list, timezoneOffset);

    } catch (error) {

        console.log("Forecast Error:", error);

    }
}

function getDayName(dateString, index) {
    if (index === 0) {
        return "Today";
    }
    if (index === 1) {
        return "Tomorrow";
    }

    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("en-US", {
        weekday: "long"
    });
}

function updateWeatherIcon(condition, dayTime) {
    if (condition === "Clear") {
        if (dayTime) {
            weatherIcon.textContent = "☀️";
        } else {
            weatherIcon.textContent = "🌙";
        }
    }
    else if (condition === "Clouds") {
        weatherIcon.textContent = "☁️";
    }
    else if (condition === "Rain") {
        weatherIcon.textContent = "🌧️";
    }
    else if (condition === "Drizzle") {
        weatherIcon.textContent = "🌦️";
    }
    else if (condition === "Thunderstorm") {
        weatherIcon.textContent = "⛈️";
    }
    else if (condition === "Snow") {
        weatherIcon.textContent = "❄️";
    }
    else if (condition === "Mist" || condition === "Fog") {
        weatherIcon.textContent = "🌫️";
    }
    else {
        weatherIcon.textContent = "☁️";
    }
}


// Detect day and night

function isDayTime(data) {
    const currentTime = Math.floor(Date.now() / 1000);
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;

    return currentTime >= sunrise && currentTime < sunset;
}

// Weather wise video changing
function updateWeatherVideo(condition, weatherId, dayTime) {

    const videoFile =
        getWeatherVideo(condition, weatherId, dayTime);

    console.log("Weather Video:", videoFile);

    weatherVideo.classList.add("fade-out");

    setTimeout(() => {

        weatherVideo.src = `assets/videos/${videoFile}`;

        weatherVideo.load();
        weatherVideo.play();

        weatherVideo.classList.remove("fade-out");

    }, 800);
}

function getWeatherVideo(condition, weatherId, dayTime) {

    if (condition === "Clear") {
        return dayTime
            ? "clear sunny day.mp4"
            : "clear night sky.mp4";
    }

    if (condition === "Clouds") {

        if (weatherId === 801 || weatherId === 802) {
            return dayTime
                ? "partialy cloudy day.mp4"
                : "Cloudy_night_sky.mp4";
        }

        return dayTime
            ? "cloudy weather.mp4"
            : "Cloudy_night_sky.mp4";
    }

    if (condition === "Drizzle") {
        return dayTime
            ? "Heavy_rain_falling.mp4"
            : "rainy night sky.mp4";
    }

    if (condition === "Rain") {
        return dayTime
            ? "Heavy_rain_falling.mp4"
            : "rainy night sky.mp4";
    }

    if (condition === "Thunderstorm") {
        return "Thunderstorm.mp4";
    }

    if (condition === "Snow") {
        return "Snow.mp4";
    }

    if (
        weatherId === 701 ||
        weatherId === 721 ||
        weatherId === 741
    ) {
        return "Mist.mp4";
    }

    return dayTime
        ? "clear sunny day.mp4"
        : "clear night sky.mp4";
}

// Current location

currentLocationButton.addEventListener("click", () => {
    getCurrentLocation();
});

function getCurrentLocation() {

    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    navigator.geolocation.getCurrentPosition(

        (position) => {

            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);

            getWeatherByLocation(latitude, longitude);
        },

        (error) => {
            console.log("Location Error:", error);
        }
    );
}

async function getWeatherByLocation(latitude, longitude) {
    const API_KEY = "a92dc9452c62b23a1bd80881b815667b";
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok) {
            console.log(data.message);
            return;
        }

        const dayTime = isDayTime(data);
        console.log("is Day: ", dayTime);

        LocationName.textContent = data.name;
        temperature.textContent = Math.round(data.main.temp);
        weatherCondition.textContent = data.weather[0].main;
        humidity.textContent = `${data.main.humidity}%`;
        wind.textContent = `${data.wind.speed} m/s`;

        const condition = data.weather[0].main;
        const weatherId = data.weather[0].id;

        minTemp.textContent = `${Math.round(data.main.temp_min)} °C`;
        maxTemp.textContent = `${Math.round(data.main.temp_max)} °C`;
        feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)} °C`;
        weatherDescription.textContent = data.weather[0].description;

        console.log("WeatherId: ", weatherId);

        updateWeatherIcon(condition, dayTime);
        updateWeatherVideo(condition, weatherId, dayTime);
        getForecast(data.name, data.timezone);
        updateDate(data.timezone);
        getAirQuality(latitude, longitude);
        updateWeatherDetails(data);
        updateSunriseSunset(data);
        updateOutdoorActivities(data);

        console.log("Location: ", data.name);
        console.log("Temperature: ", data.main.temp);
        console.log("Condition: ", data.weather[0].main);
    } catch (error) {
        console.log("Network Error: ", error);
    }

}

function updateDate(timezoneOffset) {
    const utcTime = Date.now() + new Date().getTimezoneOffset() * 60000;
    const cityTime = new Date(utcTime + timezoneOffset * 1000);
    const date = cityTime.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
    });

    weatherDate.textContent = date;
}

function getWeatherEmoji(condition, dayTime = true) {

    if (condition === "Clear") {
        return dayTime ? "☀️" : "🌙";
    }

    if (condition === "Clouds") {
        return "☁️";
    }

    if (condition === "Rain") {
        return "🌧️";
    }

    if (condition === "Drizzle") {
        return "🌦️";
    }

    if (condition === "Thunderstorm") {
        return "⛈️";
    }

    if (condition === "Snow") {
        return "❄️";
    }

    if (condition === "Mist" || condition === "Fog") {
        return "🌫️";
    }

    return "☁️";
}


// Hourly forecast

function updateHourlyForecast(list, timezoneOffset) {
    if (!hourlyContainer || !list) return;

    hourlyContainer.innerHTML = "";

    const hoursToShow = list.slice(0, 6);

    hoursToShow.forEach((item, index) => {
        const timeStr = index === 0 ? "Now" : formatTime(item.dt, timezoneOffset);
        const condition = item.weather[0].main;
        const temp = Math.round(item.main.temp);
        const rainChance = Math.round((item.pop || 0) * 100);
        const isDay = item.sys ? item.sys.pod === "d" : true;

        const hourCard = document.createElement("div");
        hourCard.classList.add("hour-card");
        if (index === 0) {
            hourCard.classList.add("active");
        }

        hourCard.innerHTML = `
            <span class="hour-time">${timeStr}</span>
            <span class="hour-icon">${getWeatherEmoji(condition, isDay)}</span>
            <strong>${temp}°</strong>
            <small>${rainChance}%</small>
        `;

        hourlyContainer.appendChild(hourCard);
    });
}


// Temperature graph

function updateTemperatureChart(list, timezoneOffset) {
    if (!chartPath || !chartArea || !chartTimes || !list) return;

    const pointsCount = 5;
    const items = list.slice(0, pointsCount);
    if (items.length < 2) return;

    const temps = items.map(item => item.main.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const tempRange = maxTemp - minTemp || 1;

    const width = 700;
    const height = 160;
    const minY = 35;
    const maxY = 125;

    const points = items.map((item, index) => {
        const x = (index / (pointsCount - 1)) * width;
        const normalized = (item.main.temp - minTemp) / tempRange;
        const y = maxY - normalized * (maxY - minY);
        return { x, y };
    });

    // Build smooth cubic bezier curve
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const cpX1 = p0.x + (p1.x - p0.x) / 2;
        const cpY1 = p0.y;
        const cpX2 = p0.x + (p1.x - p0.x) / 2;
        const cpY2 = p1.y;
        pathD += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }

    const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

    chartPath.setAttribute("d", pathD);
    chartArea.setAttribute("d", areaD);

    if (chartPoint) {
        chartPoint.setAttribute("cx", points[0].x);
        chartPoint.setAttribute("cy", points[0].y);
    }

    // Update chart times
    chartTimes.innerHTML = "";
    items.forEach((item, index) => {
        const timeStr = index === 0 ? "Now" : formatTime(item.dt, timezoneOffset);
        const span = document.createElement("span");
        span.textContent = timeStr;
        chartTimes.appendChild(span);
    });
}


// Air quality

async function getAirQuality(lat, lon) {
    const API_KEY = "a92dc9452c62b23a1bd80881b815667b";
    const API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (!response.ok || !data.list || data.list.length === 0) {
            return;
        }

        const aqiData = data.list[0];
        const aqi = aqiData.main.aqi;
        const components = aqiData.components;

        updateAirQualityUI(aqi, components);
    } catch (error) {
        console.log("Air Quality Error:", error);
    }
}

function updateAirQualityUI(aqi, components) {
    const aqiLevels = {
        1: { status: "Good", score: 25, color: "#65e6b4", deg: 75, desc: "Air quality is currently <strong>Good</strong>." },
        2: { status: "Fair", score: 63, color: "#a8e063", deg: 150, desc: "Air quality is currently <strong>Fair</strong>." },
        3: { status: "Moderate", score: 110, color: "#ffd166", deg: 225, desc: "Air quality is currently <strong>Moderate</strong>." },
        4: { status: "Poor", score: 165, color: "#ff8c69", deg: 300, desc: "Air quality is currently <strong>Poor</strong>." },
        5: { status: "Very Poor", score: 240, color: "#ff6b6b", deg: 360, desc: "Air quality is currently <strong>Very Poor</strong>." }
    };

    const level = aqiLevels[aqi] || aqiLevels[1];

    if (aqiValue) aqiValue.textContent = level.score;
    if (aqiStatus) {
        aqiStatus.textContent = level.status;
        aqiStatus.style.color = level.color;
    }
    if (aqiCircle) {
        aqiCircle.style.background = `conic-gradient(${level.color} 0deg ${level.deg}deg, rgba(255, 255, 255, 0.1) ${level.deg}deg 360deg)`;
    }
    if (aqiDescription) {
        aqiDescription.innerHTML = level.desc;
    }

    if (pm25Value) pm25Value.textContent = Math.round(components.pm2_5);
    if (pm10Value) pm10Value.textContent = Math.round(components.pm10);
    if (coValue) coValue.textContent = (components.co / 1000).toFixed(1);
    if (no2Value) no2Value.textContent = Math.round(components.no2);
}


// Weather details

function updateWeatherDetails(data) {
    const detailCards = document.querySelectorAll(".detail-card");
    if (!detailCards || detailCards.length < 6) return;

    // 1. Feels like
    const feels = Math.round(data.main.feels_like);
    let feelsDesc = "Comfortable";
    if (feels >= 38) feelsDesc = "Scorching hot";
    else if (feels >= 32) feelsDesc = "Very hot";
    else if (feels >= 25) feelsDesc = "Warm";
    else if (feels >= 18) feelsDesc = "Pleasant";
    else if (feels >= 10) feelsDesc = "Cool";
    else feelsDesc = "Cold";

    detailCards[0].querySelector("strong").textContent = `${feels}°C`;
    detailCards[0].querySelector("small").textContent = feelsDesc;

    // 2. Wind
    const windSpeedKmH = Math.round(data.wind.speed * 3.6);
    const deg = data.wind.deg || 0;
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const windDir = directions[Math.round(deg / 45) % 8];

    detailCards[1].querySelector(".wind-value").textContent = `${windSpeedKmH} km/h`;
    detailCards[1].querySelector("small").textContent = windDir;

    // 3. Humidity
    const hum = data.main.humidity;
    let humDesc = "Comfortable";
    if (hum >= 80) humDesc = "Damp";
    else if (hum >= 60) humDesc = "Humid";
    else if (hum >= 30) humDesc = "Comfortable";
    else humDesc = "Dry";

    detailCards[2].querySelector(".humidity-value").textContent = `${hum}%`;
    detailCards[2].querySelector("small").textContent = humDesc;

    // 4. Uv index
    const uv = calculateUVIndex(data);
    let uvDesc = "Low";
    if (uv >= 11) uvDesc = "Extreme";
    else if (uv >= 8) uvDesc = "Very high";
    else if (uv >= 6) uvDesc = "High";
    else if (uv >= 3) uvDesc = "Moderate";
    else uvDesc = "Low";

    detailCards[3].querySelector("strong").textContent = uv;
    detailCards[3].querySelector("small").textContent = uvDesc;

    // 5. Visibility
    const visibilityKm = (data.visibility / 1000).toFixed(1);
    let visDesc = "Normal";
    if (data.visibility >= 10000) visDesc = "Clear";
    else if (data.visibility >= 6000) visDesc = "Normal";
    else if (data.visibility >= 3000) visDesc = "Moderate";
    else visDesc = "Poor";

    detailCards[4].querySelector("strong").textContent = `${visibilityKm} km`;
    detailCards[4].querySelector("small").textContent = visDesc;

    // 6. Pressure
    const pressure = data.main.pressure;
    detailCards[5].querySelector("strong").textContent = pressure;
    detailCards[5].querySelector("small").textContent = "hPa";
}

function calculateUVIndex(data) {
    if (!isDayTime(data)) return 0;

    const clouds = data.clouds ? data.clouds.all : 0;
    const temp = data.main.temp;

    // Estimated uv calculation during day hours
    let baseUV = 6;
    if (temp > 30) baseUV = 8;
    else if (temp < 15) baseUV = 4;

    const cloudFactor = 1 - (clouds * 0.006);
    const uv = Math.max(1, Math.round(baseUV * cloudFactor));

    return uv;
}


// Sunrise & sunset

function updateSunriseSunset(data) {
    const timezoneOffset = data.timezone;
    const sunrise = data.sys.sunrise;
    const sunset = data.sys.sunset;

    const sunriseTime = formatTime(sunrise, timezoneOffset);
    const sunsetTime = formatTime(sunset, timezoneOffset);

    if (sunriseTimeEl) sunriseTimeEl.textContent = sunriseTime;
    if (sunsetTimeEl) sunsetTimeEl.textContent = sunsetTime;

    const daylightSeconds = Math.max(0, sunset - sunrise);
    const hours = Math.floor(daylightSeconds / 3600);
    const minutes = Math.floor((daylightSeconds % 3600) / 60);

    if (daylightDurationEl) {
        daylightDurationEl.textContent = `${hours}h ${minutes}m`;
    }

    // Sun icon position on orbit
    const nowUtc = Math.floor(Date.now() / 1000);
    if (sunIcon) {
        if (nowUtc >= sunrise && nowUtc <= sunset) {
            const progress = (nowUtc - sunrise) / (sunset - sunrise);
            const leftPercent = 5 + progress * 85;
            const topPercent = 75 - Math.sin(Math.PI * progress) * 55;
            sunIcon.style.left = `${leftPercent}%`;
            sunIcon.style.top = `${topPercent}px`;
            sunIcon.textContent = "☀️";
        } else {
            sunIcon.style.left = "48%";
            sunIcon.style.top = "70px";
            sunIcon.textContent = "🌙";
        }
    }
}

function formatTime(timestamp, timezoneOffset) {
    const localDate = new Date((timestamp + timezoneOffset) * 1000);
    const hours = localDate.getUTCHours().toString().padStart(2, "0");
    const minutes = localDate.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}


// Outdoor activities

function updateOutdoorActivities(data) {
    const cards = document.querySelectorAll(".activity-card");
    if (!cards || cards.length < 6) return;

    const condition = data.weather[0].main;
    const temp = data.main.temp;
    const windSpeed = data.wind.speed;
    const isRaining = condition === "Rain" || condition === "Drizzle" || condition === "Thunderstorm";
    const isSnowing = condition === "Snow";

    // 1. Running
    let runningStatus = "Good";
    let runningGood = true;
    if (isRaining || isSnowing || temp > 36 || temp < 2) {
        runningStatus = "Less suitable";
        runningGood = false;
    } else if (temp >= 15 && temp <= 24) {
        runningStatus = "Great";
        runningGood = true;
    } else {
        runningStatus = "Good";
        runningGood = true;
    }
    setActivityStatus(cards[0], runningStatus, runningGood);

    // 2. Cycling
    let cyclingStatus = "Good";
    let cyclingGood = true;
    if (isRaining || isSnowing || windSpeed > 10 || temp > 38 || temp < 5) {
        cyclingStatus = "Unsuitable";
        cyclingGood = false;
    } else if (windSpeed > 6) {
        cyclingStatus = "Fair";
        cyclingGood = true;
    } else {
        cyclingStatus = "Good";
        cyclingGood = true;
    }
    setActivityStatus(cards[1], cyclingStatus, cyclingGood);

    // 3. Fishing
    let fishingStatus = "Good";
    let fishingGood = true;
    if (condition === "Thunderstorm" || windSpeed > 12) {
        fishingStatus = "Unsuitable";
        fishingGood = false;
    } else if (condition === "Rain" || condition === "Clouds") {
        fishingStatus = "Good";
        fishingGood = true;
    } else {
        fishingStatus = "Fair";
        fishingGood = true;
    }
    setActivityStatus(cards[2], fishingStatus, fishingGood);

    // 4. Hiking
    let hikingStatus = "Good";
    let hikingGood = true;
    if (condition === "Thunderstorm" || isSnowing || (isRaining && windSpeed > 7) || temp > 37) {
        hikingStatus = "Unsuitable";
        hikingGood = false;
    } else if (temp >= 14 && temp <= 26 && !isRaining) {
        hikingStatus = "Great";
        hikingGood = true;
    } else {
        hikingStatus = "Fair";
        hikingGood = true;
    }
    setActivityStatus(cards[3], hikingStatus, hikingGood);

    // 5. Cold
    let coldStatus = "Unlikely";
    let coldGood = false;
    if (temp <= 0) {
        coldStatus = "Freezing";
        coldGood = false;
    } else if (temp <= 10) {
        coldStatus = "Cold";
        coldGood = false;
    } else if (temp <= 18) {
        coldStatus = "Mild";
        coldGood = true;
    } else {
        coldStatus = "Unlikely";
        coldGood = true;
    }
    setActivityStatus(cards[4], coldStatus, coldGood);

    // 6. Swimming
    let swimmingStatus = "Good";
    let swimmingGood = true;
    if (isRaining || condition === "Thunderstorm" || temp < 18) {
        swimmingStatus = "Unsuitable";
        swimmingGood = false;
    } else if (temp >= 30) {
        swimmingStatus = "Very high";
        swimmingGood = true;
    } else if (temp >= 24) {
        swimmingStatus = "Good";
        swimmingGood = true;
    } else {
        swimmingStatus = "Fair";
        swimmingGood = false;
    }
    setActivityStatus(cards[5], swimmingStatus, swimmingGood);
}

function setActivityStatus(card, text, isGood) {
    const statusEl = card.querySelector(".activity-status");
    if (!statusEl) return;
    statusEl.textContent = text;
    if (isGood) {
        statusEl.classList.add("good");
    } else {
        statusEl.classList.remove("good");
    }
}



// Theme toggle
if (themeButton) {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
        if (themeIcon) {
            themeIcon.classList.remove("fa-moon");
            themeIcon.classList.add("fa-sun");
        }
    }

    themeButton.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        const isLight = document.body.classList.contains("light-mode");

        if (themeIcon) {
            if (isLight) {
                themeIcon.classList.remove("fa-moon");
                themeIcon.classList.add("fa-sun");
            } else {
                themeIcon.classList.remove("fa-sun");
                themeIcon.classList.add("fa-moon");
            }
        }

        localStorage.setItem("theme", isLight ? "light" : "dark");
    });
}

// Initial default load
getWeather("Kolkata");