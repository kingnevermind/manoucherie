# Readme

A static mobile web application for tracking remaining beers and calculating the cost of consumed beers.

## Current inventory

- 22 products and 46 units.
- Initial value: EUR 145.85, excluding bottle deposits.
- Prices are stored as integer cents per unit.

## Usage

- Use minus after drinking a beer and plus to correct the remaining quantity.
- Changes are saved automatically in this browser on this device.
- Export a JSON backup regularly and transfer it to Proton Drive manually if desired.
- Restore a JSON backup to replace current quantities after confirmation.
- Reset restores all products to their initial quantities after confirmation.
- There is no automatic cloud backup or synchronization between devices.

## Updating the inventory

Edit `inventory.json` and add an object for each new product:

```json
{
  "id": 23,
  "name": "Example Beer 33 cl",
  "initial": 4,
  "priceCents": 320
}
```

- Use a unique positive integer ID. Never reuse an old ID for another product.
- Use a non-empty name and non-negative integer quantities and prices.
- Separate objects with commas; do not add a comma after the final object.
- Existing saved quantities are preserved by ID. New products start at their initial quantity.
- Removed products are ignored. Quantities above a reduced initial stock are capped at that stock.
- Older JSON backups follow the same rules when restored.
- Changing initial quantities does not track restocking or historical consumption separately.
- Update the initial summary in `index.html` and the inventory totals in this document.
  Runtime totals are calculated from `inventory.json`.

## Hosting and offline use

Serve all files together through HTTP for local use or HTTPS for hosted use. Opening `index.html`
directly from the filesystem is not supported because the inventory is loaded with `fetch`.
For example, run `python3 -m http.server 8000` and open `http://localhost:8000`.

For GitHub Pages, publish the repository root containing `index.html`. Open the hosted URL on Android
and use the browser's install or add-to-home-screen action if available.

Open the application online first and allow its resources to finish caching before using it offline.
Online requests refresh application resources; offline requests use the cached copy.
After upgrading from the original cache-first version, reopen or reload the application online once
more after the new service worker activates to load the refreshed application.

Browser storage can be cleared independently of the installed application. Keep exported backups.
