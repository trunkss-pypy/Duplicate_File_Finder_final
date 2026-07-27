"""
Ultimate Duplicate Finder - Main Entry Point
Eel-based desktop application with HTML/CSS/JS frontend.

Run directly:
    python main.py

Or build EXE (then run DuplicateFinder.exe):
    python build_exe.py
"""

import eel
import sys
import os

# ── Determine paths: normal run vs PyInstaller bundle ─────────────
if getattr(sys, 'frozen', False):
    # Running from PyInstaller EXE – files are in _MEIPASS
    SCRIPT_DIR = sys._MEIPASS
else:
    SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

FRONTEND_DIR = os.path.join(SCRIPT_DIR, 'frontend')
sys.path.insert(0, SCRIPT_DIR)

# Tell Eel where the frontend files live
eel.init(FRONTEND_DIR, allowed_extensions=['.html', '.css', '.js', '.png', '.jpg', '.ico'])

# Import backend module – this triggers @eel.expose registration
import backend  # noqa: F401


def main():
    # Change working directory to the user's Documents folder so DB/log
    # files are created in a writable location even when running from EXE
    docs = os.path.join(os.path.expanduser('~'), 'Documents', 'DuplicateFinder')
    os.makedirs(docs, exist_ok=True)
    os.chdir(docs)

    try:
        # Start Eel with Chrome app mode (standalone window)
        # falls back to system default browser if Chrome is not available
        eel.start('index.html',
                  size=(1400, 900),
                  position=(100, 50),
                  port=0,       # Random available port
                  mode='chrome-app',
                  host='localhost',
                  cmdline_args=['--disable-http-cache', '--no-sandbox',
                                '--disable-gpu', '--disable-software-rasterizer'])
    except Exception as e:
        print(f"Chrome app mode failed: {e}")
        print("Falling back to default browser...")
        # Fallback: use system default browser
        eel.start('index.html',
                  size=(1400, 900),
                  port=0,
                  mode='default',
                  host='localhost')


if __name__ == '__main__':
    main()
