# Execution Plan and AI Prompts

This is a sequential list of tasks. Execute them one by one. Before each task, review its "Verification" section.

---
**1. Task: Create the project structure for TailwindCSS**
* **Command:** Create the following folder and file structure for a TypeScript/React/TailwindCSS project. The component files will be placed directly in the `components` directory. Also create the necessary configuration files for TailwindCSS.
    ```
    /
    |-- /src
    |   |-- /components
    |   |   |-- ControlPanel.tsx
    |   |   |-- SceneViewer.tsx
    |   |   |-- DateSlider.tsx
    |   |   |-- TimeSlider.tsx
    |   |   |-- CompassDisplay.tsx
    |   |   |-- TransparencySlider.tsx
    |   |   |-- SunlightChart.tsx
    |   |   |-- LocationPickerModal.tsx
    |   |-- /views
    |   |   |-- MainView.tsx
    |   |-- App.tsx
    |   |-- index.css
    |-- tailwind.config.js
    |-- postcss.config.js
    |-- REQUIREMENTS.md
    |-- UI_DESIGN.md
    |-- AI_CONTRACT.md
    ```
* **Verification:**
    1.  Does the `/src/components` directory exist and contain 8 empty `.tsx` component files?
    2.  Does the `/src/views` directory exist and contain the empty `MainView.tsx` file?
    3.  Does the `/src` directory contain an empty `index.css` file (for Tailwind directives)?
    4.  Are `tailwind.config.js` and `postcss.config.js` present in the project root?
    5.  Are the three markdown documentation files present in the project root?

---
**2. Task: Create the structure of the `ControlPanel` component**
* **Command:** In the `src/components/ControlPanel.tsx` file, create the skeleton for the `ControlPanel` React component. Render all the static UI elements as specified in `UI_DESIGN.md`, assigning the correct `id` attributes. Use placeholder TailwindCSS classes for basic layout if needed.
* **Verification:**
    1.  Does the file `src/components/ControlPanel.tsx` contain a React component named `ControlPanel`?
    2.  Does the component render a button with `id="upload-model-button"` and text "Upload 3D Model"? (AC1.1)
    3.  Does it render a helper text element containing the specified text about `.glb` and "Tinkercad"? (AC1.2)
    4.  Is the word "Tinkercad" a link with `id="tinkercad-link"`? (AC1.3)
    5.  Does it render a button with `id="upload-map-button"`? (AC5.1)
    6.  Does it render a button with `id="add-floor-plan-button"`? (AC7.1)
    7.  Does it render a switch with `id="edit-mode-toggle"` and the label "Edit Mode"? (AC5.3)
    8.  Does it render a button group with `id="weather-selector"` containing three options: `id="weather-selector-sunny"`, `id="weather-selector-cloudy"`, and `id="weather-selector-rainy"`? (AC9.1)
    9.  Does it render a button with `id="set-location-button"`?

---
**3. Task: Create the structure of the slider and display components**
* **Command:** Create the basic component structure for `DateSlider`, `TimeSlider`, `CompassDisplay`, and `TransparencySlider`. In each corresponding `.tsx` file, create a React component that renders the static elements described in `UI_DESIGN.md` with their `id`s.
* **Verification:**
    1.  **DateSlider:** Does `src/components/DateSlider.tsx` render a slider element with `id="date-slider"`? (Part of FR2)
    2.  **TimeSlider:** Does `src/components/TimeSlider.tsx` render a vertical slider element with `id="time-slider"`? (Part of FR2)
    3.  **CompassDisplay:** Does `src/components/CompassDisplay.tsx` render a container element with `id="compass-display"` and labels for N, S, W, E? (AC3.1, AC3.2)
    4.  **TransparencySlider:** Does `src/components/TransparencySlider.tsx` render a slider element with `id="transparency-slider"`? (AC8.1)

---
**4. Task: Create the structure of the `SunlightChart` component**
* **Command:** In `src/components/SunlightChart.tsx`, create the structure for the `SunlightChart` component. It should include a toggle bar and a hidden container for the chart canvas.
* **Verification:**
    1.  Does the component render a clickable element with `id="chart-toggle-bar"`? (AC11.1)
    2.  Does the component contain a chart canvas element with `id="sunlight-chart-canvas"`? (Part of AC11.4)
    3.  Is the container for the chart canvas hidden by default?

