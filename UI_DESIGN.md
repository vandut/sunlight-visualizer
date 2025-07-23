# User Interface (UI) Design for: Sunlight Visualizer

**Design System:** Material Design

---

## 1. View: / (Main Application Screen)
* **Purpose:** The main workspace of the application, allowing for model uploading, 3D scene manipulation, simulation control, and data analysis. Implements: FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9, FR10, FR11.
* **Layout:** A full-screen application. The central area is occupied by the 3D view. Controls are overlaid on this view: a panel with main actions is on the left, a date slider and a collapsible chart are at the bottom, a time-of-day slider and a transparency slider are on the right, and a compass is in the bottom-left corner.
* **Components:**
    * `ControlPanel`
    * `SceneViewer`
    * `DateSlider`
    * `TimeSlider`
    * `CompassDisplay`
    * `TransparencySlider`
    * `SunlightChart`
    * `LocationPickerModal` (described as a separate view)

### 1.1. Component: ControlPanel
* **Description:** A vertical panel on the left side of the screen, grouping all main actions and configuration options.
* **Elements:**
    * **Button:** Style: `primary`, with a file upload icon. Text: "Upload 3D Model". `id="upload-model-button"`. (Implements: AC1.1, AC1.4).
    * **Helper Text (Typography):** Small text below the model upload button. Text: "Need a 3D model? Use the **.glb** format. You can create one for free with **Tinkercad**.". (Implements: AC1.2).
        * **Link:** The "Tinkercad" text is an active link. `id="tinkercad-link"`. (Implements: AC1.3).
    * **Button:** Style: `secondary`, with a map icon. Text: "Upload Map". `id="upload-map-button"`. (Implements: AC5.1).
    * **Button:** Style: `secondary`, with a floor plan icon. Text: "Add Floor Plan". `id="add-floor-plan-button"`. (Implements: AC7.1).
    * **Switch:** `label`: "Edit Mode". `id="edit-mode-toggle"`. (Implements: AC5.3, AC5.4, AC7.2).
    * **Divider:** A line separating sections.
    * **Button Group / Segmented Control:** `label`: "Weather". `id="weather-selector"`. (Implements: AC9.1).
        * **Option 1:** Text: "Sunny". `id="weather-selector-sunny"`. (Default selection). (Implements: AC9.2).
        * **Option 2:** Text: "Cloudy". `id="weather-selector-cloudy"`. (Implements: AC9.3).
        * **Option 3:** Text: "Rainy". `id="weather-selector-rainy"`. (Implements: AC9.4).
    * **Button:** Style: `secondary`, with a location icon. Text: "Set Location". `id="set-location-button"`. (Implements: part of AC10.1).
* **Interactions:**
    * Clicking `#upload-model-button` opens the system file selection window for `.glb` files.
    * Clicking `#upload-map-button` opens the system file selection window for image files.
    * Clicking `#add-floor-plan-button` opens the system file selection window for image files.
    * Clicking `#set-location-button` opens the `LocationPickerModal` component.
    * Changing the option in `#weather-selector` immediately updates the lighting in the `SceneViewer`.

### 1.2. Component: SceneViewer
* **Description:** The main, central area of the application that renders the 3D scene.
* **Elements:**
    * **3D Canvas:** The element where the scene with the model, ground, shadows, and sun is rendered. (Implements: FR4, FR6).
    * **Ground Grid (Grid Helper):** A grid visible on the ground plane. (Implements: AC4.4).
    * **Ground Map (Texture):** A map texture applied to the ground plane after being uploaded by the user. (Implements: AC5.2).
    * **3D Model (Mesh):** The imported `.glb` object. (Implements: AC1.5).
    * **Sun Path Arc (Line):** An arc-shaped line showing the sun's trajectory. (Implements: AC3.4, AC3.5, AC3.6).
    * **Cross-Section Plane (Clipping Plane):** An invisible plane that cuts the model at a specific height, with a visible, filled cross-section. (Implements: AC7.3, AC7.4).
* **Interactions:**
    * Dragging with the mouse or using touch gestures rotates the camera around the model. (Implements: AC4.2).
    * The mouse wheel or a "pinch-to-zoom" gesture zooms the camera in and out. (Implements: AC4.3).

### 1.3. Component: DateSlider
* **Description:** A horizontal slider at the bottom of the screen for selecting the day of the year.
* **Elements:**
    * **Slider:** A horizontal slider covering a range of 365 days. `id="date-slider"`. (Implements: part of FR2).
    * **Ticks:** A scale with visible, bolded ticks and labels with month initials (J, F, M, A, ...). (Implements: AC2.1).
    * **Thumb:** A clearly marked symbol on the slider indicating the currently selected day. (Implements: AC2.3).
