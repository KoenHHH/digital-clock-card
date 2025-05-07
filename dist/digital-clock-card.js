class DigitalClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Create the card's container
    const card = document.createElement('ha-card');
    const content = document.createElement('div');
    content.className = 'card-content';
    card.appendChild(content);
    this.shadowRoot.appendChild(card);
    
    // Save references
    this.card = card;
    this.content = content;
    
    // Apply base styles
    this._applyStyles();
  }
  
  _applyStyles() {
    // Add a style element to the shadow DOM
    const style = document.createElement('style');
    style.textContent = `
      .card-content {
        width: 100%;
        padding: 16px;
        box-sizing: border-box;
      }
      .clock-container {
        display: flex;
        width: 100%;
      }
    `;
    this.shadowRoot.appendChild(style);
  }

  setConfig(config) {
    if (!config.entity && (!config.entity || !config.entity.startsWith('sensor.'))) {
      throw new Error('Please define a sensor entity');
    }
    
    this.config = {
      entity: config.entity || 'sensor.time',
      show_name: config.show_name !== undefined ? config.show_name : false,
      show_icon: config.show_icon !== undefined ? config.show_icon : false,
      name: config.name,
      // Clock format options
      use_24h_format: config.use_24h_format !== undefined ? config.use_24h_format : true,
      
      // Layout configuration
      width_svg: config.width_svg || '100%',
      height_svg: config.height_svg || '120',
      margin_div: config.margin_div || '0',
      align_items: config.align_items || 'center',
      justify_content: config.justify_content || 'center',
      
      // Color configuration
      background_color: config.background_color || 'transparent',
      digit_color: config.digit_color || 'white',
      dimmed_color: config.dimmed_color || 'rgba(255,255,255,0.3)',
      text_color: config.text_color || 'white',
      
      // Clock dimensions
      clock_center_x: config.clock_center_x || 150,
      clock_center_y: config.clock_center_y || 85,
      
      // Digital clock dimensions
      digit_width: config.digit_width || 40,
      digit_height: config.digit_height || 75,
      digit_spacing: config.digit_spacing || 10,
      segment_thickness: config.segment_thickness || 8,
      
      // Background rectangle dimensions
      rect_x: config.rect_x || 40,
      rect_y: config.rect_y || 10,
      rect_width: config.rect_width || 220,
      rect_height: config.rect_height || 100,
    };
    
    // If dimmed_color is set to 'none', use a semi-transparent version of the digit color
    if (this.config.dimmed_color === 'none') {
      // Parse the digit color to make it semi-transparent
      if (this.config.digit_color.startsWith('#')) {
        this.config.dimmed_color = this.config.digit_color + '4D';  // Add 30% opacity
      } else {
        this.config.dimmed_color = 'rgba(255,255,255,0.3)';
      }
    }
  }

  getCardSize() {
    return 3;
  }

  static getStubConfig() {
    return {
      entity: "sensor.time",
      use_24h_format: true,
      background_color: "transparent",
      digit_color: "white",
      dimmed_color: "rgba(255,255,255,0.3)",
      width_svg: "100%",
      height_svg: "120",
      justify_content: "center",
      margin_div: "0"
    };
  }

  static getConfigElement() {
    return document.createElement("digital-clock-card-editor");
  }

  renderClock(hass) {
    const entity = hass.states[this.config.entity];
    if (!entity) {
      return `<div>Entity ${this.config.entity} not found.</div>`;
    }
    
    // Get current time from the entity or system
    let timeStr = entity.state;
    
    // Calculate the current time from time entity
    let time = new Date();
    if (timeStr) {
      // Handle time format (HH:MM or HH:MM:SS)
      let [hours, minutes] = timeStr.split(':').map(Number);
      time.setHours(hours);
      time.setMinutes(minutes);
    }
    
    // Format time based on user preference
    let use24hFormat = this.config.use_24h_format;
    let hours = use24hFormat ? 
      time.getHours().toString().padStart(2, '0') : 
      (time.getHours() % 12 || 12).toString().padStart(2, '0');
    let minutes = time.getMinutes().toString().padStart(2, '0');
    
    // Split time into individual digits
    let hourDigit1 = hours.charAt(0);
    let hourDigit2 = hours.charAt(1);
    let minuteDigit1 = minutes.charAt(0);
    let minuteDigit2 = minutes.charAt(1);
    
    // Get styling configuration
    let widthSVG = this.config.width_svg;
    let heightSVG = this.config.height_svg;
    let justifyContent = this.config.justify_content;
    let alignItems = this.config.align_items;
    let marginDiv = this.config.margin_div;
    let backgroundColor = this.config.background_color;
    let digitColor = this.config.digit_color;
    let dimmedColor = this.config.dimmed_color;
    
    // Digital clock dimensions
    let digitWidth = parseInt(this.config.digit_width);
    let digitHeight = parseInt(this.config.digit_height);
    let digitSpacing = parseInt(this.config.digit_spacing);
    let segmentThickness = parseInt(this.config.segment_thickness);
    
    // Background rectangle dimensions
    let rectX = parseInt(this.config.rect_x);
    let rectY = parseInt(this.config.rect_y);
    let rectWidth = parseInt(this.config.rect_width);
    let rectHeight = parseInt(this.config.rect_height);
    
    // Calculate starting positions to center the clock on the rectangle
    let totalWidth = 4 * digitWidth + 3 * digitSpacing + segmentThickness;
    let startX = rectX + (rectWidth - totalWidth) / 2;
    let startY = rectY + (rectHeight - digitHeight) / 2;
    
    // Function to draw a 7-segment digit
    function drawDigit(x, y, digit) {
      // Define segment states for each digit
      const segmentStates = {
        '0': [1,1,1,1,1,1,0],
        '1': [0,1,1,0,0,0,0],
        '2': [1,1,0,1,1,0,1],
        '3': [1,1,1,1,0,0,1],
        '4': [0,1,1,0,0,1,1],
        '5': [1,0,1,1,0,1,1],
        '6': [1,0,1,1,1,1,1],
        '7': [1,1,1,0,0,0,0],
        '8': [1,1,1,1,1,1,1],
        '9': [1,1,1,1,0,1,1],
      };
      
      // Get segment states for the current digit
      const segments = segmentStates[digit] || [0,0,0,0,0,0,0];
      
      // Calculate the mitred joins with angles
      const offset = segmentThickness / 2;
      
      // Define segments using polygons
      const segmentPolygons = [
        // a: top horizontal
        `<polygon points="${x+offset},${y} ${x+digitWidth-offset},${y} ${x+digitWidth-offset+offset},${y+offset} ${x+offset-offset},${y+offset}" 
          fill="${segments[0] ? digitColor : dimmedColor}" />`,
        
        // b: top right vertical
        `<polygon points="${x+digitWidth},${y+offset} ${x+digitWidth},${y+digitHeight/2-offset} ${x+digitWidth-offset},${y+digitHeight/2} ${x+digitWidth-offset},${y+offset+offset}" 
          fill="${segments[1] ? digitColor : dimmedColor}" />`,
        
        // c: bottom right vertical
        `<polygon points="${x+digitWidth},${y+digitHeight/2+offset} ${x+digitWidth},${y+digitHeight} ${x+digitWidth-offset},${y+digitHeight-offset-offset} ${x+digitWidth-offset},${y+digitHeight/2+offset-offset}" 
          fill="${segments[2] ? digitColor : dimmedColor}" />`,
        
        // d: bottom horizontal
        `<polygon points="${x},${y+digitHeight} ${x+digitWidth},${y+digitHeight} ${x+digitWidth-offset},${y+digitHeight-offset} ${x+offset+offset},${y+digitHeight-offset}" 
          fill="${segments[3] ? digitColor : dimmedColor}" />`,
        
        // e: bottom left vertical
        `<polygon points="${x},${y+digitHeight/2+offset} ${x},${y+digitHeight} ${x+offset},${y+digitHeight-offset-offset} ${x+offset},${y+digitHeight/2+offset-offset}" 
          fill="${segments[4] ? digitColor : dimmedColor}" />`,
        
        // f: top left vertical
        `<polygon points="${x},${y+offset} ${x},${y+digitHeight/2-offset} ${x+offset},${y+digitHeight/2} ${x+offset},${y+offset+offset}" 
          fill="${segments[5] ? digitColor : dimmedColor}" />`,
        
        // g: middle horizontal
        `<polygon points="${x+offset+offset},${y+digitHeight/2-offset} ${x+digitWidth-offset-offset},${y+digitHeight/2-offset} ${x+digitWidth-offset},${y+digitHeight/2} ${x+offset},${y+digitHeight/2}" 
          fill="${segments[6] ? digitColor : dimmedColor}" />`
      ];
      
      // Join all segment polygons
      return segmentPolygons.join('');
    }
    
    // Draw colon separator with square dots
    function drawColon(x, y) {
      const dotSize = 8;
      const spacing = 5;
      
      return `
        <rect x="${x + spacing}" y="${y + digitHeight/3 - dotSize/2}" width="${dotSize}" height="${dotSize}" fill="${digitColor}" />
        <rect x="${x + spacing}" y="${y + 2*digitHeight/3 - dotSize/2}" width="${dotSize}" height="${dotSize}" fill="${digitColor}" />
      `;
    }
    
    // Calculate position for colon
    let colonX = startX + 2 * digitWidth + digitSpacing;
    
    // Generate and return the SVG clock visualization
    // Apply justify-content and align-items directly to the inner div
    const containerStyle = `
      display: flex; 
      justify-content: ${justifyContent}; 
      align-items: ${alignItems}; 
      margin: ${marginDiv};
      width: 100%;
    `;
    
    return `
      <div class="clock-container" style="${containerStyle}">
        <svg viewBox="0 0 300 120" width="${widthSVG}" height="${heightSVG}" xmlns="http://www.w3.org/2000/svg">
          <!-- Background rectangle -->
          <rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${backgroundColor}" rx="5" ry="5" />
          
          <!-- Digital clock display -->
          <g>
            ${drawDigit(startX, startY, hourDigit1)}
            ${drawDigit(startX + digitWidth + digitSpacing, startY, hourDigit2)}
            
            ${drawColon(colonX, startY)}
            
            ${drawDigit(startX + 2*(digitWidth + digitSpacing) + segmentThickness, startY, minuteDigit1)}
            ${drawDigit(startX + 3*(digitWidth + digitSpacing) + segmentThickness, startY, minuteDigit2)}
          </g>
        </svg>
      </div>
    `;
  }

  set hass(hass) {
    if (!this.content) return;
    
    this._hass = hass;
    this.content.innerHTML = this.renderClock(hass);
  }
}

