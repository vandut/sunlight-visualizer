# Application Requirements Specification: Sunlight Visualizer

## 1. Goal and Vision
* The main goal of the application is to create an interactive tool for visualizing the sunlight exposure of buildings and apartments. The application is intended to help users make informed decisions when purchasing real estate by simulating the incidence of sunlight at different times of the day and year on an uploaded 3D model.

---
## 2. Architecture and Platform
* **Platform:** Web Application
* **Backend Architecture:** Client-side application with no backend (100% of logic on the frontend).
* **Suggested Technologies:** TypeScript, React, Vite, TailwindCSS, a 3D library (e.g., Three.js, Babylon.js).

---
## 3. User Personas
* **P1:** **User** - A person analyzing a property for their own use, who uploads a 3D model and modifies simulation parameters to assess sunlight exposure.

---
## 4. Functional Requirements (FR)

---
**FR1: Uploading a 3D Building Model**
* **Description:** "As a User, I want to upload a 3D building model file so that I can analyze its sunlight exposure in the scene."
* **Acceptance Criteria (AC):**
    * AC1.1: An "Upload 3D Model" button is visible in the interface.
    * AC1.2: Near the upload button, a help text is visible: "Need a 3D model? Use the **.glb** format. You can create one for free with **Tinkercad**."
    * AC1.3: The name "Tinkercad" is a clickable link that opens the `https://www.tinkercad.com` website in a new browser tab.
    * AC1.4: After clicking the "Upload 3D Model" button, a system file selection window opens, filtering for the `.glb` format.
    * AC1.5: After selecting a valid `.glb` file, the model is loaded and displayed in the center of the 3D scene.
    * AC1.6: Attempting to upload a file in a different format results in an error message.

---
**FR2: Controlling Simulation Time with Sliders**
* **Description:** "As a User, I want to use date and time sliders so that I can dynamically change the simulation time and observe the changing position of the sun and shadows."
* **Acceptance Criteria (AC):**
    * AC2.1: A horizontal date slider is visible at the bottom of the screen. It has a visible scale with bolded ticks and initials for months. It allows for the selection of a specific day of the year.
    * AC2.2: A vertical time-of-day slider is visible on the right side of the screen. It has a visible scale with bolded ticks and numbers for full hours. It allows for time selection with minute-level precision.
    * AC2.3: The currently selected date and time are clearly marked with a symbol on the slider tracks.
    * AC2.4: Moving any slider causes an immediate update of the sun's position in the 3D scene.
    * AC2.5: A change in the sun's position causes the shadows cast by the 3D model to be recalculated and re-rendered.

---
**FR3: Displaying Compass and Sun Path**
* **Description:** "As a User, I want to see a compass and the sun's path in the scene so that I can better understand the model's geographical orientation and the sun's all-day trajectory."
* **Acceptance Criteria (AC):**
    * AC3.1: A simple compass is displayed in the bottom-left corner of the 3D view.
    * AC3.2: The compass has direction markers (N, S, W, E), and the North (N) direction is visually highlighted.
    * AC3.3: The compass rotates with the view (camera rotation), always indicating the actual North relative to the model.
    * AC3.4: An arc-shaped line is visible in the sky, representing the sun's path for the selected day.
    * AC3.5: The current position of the sun is marked on the sun path arc, corresponding to the time sliders' settings.
    * AC3.6: The points where the sun path arc intersects the ground plane are marked as sunrise and sunset points.

---
**FR4: Navigating the 3D View (Camera Control)**
* **Description:** "As a User, I want to rotate the view and zoom in/out so that I can view the 3D model from different sides and angles."
* **Acceptance Criteria (AC):**
    * AC4.1: The 3D view uses isometric (orthographic) projection.
    * AC4.2: The user can rotate the view (camera) around the model by dragging with a mouse or using touch gestures.
    * AC4.3: The user can zoom the view in and out using the mouse wheel or a pinch-to-zoom gesture.
    * AC4.4: A grid is visible on the ground plane in the background, which helps with orientation during view rotation.
    * AC4.5: The vertical camera rotation is limited to prevent viewing the scene from below.

---
**FR5: Managing Map and Model Position**
* **Description:** "As a User, I want to upload a map image and place the building model on it so that I can understand the property's environmental context."
* **Acceptance Criteria (AC):**
    * AC5.1: An "Upload Map" button is available in the interface, allowing the user to select an image file (e.g., JPG, PNG).
    * AC5.2: The selected map image is displayed on the ground plane.
    * AC5.3: An "Edit Mode" switch is available, which activates the model positioning mode.
    * AC5.4: In "Edit Mode," the user can move, rotate, and scale the uploaded 3D model.
    * AC5.5: Exiting "Edit Mode" saves the model's transformation and restores the standard camera navigation mode.

