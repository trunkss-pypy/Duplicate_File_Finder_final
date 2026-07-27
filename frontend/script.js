/**
 * Ultimate Duplicate Finder - Frontend Logic
 * Bridges HTML/CSS (style.css) with Python backend via Eel.
 */

// ==================== STATE ====================
let selectedResultIndex = null;
let isScanning = false;
let lastSelectedRow = null;

// ==================== FOLDER MANAGEMENT ====================

function addFolder() {
    eel.add_folder()(function(response) {
        if (response.success) {
            renderFolderList(response.folders);
        }
    });
}

function removeFolder() {
    const selected = document.querySelector('.folder-list li.selected');
    if (!selected) {
        showAlert('warning', 'Peringatan', 'Pilih folder yang ingin dihapus dari daftar.');
        return;
    }
    const index = parseInt(selected.dataset.index, 10);
    eel.remove_folder(index)(function(response) {
        if (response.success) {
            renderFolderList(response.folders);
            updateScanButton();
        }
    });
}

function clearFolders() {
    showConfirm('Konfirmasi', 'Hapus semua folder dari daftar?', function() {
        eel.clear_folders()(function(response) {
            if (response.success) {
                renderFolderList([]);
                updateScanButton();
            }
        });
    });
}

function renderFolderList(folders) {
    const ul = document.getElementById('folderList');
    ul.innerHTML = '';
    if (folders.length === 0) {
        ul.innerHTML = '<li class="empty-hint">Belum ada folder ditambahkan</li>';
        document.getElementById('btnRemoveFolder').disabled = true;
        document.getElementById('btnClearFolders').disabled = true;
        return;
    }
    document.getElementById('btnRemoveFolder').disabled = false;
    document.getElementById('btnClearFolders').disabled = false;
    folders.forEach(function(folder, index) {
        const li = document.createElement('li');
        li.textContent = folder;
        li.dataset.index = index;
        li.addEventListener('click', function() {
            document.querySelectorAll('.folder-list li').forEach(function(el) {
                el.classList.remove('selected');
            });
            this.classList.add('selected');
        });
        ul.appendChild(li);
    });
}

// ==================== SCAN ====================

function startScan() {
    if (isScanning) return;
    eel.start_scan()();
}

function updateScanButton() {
    eel.get_folders()(function(folders) {
        const btn = document.getElementById('btnScan');
        btn.disabled = (folders.length === 0);
        if (folders.length === 0) {
            btn.title = 'Tambahkan folder terlebih dahulu';
        } else {
            btn.title = '';
        }
    });
}

// Called from Python
function updateProgress(percent, statusText, etaText) {
    document.getElementById('progressFill').style.width = percent + '%';
    document.getElementById('progressPercent').textContent = Math.round(percent) + '%';
    document.getElementById('statusText').textContent = 'Status: ' + statusText;
    document.getElementById('etaText').textContent = etaText;
}

function scanStateChanged(scanning) {
    isScanning = scanning;
    const btn = document.getElementById('btnScan');
    btn.disabled = scanning;
    btn.textContent = scanning ? '... SCANNING' : ' MULAI SCAN DUPLIKAT';
    btn.className = scanning ? 'btn btn-scan scanning' : 'btn btn-scan';
}

function scanComplete() {
    isScanning = false;
    const btn = document.getElementById('btnScan');
    btn.disabled = false;
    btn.textContent = ' MULAI SCAN DUPLIKAT';
    btn.className = 'btn btn-scan';
}

function showAlert(type, title, message) {
    const modal = document.getElementById('alertModal');
    document.getElementById('alertTitle').textContent = title;
    document.getElementById('alertMessage').textContent = message;
    modal.classList.remove('hidden');
    document.getElementById('alertOk').onclick = function() {
        modal.classList.add('hidden');
    };
}

// ==================== RESULTS TABLE ====================

