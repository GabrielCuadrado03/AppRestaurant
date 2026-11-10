/**
 * Script de Asignación de Claim Superadmin / Master Admin
 * Ejecutable mediante: npx ts-node scripts/setMasterAdmin.ts <TARGET_UID>
 * o configurando la variable de entorno MASTER_ADMIN_UID.
 */
import * as admin from 'firebase-admin';

// Inicialización de Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } catch (e) {
    // Si no hay application default, intentar inicialización por defecto
    admin.initializeApp();
  }
}

async function setMasterAdminClaims() {
  const targetUid = process.argv[2] || process.env.MASTER_ADMIN_UID;

  if (!targetUid) {
    console.error('\n❌ ERROR: Debes proporcionar el UID de Firebase Auth al que deseas asignar los privilegios.');
    console.error('Uso: npx ts-node scripts/setMasterAdmin.ts <TARGET_UID>');
    console.error('O define: export MASTER_ADMIN_UID="tu-uid-aqui"\n');
    process.exit(1);
  }

  try {
    console.log(`\n🔍 Verificando usuario con UID: ${targetUid}...`);
    const user = await admin.auth().getUser(targetUid);
    console.log(`✅ Usuario encontrado: ${user.email || user.displayName || user.uid}`);

    const masterClaims = {
      masterAdmin: true,
      admin: true,
      staff: true
    };

    console.log('⚡ Asignando Custom Claims irreversibles:', masterClaims);
    await admin.auth().setCustomUserClaims(targetUid, masterClaims);

    // Confirmar verificación leyendo el usuario de nuevo
    const updatedUser = await admin.auth().getUser(targetUid);
    console.log('\n======================================================');
    console.log('🎉 PRIVILEGIOS MASTER ASIGNADOS CON ÉXITO');
    console.log('======================================================');
    console.log('UID:          ', updatedUser.uid);
    console.log('Email:        ', updatedUser.email);
    console.log('Custom Claims:', updatedUser.customClaims);
    console.log('======================================================');
    console.log('⚠️ IMPORTANTE: El usuario debe forzar el refresco de su token');
    console.log('en el cliente ejecutando: await user.getIdToken(true);\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Error al asignar Custom Claims:', error.message || error);
    process.exit(1);
  }
}

setMasterAdminClaims();
