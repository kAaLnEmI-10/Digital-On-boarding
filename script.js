// Application State with localStorage persistence
const AppState = {
    get userData() {
        return JSON.parse(localStorage.getItem('creditApp_userData') || '{}');
    },
    
    set userData(data) {
        localStorage.setItem('creditApp_userData', JSON.stringify(data));
    },
    
    get captcha() {
        return localStorage.getItem('creditApp_captcha') || '';
    },
    
    set captcha(value) {
        localStorage.setItem('creditApp_captcha', value);
    },
    
    clearData() {
        localStorage.removeItem('creditApp_userData');
        localStorage.removeItem('creditApp_captcha');
    }
};

// Theme Management
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = document.getElementById('themeIcon');
        
        // Load saved theme or default to dark
        const savedTheme = localStorage.getItem('theme') || 'dark';
        this.setTheme(savedTheme);
        
        themeToggle?.addEventListener('click', () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            this.setTheme(newTheme);
        });
    }

    setTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) {
            themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }
    }
}

// Captcha Generator
class CaptchaGenerator {
    constructor() {
        this.generateCaptcha();
        this.initRefreshButton();
    }

    generateCaptcha() {
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let captcha = '';
        for (let i = 0; i < 6; i++) {
            captcha += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        AppState.captcha = captcha;
        
        const captchaDisplay = document.getElementById('captchaDisplay');
        if (captchaDisplay) {
            captchaDisplay.textContent = captcha;
        }
    }

    initRefreshButton() {
        const refreshButton = document.getElementById('refreshCaptcha');
        refreshButton?.addEventListener('click', () => {
            this.generateCaptcha();
        });
    }

    validate(input) {
        return input.toLowerCase() === AppState.captcha.toLowerCase();
    }
}

// Form Validation
class FormValidator {
    static validateMobile(mobile) {
        const regex = /^[6-9]\d{9}$/;
        return regex.test(mobile);
    }

    static validatePAN(pan) {
        const regex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
        return regex.test(pan.toUpperCase());
    }

    static validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    static validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-Z\s]+$/.test(name);
    }

    static validateDate(date) {
        const selectedDate = new Date(date);
        const today = new Date();
        const age = today.getFullYear() - selectedDate.getFullYear();
        return age >= 18 && age <= 100;
    }
}

// Navigation Manager
class NavigationManager {
    static goToNextStep(currentStep) {
        const nextPages = {
            'index': 'step1.html',
            'step1': 'step2.html',
            'step2': 'step3.html',
            'step3': 'step4.html',
            'step4': 'card-selection.html',
            'card-selection': 'application-status.html'
        };
        
        const currentPage = this.getCurrentPage();
        const nextPage = nextPages[currentPage];
        
        if (nextPage) {
            window.location.href = nextPage;
        }
    }
    
    static getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '') || 'index';
        return filename;
    }
    
    static updateNavigation() {
        // Update active navigation link
        const currentPage = this.getCurrentPage();
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === (currentPage === 'index' ? 'index.html' : `${currentPage}.html`)) {
                link.classList.add('active');
            }
        });
    }
}

// Data Manager
class DataManager {
    static loadFormData(formId) {
        const userData = AppState.userData;
        
        switch (formId) {
            case 'step1Form':
                document.getElementById('fullName').value = userData.fullName || '';
                document.getElementById('dateOfBirth').value = userData.dateOfBirth || '';
                document.getElementById('panNumber').value = userData.pan || '';
                break;
                
            case 'step2Form':
                const creditLimit = document.getElementById('creditLimit');
                const rangeValue = document.getElementById('rangeValue');
                const value = userData.creditLimit || 50000;
                creditLimit.value = value;
                rangeValue.textContent = `₹${value.toLocaleString()}`;
                
                document.getElementById('fatherName').value = userData.fatherName || '';
                document.getElementById('email').value = userData.email || '';
                
                if (userData.emailVerified) {
                    const validateBtn = document.getElementById('validateEmail');
                    validateBtn.textContent = 'Verified';
                    validateBtn.disabled = true;
                    
                    const emailLabel = document.querySelector('label[for="email"]');
                    emailLabel.innerHTML += '<span class="verification-badge"><i class="fas fa-check me-1"></i>Verified</span>';
                }
                
                document.getElementById('addonRequired').checked = userData.addonRequired || false;
                break;
                
            case 'step4Form':
                this.loadSummaryData();
                break;
        }
    }
    