---
**FR6: Visualizing Lighting and Shadows**
* **Description:** "As a User, I want to see realistic lighting and shadows cast by the model so that I can accurately assess the level of sunlight."
* **Acceptance Criteria (AC):**
    * AC6.1: The light source simulating the sun is the main directional light source in the scene.
    * AC6.2: The 3D model casts shadows on itself (self-shadowing) and on the ground plane.
    * AC6.3: The scene is additionally lit by ambient light, ensuring that areas in shadow are not completely black.
    * AC6.4: Shadows are clearly visible, and their direction and length correspond to the sun's position in the sky.

---
**FR7: Placing a Floor Plan and Visualizing a Cross-Section**
* **Description:** "As a User, I want to place and adjust a floor plan on the model and then see a cross-section of the building at that height so that I can understand the sunlight exposure of the interior."
* **Acceptance Criteria (AC):**
    * AC7.1: An "Add Floor Plan" option is available, allowing the user to upload an image file.
    * AC7.2: In edit mode, the user can freely move, scale, and rotate the floor plan plane, as well as set its height. The floor plan always remains parallel to the ground.
    * AC7.3: After setting the floor plan's height, the part of the 3D model above that plane becomes transparent.
    * AC7.4: The "cut" plane of the model is visible as a filled surface.
    * AC7.5: Both the filled cut surface and the floor plan itself correctly receive shadows cast by the (invisible) upper part of the model.
    * AC7.6: Despite being transparent, the upper part of the model still correctly casts shadows on the environment.
    * AC7.7: The floor plan plane and the filled cut surface do not cast their own shadows.

---
**FR8: Adjusting Cross-Section Transparency**
* **Description:** "As a User, I want to have direct access to a transparency slider on the main screen so that I can quickly adjust the visibility of the model's cross-section."
* **Acceptance Criteria (AC):**
    * AC8.1: A transparency adjustment slider is visible in the bottom-right corner of the main screen.
    * AC8.2: Moving the slider changes the transparency level of the upper part of the model (as defined in FR7) in real-time.
    * AC8.3: The slider's setting is saved in the browser's storage and is restored after a page refresh.

---
**FR9: Weather Simulation**
* **Description:** "As a User, I want to be able to change the weather conditions so that I can see how cloud cover affects the amount of light reaching the property."
* **Acceptance Criteria (AC):**
    * AC9.1: Three weather options are available in the interface: "Sunny," "Cloudy," and "Rainy."
    * AC9.2: "Sunny" mode (default) simulates lighting at approx. **32,000 - 100,000 lux**. It is characterized by strong directional light and sharp shadows.
    * AC9.3: "Cloudy" mode simulates lighting at approx. **1,000 - 2,000 lux**, with predominantly diffused light and soft shadows.
    * AC9.4: "Rainy" mode simulates lighting at approx. **100 lux**, with almost exclusively diffused light and virtually no visible shadows.
    * AC9.5: The selected weather mode is saved in the browser.

---
**FR10: Setting Geographic Location**
* **Description:** "As a User, I want to set a precise geographic location for my model so that the sun path simulation is accurate for the analyzed site."
* **Acceptance Criteria (AC):**
    * AC10.1: The application offers two methods for setting the location: automatic ("Use my location") and manual ("Choose on map").
    * AC10.2: The automatic method requests access to geolocation and sets the retrieved coordinates.
    * AC10.3: The manual method opens a map view with a fixed crosshair in the center, under which the user can pan and zoom the map.
    * AC10.4: The user confirms the selection on the map with an "Accept" button.
    * AC10.5: The selected location (latitude and longitude) is used for all sun position calculations and is saved in the browser's storage.

---
**FR11: Daily Sunlight Chart**
* **Description:** "As a User, I want to be able to show or hide a sunlight chart so that I can analyze detailed data without cluttering the interface when I don't need it."
* **Acceptance Criteria (AC):**
    * AC11.1: By default, the chart area is hidden; its visibility is toggled by a clickable UI element (e.g., a "Show/Hide Chart" bar).
    * AC11.2: Toggling the chart's visibility is instantaneous, without animation.
    * AC11.3: The chart's horizontal axis (X) represents 24 hours, and the vertical axis (Y) represents light intensity in lux.
    * AC11.4: A line chart shows the light intensity for the selected day, and the area under it is filled with a gradient.
    * AC11.5: The gradient's color corresponds to the natural color of the sky for the given time of day and weather.
    * AC11.6: Vertical lines on the chart mark the sunrise and sunset times.
    * AC11.7: The chart updates when the date is changed on the main slider.

---
## 5. Non-Functional Requirements (NFR)
* **NFR1 (Performance):** Interaction with the interface (moving sliders, rotating the view, changing parameters) must be smooth, without visible delays or stuttering on an average modern computer.
