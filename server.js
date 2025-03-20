const express = require('express');
const stripe = require('stripe')('sk_test_51R4kncKNrGQwEwkAm67dRJB4OPnNEXs1Gnze26IwO64SKriy61wWyRAWmsYN75wvfDVcIg6KBg7RcsQbQIAxeYTB00V9IZ022H'); // Remplacez par votre clé secrète de test
const app = express();

// Middleware pour servir les fichiers statiques
app.use(express.static('.'));
app.use(express.json());

// Endpoint pour créer une session de paiement
app.post('/create-payment-session', async (req, res) => {
    try {
        const { items } = req.body;

        // Validation des données reçues
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                error: 'Données invalides',
                details: 'Le panier est vide ou mal formaté'
            });
        }

        // Créer les line_items pour Stripe
        const line_items = items.map(item => {
            // Validation des données de l'article
            if (!item.type || typeof item.price !== 'number' || typeof item.deposit !== 'number' || typeof item.quantity !== 'number') {
                throw new Error('Données d\'article invalides');
            }

            // Déterminer le poids en fonction du type
            const weights = {
                'petit': '5',
                'moyen': '10',
                'grand': '15',
                'stock': '25'
            };

            const weight = weights[item.type] || '?';

            // Formater la description avec des retours à la ligne
            const description = [
                '🌱 Production locale et responsable'
            ].join('\n');

            return {
                price_data: {
                    currency: 'eur',
                    product_data: {
                        name: `Acompte Colis ${item.type.charAt(0).toUpperCase() + item.type.slice(1)}`,
                        description: description,
                        images: ['https://images.unsplash.com/photo-1551028150-64b9f398f678'],
                        metadata: {
                            weight: `${weight}kg`,
                            delivery_date: 'Juin 2024',
                            farm_location: 'Ferme locale',
                            type: 'Bœuf'
                        }
                    },
                    unit_amount: Math.round(item.deposit * 100),
                },
                quantity: item.quantity
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['bancontact'],
            line_items: line_items,
            mode: 'payment',
            locale: 'fr',
            payment_intent_data: {
                description: 'Acompte pour colis de viande - Livraison Juin 2024',
                metadata: {
                    order_type: 'deposit',
                    delivery_date: 'Juin 2024'
                }
            },
            custom_text: {
                submit: {
                    message: 'En payant cet acompte, vous réservez votre colis de viande dont la livraison sera déterminée une fois l\'entièreté de la vahce vendue. Le solde sera à régler à la livraison.'
                }
            },
            success_url: `${req.headers.origin}/?payment=success`,
            cancel_url: `${req.headers.origin}/?payment=cancelled`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Erreur Stripe:', error);
        res.status(500).json({
            error: 'Erreur lors de la création de la session de paiement',
            details: error.message
        });
    }
});

const port = 8000;
app.listen(port, () => {
    console.log(`Serveur démarré sur le port ${port}`);
}); 