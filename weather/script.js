const apiKey = 'bd5e378503939ddaee76f12ad7a97608'; // Your OpenWeather API key
const weatherInfo = document.getElementById('weatherInfo');
const cityName = document.getElementById('cityName');
const weatherDescription = document.getElementById('weatherDescription');
const temperature = document.getElementById('temperature');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const loader = document.getElementById('loader');
const weatherMapWrapper = document.getElementById('weatherMapWrapper');
const forecastContainer = document.getElementById('forecastContainer');
const forecastSection = document.getElementById('forecast');
let map; // Initialize map variable

// Function to fetch weather by city name
async function getWeather() {
  const city = document.getElementById('cityInput').value;
  if (!city) {
    alert('Please enter a city name');
    return;
  }

  loader.style.display = 'block';
  weatherInfo.style.display = 'none';
  weatherMapWrapper.style.display = 'none';
  forecastSection.style.display = 'none';

  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
    const data = await response.json();
  
    if (data.cod === '404') {
      alert('City not found');
      loader.style.display = 'none';
      return;
    }
  
    updateWeatherUI(data);
    updateMap(data.coord.lat, data.coord.lon);
    getForecast(city); // Fetch forecast for the city
  } catch (error) {
    alert('Failed to fetch weather data');
  }
}

// Function to get weather by user's location
async function getLocationWeather() {
  if (navigator.geolocation) {
    loader.style.display = 'block';
    weatherInfo.style.display = 'none';
    weatherMapWrapper.style.display = 'none';
    forecastSection.style.display = 'none';

    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      
      try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`);
        const data = await response.json();
        
        updateWeatherUI(data);
        updateMap(lat, lon);
        getForecast(data.name); // Fetch forecast for the location
      } catch (error) {
        alert('Failed to fetch weather data');
      }
    }, () => {
      alert('Failed to get your location');
      loader.style.display = 'none';
    });
  } else {
    alert('Geolocation is not supported by this browser');
  }
}

// Function to update the UI with weather data
function updateWeatherUI(data) {
  cityName.textContent = data.name;
  weatherDescription.textContent = data.weather[0].description;
  temperature.textContent = `Temperature: ${data.main.temp}°C`;
  humidity.textContent = `Humidity: ${data.main.humidity}%`;
  windSpeed.textContent = `Wind Speed: ${data.wind.speed} m/s`;

  loader.style.display = 'none';
  weatherInfo.style.display = 'block';
  weatherMapWrapper.style.display = 'flex';
}

// Function to fetch 5-day forecast
async function getForecast(city) {
  try {
    const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`);
    const forecastData = await response.json();
    displayForecast(forecastData);
  } catch (error) {
    alert('Failed to fetch forecast data');
  }
}

// Function to display forecast data
function displayForecast(forecastData) {
  forecastContainer.innerHTML = ''; // Clear previous forecast
  const dailyForecasts = forecastData.list.filter(forecast => forecast.dt_txt.includes("12:00:00")); // Midday forecast for each day

  const currentDate = new Date();
  dailyForecasts.forEach((forecast, index) => {
    const forecastElement = document.createElement('div');
    forecastElement.className = 'forecast-item';
    const forecastDate = new Date(forecast.dt_txt);
    const dayLabel = getDayLabel(forecastDate, currentDate, index); // Get human-readable day label
    forecastElement.innerHTML = `
      <h3>${dayLabel}</h3>
      <p>Temp: ${forecast.main.temp}°C</p>
      <p>${forecast.weather[0].description}</p>
    `;
    forecastContainer.appendChild(forecastElement);
  });

  forecastSection.style.display = 'block';
}

// Function to calculate and return human-readable day labels
function getDayLabel(forecastDate, currentDate, index) {
  const diffTime = forecastDate - currentDate;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return daysOfWeek[forecastDate.getDay()];
  }
}

// Function to update the map with latitude and longitude
function updateMap(lat, lon) {
  if (!map) {
    map = L.map('map').setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
  } else {
    map.setView([lat, lon], 13);
  }

  L.marker([lat, lon]).addTo(map);
}
