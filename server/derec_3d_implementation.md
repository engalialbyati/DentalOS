# Technical Spec: DEREC-Style Linear 3D Dental Chart

## Objective
Create a specialized 3D React component that mimics the "DEREC" dental software visualization. The key distinction is the **Linear Layout** (teeth arranged in straight rows) rather than a realistic curved jaw.

## 1. Required Dependencies
Ensure the following libraries are installed:
* `three`
* `@react-three/fiber`
* `@react-three/drei`

## 2. Asset Strategy (Crucial)
* **Model Source:** Use a segmented dental model where each tooth is a separate mesh or node.
* **Naming Convention:** Naming must follow ISO/FDI notation (11-18, 21-28, 31-38, 41-48) to allow for algorithmic mapping.
* **Loading:** Use the `useGLTF` hook from `@react-three/drei`.

## 3. The "Linear Layout" Algorithm (The DEREC Clone Logic)
Unlike standard dental charts, do **not** use calculated arch curves. Use a Grid/Flexbox approach in 3D space.

**Positioning Logic:**
1.  **Upper Arch (Row 1):**
    * Filter meshes for IDs 18-11 and 21-28.
    * Align them along the X-axis at `Position Y = +2` (approx).
    * Sort them numerically left-to-right (18 down to 11, then 21 up to 28).
2.  **Lower Arch (Row 2):**
    * Filter meshes for IDs 48-41 and 31-38.
    * Align them along the X-axis at `Position Y = -2` (approx).
    * Sort them numerically left-to-right (48 down to 41, then 31 up to 38).
3.  **Rotation:**
    * Ensure all teeth face "forward" (Z-axis).
    * Apply slight individual rotations if needed for visual gap reduction, but maintain the "straight row" aesthetic.

## 4. Component Architecture Blueprint

### A. `<Tooth />` Component
* **Props:** `id`, `position`, `rotation`, `isSelected`, `onClick`.
* **Visuals:**
    * **Default Material:** White/Off-white standard MeshStandardMaterial.
    * **Selected Material:** Bright Blue (Hex: `#0088FE`) or Red outline (to match DEREC style).
    * **Hover Effect:** Slight scale up or color tint on pointerOver.

### B. `<DentalChart />` Container
* **Camera:** Use `<OrthographicCamera />` instead of Perspective. This flat view is critical to achieving the clean "medical diagram" look of DEREC.
* **Lighting:** Use `<Stage />` with `preset="rembrandt"` or a custom `<AmbientLight />` + `<DirectionalLight />` combo to remove harsh shadows.
* **Controls:** Disable rotation (lock camera). Allow `Pan` (scroll) and `Zoom` only.

## 5. Interaction Logic
* **State Management:** Maintain an array of `selectedTeeth` IDs in the parent component.
* **Multi-Select:** Clicking a tooth should toggle it in the array (allow selecting multiple teeth at once).
* **Output:** The component must expose an `onSelectionChange` event that passes the selected IDs back to the main form.

## 6. Prompt for Code Generation
*(Use this logic when writing the code)*:
"Iterate through the loaded GLTF nodes. Identify teeth by their name/index. Force their position variables (`position.x`, `position.y`) into two fixed arrays (UpperRow, LowerRow) ignoring their original `blender/model` coordinates. This flattens the 3D model into the 2D-style linear view."