    static loadSummaryData() {
        const userData = AppState.userData;
        const cardNames = {
            'platinum': 'Platinum Rewards',
            'gold': 'Gold Cashback',
            'titanium': 'Titanium Elite',
            'signature': 'Signature Exclusive'
        };
        
        document.getElementById('selectedCardName').textContent = cardNames[userData.selectedCard] || 'Selected Credit Card';
        document.getElementById('summaryName').textContent = userData.fullName || '-';
        document.getElementById('summaryDOB').textContent = userData.dateOfBirth ? new Date(userData.dateOfBirth).toLocaleDateString() : '-';
        document.getElementById('summaryPAN').textContent = userData.pan || '-';
        document.getElementById('summaryEmail').textContent = userData.email || '-';
        document.getElementById('summaryCreditLimit').textContent = userData.creditLimit ? `₹${userData.creditLimit.toLocaleString()}` : '-';
        document.getElementById('summaryAddons').textContent = userData.addonRequired ? (userData.addons?.length || 0) : 'None';
    }
    
    static loadApplicationStatus() {
        const userData = AppState.userData;
        const cardNames = {
            'platinum': 'Platinum Rewards',
            'gold': 'Gold Cashback',
            'titanium': 'Titanium Elite',
            'signature': 'Signature Exclusive'
        };
        
        document.getElementById('statusName').textContent = userData.fullName || '-';
        document.getElementById('statusMobile').textContent = userData.mobile ? `+91 ${userData.mobile}` : '-';
        document.getElementById('statusEmail').textContent = userData.email || '-';
        document.getElementById('statusPAN').textContent = userData.pan || '-';
        document.getElementById('statusCardType').textContent = cardNames[userData.selectedCard] || '-';
        document.getElementById('statusCreditLimit').textContent = userData.creditLimit ? `₹${userData.creditLimit.toLocaleString()}` : '-';
        document.getElementById('statusDelivery').textContent = userData.cardType === 'physical' ? 'Physical Card' : 'Virtual Card';
        document.getElementById('statusAddons').textContent = userData.addonRequired ? (userData.addons?.length || 0) : 'None';
        
        // Generate reference number
        const reference = `CP${Date.now().toString().slice(-8)}`;
        document.getElementById('applicationReference').textContent = reference;
    }
}

// Page-specific initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize common components
    window.themeManager = new ThemeManager();
    NavigationManager.updateNavigation();
    
    // Initialize hamburger menu animation
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
        });
    }
    
    const currentPage = NavigationManager.getCurrentPage();
    
    // Page-specific initialization
    switch (currentPage) {
        case 'index':
            initLandingPage();
            break;
        case 'step1':
            initStep1();
            break;
        case 'step2':
            initStep2();
            break;
        case 'step3':
            initStep3();
            break;
        case 'step4':
            initStep4();
            break;
        case 'card-selection':
            initCardSelection();
            break;
        case 'application-status':
            initApplicationStatus();
            break;
    }
});

// Landing Page
function initLandingPage() {
    window.captchaGenerator = new CaptchaGenerator();
    
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const mobile = document.getElementById('mobileNumber').value.trim();
        const captchaInput = document.getElementById('captchaInput').value.trim();
        
        if (!FormValidator.validateMobile(mobile)) {
            alert('Please enter a valid 10-digit mobile number');
            return;
        }
        
        if (!captchaGenerator.validate(captchaInput)) {
            alert('Invalid captcha. Please try again.');
            captchaGenerator.generateCaptcha();
            document.getElementById('captchaInput').value = '';
            return;
        }
        
        // Save mobile and proceed
        const userData = AppState.userData;
        userData.mobile = mobile;
        AppState.userData = userData;
        
        NavigationManager.goToNextStep();
    });
}

// Step 1
function initStep1() {
    DataManager.loadFormData('step1Form');
    
    const form = document.getElementById('step1Form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fullName = document.getElementById('fullName').value.trim();
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const panNumber = document.getElementById('panNumber').value.trim().toUpperCase();
        
        if (!FormValidator.validateName(fullName)) {
            alert('Please enter a valid full name');
            return;
        }
        
        if (!FormValidator.validateDate(dateOfBirth)) {
            alert('Please enter a valid date of birth (18+ years)');
            return;
        }
        
        if (!FormValidator.validatePAN(panNumber)) {
            alert('Please enter a valid PAN number');
            return;
        }
        
        // Save data
        const userData = AppState.userData;
        userData.fullName = fullName;
        userData.dateOfBirth = dateOfBirth;
        userData.pan = panNumber;
        AppState.userData = userData;
        
        NavigationManager.goToNextStep();
    });
}

