



import User from "../models/User.js"
import Role from "../models/Role.js"
import Payment from "../models/Payment.js"
import VirtualClass from "../models/VirtualClass.js"
import MercadoPago from "../models/MercadoPago.js"
export async function getMyProffessors(req, res) {
    try {
        const user = await User.findById(req.user.id)
        .select("connection")
        .populate("connection", "fullName avatar")//._id?
        if(!user) {
            return res.status(404).json({message: "User not found"})
        }
        return res.status(200).json(user.connection)
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}

export async function createConnection(req, res){
    try {
        const myId = req.user.id;
        const {id: professorId} = req.params;
        if (myId === professorId) {
            return res.status(400).json({message: "You cannot connect to yourself"})
        }
        
        
        const currentUser = await User.findById(myId).populate('role', 'name');
        if (!currentUser) {
            return res.status(404).json({message: "Current user not found"})
        }
        
     
        if (currentUser.role?.name === "Profesor") {
            return res.status(403).json({message: "Teachers cannot connect to other teachers"})
        }
        
        const professor = await User.findById(professorId).populate('role', 'name');
        if (!professor) {
            return res.status(404).json({message: "Professor not found"})
        }
        
      
        if (professor.role?.name !== "Profesor") {
            return res.status(400).json({message: "The user you are trying to connect to is not a teacher"})
        }
        
        if (professor.connection.includes(myId)) {
            return res.status(400).json({message: "You are already connected to this professor"})
        }
        await User.findByIdAndUpdate(myId,{
            $addToSet: {connection: professorId}
        })
        await User.findByIdAndUpdate(professorId,{
            $addToSet: {connection: myId}
        })
        return res.status(200).json({message: "Connection created successfully"})
    } catch (error) {
        console.log("error", error)
        return res.status(500).json({success: false, message: error.message})
    }
}




export const getProfessorById = async (req, res) => {
    try {
        const { id } = req.params;
        const professor = await User.findById(id)
            .populate('role', 'name')
            .populate('subject', 'name')
            .populate('language', 'name')
            .populate('location', 'name')
            .populate('mercadopago')
            .select('-password');
        
        if (!professor) {
            return res.status(404).json({ message: "Professor not found" });
        }
        
        return res.status(200).json(professor);
    } catch (error) {
        console.error("Error fetching professor", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export const checkConnectionStatus = async (req, res) => {
    try {
        const currentUserId = req.user.id;
        const { id: professorId } = req.params;
        
        const currentUser = await User.findById(currentUserId).select('connection');
        
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        const isConnected = currentUser.connection.includes(professorId);
        
        return res.status(200).json({ isConnected });
    } catch (error) {
        console.error("Error checking connection status", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}




// Obtener profesores recomendados basados en los subjects
export const getRecommendedProfessorsBySubjects = async (req, res) => {
    try {
        const currentUserId = req.user?.id;
        const currentUser = await User.findById(currentUserId).select('subject connection');
        
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        
        
        if (!currentUser.subject || currentUser.subject.length === 0) {
            return res.status(200).json([]);
        }
        
        
        const profesorRole = await Role.findOne({ name: "Profesor" });
        if (!profesorRole) {
            return res.status(500).json({ success: false, message: "Role Profesor no encontrado" });
        }
        
        
        const excludeIds = [currentUserId.toString()];
        if (currentUser.connection && currentUser.connection.length > 0) {
            excludeIds.push(...currentUser.connection.map(id => id.toString()));
        }
        
        const filter = {
            _id: { $nin: excludeIds },
            role: profesorRole._id,
            subject: { $in: currentUser.subject } 
        };
        
        
        const recommendedProfessors = await User.find(filter)
            .select("-password")
            .populate("role", "name")
            .populate("language", "name")
            .populate("subject", "name")
            .populate("location", "name")
            .populate("mercadopago");
        
        
        const shuffled = recommendedProfessors.sort(() => 0.5 - Math.random());
        const limited = shuffled.slice(0, 20);
        
        return res.status(200).json(limited);
    } catch (error) {
        console.error("Error fetching recommended professors by subjects", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}


export const searchProfessors = async (req, res) => {
    try {
        const {
            q, // texto libre para bio (regex)
            locationId,
            languageId,
            subjectId,
            priceMin,
            priceMax,
            sort = "desc", 
            page = 1,
            limit = 50,
        } = req.query;

        const pageNum = Math.max(parseInt(page || 1, 10), 1);
        const pageLimit = Math.min(Math.max(parseInt(limit || 50, 10), 1), 100);

    
        const profesorRole = await Role.findOne({ name: "Profesor" });
        if (!profesorRole) {
            return res.status(500).json({ success: false, message: "Role Profesor no encontrado" });
        }

        const filter = { role: profesorRole._id };

        if (q && String(q).trim().length > 0) {
            filter.bio = { $regex: String(q).trim(), $options: "i" };
        }

        if (locationId) {
            filter.location = locationId; 
        }
        if (languageId) {
            filter.language = languageId;
        }
        if (subjectId) {
            filter.subject = subjectId;
        }

        if (priceMin || priceMax) {
            filter.price = {};
            if (priceMin) filter.price.$gte = Number(priceMin);
            if (priceMax) filter.price.$lte = Number(priceMax);
        }

        const skip = (pageNum - 1) * pageLimit;
        const sortParam = String(sort).toLowerCase();

        
        if (sortParam === "random") {
            
            
            const [items, total] = await Promise.all([
                User.find(filter)
                    .select("-password")
                    .populate("role", "name")
                    .populate("language", "name")
                    .populate("subject", "name")
                    .populate("location", "name")
                    .sort({ _id: -1 }) 
                    .skip(skip)
                    .limit(pageLimit),
                User.countDocuments(filter),
            ]);

           
            const hasMore = (skip + items.length) < total;
            
            return res.status(200).json({
                data: items,
                page: pageNum,
                limit: pageLimit,
                total,
                hasMore,
            });
        }

        
        const sortOrder = sortParam === "asc" ? 1 : -1;

        const [items, total] = await Promise.all([
            User.find(filter)
                .select("-password")
                .populate("role", "name")
                .populate("language", "name")
                .populate("subject", "name")
                .populate("location", "name")
                .sort({ price: sortOrder, _id: 1 })
                .skip(skip)
                .limit(pageLimit),
            User.countDocuments(filter),
        ]);

        
        const hasMore = (skip + items.length) < total;
        
        return res.status(200).json({
            data: items,
            page: pageNum,
            limit: pageLimit,
            total,
            hasMore,
        });
    } catch (error) {
        console.error("Error searching professors", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}


export const deleteCurrentUser = async (req, res) => {
    try {
        const userId = req.user.id;

        // Limpiar referencias en Payment
        await Promise.all([
            Payment.updateMany({ sender: userId }, { $unset: { sender: "" } }),
            Payment.updateMany({ receiver: userId }, { $unset: { receiver: "" } }),
            // Limpiar referencias en VirtualClass (array de participantes)
            VirtualClass.updateMany({ participants: userId }, { $pull: { participants: userId } }),
        ]);

        // Eliminar documento de MercadoPago asociado
        await MercadoPago.findOneAndDelete({ user: userId });

        // Eliminar usuario
        const deleted = await User.findByIdAndDelete(userId);
        if (!deleted) {
            return res.status(404).json({ message: "User not found" });
        }

        // limpiar cookie de sesión
        res.clearCookie("jwt");
        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

