/**
 * The base Element.
 */
export const modalRoot = `
div#dhp_modal_root {
  overflow: hidden;
  position: fixed;
  width: 20%;
  height: 300px;
  z-index: 99999999;
}`;

export const expandedModal = `
div#dhp_expanded_modal {
  background-color: black;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
  color: white;
  font-family: Arial, sans-serif;
  left: 100px;
  top: 200px;
  width: 100%;
  height: 100%;
}`;

export const resizeHandle = `
div#dhp_resize_handle {
  position: absolute;
  width: 24px;
  height: 24px;
  bottom: 0;
  right: 0;
  cursor: se-resize;
}`;

export const headerDiv = `
div#dhp_header_div {
  cursor: move;
  background-color: grey;
  padding: 5px;
  border-bottom: 1px solid #ffffff;
  display: flex;
  justify-content: flex-end;
  align-items: center;
}`;

export const headerButton = `
button.dhp_header_button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
  margin-left: 5px;
}`;

export const headerButtonHover = `
button.dhp_header_button:hover {
  color: lightgrey;
}`

export const minimizedModal = `
div#dhp_minimized_modal {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: black;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  position: fixed;
  left: 0; /* Ensure the position properties are respected */
  top: 0;  /* Ensure the position properties are respected */
}`