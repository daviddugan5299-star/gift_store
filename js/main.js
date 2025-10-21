// Global variables
let cart = JSON.parse(localStorage.getItem('giftWondersCart')) || [];
let products = [];
let currentPage = 1;
const itemsPerPage = 8;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartDisplay();
    initializeSearch();
    initializeNewsletter();
    
    // Check if we're on a specific page and initialize accordingly
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    
    if (path.includes('category.html')) {
        const category = params.get('category');
        if (category) {
            loadCategoryProducts(category);
        }
    } else if (path.includes('index.html') || path === '/') {
        loadFeaturedProducts();
    }
});

// API Functions
async function loadProducts() {
    try {
        const response = await fetch('tables/products');
        const data = await response.json();
        products = data.data || [];
        return products;
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}

async function loadFeaturedProducts() {
    const allProducts = await loadProducts();
    const featuredProducts = allProducts.filter(product => product.featured);
    displayProducts(featuredProducts, 'featuredProducts');
}

async function loadCategoryProducts(category) {
    const allProducts = await loadProducts();
    const categoryProducts = allProducts.filter(product => 
        product.category === category || !category
    );
    displayProducts(categoryProducts, 'productGrid');
}

async function searchProducts(query) {
    const allProducts = await loadProducts();
    const searchResults = allProducts.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
    return searchResults;
}

// Product Display Functions
function displayProducts(productsToShow, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (productsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p class="text-gray-500">Try adjusting your search or browse our categories</p>
            </div>
        `;
        return;
    }

    container.innerHTML = productsToShow.map(product => createProductCard(product)).join('');
}

function createProductCard(product) {
    const discountPercentage = product.on_sale && product.original_price ? 
        Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

    return `
        <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden group">
            ${product.on_sale ? `
                <div class="absolute top-4 left-4 bg-warm-coral text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                    ${discountPercentage}% OFF
                </div>
            ` : ''}
            
            <div class="relative overflow-hidden">
                <img src="${product.image_url}" alt="${product.name}" 
                     class="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300">
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
            </div>
            
            <div class="p-6">
                <div class="flex items-start justify-between mb-2">
                    <h3 class="font-playfair text-lg font-semibold text-gray-800 leading-tight">${product.name}</h3>
                    <button onclick="toggleWishlist('${product.id}')" class="text-gray-400 hover:text-warm-coral transition-colors">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${product.description}</p>
                
                <div class="flex items-center mb-4">
                    <div class="flex items-center text-yellow-500 mr-2">
                        ${generateStarRating(product.rating)}
                    </div>
                    <span class="text-sm text-gray-500">(${product.review_count})</span>
                </div>
                
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-2">
                        <span class="text-xl font-bold text-warm-coral">$${product.price}</span>
                        ${product.original_price && product.on_sale ? `
                            <span class="text-sm text-gray-500 line-through">$${product.original_price}</span>
                        ` : ''}
                    </div>
                    <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">${product.category}</span>
                </div>
                
                <button onclick="addToCart('${product.id}')" 
                        class="w-full bg-warm-coral text-white py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}"
                        ${!product.in_stock ? 'disabled' : ''}>
                    <i class="fas fa-shopping-cart mr-2"></i>
                    ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            </div>
        </div>
    `;
}

function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Cart Functions
function addToCart(productId) {
    const product = products.find(p => p.id == productId);
    if (!product || !product.in_stock) return;

    const existingItem = cart.find(item => item.id == productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1,
            addedAt: new Date().toISOString()
        });
    }
    
    saveCart();
    updateCartDisplay();
    showAddToCartAnimation();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    saveCart();
    updateCartDisplay();
}

function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id == productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            updateCartDisplay();
        }
    }
}

function updateCartDisplay() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartCount) cartCount.textContent = totalItems;
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center text-gray-500 py-8">
                    <i class="fas fa-shopping-cart text-4xl mb-4"></i>
                    <p>Your cart is empty</p>
                    <p class="text-sm mt-2">Start adding some gifts to make someone happy!</p>
                </div>
            `;
            if (cartFooter) cartFooter.classList.add('hidden');
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
                    <img src="${item.image_url}" alt="${item.name}" class="w-16 h-16 object-cover rounded-lg">
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-sm text-gray-800 truncate">${item.name}</h4>
                        <p class="text-warm-coral font-semibold">$${item.price}</p>
                        <div class="flex items-center space-x-2 mt-2">
                            <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" 
                                    class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <i class="fas fa-minus text-xs"></i>
                            </button>
                            <span class="text-sm font-medium">${item.quantity}</span>
                            <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" 
                                    class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
                                <i class="fas fa-plus text-xs"></i>
                            </button>
                        </div>
                    </div>
                    <button onclick="removeFromCart('${item.id}')" 
                            class="text-gray-400 hover:text-red-500 transition-colors">
                        <i class="fas fa-trash text-sm"></i>
                    </button>
                </div>
            `).join('');
            
            if (cartFooter) cartFooter.classList.remove('hidden');
        }
    }
    
    if (cartTotal) cartTotal.textContent = `$${totalPrice.toFixed(2)}`;
}

function saveCart() {
    localStorage.setItem('giftWondersCart', JSON.stringify(cart));
}

function showAddToCartAnimation() {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.className = 'fixed top-20 right-4 bg-warm-coral text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    notification.innerHTML = '<i class="fas fa-check mr-2"></i>Added to cart!';
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
}

// UI Functions
function toggleCart() {
    const cartSidebar = document.getElementById('cartSidebar');
    const cartOverlay = document.getElementById('cartOverlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('translate-x-full');
        cartOverlay.classList.toggle('hidden');
        document.body.classList.toggle('overflow-hidden');
    }
}

function toggleMobileMenu() {
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('hidden');
    }
}

function toggleMobileSearch() {
    const mobileSearch = document.getElementById('mobileSearch');
    if (mobileSearch) {
        mobileSearch.classList.toggle('hidden');
    }
}

function scrollToFeatured() {
    document.getElementById('featured')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

function scrollToCategories() {
    document.getElementById('categories')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Search Functions
function initializeSearch() {
    const searchInputs = document.querySelectorAll('input[type="text"]');
    searchInputs.forEach(input => {
        if (input.placeholder.includes('Search')) {
            input.addEventListener('input', debounce(handleSearch, 300));
            input.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearch(e);
                }
            });
        }
    });
}

async function handleSearch(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) return;
    
    const results = await searchProducts(query);
    
    // If we're on the category page, update the product grid
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        displayProducts(results, 'productGrid');
    } else {
        // If we're on the homepage, navigate to category page with search results
        window.location.href = `category.html?search=${encodeURIComponent(query)}`;
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Newsletter Functions
function initializeNewsletter() {
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', handleNewsletterSubmission);
    }
}

async function handleNewsletterSubmission(e) {
    e.preventDefault();
    
    const emailInput = document.getElementById('newsletterEmail');
    const email = emailInput.value.trim();
    
    if (!email || !isValidEmail(email)) {
        showNotification('Please enter a valid email address', 'error');
        return;
    }
    
    try {
        // Add subscriber to database
        await fetch('tables/newsletter_subscribers', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                name: '',
                subscribed_date: new Date().toISOString(),
                interests: []
            })
        });
        
        emailInput.value = '';
        showNotification('Thanks for subscribing! Welcome to the GiftWonders family 🎁', 'success');
    } catch (error) {
        console.error('Newsletter subscription error:', error);
        showNotification('Oops! Something went wrong. Please try again.', 'error');
    }
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 px-6 py-4 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'error' ? 'bg-red-500 text-white' :
        'bg-blue-500 text-white'
    }`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${type === 'success' ? 'fa-check' : type === 'error' ? 'fa-times' : 'fa-info'} mr-2"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => notification.classList.remove('translate-x-full'), 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Wishlist Functions (placeholder for future implementation)
function toggleWishlist(productId) {
    // This would integrate with a wishlist system
    console.log('Toggle wishlist for product:', productId);
    showNotification('Wishlist feature coming soon! ❤️', 'info');
}

// Utility Functions
function formatPrice(price) {
    return `$${parseFloat(price).toFixed(2)}`;
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}