---
**5. Task: Create the structure of the `LocationPickerModal` component**
* **Command:** In `src/components/LocationPickerModal.tsx`, create the structure for the `LocationPickerModal` component. Render all elements as specified in the UI design, including buttons and the map container. The map container should be hidden initially.
* **Verification:**
    1.  Does the component render a header with the text "Set Location"?
    2.  Does it render a button with `id="geolocate-button"`? (AC10.1)
    3.  Does it render a button with `id="pick-on-map-button"`? (AC10.1)
    4.  Does it render a hidden map container with `id="map-container"`?
    5.  Does it render footer buttons with `id="map-confirm-button"` and `id="location-cancel-button"`?

---
**6. Task: Create the structure of the `SceneViewer` component**
* **Command:** In `src/components/SceneViewer.tsx`, create the `SceneViewer` component. It should render a single `canvas` element that will be used for the 3D scene.
* **Verification:**
    1.  Does the `src/components/SceneViewer.tsx` file define a `SceneViewer` component?
    2.  Does the component's render method return a single `canvas` element?

---
**7. Task: Assemble the `MainView`**
* **Command:** In `src/views/MainView.tsx`, create the `MainView` component. Import and arrange all the UI components created so far (`ControlPanel`, `SceneViewer`, `DateSlider`, `TimeSlider`, `CompassDisplay`, `TransparencySlider`, `SunlightChart`) according to the layout described in `UI_DESIGN.md`. The `LocationPickerModal` should not be rendered here yet.
* **Verification:**
    1.  Is the `SceneViewer` component placed in the central area?
    2.  Is the `ControlPanel` positioned on the left?
    3.  Is the `DateSlider` at the bottom?
    4.  Is the `SunlightChart` positioned above the `DateSlider`?
    5.  Is the `TimeSlider` on the right?
    6.  Is the `TransparencySlider` in the bottom-right corner?
    7.  Is the `CompassDisplay` in the bottom-left corner?

---
**8. Task: Implement the initial 3D Scene**
* **Command:** In the `SceneViewer` component, use a 3D library (e.g., Three.js) to initialize a basic scene. The scene should include:
    * A renderer attached to the canvas.
    * An orthographic camera. (AC4.1)
    * Basic ambient light. (AC6.3)
    * A main directional light source. (AC6.1)
    * A ground plane with a visible grid helper. (AC4.4)
* **Verification:**
    1.  When the application runs, is a 3D scene with a ground plane and grid visible?
    2.  Is the projection orthographic (isometric), not perspective? (AC4.1)
    3.  Is the scene lit, preventing any part from being completely black? (AC6.3)

---
**9. Task: Implement Camera Controls**
* **Command:** In the `SceneViewer` component, implement camera controls. The user should be able to rotate the view around the central point and zoom.
* **Verification:**
    1.  Can the user rotate the camera by clicking and dragging the mouse? (AC4.2)
    2.  Can the user zoom in and out using the mouse scroll wheel? (AC4.3)
    3.  Is vertical camera rotation limited to prevent looking at the scene from below? (AC4.5)

---
**10. Task: Implement Model Upload and Display**
* **Command:** Connect the `ControlPanel`'s "Upload 3D Model" button to the `SceneViewer`. Implement the logic to open a file dialog filtered for `.glb` files. When a file is selected, load the `.glb` model and display it in the center of the scene.
* **Verification:**
    1.  Does clicking the `#upload-model-button` open a system file dialog? (AC1.4)
    2.  Is the file dialog filtered to show only `.glb` files? (AC1.4)
    3.  After selecting a valid `.glb` file, does the model appear in the 3D scene? (AC1.5)
    4.  Does the "Tinkercad" link (`#tinkercad-link`) open `https://www.tinkercad.com` in a new tab? (AC1.3)

