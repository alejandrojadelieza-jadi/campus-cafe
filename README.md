# Campus Cafeteria POS

A self-order kiosk web app for a campus cafeteria. Plain HTML, CSS and JavaScript: no frameworks, no build step, no backend.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure for all kiosk screens |
| `style.css` | Green kiosk theme and responsive layout |
| `script.js` | Menu data, cart logic, screen flow, receipt |

## Run it

Keep the three files in the same folder and open `index.html` in any modern browser. For kiosk use, open it full screen (F11).

## Screen flow

Welcome → Dine In / Take Out → Item Selection → Order Summary → Payment Method → Payment Processing → Payment Successful → Receipt → New Transaction

## Features

- Pulsing "TAP TO ORDER" welcome screen
- Dine In / Take Out choice, shown in the cart, summary and receipt
- Category sidebar: Rice (Plain), Fried Chicken (1pc), Pork Adobo, Vegetable Side Dish, Iced Tea (cup), Bottled Water
- 20 products as photo cards. Tap a card to add it, then use the − qty + stepper
- Always-visible cart with unit price, quantity controls, remove button, subtotal, VAT (12%) and total
- Quantity limited to 0–99 (setting it to 0 removes the item)
- "Proceed to Payment" is blocked with a message when the cart is empty
- "Cancel Order" button with confirmation, available on the menu, summary and payment screens
- Payment methods: Cash, Card, E-Wallet (all simulated, no real payments)
- Printable receipt with order number
- Inactivity warning after 90 seconds, then the order is cancelled
- Receipt screen returns to the start automatically after 60 seconds

## Customize

All settings are at the top of `script.js`:

- `PRODUCTS`: names, descriptions and prices (in pesos, before VAT)
- `CATS`: category names and icons
- `VAT_RATE`: tax rate (default 0.12)
- `IDLE_MS`, `IDLE_WARN_S`, `SUCCESS_S`, `RECEIPT_S`: timers
- `PHOTO`: image sources

## Photos

- Fried chicken and iced tea load from Wikimedia Commons. Check each file's licence on Commons before commercial use.
- Rice, pork adobo, chopsuey, pinakbet, ginisang gulay and bottled water load from the image links set in the `PHOTO` table in `script.js`.
- All photos load online, so an internet connection is needed. If a photo fails to load, the card shows a green emoji tile instead.
- To change a photo, replace its link (or a local path such as `images/rice.jpg`) in the `PHOTO` table.

## Notes

- Order numbers run from #101 to #999 and are remembered in the browser's `localStorage`.
- Payments are simulated. To accept real payments you would need to integrate a payment terminal or gateway and a backend.
