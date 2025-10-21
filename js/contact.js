// Contact page specific functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeContactForm();
    initializeFAQ();
});

// Contact form functionality
function initializeContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmission);
    }

    // Auto-fill subject based on URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const subject = urlParams.get('subject');
    const orderNumber = urlParams.get('order');
    
    if (subject) {
        const subjectSelect = document.getElementById('subject');
        if (subjectSelect) {
            subjectSelect.value = subject;
        }
    }
    
    if (orderNumber) {
        const orderField = document.getElementById('orderNumber');
        if (orderField) {
            orderField.value = orderNumber;
        }
    }
}

async function handleContactFormSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const contactData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone') || '',
        subject: formData.get('subject'),
        orderNumber: formData.get('orderNumber') || '',
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'on',
        submittedAt: new Date().toISOString()
    };

    // Validate required fields
    if (!contactData.firstName || !contactData.lastName || !contactData.email || !contactData.subject || !contactData.message) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }

    // Validate email
    if (!isValidEmail(contactData.email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }

    try {
        // Show loading state
        const submitButton = e.target.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Sending...';
        submitButton.disabled = true;

        // Simulate sending email (in a real app, this would call your backend)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // If newsletter is checked, add to subscribers
        if (contactData.newsletter) {
            try {
                await fetch('tables/newsletter_subscribers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: contactData.email,
                        name: `${contactData.firstName} ${contactData.lastName}`,
                        subscribed_date: new Date().toISOString(),
                        interests: ['general']
                    })
                });
            } catch (error) {
                console.warn('Could not add to newsletter:', error);
            }
        }

        // Reset form
        e.target.reset();
        
        // Show success message
        showNotification(
            `Thank you ${contactData.firstName}! Your message has been sent successfully. We'll get back to you within 24 hours.`, 
            'success'
        );

        // Reset button
        submitButton.innerHTML = originalText;
        submitButton.disabled = false;

        // Send confirmation email (simulated)
        sendConfirmationEmail(contactData);

    } catch (error) {
        console.error('Error sending contact form:', error);
        showNotification('Oops! Something went wrong. Please try again or call us directly.', 'error');
        
        // Reset button
        const submitButton = e.target.querySelector('button[type="submit"]');
        submitButton.innerHTML = '<i class="fas fa-paper-plane mr-2"></i>Send Message';
        submitButton.disabled = false;
    }
}

function sendConfirmationEmail(contactData) {
    // In a real application, this would trigger a confirmation email
    // For now, we'll just log it and show additional information
    console.log('Sending confirmation email to:', contactData.email);
    
    setTimeout(() => {
        showNotification(
            `📧 Confirmation email sent to ${contactData.email}. Check your inbox for reference number and next steps.`,
            'info'
        );
    }, 3000);
}

// FAQ functionality
function initializeFAQ() {
    // FAQ items are handled by toggleFAQ function called from HTML
    console.log('FAQ initialized');
}

function toggleFAQ(index) {
    const content = document.getElementById(`faq-content-${index}`);
    const icon = document.getElementById(`faq-icon-${index}`);
    
    if (content && icon) {
        if (content.classList.contains('hidden')) {
            // Close all other FAQs
            document.querySelectorAll('[id^="faq-content-"]').forEach(item => {
                if (item !== content) {
                    item.classList.add('hidden');
                }
            });
            document.querySelectorAll('[id^="faq-icon-"]').forEach(item => {
                if (item !== icon) {
                    item.classList.remove('rotate-180');
                }
            });
            
            // Open current FAQ
            content.classList.remove('hidden');
            icon.classList.add('rotate-180');
        } else {
            // Close current FAQ
            content.classList.add('hidden');
            icon.classList.remove('rotate-180');
        }
    }
}

// Live chat functionality
function openLiveChat() {
    // In a real application, this would open a chat widget
    showNotification('Live chat feature coming soon! For immediate assistance, please call us at +1 (555) GIFT-123', 'info');
    
    // You could integrate with services like:
    // - Intercom
    // - Zendesk Chat
    // - Crisp
    // - Tawk.to
    
    // Example integration:
    // if (window.Intercom) {
    //     window.Intercom('show');
    // }
}

// Contact form helpers
function getContactFormData() {
    const form = document.getElementById('contactForm');
    if (!form) return null;
    
    const formData = new FormData(form);
    return {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        subject: formData.get('subject'),
        orderNumber: formData.get('orderNumber'),
        message: formData.get('message'),
        newsletter: formData.get('newsletter') === 'on'
    };
}

function prefillContactForm(data) {
    const form = document.getElementById('contactForm');
    if (!form || !data) return;
    
    Object.keys(data).forEach(key => {
        const field = form.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'checkbox') {
                field.checked = data[key];
            } else {
                field.value = data[key];
            }
        }
    });
}

