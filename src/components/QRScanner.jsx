/**
 * QRScanner.jsx
 *
 * This component allows users to scan QR codes in two ways:
 * 1. Using their device's camera (live video scanning)
 * 2. Uploading an image file containing a QR code
 *
 * When a QR code is detected, it calls the onDetected callback with the decoded data.
 *
 * How it works:
 * - Camera mode: Opens the device camera and continuously scans each video frame
 * - Upload mode: User selects an image file, which is then scanned for QR codes
 * - Uses the jsQR library to decode QR codes from image data
 *
 * Props:
 * @param {Function} onDetected - Callback function called when a QR code is found
 *                                Receives the decoded QR data as a string parameter
 *
 * Example usage:
 * <QRScanner onDetected={(data) => console.log('Scanned:', data)} />
 */

import React, { useRef, useEffect, useState } from "react";
import jsQR from "jsqr";

export default function QRScanner({ onDetected }) {
  // Refs: Allow us to directly access DOM elements (video and canvas)
  const videoRef = useRef(null); // Reference to the <video> element
  const canvasRef = useRef(null); // Reference to the <canvas> element (for image processing)

  // State: Track whether the camera is currently scanning
  const [running, setRunning] = useState(false);

  // State: Store any error messages to display to the user
  const [error, setError] = useState(null);

  /**
   * Effect: Manages the camera scanning lifecycle
   * Runs whenever the 'running' state changes
   * - When running=true: Start camera and begin scanning frames
   * - When running=false or component unmounts: Stop camera and cleanup
   */
  useEffect(() => {
    let rafId = null; // RequestAnimationFrame ID for cancelling the scanning loop
    let stream = null; // MediaStream from the camera

    /**
     * Start the camera and begin scanning for QR codes
     */
    async function start() {
      try {
        // Request access to the device's camera
        // facingMode: "environment" tries to use the back camera (better for scanning)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });

        // Attach the camera stream to the video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Get the 2D drawing context from the canvas (for image processing)
        const ctx = canvasRef.current.getContext("2d");

        /**
         * Scanning loop: Continuously process video frames looking for QR codes
         * This function calls itself repeatedly using requestAnimationFrame
         */
        const tick = () => {
          // Check if video is ready to be read
          if (
            !videoRef.current ||
            videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA
          ) {
            rafId = requestAnimationFrame(tick); // Try again on next frame
            return;
          }

          // Get the dimensions of the video frame
          const vw = videoRef.current.videoWidth;
          const vh = videoRef.current.videoHeight;
          if (vw === 0 || vh === 0) {
            rafId = requestAnimationFrame(tick); // Video not ready yet
            return;
          }

          // Resize canvas to match video dimensions
          canvasRef.current.width = vw;
          canvasRef.current.height = vh;

          // Draw the current video frame onto the canvas
          ctx.drawImage(videoRef.current, 0, 0, vw, vh);

          // Get the raw pixel data from the canvas
          const imageData = ctx.getImageData(0, 0, vw, vh);

          // Try to find and decode a QR code in the image data
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            // QR code found! Call the callback with the decoded data
            onDetected && onDetected(code.data);
            stop(); // Stop scanning after finding a code
            return;
          }

          // No QR code found in this frame, continue scanning
          rafId = requestAnimationFrame(tick);
        };

        // Start the scanning loop
        rafId = requestAnimationFrame(tick);
      } catch (err) {
        // Handle errors (e.g., camera permission denied)
        setError(String(err));
      }
    }

    /**
     * Stop the camera and cancel the scanning loop
     */
    function stop() {
      setRunning(false);

      // Cancel the animation frame loop
      if (rafId) cancelAnimationFrame(rafId);

      // Stop all camera tracks (turns off the camera)
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    }

    // Start camera if running is true
    if (running) start();

    // Cleanup function: Runs when component unmounts or when dependencies change
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [running, onDetected]);

  /**
   * Handle file upload for scanning QR codes from images
   * Called when user selects an image file
   *
   * @param {Event} e - The file input change event
   */
  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return; // No file selected

    // FileReader: Reads the file and converts it to a data URL
    const reader = new FileReader();

    reader.onload = () => {
      // Create an Image object to load the file
      const img = new Image();

      img.onload = () => {
        // Once image is loaded, draw it on the canvas
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get pixel data from the canvas
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Try to find and decode a QR code in the image
        const code = jsQR(imageData.data, imageData.width, imageData.height);

        if (code) {
          // QR code found! Call the callback
          onDetected && onDetected(code.data);
        } else {
          // No QR code found in the uploaded image
          setError("No QR code found in image");
        }
      };

      // Set the image source to the file data URL (triggers img.onload)
      img.src = reader.result;
    };

    // Read the file as a data URL (base64 encoded string)
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {/* Control buttons and file input */}
      <div>
        {/* Toggle camera scanning on/off */}
        <button onClick={() => setRunning((r) => !r)}>
          {running ? "Stop camera" : "Start camera scan"}
        </button>

        {/* File input for uploading images containing QR codes */}
        <input
          type="file"
          accept="image/*" // Only allow image files
          onChange={handleFile}
          style={{ marginLeft: 8 }}
        />
      </div>

      {/* Video and canvas elements */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
        {/* Video element shows the live camera feed */}
        <video
          ref={videoRef}
          style={{ width: 320, height: 240, background: "#000" }}
        />

        {/* Canvas is hidden but used for processing frames */}
        <canvas ref={canvasRef} style={{ display: "none" }} />
      </div>

      {/* Display error messages if any */}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
