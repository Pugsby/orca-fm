# Orca File Manager

A modern, fast file manager inspired by KDE's Dolphin, built with Rust and Tauri.

## Features

- **Fast and lightweight** - Built with Rust for optimal performance
- **Modern UI** - Clean, intuitive interface with dark theme support
- **Cross-platform** - Works on Linux, Windows, and macOS
- **Image previews** - Built-in thumbnail generation for image files
- **Keyboard navigation** - Efficient file browsing with keyboard shortcuts

## Screenshots

_Add screenshots here to showcase your file manager_

## Installation

### Pre-built Packages

#### Debian/Ubuntu
```bash
# Download and install the .deb package
sudo dpkg -i Orca_0.1.0_amd64.deb

# Fix any dependency issues
sudo apt-get install -f
```

#### Red Hat/Fedora/CentOS
```bash
# Install the .rpm package
sudo rpm -i Orca-0.1.0-1.x86_64.rpm

# Or using dnf
sudo dnf install Orca-0.1.0-1.x86_64.rpm
```

#### Arch Linux
```bash
# Convert .deb to Arch package (requires debtap)
debtap Orca_0.1.0_amd64.deb
sudo pacman -U orca-*.pkg.tar.xz

# Or install directly to ~/.local/bin (see manual installation below)
```

### Manual Installation (All Linux Distributions)

1. **Copy the executable:**
   ```bash
   cp src-tauri/target/release/Orca ~/.local/bin/orca
   chmod +x ~/.local/bin/orca
   ```

2. **Add to PATH** (if not already):
   ```bash
   echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Install icon:**
   ```bash
   mkdir -p ~/.local/share/icons/hicolor/48x48/apps/
   cp src-tauri/icons/32x32.png ~/.local/share/icons/hicolor/48x48/apps/orca.png
   ```

4. **Create desktop entry:**
   ```bash
   cat > ~/.local/share/applications/orca.desktop << 'EOF'
   [Desktop Entry]
   Name=Orca File Manager
   Comment=A modern file manager built with Tauri
   Exec=/home/$USER/.local/bin/orca
   Icon=/home/$USER/.local/share/icons/hicolor/48x48/apps/orca.png
   Terminal=false
   Type=Application
   Categories=System;FileManager;Utility;
   StartupNotify=true
   MimeType=inode/directory;
   EOF
   ```

5. **Update desktop database:**
   ```bash
   update-desktop-database ~/.local/share/applications/
   gtk-update-icon-cache ~/.local/share/icons/hicolor/
   ```

## Building from Source

### Prerequisites

- **Rust** (install from [rustup.rs](https://rustup.rs/))
- **Node.js and npm/yarn** (for frontend dependencies)
- **System dependencies:**
  - **Linux:** `build-essential`, `libwebkit2gtk-4.0-dev`, `libssl-dev`, `libgtk-3-dev`, `libayatana-appindicator3-dev`, `librsvg2-dev`

### Build Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/pugsby/orca-fm.git
   cd orca-fm
   ```

2. **Install Tauri CLI:**
   ```bash
   cargo install tauri-cli
   ```

3. **Build for development:**
   ```bash
   cargo tauri dev
   ```

4. **Build for production:**
   ```bash
   cargo tauri build
   ```

Built packages will be available in `src-tauri/target/release/bundle/`.

## Usage

Launch Orca File Manager from your application menu, or run from terminal:

```bash
orca
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by KDE's Dolphin file manager
- Built with [Tauri](https://tauri.app/) framework
- Icons from [your icon source]

---
