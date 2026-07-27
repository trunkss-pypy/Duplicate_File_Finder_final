# -*- mode: python ; coding: utf-8 -*-
"""
PyInstaller spec for Ultimate Duplicate Finder (Eel app)
Produces a single-file EXE: dist/DuplicateFinder.exe

Usage:
    pyinstaller duplicate_finder.spec --clean --noconfirm
"""
import os
import sys
from pathlib import Path

block_cipher = None

project_dir = os.path.dirname(os.path.abspath(__file__))
frontend_dir = os.path.join(project_dir, 'frontend')

# ── Collect frontend files (HTML, CSS, JS) ──────────────────────
_datas = []
for root, dirs, files in os.walk(frontend_dir):
    for f in files:
        src = os.path.join(root, f)
        rel_dir = os.path.relpath(root, project_dir)  # "frontend"
        _datas.append((src, rel_dir))

a = Analysis(
    ['main.py'],
    pathex=[project_dir],
    binaries=[],
    datas=_datas,
    hiddenimports=[
        'eel', 'bottle',
        'PIL', 'PIL.Image', 'PIL.ImageTk',
        'imagehash', 'thefuzz', 'send2trash',
        'sqlite3', 'hashlib', 'threading', 'base64', 'io',
        'tkinter', 'tkinter.filedialog', 'tkinter.messagebox',
        'ctypes', 'json', 'mimetypes', 'html',
        'http.server', 'socketserver', 'webbrowser',
        'urllib.parse', 'xml.etree.ElementTree',
        'subprocess', 'logging', 'time', 'shutil',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=['tkinter.test', 'unittest', 'email', 'pdb',
              'distutils', 'lib2to3', 'test', 'turtledemo'],
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='DuplicateFinder',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,              # No console window
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
    icon=None,
)