// Step 2
function initStep2() {
    DataManager.loadFormData('step2Form');
    
    // Range slider
    const rangeInput = document.getElementById('creditLimit');
    const rangeValue = document.getElementById('rangeValue');
    
    rangeInput?.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        rangeValue.textContent = `₹${value.toLocaleString()}`;
        
        const percent = ((value - 25000) / (500000 - 25000)) * 100;
        rangeValue.style.left = `${percent}%`;
        
        const userData = AppState.userData;
        userData.creditLimit = value;
        AppState.userData = userData;
    });

    // Email validation
    const validateEmailBtn = document.getElementById('validateEmail');
    const otpSection = document.getElementById('otpSection');
    
    validateEmailBtn?.addEventListener('click', () => {
        const email = document.getElementById('email').value.trim();
        
        if (!FormValidator.validateEmail(email)) {
            alert('Please enter a valid email address');
            return;
        }
        
        const userData = AppState.userData;
        userData.email = email;
        AppState.userData = userData;
        
        otpSection.style.display = 'block';
        validateEmailBtn.textContent = 'OTP Sent';
        validateEmailBtn.disabled = true;
        
        setTimeout(() => {
            alert('OTP: 123456 (Demo)');
        }, 1000);
    });

    // OTP verification
    const verifyOtpBtn = document.getElementById('verifyOtp');
    verifyOtpBtn?.addEventListener('click', () => {
        const otp = document.getElementById('otpInput').value;
        
        if (otp === '123456') {
            const userData = AppState.userData;
            userData.emailVerified = true;
            AppState.userData = userData;
            
            otpSection.style.display = 'none';
            
            const emailInput = document.getElementById('email');
            emailInput.insertAdjacentHTML('afterend', 
                '<span class="verification-badge"><i class="fas fa-check me-1"></i>Verified</span>'
            );
            
            validateEmailBtn.textContent = 'Verified';
            alert('Email verified successfully!');
        } else {
            alert('Invalid OTP. Please try again.');
        }
    });

    // Addon checkbox
    const addonCheckbox = document.getElementById('addonRequired');
    addonCheckbox?.addEventListener('change', (e) => {
        const userData = AppState.userData;
        userData.addonRequired = e.target.checked;
        AppState.userData = userData;
        
        if (e.target.checked) {
            showAddonModal();
        }
    });

    // Form submission
    const form = document.getElementById('step2Form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const fatherName = document.getElementById('fatherName').value.trim();
        const userData = AppState.userData;
        
        if (!FormValidator.validateName(fatherName)) {
            alert('Please enter a valid father\'s name');
            return;
        }
        
        if (!userData.emailVerified) {
            alert('Please verify your email address');
            return;
        }
        
        userData.fatherName = fatherName;
        AppState.userData = userData;
        
        NavigationManager.goToNextStep();
    });
}

