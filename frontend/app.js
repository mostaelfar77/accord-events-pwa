// Accord Events Registration System
class AccordEventsApp {
    constructor() {
        this.attendees = [];
        this.registeredAttendees = [];
        this.currentSearchResults = [];
        this.selectedAttendee = null;
        this.isWalkIn = false;
        this.pendingWalkInName = '';
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.loadEventSettings();
        this.updateUI();
    }

    // Data Management
    loadData() {
        // Try primary storage first
        let savedAttendees = localStorage.getItem('accord_attendees');
        let savedRegistered = localStorage.getItem('accord_registered');
        
        // If primary storage failed, try backup storage
        if (!savedAttendees) {
            savedAttendees = sessionStorage.getItem('accord_backup_attendees');
        }
        if (!savedRegistered) {
            savedRegistered = sessionStorage.getItem('accord_backup_registered');
        }
        
        // Load data if available
        if (savedAttendees) {
            try {
            this.attendees = JSON.parse(savedAttendees);
            } catch (e) {
                console.error('Error loading attendees data:', e);
                this.attendees = [];
            }
        }
        
        if (savedRegistered) {
            try {
            this.registeredAttendees = JSON.parse(savedRegistered);
            } catch (e) {
                console.error('Error loading registered data:', e);
                this.registeredAttendees = [];
            }
        }
        
        // Log recovery if backup was used
        if (!localStorage.getItem('accord_attendees') && sessionStorage.getItem('accord_backup_attendees')) {
            console.log('Recovered data from backup storage');
        }
    }

    saveData() {
        try {
            // Primary storage
        localStorage.setItem('accord_attendees', JSON.stringify(this.attendees));
        localStorage.setItem('accord_registered', JSON.stringify(this.registeredAttendees));
            
            // Backup storage
            sessionStorage.setItem('accord_backup_attendees', JSON.stringify(this.attendees));
            sessionStorage.setItem('accord_backup_registered', JSON.stringify(this.registeredAttendees));
            
            // Timestamp
            localStorage.setItem('accord_last_save', new Date().toISOString());
            
        } catch (e) {
            console.error('Error saving data:', e);
            this.showNotification('Warning: Could not save data. Please export your data.', 'warning');
        }
    }

