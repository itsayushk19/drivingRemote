# Development Guide

Guide for developers who want to contribute or modify the Driving Remote Controller.

## Project Structure

```
drivingRemote/
├── launcher/              # Server launcher
│   ├── launcher.py       # Main launcher script
│   └── requirements.txt  # Launcher dependencies
├── server/               # WebSocket server
│   ├── receiver.py       # Main server (legacy - to be refactored)
│   ├── config_manager.py # Configuration management
│   ├── telemetry.py      # Telemetry tracking
│   └── requirements.txt  # Server dependencies
├── controller/           # Web controller application
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── controls/ # Control implementations
│   │   │   ├── layout/   # Layout management UI
│   │   │   └── ui/       # UI components
│   │   ├── services/     # Core services
│   │   │   ├── controlRegistry.js  # Control type definitions
│   │   │   ├── storage.js          # Local storage
│   │   │   └── websocket.js        # WebSocket client
│   │   ├── utils/        # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── state/        # State management
│   │   ├── layouts/      # Built-in layouts
│   │   └── App.jsx       # Main app component
│   ├── package.json      # Dependencies
│   └── vite.config.js    # Build configuration
├── docs/                 # Documentation
└── README.md
```

## Setting Up Development Environment

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **Git**
- **Code editor** (VS Code recommended)
- **vJoy** (for testing on Windows)

### Initial Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/itsayushk19/drivingRemote.git
   cd drivingRemote
   ```

2. **Install controller dependencies**:
   ```bash
   cd controller
   npm install
   ```

3. **Install server dependencies**:
   ```bash
   cd ..
   pip install -r server/requirements.txt
   pip install -r launcher/requirements.txt
   ```

4. **Install development tools**:
   ```bash
   # Controller linting
   cd controller
   npm install --save-dev eslint

   # Python tools
   pip install black pylint autopep8
   ```

### Running in Development Mode

**Terminal 1 - Web Controller**:
```bash
cd controller
npm run dev
```

**Terminal 2 - WebSocket Server**:
```bash
python server.py
```

The controller will be available at `http://localhost:5173`.

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes**:
   - Follow the code style guidelines
   - Write clear commit messages
   - Test your changes

3. **Run linters**:
   ```bash
   # Controller
   cd controller
   npm run lint

   # Server (if using pylint)
   pylint server/*.py
   ```

4. **Test thoroughly**:
   - Test on mobile device
   - Test different layouts
   - Check network performance
   - Verify vJoy output

5. **Commit and push**:
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-new-feature
   ```

6. **Create pull request**

## Adding New Control Types

### Step 1: Define in Control Registry

Edit `controller/src/services/controlRegistry.js`:

```javascript
export const CONTROL_TYPES = {
  ...existing types...,
  
  myControl: {
    name: 'My Control',
    schema: {
      ...BASE_CONTROL_SCHEMA,
      config: {
        type: 'object',
        required: true,
        properties: {
          myProperty: { type: 'number', default: 0 }
        }
      }
    },
    defaultConfig: {
      myProperty: 0
    }
  }
};
```

### Step 2: Create React Component

Create `controller/src/components/controls/MyControl.jsx`:

```javascript
export default function MyControl({ control, editMode, onChange }) {
  // Implement control logic
  
  const handleChange = (value) => {
    if (editMode) return;
    onChange(control.id, value);
  };
  
  return (
    <div style={styles.container}>
      {/* Control UI */}
    </div>
  );
}

const styles = {
  container: {
    width: '100%',
    height: '100%',
    // ... styles
  }
};
```

### Step 3: Register in ControlRenderer

Edit `controller/src/components/ControlRenderer.jsx`:

```javascript
import MyControl from "./controls/MyControl";

const C =
  control.type === "steering" ? Steering :
  control.type === "myControl" ? MyControl :
  // ... other types
```

### Step 4: Document

Add documentation to `docs/CONTROL_REGISTRY.md`.

### Step 5: Test

1. Create a test layout with the new control
2. Verify it renders correctly
3. Test value output
4. Test in edit mode
5. Test save/load

## Code Style Guidelines

### JavaScript/React

- **Use functional components** with hooks
- **Use const/let**, never var
- **Destructure props**: `const { control, onChange } = props;`
- **Use arrow functions** for callbacks
- **Keep components small**: < 200 lines
- **Inline styles** for component-specific styles
- **Comments**: Explain complex logic

Example:
```javascript
import { useState, useRef } from 'react';

export default function MyComponent({ value, onChange }) {
  const [isActive, setIsActive] = useState(false);
  const ref = useRef(null);
  
  const handleClick = () => {
    setIsActive(prev => !prev);
    onChange(value);
  };
  
  return (
    <div ref={ref} onClick={handleClick}>
      {/* Content */}
    </div>
  );
}
```

### Python

- **PEP 8** style guide
- **Type hints** where helpful
- **Docstrings** for functions/classes
- **Use f-strings** for formatting
- **Keep functions small**: < 50 lines

Example:
```python
def calculate_value(x: float, y: float) -> float:
    """
    Calculate combined value.
    
    Args:
        x: First value
        y: Second value
        
    Returns:
        Combined value
    """
    return x * 2 + y
