function autoSaveSettings() {
    const displayType = document.getElementById('display-type').value;
    localStorage.setItem('tkbhsDisplayType', displayType);
}

window.onload = function() {
    const savedDisplayType = localStorage.getItem('tkbhsDisplayType') || 'split';
    document.getElementById('display-type').value = savedDisplayType;
    
    // Add change event listener for auto-save
    document.getElementById('display-type').addEventListener('change', autoSaveSettings);
};