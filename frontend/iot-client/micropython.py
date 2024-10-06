import machine
import time
import urequests
from machine import Pin, PWM, Timer
import socket
import json
import gc
import network
import asyncio
from micropython import const

# System Constants
BIN_MAX_CAPACITY = const(50)
WIFI_RETRY_LIMIT = const(5)
WIFI_RETRY_DELAY = const(5)
SENSOR_TIMEOUT_US = const(20000)
DISTANCE_THRESHOLD = const(5)

# Heartbeat Constants
HEARTBEAT_INTERVAL_MS = const(5000)  # 5 seconds
HEARTBEAT_RETRY_COUNT = const(3)
HEARTBEAT_RETRY_DELAY_MS = const(1000)
SYSTEM_STATUS_CHECK_INTERVAL = const(60000)  # 1 minute

# Pin Configurations
TRIG_PIN_AJ = const(13)    # Waste level sensor
ECHO_PIN_AJ = const(12)
TRIG_PIN_HC = const(33)    # Lid control sensor
ECHO_PIN_HC = const(32)
LED_PIN = const(26)
SERVO_PIN = const(25)

# Network Configuration
WIFI_CONFIG = {
    'ssid': 'Redmi',
    'password': '876543210'
}

# API Endpoints
API_ENDPOINTS = {
    'sensor_data': 'https://test-iot-554d.onrender.com/sensor-distance',
    'heartbeat': 'https://test-iot-554d.onrender.com/sensor-heartbeat'
}

class SensorError(Exception):
    """Custom exception for sensor-related errors"""
    pass

class NetworkError(Exception):
    """Custom exception for network-related errors"""
    pass