```

## Testing

### Manual Testing Checklist

- [ ] All controls render correctly
- [ ] Controls respond to touch input
- [ ] Values sent to server correctly
- [ ] Layouts save and load
- [ ] Edit mode works (move, resize)
- [ ] WebSocket reconnects automatically
- [ ] No console errors
- [ ] Works on mobile device
- [ ] Works with vJoy
- [ ] Low latency (< 20ms)

### Browser Testing

Test on:
- Chrome (Android)
- Safari (iOS)
- Firefox (Android)
- Chrome (Desktop)

### Network Testing

- Test on WiFi 2.4GHz
- Test on WiFi 5GHz
- Test with poor connection
- Test reconnection behavior

## Performance Optimization

### Frontend

1. **Minimize re-renders**:
   - Use `useMemo` and `useCallback`
   - Lift state up when needed
   - Use refs for values that don't need re-render

2. **Optimize touch handling**:
   - Use `touchAction: 'none'`
   - Prevent default on pointer events
   - Use pointer capture

3. **Reduce bundle size**:
   - Code split large components
   - Lazy load pages
   - Remove unused dependencies

### Backend

1. **Minimize packet processing**:
   - Use binary protocol
   - Batch updates
   - Avoid JSON parsing overhead

2. **Optimize vJoy calls**:
   - Only update changed values
   - Batch axis updates
   - Use appropriate data types

## Debugging

### Frontend Debugging

**Chrome DevTools**:
1. Open DevTools (F12)
2. Go to Console tab for errors
3. Go to Network tab for WebSocket traffic
4. Use React DevTools extension

**Common Issues**:
- Touch not working: Check `touchAction: 'none'`
- Controls stuck: Check pointer capture release
- High latency: Check network throttling in DevTools

### Backend Debugging

**Python Debugging**:
```python
import pdb; pdb.set_trace()  # Breakpoint
```

**Logging**:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)
logger.debug('Debug message')
```

**Common Issues**:
- vJoy not working: Check device ID
- WebSocket errors: Check port conflicts
- High CPU: Check update rate

## Build and Deploy

### Building for Production

```bash
cd controller
npm run build
```

This creates `controller/dist/` with production files.

### Creating Windows Executable

1. **Install PyInstaller**:
   ```bash
   pip install pyinstaller
   ```

2. **Build launcher**:
   ```bash
   cd launcher
   pyinstaller --onefile --name=DrivingRemoteServer launcher.py
   ```

3. **Distribute**:
   - Include the `.exe` from `launcher/dist/`
   - Include `controller/dist/` folder
   - Include `server/` folder
   - Include `README.md` and `docs/`

## Contributing

### Pull Request Guidelines

1. **One feature per PR**
2. **Clear description** of changes
3. **Test on multiple devices**
4. **No breaking changes** without discussion
5. **Update documentation** if needed
6. **Follow code style**

### Commit Message Format

```
type: short description

Longer description if needed

- Detail 1
- Detail 2
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `perf`: Performance improvement
- `test`: Tests
- `chore`: Maintenance

### Code Review Process

1. Submit PR
2. Automated checks run
3. Maintainer reviews
4. Address feedback
5. Merge when approved

## Architecture Decisions

### Why React?

- Fast rendering
- Component reusability
- Large ecosystem
- Good mobile support

### Why WebSocket?

- Low latency
- Bidirectional communication
- Real-time updates
- Browser support

### Why Local Storage?

- No server needed
- Fast access
- Persistent across sessions
- Simple API

### Why vJoy?

- Standard HID interface
- Game compatibility
- Multiple axes/buttons
- Well documented

## Future Enhancements

Potential areas for contribution:

- [ ] UDP protocol option (even lower latency)
- [ ] Bluetooth support
- [ ] Haptic feedback
- [ ] Sound feedback
- [ ] Custom skins/themes
- [ ] Profile sync across devices
- [ ] Gesture controls
- [ ] Voice commands
- [ ] Analytics dashboard
- [ ] Plugin system
- [ ] Multi-controller support

## Resources

### Documentation

- [React Docs](https://react.dev/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [vJoy Documentation](http://vjoystick.sourceforge.net/)
- [Flask-Sock](https://flask-sock.readthedocs.io/)

### Tools

- [VS Code](https://code.visualstudio.com/)
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Python Debugger](https://docs.python.org/3/library/pdb.html)

## Getting Help

- Read this documentation
- Check existing issues on GitHub
- Ask in discussions
- Contact maintainers

## License

This project is licensed under the MIT License. See LICENSE file for details.
