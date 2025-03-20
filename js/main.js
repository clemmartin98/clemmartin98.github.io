// Configuration Stripe
const stripe = Stripe('pk_test_51R4kncKNrGQwEwkAxxrVv3HFTWbdz3AY2nY7m2ORwQqViHUVFCsVseBigmSSQKIJ2NfZgl70IBh6wiSBxeaDAS8M006jAFeCYf');

// État de l'application
const state = {
    totalWeight: 400, // Poids total disponible en kg
    reservedWeight: 0, // Poids total réservé en kg
    cart: [],
    cartOpen: false
};

// Charger l'état initial depuis le localStorage
function loadInitialState() {
    const savedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    state.cart = savedCart;
    state.reservedWeight = calculateReservedWeight();
    updateCartUI();
    updateProgressBar();
}

// Navigation fluide
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Mise à jour de la barre de progression
function updateProgressBar() {
    const progressBar = document.getElementById('progress-bar');
    const reservedWeightElement = document.getElementById('reserved-weight');
    const totalWeightElement = document.getElementById('total-weight');
    
    if (!progressBar || !reservedWeightElement || !totalWeightElement) return;
    
    // Mise à jour des éléments textuels
    reservedWeightElement.textContent = state.reservedWeight;
    totalWeightElement.textContent = state.totalWeight;
    
    // Calcul et mise à jour de la largeur de la barre de progression
    const progressPercentage = (state.reservedWeight / state.totalWeight) * 100;
    progressBar.style.width = `${Math.min(progressPercentage, 100)}%`;
}

function calculateReservedWeight() {
    let totalWeight = 0;
    const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    cartItems.forEach(item => {
        const itemWeight = getItemWeight(item.type);
        totalWeight += itemWeight * item.quantity;
    });
    
    return totalWeight;
}

function getItemWeight(type) {
    const weights = {
        'petit': 5,    // 5kg
        'moyen': 10,   // 10kg
        'grand': 15,   // 15kg
        'stock': 25    // 25kg
    };
    return weights[type] || 0;
}

// Gestion du panier
function addToCart(type, price, deposit) {
    // Déterminer le poids en fonction du type de colis
    const weights = {
        'petit': 5,
        'moyen': 10,
        'grand': 15,
        'stock': 25
    };
    
    const weight = weights[type];
    
    // Vérifier si l'ajout dépasserait le poids total disponible
    const newTotalWeight = state.reservedWeight + weight;
    if (newTotalWeight > state.totalWeight) {
        alert('Désolé, il ne reste pas assez de poids disponible pour ce colis.');
        return;
    }

    const item = {
        type,
        price,
        deposit,
        weight,
        quantity: 1
    };

    const existingItem = state.cart.find(i => i.type === type);
    if (existingItem) {
        // Vérifier si l'augmentation de quantité est possible
        if (state.reservedWeight + weight <= state.totalWeight) {
            existingItem.quantity++;
            state.reservedWeight += weight;
        } else {
            alert('Désolé, il ne reste pas assez de poids disponible pour un colis supplémentaire.');
            return;
        }
    } else {
        state.cart.push(item);
        state.reservedWeight += weight;
    }

    updateCartUI();
    updateProgressBar();
    toggleCart(true);
}

function removeFromCart(type) {
    const item = state.cart.find(i => i.type === type);
    if (item) {
        state.reservedWeight -= item.weight * item.quantity;
    }
    state.cart = state.cart.filter(item => item.type !== type);
    updateCartUI();
    updateProgressBar();
}

function updateQuantity(type, delta) {
    const item = state.cart.find(i => i.type === type);
    if (item) {
        const newQuantity = item.quantity + delta;
        const weightDifference = item.weight * delta;
        
        if (newQuantity <= 0) {
            removeFromCart(type);
            return;
        }
        
        // Vérifier si le changement de quantité est possible
        if (state.reservedWeight + weightDifference > state.totalWeight && delta > 0) {
            alert('Désolé, il ne reste pas assez de poids disponible pour un colis supplémentaire.');
            return;
        }
        
        item.quantity = newQuantity;
        state.reservedWeight += weightDifference;
        updateCartUI();
        updateProgressBar();
    }
}

function updateCartUI() {
    // Sauvegarder le panier dans le localStorage
    localStorage.setItem('cartItems', JSON.stringify(state.cart));
    
    // Mettre à jour le compteur
    const cartCount = document.querySelector('.cart-count');
    const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Mettre à jour les articles
    const cartItems = document.querySelector('.cart-items');
    cartItems.innerHTML = state.cart.map(item => `
        <div class="cart-item">
            <div>
                <h4>Colis ${item.type}</h4>
                <div class="quantity-controls">
                    <button onclick="updateQuantity('${item.type}', -1)" class="quantity-btn">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button onclick="updateQuantity('${item.type}', 1)" class="quantity-btn">+</button>
                </div>
            </div>
            <div class="cart-item-price">
                <p>${item.price}€</p>
                <p class="deposit-info">Acompte: ${item.deposit}€</p>
                <button onclick="removeFromCart('${item.type}')" class="button secondary">Supprimer</button>
            </div>
        </div>
    `).join('');

    // Mettre à jour les totaux
    const total = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deposit = state.cart.reduce((sum, item) => sum + (item.deposit * item.quantity), 0);
    
    document.querySelector('.cart-total-amount').textContent = `${total}€`;
    document.querySelector('.cart-deposit-amount').textContent = `${deposit}€`;
}

function toggleCart(open = null) {
    const cartPanel = document.querySelector('.cart-panel');
    state.cartOpen = open !== null ? open : !state.cartOpen;
    cartPanel.classList.toggle('open', state.cartOpen);
}

async function checkout() {
    if (state.cart.length === 0) {
        alert('Votre panier est vide');
        return;
    }

    try {
        const response = await fetch('/create-payment-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                items: state.cart.map(item => ({
                    type: item.type,
                    price: parseFloat(item.price),
                    deposit: parseFloat(item.deposit),
                    quantity: parseInt(item.quantity)
                }))
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.details || 'Erreur lors de la création de la session de paiement');
        }

        const session = await response.json();
        const result = await stripe.redirectToCheckout({
            sessionId: session.id
        });

        if (result.error) {
            throw new Error(result.error.message);
        }

    } catch (error) {
        console.error('Erreur:', error);
        alert(error.message || 'Une erreur est survenue lors de la réservation. Veuillez réessayer.');
    }
}

// Gestion du formulaire de contact
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Simuler l'envoi du formulaire
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Envoi en cours...';
            submitButton.disabled = true;

            // Simulation d'envoi (à remplacer par votre logique d'envoi réelle)
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert('Message envoyé avec succès !');
            form.reset();

            submitButton.textContent = originalText;
            submitButton.disabled = false;
        });
    }
}

// Gestion du header au scroll
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    loadInitialState();
    initSmoothScroll();
    initContactForm();
}); 