---
**11. Task: Implement Time and Date Slider Logic**
* **Command:** Implement the logic for the `DateSlider` and `TimeSlider` components. Their state should be managed. Connect their `onChange` events to a function in a parent component (`MainView` or a global state) that updates the sun's position in the `SceneViewer`. For now, you can simulate the sun's position change by moving the directional light source.
* **Verification:**
    1.  Does moving the `DateSlider` thumb update a date value in the application's state?
    2.  Does moving the `TimeSlider` thumb update a time value in the application's state?
    3.  Does changing either slider cause the directional light's position/angle in the `SceneViewer` to change immediately? (AC2.4)
    4.  Does the change in light position cause shadows to be re-rendered? (AC2.5)

---
**12. Task: Implement Sun Path and Compass**
* **Command:** Based on the selected date and time, calculate and render the sun's path as an arc in the sky in `SceneViewer`. Also, implement the `CompassDisplay` logic so that it rotates correctly as the user rotates the camera view, always indicating the true North.
* **Verification:**
    1.  Is an arc-shaped line visible in the 3D scene? (AC3.4)
    2.  Does the directional light source (the "sun") move along this arc as the time slider is adjusted? (AC3.5)
    3.  Is the North direction ('N') on the compass highlighted? (AC3.2)
    4.  Does the compass element rotate in the opposite direction of the camera rotation, so 'N' always points to the same world coordinate? (AC3.3)

---
**13. Task: Implement Remaining `ControlPanel` Logic**
* **Command:** Implement the logic for the remaining controls in the `ControlPanel`: Weather selection, Map Upload, and Floor Plan Upload. The map and floor plan buttons should open a file dialog for images. The weather selector should update an application state that will later be used to adjust lighting.
* **Verification:**
    1.  Does clicking the `#upload-map-button` open a file dialog for images? (AC5.1)
    2.  Does clicking the `#add-floor-plan-button` open a file dialog for images? (AC7.1)
    3.  Does changing the selection in `#weather-selector` update the application's state to "Sunny", "Cloudy", or "Rainy"?
    4.  Is the selected weather mode persisted in the browser's local storage? (AC9.5)

---
**14. Task: Implement `LocationPickerModal` Logic**
* **Command:** Implement the complete functionality of the `LocationPickerModal`.
    * Clicking "Use my location" should trigger the browser's Geolocation API.
    * Clicking "Choose on map" should display the map container.
    * The "Accept" button should pass the selected coordinates back to the main application and close the modal.
    * The selected coordinates should be persisted in local storage.
* **Verification:**
    1.  Does the modal appear when the `#set-location-button` in the `ControlPanel` is clicked?
    2.  Does clicking `#geolocate-button` prompt the user for location access? (AC10.2)
    3.  Does clicking `#pick-on-map-button` show the `#map-container`? (AC10.3)
    4.  Upon closing the modal with "Accept" or after geolocation, are the latitude/longitude coordinates saved in the browser's storage? (AC10.5)

---
**15. Task: Implement Cross-Section and Transparency**
* **Command:** Implement the cross-section functionality. When a floor plan is active, use its height to create a clipping plane in the `SceneViewer` that makes the upper part of the model transparent. Connect the `TransparencySlider` to control the opacity of this clipped part.
* **Verification:**
    1.  After activating a floor plan, does the part of the 3D model above a certain height become transparent? (AC7.3)
    2.  Is the "cut" surface of the model rendered as a solid, filled shape? (AC7.4)
    3.  Does the transparent upper part still cast a correct shadow? (AC7.6)
    4.  Does moving the `#transparency-slider` change the opacity of the transparent part of the model in real-time? (AC8.2)
    5.  Is the slider's value saved to and restored from browser storage? (AC8.3)

---
**16. Task: Implement `SunlightChart` Logic**
* **Command:** Implement the logic for the `SunlightChart`. The toggle bar should show/hide the chart container. When visible, the chart should display the light intensity for the currently selected day (from `DateSlider`).
* **Verification:**
    1.  Does clicking `#chart-toggle-bar` show and hide the chart container without animation? (AC11.1, AC11.2)
    2.  Does the chart's X-axis represent 24 hours and the Y-axis represent light intensity? (AC11.3)
    3.  Does the chart display a line graph with a gradient fill underneath? (AC11.4, AC11.5)
    4.  Are sunrise and sunset times marked with vertical lines? (AC11.6)
    5.  Does the chart's data automatically update when the `DateSlider` value changes? (AC11.7)
