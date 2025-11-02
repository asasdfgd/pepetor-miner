# ⚡ Immediate Fix for Mac 12 - "Failed to Start Session"

**Having this error?** Follow these steps (5 minutes max):

---

## 🔴 "Failed to Start Session" Error

This means **Tor is not installed** or **not in your PATH**.

### Quick Fix (Try These in Order)

#### Fix 1: One-Command Installer (Recommended)

```bash
bash scripts/install-tor-mac12.sh
```

This will:
1. Check if Tor exists
2. Install via Homebrew (if needed)
3. Add Tor to your PATH
4. Verify it works

**Then try again:**
```bash
npm run dev
```

---

#### Fix 2: Manual Homebrew Install

```bash
# Install Homebrew (if not already installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Tor
brew install tor

# Verify
tor --version

# If it says "command not found", try restart Terminal
```

**Then try again:**
```bash
npm run dev
```

---

#### Fix 3: Fix PATH if Tor Exists

If Tor is installed but "command not found":

```bash
# Check if Tor exists
ls -la /usr/local/bin/tor
ls -la /opt/homebrew/bin/tor

# Add to PATH
echo 'export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc

# Verify
tor --version

# Should now work
```

**Then try again:**
```bash
npm run dev
```

---

## 🧪 Verify the Fix

After trying one of the fixes above:

```bash
# Test 1: Check Tor
tor --version

# Test 2: Check backend can see Tor
curl http://localhost:3001/api/tor/debug

# Test 3: Start everything
npm run dev
```

You should see:
```
[BACKEND] [TOR] Starting Tor process...
[BACKEND] [TOR] Bootstrapped 10%...
[BACKEND] [TOR] Bootstrapped 100% - Ready
```

✅ **If you see that, you're fixed!**

---

## 📋 Diagnostic Steps (If Above Doesn't Work)

### Step 1: Run Diagnostic

```bash
bash scripts/diagnose.sh
```

Look for any ❌ **red marks**. Those are your issues.

### Step 2: Run Backend Test

```bash
# Terminal 1
npm run dev:backend

# Terminal 2
bash scripts/test-backend.sh
```

This will show exactly where the issue is.

### Step 3: Check These

```bash
# Is Node installed?
node --version    # Should be 18+ 

# Is npm installed?
npm --version    # Should be 9+

# Is Tor installed?
tor --version    # Should show version or "command not found"

# Which shell are you using?
echo $SHELL      # Should be /bin/zsh or /bin/bash
```

---

## 🚨 Still Getting Error?

### Error: "brew: command not found"

```bash
# Homebrew is not installed. Install it:
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Then
brew install tor
```

### Error: "tor --version" shows something but npm still fails

```bash
# This means Tor works but Node.js can't find it
# Try restarting Terminal completely and try again
# If still fails, add to PATH manually:

# Open your shell config
nano ~/.zshrc

# Add this line at the end:
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

# Save (Ctrl+X then Y then Enter)
# Restart Terminal
```

### Error: "port 3001 already in use"

```bash
# Kill whatever is using it
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9

# Try again
npm run dev
```

### Error: "Cannot find module 'concurrently'"

```bash
# Install dependencies
npm run dev:setup

# Try again
npm run dev
```

---

## ✅ Final Checklist

Before trying again, verify:

- [ ] Ran `bash scripts/install-tor-mac12.sh` ✓
- [ ] Got no errors from script ✓
- [ ] `tor --version` works ✓
- [ ] `npm run dev:setup` completed ✓
- [ ] All ports free (3000, 3001, 9050, 9149) ✓
- [ ] Restarted Terminal (or ran `source ~/.zshrc`) ✓

If all checked, try:
```bash
npm run dev
```

---

## 🎯 What Should Happen

When working correctly, you'll see:

```
$ npm run dev

> pepetor-miner@1.0.0 dev
> concurrently ...

[BACKEND] Server is running on http://localhost:3001 ✓
[FRONTEND] VITE v5.0.8  ready in 234 ms ✓
[FRONTEND] ➜  Local:   http://localhost:3000/
[BACKEND] [TOR] Starting Tor process...
[BACKEND] [TOR] Bootstrapped 50%
[BACKEND] [TOR] Bootstrapped 100% - Ready
```

No errors = Success! 🎉

---

## 📞 If Still Stuck

1. Take a screenshot of the error
2. Run: `bash scripts/diagnose.sh` and save output
3. Run: `bash scripts/test-backend.sh` and save output
4. Share those with support

---

**The most common cause on Mac 12: Tor not installed or not in PATH**

**The fix: `bash scripts/install-tor-mac12.sh`**

Try that first! 🚀