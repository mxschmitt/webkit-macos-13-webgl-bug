# Requires
# sudo "/Applications/Safari Technology Preview.app/Contents/MacOS/safaridriver" --enable.
from selenium import webdriver
from selenium.common.exceptions import TimeoutException
import subprocess
import time


def setup_safari_tp_driver():
    # Set up the Safari Technology Preview driver
    options = webdriver.SafariOptions()
    options.use_technology_preview = True
    return webdriver.Safari(options=options)

def start_local_server():
    # Start a simple HTTP server to serve the local WebGL script
    server_process = subprocess.Popen(["python", "-m", "http.server", "8000"])
    time.sleep(2)  # Give the server a moment to start
    return server_process

def stop_local_server(server_process):
    server_process.terminate()

def main():
    driver = setup_safari_tp_driver()
    server_process = start_local_server()

    try:
        # Navigate to the local WebGL script
        driver.get(f"http://localhost:8000/webgl.html")
        driver.save_screenshot("screenshot.png")

    except TimeoutException:
        print("Timed out waiting for page to load")
    except Exception as e:
        print(f"An error occurred: {str(e)}")
    finally:
        driver.quit()
        stop_local_server(server_process)

if __name__ == "__main__":
    main()