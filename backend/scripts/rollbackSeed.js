import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import Payment from "../src/models/Payment.js";
import VirtualClass from "../src/models/VirtualClass.js";

// Configurar dotenv
dotenv.config();

/**
 * Script de rollback para eliminar los datos creados por seedFullDataset.js
 * 
 * Este script elimina:
 * - Usuarios con emails @gmail.com (patrón usado en el seed)
 * - Pagos asociados a esos usuarios
 * - Clases virtuales con esos usuarios como participantes
 */
async function rollbackSeed() {
    try {
        // Conectar a MongoDB
        console.log("🔌 Conectando a MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado correctamente\n");

        // ==========================================
        // ELIMINAR CLASES VIRTUALES
        // ==========================================
        console.log("📚 Eliminando clases virtuales...");
        
        // Buscar usuarios con emails @gmail.com (patrón del seed)
        const seedUsers = await User.find({ email: { $regex: /@gmail\.com$/ } });
        const seedUserIds = seedUsers.map(u => u._id);
        
        if (seedUserIds.length > 0) {
            // Eliminar clases virtuales que tengan alguno de estos usuarios como participante
            const deleteClassesResult = await VirtualClass.deleteMany({
                participants: { $in: seedUserIds }
            });
            console.log(`   ✅ ${deleteClassesResult.deletedCount} clases virtuales eliminadas\n`);
        } else {
            console.log("   ℹ️  No se encontraron usuarios del seed\n");
        }

        // ==========================================
        // ELIMINAR PAGOS
        // ==========================================
        console.log("💳 Eliminando pagos...");
        
        if (seedUserIds.length > 0) {
            // Eliminar pagos donde el sender o receiver sea uno de los usuarios del seed
            const deletePaymentsResult = await Payment.deleteMany({
                $or: [
                    { sender: { $in: seedUserIds } },
                    { receiver: { $in: seedUserIds } }
                ]
            });
            console.log(`   ✅ ${deletePaymentsResult.deletedCount} pagos eliminados\n`);
        } else {
            console.log("   ℹ️  No se encontraron pagos del seed\n");
        }

        // ==========================================
        // ELIMINAR CONEXIONES DE USUARIOS EXISTENTES
        // ==========================================
        console.log("🔗 Limpiando conexiones de usuarios existentes...");
        
        if (seedUserIds.length > 0) {
            // Eliminar referencias a usuarios del seed de las conexiones de otros usuarios
            const updateResult = await User.updateMany(
                { connection: { $in: seedUserIds } },
                { $pull: { connection: { $in: seedUserIds } } }
            );
            console.log(`   ✅ ${updateResult.modifiedCount} usuarios actualizados (conexiones limpiadas)\n`);
        }

        // ==========================================
        // ELIMINAR USUARIOS DEL SEED
        // ==========================================
        console.log("👥 Eliminando usuarios del seed...");
        
        if (seedUserIds.length > 0) {
            const deleteUsersResult = await User.deleteMany({
                _id: { $in: seedUserIds }
            });
            console.log(`   ✅ ${deleteUsersResult.deletedCount} usuarios eliminados\n`);
        } else {
            console.log("   ℹ️  No se encontraron usuarios del seed para eliminar\n");
        }

        // ==========================================
        // RESUMEN FINAL
        // ==========================================
        console.log("=".repeat(50));
        console.log("🔄 Rollback completado correctamente");
        console.log("=".repeat(50));
        console.log(`📊 Resumen:`);
        console.log(`   - Usuarios eliminados: ${seedUserIds.length}`);
        console.log(`   - Pagos eliminados: ${seedUserIds.length > 0 ? (await Payment.countDocuments({ $or: [{ sender: { $in: seedUserIds } }, { receiver: { $in: seedUserIds } }] })) : 0}`);
        console.log(`   - Clases virtuales eliminadas: ${seedUserIds.length > 0 ? (await VirtualClass.countDocuments({ participants: { $in: seedUserIds } })) : 0}`);
        console.log("=".repeat(50));

        // Cerrar conexión
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error en el rollback:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Ejecutar el rollback
rollbackSeed();

