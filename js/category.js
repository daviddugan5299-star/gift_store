// Category page specific functionality
let filteredProducts = [];
let currentView = 'grid';
let currentSort = 'featured';
let currentFilters = {
    priceRanges: [],
    rating: null,
    inStock: true
};

// Initialize category page
document.addEventListener('DOMContentLoaded', function() {
    initializeCategoryPage();
    setupFilters();
    setupSorting();
});

async function initializeCategoryPage() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    const searchQuery = urlParams.get('search');
    
    // Update page title and breadcrumb
    if (category) {
        updatePageForCategory(category);
        await loadAndDisplayProducts(category);
    } else if (searchQuery) {
        updatePageForSearch(searchQuery);
        await loadAndDisplaySearchResults(searchQuery);
    } else {
        updatePageForAllProducts();
        await loadAndDisplayProducts();
    }
}

function updatePageForCategory(category) {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    
    const categoryInfo = getCategoryInfo(category);
    
    if (pageTitle) pageTitle.textContent = categoryInfo.title;
    if (pageDescription) pageDescription.textContent = categoryInfo.description;
    if (breadcrumbCategory) breadcrumbCategory.textContent = category;
    
    // Update page title
    document.title = `${category} - GiftWonders`;
}

function updatePageForSearch(query) {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    
    if (pageTitle) pageTitle.textContent = `Search Results for "${query}"`;
    if (pageDescription) pageDescription.textContent = `Found gifts matching "${query}"`;
    if (breadcrumbCategory) breadcrumbCategory.textContent = `Search: ${query}`;
    
    document.title = `Search: ${query} - GiftWonders`;
}

function updatePageForAllProducts() {
    const pageTitle = document.getElementById('pageTitle');
    const pageDescription = document.getElementById('pageDescription');
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    
    if (pageTitle) pageTitle.textContent = 'All Gifts';
    if (pageDescription) pageDescription.textContent = 'Discover thoughtful gifts for every occasion and every person you care about';
    if (breadcrumbCategory) breadcrumbCategory.textContent = 'All Gifts';
    
    document.title = 'All Gifts - GiftWonders';
}

function getCategoryInfo(category) {
    const categoryMapping = {
        'Birthday Gifts': {
            title: 'Birthday Gifts',
            description: 'Celebrate another year of joy with thoughtful birthday presents that create lasting memories'
        },
        'Anniversary Gifts': {
            title: 'Anniversary Gifts',
            description: 'Honor your love story with romantic and meaningful gifts that speak from the heart'
        },
        'Personalized Gifts': {
            title: 'Personalized Gifts',
            description: 'Create unique, custom gifts that add a personal touch and show how much you care'
        },
        'Seasonal Specials': {
            title: 'Seasonal Specials',
            description: 'Celebrate holidays and seasons with festive gift collections and limited-time specials'
        },
        'Gift Hampers': {
            title: 'Gift Hampers',
            description: 'Curated collections of goodies in beautiful presentation - perfect for any occasion'
        }
    };
    
    return categoryMapping[category] || {
        title: category,
        description: 'Discover amazing gifts in this category'
    };
}

async function loadAndDisplayProducts(category = null) {
    showLoadingState();
    
    try {
        const allProducts = await loadProducts();
        let productsToShow = allProducts;
        
        if (category) {
            productsToShow = allProducts.filter(product => product.category === category);
        }
        
        filteredProducts = productsToShow;
        applyFiltersAndSort();
        hideLoadingState();
    } catch (error) {
        console.error('Error loading products:', error);
        hideLoadingState();
        showErrorState();
    }
}

async function loadAndDisplaySearchResults(query) {
    showLoadingState();
    
    try {
        const results = await searchProducts(query);
        filteredProducts = results;
        applyFiltersAndSort();
        hideLoadingState();
    } catch (error) {
        console.error('Error loading search results:', error);
        hideLoadingState();
        showErrorState();
    }
}

function setupFilters() {
    // Price range filters
    const priceFilters = document.querySelectorAll('input[type="checkbox"][value*="-"], input[type="checkbox"][value="100+"]');
    priceFilters.forEach(filter => {
        filter.addEventListener('change', handlePriceFilterChange);
    });
    
    // Rating filter
    const ratingFilter = document.querySelector('input[type="checkbox"][value="4+"]');
    if (ratingFilter) {
        ratingFilter.addEventListener('change', handleRatingFilterChange);
    }
    
    // Stock filter
    const stockFilter = document.querySelector('input[type="checkbox"][value="in-stock"]');
    if (stockFilter) {
        stockFilter.addEventListener('change', handleStockFilterChange);
    }
}

function setupSorting() {
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', function(e) {
            currentSort = e.target.value;
            applyFiltersAndSort();
        });
    }
}