function addResult(result) {
    const tbody = document.getElementById('resultBody');
    const emptyRow = tbody.querySelector('.empty-table');
    if (emptyRow) {
        tbody.innerHTML = '';
    }

    const tr = document.createElement('tr');
    tr.dataset.index = tbody.children.length;

    let statusClass = 'status-identical';
    const status = result.status;
    if (status.includes('Visual')) statusClass = 'status-visual';
    else if (status.includes('Video')) statusClass = 'status-video';
    else if (status.includes('Dokumen')) statusClass = 'status-doc';
    else if (status.includes('Teks')) statusClass = 'status-identical';

    tr.innerHTML =
        '<td title="' + escapeHtml(result.file1) + '">' + escapeHtml(result.file1) + '</td>' +
        '<td title="' + escapeHtml(result.file2) + '">' + escapeHtml(result.file2) + '</td>' +
        '<td><span class="status-badge ' + statusClass + '">' + escapeHtml(result.status) + '</span></td>' +
        '<td>' + escapeHtml(result.ext) + '</td>';

    tr.addEventListener('click', function() {
        if (lastSelectedRow) {
            lastSelectedRow.classList.remove('selected');
        }
        this.classList.add('selected');
        lastSelectedRow = this;
        selectedResultIndex = parseInt(this.dataset.index, 10);
        onResultSelected(selectedResultIndex);
    });

    tbody.appendChild(tr);
    updateResultCount();
}

function updateResultCount() {
    const rows = document.querySelectorAll('#resultBody tr:not(.empty-table)');
    document.getElementById('resultCount').textContent = rows.length + ' ditemukan';
}

function clearResults() {
    const tbody = document.getElementById('resultBody');
    tbody.innerHTML = '<tr><td colspan="4" class="empty-table">Belum ada hasil scan</td></tr>';
    selectedResultIndex = null;
    lastSelectedRow = null;
    updateResultCount();
    document.getElementById('btnDelete').disabled = true;
    document.getElementById('btnMove').disabled = true;
    document.getElementById('btnOpen1').disabled = true;
    document.getElementById('btnOpen2').disabled = true;
    document.getElementById('preview1').innerHTML = '<span class="preview-placeholder">[Pilih baris untuk melihat]</span>';
    document.getElementById('preview2').innerHTML = '<span class="preview-placeholder">[Pilih baris untuk melihat]</span>';
}

// ==================== PREVIEW ====================

function onResultSelected(index) {
    document.getElementById('btnDelete').disabled = false;
    document.getElementById('btnMove').disabled = false;
    document.getElementById('btnOpen1').disabled = false;
    document.getElementById('btnOpen2').disabled = false;

    const row = document.querySelector('#resultBody tr[data-index="' + index + '"]');
    if (!row) return;
    const cells = row.querySelectorAll('td');

    const file1 = cells[0].textContent;
    const file2 = cells[1].textContent;

    loadPreview(file1, 'preview1');
    loadPreview(file2, 'preview2');
}

function loadPreview(filepath, targetId) {
    const target = document.getElementById(targetId);
    target.innerHTML = '<span class="preview-placeholder">Memuat preview...</span>';

    eel.get_preview(filepath)(function(preview) {
        if (preview.type === 'image') {
            target.innerHTML = '<img src="' + preview.data + '" alt="Preview">';
        } else if (preview.type === 'text') {
            target.innerHTML = '<div class="preview-text">' + escapeHtml(preview.data) + '</div>';
        } else if (preview.type === 'info') {
            target.innerHTML = '<div class="preview-info">' + escapeHtml(preview.data).replace(/\n/g, '<br>') + '</div>';
        } else if (preview.type === 'error') {
            target.innerHTML = '<div class="preview-error"> ' + escapeHtml(preview.message) + '</div>';
        }
    });
}

// ==================== ACTIONS ====================

