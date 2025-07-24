let currentDir = "/home/";

// Wait for Tauri to be ready
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded');
    
    // Set up path bar event listeners
    setupPathBar();
    
    // Wait a bit for Tauri to fully initialize
    setTimeout(async () => {
        if (window.__TAURI__ && window.__TAURI__.core) {
            console.log('Tauri is available!');
            await loadDirectory(currentDir);
        } else {
            console.error('Tauri API not available');
            showError('Tauri API not available. Make sure you are running in Tauri environment.');
        }
    }, 500);
});

// Set up path bar event listeners
function setupPathBar() {
    const pathInput = document.getElementById('currentPath');
    
    // Handle Enter key press
    pathInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const newPath = pathInput.value.trim();
            if (newPath) {
                navigateToPath(newPath);
            }
        }
    });
    
    // Handle losing focus (blur event)
    pathInput.addEventListener('blur', () => {
        const newPath = pathInput.value.trim();
        if (newPath && newPath !== currentDir) {
            navigateToPath(newPath);
        } else if (!newPath) {
            // Restore current path if input is empty
            pathInput.value = currentDir;
        }
    });
}

// Navigate to a specific path
async function navigateToPath(path) {
    const pathInput = document.getElementById('currentPath');
    
    try {
        // Normalize the path (ensure it ends with / for directories)
        const normalizedPath = path.endsWith('/') ? path : path + '/';
        
        // Try to load the directory
        await loadDirectory(normalizedPath);
        
        // If successful, update the current directory
        currentDir = normalizedPath;
        pathInput.value = normalizedPath;
        
    } catch (error) {
        console.error('Error navigating to path:', error);
        showError(`Error navigating to "${path}": ${error}`);
        
        // Restore the previous valid path
        pathInput.value = currentDir;
    }
}

// Helper function to check if a file is an image based on its extension
function isImageFile(filename) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg', '.ico', '.tiff', '.tif'];
    const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(extension);
}

async function loadDirectory(dirPath) {
    const fileListEl = document.getElementById('fileList');
    const pathEl = document.getElementById('currentPath');
    
    fileListEl.innerHTML = '<div class="loading">Loading directory contents...</div>';
    pathEl.value = dirPath;
    
    try {
        // Use the correct invoke method
        const entries = await window.__TAURI__.core.invoke('read_directory', { path: dirPath });
        console.log('Directory contents:', entries);
        await displayFiles(entries);
    } catch (error) {
        console.error('Error reading directory:', error);
        throw new Error(`Error reading directory: ${error}`);
    }
}

async function displayFiles(entries) {
    const fileListEl = document.getElementById('fileList');
    
    if (entries.length === 0) {
        fileListEl.innerHTML = '<div class="error">Directory is empty</div>';
        return;
    }
    
    // Sort entries: folders first, then by name (case-insensitive)
    const sortedEntries = entries.sort((a, b) => {
        if (a.is_dir && !b.is_dir) return -1;
        if (!a.is_dir && b.is_dir) return 1;
        return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
    });
    
    // Create the HTML structure first, then load images asynchronously
    const gridHtml = sortedEntries.map(entry => {
        const isFolder = entry.is_dir;
        const isImage = !isFolder && isImageFile(entry.name);
        
        let className = isFolder ? 'folder' : 'file';
        if (entry.name.startsWith('.')) {
            className += ' hidden';
        }
        
        // Choose the appropriate icon or placeholder for images
        let iconHtml;
        if (isFolder) {
            iconHtml = `<img class="file-icon" src="icons/folderIcon.png">`;
        } else if (isImage) {
            // Start with a placeholder, we'll load the actual image after
            iconHtml = `<img class="file-icon image-preview" id="img-${btoa(entry.path)}" src="icons/file.png">`;
        } else {
            iconHtml = `<img class="file-icon" src="icons/file.png">`;
        }
        
        // For non-image files, show the file extension
        let fileTypeDiv = '';
        if (!isFolder && !isImage) {
            const lastDotIndex = entry.name.lastIndexOf('.');
            if (lastDotIndex > 0) {
                const fileExtension = entry.name.substring(lastDotIndex);
                fileTypeDiv = `<div class="file-type">${fileExtension}</div>`;
            }
        }
        
        return `
            <div class="file-item ${className}" onclick="handleFileClick('${entry.path}', ${isFolder})">
                ${iconHtml}
                ${fileTypeDiv}
                <div class="file-name">${entry.name}</div>
            </div>
        `;
    }).join('');
    
    fileListEl.innerHTML = `<div class="file-grid">${gridHtml}</div>`;
    
    // Now load the actual images asynchronously
    for (const entry of sortedEntries) {
        if (!entry.is_dir && isImageFile(entry.name)) {
            await loadImagePreview(entry.path);
        }
    }
}

// Function to load an image as base64 and display it
async function loadImagePreview(imagePath) {
    try {
        // Read the image file as binary data
        const imageData = await window.__TAURI__.core.invoke('read_file_binary', { path: imagePath });
        
        // Convert to base64
        const base64String = btoa(String.fromCharCode.apply(null, imageData));
        
        // Determine MIME type based on file extension
        const extension = imagePath.toLowerCase().substring(imagePath.lastIndexOf('.'));
        let mimeType = 'image/png'; // default
        switch (extension) {
            case '.jpg':
            case '.jpeg':
                mimeType = 'image/jpeg';
                break;
            case '.png':
                mimeType = 'image/png';
                break;
            case '.gif':
                mimeType = 'image/gif';
                break;
            case '.webp':
                mimeType = 'image/webp';
                break;
            case '.svg':
                mimeType = 'image/svg+xml';
                break;
            case '.bmp':
                mimeType = 'image/bmp';
                break;
        }
        
        // Create data URL
        const dataUrl = `data:${mimeType};base64,${base64String}`;
        
        // Find the image element and update its src
        const imgElement = document.getElementById(`img-${btoa(imagePath)}`);
        if (imgElement) {
            imgElement.src = dataUrl;
        }
        
    } catch (error) {
        console.error('Error loading image preview:', error);
        // Leave the default file icon if loading fails
    }
}

async function handleFileClick(path, isFolder) {
    if (isFolder) {
        currentDir = path;
        document.getElementById('currentPath').value = path;
        loadDirectory(path);
    } else {
        console.log('File clicked:', path);
        try {
            // Try to open the file with a custom Tauri command
            await window.__TAURI__.core.invoke('open_file', { path: path });
            console.log('File opened successfully:', path);
        } catch (error) {
            console.error('Error opening file:', error);
            showError(`Error opening file: ${error}`);
        }
    }
}

function showError(message) {
    const fileListEl = document.getElementById('fileList');
    fileListEl.innerHTML = `<div class="error">${message}</div>`;
}

// Test function - you can call this from console
window.testTauri = function() {
    console.log('Testing Tauri availability...');
    console.log('window.__TAURI__:', window.__TAURI__);
    if (window.__TAURI__ && window.__TAURI__.fs) {
        console.log('Tauri FS API available');
        loadDirectory(currentDir);
    } else {
        console.log('Tauri FS API not available');
    }
};