function handlePriceFilterChange(e) {
    const priceRange = e.target.value;
    
    if (e.target.checked) {
        if (!currentFilters.priceRanges.includes(priceRange)) {
            currentFilters.priceRanges.push(priceRange);
        }
    } else {
        currentFilters.priceRanges = currentFilters.priceRanges.filter(range => range !== priceRange);
    }
    
    applyFiltersAndSort();
}

function handleRatingFilterChange(e) {
    currentFilters.rating = e.target.checked ? 4 : null;
    applyFiltersAndSort();
}

function handleStockFilterChange(e) {
    currentFilters.inStock = e.target.checked;
    applyFiltersAndSort();
}

function applyFiltersAndSort() {
    let results = [...filteredProducts];
    
    // Apply price filters
    if (currentFilters.priceRanges.length > 0) {
        results = results.filter(product => {
            return currentFilters.priceRanges.some(range => {
                const price = product.price;
                switch (range) {
                    case '0-25':
                        return price < 25;
                    case '25-50':
                        return price >= 25 && price < 50;
                    case '50-100':
                        return price >= 50 && price < 100;
                    case '100+':
                        return price >= 100;
                    default:
                        return true;
                }
            });
        });
    }
    
    // Apply rating filter
    if (currentFilters.rating) {
        results = results.filter(product => product.rating >= currentFilters.rating);
    }
    
    // Apply stock filter
    if (currentFilters.inStock) {
        results = results.filter(product => product.in_stock);
    }
    
    // Apply sorting
    results = sortProducts(results, currentSort);
    
    // Display results
    displayProducts(results, 'productGrid');
    updateResultsCount(results.length);
    updatePagination(results);
}

function sortProducts(products, sortBy) {
    const sortedProducts = [...products];
    
    switch (sortBy) {
        case 'name-asc':
            return sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        case 'name-desc':
            return sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        case 'price-asc':
            return sortedProducts.sort((a, b) => a.price - b.price);
        case 'price-desc':
            return sortedProducts.sort((a, b) => b.price - a.price);
        case 'rating-desc':
            return sortedProducts.sort((a, b) => b.rating - a.rating);
        case 'newest':
            return sortedProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        case 'featured':
        default:
            return sortedProducts.sort((a, b) => {
                if (a.featured && !b.featured) return -1;
                if (!a.featured && b.featured) return 1;
                return b.rating - a.rating;
            });
    }
}

function updateResultsCount(count) {
    const resultsCount = document.getElementById('resultsCount');
    if (resultsCount) {
        resultsCount.innerHTML = `Showing <span class="font-medium">${count}</span> result${count !== 1 ? 's' : ''}`;
    }
}

function updatePagination(products) {
    const pagination = document.getElementById('pagination');
    
    if (products.length <= itemsPerPage) {
        if (pagination) pagination.classList.add('hidden');
        return;
    }
    
    if (pagination) pagination.classList.remove('hidden');
    
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    const prevButton = document.getElementById('prevPage');
    const nextButton = document.getElementById('nextPage');
    
    // Generate page numbers
    if (pageNumbers) {
        pageNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.className = `px-3 py-2 rounded-lg transition-colors ${
                i === currentPage 
                    ? 'bg-warm-coral text-white' 
                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`;
            pageButton.onclick = () => changePage(i);
            pageNumbers.appendChild(pageButton);
        }
    }
    
    // Update navigation buttons
    if (prevButton) {
        prevButton.disabled = currentPage === 1;
        prevButton.onclick = () => changePage(currentPage - 1);
    }
    
    if (nextButton) {
        nextButton.disabled = currentPage === totalPages;
        nextButton.onclick = () => changePage(currentPage + 1);
    }
}

function changePage(page) {
    currentPage = page;
    applyFiltersAndSort();
    
    // Scroll to top of products grid
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function toggleView(view) {
    currentView = view;
    const gridView = document.getElementById('gridView');
    const listView = document.getElementById('listView');
    const productGrid = document.getElementById('productGrid');
    
    if (view === 'grid') {
        if (gridView) {
            gridView.classList.add('bg-white', 'shadow-sm');
            gridView.classList.remove('bg-transparent');
        }
        if (listView) {
            listView.classList.remove('bg-white', 'shadow-sm');
            listView.classList.add('bg-transparent');
        }
        if (productGrid) {
            productGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
        }
    } else {
        if (listView) {
            listView.classList.add('bg-white', 'shadow-sm');
            listView.classList.remove('bg-transparent');
        }
        if (gridView) {
            gridView.classList.remove('bg-white', 'shadow-sm');
            gridView.classList.add('bg-transparent');
        }
        if (productGrid) {
            productGrid.className = 'space-y-6';
        }
        
        // Re-render products in list view
        applyFiltersAndSort();
    }
}

function clearFilters() {
    // Reset filters
    currentFilters = {
        priceRanges: [],
        rating: null,
        inStock: true
    };
    
    // Reset form elements
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        if (checkbox.value === 'in-stock') {
            checkbox.checked = true;
        } else {
            checkbox.checked = false;
        }
    });
    
    // Reset sort
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = 'featured';
        currentSort = 'featured';
    }
    
    // Reset page
    currentPage = 1;
    
    // Apply filters
    applyFiltersAndSort();
}

function showLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const productGrid = document.getElementById('productGrid');
    
    if (loadingState) loadingState.classList.remove('hidden');
    if (productGrid) productGrid.classList.add('hidden');
}

function hideLoadingState() {
    const loadingState = document.getElementById('loadingState');
    const productGrid = document.getElementById('productGrid');
    
    if (loadingState) loadingState.classList.add('hidden');
    if (productGrid) productGrid.classList.remove('hidden');
}

function showErrorState() {
    const productGrid = document.getElementById('productGrid');
    if (productGrid) {
        productGrid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">Oops! Something went wrong</h3>
                <p class="text-gray-500 mb-4">We're having trouble loading the products right now.</p>
                <button onclick="location.reload()" class="bg-warm-coral text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-colors">
                    Try Again
                </button>
            </div>
        `;
    }
}

// Enhanced product card for list view
function createListProductCard(product) {
    const discountPercentage = product.on_sale && product.original_price ? 
        Math.round(((product.original_price - product.price) / product.original_price) * 100) : 0;

    return `
        <div class="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col md:flex-row">
            <div class="relative md:w-48 flex-shrink-0">
                ${product.on_sale ? `
                    <div class="absolute top-4 left-4 bg-warm-coral text-white px-3 py-1 rounded-full text-sm font-semibold z-10">
                        ${discountPercentage}% OFF
                    </div>
                ` : ''}
                <img src="${product.image_url}" alt="${product.name}" 
                     class="w-full h-48 md:h-full object-cover">
            </div>
            
            <div class="flex-1 p-6">
                <div class="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div class="flex-1">
                        <div class="flex items-start justify-between mb-2">
                            <h3 class="font-playfair text-xl font-semibold text-gray-800 leading-tight">${product.name}</h3>
                            <button onclick="toggleWishlist('${product.id}')" class="text-gray-400 hover:text-warm-coral transition-colors ml-4">
                                <i class="far fa-heart"></i>
                            </button>
                        </div>
                        
                        <p class="text-gray-600 mb-4 line-clamp-3">${product.description}</p>
                        
                        <div class="flex items-center mb-4">
                            <div class="flex items-center text-yellow-500 mr-2">
                                ${generateStarRating(product.rating)}
                            </div>
                            <span class="text-sm text-gray-500">(${product.review_count} reviews)</span>
                            <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-4">${product.category}</span>
                        </div>
                    </div>
                    
                    <div class="md:ml-6 md:text-right flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start">
                        <div class="flex items-center md:flex-col md:items-end space-x-2 md:space-x-0 mb-4">
                            <span class="text-2xl font-bold text-warm-coral">$${product.price}</span>
                            ${product.original_price && product.on_sale ? `
                                <span class="text-sm text-gray-500 line-through">$${product.original_price}</span>
                            ` : ''}
                        </div>
                        
                        <button onclick="addToCart('${product.id}')" 
                                class="bg-warm-coral text-white px-6 py-3 rounded-xl font-semibold hover:bg-opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md whitespace-nowrap ${!product.in_stock ? 'opacity-50 cursor-not-allowed' : ''}"
                                ${!product.in_stock ? 'disabled' : ''}>
                            <i class="fas fa-shopping-cart mr-2"></i>
                            ${product.in_stock ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Override displayProducts for list view
const originalDisplayProducts = window.displayProducts;
window.displayProducts = function(productsToShow, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (productsToShow.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-12">
                <i class="fas fa-search text-4xl text-gray-400 mb-4"></i>
                <h3 class="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
                <p class="text-gray-500 mb-4">Try adjusting your filters or search terms</p>
                <button onclick="clearFilters()" class="bg-warm-coral text-white px-6 py-2 rounded-full font-semibold hover:bg-opacity-90 transition-colors">
                    Clear Filters
                </button>
            </div>
        `;
        return;
    }

    // Apply pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = productsToShow.slice(startIndex, endIndex);

    if (currentView === 'list' && containerId === 'productGrid') {
        container.innerHTML = paginatedProducts.map(product => createListProductCard(product)).join('');
    } else {
        container.innerHTML = paginatedProducts.map(product => createProductCard(product)).join('');
    }
};