function deleteSelected() {
    if (selectedResultIndex === null) return;
    showConfirm('Konfirmasi Penghapusan',
        'Apakah Anda yakin ingin memindahkan file terduga duplikat (File 2) ke Recycle Bin?',
        function() {
            eel.delete_file2(selectedResultIndex)(function(response) {
                if (response.success) {
                    const row = document.querySelector('#resultBody tr[data-index="' + selectedResultIndex + '"]');
                    if (row) {
                        row.remove();
                        reindexRows();
                        updateResultCount();
                        selectedResultIndex = null;
                        lastSelectedRow = null;
                        disableActionButtons();
                        clearPreview();
                        if (document.querySelectorAll('#resultBody tr').length === 0) {
                            clearResults();
                        }
                    }
                } else {
                    showAlert('error', 'Gagal Menghapus', 'Error: ' + response.error);
                }
            });
        }
    );
}

function moveSelected() {
    if (selectedResultIndex === null) return;
    eel.choose_destination()(function(destFolder) {
        if (!destFolder) return;
        showConfirm('Konfirmasi Pemindahan',
            'Pindahkan file duplikat ke:\n' + destFolder + '?',
            function() {
                eel.move_file2(selectedResultIndex, destFolder)(function(response) {
                    if (response.success) {
                        const row = document.querySelector('#resultBody tr[data-index="' + selectedResultIndex + '"]');
                        if (row) {
                            row.remove();
                            reindexRows();
                            updateResultCount();
                            selectedResultIndex = null;
                            lastSelectedRow = null;
                            disableActionButtons();
                            clearPreview();
                            if (document.querySelectorAll('#resultBody tr').length === 0) {
                                clearResults();
                            }
                        }
                    } else {
                        showAlert('error', 'Gagal Memindahkan', 'Error: ' + response.error);
                    }
                });
            }
        );
    });
}

function openLocation(fileIndex) {
    if (selectedResultIndex === null) return;
    eel.open_file_location(selectedResultIndex, fileIndex)(function(response) {
        if (!response.success) {
            showAlert('error', 'Gagal', 'Error: ' + response.error);
        }
    });
}

function disableActionButtons() {
    document.getElementById('btnDelete').disabled = true;
    document.getElementById('btnMove').disabled = true;
    document.getElementById('btnOpen1').disabled = true;
    document.getElementById('btnOpen2').disabled = true;
}

function clearPreview() {
    document.getElementById('preview1').innerHTML = '<span class="preview-placeholder">[Pilih baris untuk melihat]</span>';
    document.getElementById('preview2').innerHTML = '<span class="preview-placeholder">[Pilih baris untuk melihat]</span>';
}

// ==================== MODALS ====================

function showConfirm(title, message, callback) {
    const modal = document.getElementById('confirmModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalMessage').textContent = message;
    modal.classList.remove('hidden');

    const confirmBtn = document.getElementById('modalConfirm');
    const cancelBtn = document.getElementById('modalCancel');

    function cleanup() {
        modal.classList.add('hidden');
        confirmBtn.onclick = null;
        cancelBtn.onclick = null;
        modal.onclick = null;
    }

    confirmBtn.onclick = function() {
        cleanup();
        if (callback) callback();
    };
    cancelBtn.onclick = cleanup;
    modal.onclick = function(e) {
        if (e.target === modal) {
            cleanup();
        }
    };
}

// ==================== UTILITIES ====================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function reindexRows() {
    const rows = document.querySelectorAll('#resultBody tr:not(.empty-table)');
    rows.forEach(function(row, index) {
        row.dataset.index = index;
    });
}

// ==================== INIT ====================

document.addEventListener('DOMContentLoaded', function() {
    eel.get_folders()(function(folders) {
        renderFolderList(folders);
        updateScanButton();
    });

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Delete' && selectedResultIndex !== null) {
            deleteSelected();
        }
        if (e.key === 'Escape') {
            document.getElementById('confirmModal').classList.add('hidden');
            document.getElementById('alertModal').classList.add('hidden');
        }
    });
});
