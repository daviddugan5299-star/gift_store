// Deals page specific functionality
let dealEndTime = new Date();
dealEndTime.setHours(dealEndTime.getHours() + 23);
dealEndTime.setMinutes(dealEndTime.getMinutes() + 45);
dealEndTime.setSeconds(dealEndTime.getSeconds() + 12);

// Initialize deals page
document.addEventListener('DOMContentLoaded', function() {
    initializeDealsPage();
    startCountdown();
    setupDealsNewsletter();
});

async function initializeDealsPage() {
    await loadFlashDeals();
    await loadClearanceItems();
}

// Flash deals functionality
async function loadFlashDeals() {
    try {
        const products = await loadProducts();
        const flashDeals = products.filter(product => product.on_sale).slice(0, 4);
        displayFlashDeals(flashDeals);
    } catch (error) {
        console.error('Error loading flash deals:', error);
    }
}

function displayFlashDeals(deals) {
    const container = document.getElementById('flashDealsGrid');
    if (!container) return;

    container.innerHTML = deals.map(product => createFlashDealCard(product)).join('');
}

function createFlashDealCard(product) {
    const discountPercentage = product.on_sale && product.original_price ? 
        Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;
    
    const savings = product.original_price ? (product.original_price - product.price).toFixed(2) : 0;

    return `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 relative">
            <!-- Flash Deal Badge -->
            <div class="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10 animate-pulse">
                🔥 ${discountPercentage}% OFF
            </div>
            
            <!-- Savings Badge -->
            <div class="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold z-10">
                Save $${savings}
            </div>
            
            <div class="relative overflow-hidden">
                <img src="${product.image_url}" alt="${product.name}" 
                     class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300">
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            <div class="p-6">
                <h3 class="font-playfair text-lg font-semibold text-gray-800 mb-2 line-clamp-2">${product.name}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
                
                <div class="flex items-center mb-4">
                    <div class="flex items-center text-yellow-500 mr-2">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="text-sm text-gray-500">(${product.review_count})</span>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-2xl font-bold text-red-600">$${product.price}</span>
                        ${product.original_price ? `
                            <span class="text-lg text-gray-500 line-through">$${product.original_price}</span>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Stock Indicator -->
                <div class="mb-4">
                    <div class="flex justify-between text-sm mb-1">
                        <span class="text-gray-600">Stock Level</span>
                        <span class="text-red-600 font-semibold">Only 5 left!</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="bg-red-500 h-2 rounded-full" style="width: 20%"></div>
                    </div>
                </div>
                
                <button onclick="addToCart('${product.id}')" 
                        class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 transform hover:scale-105 shadow-md">
                    <i class="fas fa-flash mr-2"></i>Grab This Deal!
                </button>
            </div>
        </div>
    `;
}

// Clearance items functionality
async function loadClearanceItems() {
    try {
        const products = await loadProducts();
        // Simulate clearance items by taking some regular products
        const clearanceItems = products.slice(4, 8).map(product => ({
            ...product,
            on_sale: true,
            original_price: product.price * 1.5,
            price: product.price * 0.6 // 40% off
        }));
        displayClearanceItems(clearanceItems);
    } catch (error) {
        console.error('Error loading clearance items:', error);
    }
}

function displayClearanceItems(items) {
    const container = document.getElementById('clearanceGrid');
    if (!container) return;

    container.innerHTML = items.map(product => createClearanceCard(product)).join('');
}

function createClearanceCard(product) {
    const discountPercentage = Math.round(((product.original_price - product.price) / product.original_price) * 100);

    return `
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 relative border-2 border-orange-200">
            <div class="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold z-10">
                CLEARANCE ${discountPercentage}% OFF
            </div>
            
            <div class="relative overflow-hidden">
                <img src="${product.image_url}" alt="${product.name}" 
                     class="w-full h-40 object-cover">
                <div class="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent"></div>
            </div>
            
            <div class="p-4">
                <h3 class="font-semibold text-gray-800 mb-2 line-clamp-1">${product.name}</h3>
                
                <div class="flex items-center justify-between mb-3">
                    <div class="flex items-center space-x-2">
                        <span class="text-xl font-bold text-orange-600">$${product.price.toFixed(2)}</span>
                        <span class="text-sm text-gray-500 line-through">$${product.original_price.toFixed(2)}</span>
                    </div>
                    <div class="flex items-center text-yellow-500 text-sm">
                        ${generateStarRating(product.rating)}
                    </div>
                </div>
                
                <div class="text-center text-xs text-gray-600 mb-3">
                    <i class="fas fa-exclamation-triangle text-orange-500 mr-1"></i>
                    Final Sale - No Returns
                </div>
                
                <button onclick="addToCart('${product.id}')" 
                        class="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-sm">
                    <i class="fas fa-shopping-cart mr-1"></i>Final Sale
                </button>
            </div>
        </div>
    `;
}

// Countdown timer functionality
function startCountdown() {
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

function updateCountdown() {
    const now = new Date().getTime();
    const distance = dealEndTime.getTime() - now;

    if (distance < 0) {
        // Deal has ended, reset for next day
        dealEndTime = new Date();
        dealEndTime.setDate(dealEndTime.getDate() + 1);
        dealEndTime.setHours(0, 0, 0, 0);
        return;
    }

    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
    if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
    if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
}

// Newsletter signup for deals
function setupDealsNewsletter() {
    const form = document.getElementById('dealsNewsletterForm');
    if (form) {
        form.addEventListener('submit', handleDealsNewsletterSubmission);
    }
}

async function handleDealsNewsletterSubmission(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('dealsNewsletterEmail');
    const email = emailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Add subscriber to database with deals preference
        await fetch('tables/newsletter_subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: '',
                subscribed_date: new Date().toISOString(),
                interests: ['deals', 'flash_sales', 'seasonal_offers']
            })
        });
        
        emailInput.value = '';
        showNotification('🎉 Welcome to Deal Alerts! You\'ll get 10% off your first order via email!', 'success');
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showNotification('Oops! Something went wrong. Please try again.', 'error');
    }
}

// Scroll functions
function scrollToDeals() {
    document.getElementById('flash-deals')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToSeasonal() {
    document.getElementById('seasonal-offers')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Bundle deal functionality
function addBundleToCart(bundleId) {
    // This would add a bundle of products to cart
    // For now, we'll just show a notification
    showNotification('Bundle added to cart! Great savings! 🎁', 'success');
    
    // You could extend this to actually add multiple products
    // based on the bundle configuration
}

// Enhanced add to cart for deals with special messaging
function addDealToCart(productId, dealType = 'flash') {
    addToCart(productId);
    
    const messages = {
        'flash': '🔥 Flash deal added! Limited time offer secured!',
        'clearance': '🏷️ Clearance item added! Final sale - great find!',
        'bundle': '📦 Bundle deal added! Amazing savings unlocked!'
    };
    
    showNotification(messages[dealType] || messages.flash, 'success');
}

// Price comparison functionality
function showPriceHistory(productId) {
    // This would show price history for the product
    // Placeholder for future implementation
    showNotification('Price history feature coming soon! 📊', 'info');
}

// Deal alerts functionality
function setDealAlert(productId) {
    // This would allow users to set alerts for when items go on sale
    showNotification('Deal alert set! We\'ll notify you of future discounts 🔔', 'success');
}

// Social sharing for deals
function shareDeal(productId, dealType) {
    const product = products.find(p => p.id == productId);
    if (!product) return;
    
    const shareText = `Check out this amazing ${dealType} deal on ${product.name} at GiftWonders! 🎁`;
    const shareUrl = `${window.location.origin}/category.html?product=${productId}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Amazing Deal at GiftWonders',
            text: shareText,
            url: shareUrl
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(`${shareText} ${shareUrl}`).then(() => {
            showNotification('Deal link copied to clipboard! Share with friends! 📋', 'success');
        });
    }
}

