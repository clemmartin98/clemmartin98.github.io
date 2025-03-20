# Site Web de Vente de Colis de Viande Locale

Ce site web permet la vente de colis de viande locale, mettant en avant une production respectueuse de l'environnement et un circuit court entre le producteur et le consommateur.

## Fonctionnalités

- Présentation des colis de viande disponibles
- Système de réservation avec paiement d'acompte
- Suivi des réservations en temps réel
- Formulaire de contact
- Design responsive adapté à tous les appareils
- Interface moderne et intuitive

## Structure du Projet

```
viande-locale/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
└── images/
    └── hero-background.jpg
```

## Installation

1. Clonez ce dépôt sur votre serveur web
2. Ajoutez une image d'arrière-plan pour la section hero dans le dossier `images/` nommée `hero-background.jpg`
3. Configurez les informations de contact dans le fichier `index.html`
4. Personnalisez les couleurs et le style dans `css/style.css` si nécessaire

## Personnalisation

### Modification des prix

Pour modifier les prix et l'acompte, éditez les valeurs dans le fichier `js/main.js` :

```javascript
const state = {
    totalColis: 40,
    reservedColis: 0,
    pricePerColis: 250,
    depositAmount: 50
};
```

### Modification des textes

Les textes peuvent être modifiés directement dans le fichier `index.html`.

### Modification du style

Les couleurs principales du site sont définies dans les variables CSS au début du fichier `css/style.css` :

```css
:root {
    --primary-color: #2c5530;
    --secondary-color: #8bc34a;
    --text-color: #333;
    --background-color: #f9f9f9;
}
```

## Intégration du Paiement

Le système de paiement est actuellement simulé. Pour intégrer un véritable système de paiement :

1. Choisissez un prestataire de paiement (Stripe, PayPal, etc.)
2. Intégrez l'API de paiement dans la fonction `reserverColis()` du fichier `js/main.js`
3. Gérez les callbacks de succès/échec du paiement

## Maintenance

Pour maintenir le site à jour :

1. Mettez à jour régulièrement les informations de contact
2. Vérifiez que le système de réservation fonctionne correctement
3. Assurez-vous que les images sont optimisées pour le web
4. Testez régulièrement le formulaire de contact

## Support

Pour toute question ou assistance, contactez le développeur via le formulaire de contact du site. 