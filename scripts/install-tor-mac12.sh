#!/bin/bash

# Mac OS 12+ Tor Installation Script
# Handles older macOS versions that may have Tor compatibility issues

echo ""
echo "🔒 Installing Tor for macOS 12+"
echo "==============================="
echo ""

# Check if running on macOS
if [[ ! "$OSTYPE" == "darwin"* ]]; then
    echo "❌ This script is for macOS only"
    exit 1
fi

# Check macOS version
OS_VERSION=$(sw_vers -productVersion | cut -d. -f1)
echo "Detected macOS version: $(sw_vers -productVersion)"
echo ""

# Try Homebrew first (recommended)
if command -v brew &> /dev/null; then
    echo "📦 Found Homebrew, attempting to install Tor..."
    
    # Update homebrew
    echo "  Updating Homebrew..."
    brew update
    
    # Try to install tor
    echo "  Installing Tor..."
    brew install tor
    
    if command -v tor &> /dev/null; then
        echo "✅ Tor installed successfully via Homebrew"
        echo ""
        echo "Tor location: $(which tor)"
        echo "Tor version: $(tor --version)"
        exit 0
    else
        echo "⚠️  Homebrew install didn't add tor to PATH"
        echo "  Checking common Homebrew locations..."
    fi
else
    echo "⚠️  Homebrew not found. Installing Homebrew first..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    
    if command -v brew &> /dev/null; then
        echo "✅ Homebrew installed"
        echo ""
        echo "Now installing Tor..."
        brew install tor
        
        if command -v tor &> /dev/null; then
            echo "✅ Tor installed successfully"
            exit 0
        fi
    fi
fi

# Check for Tor in common locations
echo ""
echo "🔍 Checking common installation locations..."
echo ""

FOUND_TOR=0

# Check Intel Homebrew location
if [ -f "/usr/local/bin/tor" ]; then
    echo "✅ Found Tor at /usr/local/bin/tor"
    echo ""
    echo "Adding to PATH by updating ~/.zshrc..."
    
    if ! grep -q "/usr/local/bin" ~/.zshrc; then
        echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.zshrc
        echo "✅ Updated ~/.zshrc"
    fi
    
    if ! grep -q "/usr/local/bin" ~/.bash_profile; then
        echo 'export PATH="/usr/local/bin:$PATH"' >> ~/.bash_profile
        echo "✅ Updated ~/.bash_profile"
    fi
    
    source ~/.zshrc 2>/dev/null || true
    FOUND_TOR=1
fi

# Check Apple Silicon Homebrew location
if [ -f "/opt/homebrew/bin/tor" ]; then
    echo "✅ Found Tor at /opt/homebrew/bin/tor (Apple Silicon)"
    echo ""
    echo "Adding to PATH by updating ~/.zshrc..."
    
    if ! grep -q "/opt/homebrew/bin" ~/.zshrc; then
        echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
        echo "✅ Updated ~/.zshrc"
    fi
    
    if ! grep -q "/opt/homebrew/bin" ~/.bash_profile; then
        echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.bash_profile
        echo "✅ Updated ~/.bash_profile"
    fi
    
    source ~/.zshrc 2>/dev/null || true
    FOUND_TOR=1
fi

# Check macports
if [ -f "/opt/local/bin/tor" ]; then
    echo "✅ Found Tor at /opt/local/bin/tor (MacPorts)"
    FOUND_TOR=1
fi

if [ $FOUND_TOR -eq 1 ]; then
    echo ""
    echo "Verifying Tor is accessible..."
    if command -v tor &> /dev/null; then
        echo "✅ Tor is now accessible!"
        echo ""
        echo "Tor version: $(tor --version)"
        exit 0
    fi
fi

# Last resort: Install via MacPorts
echo ""
echo "⚠️  Tor not found via Homebrew"
echo ""
echo "Would you like to install via MacPorts? (requires additional setup)"
echo "Enter 'yes' to continue, or 'no' to exit: "
read -r response

if [ "$response" = "yes" ]; then
    echo ""
    echo "Installing MacPorts..."
    # MacPorts installation would go here - but it's complex
    echo "Please visit: https://www.macports.org/install.php"
    echo "Then run: sudo port install tor"
    exit 1
fi

# Failed to install
echo ""
echo "❌ Could not install Tor automatically"
echo ""
echo "Manual installation options:"
echo ""
echo "1️⃣  Install via Homebrew (recommended):"
echo "   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
echo "   brew install tor"
echo ""
echo "2️⃣  Download Tor Browser Bundle:"
echo "   https://www.torproject.org/download/#macos"
echo "   Extract and add to PATH"
echo ""
echo "3️⃣  Build from source:"
echo "   https://github.com/torproject/tor"
echo ""
echo "After installing, test with:"
echo "   tor --version"
echo ""