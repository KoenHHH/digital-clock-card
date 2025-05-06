class DigitalClockCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    if (!config.entity && !config.entity.startsWith('sensor.')) {
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
      width_svg: config.width_svg || '100px',
      height_svg: config.height_svg || 'auto',
      padding_div: config.padding_div || '0',
      
      // Color configuration
      background_color: config.background_color || 'transparent',
      digit_color: config.digit_color || 'white',
      dimmed_color: config.dimmed_color || 'none',
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
      rect_y: config.rect_y || 20,
      rect_width: config.rect_width || 220,
      rect_height: config.rect_height || 100,
    };
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
      dimmed_color: "none"
    };
  }

  static getConfigElement() {
    return document.createElement("digital-clock-card-editor");
  }

  renderClock(hass) {
    const entity = hass.states[this.config.entity];
    if (!entity) {
      return `
        <div style="padding: 8px;">Entity ${this.config.entity} not found.</div>
      `;
    }
    
    // Get current time from the entity or system
    let timeStr = entity.state;
    
    // Get format preference from config
    let use24hFormat = this.config.use_24h_format;
    
    
    // Calculate the current time from time entity
    let time = new Date();
    if (timeStr) {
      // Handle time format (HH:MM or HH:MM:SS)
      let [hours, minutes] = timeStr.split(':').map(Number);
      time.setHours(hours);
      time.setMinutes(minutes);
    }
    
    // Layout configuration
    let widthSVG = this.config.width_svg;
    let heightSVG = this.config.height_svg;
    let paddingDIV = this.config.padding_div;
    
    // Color configuration
    let backgroundColor = this.config.background_color;   
    let digitColor = this.config.digit_color;     
    let dimmedColor = this.config.dimmed_color;     
    let textColor = this.config.text_color;      
    
    // Clock dimensions
    let clockCenterX = this.config.clock_center_x;           
    let clockCenterY = this.config.clock_center_y;            
    
    // Format time based on user preference
    let hours = use24hFormat ? 
      time.getHours().toString().padStart(2, '0') : 
      (time.getHours() % 12 || 12).toString().padStart(2, '0');
    let minutes = time.getMinutes().toString().padStart(2, '0');
    
    // Split time into individual digits
    let hourDigit1 = hours.charAt(0);
    let hourDigit2 = hours.charAt(1);
    let minuteDigit1 = minutes.charAt(0);
    let minuteDigit2 = minutes.charAt(1);
    
    // Digital clock dimensions
    let digitWidth = this.config.digit_width;
    let digitHeight = this.config.digit_height;
    let digitSpacing = this.config.digit_spacing;
    let segmentThickness = this.config.segment_thickness;
    
    // Background rectangle dimensions
    let rectX = this.config.rect_x;
    let rectY = this.config.rect_y;
    let rectWidth = this.config.rect_width;
    let rectHeight = this.config.rect_height;
    
    // Calculate starting positions to center the clock on the rectangle
    let totalWidth = 4 * digitWidth + 3 * digitSpacing + segmentThickness;
    let startX = rectX + (rectWidth - totalWidth) / 2;
    let startY = rectY + (rectHeight - digitHeight) / 2;
    
    // Function to draw a 7-segment digit with properly angled joints
    function drawDigit(x, y, digit) {
      // Define segment states for each digit
      const segmentStates = {
        '0': [1,1,1,1,1,1,0],  // Segments a,b,c,d,e,f (not g)
        '1': [0,1,1,0,0,0,0],  // Segments b,c
        '2': [1,1,0,1,1,0,1],  // Segments a,b,d,e,g
        '3': [1,1,1,1,0,0,1],  // Segments a,b,c,d,g
        '4': [0,1,1,0,0,1,1],  // Segments b,c,f,g
        '5': [1,0,1,1,0,1,1],  // Segments a,c,d,f,g
        '6': [1,0,1,1,1,1,1],  // Segments a,c,d,e,f,g
        '7': [1,1,1,0,0,0,0],  // Segments a,b,c
        '8': [1,1,1,1,1,1,1],  // All segments
        '9': [1,1,1,1,0,1,1],  // Segments a,b,c,d,f,g
      };
      
      // Get segment states for the current digit
      const segments = segmentStates[digit] || [0,0,0,0,0,0,0];
      
      // Calculate the mitred joins with 45-degree angles
      const offset = segmentThickness / 2;
      
      // Define segments using polygons with proper 45-degree joins
      const segmentPolygons = [
        // a: top horizontal with angled ends
        `<polygon points="${x+offset},${y} ${x+digitWidth-offset},${y} ${x+digitWidth-offset+offset},${y+offset} ${x+offset-offset},${y+offset}" 
          fill="${segments[0] ? digitColor : dimmedColor}" />`,
        
        // b: top right vertical with angled ends
        `<polygon points="${x+digitWidth},${y+offset} ${x+digitWidth},${y+digitHeight/2-offset} ${x+digitWidth-offset},${y+digitHeight/2} ${x+digitWidth-offset},${y+offset+offset}" 
          fill="${segments[1] ? digitColor : dimmedColor}" />`,
        
        // c: bottom right vertical with angled ends and 45-degree corners
        `<polygon points="${x+digitWidth},${y+digitHeight/2+offset} ${x+digitWidth},${y+digitHeight} ${x+digitWidth-offset},${y+digitHeight-offset-offset} ${x+digitWidth-offset},${y+digitHeight/2+offset-offset}" 
          fill="${segments[2] ? digitColor : dimmedColor}" />`,
        
        // d: bottom horizontal with angled ends
        `<polygon points="${x},${y+digitHeight} ${x+digitWidth},${y+digitHeight} ${x+digitWidth-offset},${y+digitHeight-offset} ${x+offset+offset},${y+digitHeight-offset}" 
          fill="${segments[3] ? digitColor : dimmedColor}" />`,
        
        // e: bottom left vertical with angled ends and 45-degree corners
        `<polygon points="${x},${y+digitHeight/2+offset} ${x},${y+digitHeight} ${x+offset},${y+digitHeight-offset-offset} ${x+offset},${y+digitHeight/2+offset-offset}" 
          fill="${segments[4] ? digitColor : dimmedColor}" />`,
        
        // f: top left vertical with angled ends
        `<polygon points="${x},${y+offset} ${x},${y+digitHeight/2-offset} ${x+offset},${y+digitHeight/2} ${x+offset},${y+offset+offset}" 
          fill="${segments[5] ? digitColor : dimmedColor}" />`,
        
        // g: middle horizontal with angled ends
        `<polygon points="${x+offset+offset},${y+digitHeight/2-offset} ${x+digitWidth-offset-offset},${y+digitHeight/2-offset} ${x+digitWidth-offset},${y+digitHeight/2} ${x+offset},${y+digitHeight/2}" 
          fill="${segments[6] ? digitColor : dimmedColor}" />
         `
      ];
      
      // Join all segment polygons
      return segmentPolygons.join('');
    }
    
    // Modified special case for number 1 to ensure consistent thickness and background
    function drawNumber1(x, y) {
      // Define offset value inside this function
      const offset = segmentThickness / 2;
      
      // Add full background for the digit 1
      const backgroundPolygons = [
        // Background for segments - all segments in dimmed color
        // a: top horizontal
        `<polygon points="${x+offset},${y} ${x+digitWidth-offset},${y} ${x+digitWidth-offset+offset},${y+offset} ${x+offset-offset},${y+offset}" 
          fill="${dimmedColor}" />`,
        
        // f: top left vertical
        `<polygon points="${x},${y+offset} ${x},${y+digitHeight/2-offset} ${x+offset},${y+digitHeight/2} ${x+offset},${y+offset+offset}" 
          fill="${dimmedColor}" />`,
          
        // e: bottom left vertical with 45-degree corners
        `<polygon points="${x},${y+digitHeight/2+offset} ${x},${y+digitHeight-offset} ${x+offset},${y+digitHeight-offset-offset} ${x+offset},${y+digitHeight/2+offset-offset}" 
          fill="${dimmedColor}" />`,
          
        // d: bottom horizontal
        `<polygon points="${x+offset},${y+digitHeight} ${x+digitWidth-offset},${y+digitHeight} ${x+digitWidth-offset-offset},${y+digitHeight-offset} ${x+offset+offset},${y+digitHeight-offset}" 
          fill="${dimmedColor}" />`,
          
        // g: middle horizontal
        `<polygon points="${x+offset+offset},${y+digitHeight/2-offset} ${x+digitWidth-offset-offset},${y+digitHeight/2-offset} ${x+digitWidth-offset},${y+digitHeight/2} ${x+offset},${y+digitHeight/2}" 
          fill="${dimmedColor}" />
         <polygon points="${x+offset},${y+digitHeight/2} ${x+digitWidth-offset},${y+digitHeight/2} ${x+digitWidth-offset-offset},${y+digitHeight/2+offset} ${x+offset+offset},${y+digitHeight/2+offset}" 
          fill="${dimmedColor}" />`
      ];
      
      // Active segments for the digit 1 (b and c)
      const activeSegments = [
        // b: top right vertical with angled ends and consistent thickness
        `<polygon points="${x+digitWidth},${y+offset} ${x+digitWidth},${y+digitHeight/2-offset} ${x+digitWidth-offset},${y+digitHeight/2} ${x+digitWidth-offset},${y+offset+offset}" 
          fill="${digitColor}" />`,
        
        // c: bottom right vertical with 45-degree angled corners
        `<polygon points="${x+digitWidth},${y+digitHeight/2+offset} ${x+digitWidth},${y+digitHeight-offset} ${x+digitWidth-offset},${y+digitHeight-offset-offset} ${x+digitWidth-offset},${y+digitHeight/2+offset-offset}" 
          fill="${digitColor}" />`
      ];
      
      // Return both background and active segments
      return backgroundPolygons.join('') + activeSegments.join('');
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
    
    // Format time for display text
    let timeDisplay;
    if (use24hFormat) {
      timeDisplay = `${hours}:${minutes}`;
    } else {
      let ampm = time.getHours() >= 12 ? 'PM' : 'AM';
      timeDisplay = `${hours}:${minutes} ${ampm}`;
    }
    
    // Generate and return the SVG clock visualization
    return `
      <div style="align-items: center; padding: ${paddingDIV};">
        <svg viewBox="0 0 300 120" width="${widthSVG}" height="${heightSVG}" xmlns="http://www.w3.org/2000/svg">
          <!-- Background rectangle -->
          <rect x="${rectX}" y="${rectY}" width="${rectWidth}" height="${rectHeight}" fill="${backgroundColor}" rx="5" ry="5" />
          
          <!-- Digital clock display -->
          <g>
            ${hourDigit1 === '1' ? drawNumber1(startX, startY) : drawDigit(startX, startY, hourDigit1)}
            ${hourDigit2 === '1' ? drawNumber1(startX + digitWidth + digitSpacing, startY) : drawDigit(startX + digitWidth + digitSpacing, startY, hourDigit2)}
            
            ${drawColon(colonX, startY)}
            
            ${minuteDigit1 === '1' ? drawNumber1(startX + 2*(digitWidth + digitSpacing) + segmentThickness, startY) : drawDigit(startX + 2*(digitWidth + digitSpacing) + segmentThickness, startY, minuteDigit1)}
            ${minuteDigit2 === '1' ? drawNumber1(startX + 3*(digitWidth + digitSpacing) + segmentThickness, startY) : drawDigit(startX + 3*(digitWidth + digitSpacing) + segmentThickness, startY, minuteDigit2)}
          </g>
        </svg>
      </div>
    `;
  }

  set hass(hass) {
    this._hass = hass;
    
    if (!this.content) {
      this.content = document.createElement('div');
      this.content.className = 'card-content';
      this.shadowRoot.appendChild(this.content);
    }
    
    this.content.innerHTML = this.renderClock(hass);
  }
}