// Quick contact actions
function quickContactAction(action, data = {}) {
    switch (action) {
        case 'order-help':
            prefillContactForm({
                subject: 'order-inquiry',
                orderNumber: data.orderNumber || '',
                message: `Hi, I need help with my order${data.orderNumber ? ` #${data.orderNumber}` : ''}. `
            });
            scrollToContactForm();
            break;
            
        case 'gift-recommendation':
            prefillContactForm({
                subject: 'gift-recommendations',
                message: `Hi, I'm looking for gift recommendations for ${data.occasion || 'a special occasion'}. Budget: ${data.budget || 'flexible'}. `
            });
            scrollToContactForm();
            break;
            
        case 'return-request':
            prefillContactForm({
                subject: 'return-exchange',
                orderNumber: data.orderNumber || '',
                message: `Hi, I would like to return/exchange an item from my order${data.orderNumber ? ` #${data.orderNumber}` : ''}. `
            });
            scrollToContactForm();
            break;
            
        default:
            scrollToContactForm();
    }
}

function scrollToContactForm() {
    const form = document.getElementById('contactForm');
    if (form) {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Focus on first input
        const firstInput = form.querySelector('input[type="text"]');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 500);
        }
    }
}

// Store visit functionality
function getDirections() {
    const address = "123 Gift Street, New York, NY 10001";
    const encoded = encodeURIComponent(address);
    
    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        // iOS - open Apple Maps
        window.open(`http://maps.apple.com/?q=${encoded}`);
    } else {
        // Android/Desktop - open Google Maps
        window.open(`https://maps.google.com/maps?q=${encoded}`);
    }
}

function callStore() {
    window.open('tel:+1-555-GIFT-123');
}

// Business hours checker
function isStoreOpen() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = now.getHours();
    
    // Store hours:
    // Monday - Friday: 10:00 AM - 8:00 PM (10-20)
    // Saturday: 9:00 AM - 9:00 PM (9-21)
    // Sunday: 11:00 AM - 6:00 PM (11-18)
    
    if (day >= 1 && day <= 5) { // Monday - Friday
        return hour >= 10 && hour < 20;
    } else if (day === 6) { // Saturday
        return hour >= 9 && hour < 21;
    } else if (day === 0) { // Sunday
        return hour >= 11 && hour < 18;
    }
    
    return false;
}

function updateStoreStatus() {
    const isOpen = isStoreOpen();
    const statusElements = document.querySelectorAll('.store-status');
    
    statusElements.forEach(element => {
        if (isOpen) {
            element.innerHTML = '<span class="text-green-600 font-semibold"><i class="fas fa-circle text-xs mr-1"></i>Open Now</span>';
        } else {
            element.innerHTML = '<span class="text-red-600 font-semibold"><i class="fas fa-circle text-xs mr-1"></i>Closed</span>';
        }
    });
}

// Contact preferences
function setContactPreference(method) {
    // Store user's preferred contact method
    localStorage.setItem('preferredContactMethod', method);
    showNotification(`Great! We'll prioritize ${method} when reaching out to you.`, 'success');
}

function getContactPreference() {
    return localStorage.getItem('preferredContactMethod') || 'email';
}

// Emergency contact functionality
function showEmergencyContact() {
    const emergencyMessage = `
        <div class="text-center">
            <h3 class="font-bold text-lg mb-4">Need Urgent Help?</h3>
            <p class="mb-4">For time-sensitive issues like same-day delivery or last-minute gift emergencies:</p>
            <div class="space-y-2">
                <a href="tel:+1-555-GIFT-911" class="block bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                    <i class="fas fa-phone mr-2"></i>Emergency Line: +1 (555) GIFT-911
                </a>
                <p class="text-sm text-gray-600">Available 24/7 for urgent gift needs</p>
            </div>
        </div>
    `;
    
    // You could show this in a modal or dedicated section
    showNotification(emergencyMessage, 'info');
}

// Contact analytics (placeholder)
function trackContactInteraction(action, data = {}) {
    // Track contact form interactions for analytics
    console.log('Contact interaction:', { action, data, timestamp: new Date() });
    
    // In a real app, you might send this to your analytics service:
    // analytics.track('contact_interaction', { action, ...data });
}

// Initialize contact page enhancements
document.addEventListener('DOMContentLoaded', function() {
    updateStoreStatus();
    
    // Update store status every minute
    setInterval(updateStoreStatus, 60000);
    
    // Track page view
    trackContactInteraction('page_view');
});

// Export functions for use in HTML onclick handlers
window.toggleFAQ = toggleFAQ;
window.openLiveChat = openLiveChat;
window.getDirections = getDirections;
window.callStore = callStore;
window.quickContactAction = quickContactAction;
window.showEmergencyContact = showEmergencyContact;