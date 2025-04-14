from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
import json
from datetime import datetime

# Load environment variables
load_dotenv()
API_KEY = os.getenv("OPENWEATHER_API_KEY")

app = Flask(__name__)
CORS(app)

# Utility to fetch weather by city or coordinates
def fetch_weather_data(city=None, lat=None, lon=None):
    if city:
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?q={city}&appid={API_KEY}&units=metric"
        current_url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"
    elif lat and lon:
        forecast_url = f"http://api.openweathermap.org/data/2.5/forecast?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
        current_url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    else:
        return None, None

    forecast_res = requests.get(forecast_url)
    current_res = requests.get(current_url)

    if forecast_res.ok and current_res.ok:
        return forecast_res.json(), current_res.json()
    return None, None

@app.route("/", methods=["GET", "POST"])
def home():
    if request.method == "POST":
        city = request.form.get("city")
        forecast_data, current_data = fetch_weather_data(city=city)

        if forecast_data and current_data:
            return render_template("index.html", current=current_data, forecast=forecast_data['list'])
        else:
            return render_template("index.html", current=None, forecast=[], error="Could not fetch weather data.")

    return render_template("index.html", current=None, forecast=[])

@app.route("/weather", methods=["GET"])
def get_weather():
    city = request.args.get("city")
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    if not city and not (lat and lon):
        try:
            ip_data = requests.get("https://ipapi.co/json").json()
            city = ip_data.get("city")
        except Exception as e:
            return jsonify({"success": False, "message": "IP location lookup failed", "error": str(e)})

    forecast_data, current_data = fetch_weather_data(city, lat, lon)

    if forecast_data and current_data:
        return jsonify({
            "success": True,
            "current": current_data,
            "forecast": forecast_data
        })

    return jsonify({"success": False, "message": "Could not fetch weather data"})

if __name__ == "__main__":
    app.run(debug=True)
