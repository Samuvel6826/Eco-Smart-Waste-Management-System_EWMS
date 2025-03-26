import machine
import time
import urequests  # MicroPython library for HTTP requests
from machine import Pin, PWM
import socket
import json

jwt_token = None

binMaxCapacity = 60  # Maximum bin capacity in cm
heartbeat = 10  # Heartbeat interval in seconds

# Wi-Fi Credentials
ssid = 'ICT LAB_PKC'
password = 'Pkc@2022$'

# Define pins for the AJ-SR04M (waste level) sensor
TRIG_PIN_AJ = 13  # GPIO pin for Trig (AJ-SR04M)
ECHO_PIN_AJ = 12  # GPIO pin for Echo (AJ-SR04M)

# Define pins for the HC-SR04 (dustbin lid control) sensor
TRIG_PIN_HC = 33  # GPIO pin for Trig (HC-SR04)
ECHO_PIN_HC = 32  # GPIO pin for Echo (HC-SR04)

# Define pin for the buzzer and Servo Motor
buzzer = Pin(26, Pin.OUT)  # buzzer to indicate bin lid status
servo_pin = PWM(Pin(25), freq=50)  # Servo motor pin (50 Hz PWM for servo)

# URLs for your Node.js server
nodejs_server_url = 'https://ewms-eco-smart-waste-management-system-4re5.onrender.com/api/bin/sensor-distance'
heartbeat_url = 'https://ewms-eco-smart-waste-management-system-4re5.onrender.com/api/bin/sensor-heartbeat'
login_url = 'https://ewms-eco-smart-waste-management-system-4re5.onrender.com/api/user/login'

# Function to connect to Wi-Fi
def connect_wifi():
    import network
    wlan = network.WLAN(network.STA_IF)
    wlan.active(True)
    wlan.connect(ssid, password)

    while not wlan.isconnected():
        time.sleep(1)
        print('Connecting to Wi-Fi...')

    print('Connected to Wi-Fi')
    print('Network config:', wlan.ifconfig())
    
