import mongoose from "mongoose";
import dotenv from "dotenv";
import { faker } from "@faker-js/faker";
import User from "../src/models/User.js";
import Role from "../src/models/Role.js";
import Location from "../src/models/Location.js";
import Language from "../src/models/Language.js";
import Subject from "../src/models/Subject.js";
import Payment from "../src/models/Payment.js";
import VirtualClass from "../src/models/VirtualClass.js";
import { upsertStreamUser } from "../src/lib/stream.js";

// Configurar dotenv
dotenv.config();

/**
 * Normaliza un nombre completo a un email válido
 * - Convierte a minúsculas
 * - Elimina tildes y acentos
 * - Elimina espacios completamente
 * - Ejemplo: "José Pérez" -> "joseperez@gmail.com"
 */
function normalizeEmail(fullName) {
    return fullName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Elimina tildes
        .replace(/\s+/g, "") // Elimina espacios completamente
        .replace(/[^a-z0-9]/g, "") // Elimina caracteres especiales
        + "@gmail.com";
}

/**
 * Genera una bio en HTML para profesores
 */
function generateProfessorBio() {
    const horarios = [
        "Lunes a Viernes: 9:00 - 18:00",
        "Lunes a Jueves: 10:00 - 19:00",
        "Martes y Jueves: 14:00 - 20:00",
        "Lunes, Miércoles y Viernes: 8:00 - 17:00",
        "Fines de semana: 10:00 - 15:00"
    ];
    
    const metodologias = [
        "clases personalizadas adaptadas a las necesidades de cada estudiante",
        "metodología activa con ejercicios prácticos y ejemplos reales",
        "enfoque integral que combina teoría y práctica",
        "técnicas de estudio innovadoras y recursos multimedia",
        "seguimiento continuo del progreso del estudiante"
    ];
    
    const horario = faker.helpers.arrayElement(horarios);
    const metodologia = faker.helpers.arrayElement(metodologias);
    
    return `
        <h2>Sobre mí</h2>
        <p>${faker.lorem.paragraph()}</p>
        
        <h2>Mi metodología de trabajo</h2>
        <p>Utilizo una metodología de trabajo que incluye <strong>${metodologia}</strong>. 
        Creo en el aprendizaje significativo y en adaptar cada clase a las necesidades 
        específicas de mis estudiantes.</p>
        
        <h2>Horarios disponibles</h2>
        <p><strong>${horario}</strong></p>
        
        <p>${faker.lorem.paragraph()}</p>
    `.trim();
}

/**
 * Genera un precio aleatorio entre 13500 y 21000 en pasos de 500
 */
function generatePrice() {
    const min = 13500;
    const max = 21000;
    const step = 500;
    const steps = (max - min) / step;
    const randomStep = Math.floor(Math.random() * (steps + 1));
    return min + (randomStep * step);
}

/**
 * Genera una fecha aleatoria durante 2025
 */
function generateDate2025() {
    const start = new Date(2025, 0, 1); // 1 de enero de 2025
    const end = new Date(2025, 11, 31); // 31 de diciembre de 2025
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime);
}

/**
 * Función principal del seed
 */
