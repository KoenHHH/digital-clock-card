# Digital Clock Card for Home Assistant

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/custom-components/hacs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A customizable 7-segment digital clock display card for Home Assistant.

<img width="495" alt="digitalclock1" src="https://github.com/user-attachments/assets/40f6bfc9-b981-4d15-809f-f4da0ae503e4" />

<img width="495" alt="digitalclock2" src="https://github.com/user-attachments/assets/6a304e82-01d7-4784-9ed1-5a37aceb0df5" />

## Features

- Fully customizable 7-segment LED digital clock display
- 12-hour or 24-hour time format
- Configurable colors, dimensions, and layout
- Optional Home Assistant card styling
- Compatible with any time entity (default: `sensor.time`)
- Easy to install via HACS

## Installation

### HACS (Recommended)

1. Make sure [HACS](https://hacs.xyz/) is installed in your Home Assistant instance
2. Add this repository as a custom repository in HACS:
   - Go to HACS > Frontend
   - Click the three dots in the top right corner
   - Select "Custom repositories"
   - Add the URL of this repository
   - Select "dashboard" as the category
3. Click "Install" in HACS
4. Restart Home Assistant

### Manual Installation

1. Download the `digital-clock-card.js` file from the `dist` folder in this repository
2. Copy it to your `config/www` folder
3. Add the following to your `configuration.yaml` file:
   ```yaml
   lovelace:
     resources:
       - url: /local/digital-clock-card.js
         type: module
   ```
4. Restart Home Assistant

## Usage

### UI Configuration

1. In your dashboard, click "Edit Dashboard"
2. Click the "+" button to add a new card
3. Search for "Digital Clock Card" and select it
4. Configure the options as desired
5. Click "Save"

### YAML Configuration

```yaml
type: custom:digital-clock-card
entity: sensor.time
use_24h_format: true
background_color: none
digit_color: white
dimmed_color: none
width_svg: 50%
height_svg: 120
justify_content: center
margin_div: 0
use_card: true
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `entity` | string | `sensor.time` | Entity that provides the time |
| `name` | string | | Optional name for the card |
| `use_24h_format` | boolean | `true` | Use 24-hour format (`true`) or 12-hour format (`false`) |
| `use_card` | boolean | `true` | Use Home Assistant card styling |
| `background_color` | string | `none` | Background color for the clock panel |
| `digit_color` | string | `white` | Color for active segments |
| `dimmed_color` | string | `none` | Color for inactive segments |
| `text_color` | string | `white` | Color for text elements |
| `width_svg` | string/number | `50%` | Width of the SVG element |
| `height_svg` | number | `120` | Height of the SVG element |
| `segment_thickness` | number | `8` | Thickness of the digit segments |
| `digit_width` | number | `40` | Width of each digit |
| `digit_height` | number | `75` | Height of each digit |
| `digit_spacing` | number | `10` | Spacing between digits |
| `justify_content` | string | `center` | Horizontal alignment (start, center, end) |
| `margin_div` | number | `0` | Margin around the clock |
| `clock_center_x` | number | `150` | X-coordinate of the clock center |
| `clock_center_y` | number | `85` | Y-coordinate of the clock center |
| `rect_x` | number | `40` | X-coordinate of the background rectangle |
| `rect_y` | number | `10` | Y-coordinate of the background rectangle |
| `rect_width` | number | `220` | Width of the background rectangle |
| `rect_height` | number | `100` | Height of the background rectangle |

## Advanced Styling Examples

### Retro Red LED Display

```yaml
type: custom:digital-clock-card
entity: sensor.time
background_color: "#000000"
digit_color: "#ff0000"
dimmed_color: "#330000"
segment_thickness: 6
```

### Modern Blue Display with Card

```yaml
type: custom:digital-clock-card
entity: sensor.time
use_card: true
background_color: "#000033"
digit_color: "#00ccff"
dimmed_color: "#002244"
segment_thickness: 10
digit_width: 50
```

### Minimalist White on Transparent

```yaml
type: custom:digital-clock-card
entity: sensor.time
use_card: false
background_color: none
digit_color: white
dimmed_color: rgba(255,255,255,0.2)
segment_thickness: 4
```

### Local Development

1. Clone this repository
2. Make your changes to the `digital-clock-card.js` file
3. Test by copying to your Home Assistant configuration directory

### Building

No build process is required as this is plain JavaScript.

## Credits

- Created by KoenHHH
- Inspired by traditional 7-segment LED displays

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you find any bugs or have a feature request, please open an issue on GitHub!