# Function to log in and retrieve JWT token
def login_and_get_token(email, password):
    
    payload = {
        "email": email,
        "password": password
    }
    try:
        response = urequests.post(login_url, json=payload)
        if response.status_code == 200:
            token_data = response.json()
            return token_data.get('token')  # Assuming the token is returned under 'token'
        else:
            print(f"Login failed: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        print(f"Error during login: {e}")
        return None


# Function to measure distance from a given trig and echo pin
def measure_distance(trig_pin, echo_pin):
    trig = Pin(trig_pin, Pin.OUT)  # Set Trig pin as output
    echo = Pin(echo_pin, Pin.IN)   # Set Echo pin as input

    # Trigger the sensor
    trig.value(0)
    time.sleep_us(2)
    trig.value(1)
    time.sleep_us(10)
    trig.value(0)

    # Measure the duration of the pulse
    timeout = 20000  # Timeout value in microseconds
    start_time = time.ticks_us()

    # Wait for echo start
    while echo.value() == 0:
        if time.ticks_diff(time.ticks_us(), start_time) > timeout:
            print("Echo timeout (start)")
            return -1  # Return -1 to indicate the sensor is not responding

    start = time.ticks_us()

    # Wait for echo end
    while echo.value() == 1:
        if time.ticks_diff(time.ticks_us(), start) > timeout:
            print("Echo timeout (end)")
            return -1  # Return -1 to indicate the sensor is not responding

    end = time.ticks_us()

    # Calculate distance in centimeters
    duration = time.ticks_diff(end, start)
    distance = (duration / 2) / 29.1  # Speed of sound = 343 m/s
    return int(distance)

# Separate functions for measuring distances
def measure_waste_level():
    return measure_distance(TRIG_PIN_AJ, ECHO_PIN_AJ)

def measure_lid_distance():
    distance = measure_distance(TRIG_PIN_HC, ECHO_PIN_HC)
    if distance == -1:
        distance = 400  # Set a default value, assuming the bin is far or the lid is closed.
    return distance

# Function to control the servo motor (open/close bin lid)
def control_servo(position):
    if position == "OPEN":
        servo_pin.duty(30)  # Adjust duty value for your servo to open the lid
        for _ in range(1):  # Blink 1 times
            buzzer.value(1)
            time.sleep(0.5)
            buzzer.value(0)
    elif position == "CLOSED":
        servo_pin.duty(125)  # Adjust duty value for your servo to close the lid
        buzzer.value(0)         # Turn off LED when the lid is closed

# Function to calculate bin fill percentage based on the measured distance
def calculate_percentage(distance):
    full_bin_distance = 20  # Distance for 100% (full)
    empty_bin_distance = binMaxCapacity  # Distance for 0% (empty)

    if distance <= full_bin_distance:
        return 100  # Bin is full
    elif distance >= empty_bin_distance:
        return 0  # Bin is empty
    else:
        percentage = int(((empty_bin_distance - distance) / (empty_bin_distance - full_bin_distance)) * 100)
        return max(0, min(percentage, 100))  # Ensure it's within 0 to 100

# Function to fetch public IP and location
def http_get(host, path):
    addr = socket.getaddrinfo(host, 80)[0][-1]
    s = socket.socket()
    try:
        s.connect(addr)
        s.send(bytes(f'GET {path} HTTP/1.0\r\nHost: {host}\r\n\r\n', 'utf8'))
        
        response = ""
        while True:
            data = s.recv(100)
            if data:
                response += str(data, 'utf8')
            else:
                break
        
        # Extract the JSON body from the response
        body = response.split('\r\n\r\n', 1)[1]
        return json.loads(body)
    except Exception as e:
        print(f"Error in HTTP request: {e}")
        return None
    finally:
        s.close()

# Function to get public IP address
def get_public_ip():
    try:
        ip_info = http_get("api.ipify.org", "/?format=json")
        return ip_info.get('ip') if ip_info else None
    except Exception as e:
        print(f"Error fetching public IP: {e}")
        return None

# Function to get location based on IP address
def get_location(ip_address):
    try:
        if not ip_address:
            print("Invalid IP address. Cannot fetch location.")
            return None, None
        
        location_data = http_get("ipinfo.io", f"/{ip_address}/geo")
        if location_data and 'loc' in location_data:
            latitude, longitude = location_data['loc'].split(',')
            return latitude, longitude
        else:
            print("Failed to get geolocation data.")
            return None, None
    except Exception as e:
        print(f"Error fetching location: {e}")
        return None, None

# Connect to Wi-Fi
connect_wifi()

# Fetch public IP and location once at the start
try:
    print("Fetching public IP...")
    public_ip = get_public_ip()
    if public_ip:
        print(f"Public IP: {public_ip}")
        print("Fetching geolocation...")
        latitude, longitude = get_location(public_ip)
        if latitude and longitude:
            print(f"Latitude: {latitude}, Longitude: {longitude}")
        else:
            print("Failed to get geolocation.")
    else:
        print("Failed to get public IP address.")
except Exception as e:
    print(f"Error during initial setup: {e}")
    
# Log in and get the JWT token
jwt_token = login_and_get_token("praveengabap@gmail.com", "1")

if jwt_token:
    print("JWT Token received.")
else:
    print("Failed to obtain JWT token.")

# Initialize variables
previous_distance_aj = None  # To track previous distance measurement for AJ-SR04M
previous_distance_hc = None  # To track previous distance measurement for HC-SR04
distance_threshold = 5        # Define a threshold for distance change
heartbeat_counter = 0         # Counter for heartbeat

# Heartbeat function to notify the server
def send_heartbeat():
    heartbeat_data = {
        "id": "Bin-1",
        "binLocation": "Canteen",
        "microProcessorStatus": "ON"
    }
    headers = {'Authorization': f'Bearer {jwt_token}'}
    try:
        response = urequests.patch(heartbeat_url, json=heartbeat_data,headers=headers)
        print(f'Heartbeat sent: {response.status_code}, Response: {response.text}')
        print(heartbeat_data)
        response.close()
    except Exception as e:
        print('Error sending heartbeat:', e)

# Main loop
while True:
    try:
        # Measure distance from AJ-SR04M (waste level sensor)
        distance_aj = measure_waste_level()

        # Initialize sensor status
        if distance_aj == -1:
            waste_level_sensor_status = "OFF"
            print("AJ-SR04M sensor not responding")
            LED.value(0)  # Turn off LED if the sensor is not working
        else:
            waste_level_sensor_status = "ON"
            print(f'Waste Level Distance: {distance_aj} cm')

        # Measure distance from HC-SR04 (lid control sensor)
        distance_hc = measure_lid_distance()

        if distance_hc == -1:
            lid_sensor_status = "OFF"
            print("HC-SR04 sensor not responding")
            continue
        else:
            lid_sensor_status = "ON"
            print(f'HC-SR04 Distance: {distance_hc} cm')

        # Calculate bin fill percentage
        percentage = calculate_percentage(distance_aj)
        print(f'Filled Percentage: {percentage}%')

        # Control the servo motor based on HC-SR04 distance (lid open/close logic)
        if distance_hc <= 50:
            control_servo("OPEN")  # Open the bin lid if distance <= 25 cm
            binLid_status = "OPEN"
        else:
            control_servo("CLOSED")  # Close the bin lid if distance > 25 cm
            binLid_status = "CLOSED"

        # Check for significant changes in distances to send immediate updates
        if (previous_distance_aj is None or abs(previous_distance_aj - distance_aj) > distance_threshold or
            previous_distance_hc is None or abs(previous_distance_hc - distance_hc) > distance_threshold):

            # Prepare dynamic data to send to the server
            sensor_data = {
                "id": "Bin-1",  
                "binLocation": "Canteen",
                "distance": distance_aj, 
                "filledBinPercentage": percentage, 
                "geoLocation": {
                    "latitude": latitude,
                    "longitude": longitude
                },
                "microProcessorStatus": "ON", 
                "distanceSensorStatus": waste_level_sensor_status,
                "lidSensorStatus": lid_sensor_status,   
                "binLidStatus": binLid_status,    
                "maxBinCapacity": binMaxCapacity         
            }
            headers = {'Authorization': f'Bearer {jwt_token}'}
            try:
                response = urequests.patch(nodejs_server_url, json=sensor_data,headers=headers)
                print(f'Sensor Data sent: {response.status_code}, Response: {response.text}')
                print(sensor_data)
                response.close()
            except Exception as e:
                print('Error sending sensor data:', e)

            # Update previous distance values
            previous_distance_aj = distance_aj
            previous_distance_hc = distance_hc

        # Send heartbeat every 10 seconds
        heartbeat_counter += 1
        if heartbeat_counter >= heartbeat:  # Adjust the frequency as needed
            send_heartbeat()
            heartbeat_counter = 0

        time.sleep(0.2)  # Delay between measurements
    except Exception as e:
        print('Error in main loop:', e)