class SmartWasteBin:
    def __init__(self):
        """Initialize the Smart Waste Bin system"""
        # Initialize hardware components
        self.setup_pins()
        self.wlan = None
        self.location_data = {'latitude': None, 'longitude': None}
        self.last_distances = {'waste': None, 'lid': None}
        
        # Heartbeat related attributes
        self.last_heartbeat_time = time.ticks_ms()
        self.heartbeat_failures = 0
        self.system_status = "ON"
        self.last_system_check = time.ticks_ms()
        
        # Initialize heartbeat timer
        self.heartbeat_timer = Timer(1)
        
        # Enable garbage collection
        gc.enable()

    def setup_pins(self):
        """Initialize and configure all hardware pins"""
        try:
            # Ultrasonic sensors setup
            self.trig_waste = Pin(TRIG_PIN_AJ, Pin.OUT)
            self.echo_waste = Pin(ECHO_PIN_AJ, Pin.IN)
            self.trig_lid = Pin(TRIG_PIN_HC, Pin.OUT)
            self.echo_lid = Pin(ECHO_PIN_HC, Pin.IN)
            
            # LED and servo setup
            self.led = Pin(LED_PIN, Pin.OUT)
            self.servo = PWM(Pin(SERVO_PIN), freq=50)
            
            # Initial states
            self.trig_waste.value(0)
            self.trig_lid.value(0)
            self.led.value(0)
            self.servo.duty(125)  # Close position
            
            print("Hardware initialization successful")
        except Exception as e:
            raise RuntimeError(f"Hardware initialization failed: {str(e)}")

    def setup_heartbeat_timer(self):
        """Configure and start the heartbeat timer"""
        try:
            self.heartbeat_timer.init(
                period=HEARTBEAT_INTERVAL_MS,
                mode=Timer.PERIODIC,
                callback=lambda t: self.send_heartbeat()
            )
            print("Heartbeat timer initialized successfully")
        except Exception as e:
            print(f"Heartbeat timer initialization failed: {str(e)}")
            self.heartbeat_timer = None

    def connect_wifi(self):
        """Establish WiFi connection with retry mechanism"""
        self.wlan = network.WLAN(network.STA_IF)
        self.wlan.active(True)
        
        retries = 0
        while retries < WIFI_RETRY_LIMIT:
            try:
                print(f"Attempting WiFi connection ({retries + 1}/{WIFI_RETRY_LIMIT})...")
                self.wlan.connect(WIFI_CONFIG['ssid'], WIFI_CONFIG['password'])
                
                # Wait for connection with timeout
                start_time = time.time()
                while not self.wlan.isconnected():
                    if time.time() - start_time > WIFI_RETRY_DELAY:
                        raise NetworkError("Connection timeout")
                    time.sleep(0.1)
                
                print(f"WiFi connected successfully! IP: {self.wlan.ifconfig()[0]}")
                return True
                
            except Exception as e:
                retries += 1
                print(f"WiFi connection failed: {str(e)}")
                if retries < WIFI_RETRY_LIMIT:
                    print(f"Retrying in {WIFI_RETRY_DELAY} seconds...")
                    time.sleep(WIFI_RETRY_DELAY)
                
        raise NetworkError("Failed to connect to WiFi after multiple attempts")

    def measure_distance(self, trig_pin, echo_pin, sensor_name=""):
        """Measure distance using ultrasonic sensor"""
        try:
            # Reset trigger
            trig_pin.value(0)
            time.sleep_us(2)
            
            # Send trigger pulse
            trig_pin.value(1)
            time.sleep_us(10)
            trig_pin.value(0)

            # Wait for echo with timeout
            pulse_start = time.ticks_us()
            while echo_pin.value() == 0:
                if time.ticks_diff(time.ticks_us(), pulse_start) > SENSOR_TIMEOUT_US:
                    raise SensorError(f"{sensor_name} echo start timeout")

            start = time.ticks_us()
            while echo_pin.value() == 1:
                if time.ticks_diff(time.ticks_us(), start) > SENSOR_TIMEOUT_US:
                    raise SensorError(f"{sensor_name} echo end timeout")

            duration = time.ticks_diff(time.ticks_us(), start)
            distance = (duration * 0.0343) / 2  # Speed of sound / 2 (round trip)
            
            return max(0, min(int(distance), BIN_MAX_CAPACITY))
            
        except SensorError as se:
            print(f"Sensor Error ({sensor_name}): {str(se)}")
            return -1
        except Exception as e:
            print(f"Unexpected error measuring {sensor_name} distance: {str(e)}")
            return -1

    def calculate_fill_percentage(self, distance):
        """Calculate bin fill percentage with bounds checking"""
        try:
            if distance < 0:
                return 0
                
            full_distance = 20
            empty_distance = BIN_MAX_CAPACITY
            
            if distance <= full_distance:
                return 100
            if distance >= empty_distance:
                return 0
                
            percentage = ((empty_distance - distance) / (empty_distance - full_distance)) * 100
            return max(0, min(100, int(percentage)))
            
        except Exception as e:
            print(f"Error calculating fill percentage: {str(e)}")
            return 0

    def control_servo(self, position):
        """Control servo motor with position validation"""
        try:
            if position == "OPEN":
                self.servo.duty(30)
                self.led.value(1)
            elif position == "CLOSED":
                self.servo.duty(125)
                self.led.value(0)
            else:
                raise ValueError(f"Invalid servo position: {position}")
                
        except Exception as e:
            print(f"Servo control error: {str(e)}")
            # Attempt to safely close in case of error
            self.servo.duty(125)
            self.led.value(0)

    async def send_data(self, url, data):
        """Send data to server with retry mechanism"""
        retries = 3
        while retries > 0:
            try:
                gc.collect()  # Free memory before request
                response = urequests.post(url, json=data)
                response_text = response.text
                response.close()
                return response_text
                
            except Exception as e:
                retries -= 1
                if retries > 0:
                    print(f"Data sending error: {str(e)}. Retrying... ({retries} attempts left)")
                    await asyncio.sleep(1)
                else:
                    print(f"Failed to send data after all retries: {str(e)}")
                    raise

    async def send_heartbeat(self):
        """Send heartbeat signal to server"""
        if not self.wlan.isconnected():
            print("Network disconnected - skipping heartbeat")
            self.heartbeat_failures += 1
            return

        heartbeat_data = {
            "id": 1,
            "binLocation": "Canteen",
            "microProcessorStatus": self.system_status,
            "timestamp": time.time(),
            "systemMetrics": {
                "freeMemory": gc.mem_free(),
                "uptime": time.ticks_ms(),
                "wifiSignalStrength": self.wlan.status('rssi'),
                "failedHeartbeats": self.heartbeat_failures
            }
        }

        for retry in range(HEARTBEAT_RETRY_COUNT):
            try:
                response = await self.send_data(API_ENDPOINTS['heartbeat'], heartbeat_data)
                
                if response:
                    print(f"Heartbeat sent successfully (attempt {retry + 1})")
                    self.heartbeat_failures = 0
                    self.last_heartbeat_time = time.ticks_ms()
                    return True
                    
            except Exception as e:
                print(f"Heartbeat failed (attempt {retry + 1}): {str(e)}")
                if retry < HEARTBEAT_RETRY_COUNT - 1:
                    await asyncio.sleep_ms(HEARTBEAT_RETRY_DELAY_MS)
                self.heartbeat_failures += 1

        if self.heartbeat_failures >= 5:
            print("Critical: Multiple heartbeat failures detected")
            self.handle_heartbeat_failure()

        return False

    def handle_heartbeat_failure(self):
        """Handle critical heartbeat failures"""
        try:
            # Log the failure
            with open('heartbeat_log.txt', 'a') as log:
                log.write(f"Critical heartbeat failure at {time.time()}\n")

            if self.heartbeat_failures >= 10:
                print("Attempting system recovery due to persistent heartbeat failures")
                self.system_recovery()
            else:
                print("Attempting to reconnect WiFi")
                self.connect_wifi()

        except Exception as e:
            print(f"Error in heartbeat failure handler: {str(e)}")

    def system_recovery(self):
        """Perform system recovery actions"""
        try:
            # Reset network connection
            self.wlan.disconnect()
            time.sleep(1)
            self.connect_wifi()

            # Reset timers
            if self.heartbeat_timer:
                self.heartbeat_timer.deinit()
                self.setup_heartbeat_timer()

            # Reset counters
            self.heartbeat_failures = 0
            self.last_heartbeat_time = time.ticks_ms()

            print("System recovery completed")

        except Exception as e:
            print(f"System recovery failed: {str(e)}")
            print("Initiating hardware reset...")
            time.sleep(1)
            machine.reset()

    def check_system_status(self):
        """Periodic system health check"""
        current_time = time.ticks_ms()
        if time.ticks_diff(current_time, self.last_system_check) >= SYSTEM_STATUS_CHECK_INTERVAL:
            try:
                # Check memory
                if gc.mem_free() < 10000:
                    print("Low memory warning")
                    gc.collect()

                # Check WiFi
                if not self.wlan.isconnected():
                    print("WiFi disconnected - attempting reconnection")
                    self.connect_wifi()

                # Check heartbeat status
                heartbeat_diff = time.ticks_diff(current_time, self.last_heartbeat_time)
                if heartbeat_diff > HEARTBEAT_INTERVAL_MS * 2:
                    print("Heartbeat delay detected")
                    asyncio.create_task(self.send_heartbeat())

                self.last_system_check = current_time

            except Exception as e:
                print(f"Error in system status check: {str(e)}")

    async def start_monitoring(self):
        """Main monitoring loop"""
        print("Starting waste bin monitoring...")
        
        while True:
            try:
                # System status check
                self.check_system_status()

                # Measure distances
                waste_distance = self.measure_distance(self.trig_waste, self.echo_waste, "Waste Level")
                lid_distance = self.measure_distance(self.trig_lid, self.echo_lid, "Lid Control")
                
                # Calculate fill percentage
                fill_percentage = self.calculate_fill_percentage(waste_distance)
                
                # Control lid based on proximity
                bin_lid_status = "OPEN" if lid_distance <= 20 else "CLOSED"
                self.control_servo(bin_lid_status)
                
                # Prepare sensor data
                sensor_data = {
                    "id": 1,
                    "binLocation": "Canteen",
                    "distance": waste_distance,
                    "filledBinPercentage": fill_percentage,
                    "geoLocation": self.location_data,
                    "microProcessorStatus": "ON",
                    "sensorStatus": "ON" if waste_distance >= 0 else "OFF",
                    "binLidStatus": bin_lid_status,
                    "maxBinCapacity": BIN_MAX_CAPACITY
                }

                # Send data if significant changes detected
                if (self.last_distances['waste'] is None or 
                    abs(self.last_distances['waste'] - waste_distance) > DISTANCE_THRESHOLD):
                    await self.send_data(API_ENDPOINTS['sensor_data'], sensor_data)
                    self.last_distances['waste'] = waste_distance

                # Manual heartbeat if timer failed
                if not self.heartbeat_timer:
                    current_time = time.ticks_ms()
                    if time.ticks_diff(current_time, self.last_heartbeat_time) >= HEARTBEAT_INTERVAL_MS:
                        await self.send_heartbeat()

                await asyncio.sleep_ms(100)

            except Exception as e:
                print(f"Error in main loop: {str(e)}")
                await asyncio.sleep_ms(1000)

async def main():
    """Main function to initialize and run the smart waste bin system"""
    try:
        waste_bin = SmartWasteBin()
        waste_bin.connect_wifi()
        waste_bin.setup_heartbeat_timer()
        await waste_bin.start_monitoring()
    except Exception as e:
        print(f"Critical error: {str(e)}")
        machine.reset()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except Exception as e:
        print(f"An error occurred: {e}")  # Handle the exception here