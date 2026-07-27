# Ultimate Duplicate Finder (Full Pro & Safe Delete)

Aplikasi desktop untuk mendeteksi file duplikat di dalam folder dan subfolder.
Mendukung berbagai tipe file: gambar, video, dokumen, teks, dan lainnya.

## Fitur

- **Scan multi-folder** dengan subfolder otomatis
- **Deteksi cerdas**: hash MD5 untuk file biner, perceptual hash untuk gambar/video, fuzzy matching untuk teks
- **Cache database** SQLite untuk scan lebih cepat pada pengulangan
- **Live preview**: gambar, video (frame), teks
- **Aksi aman**: hapus ke Recycle Bin atau pindahkan file
- **Buka lokasi file** langsung di File Explorer
- **Progress bar + ETA** real-time

## Persyaratan

- Python 3.8+
- **Eel** (untuk UI web desktop)
- Pillow, imagehash, thefuzz, send2trash
- Opsional: opencv-python (preview video), python-docx, openpyxl

## Instalasi

```bash
cd Duplicate_File_Finder_final
pip install eel pillow imagehash thefuzz send2trash
# Opsional:
pip install opencv-python python-docx openpyxl
```

## Menjalankan

```bash
python main.py
```

Aplikasi akan terbuka di jendela Chrome (mode app) atau browser default.

## Struktur File

```
Duplicate_File_Finder_final/
├── main.py                  # Entry point
├── backend.py               # Backend logic (scanning, hashing, actions)
├── frontend/
│   ├── index.html           # UI structure
│   ├── style.css            # 👈 CSS styling
│   └── script.js            # Frontend logic + Eel bridge
├── file_hash_cache.db       # Database cache (auto-generated)
├── duplicate_finder.log     # Log file (auto-generated)
└── README.md
```

## Catatan

- Aplikasi berjalan **offline** dan **standalone** - semua file diproses secara lokal
- Tidak ada upload/stream data ke internet
- Database cache mempercepat scan ulang pada folder yang sama