customElements.define('digital-clock-card', DigitalClockCard);

// Editor for the card
class DigitalClockCardEditor extends HTMLElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    this._config = { ...config };
    this.loadCardHelpers();
  }

  async loadCardHelpers() {
    this._helpers = await window.loadCardHelpers();
    this._createCardElement();
  }

  async _createCardElement() {
    const helpers = await this._helpers;
    
    this._card = await helpers.createCardElement({
      type: 'entities',
      entities: []
    });
    
    this._card.hass = this._hass;
    this._createForm();
  }

  _createForm() {
    this.innerHTML = '';
    
    // Create a form with the config options
    const form = document.createElement('form');
    form.className = 'digital-clock-card-editor';
    
    // Add styles for the form
    const style = document.createElement('style');
    style.textContent = `
      .digital-clock-card-editor {
        padding: 12px;
      }
      .digital-clock-card-editor .form-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .digital-clock-card-editor .form-row label {
        flex: 1;
      }
      .digital-clock-card-editor .form-row input, 
      .digital-clock-card-editor .form-row select {
        flex: 2;
        max-width: 200px;
      }
    `;
    
    // Add the style element to the document
    this.appendChild(style);
    
    // Function to create a form row
    const createFormRow = (label, input) => {
      const row = document.createElement('div');
      row.className = 'form-row';
      
      const labelEl = document.createElement('label');
      labelEl.innerText = label;
      
      row.appendChild(labelEl);
      row.appendChild(input);
      
      return row;
    };
    
    // Create form fields
    
    // Entity selector
    const entityInput = document.createElement('input');
    entityInput.value = this._config.entity || '';
    entityInput.placeholder = 'sensor.time';
    entityInput.addEventListener('change', (e) => {
      this._updateConfig({ entity: e.target.value });
    });
    form.appendChild(createFormRow('Entity:', entityInput));
    
    // 24h format toggle
    const formatSelect = document.createElement('select');
    formatSelect.innerHTML = `
      <option value="true" ${this._config.use_24h_format !== false ? 'selected' : ''}>24 Hour</option>
      <option value="false" ${this._config.use_24h_format === false ? 'selected' : ''}>12 Hour</option>
    `;
    formatSelect.addEventListener('change', (e) => {
      this._updateConfig({ use_24h_format: e.target.value === 'true' });
    });
    form.appendChild(createFormRow('Time Format:', formatSelect));
    
    // Background color
    const bgColorInput = document.createElement('input');
    bgColorInput.type = 'color';
    bgColorInput.value = this._config.background_color || '#000000';
    bgColorInput.addEventListener('change', (e) => {
      this._updateConfig({ background_color: e.target.value });
    });
    form.appendChild(createFormRow('Background Color:', bgColorInput));
    
    // Digit color
    const digitColorInput = document.createElement('input');
    digitColorInput.type = 'color';
    digitColorInput.value = this._config.digit_color || '#FFFFFF';
    digitColorInput.addEventListener('change', (e) => {
      this._updateConfig({ digit_color: e.target.value });
    });
    form.appendChild(createFormRow('Digit Color:', digitColorInput));
    
    // Dimmed color
    const dimmedColorInput = document.createElement('input');
    dimmedColorInput.type = 'color';
    dimmedColorInput.value = this._config.dimmed_color || '#FFFFFF4D';
    dimmedColorInput.addEventListener('change', (e) => {
      this._updateConfig({ dimmed_color: e.target.value });
    });
    form.appendChild(createFormRow('Dimmed Color:', dimmedColorInput));
    
    // Justify content
    const justifyContentSelect = document.createElement('select');
    justifyContentSelect.innerHTML = `
      <option value="flex-start" ${this._config.justify_content === 'flex-start' ? 'selected' : ''}>Start</option>
      <option value="center" ${this._config.justify_content === 'center' || !this._config.justify_content ? 'selected' : ''}>Center</option>
      <option value="flex-end" ${this._config.justify_content === 'flex-end' ? 'selected' : ''}>End</option>
      <option value="space-between" ${this._config.justify_content === 'space-between' ? 'selected' : ''}>Space Between</option>
      <option value="space-around" ${this._config.justify_content === 'space-around' ? 'selected' : ''}>Space Around</option>
      <option value="space-evenly" ${this._config.justify_content === 'space-evenly' ? 'selected' : ''}>Space Evenly</option>
    `;
    justifyContentSelect.addEventListener('change', (e) => {
      this._updateConfig({ justify_content: e.target.value });
    });
    form.appendChild(createFormRow('Justify Content:', justifyContentSelect));
    
    // Align items
    const alignItemsSelect = document.createElement('select');
    alignItemsSelect.innerHTML = `
      <option value="flex-start" ${this._config.align_items === 'flex-start' ? 'selected' : ''}>Start</option>
      <option value="center" ${this._config.align_items === 'center' || !this._config.align_items ? 'selected' : ''}>Center</option>
      <option value="flex-end" ${this._config.align_items === 'flex-end' ? 'selected' : ''}>End</option>
      <option value="stretch" ${this._config.align_items === 'stretch' ? 'selected' : ''}>Stretch</option>
    `;
    alignItemsSelect.addEventListener('change', (e) => {
      this._updateConfig({ align_items: e.target.value });
    });
    form.appendChild(createFormRow('Align Items:', alignItemsSelect));
    
    // Width SVG
    const widthInput = document.createElement('input');
    widthInput.value = this._config.width_svg || '100%';
    widthInput.addEventListener('change', (e) => {
      this._updateConfig({ width_svg: e.target.value });
    });
    form.appendChild(createFormRow('SVG Width:', widthInput));
    
    // Height SVG
    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.value = this._config.height_svg || '120';
    heightInput.addEventListener('change', (e) => {
      this._updateConfig({ height_svg: e.target.value });
    });
    form.appendChild(createFormRow('SVG Height:', heightInput));
    
    // Segment thickness
    const thicknessInput = document.createElement('input');
    thicknessInput.type = 'number';
    thicknessInput.value = this._config.segment_thickness || '8';
    thicknessInput.addEventListener('change', (e) => {
      this._updateConfig({ segment_thickness: e.target.value });
    });
    form.appendChild(createFormRow('Segment Thickness:', thicknessInput));
    
    // Digit width
    const digitWidthInput = document.createElement('input');
    digitWidthInput.type = 'number';
    digitWidthInput.value = this._config.digit_width || '40';
    digitWidthInput.addEventListener('change', (e) => {
      this._updateConfig({ digit_width: e.target.value });
    });
    form.appendChild(createFormRow('Digit Width:', digitWidthInput));
    
    // Digit height
    const digitHeightInput = document.createElement('input');
    digitHeightInput.type = 'number';
    digitHeightInput.value = this._config.digit_height || '75';
    digitHeightInput.addEventListener('change', (e) => {
      this._updateConfig({ digit_height: e.target.value });
    });
    form.appendChild(createFormRow('Digit Height:', digitHeightInput));
    
    // Digit spacing
    const spacingInput = document.createElement('input');
    spacingInput.type = 'number';
    spacingInput.value = this._config.digit_spacing || '10';
    spacingInput.addEventListener('change', (e) => {
      this._updateConfig({ digit_spacing: e.target.value });
    });
    form.appendChild(createFormRow('Digit Spacing:', spacingInput));
    
    // Margin
    const marginInput = document.createElement('input');
    marginInput.value = this._config.margin_div || '0';
    marginInput.addEventListener('change', (e) => {
      this._updateConfig({ margin_div: e.target.value });
    });
    form.appendChild(createFormRow('Margin:', marginInput));
    
    this.appendChild(form);
  }

  _updateConfig(configUpdate) {
    if (!this._config) return;
    
    // Update the configuration
    this._config = { ...this._config, ...configUpdate };
    
    // Dispatch the event to update the card
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }

  set hass(hass) {
    this._hass = hass;
    if (this._card) this._card.hass = hass;
  }
}

customElements.define("digital-clock-card-editor", DigitalClockCardEditor);

// Register card info
window.customCards = window.customCards || [];
window.customCards.push({
  type: "digital-clock-card",
  name: "Digital Clock Card",
  description: "A customizable 7-segment digital clock display"
});