// Step 3
function initStep3() {
    const userData = AppState.userData;
    const cardItems = document.querySelectorAll('.credit-card-item');
    const nextButton = document.getElementById('nextToStep4');
    
    // Restore previous selection
    if (userData.selectedCard) {
        const selectedCard = document.querySelector(`[data-card-id="${userData.selectedCard}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            nextButton.disabled = false;
        }
    }
    
    cardItems.forEach(item => {
        item.addEventListener('click', () => {
            cardItems.forEach(card => card.classList.remove('selected'));
            item.classList.add('selected');
            
            const userDataCurrent = AppState.userData;
            userDataCurrent.selectedCard = item.dataset.cardId;
            AppState.userData = userDataCurrent;
            
            nextButton.disabled = false;
        });
    });

    nextButton?.addEventListener('click', () => {
        NavigationManager.goToNextStep();
    });
}

// Step 4
function initStep4() {
    DataManager.loadFormData('step4Form');
    
    const agreeTerms = document.getElementById('agreeTerms');
    const submitButton = document.getElementById('submitApplication');
    
    agreeTerms?.addEventListener('change', (e) => {
        submitButton.disabled = !e.target.checked;
    });

    submitButton?.addEventListener('click', () => {
        NavigationManager.goToNextStep();
    });
}

// Card Selection
function initCardSelection() {
    const selectionBoxes = document.querySelectorAll('.selection-box');
    
    selectionBoxes.forEach(box => {
        box.addEventListener('click', () => {
            const cardType = box.dataset.cardType;
            const userData = AppState.userData;
            userData.cardType = cardType;
            AppState.userData = userData;
            
            NavigationManager.goToNextStep();
        });
    });
}

// Application Status
function initApplicationStatus() {
    DataManager.loadApplicationStatus();
    
    // Clear application data after showing status
    setTimeout(() => {
        AppState.clearData();
    }, 5000);
}

// Addon Modal Functions
function showAddonModal() {
    const modalHTML = `
        <div class="modal fade" id="addonModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Add-on Card Details</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div id="addonContainer">
                            ${generateAddonForm(1)}
                        </div>
                        <div class="d-flex justify-content-between mt-3">
                            <button type="button" class="btn btn-success btn-round btn-add" id="addAddon">+</button>
                            <button type="button" class="btn btn-danger btn-round btn-remove" id="removeAddon" style="display: none;">-</button>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveAddons">Save Add-ons</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    const existingModal = document.getElementById('addonModal');
    if (existingModal) {
        existingModal.remove();
    }

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('addonModal'));
    modal.show();

    initAddonModal();
}

function generateAddonForm(index) {
    return `
        <div class="addon-form mb-4" data-addon-index="${index}">
            <h6>Add-on Card ${index}</h6>
            <div class="row">
                <div class="col-md-6 mb-3">
                    <label class="form-label">Full Name</label>
                    <input type="text" class="form-control addon-name" placeholder="Enter full name" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Mobile Number</label>
                    <input type="tel" class="form-control addon-mobile" placeholder="10-digit mobile" maxlength="10" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Date of Birth</label>
                    <input type="date" class="form-control addon-dob" required>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Relationship</label>
                    <select class="form-control addon-relationship" required>
                        <option value="">Select relationship</option>
                        <option value="spouse">Spouse</option>
                        <option value="child">Child</option>
                        <option value="parent">Parent</option>
                        <option value="sibling">Sibling</option>
                    </select>
                </div>
            </div>
        </div>
    `;
}

function initAddonModal() {
    let addonCount = 1;
    const maxAddons = 4;

    const addButton = document.getElementById('addAddon');
    const removeButton = document.getElementById('removeAddon');
    const saveButton = document.getElementById('saveAddons');
    const container = document.getElementById('addonContainer');

    addButton?.addEventListener('click', () => {
        if (addonCount < maxAddons) {
            addonCount++;
            container.insertAdjacentHTML('beforeend', generateAddonForm(addonCount));
        }
        
        if (addonCount >= maxAddons) {
            addButton.style.display = 'none';
        }
        removeButton.style.display = 'block';
    });

    removeButton?.addEventListener('click', () => {
        if (addonCount > 1) {
            const lastForm = container.querySelector(`[data-addon-index="${addonCount}"]`);
            lastForm?.remove();
            addonCount--;
        }
        
        if (addonCount <= 1) {
            removeButton.style.display = 'none';
        }
        addButton.style.display = 'block';
    });

    saveButton?.addEventListener('click', () => {
        const addonForms = container.querySelectorAll('.addon-form');
        const addons = [];
        let isValid = true;

        addonForms.forEach(form => {
            const name = form.querySelector('.addon-name').value.trim();
            const mobile = form.querySelector('.addon-mobile').value.trim();
            const dob = form.querySelector('.addon-dob').value;
            const relationship = form.querySelector('.addon-relationship').value;

            if (!name || !mobile || !dob || !relationship) {
                isValid = false;
                return;
            }

            if (!FormValidator.validateName(name) || !FormValidator.validateMobile(mobile) || !FormValidator.validateDate(dob)) {
                isValid = false;
                return;
            }

            addons.push({ name, mobile, dob, relationship });
        });

        if (!isValid) {
            alert('Please fill all addon details correctly');
            return;
        }

        const userData = AppState.userData;
        userData.addons = addons;
        AppState.userData = userData;
        
        const checkbox = document.getElementById('addonRequired');
        checkbox.checked = true;
        checkbox.disabled = true;

        bootstrap.Modal.getInstance(document.getElementById('addonModal')).hide();
        alert(`${addons.length} add-on card(s) saved successfully!`);
    });
}