// Deal recommendation engine
async function getRecommendedDeals(currentProductId) {
    // This would use user behavior and product data to recommend deals
    // Placeholder for future ML-powered recommendations
    try {
        const products = await loadProducts();
        const deals = products.filter(p => p.on_sale && p.id != currentProductId).slice(0, 3);
        return deals;
    } catch (error) {
        console.error('Error getting recommended deals:', error);
        return [];
    }
}

// Deal performance tracking
function trackDealInteraction(productId, action) {
    // This would track user interactions with deals for analytics
    // Actions: 'view', 'click', 'add_to_cart', 'share'
    console.log(`Deal interaction: ${action} on product ${productId}`);
    
    // You could send this to an analytics service
    // analytics.track('deal_interaction', { productId, action, timestamp: new Date() });
}

// Wishlist integration for deals
function addDealToWishlist(productId) {
    // Add to wishlist and set up price drop alerts
    toggleWishlist(productId);
    showNotification('Added to wishlist! We\'ll alert you of better deals! ❤️', 'success');
}

// Deal comparison tool
function compareDealPrices(productIds) {
    // This would allow users to compare prices across similar products on sale
    showNotification('Price comparison tool coming soon! 📊', 'info');
}

// Initialize deal-specific animations
function initializeDealAnimations() {
    // Add animations for deal elements
    const dealCards = document.querySelectorAll('.deal-card');
    
    dealCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('animate-fade-in');
    });
}

// Deal expiry warnings
function showDealExpiryWarning(productId, expiresIn) {
    if (expiresIn < 3600000) { // Less than 1 hour
        showNotification(`⏰ Deal expires in ${Math.floor(expiresIn / 60000)} minutes!`, 'warning');
    }
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(initializeDealAnimations, 500);
});