customElements.define('digital-clock-card', DigitalClockCard);

// Editor for the card
class DigitalClockCardEditor extends HTMLElement {
  setConfig(config) {
    this.config = config;
  }

  get _entity() {
    return this.config.entity || '';
  }

  get _name() {
    return this.config.name || '';
  }

  get _use_24h_format() {
    return this.config.use_24h_format !== undefined ? this.config.use_24h_format : true;
  }

  get _background_color() {
    return this.config.background_color || 'transparent';
  }

  get _digit_color() {
    return this.config.digit_color || 'white';
  }

  get _dimmed_color() {
    return this.config.dimmed_color || 'none';
  }

  get _text_color() {
    return this.config.text_color || 'white';
  }
  
  get _width_svg() {
    return this.config.width_svg || '100px';
  }
  
  get _height_svg() {
    return this.config.height_svg || 'auto';
  }
  
  get _segment_thickness() {
    return this.config.segment_thickness || 8;
  }
  
  get _digit_width() {
    return this.config.digit_width || 40;
  }
  
  get _digit_height() {
    return this.config.digit_height || 75;
  }
  
  get _digit_spacing() {
    return this.config.digit_spacing || 10;
  }

  render() {
    if (!this.rendered) {
      this.rendered = true;
      this.innerHTML = `
        <ha-form
          .schema=${[
            {
              name: "entity",
              selector: { entity: { domain: ["sensor"] } }
            },
            {
              name: "name",
              selector: { text: {} }
            },
            {
              name: "use_24h_format",
              selector: { boolean: {} }
            },
            {
              name: "background_color",
              selector: { color_rgb: {} }
            },
            {
              name: "digit_color",
              selector: { color_rgb: {} }
            },
            {
              name: "dimmed_color",
              selector: { color_rgb: {} }
            },
            {
              name: "text_color",
              selector: { color_rgb: {} }
            },
            {
              name: "width_svg",
              selector: { text: {} }
            },
            {
              name: "height_svg",
              selector: { text: {} }
            },
            {
              name: "segment_thickness",
              selector: { number: { min: 1, max: 20, step: 1 } }
            },
            {
              name: "digit_width",
              selector: { number: { min: 10, max: 100, step: 1 } }
            },
            {
              name: "digit_height",
              selector: { number: { min: 20, max: 200, step: 1 } }
            },
            {
              name: "digit_spacing",
              selector: { number: { min: 0, max: 50, step: 1 } }
            }
          ]}
          .data=${this.config}
          @value-changed=${this._valueChanged}
        ></ha-form>
      `;
    }
  }

  _valueChanged(ev) {
    if (!this.config || !this._hass) return;
    
    const config = {
      ...this.config,
      ...ev.detail.value
    };
    
    const event = new Event("config-changed", {
      bubbles: true,
      composed: true
    });
    
    event.detail = { config };
    this.dispatchEvent(event);
  }

  connectedCallback() {
    this.rendered = false;
    this.render();
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
