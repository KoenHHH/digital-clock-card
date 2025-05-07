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
    
    // Initialize config flag
    this.configInitialized = false;
    
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
      width_svg: config.width_svg || '50%', // Changed from 'auto' to '50%'
      height_svg: config.height_svg || '120',
      margin_div: config.margin_div || '0',
      justify_content: config.justify_content || 'center',
      dimmed_opacity: config.dimmed_opacity !== undefined ? config.dimmed_opacity : 0,
      
      // Card options
      show_card_background: config.show_card_background !== undefined ? config.show_card_background : true,
      
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
    
    // Handle dimmed_color with opacity parameter
    if (this.config.dimmed_color === 'none') {
      const opacity = config.dimmed_opacity !== undefined ? config.dimmed_opacity : 0;
      
      // Convert opacity percentage (0-100) to decimal (0-1)
      const opacityDecimal = opacity / 100;
      
      // Create a color with the specified opacity
      if (this.config.digit_color.startsWith('#')) {
        // For hex colors, convert to rgba
        const r = parseInt(this.config.digit_color.slice(1, 3), 16);
        const g = parseInt(this.config.digit_color.slice(3, 5), 16);
        const b = parseInt(this.config.digit_color.slice(5, 7), 16);
        this.config.dimmed_color = `rgba(${r}, ${g}, ${b}, ${opacityDecimal})`;
      } else if (this.config.digit_color === 'white') {
        this.config.dimmed_color = `rgba(255, 255, 255, ${opacityDecimal})`;
      } else {
        // Default fallback
        this.config.dimmed_color = `rgba(255, 255, 255, ${opacityDecimal})`;
      }
    }
    
    // Apply card background setting
    if (this.card) {
      this.card.style.background = this.config.show_card_background ? '' : 'none';
      this.card.style.boxShadow = this.config.show_card_background ? '' : 'none';
      this.card.style.border = this.config.show_card_background ? '' : 'none';
    }
    
    // Mark config as initialized
    this.configInitialized = true;
    
    // Update rendering if we already have hass data
    if (this._hass) {
      this.content.innerHTML = this.renderClock(this._hass);
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
      dimmed_color: "none",
      dimmed_opacity: 0,
      width_svg: "50%", // Changed from 'auto' to '50%'
      height_svg: "120",
      justify_content: "center",
      margin_div: "0",
      show_card_background: true
    };
  }

  static getConfigElement() {
    return document.createElement("digital-clock-card-editor");
  }

  renderClock(hass) {
    // Check if config is initialized
    if (!this.configInitialized || !this.config) {
      return `<div>Card not configured. Please add configuration.</div>`;
    }
    
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
    
    // Only render if config is initialized
    if (this.configInitialized) {
      this.content.innerHTML = this.renderClock(hass);
    } else {
      this.content.innerHTML = `<div>Card not configured. Please add configuration.</div>`;
    }
  }
}

customElements.define('digital-clock-card', DigitalClockCard);

// Editor for the card
class DigitalClockCardEditor extends HTMLElement {
  static get properties() {
    return { hass: {}, _config: {} };
  }

  setConfig(config) {
    if (!config) {
      config = {};
    }
    this._config = { ...config };
    this.loadCardHelpers();
  }

  async loadCardHelpers() {
    try {
      this._helpers = await window.loadCardHelpers();
      this._createCardElement();
    } catch (error) {
      console.error("Failed to load card helpers:", error);
      this._showErrorInEditor("Failed to load card helpers");
    }
  }

  _showErrorInEditor(message) {
    this.innerHTML = `<div style="color: red; padding: 8px;">${message}</div>`;
  }