async function seedFullDataset() {
    try {
        // Conectar a MongoDB
        console.log("🔌 Conectando a MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB conectado correctamente\n");

        // Obtener IDs de referencia desde la DB
        console.log("📦 Obteniendo datos de referencia...");
        const roleAlumno = await Role.findOne({ name: "Alumno" });
        const roleProfesor = await Role.findOne({ name: "Profesor" });
        
        if (!roleAlumno || !roleProfesor) {
            throw new Error("Los roles 'Alumno' y 'Profesor' deben existir en la base de datos");
        }

        const locations = await Location.find({});
        const languages = await Language.find({});
        const subjects = await Subject.find({});

        if (locations.length === 0 || languages.length === 0 || subjects.length === 0) {
            throw new Error("Deben existir Location, Language y Subject en la base de datos");
        }

        console.log(`   - Roles encontrados: Alumno, Profesor`);
        console.log(`   - Locations: ${locations.length}`);
        console.log(`   - Languages: ${languages.length}`);
        console.log(`   - Subjects: ${subjects.length}\n`);

        // Contadores para avatares
        let maleCounter = 0; // 0-98 (49 alumnos + 50 profesores)
        let femaleCounter = 0; // 0-98 (49 alumnas + 50 profesoras)

        // ==========================================
        // CREAR USUARIOS
        // ==========================================
        console.log("👥 Creando usuarios...");

        const createdUsers = {
            alumnos: [],
            profesores: []
        };

        // Crear 98 alumnos (49 hombres + 49 mujeres)
        console.log("   Creando 98 alumnos...");
        for (let i = 0; i < 98; i++) {
            const isMale = i < 49;
            const gender = isMale ? "male" : "female";
            const fullName = isMale 
                ? faker.person.fullName({ sex: "male" })
                : faker.person.fullName({ sex: "female" });
            
            const email = normalizeEmail(fullName);
            
            // Verificar si el email ya existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log(`   ⚠️  Email duplicado omitido: ${email}`);
                continue;
            }

            // Seleccionar avatar
            const avatarCounter = isMale ? maleCounter : femaleCounter;
            const avatar = isMale
                ? `https://randomuser.me/api/portraits/men/${avatarCounter}.jpg`
                : `https://randomuser.me/api/portraits/women/${avatarCounter}.jpg`;
            
            if (isMale) maleCounter++;
            else femaleCounter++;

            // Seleccionar languages (máximo 2, sin repetir)
            const numLanguages = Math.floor(Math.random() * 2) + 1; // 1 o 2
            const selectedLanguages = faker.helpers.arrayElements(languages, numLanguages);

            // Seleccionar subjects (máximo 2, sin repetir)
            const numSubjects = Math.floor(Math.random() * 2) + 1; // 1 o 2
            const selectedSubjects = faker.helpers.arrayElements(subjects, numSubjects);

            // Seleccionar location (aleatoria)
            const selectedLocation = faker.helpers.arrayElement(locations);

            const alumno = new User({
                fullName,
                email,
                password: "123456", // Se hashea automáticamente en el pre-save
                role: roleAlumno._id,
                avatar,
                bio: "",
                language: selectedLanguages.map(l => l._id),
                subject: selectedSubjects.map(s => s._id),
                location: selectedLocation._id,
                price: null,
                isonboarded: true,
                connection: [],
                mercadopago: null
            });

            await alumno.save();
            
            // Crear usuario en Stream
            try {
                await upsertStreamUser({
                    id: alumno._id.toString(),
                    name: alumno.fullName,
                    avatar: alumno.avatar || "",
                });
            } catch (error) {
                console.log(`   ⚠️  Error al crear usuario en Stream para ${alumno.email}:`, error.message);
            }
            
            createdUsers.alumnos.push(alumno);

            if ((i + 1) % 20 === 0) {
                console.log(`   ✓ ${i + 1}/98 alumnos creados`);
            }
        }
        console.log(`   ✅ ${createdUsers.alumnos.length} alumnos creados\n`);

        // Crear 100 profesores (50 hombres + 50 mujeres)
        console.log("   Creando 100 profesores...");
        for (let i = 0; i < 100; i++) {
            const isMale = i < 50;
            const gender = isMale ? "male" : "female";
            const fullName = isMale 
                ? faker.person.fullName({ sex: "male" })
                : faker.person.fullName({ sex: "female" });
            
            const email = normalizeEmail(fullName);
            
            // Verificar si el email ya existe
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                console.log(`   ⚠️  Email duplicado omitido: ${email}`);
                continue;
            }

            // Seleccionar avatar
            const avatarCounter = isMale ? maleCounter : femaleCounter;
            const avatar = isMale
                ? `https://randomuser.me/api/portraits/men/${avatarCounter}.jpg`
                : `https://randomuser.me/api/portraits/women/${avatarCounter}.jpg`;
            
            if (isMale) maleCounter++;
            else femaleCounter++;

            // Seleccionar languages (máximo 2, sin repetir)
            const numLanguages = Math.floor(Math.random() * 2) + 1; // 1 o 2
            const selectedLanguages = faker.helpers.arrayElements(languages, numLanguages);

            // Seleccionar subjects (máximo 2, sin repetir)
            const numSubjects = Math.floor(Math.random() * 2) + 1; // 1 o 2
            const selectedSubjects = faker.helpers.arrayElements(subjects, numSubjects);

            // Seleccionar location (aleatoria)
            const selectedLocation = faker.helpers.arrayElement(locations);

            const price = generatePrice();

            const profesor = new User({
                fullName,
                email,
                password: "123456", // Se hashea automáticamente en el pre-save
                role: roleProfesor._id,
                avatar,
                bio: generateProfessorBio(),
                language: selectedLanguages.map(l => l._id),
                subject: selectedSubjects.map(s => s._id),
                location: selectedLocation._id,
                price,
                isonboarded: true,
                connection: [],
                mercadopago: null
            });

            await profesor.save();
            
            // Crear usuario en Stream
            try {
                await upsertStreamUser({
                    id: profesor._id.toString(),
                    name: profesor.fullName,
                    avatar: profesor.avatar || "",
                });
            } catch (error) {
                console.log(`   ⚠️  Error al crear usuario en Stream para ${profesor.email}:`, error.message);
            }
            
            createdUsers.profesores.push(profesor);

            if ((i + 1) % 20 === 0) {
                console.log(`   ✓ ${i + 1}/100 profesores creados`);
            }
        }
        console.log(`   ✅ ${createdUsers.profesores.length} profesores creados\n`);

        // Resumen de usuarios creados
        const alumnosHombres = createdUsers.alumnos.filter(u => 
            u.avatar.includes("/men/")
        ).length;
        const alumnosMujeres = createdUsers.alumnos.length - alumnosHombres;
        const profesoresHombres = createdUsers.profesores.filter(u => 
            u.avatar.includes("/men/")
        ).length;
        const profesoresMujeres = createdUsers.profesores.length - profesoresHombres;

        console.log("📊 Resumen de usuarios creados:");
        console.log(`   - Alumnos: ${createdUsers.alumnos.length} (${alumnosHombres} hombres, ${alumnosMujeres} mujeres)`);
        console.log(`   - Profesores: ${createdUsers.profesores.length} (${profesoresHombres} hombres, ${profesoresMujeres} mujeres)\n`);

        // ==========================================
        // CREAR CONEXIONES BIDIRECCIONALES
        // ==========================================
        console.log("🔗 Creando conexiones bidireccionales...");

        // Para cada alumno: 10-20 conexiones a profesores
        for (const alumno of createdUsers.alumnos) {
            const numConnections = Math.floor(Math.random() * 11) + 10; // 10-20
            const profesoresDisponibles = faker.helpers.arrayElements(
                createdUsers.profesores,
                Math.min(numConnections, createdUsers.profesores.length)
            );

            const profesorIds = profesoresDisponibles.map(p => p._id);
            alumno.connection = profesorIds;
            await alumno.save();

            // Actualizar conexiones bidireccionales en profesores
            for (const profesor of profesoresDisponibles) {
                if (!profesor.connection.some(connId => 
                    connId.toString() === alumno._id.toString()
                )) {
                    profesor.connection.push(alumno._id);
                    await profesor.save();
                }
            }
        }

        // Para cada profesor: asegurar que tenga 15-30 conexiones a alumnos
        // (pero respetar el límite máximo de 30)
        for (const profesor of createdUsers.profesores) {
            const numConnections = Math.floor(Math.random() * 16) + 15; // 15-30
            const conexionesActuales = profesor.connection.length;
            
            // Solo agregar más conexiones si no se ha alcanzado el límite deseado
            if (conexionesActuales < numConnections && conexionesActuales < 30) {
                const alumnosDisponibles = createdUsers.alumnos.filter(a => {
                    // Verificar que el alumno no esté ya conectado
                    return !profesor.connection.some(connId => 
                        connId.toString() === a._id.toString()
                    );
                });

                const conexionesNecesarias = Math.min(
                    numConnections - conexionesActuales,
                    30 - conexionesActuales,
                    alumnosDisponibles.length
                );

                if (conexionesNecesarias > 0) {
                    const nuevosAlumnos = faker.helpers.arrayElements(
                        alumnosDisponibles,
                        conexionesNecesarias
                    );

                    for (const alumno of nuevosAlumnos) {
                        // Agregar conexión en profesor
                        profesor.connection.push(alumno._id);
                        
                        // Actualizar conexión bidireccional en alumno
                        if (!alumno.connection.some(connId => 
                            connId.toString() === profesor._id.toString()
                        )) {
                            alumno.connection.push(profesor._id);
                            await alumno.save();
                        }
                    }
                    
                    await profesor.save();
                }
            }
        }

        console.log("   ✅ Conexiones creadas correctamente\n");

        // ==========================================
        // CREAR PAGOS
        // ==========================================
        console.log("💳 Creando pagos...");

        // Recargar usuarios desde la base de datos para tener las conexiones actualizadas
        const alumnosIdsPagos = createdUsers.alumnos.map(a => a._id);
        const profesoresIdsPagos = createdUsers.profesores.map(p => p._id);
        
        const alumnosParaPagos = await User.find({ _id: { $in: alumnosIdsPagos } });
        const profesoresParaPagos = await User.find({ _id: { $in: profesoresIdsPagos } });

        let paymentsCreated = 0;

        // Para cada alumno, crear exactamente 50 pagos distribuidos entre 5 profesores de su conexión
        for (const alumno of alumnosParaPagos) {
            if (alumno.connection.length === 0) {
                console.log(`   ⚠️  Alumno ${alumno._id} no tiene conexiones, omitiendo pagos`);
                continue;
            }

            // Obtener profesores conectados
            const profesoresConectados = profesoresParaPagos.filter(p => 
                alumno.connection.some(connId => 
                    connId.toString() === p._id.toString()
                )
            );

            if (profesoresConectados.length === 0) {
                console.log(`   ⚠️  Alumno ${alumno._id} no tiene profesores conectados válidos`);
                continue;
            }

            // Seleccionar exactamente 5 profesores (o menos si no hay suficientes)
            const numProfesoresParaPagar = Math.min(5, profesoresConectados.length);
            const profesoresSeleccionados = faker.helpers.arrayElements(
                profesoresConectados,
                numProfesoresParaPagar
            );

            // Distribuir 50 pagos entre los profesores seleccionados
            const pagosPorProfesor = Math.floor(50 / numProfesoresParaPagar);
            const pagosRestantes = 50 % numProfesoresParaPagar;

            for (let i = 0; i < profesoresSeleccionados.length; i++) {
                const profesor = profesoresSeleccionados[i];
                // Distribuir pagos equitativamente, con los restantes al inicio
                const numPagosParaEsteProfesor = pagosPorProfesor + (i < pagosRestantes ? 1 : 0);

                for (let j = 0; j < numPagosParaEsteProfesor; j++) {
                    const payment = new Payment({
                        sender: alumno._id,
                        receiver: profesor._id,
                        amount: profesor.price,
                        mpPaymentId: null,
                        status: "approved",
                        createdAt: generateDate2025()
                    });

                    await payment.save();
                    paymentsCreated++;
                }
            }

            if ((paymentsCreated % 500 === 0) && paymentsCreated > 0) {
                console.log(`   ✓ ${paymentsCreated} pagos creados...`);
            }
        }

        console.log(`   ✅ ${paymentsCreated} pagos creados\n`);

        // ==========================================
        // CREAR CLASES VIRTUALES
        // ==========================================
        console.log("📚 Creando clases virtuales...");

        // Recargar usuarios desde la base de datos para tener las conexiones actualizadas
        const alumnosIds = createdUsers.alumnos.map(a => a._id);
        const profesoresIds = createdUsers.profesores.map(p => p._id);
        
        const alumnosActualizados = await User.find({ _id: { $in: alumnosIds } });
        const profesoresActualizados = await User.find({ _id: { $in: profesoresIds } });

        let classesCreated = 0;

        // Para cada alumno, crear exactamente 50 clases virtuales
        for (const alumno of alumnosActualizados) {
            if (alumno.connection.length === 0) {
                console.log(`   ⚠️  Alumno ${alumno._id} no tiene conexiones, omitiendo clases`);
                continue;
            }

            // Obtener profesores conectados
            const profesoresConectados = profesoresActualizados.filter(p => 
                alumno.connection.some(connId => 
                    connId.toString() === p._id.toString()
                )
            );

            if (profesoresConectados.length === 0) {
                console.log(`   ⚠️  Alumno ${alumno._id} no tiene profesores conectados válidos`);
                continue;
            }

            // Crear 50 clases distribuidas entre los profesores conectados
            for (let i = 0; i < 50; i++) {
                // Seleccionar un profesor aleatorio de las conexiones
                const profesor = faker.helpers.arrayElement(profesoresConectados);

                const virtualClass = new VirtualClass({
                    participants: [alumno._id, profesor._id],
                    createdAt: generateDate2025(),
                    channelId: (Math.floor(Math.random() * 1001) + 1000).toString() // 1000-2000
                });

                await virtualClass.save();
                classesCreated++;
            }

            if ((classesCreated % 500 === 0) && classesCreated > 0) {
                console.log(`   ✓ ${classesCreated} clases creadas...`);
            }
        }

        console.log(`   ✅ ${classesCreated} clases virtuales creadas\n`);

        // ==========================================
        // RESUMEN FINAL
        // ==========================================
        console.log("=".repeat(50));
        console.log("🌱 Seed completado correctamente");
        console.log("=".repeat(50));
        console.log(`📊 Resumen:`);
        console.log(`   - Usuarios creados: ${createdUsers.alumnos.length + createdUsers.profesores.length}`);
        console.log(`     • Alumnos: ${createdUsers.alumnos.length} (${alumnosHombres} hombres, ${alumnosMujeres} mujeres)`);
        console.log(`     • Profesores: ${createdUsers.profesores.length} (${profesoresHombres} hombres, ${profesoresMujeres} mujeres)`);
        console.log(`   - Pagos creados: ${paymentsCreated}`);
        console.log(`   - Clases virtuales creadas: ${classesCreated}`);
        console.log("=".repeat(50));

        // Cerrar conexión
        await mongoose.connection.close();
        console.log("🔌 Conexión a MongoDB cerrada");
        
        process.exit(0);
    } catch (error) {
        console.error("❌ Error en el seed:", error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Ejecutar el seed
seedFullDataset();