* **Interactions:**
    * Moving the slider immediately updates the sun's position in the `SceneViewer` and the data in the `SunlightChart`. (Implements: AC2.4, AC11.7).

### 1.4. Component: TimeSlider
* **Description:** A vertical slider on the right side of the screen for selecting the time of day.
* **Elements:**
    * **Slider:** A vertical slider covering a 24-hour range (1440 minutes). `id="time-slider"`. (Implements: part of FR2).
    * **Ticks:** A scale with visible, bolded ticks and labels with numbers for full hours (0, 1, 2, ...). (Implements: AC2.2).
    * **Thumb:** A clearly marked symbol on the slider indicating the currently selected time. (Implements: AC2.3).
* **Interactions:**
    * Moving the slider immediately updates the sun's position and shadows in the `SceneViewer`. (Implements: AC2.4, AC2.5).

### 1.5. Component: CompassDisplay
* **Description:** A simple compass displayed in the bottom-left corner of the 3D view.
* **Elements:**
    * **Compass Dial (UI Element):** A graphical representation of a compass. `id="compass-display"`. (Implements: AC3.1).
    * **Direction Markers (Labels):** N, S, W, E labels. The North (N) direction is visually highlighted (e.g., with a different color or size). (Implements: AC3.2).
* **Interactions:**
    * The compass rotates in response to the user's camera rotation, always pointing to the same geographical north. (Implements: AC3.3).

### 1.6. Component: TransparencySlider
* **Description:** A small, discreet slider in the bottom-right corner of the screen for adjusting the cross-section's transparency.
* **Elements:**
    * **Slider:** A horizontal or vertical slider with a range of 0-100%. `id="transparency-slider"`. (Implements: AC8.1).
    * **Icon:** An icon symbolizing transparency (e.g., a checkerboard pattern) next to the slider.
* **Interactions:**
    * Moving the slider changes the transparency of the upper, "cut-off" part of the model in the `SceneViewer` in real-time. (Implements: AC8.2).

### 1.7. Component: SunlightChart
* **Description:** A collapsible panel at the bottom of the screen (above the `DateSlider`) that displays a sunlight chart for the selected day.
* **Elements:**
    * **Toggle Bar:** A clickable element with the text "Show Chart" / "Hide Chart". `id="chart-toggle-bar"`. (Implements: AC11.1, AC11.2).
    * **Chart Container:** The area whose visibility is toggled.
        * **Chart Canvas:** A canvas element where the line chart with a gradient fill is drawn. `id="sunlight-chart-canvas"`. (Implements: AC11.3, AC11.4, AC11.5).
        * **Helper Lines:** Vertical lines on the chart marking sunrise and sunset. (Implements: AC11.6).

---

## 2. View: LocationPickerModal
* **Purpose:** Allows the user to set the geographic location for the simulation (implements: FR10).
* **Layout:** A modal dialog window displayed in the center of the screen, overlaying the main application view. It consists of a header, a content area, and a footer with action buttons.
* **Components:**
    * `LocationPickerModal`

### 2.1. Component: LocationPickerModal
* **Description:** A complete modal window component for selecting a location.
* **Elements:**
    * **Header (h2):** Text: "Set Location".
    * **Button:** Style: `primary`. Text: "Use my location". `id="geolocate-button"`. (Implements: AC10.1, AC10.2).
    * **Button:** Style: `secondary`. Text: "Choose on map". `id="pick-on-map-button"`. (Implements: AC10.1, AC10.3).
    * **Map Container:** `id="map-container"`. Initially hidden. Contains an interactive map with a static crosshair in the center.
    * **Modal Footer:**
        * **Button:** Text: "Accept". `id="map-confirm-button"`. Visible only when the map view is active. (Implements: AC10.4).
        * **Button:** Text: "Cancel". `id="location-cancel-button"`.
* **Interactions:**
    * After clicking `#pick-on-map-button`, the choice buttons are hidden, and the `#map-container` appears in their place. The user can pan and zoom the map.
    * Clicking `#map-confirm-button` saves the coordinates of the map's center and closes the modal.
    * Clicking `#geolocate-button` triggers the browser's geolocation API, and upon consent, saves the coordinates and closes the modal.
    * Clicking "Cancel" or the modal's close icon closes the window without saving any changes.
