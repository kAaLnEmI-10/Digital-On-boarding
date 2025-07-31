// Application State
const AppState = {
    currentStep: 1,
    userData: {
        mobile: '',
        fullName: '',
        dateOfBirth: '',
        pan: '',
        fatherName: '',
        email: '',
        emailVerified: false,
        creditLimit: 50000,
        addonRequired: false,
        addons: [],
        selectedCard: null,
        cardType: null
    },
    captcha: ''
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

// Step Progress Manager
class StepProgressManager {
    constructor() {
        this.steps = ['Personal Info', 'Credit Details', 'Card Selection', 'Review & Submit'];
        this.currentStep = 1;
    }

    updateProgress(step) {
        this.currentStep = step;
        const progressContainer = document.querySelector('.progress-steps');
        const progressLine = document.querySelector('.progress-line');
        
        if (!progressContainer) return;

        // Update step states
        const stepElements = progressContainer.querySelectorAll('.step');
        stepElements.forEach((stepEl, index) => {
            const stepNumber = index + 1;
            stepEl.classList.remove('active', 'completed');
            
            if (stepNumber < step) {
                stepEl.classList.add('completed');
                stepEl.querySelector('.step-circle').innerHTML = '<i class="fas fa-check"></i>';
            } else if (stepNumber === step) {
                stepEl.classList.add('active');
                stepEl.querySelector('.step-circle').textContent = stepNumber;
            } else {
                stepEl.querySelector('.step-circle').textContent = stepNumber;
            }
        });

        // Update progress line
        if (progressLine) {
            const progressPercentage = ((step - 1) / (this.steps.length - 1)) * 100;
            progressLine.style.width = `${progressPercentage}%`;
        }
    }

    createProgressBar() {
        return `
            <div class="step-progress">
                <div class="progress-steps">
                    <div class="progress-line"></div>
                    ${this.steps.map((stepName, index) => `
                        <div class="step ${index + 1 <= this.currentStep ? (index + 1 === this.currentStep ? 'active' : 'completed') : ''}">
                            <div class="step-circle">
                                ${index + 1 < this.currentStep ? '<i class="fas fa-check"></i>' : index + 1}
                            </div>
                            <div class="step-label">${stepName}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
}

// Page Manager
class PageManager {
    constructor() {
        this.stepProgress = new StepProgressManager();
    }

    showPage(pageContent, step = null) {
        const mainContent = document.querySelector('.main-content');
        if (!mainContent) return;

        let content = pageContent;
        if (step) {
            content = this.stepProgress.createProgressBar() + pageContent;
            this.stepProgress.updateProgress(step);
        }

        mainContent.innerHTML = `
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        ${content}
                    </div>
                </div>
            </div>
        `;

        // Animate page entry
        mainContent.querySelector('.container').classList.add('fade-in-up');
    }

    showStep1() {
        const content = `
            <div class="login-card">
                <div class="text-center mb-4">
                    <h2 class="card-title">Personal Information</h2>
                    <p class="card-subtitle">Please provide your basic details</p>
                </div>
                
                <form id="step1Form">
                    <div class="mb-3">
                        <label for="fullName" class="form-label">Full Name</label>
                        <input type="text" class="form-control" id="fullName" 
                               placeholder="Enter your full name as per PAN card" 
                               value="${AppState.userData.fullName}" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="dateOfBirth" class="form-label">Date of Birth</label>
                        <input type="date" class="form-control date-input" id="dateOfBirth" 
                               value="${AppState.userData.dateOfBirth}" required>
                    </div>
                    
                    <div class="mb-4">
                        <label for="panNumber" class="form-label">PAN Number</label>
                        <input type="text" class="form-control" id="panNumber" 
                               placeholder="ABCDE1234F" maxlength="10" 
                               value="${AppState.userData.pan}" 
                               style="text-transform: uppercase" required>
                    </div>
                    
                    <div class="d-flex gap-3">
                        <button type="button" class="btn btn-secondary" onclick="pageManager.showLanding()">
                            <i class="fas fa-arrow-left me-2"></i>Back
                        </button>
                        <button type="submit" class="btn btn-primary flex-fill">
                            <i class="fas fa-check me-2"></i>Validate
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        this.showPage(content, 1);
        this.initStep1Form();
    }

    showStep2() {
        const content = `
            <div class="login-card">
                <div class="text-center mb-4">
                    <h2 class="card-title">Credit Details</h2>
                    <p class="card-subtitle">Set your credit limit and additional information</p>
                </div>
                
                <form id="step2Form">
                    <div class="mb-4">
                        <label class="form-label">Credit Card Limit</label>
                        <div class="range-container">
                            <div class="range-slider">
                                <input type="range" class="range-input" id="creditLimit" 
                                       min="25000" max="500000" step="5000" 
                                       value="${AppState.userData.creditLimit}">
                                <div class="range-value" id="rangeValue">₹${AppState.userData.creditLimit.toLocaleString()}</div>
                            </div>
                            <div class="d-flex justify-content-between mt-2">
                                <small class="text-muted">₹25,000</small>
                                <small class="text-muted">₹5,00,000</small>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="fatherName" class="form-label">Father's Name</label>
                        <input type="text" class="form-control" id="fatherName" 
                               placeholder="Enter father's name" 
                               value="${AppState.userData.fatherName}" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="email" class="form-label">
                            Email Address
                            ${AppState.userData.emailVerified ? '<span class="verification-badge"><i class="fas fa-check me-1"></i>Verified</span>' : ''}
                        </label>
                        <div class="input-group">
                            <input type="email" class="form-control" id="email" 
                                   placeholder="Enter your email address" 
                                   value="${AppState.userData.email}" required>
                            <button type="button" class="btn btn-outline-primary" id="validateEmail" 
                                    ${AppState.userData.emailVerified ? 'disabled' : ''}>
                                ${AppState.userData.emailVerified ? 'Verified' : 'Validate'}
                            </button>
                        </div>
                        <div id="otpSection" class="mt-2" style="display: none;">
                            <div class="input-group">
                                <input type="text" class="form-control" id="otpInput" 
                                       placeholder="Enter 6-digit OTP" maxlength="6">
                                <button type="button" class="btn btn-success" id="verifyOtp">Verify</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-4">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="addonRequired" 
                                   ${AppState.userData.addonRequired ? 'checked' : ''}>
                            <label class="form-check-label" for="addonRequired">
                                Add-on cards required
                            </label>
                        </div>
                    </div>
                    
                    <div class="d-flex gap-3">
                        <button type="button" class="btn btn-secondary" onclick="pageManager.showStep1()">
                            <i class="fas fa-arrow-left me-2"></i>Back
                        </button>
                        <button type="submit" class="btn btn-primary flex-fill">
                            <i class="fas fa-arrow-right me-2"></i>Next
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        this.showPage(content, 2);
        this.initStep2Form();
    }

    showStep3() {
        const cards = [
            {
                id: 'platinum',
                name: 'Platinum Rewards',
                image: 'PLAT',
                features: ['5x Rewards on dining', '2x on online shopping', 'Airport lounge access', 'No foreign transaction fees']
            },
            {
                id: 'gold',
                name: 'Gold Cashback',
                image: 'GOLD',
                features: ['5% cashback on groceries', '2% on fuel', 'Welcome bonus ₹2000', 'Contactless payments']
            },
            {
                id: 'titanium',
                name: 'Titanium Elite',
                image: 'TITAN',
                features: ['10x rewards on travel', 'Premium concierge', 'Golf privileges', 'Luxury hotel benefits']
            },
            {
                id: 'signature',
                name: 'Signature Exclusive',
                image: 'SIGN',
                features: ['Unlimited airport lounge', 'Personal relationship manager', 'Priority customer service', 'Global acceptance']
            }
        ];

        const content = `
            <div class="login-card">
                <div class="text-center mb-4">
                    <h2 class="card-title">Choose Your Credit Card</h2>
                    <p class="card-subtitle">Select the perfect card for your lifestyle</p>
                </div>
                
                <div class="card-grid" id="cardGrid">
                    ${cards.map(card => `
                        <div class="credit-card-item ${AppState.userData.selectedCard === card.id ? 'selected' : ''}" 
                             data-card-id="${card.id}">
                            <div class="card-image">${card.image}</div>
                            <div class="card-details">
                                <h5>${card.name}</h5>
                                <div class="card-features">
                                    ${card.features.map(feature => `<div>• ${feature}</div>`).join('')}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="d-flex gap-3 mt-4">
                    <button type="button" class="btn btn-secondary" onclick="pageManager.showStep2()">
                        <i class="fas fa-arrow-left me-2"></i>Back
                    </button>
                    <button type="button" class="btn btn-primary flex-fill" id="nextToStep4" disabled>
                        <i class="fas fa-arrow-right me-2"></i>Next
                    </button>
                </div>
            </div>
        `;
        
        this.showPage(content, 3);
        this.initStep3();
    }

    showStep4() {
        const selectedCardInfo = this.getSelectedCardInfo();
        
        const content = `
            <div class="login-card">
                <div class="text-center mb-4">
                    <h2 class="card-title">Review & Submit</h2>
                    <p class="card-subtitle">Please review your application details</p>
                </div>
                
                <div class="summary-card">
                    <div class="summary-image">
                        <i class="fas fa-credit-card"></i>
                    </div>
                    <div class="summary-details">
                        <h4>${selectedCardInfo.name}</h4>
                        <div class="row mt-3">
                            <div class="col-md-6">
                                <p><strong>Name:</strong> ${AppState.userData.fullName}</p>
                                <p><strong>DOB:</strong> ${new Date(AppState.userData.dateOfBirth).toLocaleDateString()}</p>
                                <p><strong>PAN:</strong> ${AppState.userData.pan}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Email:</strong> ${AppState.userData.email}</p>
                                <p><strong>Credit Limit:</strong> ₹${AppState.userData.creditLimit.toLocaleString()}</p>
                                <p><strong>Add-ons:</strong> ${AppState.userData.addonRequired ? AppState.userData.addons.length : 'None'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="agreeTerms" required>
                        <label class="form-check-label" for="agreeTerms">
                            I agree to the <a href="#" data-bs-toggle="modal" data-bs-target="#termsModal">Terms & Conditions</a>
                        </label>
                    </div>
                </div>
                
                <div class="d-flex gap-3">
                    <button type="button" class="btn btn-secondary" onclick="pageManager.showStep3()">
                        <i class="fas fa-arrow-left me-2"></i>Back
                    </button>
                    <button type="button" class="btn btn-primary flex-fill" id="submitApplication" disabled>
                        <i class="fas fa-paper-plane me-2"></i>Submit Application
                    </button>
                </div>
            </div>
        `;
        
        this.showPage(content, 4);
        this.initStep4();
    }

    showCardSelection() {
        const content = `
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-10">
                        <div class="text-center mb-5">
                            <h2 class="card-title">Choose Card Delivery Option</h2>
                            <p class="card-subtitle">Select how you'd like to receive your credit card</p>
                        </div>
                        
                        <div class="selection-container">
                            <div class="selection-box" data-card-type="physical">
                                <i class="fas fa-credit-card"></i>
                                <h4>Physical Card</h4>
                                <p>Receive a physical card at your registered address within 7-10 business days</p>
                                <ul class="list-unstyled mt-3">
                                    <li>• Free home delivery</li>
                                    <li>• Premium card material</li>
                                    <li>• Contactless enabled</li>
                                </ul>
                            </div>
                            
                            <div class="selection-box" data-card-type="virtual">
                                <i class="fas fa-mobile-alt"></i>
                                <h4>Virtual Card</h4>
                                <p>Get instant access to your card details and start using immediately</p>
                                <ul class="list-unstyled mt-3">
                                    <li>• Instant activation</li>
                                    <li>• Perfect for online shopping</li>
                                    <li>• Mobile wallet ready</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showPage(content);
        this.initCardSelection();
    }

    showApplicationStatus() {
        const content = `
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-8">
                        <div class="login-card text-center">
                            <div class="mb-4">
                                <i class="fas fa-check-circle pulse" style="font-size: 4rem; color: var(--success-color);"></i>
                            </div>
                            
                            <h2 class="card-title">Application Submitted Successfully!</h2>
                            <p class="card-subtitle mb-4">Your credit card application is being processed</p>
                            
                            <div class="row text-start">
                                <div class="col-md-6">
                                    <div class="summary-section mb-4">
                                        <h5><i class="fas fa-user me-2"></i>Personal Details</h5>
                                        <p><strong>Name:</strong> ${AppState.userData.fullName}</p>
                                        <p><strong>Mobile:</strong> +91 ${AppState.userData.mobile}</p>
                                        <p><strong>Email:</strong> ${AppState.userData.email}</p>
                                        <p><strong>PAN:</strong> ${AppState.userData.pan}</p>
                                    </div>
                                </div>
                                
                                <div class="col-md-6">
                                    <div class="summary-section mb-4">
                                        <h5><i class="fas fa-credit-card me-2"></i>Card Details</h5>
                                        <p><strong>Card Type:</strong> ${this.getSelectedCardInfo().name}</p>
                                        <p><strong>Credit Limit:</strong> ₹${AppState.userData.creditLimit.toLocaleString()}</p>
                                        <p><strong>Delivery:</strong> ${AppState.userData.cardType === 'physical' ? 'Physical Card' : 'Virtual Card'}</p>
                                        <p><strong>Add-ons:</strong> ${AppState.userData.addonRequired ? AppState.userData.addons.length : 'None'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                <strong>Application Reference:</strong> CP${Date.now().toString().slice(-8)}
                            </div>
                            
                            <div class="alert alert-success">
                                <i class="fas fa-clock me-2"></i>
                                Processing Time: 2-3 business days
                            </div>
                            
                            <button class="btn btn-primary" onclick="location.reload()">
                                <i class="fas fa-home me-2"></i>Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.showPage(content);
    }

    showLanding() {
        location.reload();
    }

    getSelectedCardInfo() {
        const cards = {
            'platinum': { name: 'Platinum Rewards', image: 'PLAT' },
            'gold': { name: 'Gold Cashback', image: 'GOLD' },
            'titanium': { name: 'Titanium Elite', image: 'TITAN' },
            'signature': { name: 'Signature Exclusive', image: 'SIGN' }
        };
        return cards[AppState.userData.selectedCard] || cards.platinum;
    }

    // Form initialization methods
    initStep1Form() {
        const form = document.getElementById('step1Form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('fullName').value.trim();
            const dateOfBirth = document.getElementById('dateOfBirth').value;
            const panNumber = document.getElementById('panNumber').value.trim().toUpperCase();
            
            // Validation
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
            AppState.userData.fullName = fullName;
            AppState.userData.dateOfBirth = dateOfBirth;
            AppState.userData.pan = panNumber;
            
            // Proceed to next step
            this.showStep2();
        });
    }

    initStep2Form() {
        // Range slider
        const rangeInput = document.getElementById('creditLimit');
        const rangeValue = document.getElementById('rangeValue');
        
        rangeInput?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            rangeValue.textContent = `₹${value.toLocaleString()}`;
            
            // Position the value display
            const percent = ((value - 25000) / (500000 - 25000)) * 100;
            rangeValue.style.left = `${percent}%`;
            
            AppState.userData.creditLimit = value;
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
            
            AppState.userData.email = email;
            otpSection.style.display = 'block';
            validateEmailBtn.textContent = 'OTP Sent';
            validateEmailBtn.disabled = true;
            
            // Simulate OTP
            setTimeout(() => {
                alert('OTP: 123456 (Demo)');
            }, 1000);
        });

        // OTP verification
        const verifyOtpBtn = document.getElementById('verifyOtp');
        verifyOtpBtn?.addEventListener('click', () => {
            const otp = document.getElementById('otpInput').value;
            
            if (otp === '123456') {
                AppState.userData.emailVerified = true;
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
            AppState.userData.addonRequired = e.target.checked;
            
            if (e.target.checked) {
                this.showAddonModal();
            }
        });

        // Form submission
        const form = document.getElementById('step2Form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const fatherName = document.getElementById('fatherName').value.trim();
            
            if (!FormValidator.validateName(fatherName)) {
                alert('Please enter a valid father\'s name');
                return;
            }
            
            if (!AppState.userData.emailVerified) {
                alert('Please verify your email address');
                return;
            }
            
            AppState.userData.fatherName = fatherName;
            this.showStep3();
        });
    }

    initStep3() {
        const cardItems = document.querySelectorAll('.credit-card-item');
        const nextButton = document.getElementById('nextToStep4');
        
        cardItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove previous selection
                cardItems.forEach(card => card.classList.remove('selected'));
                
                // Add selection to clicked card
                item.classList.add('selected');
                AppState.userData.selectedCard = item.dataset.cardId;
                
                nextButton.disabled = false;
            });
        });

        nextButton?.addEventListener('click', () => {
            this.showStep4();
        });
    }

    initStep4() {
        const agreeTerms = document.getElementById('agreeTerms');
        const submitButton = document.getElementById('submitApplication');
        
        agreeTerms?.addEventListener('change', (e) => {
            submitButton.disabled = !e.target.checked;
        });

        submitButton?.addEventListener('click', () => {
            this.showCardSelection();
        });
    }

    initCardSelection() {
        const selectionBoxes = document.querySelectorAll('.selection-box');
        
        selectionBoxes.forEach(box => {
            box.addEventListener('click', () => {
                const cardType = box.dataset.cardType;
                AppState.userData.cardType = cardType;
                this.showApplicationStatus();
            });
        });
    }

    showAddonModal() {
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
                                ${this.generateAddonForm(1)}
                            </div>
                            <div class="d-flex justify-content-between mt-3">
                                <button type="button" class="btn btn-success btn-round btn-add" id="addAddon">+</button>
                                <button type="button" class="btn btn-danger btn-round btn-remove" id="removeAddon">-</button>
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

        // Remove existing modal if any
        const existingModal = document.getElementById('addonModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('addonModal'));
        modal.show();

        this.initAddonModal();
    }

    generateAddonForm(index) {
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

    initAddonModal() {
        let addonCount = 1;
        const maxAddons = 4;

        const addButton = document.getElementById('addAddon');
        const removeButton = document.getElementById('removeAddon');
        const saveButton = document.getElementById('saveAddons');
        const container = document.getElementById('addonContainer');

        addButton?.addEventListener('click', () => {
            if (addonCount < maxAddons) {
                addonCount++;
                container.insertAdjacentHTML('beforeend', this.generateAddonForm(addonCount));
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

            AppState.userData.addons = addons;
            
            // Update checkbox state
            const checkbox = document.getElementById('addonRequired');
            checkbox.checked = true;
            checkbox.disabled = true;

            bootstrap.Modal.getInstance(document.getElementById('addonModal')).hide();
            alert(`${addons.length} add-on card(s) saved successfully!`);
        });
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    window.themeManager = new ThemeManager();
    window.captchaGenerator = new CaptchaGenerator();
    window.pageManager = new PageManager();

    // Initialize login form
    const loginForm = document.getElementById('loginForm');
    loginForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const mobile = document.getElementById('mobileNumber').value.trim();
        const captchaInput = document.getElementById('captchaInput').value.trim();
        
        // Validation
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
        AppState.userData.mobile = mobile;
        pageManager.showStep1();
    });

    // Update active navigation
    const updateActiveNav = (currentPage) => {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeLink = document.querySelector(`[href="${currentPage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    };

    updateActiveNav('index.html');
});