  async _createCardElement() {
    try {
      const helpers = await this._helpers;
      
      this._card = await helpers.createCardElement({
        type: 'entities',
        entities: []
      });
      
      if (this._hass) {
        this._card.hass = this._hass;
      }
      
      this._createForm();
    } catch (error) {
      console.error("Failed to create card element:", error);
      this._showErrorInEditor("Failed to create card element");
    }
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
    
    // Create and keep reference to the preview card
    this._previewCard = document.createElement('digital-clock-card');
    if (this._config) {
      this._previewCard.setConfig(this._config);
    }
    if (this._hass) {
      this._previewCard.hass = this._hass;
    }
    
    // Create a preview section
    const previewSection = document.createElement('div');
    previewSection.className = 'preview-section';
    previewSection.style.marginBottom = '20px';
    previewSection.appendChild(this._previewCard);
    
    // Add preview section before the form
    this.appendChild(previewSection);
    
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
    // Add transparency option
    const bgTransparentCheck = document.createElement('input');
    bgTransparentCheck.type = 'checkbox';
    bgTransparentCheck.checked = this._config.background_color === 'transparent';
    bgTransparentCheck.style.marginLeft = '10px';
    bgTransparentCheck.addEventListener('change', (e) => {
      if (e.target.checked) {
        bgColorInput.disabled = true;
        this._updateConfig({ background_color: 'transparent' });
      } else {
        bgColorInput.disabled = false;
        this._updateConfig({ background_color: bgColorInput.value });
      }
    });
    bgColorInput.addEventListener('change', (e) => {
      if (!bgTransparentCheck.checked) {
        this._updateConfig({ background_color: e.target.value });
      }
    });
    const bgRow = createFormRow('Background Color:', bgColorInput);
    const bgTransLabel = document.createElement('label');
    bgTransLabel.innerText = 'Transparent';
    bgTransLabel.style.marginLeft = '10px';
    bgTransLabel.style.flex = '0';
    bgRow.appendChild(bgTransLabel);
    bgRow.appendChild(bgTransparentCheck);
    form.appendChild(bgRow);
    
    // Card background toggle
    const cardBgCheck = document.createElement('input');
    cardBgCheck.type = 'checkbox';
    cardBgCheck.checked = this._config.show_card_background !== false;
    cardBgCheck.addEventListener('change', (e) => {
      this._updateConfig({ show_card_background: e.target.checked });
    });
    form.appendChild(createFormRow('Show Card Background:', cardBgCheck));
    
    // Digit color
    const digitColorInput = document.createElement('input');
    digitColorInput.type = 'color';
    digitColorInput.value = this._config.digit_color || '#FFFFFF';
    digitColorInput.addEventListener('change', (e) => {
      this._updateConfig({ digit_color: e.target.value });
      
      // Update dimmed color if using opacity
      if (dimmedNoneCheck.checked) {
        // Store the selected color to use with opacity
        this._selectedDimmedColor = e.target.value;
        this._updateDimmedColorWithOpacity();
      }
    });
    form.appendChild(createFormRow('Digit Color:', digitColorInput));
    
    // Store selected dimmed color for opacity calculations
    this._selectedDimmedColor = this._config.dimmed_color === 'none' ? 
      (this._config.digit_color || '#FFFFFF') : this._config.dimmed_color;
    
    // Dimmed color
    const dimmedColorInput = document.createElement('input');
    dimmedColorInput.type = 'color';
    dimmedColorInput.value = this._config.dimmed_color === 'none' ? 
      (this._config.digit_color || '#FFFFFF') : this._config.dimmed_color;
    
    // Add "custom opacity" option for dimmed color
    const dimmedNoneCheck = document.createElement('input');
    dimmedNoneCheck.type = 'checkbox';
    dimmedNoneCheck.checked = this._config.dimmed_color === 'none';
    dimmedNoneCheck.style.marginLeft = '10px';
    dimmedNoneCheck.addEventListener('change', (e) => {
      if (e.target.checked) {
        dimmedColorInput.disabled = true;
        this._selectedDimmedColor = digitColorInput.value; // Use digit color for opacity
        this._updateConfig({ dimmed_color: 'none' });
        
        // Show the opacity slider and update dimmed color with current opacity
        this._updateDimmedColorWithOpacity();
        
        if (opacityRow.parentNode !== form) {
          form.insertBefore(opacityRow, justifyContentSelect.parentNode);
        }
      } else {
        dimmedColorInput.disabled = false;
        this._updateConfig({ dimmed_color: dimmedColorInput.value });
        
        // Hide the opacity slider
        if (opacityRow.parentNode === form) {
          form.removeChild(opacityRow);
        }
      }
    });
    
    dimmedColorInput.addEventListener('change', (e) => {
      if (!dimmedNoneCheck.checked) {
        this._selectedDimmedColor = e.target.value;
        this._updateConfig({ dimmed_color: e.target.value });
      }
    });
    
    const dimmedRow = createFormRow('Dimmed Color:', dimmedColorInput);
    const dimmedNoneLabel = document.createElement('label');
    dimmedNoneLabel.innerText = 'Custom Opacity';
    dimmedNoneLabel.style.marginLeft = '10px';
    dimmedNoneLabel.style.flex = '0';
    dimmedRow.appendChild(dimmedNoneLabel);
    dimmedRow.appendChild(dimmedNoneCheck);
    form.appendChild(dimmedRow);
    
    // Helper method to update dimmed color based on opacity
    this._updateDimmedColorWithOpacity = () => {
      const opacityValue = parseInt(dimmedOpacityInput.value);
      const opacityDecimal = opacityValue / 100;
      
      let color = this._selectedDimmedColor || digitColorInput.value;
      
      if (color.startsWith('#')) {
        // Convert hex to rgba
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        this._updateConfig({ 
          dimmed_color: 'none',
          dimmed_opacity: opacityValue 
        });
      } else {
        // Default to white with opacity
        this._updateConfig({ 
          dimmed_color: 'none',
          dimmed_opacity: opacityValue 
        });
      }
    };
    
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
    
    // Dimmed opacity slider
    const dimmedOpacityInput = document.createElement('input');
    dimmedOpacityInput.type = 'range';
    dimmedOpacityInput.min = '0';
    dimmedOpacityInput.max = '100';
    dimmedOpacityInput.value = this._config.dimmed_opacity !== undefined ? this._config.dimmed_opacity : 0;
    
    // Add label to show current opacity value
    const opacityValueLabel = document.createElement('span');
    opacityValueLabel.innerText = `${dimmedOpacityInput.value}%`;
    opacityValueLabel.style.marginLeft = '10px';
    opacityValueLabel.style.width = '40px';
    opacityValueLabel.style.display = 'inline-block';
    
    dimmedOpacityInput.addEventListener('input', (e) => {
      opacityValueLabel.innerText = `${e.target.value}%`;
      this._updateDimmedColorWithOpacity();
    });
    
    const opacityRow = createFormRow('Dimmed Opacity:', dimmedOpacityInput);
    opacityRow.appendChild(opacityValueLabel);
    
    // Only show opacity slider if "none" option is selected for dimmed color
    if (this._config.dimmed_color === 'none' || dimmedNoneCheck.checked) {
      form.appendChild(opacityRow);
    }
    
    // Width SVG
    const widthInput = document.createElement('input');
    widthInput.value = this._config.width_svg || '50%';
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
    
    // Advanced options section
    const advancedButton = document.createElement('button');
    advancedButton.type = 'button';
    advancedButton.innerText = 'Show Advanced Options';
    advancedButton.style.width = '100%';
    advancedButton.style.padding = '8px';
    advancedButton.style.margin = '10px 0';
    
    const advancedSection = document.createElement('div');
    advancedSection.style.display = 'none';
    
    advancedButton.addEventListener('click', () => {
      if (advancedSection.style.display === 'none') {
        advancedSection.style.display = 'block';
        advancedButton.innerText = 'Hide Advanced Options';
      } else {
        advancedSection.style.display = 'none';
        advancedButton.innerText = 'Show Advanced Options';
      }
    });
    
    form.appendChild(advancedButton);
    form.appendChild(advancedSection);
    
    // Advanced options
    
    // Segment thickness
    const thicknessInput = document.createElement('input');
    thicknessInput.type = 'number';
    thicknessInput.value = this._config.segment_thickness || '8';
    thicknessInput.addEventListener('change', (e) => {
      this._updateConfig({ segment_thickness: e.target.value });
    });
    advancedSection.appendChild(createFormRow('Segment Thickness:', thicknessInput));

    // Digit width
    const digitWidthInput = document.createElement('input');
    digitWidthInput.type = 'number';
    digitWidthInput.value = this._config.digit_width || '40';
    digitWidthInput.addEventListener('change', (e) => {
      this._updateConfig({ digit_width: e.target.value });
    });
    advancedSection.appendChild(createFormRow('Digit Width:', digitWidthInput));
    
    // Digit height
    const digitHeightInput = document.createElement('input');
    digitHeightInput.type = 'number';
    digitHeightInput.value = this._config.digit_height || '75';
    digitHeightInput.addEventListener('change', (e) => {
      this._updateConfig({ digit_height: e.target.value });
    });
    advancedSection.appendChild(createFormRow('Digit Height:', digitHeightInput));
    
    // Digit spacing
    const digitSpacingInput = document.createElement('input');
    digitSpacingInput.type = 'number';
    digitSpacingInput.value = this._config.digit_spacing || '10';
    digitSpacingInput.addEventListener('change', (e) => {
      this._updateConfig({ digit_spacing: e.target.value });
    });
    advancedSection.appendChild(createFormRow('Digit Spacing:', digitSpacingInput));
    
    // Rectangle dimensions
    const rectXInput = document.createElement('input');
    rectXInput.type = 'number';
    rectXInput.value = this._config.rect_x || '40';
    rectXInput.addEventListener('change', (e) => {
      this._updateConfig({ rect_x: e.target.value });
    });
    advancedSection.appendChild(createFormRow('Rectangle X:', rectXInput));
    
    const rectYInput = document.createElement('input');
    rectYInput.type = 'number';
    rectYInput.value = this._config.rect_y || '10';
    rectYInput.addEventListener('change', (e) => {
      this._updateConfig({ rect_y: e.target.value });
    });
    advancedSection.appendChild(createFormRow('Rectangle Y:', rectYInput));
    
    const rectWidthInput = document.createElement('input');
    rectWidthInput.type = 'number';
    rectWidthInput.value = this._config.rect_width || '220';
    rectWidthInput.addEventListener('change', (e) => {
      this._updateConfig({ rect_width: e.target.value });
    });
    advancedSection.appendChild(createFormRow('Rectangle Width:', rectWidthInput));
    
    const rectHeightInput = document.createElement('input');
    rectHeightInput.type = 'number';
    rectHeightInput.value = this._config.rect_height || '100';
    rectHeightInput.addEventListener('change', (e) => {
      this._updateConfig({ rect_height: e.target.value });
    });
    advancedSection.appendChild(createFormRow('Rectangle Height:', rectHeightInput));
    
    // Add the form to the editor
    this.appendChild(form);
    
    // Initialize the preview with the current config
    if (this._config && this._hass) {
      this._previewCard.setConfig(this._config);
      this._previewCard.hass = this._hass;
    }
  }
  
  _updateConfig(config) {
    // Update the current config with the new values
    this._config = { ...this._config, ...config };
    
    // Update the preview card with the new config
    if (this._previewCard) {
      this._previewCard.setConfig(this._config);
      if (this._hass) {
        this._previewCard.hass = this._hass;
      }
    }
    
    // Dispatch the config-changed event
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
  
  set hass(hass) {
    this._hass = hass;
    
    // Update the preview card with the hass data
    if (this._previewCard) {
      this._previewCard.hass = hass;
    }
  }
}

// Define the editor element
customElements.define('digital-clock-card-editor', DigitalClockCardEditor);  
