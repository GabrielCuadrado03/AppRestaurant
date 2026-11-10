import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger ejecutado cuando una orden pasa a estado 'PAID'
 * Actualiza de forma atómica:
 * 1. totalSold en cada producto (/products/{productId})
 * 2. Métricas del día (/daily_analytics/{YYYY-MM-DD}) gastando escrituras atómicas
 * 3. Perfil del cliente (/customers/{customerPhone})
 */
export const onOrderPaid = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Solo reaccionar cuando el estado cambia a 'PAID'
    if (beforeData.status === 'PAID' || afterData.status !== 'PAID') {
      return null;
    }

    const orderId = context.params.orderId;
    const orderTotal = Number(afterData.total || 0);
    const items = afterData.items || [];
    const customerPhone = afterData.customerPhone || afterData.customerId;

    // Obtener fecha en formato YYYY-MM-DD
    const orderDate = afterData.createdAt?.toDate ? afterData.createdAt.toDate() : new Date();
    const year = orderDate.getFullYear();
    const month = String(orderDate.getMonth() + 1).padStart(2, '0');
    const day = String(orderDate.getDate()).padStart(2, '0');
    const dateDocId = `${year}-${month}-${day}`;
    const orderHour = orderDate.getHours();

    const batch = db.batch();

    // 1. Incrementar ventas de productos de forma atómica
    const productSoldQuantities: Record<string, { name: string; quantity: number; revenue: number }> = {};

    for (const item of items) {
      // Ignorar ítems anulados
      if (item.status === 'VOIDED') continue;

      const pId = item.productId;
      const qty = Number(item.quantity || 1);
      const unitPrice = Number(item.unitPrice || 0);

      if (pId) {
        const prodRef = db.collection('products').doc(pId);
        batch.update(prodRef, {
          totalSold: admin.firestore.FieldValue.increment(qty),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        if (!productSoldQuantities[pId]) {
          productSoldQuantities[pId] = {
            name: item.productName || 'Producto',
            quantity: 0,
            revenue: 0
          };
        }
        productSoldQuantities[pId].quantity += qty;
        productSoldQuantities[pId].revenue += qty * unitPrice;
      }
    }

    // 2. Actualizar o inicializar el documento diario en /daily_analytics/{YYYY-MM-DD}
    const dailyRef = db.collection('daily_analytics').doc(dateDocId);
    const dailySnap = await dailyRef.get();

    if (!dailySnap.exists) {
      // Inicializar el día
      const hourlySales = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        revenue: i === orderHour ? orderTotal : 0,
        orderCount: i === orderHour ? 1 : 0
      }));

      const topProducts = Object.entries(productSoldQuantities).map(([productId, val]) => ({
        productId,
        productName: val.name,
        quantitySold: val.quantity,
        revenue: val.revenue
      }));

      batch.set(dailyRef, {
        id: dateDocId,
        date: dateDocId,
        totalRevenue: orderTotal,
        totalOrders: 1,
        averageTicket: orderTotal,
        topProducts,
        hourlySales,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    } else {
      const dailyData = dailySnap.data()!;
      const currentRevenue = Number(dailyData.totalRevenue || 0) + orderTotal;
      const currentOrders = Number(dailyData.totalOrders || 0) + 1;
      const averageTicket = currentRevenue / currentOrders;

      // Actualizar hora pico
      const hourlySales = dailyData.hourlySales || Array.from({ length: 24 }, (_, i) => ({ hour: i, revenue: 0, orderCount: 0 }));
      if (hourlySales[orderHour]) {
        hourlySales[orderHour].revenue += orderTotal;
        hourlySales[orderHour].orderCount += 1;
      }

      // Actualizar Top Productos del día
      const currentTop: Array<{ productId: string; productName: string; quantitySold: number; revenue: number }> = dailyData.topProducts || [];
      const topMap: Record<string, { productName: string; quantitySold: number; revenue: number }> = {};
      currentTop.forEach((p) => {
        topMap[p.productId] = { productName: p.productName, quantitySold: p.quantitySold, revenue: p.revenue };
      });

      Object.entries(productSoldQuantities).forEach(([pId, val]) => {
        if (!topMap[pId]) {
          topMap[pId] = { productName: val.name, quantitySold: val.quantity, revenue: val.revenue };
        } else {
          topMap[pId].quantitySold += val.quantity;
          topMap[pId].revenue += val.revenue;
        }
      });

      const updatedTopProducts = Object.entries(topMap)
        .map(([pId, val]) => ({
          productId: pId,
          productName: val.productName,
          quantitySold: val.quantitySold,
          revenue: val.revenue
        }))
        .sort((a, b) => b.quantitySold - a.quantitySold)
        .slice(0, 10);

      batch.update(dailyRef, {
        totalRevenue: admin.firestore.FieldValue.increment(orderTotal),
        totalOrders: admin.firestore.FieldValue.increment(1),
        averageTicket,
        hourlySales,
        topProducts: updatedTopProducts,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }

    // 3. Actualizar el acumulado del cliente en /customers/{customerPhone}
    if (customerPhone) {
      const customerRef = db.collection('customers').doc(customerPhone);
      const customerSnap = await customerRef.get();

      const favoriteProductIds = Object.keys(productSoldQuantities);

      if (!customerSnap.exists) {
        batch.set(customerRef, {
          id: customerPhone,
          phone: customerPhone,
          name: afterData.customerName || 'Cliente Restaurante',
          totalOrders: 1,
          totalSpent: orderTotal,
          firstVisit: orderDate,
          lastVisit: orderDate,
          favoriteProducts: favoriteProductIds,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      } else {
        const custData = customerSnap.data()!;
        const existingFavorites: string[] = custData.favoriteProducts || [];
        const mergedFavorites = Array.from(new Set([...existingFavorites, ...favoriteProductIds]));

        batch.update(customerRef, {
          totalOrders: admin.firestore.FieldValue.increment(1),
          totalSpent: admin.firestore.FieldValue.increment(orderTotal),
          lastVisit: orderDate,
          favoriteProducts: mergedFavorites,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    await batch.commit();
    functions.logger.info(`Orden ${orderId} procesada exitosamente con métricas atómicas.`);
    return { success: true, orderId };
  });

/**
 * Callable Function que convierte un pedido anónimo en un cliente registrado
 * y le transfiere el historial de comanda
 */
export const convertAnonymousCustomer = functions.https.onCall(async (data, context) => {
  const { orderId, name, phone } = data;

  if (!orderId || !phone) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Debes proveer orderId y número de teléfono (phone).'
    );
  }

  const orderRef = db.collection('orders').doc(orderId);
  const orderSnap = await orderRef.get();

  if (!orderSnap.exists) {
    throw new functions.https.HttpsError('not-found', 'Orden no encontrada.');
  }

  const orderData = orderSnap.data()!;
  const customerRef = db.collection('customers').doc(phone);
  const customerSnap = await customerRef.get();

  const batch = db.batch();

  // 1. Actualizar orden con el teléfono y nombre del cliente
  batch.update(orderRef, {
    customerPhone: phone,
    customerId: phone,
    customerName: name || 'Cliente Registrado',
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  });

  const orderTotal = Number(orderData.total || 0);
  const items = orderData.items || [];
  const productIds = items.filter((i: any) => i.status !== 'VOIDED').map((i: any) => i.productId);

  // 2. Crear o actualizar el perfil en /customers
  if (!customerSnap.exists) {
    batch.set(customerRef, {
      id: phone,
      name: name || 'Cliente Registrado',
      phone,
      totalOrders: 1,
      totalSpent: orderTotal,
      firstVisit: orderData.createdAt || admin.firestore.FieldValue.serverTimestamp(),
      lastVisit: admin.firestore.FieldValue.serverTimestamp(),
      favoriteProducts: productIds,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } else {
    const existingData = customerSnap.data()!;
    const existingFavorites: string[] = existingData.favoriteProducts || [];
    const mergedFavorites = Array.from(new Set([...existingFavorites, ...productIds]));

    batch.update(customerRef, {
      name: name || existingData.name,
      totalOrders: admin.firestore.FieldValue.increment(1),
      totalSpent: admin.firestore.FieldValue.increment(orderTotal),
      lastVisit: admin.firestore.FieldValue.serverTimestamp(),
      favoriteProducts: mergedFavorites,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  await batch.commit();

  return {
    success: true,
    message: `Historial de la orden ${orderId} transferido correctamente a ${phone}.`
  };
});
