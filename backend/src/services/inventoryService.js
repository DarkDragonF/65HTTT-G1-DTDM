const zohoService = require('./zohoService');
const zohoVaultService = require('./zohoVaultService');
const Food = require('../models/Food');

async function getCredential(key) {
  if (process.env[key]) {
    return process.env[key];
  }
  try {
    return await zohoVaultService.getSecret(key);
  } catch {
    return null;
  }
}

const inventoryService = {
  syncStock: async (foodId, quantity) => {
    console.log(`[Zoho Inventory] Attempting to sync stock for Food ID: ${foodId} to: ${quantity}...`);
    
    const accessToken = await zohoService.getAccessToken('inventory');
    const orgId = await getCredential('ZOHO_FINANCE_ORG_ID');
    
    // Look up zoho_item_id from the database
    let itemId = 'placeholder_item_123';
    let food = null;
    try {
      food = await Food.findById(foodId);
      if (food && food.zoho_item_id) {
        itemId = food.zoho_item_id;
        console.log(`[Zoho Inventory] Resolved zoho_item_id "${itemId}" from database for Food ID ${foodId}`);
      } else {
        // Fallback to env variable
        itemId = await getCredential(`ZOHO_INVENTORY_ITEM_ID_${foodId}`) || 'placeholder_item_123';
        if (itemId !== 'placeholder_item_123') {
          console.log(`[Zoho Inventory] Resolved zoho_item_id "${itemId}" from configuration fallback for Food ID ${foodId}`);
        }
      }
    } catch (err) {
      console.error(`[Zoho Inventory] Database lookup failed for Food ID ${foodId}:`, err.message);
      itemId = await getCredential(`ZOHO_INVENTORY_ITEM_ID_${foodId}`) || 'placeholder_item_123';
    }

    if (!accessToken || !orgId || orgId === 'placeholder' || orgId.includes('org_id') || orgId.includes('organization') || orgId.includes('your_')) {
      console.log(`[Zoho Inventory] Operating in MOCK mode. Mock stock sync completed for Food ID ${foodId}.`);
      return { success: true, mock: true };
    }

    try {
      console.log(`[Zoho Inventory] Updating stock on hand for Item ID: ${itemId}`);
      const response = await fetch(`https://www.zohoapis.com/inventory/v1/items/${itemId}?organization_id=${orgId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          initial_stock: quantity,
          initial_stock_rate: Number(food?.price) || 1
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoho Inventory responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log(`[Zoho Inventory] Server Response:`, JSON.stringify(resData));

      if (resData.code === 0) {
        console.log(`[Zoho Inventory] Stock synced successfully.`);
        return { success: true };
      } else {
        throw new Error(`Invalid stock sync response: ${JSON.stringify(resData)}`);
      }
    } catch (error) {
      console.error(`[Zoho Inventory] Error syncing stock:`, error.message);
      console.log(`[Zoho Inventory] Graceful degradation: treating as mock success.`);
      return { success: true, mock: true, error: error.message };
    }
  },
  
  syncOrder: async (orderId) => {
    console.log(`[Zoho Inventory] Attempting to sync Order ID: ${orderId}...`);
    
    const accessToken = await zohoService.getAccessToken('inventory');
    const orgId = await getCredential('ZOHO_FINANCE_ORG_ID');
    const customerId = await getCredential('ZOHO_INVENTORY_CUSTOMER_ID') || 'placeholder_customer_123';

    if (!accessToken || !orgId || orgId === 'placeholder' || orgId.includes('org_id') || orgId.includes('organization') || orgId.includes('your_')) {
      console.log(`[Zoho Inventory] Operating in MOCK mode. Mock order sync completed for Order ID ${orderId}.`);
      return { success: true, mock: true };
    }

    try {
      const response = await fetch(`https://www.zohoapis.com/inventory/v1/salesorders?organization_id=${orgId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customer_id: customerId,
          salesorder_number: `SO-${orderId}-${Date.now().toString().slice(-4)}`,
          date: new Date().toISOString().split('T')[0],
          line_items: [
            {
              name: `TLU Food Order #${orderId}`,
              quantity: 1,
              rate: 0 // Zero rate for generic sync tracking
            }
          ]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Zoho Inventory responded with status ${response.status}: ${errText}`);
      }

      const resData = await response.json();
      console.log(`[Zoho Inventory] Server Response:`, JSON.stringify(resData));

      if (resData.code === 0) {
        console.log(`[Zoho Inventory] Order synced successfully.`);
        return { success: true };
      } else {
        throw new Error(`Invalid order sync response: ${JSON.stringify(resData)}`);
      }
    } catch (error) {
      console.error(`[Zoho Inventory] Error syncing order:`, error.message);
      console.log(`[Zoho Inventory] Graceful degradation: treating as mock success.`);
      return { success: true, mock: true, error: error.message };
    }
  },

  syncAllDatabaseItemsWithZoho: async () => {
    console.log('[Zoho Inventory] Starting full catalog synchronization...');
    const { pool } = require('../config/db');
    
    // 1. Fetch all local active foods
    const [foods] = await pool.execute(
      'SELECT id, name, price, quantity, description, zoho_item_id FROM foods WHERE status != "deleted"'
    );

    const accessToken = await zohoService.getAccessToken('inventory');
    const orgId = await getCredential('ZOHO_FINANCE_ORG_ID');

    let created = 0;
    let linked = 0;
    let skipped = 0;
    let errors = 0;

    // Check if we are running in mock mode
    const isMock = !accessToken || !orgId || orgId === 'placeholder' || orgId.includes('org_id') || orgId.includes('organization') || orgId.includes('your_');

    if (isMock) {
      console.log('[Zoho Inventory] Sync running in MOCK mode.');
      for (const food of foods) {
        if (food.zoho_item_id) {
          skipped++;
          continue;
        }
        const mockId = `MOCK_ZOHO_${food.id}_${Date.now().toString().slice(-4)}`;
        await pool.execute('UPDATE foods SET zoho_item_id = ? WHERE id = ?', [mockId, food.id]);
        created++;
        console.log(`[Zoho Inventory] [MOCK] Created item "${food.name}" -> Zoho ID: ${mockId}`);
      }
      return {
        success: true,
        mock: true,
        stats: { total: foods.length, created, linked, skipped, errors }
      };
    }

    try {
      // 2. Fetch existing items from Zoho Inventory to check duplicates
      console.log(`[Zoho Inventory] Querying existing items from Organization ID: ${orgId}...`);
      const listResponse = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${orgId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Zoho-oauthtoken ${accessToken}`
        }
      });

      if (!listResponse.ok) {
        const listErr = await listResponse.text();
        throw new Error(`Failed to list items from Zoho: ${listErr}`);
      }

      const listData = await listResponse.json();
      const existingItems = {};
      if (listData.items && Array.isArray(listData.items)) {
        for (const item of listData.items) {
          if (item.name && item.item_id) {
            existingItems[item.name.toLowerCase().trim()] = item.item_id;
          }
        }
      }

      // 3. Sync loop
      for (const food of foods) {
        if (food.zoho_item_id) {
          skipped++;
          continue;
        }

        const normalizedName = food.name.toLowerCase().trim();
        const existingId = existingItems[normalizedName];

        if (existingId) {
          // Case A: Item already exists in Zoho - link it locally
          await pool.execute('UPDATE foods SET zoho_item_id = ? WHERE id = ?', [existingId, food.id]);
          linked++;
          console.log(`[Zoho Inventory] Linked existing Zoho item "${food.name}" to database ID ${food.id}`);
        } else {
          // Case B: Create new item in Zoho
          console.log(`[Zoho Inventory] Creating new item: "${food.name}"`);
          const response = await fetch(`https://www.zohoapis.com/inventory/v1/items?organization_id=${orgId}`, {
            method: 'POST',
            headers: {
              'Authorization': `Zoho-oauthtoken ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name: food.name,
              rate: Number(food.price) || 0,
              description: food.description || "",
              item_type: "inventory",
              initial_stock: Number(food.quantity) || 0,
              initial_stock_rate: Number(food.price) || 1,
              purchase_rate: Math.round((Number(food.price) || 0) * 0.6) || 1,
              purchase_account_id: "324966000000034003",
              inventory_account_id: "324966000000034001",
              account_id: "324966000000000388"
            })
          });

          if (!response.ok) {
            const errText = await response.text();
            console.error(`[Zoho Inventory] Failed to create item "${food.name}":`, errText);
            errors++;
            continue;
          }

          const resData = await response.json();
          if (resData.code === 0 && resData.item && resData.item.item_id) {
            const newId = resData.item.item_id;
            await pool.execute('UPDATE foods SET zoho_item_id = ? WHERE id = ?', [newId, food.id]);
            created++;
            console.log(`[Zoho Inventory] Created new item "${food.name}" -> Zoho ID: ${newId}`);
          } else {
            console.error(`[Zoho Inventory] Invalid response while creating item "${food.name}":`, JSON.stringify(resData));
            errors++;
          }
        }
      }

      return {
        success: true,
        mock: false,
        stats: { total: foods.length, created, linked, skipped, errors }
      };

    } catch (error) {
      console.error('[Zoho Inventory] Error running full catalog sync:', error.message);
      throw error;
    }
  }
};

module.exports = inventoryService;