    // Event Listeners
    setupEventListeners() {
        // Dark Mode Toggle
        const darkModeToggle = document.getElementById('darkModeToggle');
        darkModeToggle.addEventListener('click', () => this.toggleDarkMode());
        
        // Load dark mode preference
        this.loadDarkModePreference();
        
        // Auto-save functionality
        this.setupAutoSave();
        
        // File upload
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        
        fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('drop', (e) => this.handleFileDrop(e));

        // Official Registration
        const officialNameInput = document.getElementById('officialNameInput');
        const registerOfficialBtn = document.getElementById('registerOfficialBtn');
        
        officialNameInput.addEventListener('input', (e) => this.handleOfficialNameInput(e));
        officialNameInput.addEventListener('keydown', (e) => this.handleOfficialNameKeydown(e));
        registerOfficialBtn.addEventListener('click', () => this.registerOfficialAttendee());

        // Walk-in Registration
        const walkInNameInput = document.getElementById('walkInNameInput');
        const walkInPhoneInput = document.getElementById('walkInPhoneInput');
        const registerWalkInBtn = document.getElementById('registerWalkInBtn');
        
        walkInNameInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                registerWalkInBtn.click();
            }
        });
        
        walkInPhoneInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                registerWalkInBtn.click();
            }
        });
        
        registerWalkInBtn.addEventListener('click', () => this.registerWalkInAttendee());

        // Autocomplete
        const closeAutocomplete = document.getElementById('closeAutocomplete');
        closeAutocomplete.addEventListener('click', () => this.hideAutocomplete());

        // Event Settings
        const saveEventBtn = document.getElementById('saveEventBtn');
        saveEventBtn.addEventListener('click', () => this.saveEventSettings());

        // Reports
        const downloadReportBtn = document.getElementById('downloadReportBtn');
        const exportDataBtn = document.getElementById('exportDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const printBadgesBtn = document.getElementById('printBadgesBtn');
        const printCertificatesBtn = document.getElementById('printCertificatesBtn');
        const searchCertificateBtn = document.getElementById('searchCertificateBtn');
        
        downloadReportBtn.addEventListener('click', () => this.downloadReport());
        exportDataBtn.addEventListener('click', () => this.exportData());
        importDataBtn.addEventListener('click', () => this.showImportModal());
        printBadgesBtn.addEventListener('click', () => this.printBadges());
        printCertificatesBtn.addEventListener('click', () => this.printCertificates());
        searchCertificateBtn.addEventListener('click', () => this.showCertificateSearchModal());

        // Reset
        const resetBtn = document.getElementById('resetBtn');
        const confirmResetBtn = document.getElementById('confirmResetBtn');
        const cancelResetBtn = document.getElementById('cancelResetBtn');
        const closeResetModal = document.getElementById('closeResetModal');
        
        resetBtn.addEventListener('click', () => this.showResetModal());
        confirmResetBtn.addEventListener('click', () => this.confirmReset());
        cancelResetBtn.addEventListener('click', () => this.hideResetModal());
        closeResetModal.addEventListener('click', () => this.hideResetModal());

        // Modal close
        const closeDuplicateModal = document.getElementById('closeDuplicateModal');
        closeDuplicateModal.addEventListener('click', () => this.hideDuplicateModal());

        // Certificate Search Modal
        const closeCertificateSearchModal = document.getElementById('closeCertificateSearchModal');
        const cancelCertificateSearchBtn = document.getElementById('cancelCertificateSearchBtn');
        const certificateSearchInput = document.getElementById('certificateSearchInput');
        const printIndividualCertificateBtn = document.getElementById('printIndividualCertificateBtn');
        
        closeCertificateSearchModal.addEventListener('click', () => this.hideCertificateSearchModal());
        cancelCertificateSearchBtn.addEventListener('click', () => this.hideCertificateSearchModal());
        certificateSearchInput.addEventListener('input', (e) => this.handleCertificateSearchInput(e));
        printIndividualCertificateBtn.addEventListener('click', () => this.printIndividualCertificate());

        // Certificate Filter Modal
        const closeCertificateFilterModal = document.getElementById('closeCertificateFilterModal');
        const cancelCertificateFilterBtn = document.getElementById('cancelCertificateFilterBtn');
        
        closeCertificateFilterModal.addEventListener('click', () => this.hideCertificateFilterModal());
        cancelCertificateFilterBtn.addEventListener('click', () => this.hideCertificateFilterModal());

        // Click outside modals to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideResetModal();
                this.hideDuplicateModal();
                this.hideCertificateSearchModal();
                this.hideCertificateFilterModal();
            }
            if (e.target.classList.contains('autocomplete-dropdown')) {
                this.hideAutocomplete();
            }
        });

        // Certificate template upload
        const certInput = document.getElementById('certificateTemplateInput');
        const previewGroup = document.getElementById('certificateTemplatePreviewGroup');
        const previewImg = document.getElementById('certificateTemplatePreview');
        const placementBox = document.getElementById('namePlacementBox');
        const previewContainer = document.getElementById('certificateTemplatePreviewContainer');
        certInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                if (!this.checkFileSize(file, 5)) {
                    e.target.value = ''; // Clear the input
                    return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    previewImg.src = ev.target.result;
                    previewGroup.style.display = '';
                    previewImg.onload = () => {
                        placementBox.style.display = 'block';
                        this.setPlacementBox(0.3, 0.4, 0.4, 0.12); // default
                    };
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Badge template upload
        const badgeInput = document.getElementById('badgeTemplateInput');
        const badgePreviewGroup = document.getElementById('badgeTemplatePreviewGroup');
        const badgePreviewImg = document.getElementById('badgeTemplatePreview');
        const badgePlacementBox = document.getElementById('badgeNamePlacementBox');
        const badgePreviewContainer = document.getElementById('badgeTemplatePreviewContainer');
        badgeInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && file.type.startsWith('image/')) {
                if (!this.checkFileSize(file, 4)) {
                    e.target.value = ''; // Clear the input
                    return;
                }
                const reader = new FileReader();
                reader.onload = (ev) => {
                    badgePreviewImg.src = ev.target.result;
                    badgePreviewGroup.style.display = '';
                    badgePreviewImg.onload = () => {
                        badgePlacementBox.style.display = 'block';
                        this.setBadgePlacementBox(0.3, 0.4, 0.4, 0.12); // default
                    };
                };
                reader.readAsDataURL(file);
            }
        });
        
        // Certificate placement box drag/resize
        let drag = false, resize = false, startX, startY, startLeft, startTop, startWidth, startHeight;
        placementBox.addEventListener('mousedown', (e) => {
            const rect = placementBox.getBoundingClientRect();
            const isResizeArea = e.clientX > rect.right - 16 && e.clientY > rect.bottom - 16;
            
            if (isResizeArea) {
                resize = true;
            } else {
                drag = true;
            }
            
            startX = e.clientX;
            startY = e.clientY;
            startLeft = placementBox.offsetLeft;
            startTop = placementBox.offsetTop;
            startWidth = placementBox.offsetWidth;
            startHeight = placementBox.offsetHeight;
            placementBox.classList.add('active');
            e.preventDefault();
        });
        
        // Badge placement box drag/resize
        let badgeDrag = false, badgeResize = false, badgeStartX, badgeStartY, badgeStartLeft, badgeStartTop, badgeStartWidth, badgeStartHeight;
        badgePlacementBox.addEventListener('mousedown', (e) => {
            const rect = badgePlacementBox.getBoundingClientRect();
            const isResizeArea = e.clientX > rect.right - 16 && e.clientY > rect.bottom - 16;
            
            if (isResizeArea) {
                badgeResize = true;
            } else {
                badgeDrag = true;
            }
            
            badgeStartX = e.clientX;
            badgeStartY = e.clientY;
            badgeStartLeft = badgePlacementBox.offsetLeft;
            badgeStartTop = badgePlacementBox.offsetTop;
            badgeStartWidth = badgePlacementBox.offsetWidth;
            badgeStartHeight = badgePlacementBox.offsetHeight;
            badgePlacementBox.classList.add('active');
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!drag && !resize && !badgeDrag && !badgeResize) return;
            
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            
            // Handle certificate placement box
            if (drag || resize) {
                const container = previewContainer;
                if (drag) {
                    let newLeft = startLeft + dx;
                    let newTop = startTop + dy;
                    
                    // Constrain to container bounds
                    newLeft = Math.max(0, Math.min(newLeft, container.offsetWidth - startWidth));
                    newTop = Math.max(0, Math.min(newTop, container.offsetHeight - startHeight));
                    
                    placementBox.style.left = newLeft + 'px';
                    placementBox.style.top = newTop + 'px';
                } else if (resize) {
                    let newWidth = Math.max(40, startWidth + dx);
                    let newHeight = Math.max(24, startHeight + dy);
                    
                    // Constrain to container bounds
                    newWidth = Math.min(newWidth, container.offsetWidth - startLeft);
                    newHeight = Math.min(newHeight, container.offsetHeight - startTop);
                    
                    placementBox.style.width = newWidth + 'px';
                    placementBox.style.height = newHeight + 'px';
                }
            }
            
            // Handle badge placement box
            if (badgeDrag || badgeResize) {
                const badgeContainer = badgePreviewContainer;
                const badgeDx = e.clientX - badgeStartX;
                const badgeDy = e.clientY - badgeStartY;
                
                if (badgeDrag) {
                    let newLeft = badgeStartLeft + badgeDx;
                    let newTop = badgeStartTop + badgeDy;
                    
                    // Constrain to container bounds
                    newLeft = Math.max(0, Math.min(newLeft, badgeContainer.offsetWidth - badgeStartWidth));
                    newTop = Math.max(0, Math.min(newTop, badgeContainer.offsetHeight - badgeStartHeight));
                    
                    badgePlacementBox.style.left = newLeft + 'px';
                    badgePlacementBox.style.top = newTop + 'px';
                } else if (badgeResize) {
                    let newWidth = Math.max(40, badgeStartWidth + badgeDx);
                    let newHeight = Math.max(24, badgeStartHeight + badgeDy);
                    
                    // Constrain to container bounds
                    newWidth = Math.min(newWidth, badgeContainer.offsetWidth - badgeStartLeft);
                    newHeight = Math.min(newHeight, badgeContainer.offsetHeight - badgeStartTop);
                    
                    badgePlacementBox.style.width = newWidth + 'px';
                    badgePlacementBox.style.height = newHeight + 'px';
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            drag = false;
            resize = false;
            badgeDrag = false;
            badgeResize = false;
            placementBox.classList.remove('active');
            badgePlacementBox.classList.remove('active');
        });
    }

    // File Upload Handling
    handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
            this.processExcelFile(file);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.currentTarget.classList.add('dragover');
    }

    handleFileDrop(event) {
        event.preventDefault();
        event.currentTarget.classList.remove('dragover');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processExcelFile(files[0]);
        }
    }

    processExcelFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                
                // Validate format (should have 2 columns: Name and Phone)
                if (jsonData.length < 2) {
                    this.showNotification('Invalid Excel format. Please ensure the file has Name and Phone Number columns.', 'error');
                    return;
                }

                // Skip header row and process data
                const attendees = [];
                for (let i = 1; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row.length >= 2 && row[0] && row[1]) {
                        attendees.push({
                            name: row[0].toString().trim(),
                            phone: row[1].toString().trim(),
                            type: 'official'
                        });
                    }
                }

                if (attendees.length === 0) {
                    this.showNotification('No valid data found in the Excel file.', 'error');
                    return;
                }

                this.attendees = attendees;
                this.saveData();
                this.showUploadSuccess(attendees.length);
                this.updateUI();
                
            } catch (error) {
                console.error('Error processing Excel file:', error);
                this.showNotification('Error processing Excel file. Please ensure it\'s a valid Excel file.', 'error');
            }
        };
        
        reader.readAsArrayBuffer(file);
    }

    // Event Settings
    loadEventSettings() {
        const savedEventName = localStorage.getItem('accord_event_name');
        if (savedEventName) {
            document.getElementById('eventNameInput').value = savedEventName;
        }
        
        // Load auto-print badge setting
        const autoPrintBadges = localStorage.getItem('accord_auto_print_badges');
        const autoPrintCheckbox = document.getElementById('autoPrintBadgesCheckbox');
        if (autoPrintCheckbox) {
            autoPrintCheckbox.checked = autoPrintBadges === 'true';
        }
        
        // Load pre-printed certificate setting
        const prePrintedCertificates = localStorage.getItem('accord_pre_printed_certificates');
        const prePrintedCertificatesCheckbox = document.getElementById('prePrintedCertificatesCheckbox');
        if (prePrintedCertificatesCheckbox) {
            prePrintedCertificatesCheckbox.checked = prePrintedCertificates === 'true';
        }
        
        // Load pre-printed badge setting
        const prePrintedBadges = localStorage.getItem('accord_pre_printed_badges');
        const prePrintedBadgesCheckbox = document.getElementById('prePrintedBadgesCheckbox');
        if (prePrintedBadgesCheckbox) {
            prePrintedBadgesCheckbox.checked = prePrintedBadges === 'true';
        }
        
        // Load certificate template image and placement
        const certTemplateDataUrl = localStorage.getItem('accord_cert_template');
        const certPlacement = localStorage.getItem('accord_cert_placement');
        const previewGroup = document.getElementById('certificateTemplatePreviewGroup');
        const previewImg = document.getElementById('certificateTemplatePreview');
        const placementBox = document.getElementById('namePlacementBox');
        if (certTemplateDataUrl) {
            previewGroup.style.display = '';
            previewImg.src = certTemplateDataUrl;
            previewImg.onload = () => {
                placementBox.style.display = 'block';
                if (certPlacement) {
                    const {x, y, w, h} = JSON.parse(certPlacement);
                    this.setPlacementBox(x, y, w, h);
                } else {
                    this.setPlacementBox(0.3, 0.4, 0.4, 0.12); // default
                }
            };
        } else {
            previewGroup.style.display = 'none';
        }

        // Load badge template image and placement
        const badgeTemplateDataUrl = localStorage.getItem('accord_badge_template');
        const badgePlacement = localStorage.getItem('accord_badge_placement');
        const badgePreviewGroup = document.getElementById('badgeTemplatePreviewGroup');
        const badgePreviewImg = document.getElementById('badgeTemplatePreview');
        const badgePlacementBox = document.getElementById('badgeNamePlacementBox');
        if (badgeTemplateDataUrl) {
            badgePreviewGroup.style.display = '';
            badgePreviewImg.src = badgeTemplateDataUrl;
            badgePreviewImg.onload = () => {
                badgePlacementBox.style.display = 'block';
                if (badgePlacement) {
                    const {x, y, w, h} = JSON.parse(badgePlacement);
                    this.setBadgePlacementBox(x, y, w, h);
                } else {
                    this.setBadgePlacementBox(0.3, 0.4, 0.4, 0.12); // default
                }
            };
        } else {
            badgePreviewGroup.style.display = 'none';
        }
    }

    // Check available localStorage space
    getAvailableStorage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return total;
    }

    // Clear old template data to make room
    clearOldTemplateData() {
        try {
            // Remove old template data to free up space
            localStorage.removeItem('accord_cert_template');
            localStorage.removeItem('accord_badge_template');
            console.log('Cleared old template data to free up space');
            console.log('Current localStorage usage:', this.getAvailableStorage(), 'characters');
        } catch (error) {
            console.error('Error clearing old template data:', error);
        }
    }

    // Check if there's enough space for a template
    hasEnoughSpace(templateSize) {
        const currentUsage = this.getAvailableStorage();
        const estimatedTotal = currentUsage + templateSize;
        const maxStorage = 6 * 1024 * 1024; // Increased to 6MB limit
        return estimatedTotal <= maxStorage;
    }

    // Save templates with better space management
    saveTemplateWithRetry(key, data, templateName) {
        try {
            // First, try to save directly
            localStorage.setItem(key, data);
            console.log(`${templateName} saved successfully`);
            return true;
        } catch (error) {
            console.error(`Failed to save ${templateName}:`, error);
            
            // If it's a quota error, try clearing some space
            if (error.name === 'QuotaExceededError') {
                console.log('Quota exceeded, trying to clear some space...');
                
                // Clear some non-essential data
                const keysToClear = ['accord_official_attendees', 'accord_registered_attendees'];
                for (let keyToClear of keysToClear) {
                    try {
                        localStorage.removeItem(keyToClear);
                        console.log(`Cleared ${keyToClear} to free up space`);
                    } catch (clearError) {
                        console.error(`Error clearing ${keyToClear}:`, clearError);
                    }
                }
                
                // Try saving again
                try {
                    localStorage.setItem(key, data);
                    console.log(`${templateName} saved successfully after clearing space`);
                    return true;
                } catch (retryError) {
                    console.error(`Still failed to save ${templateName} after clearing space:`, retryError);
                    return false;
                }
            }
            return false;
        }
    }

    saveEventSettings() {
        const eventName = document.getElementById('eventNameInput').value.trim();
        if (!eventName) {
            this.showNotification('Please enter an event name.', 'error');
            return;
        }
        
        try {
            // Clear old template data first to free up space
            this.clearOldTemplateData();
            
            // Save event name
            localStorage.setItem('accord_event_name', eventName);
            
            // Save auto-print badge setting
            const autoPrintCheckbox = document.getElementById('autoPrintBadgesCheckbox');
            if (autoPrintCheckbox) {
                localStorage.setItem('accord_auto_print_badges', autoPrintCheckbox.checked.toString());
            }
            
            // Save pre-printed certificate setting
            const prePrintedCertificatesCheckbox = document.getElementById('prePrintedCertificatesCheckbox');
            if (prePrintedCertificatesCheckbox) {
                localStorage.setItem('accord_pre_printed_certificates', prePrintedCertificatesCheckbox.checked.toString());
            }
            
            // Save pre-printed badge setting
            const prePrintedBadgesCheckbox = document.getElementById('prePrintedBadgesCheckbox');
            if (prePrintedBadgesCheckbox) {
                localStorage.setItem('accord_pre_printed_badges', prePrintedBadgesCheckbox.checked.toString());
            }
            
            // Check certificate template
            const certPreviewImg = document.getElementById('certificateTemplatePreview');
            let certSaved = false;
            if (certPreviewImg && certPreviewImg.src && certPreviewImg.src !== window.location.href) {
                const certSize = certPreviewImg.src.length;
                console.log('Certificate template size:', certSize, 'characters');
                console.log('Certificate template size in MB:', (certSize / 1024 / 1024).toFixed(2), 'MB');
                console.log('localStorage usage before certificate:', this.getAvailableStorage(), 'characters');
                
                if (this.hasEnoughSpace(certSize)) {
                    certSaved = this.saveTemplateWithRetry('accord_cert_template', certPreviewImg.src, 'Certificate template');
                    if (certSaved) {
                        console.log('localStorage usage after certificate:', this.getAvailableStorage(), 'characters');
                    }
                } else {
                    console.error('Not enough space for certificate template');
                    this.showNotification('Certificate template too large. Please use a smaller image (under 2.5MB).', 'error');
                }
            }
            
            const placementBox = document.getElementById('namePlacementBox');
            if (placementBox && placementBox.style.display !== 'none') {
                try {
                    const {x, y, w, h} = this.getPlacementBox();
                    localStorage.setItem('accord_cert_placement', JSON.stringify({x, y, w, h}));
                } catch (error) {
                    console.error('Error saving certificate placement:', error);
                }
            }

            // Check badge template
            const badgePreviewImg = document.getElementById('badgeTemplatePreview');
            let badgeSaved = false;
            if (badgePreviewImg && badgePreviewImg.src && badgePreviewImg.src !== window.location.href) {
                const badgeSize = badgePreviewImg.src.length;
                console.log('Badge template size:', badgeSize, 'characters');
                console.log('Badge template size in MB:', (badgeSize / 1024 / 1024).toFixed(2), 'MB');
                console.log('localStorage usage before badge:', this.getAvailableStorage(), 'characters');
                
                if (this.hasEnoughSpace(badgeSize)) {
                    badgeSaved = this.saveTemplateWithRetry('accord_badge_template', badgePreviewImg.src, 'Badge template');
                    if (badgeSaved) {
                        console.log('localStorage usage after badge:', this.getAvailableStorage(), 'characters');
                    }
                } else {
                    console.error('Not enough space for badge template');
                    this.showNotification('Badge template too large. Please use a smaller image (under 1MB).', 'error');
                }
            }
            
            const badgePlacementBox = document.getElementById('badgeNamePlacementBox');
            if (badgePlacementBox && badgePlacementBox.style.display !== 'none') {
                try {
                    const {x, y, w, h} = this.getBadgePlacementBox();
                    localStorage.setItem('accord_badge_placement', JSON.stringify({x, y, w, h}));
                } catch (error) {
                    console.error('Error saving badge placement:', error);
                }
            }
            
            // Show success message based on what was saved
            if (certSaved && badgeSaved) {
                this.showNotification('Event settings saved successfully!', 'success');
            } else if (certSaved) {
                this.showNotification('Event settings saved (certificate only). Badge template too large.', 'success');
            } else if (badgeSaved) {
                this.showNotification('Event settings saved (badge only). Certificate template too large.', 'success');
            } else {
                this.showNotification('Event name saved. Both templates too large for storage.', 'error');
            }
            
        } catch (error) {
            this.showNotification('Error saving settings. Please try again.', 'error');
            console.error('Error saving event settings:', error);
        }
    }

    showUploadSuccess(count) {
        const uploadStatus = document.getElementById('uploadStatus');
        const statusText = document.getElementById('statusText');
        const attendeeCount = document.getElementById('attendeeCount');
        
        statusText.textContent = 'File uploaded successfully!';
        attendeeCount.textContent = `${count} attendees loaded`;
        uploadStatus.style.display = 'block';
        
        // Show registration section
        document.getElementById('registrationSection').style.display = 'block';
        document.getElementById('eventSettingsSection').style.display = 'block';
        document.getElementById('reportsSection').style.display = 'block';
        
        this.showNotification(`Successfully loaded ${count} attendees!`, 'success');
    }

    // Fuzzy Search Functions
    calculateSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const distance = this.levenshteinDistance(longer, shorter);
        return (longer.length - distance) / longer.length;
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    // Common name variations mapping
    getCommonVariations(name) {
        const variations = {
            'mostafa': ['mustafa', 'mustapha', 'moustapha', 'moustafa'],
            'mustafa': ['mostafa', 'mustapha', 'moustapha', 'moustafa'],
            'mohammed': ['muhammad', 'mohamed', 'muhammad'],
            'muhammad': ['mohammed', 'mohamed', 'muhammad'],
            'ahmed': ['ahmad', 'ahmet'],
            'ahmad': ['ahmed', 'ahmet'],
            'ali': ['aly', 'alee'],
            'fatima': ['fatma', 'fatimah'],
            'fatma': ['fatima', 'fatimah'],
            'aisha': ['aysha', 'aicha'],
            'aysha': ['aisha', 'aicha'],
            'youssef': ['yousef', 'yusuf', 'youssef'],
            'yousef': ['youssef', 'yusuf', 'youssef'],
            'omar': ['umar', 'ummar'],
            'umar': ['omar', 'ummar'],
            'khalid': ['khaled', 'khalil'],
            'khaled': ['khalid', 'khalil'],
            'hassan': ['hasan', 'hassaan'],
            'hasan': ['hassan', 'hassaan'],
            'ibrahim': ['ibraheem', 'ibraheem'],
            'sara': ['sarah', 'saraa'],
            'sarah': ['sara', 'saraa'],
            'nour': ['noor', 'nur'],
            'noor': ['nour', 'nur'],
            'laila': ['layla', 'leila'],
            'layla': ['laila', 'leila'],
            'ranya': ['rania', 'ranyah'],
            'rania': ['ranya', 'ranyah']
        };
        
        const normalizedName = name.toLowerCase().trim();
        return variations[normalizedName] || [];
    }

    // Official Registration
    handleOfficialNameInput(event) {
        const query = event.target.value.trim().toLowerCase();
        
        // Allow shorter queries for phone numbers (minimum 2 digits)
        const isPhoneQuery = /^\d+$/.test(query);
        const minLength = isPhoneQuery ? 2 : 3;
        
        if (query.length < minLength) {
            this.hideAutocomplete();
            return;
        }

        // Get all possible variations of the search query
        const queryVariations = [query, ...this.getCommonVariations(query)];
        
        const results = [];
        const seenNames = new Set();

        this.attendees.forEach(attendee => {
            const attendeeName = attendee.name.toLowerCase();
            const attendeePhone = attendee.phone ? attendee.phone.toLowerCase() : '';
            const attendeeVariations = [attendeeName, ...this.getCommonVariations(attendeeName)];
            
            // Check for phone number match first (highest priority)
            if (attendeePhone && attendeePhone.includes(query)) {
                if (!seenNames.has(attendee.name)) {
                    results.push({ attendee, score: 1.0, matchType: 'phone' });
                    seenNames.add(attendee.name);
                }
            }
            // Check for exact name matches
            else if (attendeeName.includes(query) || queryVariations.some(q => attendeeName.includes(q))) {
                if (!seenNames.has(attendee.name)) {
                    results.push({ attendee, score: 0.9, matchType: 'exact' });
                    seenNames.add(attendee.name);
                }
            }
            // Check for fuzzy name matches
            else {
                let bestScore = 0;
                let bestMatch = null;
                
                // Check query against attendee name and variations
                for (const queryVar of queryVariations) {
                    for (const attendeeVar of attendeeVariations) {
                        const similarity = this.calculateSimilarity(queryVar, attendeeVar);
                        if (similarity > bestScore) {
                            bestScore = similarity;
                            bestMatch = { attendee, score: similarity, matchType: 'fuzzy' };
                        }
                    }
                }
                
                // Only include if similarity is high enough (0.7 or higher)
                if (bestScore >= 0.7 && !seenNames.has(attendee.name)) {
                    results.push(bestMatch);
                    seenNames.add(attendee.name);
                }
            }
        });

        // Sort results: phone matches first, then exact name matches, then by similarity score
        results.sort((a, b) => {
            if (a.matchType === 'phone' && b.matchType !== 'phone') return -1;
            if (b.matchType === 'phone' && a.matchType !== 'phone') return 1;
            if (a.matchType === 'exact' && b.matchType !== 'exact') return -1;
            if (b.matchType === 'exact' && a.matchType !== 'exact') return 1;
            return b.score - a.score;
        });

        // Limit to top 10 results and preserve match type information
        const topResults = results.slice(0, 10);
        
        this.currentSearchResults = topResults.map(r => r.attendee);
        this.currentSearchMatchTypes = topResults.map(r => r.matchType);
        this.showAutocomplete(topResults);
    }

    handleOfficialNameKeydown(event) {
        const dropdown = document.getElementById('autocompleteList');
        const items = dropdown.querySelectorAll('.autocomplete-item');
        const selectedIndex = Array.from(items).findIndex(item => item.classList.contains('selected'));

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectAutocompleteItem(selectedIndex + 1, items);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.selectAutocompleteItem(selectedIndex - 1, items);
                break;
            case 'Enter':
                event.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    this.selectAttendee(this.currentSearchResults[selectedIndex]);
                }
                break;
            case 'Escape':
                this.hideAutocomplete();
                break;
        }
    }

    selectAutocompleteItem(index, items) {
        items.forEach(item => item.classList.remove('selected'));
        if (index >= 0 && index < items.length) {
            items[index].classList.add('selected');
        }
    }

    showAutocomplete(results) {
        const dropdown = document.getElementById('autocompleteDropdown');
        const list = document.getElementById('autocompleteList');
        list.innerHTML = '';

        if (results.length === 0) {
            dropdown.style.display = 'none';
            return;
        }

        results.forEach((result, index) => {
            const attendee = result.attendee;
            const matchType = result.matchType;
            const item = document.createElement('div');
            item.className = 'autocomplete-item';
            
            // Determine the indicator based on match type
            let indicator = '';
            if (matchType === 'phone') {
                indicator = '<span class="phone-indicator">📞 Phone match</span>';
            } else if (matchType === 'fuzzy') {
                indicator = '<span class="fuzzy-indicator">🔍 Similar match</span>';
            }
            
            item.innerHTML = `
                <span class="name">${attendee.name}</span>
                <span class="phone">${attendee.phone}</span>
                ${indicator}
            `;
            item.addEventListener('click', () => this.selectAttendee(attendee));
            list.appendChild(item);
        });

        dropdown.style.display = 'block';
    }

    hideAutocomplete() {
        document.getElementById('autocompleteDropdown').style.display = 'none';
    }

    selectAttendee(attendee) {
        this.selectedAttendee = attendee;
        this.isWalkIn = false;
        
        document.getElementById('officialNameInput').value = attendee.name;
        this.hideAutocomplete();
    }

    registerOfficialAttendee() {
        const nameInput = document.getElementById('officialNameInput');
        const name = nameInput.value.trim();
        
        if (!name) {
            this.showNotification('Please enter a name to register.', 'error');
            return;
        }

        // Find all attendees with this name in the official list
        const matchingAttendees = this.attendees.filter(attendee => 
            attendee.name.toLowerCase() === name.toLowerCase() && attendee.type === 'official'
            );
            
        if (matchingAttendees.length === 0) {
                this.showNotification('This name is not in the official list. Please use the Walk-in Registration section.', 'error');
                return;
            }

        // If there are multiple matches, ALWAYS show the duplicate modal
        if (matchingAttendees.length > 1) {
            this.showDuplicateModal(matchingAttendees);
            return;
        }

        // Only one match - check if it's already registered
        const singleAttendee = matchingAttendees[0];
        const existingRegistration = this.registeredAttendees.find(
            reg => reg.name.toLowerCase() === singleAttendee.name.toLowerCase() && 
                   reg.phone === singleAttendee.phone
        );

        if (existingRegistration) {
            this.showNotification('This exact person (same name and phone number) has already been registered.', 'error');
            return;
        }

        this.completeRegistration(singleAttendee);
    }

    // Walk-in Registration
    registerWalkInAttendee() {
        const nameInput = document.getElementById('walkInNameInput');
        const phoneInput = document.getElementById('walkInPhoneInput');
        
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();
        
        if (!name) {
            this.showNotification('Please enter a name for walk-in registration.', 'error');
            nameInput.focus();
            return;
        }
        
        if (!phone) {
            this.showNotification('Please enter a phone number for walk-in registration.', 'error');
            phoneInput.focus();
            return;
        }

        // Check if this exact person is already registered
        const existingRegistration = this.registeredAttendees.find(
            reg => reg.name.toLowerCase() === name.toLowerCase() && reg.phone === phone
        );

        if (existingRegistration) {
            this.showNotification('This exact person (same name and phone number) has already been registered.', 'error');
            return;
        }

        const walkInAttendee = {
            name: name,
            phone: phone,
            type: 'walk-in'
        };

        this.completeRegistration(walkInAttendee);
        
        // Clear walk-in form
        nameInput.value = '';
        phoneInput.value = '';
        nameInput.focus();
    }

    showDuplicateModal(duplicates) {
        const modal = document.getElementById('duplicateModal');
        const list = document.getElementById('duplicateList');
        
        // Clear the selected attendee so each search is treated independently
        this.selectedAttendee = null;
        
        list.innerHTML = '';
        duplicates.forEach((attendee, index) => {
            const item = document.createElement('div');
            item.className = 'duplicate-item';
            
            // Check if this specific person is already registered
            const isRegistered = this.registeredAttendees.some(registered => 
                registered.name.toLowerCase() === attendee.name.toLowerCase() && 
                registered.phone === attendee.phone
            );
            
            if (isRegistered) {
                item.className = 'duplicate-item registered';
                item.textContent = `${attendee.name} (${attendee.phone}) - ✅ Already Registered`;
                item.style.opacity = '0.6';
                item.style.cursor = 'not-allowed';
            } else {
            item.textContent = `${attendee.name} (${attendee.phone})`;
            item.addEventListener('click', () => {
                this.completeRegistration(attendee);
                this.hideDuplicateModal();
            });
            }
            
            list.appendChild(item);
        });
        
        modal.style.display = 'block';
    }

    hideDuplicateModal() {
        document.getElementById('duplicateModal').style.display = 'none';
    }

    completeRegistration(attendee) {
        const registration = {
            ...attendee,
            registrationTime: new Date().toISOString(),
            registrationType: attendee.type === 'official' ? 'Official' : 'Walk-in',
            badgePrinted: false, // Track if badge has been printed
            certificatePrinted: false // Track if certificate has been printed
        };

        this.registeredAttendees.push(registration);
        this.saveData();
        this.updateUI();
        
        // Clear form
        document.getElementById('officialNameInput').value = '';
        this.selectedAttendee = null;
        this.hideAutocomplete();
        
        this.showNotification(`${registration.name} registered successfully!`, 'success');
        
        // Auto-print badge if enabled
        const autoPrintBadges = localStorage.getItem('accord_auto_print_badges') === 'true';
        if (autoPrintBadges) {
            this.printSingleBadge(registration);
            // Mark badge as printed
            registration.badgePrinted = true;
            this.saveData();
        }
    }

    // Print a single badge for an individual attendee
    printSingleBadge(attendee) {
        // Get badge template and placement
        const badgeTemplateDataUrl = localStorage.getItem('accord_badge_template');
        const badgePlacement = JSON.parse(localStorage.getItem('accord_badge_placement') || '{}');
        const prePrintedBadges = localStorage.getItem('accord_pre_printed_badges') === 'true';
        
        // Fallbacks
        const x = badgePlacement.x ?? 0.3;
        const y = badgePlacement.y ?? 0.4;
        const w = badgePlacement.w ?? 0.4;
        const h = badgePlacement.h ?? 0.12;
        
        // Badge size: 18cm x 13cm landscape = 680 x 491 px at 96dpi
        const badgeW = 680, badgeH = 491;
        const nameBox = {
            left: Math.round(x * badgeW),
            top: Math.round(y * badgeH),
            width: Math.round(w * badgeW),
            height: Math.round(h * badgeH)
        };
        const fontSize = Math.round(nameBox.height * 0.7);
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${attendee.name} - Badge</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        .badge { page-break-inside: avoid; }
                    }
                    body {
                        margin: 0;
                        background: #fff;
                    }
                    .badge { 
                        width: ${badgeW}px;
                        height: ${badgeH}px;
                        position: relative;
                        background: #fff;
                        overflow: hidden;
                        page-break-inside: avoid;
                        margin: 10px; 
                        display: inline-block;
                    }
                    .badge-bg {
                        position: absolute;
                        left: 0; top: 0; width: 100%; height: 100%;
                        z-index: 1;
                        object-fit: cover;
                    }
                    .badge-name {
                        position: absolute;
                        left: ${nameBox.left}px;
                        top: ${nameBox.top}px;
                        width: ${nameBox.width}px;
                        height: ${nameBox.height}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${fontSize}px;
                        font-family: 'Inter', Arial, sans-serif;
                        font-weight: bold;
                        color: #222;
                        text-align: center;
                        z-index: 2;
                        background: none;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                </style>
            </head>
            <body>
                <div class="badge">
                    ${!prePrintedBadges && badgeTemplateDataUrl ? `<img class='badge-bg' src='${badgeTemplateDataUrl}' alt='Badge Template'>` : ''}
                    <div class="badge-name">${attendee.name}</div>
                </div>
            </body>
            </html>
        `;
        
        const printWindow = window.open('', '_blank');
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }

    // Reports and Printing
    downloadReport() {
        if (this.registeredAttendees.length === 0) {
            this.showNotification('No registrations to download.', 'error');
            return;
        }

        const csvContent = this.generateCSV();
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `accord_events_report_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        this.showNotification('Report downloaded successfully!', 'success');
    }

    generateCSV() {
        const headers = ['Name', 'Phone Number', 'Registration Type', 'Registration Time'];
        
        // Group by name to check for duplicates
        const nameGroups = {};
        this.registeredAttendees.forEach(attendee => {
            const name = attendee.name.toLowerCase();
            if (!nameGroups[name]) {
                nameGroups[name] = [];
            }
            nameGroups[name].push(attendee);
        });
        
        const rows = this.registeredAttendees.map(attendee => {
            const name = attendee.name.toLowerCase();
            const duplicates = nameGroups[name];
            
            // If there are multiple people with the same name, include phone in name for clarity
            let displayName = attendee.name;
            if (duplicates.length > 1) {
                displayName = `${attendee.name} (${attendee.phone})`;
            }
            
            return [
                displayName,
                attendee.phone,
                attendee.registrationType,
                new Date(attendee.registrationTime).toLocaleString()
            ];
        });
        
        return [headers, ...rows].map(row => 
            row.map(cell => `"${cell}"`).join(',')
        ).join('\n');
    }

    printBadges() {
        if (this.registeredAttendees.length === 0) {
            this.showNotification('No registrations to print.', 'error');
            return;
        }

        // Check if there are any unprinted badges (handle backward compatibility)
        const unprintedBadges = this.registeredAttendees.filter(attendee => attendee.badgePrinted !== true);
        
        if (unprintedBadges.length === 0) {
            this.showNotification('All badges have already been printed individually. No badges available for batch printing.', 'info');
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generateBadgeHTML());
        printWindow.document.close();
        printWindow.print();
    }

    printCertificates() {
        if (this.registeredAttendees.length === 0) {
            this.showNotification('No registrations to print.', 'error');
            return;
        }

        // Check if there are any unprinted certificates
        const unprintedCertificates = this.registeredAttendees.filter(attendee => attendee.certificatePrinted !== true);
        
        if (unprintedCertificates.length === 0) {
            this.showNotification('All certificates have already been printed individually. No certificates available for batch printing.', 'info');
            return;
        }

        // Show the certificate filter modal instead of printing directly
        this.showCertificateFilterModal();
    }

    generateBadgeHTML() {
        if (this.registeredAttendees.length === 0) {
            return '<p>No registrations to print.</p>';
        }
        
        // Check if there are any unprinted badges (handle backward compatibility)
        const unprintedBadges = this.registeredAttendees.filter(attendee => attendee.badgePrinted !== true);
        
        if (unprintedBadges.length === 0) {
            return '<p>All badges have already been printed individually. No badges available for batch printing.</p>';
        }
        
        // Get badge template and placement
        const badgeTemplateDataUrl = localStorage.getItem('accord_badge_template');
        const badgePlacement = JSON.parse(localStorage.getItem('accord_badge_placement') || '{}');
        const prePrintedBadges = localStorage.getItem('accord_pre_printed_badges') === 'true';
        // Fallbacks
        const x = badgePlacement.x ?? 0.3;
        const y = badgePlacement.y ?? 0.4;
        const w = badgePlacement.w ?? 0.4;
        const h = badgePlacement.h ?? 0.12;
        // Badge size: 18cm x 13cm landscape = 680 x 491 px at 96dpi
        const badgeW = 680, badgeH = 491;
        const nameBox = {
            left: Math.round(x * badgeW),
            top: Math.round(y * badgeH),
            width: Math.round(w * badgeW),
            height: Math.round(h * badgeH)
        };
        const fontSize = Math.round(nameBox.height * 0.7);
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Event Badges</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        .badge { page-break-inside: avoid; }
                    }
                    body {
                        margin: 0;
                        background: #fff;
                    }
                    .badge { 
                        width: ${badgeW}px;
                        height: ${badgeH}px;
                        position: relative;
                        background: #fff;
                        overflow: hidden;
                        page-break-inside: avoid;
                        margin: 10px; 
                        display: inline-block;
                    }
                    .badge-bg {
                        position: absolute;
                        left: 0; top: 0; width: 100%; height: 100%;
                        z-index: 1;
                        object-fit: cover;
                    }
                    .badge-name {
                        position: absolute;
                        left: ${nameBox.left}px;
                        top: ${nameBox.top}px;
                        width: ${nameBox.width}px;
                        height: ${nameBox.height}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${fontSize}px;
                        font-family: 'Inter', Arial, sans-serif;
                        font-weight: bold;
                        color: #222;
                        text-align: center;
                        z-index: 2;
                        background: none;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                </style>
            </head>
            <body>
        `;
        
        this.registeredAttendees.forEach(attendee => {
            // Only print if badge has not been printed yet (handle backward compatibility)
            if (attendee.badgePrinted !== true) {
                html += `
                        <div class="badge">
                    ${!prePrintedBadges && badgeTemplateDataUrl ? `<img class='badge-bg' src='${badgeTemplateDataUrl}' alt='Badge Template'>` : ''}
                    <div class="badge-name">${attendee.name}</div>
                        </div>
                    `;
            }
        });
        
        html += '</body></html>';
        return html;
    }



    // Reset Functionality
    showResetModal() {
        document.getElementById('resetModal').style.display = 'block';
    }

    hideResetModal() {
        document.getElementById('resetModal').style.display = 'none';
    }

    confirmReset() {
        this.attendees = [];
        this.registeredAttendees = [];
        this.saveData();
        this.updateUI();
        this.hideResetModal();
        this.hideCertificateSearchModal();
        
        // Clear event settings
        localStorage.removeItem('accord_event_name');
        localStorage.removeItem('accord_cert_template');
        localStorage.removeItem('accord_cert_placement');
        localStorage.removeItem('accord_badge_template');
        localStorage.removeItem('accord_badge_placement');
        localStorage.removeItem('accord_auto_print_badges');
        localStorage.removeItem('accord_pre_printed_certificates');
        localStorage.removeItem('accord_pre_printed_badges');
        localStorage.removeItem('accord_dark_mode');
        localStorage.removeItem('accord_last_save');
        
        // Clear backup storage
        sessionStorage.removeItem('accord_backup_attendees');
        sessionStorage.removeItem('accord_backup_registered');
        
        // Reset event settings UI
        document.getElementById('eventNameInput').value = 'Accord Events';
        document.getElementById('certificateTemplateInput').value = '';
        document.getElementById('certificateTemplatePreviewGroup').style.display = 'none';
        document.getElementById('certificateTemplatePreview').src = '';
        document.getElementById('namePlacementBox').style.display = 'none';
        document.getElementById('badgeTemplateInput').value = '';
        document.getElementById('badgeTemplatePreviewGroup').style.display = 'none';
        document.getElementById('badgeTemplatePreview').src = '';
        document.getElementById('badgeNamePlacementBox').style.display = 'none';
        
        // Reset auto-print checkbox
        const autoPrintCheckbox = document.getElementById('autoPrintBadgesCheckbox');
        if (autoPrintCheckbox) {
            autoPrintCheckbox.checked = false;
        }
        
        // Reset pre-printed certificate checkbox
        const prePrintedCertificatesCheckbox = document.getElementById('prePrintedCertificatesCheckbox');
        if (prePrintedCertificatesCheckbox) {
            prePrintedCertificatesCheckbox.checked = false;
        }
        
        // Reset pre-printed badge checkbox
        const prePrintedBadgesCheckbox = document.getElementById('prePrintedBadgesCheckbox');
        if (prePrintedBadgesCheckbox) {
            prePrintedBadgesCheckbox.checked = false;
        }
        
        // Hide sections
        document.getElementById('registrationSection').style.display = 'none';
        document.getElementById('reportsSection').style.display = 'none';
        document.getElementById('uploadStatus').style.display = 'none';
        
        this.showNotification('System has been reset successfully!', 'success');
    }

    // Registration Timeline Chart
    updateRegistrationTimeline() {
        const timelineContainer = document.getElementById('registrationTimeline');
        if (!timelineContainer) return;

        // Group registrations by hour
        const hourlyData = {};
        for (let i = 0; i < 24; i++) {
            hourlyData[i] = 0;
        }

        this.registeredAttendees.forEach(attendee => {
            const registrationTime = new Date(attendee.registrationTime);
            const hour = registrationTime.getHours();
            hourlyData[hour]++;
        });

        // Find the maximum count for scaling
        const maxCount = Math.max(...Object.values(hourlyData));
        const maxHeight = 200; // Maximum height in pixels

        // Generate the chart HTML
        let chartHTML = '<div class="timeline-chart">';
        chartHTML += '<div class="timeline-header">';
        chartHTML += '<h3>📊 Registration Timeline</h3>';
        chartHTML += '<p>Hourly registration activity</p>';
        chartHTML += '</div>';
        chartHTML += '<div class="timeline-bars">';

        for (let hour = 0; hour < 24; hour++) {
            const count = hourlyData[hour];
            const height = maxCount > 0 ? (count / maxCount) * maxHeight : 0;
            const hourLabel = hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
            
            chartHTML += `
                <div class="timeline-bar" title="${hourLabel}: ${count} registrations">
                    <div class="bar-fill" style="height: ${height}px; background: ${count > 0 ? '#667eea' : '#e5e7eb'}"></div>
                    <div class="bar-label">${hourLabel}</div>
                    <div class="bar-count">${count}</div>
                </div>
            `;
        }

        chartHTML += '</div>';
        chartHTML += '<div class="timeline-stats">';
        
        // Calculate peak hours
        const peakHours = Object.entries(hourlyData)
            .filter(([hour, count]) => count > 0)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        if (peakHours.length > 0) {
            chartHTML += '<div class="peak-hours">';
            chartHTML += '<h4>🏆 Peak Hours:</h4>';
            peakHours.forEach(([hour, count]) => {
                const hourLabel = hour === '0' ? '12 AM' : hour === '12' ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`;
                chartHTML += `<span class="peak-hour">${hourLabel} (${count})</span>`;
            });
            chartHTML += '</div>';
        }

        chartHTML += '</div>';
        chartHTML += '</div>';

        timelineContainer.innerHTML = chartHTML;
    }

    // UI Updates
    updateUI() {
        const totalAttendees = this.registeredAttendees.length;
        const officialAttendees = this.registeredAttendees.filter(a => a.registrationType === 'Official').length;
        const walkInAttendees = this.registeredAttendees.filter(a => a.registrationType === 'Walk-in').length;
        
        // Calculate badge printing statistics
        const printedBadges = this.registeredAttendees.filter(a => a.badgePrinted === true).length;
        const unprintedBadges = this.registeredAttendees.filter(a => a.badgePrinted !== true).length;

        document.getElementById('totalAttendees').textContent = totalAttendees;
        document.getElementById('officialAttendees').textContent = officialAttendees;
        document.getElementById('walkInAttendees').textContent = walkInAttendees;

        // Update the registration timeline chart
        this.updateRegistrationTimeline();
        
        // Show badge printing status if auto-print is enabled
        const autoPrintEnabled = localStorage.getItem('accord_auto_print_badges') === 'true';
        if (autoPrintEnabled && totalAttendees > 0) {
            console.log(`Badge Status: ${printedBadges} printed, ${unprintedBadges} remaining`);
        }
    }

    // Notifications
    showNotification(message, type = 'success') {
        const notification = document.getElementById('successNotification');
        const notificationText = document.getElementById('notificationText');
        
        notificationText.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }

    setPlacementBox(x, y, w, h) {
        // x, y, w, h are relative (0-1)
        const container = document.getElementById('certificateTemplatePreviewContainer');
        const box = document.getElementById('namePlacementBox');
        const cw = container.offsetWidth;
        const ch = container.offsetHeight;
        box.style.left = (x * cw) + 'px';
        box.style.top = (y * ch) + 'px';
        box.style.width = (w * cw) + 'px';
        box.style.height = (h * ch) + 'px';
        box.style.display = 'block';
    }
    getPlacementBox() {
        const container = document.getElementById('certificateTemplatePreviewContainer');
        const box = document.getElementById('namePlacementBox');
        const cw = container.offsetWidth;
        const ch = container.offsetHeight;
        return {
            x: box.offsetLeft / cw,
            y: box.offsetTop / ch,
            w: box.offsetWidth / cw,
            h: box.offsetHeight / ch
        };
    }

    setBadgePlacementBox(x, y, w, h) {
        // x, y, w, h are relative (0-1)
        const container = document.getElementById('badgeTemplatePreviewContainer');
        const box = document.getElementById('badgeNamePlacementBox');
        const cw = container.offsetWidth;
        const ch = container.offsetHeight;
        box.style.left = (x * cw) + 'px';
        box.style.top = (y * ch) + 'px';
        box.style.width = (w * cw) + 'px';
        box.style.height = (h * ch) + 'px';
        box.style.display = 'block';
    }
    getBadgePlacementBox() {
        const container = document.getElementById('badgeTemplatePreviewContainer');
        const box = document.getElementById('badgeNamePlacementBox');
        const cw = container.offsetWidth;
        const ch = container.offsetHeight;
        return {
            x: box.offsetLeft / cw,
            y: box.offsetTop / ch,
            w: box.offsetWidth / cw,
            h: box.offsetHeight / ch
        };
    }

    // Check file size for localStorage compatibility
    checkFileSize(file, maxSizeMB = 4) {
        const maxSizeBytes = maxSizeMB * 1024 * 1024;
        if (file.size > maxSizeBytes) {
            this.showNotification(`File too large. Please use an image smaller than ${maxSizeMB}MB for better compatibility.`, 'error');
            return false;
        }
        return true;
    }

    // Estimate localStorage usage
    estimateStorageUsage() {
        let totalSize = 0;
        
        // Event name
        const eventName = document.getElementById('eventNameInput').value;
        totalSize += eventName.length;
        
        // Certificate template
        const certImg = document.getElementById('certificateTemplatePreview');
        if (certImg && certImg.src && certImg.src !== window.location.href) {
            totalSize += certImg.src.length;
        }
        
        // Badge template
        const badgeImg = document.getElementById('badgeTemplatePreview');
        if (badgeImg && badgeImg.src && badgeImg.src !== window.location.href) {
            totalSize += badgeImg.src.length;
        }
        
        // Placement data (small)
        totalSize += 200; // Approximate size for placement JSON
        
        return totalSize;
    }

    // Manual badge printing tracking (for testing/debugging)
    markBadgeAsPrinted(attendeeName) {
        const attendee = this.registeredAttendees.find(a => 
            a.name.toLowerCase() === attendeeName.toLowerCase()
        );
        
        if (attendee) {
            attendee.badgePrinted = true;
            this.saveData();
            this.updateUI();
            this.showNotification(`${attendee.name}'s badge marked as printed.`, 'success');
        } else {
            this.showNotification('Attendee not found.', 'error');
        }
    }

    // Manual badge printing tracking (for testing/debugging)
    markAllBadgesAsPrinted() {
        this.registeredAttendees.forEach(attendee => {
            attendee.badgePrinted = true;
        });
        this.saveData();
        this.updateUI();
        this.showNotification('All badges marked as printed.', 'success');
    }

    // Certificate Search Modal Functions
    showCertificateSearchModal() {
        document.getElementById('certificateSearchModal').style.display = 'block';
        document.getElementById('certificateSearchInput').value = '';
        document.getElementById('certificateSearchResults').innerHTML = '';
        document.getElementById('printIndividualCertificateBtn').disabled = true;
        document.getElementById('certificateSearchInput').focus();
    }

    hideCertificateSearchModal() {
        document.getElementById('certificateSearchModal').style.display = 'none';
    }

    handleCertificateSearchInput(event) {
        const query = event.target.value.trim().toLowerCase();
        const resultsContainer = document.getElementById('certificateSearchResults');
        
        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        // Search through registered attendees using fuzzy search
        const results = this.registeredAttendees.filter(attendee => {
            const name = attendee.name.toLowerCase();
            const similarity = this.calculateSimilarity(query, name);
            return similarity >= 0.3; // Show results with 30% or higher similarity
        }).sort((a, b) => {
            const aSimilarity = this.calculateSimilarity(query, a.name.toLowerCase());
            const bSimilarity = this.calculateSimilarity(query, b.name.toLowerCase());
            return bSimilarity - aSimilarity; // Sort by similarity (highest first)
        });

        this.showCertificateSearchResults(results);
    }

    showCertificateSearchResults(results) {
        const resultsContainer = document.getElementById('certificateSearchResults');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="certificate-search-item" style="padding: 16px; text-align: center; color: #666;">No registered attendees found.</div>';
            return;
        }

        let html = '';
        results.forEach((attendee, index) => {
            const isPrinted = attendee.certificatePrinted === true;
            const printStatus = isPrinted ? 'printed' : 'not-printed';
            const statusText = isPrinted ? 'Already Printed' : 'Not Printed';
            
            html += `
                <div class="certificate-search-item" data-index="${index}">
                    <div class="attendee-info">
                        <div class="attendee-name">${attendee.name}</div>
                        <div class="attendee-details">
                            ${attendee.phone ? `Phone: ${attendee.phone}` : 'Walk-in'} • 
                            ${attendee.registrationType} • 
                            Registered: ${new Date(attendee.registrationTime).toLocaleDateString()}
                        </div>
                    </div>
                    <span class="print-status ${printStatus}">${statusText}</span>
                </div>
            `;
        });

        resultsContainer.innerHTML = html;

        // Add click handlers
        resultsContainer.querySelectorAll('.certificate-search-item').forEach((item, index) => {
            item.addEventListener('click', () => this.selectCertificateAttendee(results[index]));
        });
    }

    selectCertificateAttendee(attendee) {
        // Remove previous selection
        document.querySelectorAll('.certificate-search-item').forEach(item => {
            item.classList.remove('selected');
        });

        // Add selection to clicked item
        event.target.closest('.certificate-search-item').classList.add('selected');

        // Enable print button
        const printBtn = document.getElementById('printIndividualCertificateBtn');
        printBtn.disabled = false;
        printBtn.onclick = () => this.printIndividualCertificate(attendee);
    }

    printIndividualCertificate(attendee) {
        if (!attendee) {
            // Get selected attendee from the selected item
            const selectedItem = document.querySelector('.certificate-search-item.selected');
            if (!selectedItem) {
                this.showNotification('Please select an attendee first.', 'error');
                return;
            }
            const index = parseInt(selectedItem.dataset.index);
            const results = this.getCertificateSearchResults();
            attendee = results[index];
        }

        if (!attendee) {
            this.showNotification('Attendee not found.', 'error');
            return;
        }

        // Check if already printed
        if (attendee.certificatePrinted === true) {
            this.showNotification(`${attendee.name}'s certificate has already been printed.`, 'warning');
            return;
        }

        // Print the certificate
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generateIndividualCertificateHTML(attendee));
        printWindow.document.close();
        printWindow.print();

        // Mark as printed
        attendee.certificatePrinted = true;
        this.saveData();
        this.updateUI();

        this.showNotification(`${attendee.name}'s certificate printed successfully!`, 'success');
        this.hideCertificateSearchModal();
    }

    getCertificateSearchResults() {
        const query = document.getElementById('certificateSearchInput').value.trim().toLowerCase();
        if (query.length < 2) return [];

        return this.registeredAttendees.filter(attendee => {
            const name = attendee.name.toLowerCase();
            const similarity = this.calculateSimilarity(query, name);
            return similarity >= 0.3;
        }).sort((a, b) => {
            const aSimilarity = this.calculateSimilarity(query, a.name.toLowerCase());
            const bSimilarity = this.calculateSimilarity(query, b.name.toLowerCase());
            return bSimilarity - aSimilarity;
        });
    }

    generateIndividualCertificateHTML(attendee) {
        // Get template and placement
        const certTemplateDataUrl = localStorage.getItem('accord_cert_template');
        const certPlacement = JSON.parse(localStorage.getItem('accord_cert_placement') || '{}');
        const prePrintedCertificates = localStorage.getItem('accord_pre_printed_certificates') === 'true';
        
        // Fallbacks
        const x = certPlacement.x ?? 0.3;
        const y = certPlacement.y ?? 0.4;
        const w = certPlacement.w ?? 0.4;
        const h = certPlacement.h ?? 0.12;
        
        // A4 landscape: 1122 x 793 px at 96dpi
        const pageW = 1122, pageH = 793;
        const nameBox = {
            left: Math.round(x * pageW),
            top: Math.round(y * pageH),
            width: Math.round(w * pageW),
            height: Math.round(h * pageH)
        };
        const fontSize = Math.round(nameBox.height * 0.7);
        
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${attendee.name} - Certificate</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        .certificate { page-break-after: always; }
                    }
                    body {
                        margin: 0;
                        background: #fff;
                    }
                    .certificate { 
                        width: ${pageW}px;
                        height: ${pageH}px;
                        position: relative;
                        background: #fff;
                        overflow: hidden;
                        page-break-after: always;
                    }
                    .cert-bg {
                        position: absolute;
                        left: 0; top: 0; width: 100%; height: 100%;
                        z-index: 1;
                        object-fit: cover;
                    }
                    .cert-name {
                        position: absolute;
                        left: ${nameBox.left}px;
                        top: ${nameBox.top}px;
                        width: ${nameBox.width}px;
                        height: ${nameBox.height}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${fontSize}px;
                        font-family: 'Inter', Arial, sans-serif;
                        font-weight: bold;
                        color: #222;
                        text-align: center;
                        z-index: 2;
                        background: none;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                </style>
            </head>
            <body>
                <div class="certificate">
                    ${!prePrintedCertificates && certTemplateDataUrl ? `<img class='cert-bg' src='${certTemplateDataUrl}' alt='Certificate Template'>` : ''}
                    <div class="cert-name">${attendee.name}</div>
                </div>
            </body>
            </html>
        `;
    }

    // Certificate Filter Modal Functions
    showCertificateFilterModal() {
        document.getElementById('certificateFilterModal').style.display = 'block';
        this.updateCertificateFilterSummary();
        
        // Add event listeners for radio buttons
        document.querySelectorAll('input[name="certificateFilter"]').forEach(radio => {
            radio.addEventListener('change', () => this.updateCertificateFilterSummary());
        });
        
        // Add event listeners for modal buttons
        document.getElementById('confirmCertificatePrintBtn').onclick = () => this.confirmCertificatePrint();
        document.getElementById('cancelCertificateFilterBtn').onclick = () => this.hideCertificateFilterModal();
        document.getElementById('closeCertificateFilterModal').onclick = () => this.hideCertificateFilterModal();
    }

    hideCertificateFilterModal() {
        document.getElementById('certificateFilterModal').style.display = 'none';
    }

    updateCertificateFilterSummary() {
        const selectedFilter = document.querySelector('input[name="certificateFilter"]:checked').value;
        const summaryContainer = document.getElementById('certificateFilterSummary');
        
        // Get unprinted certificates based on filter
        const unprintedCertificates = this.registeredAttendees.filter(attendee => {
            if (attendee.certificatePrinted === true) return false; // Skip already printed
            
            if (selectedFilter === 'official') {
                return attendee.registrationType === 'Official';
            } else if (selectedFilter === 'walkin') {
                return attendee.registrationType === 'Walk-in';
            } else {
                return true; // 'all' - include both
            }
        });

        const officialCount = unprintedCertificates.filter(a => a.registrationType === 'Official').length;
        const walkinCount = unprintedCertificates.filter(a => a.registrationType === 'Walk-in').length;
        const totalCount = unprintedCertificates.length;

        let filterText = '';
        if (selectedFilter === 'official') {
            filterText = 'Official attendees only';
        } else if (selectedFilter === 'walkin') {
            filterText = 'Walk-in attendees only';
        } else {
            filterText = 'All attendees (Official + Walk-in)';
        }

        summaryContainer.innerHTML = `
            <h4>${filterText}</h4>
            <div class="summary-stats">
                <div class="stat-item">
                    <span>Total to print:</span>
                    <span class="stat-number">${totalCount}</span>
                </div>
                ${selectedFilter === 'all' ? `
                    <div class="stat-item">
                        <span>Official:</span>
                        <span class="stat-number">${officialCount}</span>
                    </div>
                    <div class="stat-item">
                        <span>Walk-in:</span>
                        <span class="stat-number">${walkinCount}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    confirmCertificatePrint() {
        const selectedFilter = document.querySelector('input[name="certificateFilter"]:checked').value;
        
        // Get unprinted certificates based on filter
        const unprintedCertificates = this.registeredAttendees.filter(attendee => {
            if (attendee.certificatePrinted === true) return false; // Skip already printed
            
            if (selectedFilter === 'official') {
                return attendee.registrationType === 'Official';
            } else if (selectedFilter === 'walkin') {
                return attendee.registrationType === 'Walk-in';
            } else {
                return true; // 'all' - include both
            }
        });

        if (unprintedCertificates.length === 0) {
            this.showNotification('No certificates available for printing with the selected filter.', 'warning');
            this.hideCertificateFilterModal();
            return;
        }

        // Generate and print certificates
        const printWindow = window.open('', '_blank');
        printWindow.document.write(this.generateCertificateHTML(unprintedCertificates));
        printWindow.document.close();
        printWindow.print();

        this.hideCertificateFilterModal();
        this.showNotification(`Printed ${unprintedCertificates.length} certificates successfully!`, 'success');
    }

    generateCertificateHTML(attendeesToPrint = null) {
        // If no specific attendees provided, use all unprinted certificates
        if (!attendeesToPrint) {
            attendeesToPrint = this.registeredAttendees.filter(attendee => attendee.certificatePrinted !== true);
        }
        
        if (attendeesToPrint.length === 0) {
            return '<p>No certificates to print.</p>';
        }
        
        // Get certificate template and placement
        const certTemplateDataUrl = localStorage.getItem('accord_cert_template');
        const certPlacement = JSON.parse(localStorage.getItem('accord_cert_placement') || '{}');
        const prePrintedCertificates = localStorage.getItem('accord_pre_printed_certificates') === 'true';
        
        // Fallbacks
        const x = certPlacement.x ?? 0.3;
        const y = certPlacement.y ?? 0.4;
        const w = certPlacement.w ?? 0.4;
        const h = certPlacement.h ?? 0.12;
        
        // A4 landscape: 1122 x 793 px at 96dpi
        const pageW = 1122, pageH = 793;
        const nameBox = {
            left: Math.round(x * pageW),
            top: Math.round(y * pageH),
            width: Math.round(w * pageW),
            height: Math.round(h * pageH)
        };
        const fontSize = Math.round(nameBox.height * 0.7);
        
        let html = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Event Certificates</title>
                <style>
                    @media print {
                        body { margin: 0; }
                        .certificate { page-break-after: always; }
                    }
                    body {
                        margin: 0;
                        background: #fff;
                    }
                    .certificate { 
                        width: ${pageW}px;
                        height: ${pageH}px;
                        position: relative;
                        background: #fff;
                        overflow: hidden;
                        page-break-after: always;
                    }
                    .cert-bg {
                        position: absolute;
                        left: 0; top: 0; width: 100%; height: 100%;
                        z-index: 1;
                        object-fit: cover;
                    }
                    .cert-name {
                        position: absolute;
                        left: ${nameBox.left}px;
                        top: ${nameBox.top}px;
                        width: ${nameBox.width}px;
                        height: ${nameBox.height}px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: ${fontSize}px;
                        font-family: 'Inter', Arial, sans-serif;
                        font-weight: bold;
                        color: #222;
                        text-align: center;
                        z-index: 2;
                        background: none;
                        white-space: pre-wrap;
                        word-break: break-word;
                    }
                </style>
            </head>
            <body>
        `;
        
        attendeesToPrint.forEach(attendee => {
            html += `
                <div class="certificate">
                    ${!prePrintedCertificates && certTemplateDataUrl ? `<img class='cert-bg' src='${certTemplateDataUrl}' alt='Certificate Template'>` : ''}
                    <div class="cert-name">${attendee.name}</div>
                </div>
            `;
        });
        
        html += `
            </body>
            </html>
        `;
        
        return html;
    }

    // Dark Mode Methods
    toggleDarkMode() {
        const body = document.body;
        const isDarkMode = body.classList.contains('dark-mode');
        
        if (isDarkMode) {
            body.classList.remove('dark-mode');
            localStorage.setItem('accord_dark_mode', 'false');
            this.updateDarkModeToggle(false);
        } else {
            body.classList.add('dark-mode');
            localStorage.setItem('accord_dark_mode', 'true');
            this.updateDarkModeToggle(true);
        }
    }

    loadDarkModePreference() {
        const darkModePreference = localStorage.getItem('accord_dark_mode');
        const body = document.body;
        
        if (darkModePreference === 'true') {
            body.classList.add('dark-mode');
            this.updateDarkModeToggle(true);
        } else {
            body.classList.remove('dark-mode');
            this.updateDarkModeToggle(false);
        }
    }

    updateDarkModeToggle(isDarkMode) {
        const toggle = document.getElementById('darkModeToggle');
        const icon = toggle.querySelector('i');
        const text = toggle.querySelector('.toggle-text');
        
        if (isDarkMode) {
            icon.className = 'fas fa-sun';
            text.textContent = 'Light Mode';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Dark Mode';
        }
    }

    // Auto-save and Data Protection Methods
    setupAutoSave() {
        // Auto-save every 30 seconds (localStorage only)
        setInterval(() => {
            this.saveData();
        }, 30000);
        
        // Save before page unload
        window.addEventListener('beforeunload', () => {
            this.saveData();
        });
        
        // Save on visibility change (tab switch, minimize)
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'hidden') {
                this.saveData();
            }
        });
    }

    exportData() {
        try {
            const data = {
                attendees: this.attendees,
                registeredAttendees: this.registeredAttendees,
                eventSettings: {
                    eventName: localStorage.getItem('accord_event_name'),
                    certTemplate: localStorage.getItem('accord_cert_template'),
                    certPlacement: localStorage.getItem('accord_cert_placement'),
                    badgeTemplate: localStorage.getItem('accord_badge_template'),
                    badgePlacement: localStorage.getItem('accord_badge_placement'),
                    autoPrintBadges: localStorage.getItem('accord_auto_print_badges'),
                    prePrintedCertificates: localStorage.getItem('accord_pre_printed_certificates'),
                    prePrintedBadges: localStorage.getItem('accord_pre_printed_badges'),
                    darkMode: localStorage.getItem('accord_dark_mode')
                },
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `accord-events-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Data exported successfully!', 'success');
        } catch (e) {
            console.error('Error exporting data:', e);
            this.showNotification('Error exporting data. Please try again.', 'error');
        }
    }

    importData(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Validate data structure
                if (!data.attendees || !data.registeredAttendees) {
                    throw new Error('Invalid backup file format');
                }
                
                // Restore data
                this.attendees = data.attendees;
                this.registeredAttendees = data.registeredAttendees;
                
                // Restore event settings if available
                if (data.eventSettings) {
                    Object.keys(data.eventSettings).forEach(key => {
                        if (data.eventSettings[key] !== null) {
                            localStorage.setItem(`accord_${key}`, data.eventSettings[key]);
                        }
                    });
                }
                
                // Save to storage
                this.saveData();
                this.loadEventSettings();
                this.updateUI();
                
                this.showNotification('Data imported successfully!', 'success');
            } catch (e) {
                console.error('Error importing data:', e);
                this.showNotification('Error importing data. Invalid backup file.', 'error');
            }
        };
        reader.readAsText(file);
    }

    showImportModal() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            if (e.target.files.length > 0) {
                this.importData(e.target.files[0]);
            }
        };
        input.click();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new AccordEventsApp();
}); 