"""
Build script: Compile Ultimate Duplicate Finder into a standalone EXE.
Produces: dist/DuplicateFinder.exe

Usage:
    cd "Duplicate_File_Finder_final"
    python build_exe.py

Requirements:
    pip install pyinstaller
"""

import os
import sys
import subprocess

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(SCRIPT_DIR, 'frontend')
DIST_DIR = os.path.join(SCRIPT_DIR, 'dist')
BUILD_DIR = os.path.join(SCRIPT_DIR, 'build')
OUTPUT_NAME = 'DuplicateFinder'

# ── Verify eel.js is available ─────────────────────────────────
import eel as eel_mod
eel_js_src = os.path.join(os.path.dirname(eel_mod.__file__), 'eel.js')
if not os.path.exists(eel_js_src):
    print(f"ERROR: eel.js not found at {eel_js_src}")
    sys.exit(1)
print(f"[OK] eel.js found at: {eel_js_src}")

# ── Build PyInstaller command ─────────────────────────────────
cmd = [
    sys.executable, '-m', 'PyInstaller',
    '--name', OUTPUT_NAME,
    '--onefile',
    '--windowed',
    '--clean',
    '--noconfirm',
    f'--distpath={DIST_DIR}',
    f'--workpath={BUILD_DIR}',
    f'--specpath={SCRIPT_DIR}',
    '--add-data', f'{FRONTEND_DIR}{os.pathsep}frontend',
    '--hidden-import=eel',
    '--hidden-import=bottle',
    '--hidden-import=PIL',
    '--hidden-import=PIL.Image',
    '--hidden-import=PIL.ImageTk',
    '--hidden-import=imagehash',
    '--hidden-import=thefuzz',
    '--hidden-import=send2trash',
    '--collect-all=eel',
    '--collect-all=bottle',
    os.path.join(SCRIPT_DIR, 'main.py'),
]

print("=" * 60)
print(" Ultimate Duplicate Finder - Build EXE")
print("=" * 60)
print(f"Frontend : {FRONTEND_DIR}")
print(f"Output   : {os.path.join(DIST_DIR, OUTPUT_NAME + '.exe')}")
print(f"Command  : {' '.join(cmd)}")
print("=" * 60)

# ── Run PyInstaller ──────────────────────────────────────────
result = subprocess.run(cmd, cwd=SCRIPT_DIR)

if result.returncode == 0:
    exe_path = os.path.join(DIST_DIR, f'{OUTPUT_NAME}.exe')
    size_mb = os.path.getsize(exe_path) / (1024 * 1024)
    print("\n" + "=" * 60)
    print(f" ✅ BUILD SUCCESS!")
    print(f"    EXE: {exe_path}")
    print(f"    Size: {size_mb:.1f} MB")
    print("=" * 60)
    print("\nCara menjalankan:")
    print(f"   {exe_path}")
    print("\nFile DB & log akan tersimpan di:")
    print("   C:/Users/[username]/Documents/DuplicateFinder/")
    print("\nAplikasi berjalan 100% OFFLINE & STANDALONE!")
else:
    print("\n ❌ BUILD FAILED! Lihat error di atas.")
    sys.exit(1)
