# Bibliothèque API - NestJS

## Installation

1. Cloner le projet
2. `npm install`
3. `cp .env.example .env`
4. Configurer les clés API dans `.env`
5. `npm run start:dev`

## Endpoints API

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/register` | Inscription | Non |
| POST | `/api/auth/login` | Connexion | Non |
| GET | `/api/v1/books/{id}/summary` | Voir résumé | Non |
| POST | `/api/v1/books/{id}/summary` | Générer résumé | Oui |
| POST | `/api/v1/books/smart-search` | Recherche IA | Non |
| POST | `/api/v1/subscriptions/payment-intent` | Paiement Stripe | Oui |
| GET | `/api/v1/subscriptions/status` | Statut abonnement | Oui |
| POST | `/api/v1/webhooks/stripe` | Webhook Stripe | Non |

## Documentation Swagger

http://localhost:3000/api/docs

## Tests

Importer la collection Postman `collection_bibliotheque_v2.json`