let map; // global reference for the map instance

function searchWeather() {
  const city = document.getElementById("searchInput").value;
  fetch(`/weather?city=${city}`)
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("weatherInfo");
      if (data.success) {
        const forecastList = data.forecast.list;
        const cityName = data.forecast.city.name;
        const current = data.current;
        const { lat, lon } = data.forecast.city.coord;

        const weatherDescription = current.weather[0].description;
        const feelsLike = current.main.feels_like;
        const pressure = current.main.pressure;
        const humidity = current.main.humidity;
        const visibility = current.visibility / 1000; // convert to km
        const windSpeed = current.wind.speed;
        const dewPoint = feelsLike - ((100 - humidity) / 5); // estimated dew point
        const icon = current.weather[0].icon;
        const temp = current.main.temp;

        container.innerHTML = `
  <h2>${new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}</h2>
  <h1>${cityName}</h1>
  <div class="main-layout">
    <div class="current-map-wrapper">
      <div class="current-weather">
        <div style="font-size: 36px;">${Math.round(temp)}°C </div>
        <img src="http://openweathermap.org/img/wn/${icon}@2x.png" alt="icon" class="forecast-icon" />
        <p><strong>Feels like:</strong> ${Math.round(feelsLike)}°C. ${weatherDescription}. Light breeze</p>
        <p><strong>Wind:</strong> ${windSpeed}m/s<br>
        <strong>Pressure:</strong> ${pressure}hPa<br>
        <strong>Humidity:</strong> ${humidity}%<br>
        <strong>Dew point:</strong> ${Math.round(dewPoint)}°C<br>
        <strong>Visibility:</strong> ${visibility.toFixed(1)}km</p>
      </div>
      <div id="map"></div>
    </div>
    <div class="forecast-container">
      <div class="hourly-forecast">
        <h3>Hourly forecast</h3>
        <div class="forecast-scroll">
          ${forecastList.slice(0, 8).map(item => {
            const hour = new Date(item.dt_txt).getHours();
            const icon = item.weather[0].icon;
            const desc = item.weather[0].description;
            const temp = Math.round(item.main.temp);
            return `
              <div class="forecast-day">
                <span>${hour}:00</span>
                <img src="http://openweathermap.org/img/wn/${icon}.png" class="forecast-icon" />
                <span>${desc}</span>
                <span>${temp}°C</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
      <div class="daily-forecast">
        <h3>5-day forecast</h3>
        <div class="forecast-scroll">
          ${forecastList.filter((_, i) => i % 8 === 0).slice(0, 8).map(item => {
            const date = new Date(item.dt_txt).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
            const icon = item.weather[0].icon;
            const desc = item.weather[0].description;
            const max = Math.round(item.main.temp_max);
            const min = Math.round(item.main.temp_min);
            return `
              <div class="forecast-day">
                <span>${date}</span>
                <img src="http://openweathermap.org/img/wn/${icon}.png" class="forecast-icon" />
                <span>${max} / ${min}°C</span>
                <span>${desc}</span>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    </div>
  </div>
`;

        // Initialize or reset the Leaflet map
        setTimeout(() => {
          // Clean up old map instance and HTML
          if (map) {
            map.remove();  // Completely removes the previous map
            map = null;
          }

          // Re-initialize the map
          map = L.map('map').setView([lat, lon], 10);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);
          L.marker([lat, lon]).addTo(map).bindPopup(`<b>${cityName}</b>`).openPopup();
        }, 100); // slight delay to ensure #map div is in DOM

      } else {
        container.innerHTML = `<p>${data.message}</p>`;
        if (map) {
          map.remove();
          map = null;
        }
      }
    });
}
